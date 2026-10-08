/**
 * Autonomous Tax OS — Production Payroll Ingestion & Execution Service
 * 
 * Ingests payroll data from external connectors or direct batches,
 * deterministically computes taxable wage bases, federal withholdings,
 * FICA/FUTA liabilities, and state payroll taxes, and persists all line records.
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import {
  PayFrequency,
  PayrollRunStatus,
  EarningType,
  DeductionType,
  PayrollTaxType,
  DepositStatus
} from '@prisma/client';
import { WageBaseService } from '../taxableWages/wageBaseService';
import { FederalWithholdingEngine } from '../federal/federalWithholdingEngine';
import { FicaFutaEngine } from '../federal/ficaFutaEngine';
import { StatePayrollRegistry } from '../state/statePayrollModule';

export interface IngestionEmployeePayload {
  employeeId: string;
  earnings: {
    earningType: EarningType;
    hours?: number;
    rateCents?: bigint;
    amountCents: bigint;
  }[];
  deductions: {
    deductionType: DeductionType;
    amountCents: bigint;
  }[];
}

export class PayrollIngestionService {
  /**
   * Processes a payroll run for an employer, computing all tax lines deterministically.
   */
  public static async processPayrollRun(params: {
    employerId: string;
    taxCaseId?: string;
    payDate: Date;
    payPeriodId?: string;
    payFrequency: PayFrequency;
    sourceProvider?: string;
    sourceRunId?: string;
    employees: IngestionEmployeePayload[];
  }) {
    const employer = await prisma.employer.findUnique({
      where: { id: params.employerId },
      include: { suiAccounts: true }
    });

    if (!employer) {
      throw new Error(`EMPLOYER_NOT_FOUND: Employer with ID '${params.employerId}' does not exist.`);
    }

    let runGrossWagesCents = BigInt(0);
    let runEmployeeWithholdingsCents = BigInt(0);
    let runEmployerTaxesCents = BigInt(0);
    let runNetPayCents = BigInt(0);

    const calculatedEmployees: any[] = [];

    for (const empPayload of params.employees) {
      const employee = await prisma.employee.findUnique({
        where: { id: empPayload.employeeId }
      });

      if (!employee) {
        throw new Error(`EMPLOYEE_NOT_FOUND: Employee '${empPayload.employeeId}' does not exist.`);
      }

      // Sum gross earnings
      let empGrossCents = BigInt(0);
      for (const earn of empPayload.earnings) {
        empGrossCents += earn.amountCents;
      }

      // Look up prior YTD subject wages for statutory caps
      const priorRuns = await prisma.taxableWage.findMany({
        where: {
          employeeId: employee.id,
          payrollRun: {
            employerId: employer.id,
            payDate: { lt: params.payDate }
          }
        }
      });

      let priorSs = BigInt(0);
      let priorMed = BigInt(0);
      let priorFuta = BigInt(0);
      let priorSui = BigInt(0);

      for (const pw of priorRuns) {
        if (pw.taxType === PayrollTaxType.SOCIAL_SECURITY) priorSs += pw.taxableWagesCents;
        if (pw.taxType === PayrollTaxType.MEDICARE) priorMed += pw.taxableWagesCents;
        if (pw.taxType === PayrollTaxType.FUTA) priorFuta += pw.taxableWagesCents;
        if (pw.taxType === PayrollTaxType.STATE_UNEMPLOYMENT) priorSui += pw.taxableWagesCents;
      }

      // 1. Calculate Taxable Wage Bases
      const wageBases = WageBaseService.calculateTaxableWages({
        grossWagesCents: empGrossCents,
        deductions: empPayload.deductions,
        priorYtdSubjectWages: {
          socialSecurityCents: priorSs,
          medicareCents: priorMed,
          futaCents: priorFuta,
          suiCents: priorSui
        },
        workLocationState: employee.workLocationState
      });

      const fitTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.FEDERAL_INCOME)!.taxableWagesCents;
      const ssTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.SOCIAL_SECURITY)!.taxableWagesCents;
      const medTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.MEDICARE)!.taxableWagesCents;
      const addlMedTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.ADDITIONAL_MEDICARE)!.taxableWagesCents;
      const futaTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.FUTA)!.taxableWagesCents;
      const sitTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.STATE_INCOME)!.taxableWagesCents;
      const suiTaxable = wageBases.taxableWages.find(w => w.taxType === PayrollTaxType.STATE_UNEMPLOYMENT)!.taxableWagesCents;

      // 2. Federal Income Tax Withholding (Pub 15-T)
      const fitResult = FederalWithholdingEngine.calculateRegularWithholding({
        taxableWageCents: fitTaxable,
        frequency: params.payFrequency,
        w4: {
          filingStatus: employee.w4FilingStatus as any,
          multipleJobs: employee.w4MultipleJobs,
          claimDependentsCents: employee.w4ClaimDependentsCents,
          otherIncomeCents: employee.w4OtherIncomeCents,
          deductionsCents: employee.w4DeductionsCents,
          extraWithholdingCents: employee.w4ExtraWithholdingCents
        }
      });

      // 3. FICA (OASDI + Medicare) & FUTA
      const ficaResult = FicaFutaEngine.calculateFica({
        employeeId: employee.id,
        taxableSsWagesCents: ssTaxable,
        taxableMedWagesCents: medTaxable,
        taxableAddlMedWagesCents: addlMedTaxable
      });

      const futaResult = FicaFutaEngine.calculateFuta({
        employeeId: employee.id,
        taxableFutaWagesCents: futaTaxable
      });

      // 4. State Payroll Taxes
      const suiAccount = employer.suiAccounts.find(s => s.stateCode === employee.workLocationState);
      const employerSuiRate = suiAccount ? suiAccount.experienceRate : undefined;

      const stateResult = StatePayrollRegistry.calculateStatePayroll({
        stateCode: employee.workLocationState,
        employeeId: employee.id,
        sitTaxableWageCents: sitTaxable,
        suiTaxableWageCents: suiTaxable,
        grossWageCents: empGrossCents,
        frequency: params.payFrequency,
        config: employee.stateWithholdingConfig as any,
        employerSuiRate
      });

      // Consolidate Employee Withholdings
      const empWithholdings = [
        {
          employeeId: employee.id,
          taxType: PayrollTaxType.FEDERAL_INCOME,
          jurisdiction: 'US-FED',
          wageBaseCents: fitTaxable,
          taxAmountCents: fitResult.fitWithholdingCents,
          calculationMethod: 'IRS_PUB_15_T'
        },
        ...ficaResult.withholdings,
        ...stateResult.withholdings
      ];

      // Consolidate Employer Taxes
      const empEmployerTaxes = [
        ...ficaResult.employerTaxes,
        futaResult,
        ...stateResult.employerTaxes
      ];

      let totalWithholding = BigInt(0);
      for (const w of empWithholdings) totalWithholding += w.taxAmountCents;

      let totalEmployerTax = BigInt(0);
      for (const et of empEmployerTaxes) totalEmployerTax += et.taxAmountCents;

      // Post-tax deductions
      const netPay = empGrossCents - totalWithholding - wageBases.preTaxSummary.postTaxCents;

      runGrossWagesCents += empGrossCents;
      runEmployeeWithholdingsCents += totalWithholding;
      runEmployerTaxesCents += totalEmployerTax;
      runNetPayCents += netPay;

      calculatedEmployees.push({
        employeeId: employee.id,
        earnings: empPayload.earnings,
        deductions: empPayload.deductions,
        taxableWages: wageBases.taxableWages,
        withholdings: empWithholdings,
        employerTaxes: empEmployerTaxes,
        grossCents: empGrossCents,
        withholdingCents: totalWithholding,
        employerTaxCents: totalEmployerTax,
        netPayCents: netPay
      });
    }

    const totalTaxLiabilityCents = runEmployeeWithholdingsCents + runEmployerTaxesCents;

    // Cryptographic calculation fingerprint
    const inputHash = crypto
      .createHash('sha256')
      .update(
        JSON.stringify({
          employerId: params.employerId,
          payDate: params.payDate.toISOString(),
          gross: runGrossWagesCents.toString(),
          totalTax: totalTaxLiabilityCents.toString()
        })
      )
      .digest('hex');

    // Persist PayrollRun Aggregate
    const run = await prisma.payrollRun.create({
      data: {
        employerId: params.employerId,
        taxCaseId: params.taxCaseId,
        payPeriodId: params.payPeriodId,
        payDate: params.payDate,
        grossWagesCents: runGrossWagesCents,
        employeeWithholdingsCents: runEmployeeWithholdingsCents,
        employerTaxesCents: runEmployerTaxesCents,
        totalTaxLiabilityCents,
        netPayCents: runNetPayCents,
        employeeCount: calculatedEmployees.length,
        sourceProvider: params.sourceProvider || 'INTERNAL_DETERMINISTIC',
        sourceRunId: params.sourceRunId,
        status: PayrollRunStatus.CALCULATED,
        calculationHash: inputHash,
        version: 1
      }
    });

    // Persist line items
    for (const c of calculatedEmployees) {
      for (const earn of c.earnings) {
        await prisma.payrollEarning.create({
          data: {
            payrollRunId: run.id,
            employeeId: c.employeeId,
            earningType: earn.earningType,
            hours: earn.hours || 0,
            rateCents: earn.rateCents || BigInt(0),
            amountCents: earn.amountCents
          }
        });
      }

      for (const ded of c.deductions) {
        await prisma.payrollDeduction.create({
          data: {
            payrollRunId: run.id,
            employeeId: c.employeeId,
            deductionType: ded.deductionType,
            amountCents: ded.amountCents
          }
        });
      }

      for (const tw of c.taxableWages) {
        await prisma.taxableWage.create({
          data: {
            payrollRunId: run.id,
            employeeId: c.employeeId,
            taxType: tw.taxType,
            jurisdiction: tw.jurisdiction,
            grossAmountCents: tw.grossAmountCents,
            subjectWagesCents: tw.subjectWagesCents,
            excessWagesCents: tw.excessWagesCents,
            taxableWagesCents: tw.taxableWagesCents
          }
        });
      }

      for (const w of c.withholdings) {
        await prisma.employeeWithholding.create({
          data: {
            payrollRunId: run.id,
            employeeId: c.employeeId,
            taxType: w.taxType,
            jurisdiction: w.jurisdiction,
            wageBaseCents: w.wageBaseCents,
            taxAmountCents: w.taxAmountCents,
            calculationMethod: w.calculationMethod
          }
        });
      }

      for (const et of c.employerTaxes) {
        await prisma.employerTax.create({
          data: {
            payrollRunId: run.id,
            employeeId: c.employeeId,
            taxType: et.taxType,
            jurisdiction: et.jurisdiction,
            wageBaseCents: et.wageBaseCents,
            taxAmountCents: et.taxAmountCents,
            employerRate: et.employerRate
          }
        });
      }
    }

    // Persist Federal PayrollTaxLiability for the run
    await prisma.payrollTaxLiability.create({
      data: {
        employerId: params.employerId,
        payrollRunId: run.id,
        taxCaseId: params.taxCaseId,
        jurisdiction: 'US-FED',
        taxType: PayrollTaxType.FEDERAL_INCOME,
        period: `${params.payDate.getFullYear()}-Q${Math.floor(params.payDate.getMonth() / 3) + 1}`,
        employeePortionCents: runEmployeeWithholdingsCents,
        employerPortionCents: runEmployerTaxesCents,
        totalLiabilityCents: totalTaxLiabilityCents,
        dueDate: new Date(params.payDate.getTime() + 15 * 86400000), // Approximate initial schedule
        status: DepositStatus.SCHEDULED
      }
    });

    return {
      runId: run.id,
      grossWagesCents: runGrossWagesCents,
      employeeWithholdingsCents: runEmployeeWithholdingsCents,
      employerTaxesCents: runEmployerTaxesCents,
      totalTaxLiabilityCents,
      netPayCents: runNetPayCents,
      calculationHash: inputHash
    };
  }
}
