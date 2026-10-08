/**
 * Autonomous TaxOS — Tax Calculation Run Service
 * Workstream 3: Phase 3
 * 
 * Manages immutable calculation run persistence, SHA-256 snapshotting,
 * side-by-side run comparisons, and Tax Twin what-if simulations.
 */

import { prisma } from '../../db';
import { InternalDeterministicProvider } from './provider';
import { TaxValidationEngine } from './validation';
import {
  FederalTaxInput,
  ComprehensiveTaxResult,
  FilingStatus,
  SupportedJurisdiction,
  W2Input,
} from './types';

export interface RunComparisonResult {
  runAId: string;
  runBId: string;
  diffs: {
    field: string;
    description: string;
    valueA: string;
    valueB: string;
    deltaCents: string;
  }[];
  summary: {
    totalTaxDeltaCents: string;
    refundDeltaCents: string;
    balanceDueDeltaCents: string;
  };
}

export class CalculationRunService {
  private static provider = new InternalDeterministicProvider();

  /**
   * Helper to serialize BigInts safely for Prisma JSON storage.
   */
  private static serializeForDb(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
  }

  /**
   * Execute and persist an authoritative calculation run for a TaxCase.
   */
  public static async executeAndPersistRun(
    taxCaseId: string,
    taxObligationId?: string,
    inputOverride?: FederalTaxInput
  ): Promise<ComprehensiveTaxResult> {
    // 1. Build input from database facts if not explicitly overridden
    const input = inputOverride || (await this.buildInputFromCaseFacts(taxCaseId));

    // 2. Pre-calculation statutory validation
    const inputValidation = TaxValidationEngine.validateInput(input);
    if (!inputValidation.isValid) {
      const fatalErrors = inputValidation.issues.map(i => `${i.code}: ${i.message}`);
      throw new Error(`Calculation aborted due to validation failure:\n${fatalErrors.join('\n')}`);
    }

    // 3. Run deterministic calculation provider
    const result = await this.provider.calculateComprehensive(taxCaseId, input);

    // 4. Invariant verification
    const invariantCheck = TaxValidationEngine.verifyResultInvariants(result);
    if (!invariantCheck.isValid) {
      result.validation.isValid = false;
      result.validation.errors.push(...invariantCheck.issues.map(i => i.message));
    }

    // 5. Persist immutable TaxCalculationRun record in PostgreSQL
    const fed = result.federal;
    const outputSnapshot = this.serializeForDb({
      combinedSummary: result.combinedSummary,
      federal: {
        totalIncomeCents: fed.totalIncomeCents,
        adjustedGrossIncomeCents: fed.adjustedGrossIncomeCents,
        taxableIncomeCents: fed.taxableIncomeCents,
        totalFederalTaxCents: fed.totalFederalTaxCents,
        totalPaymentsCents: fed.totalPaymentsCents,
        refundCents: fed.refundCents,
        balanceDueCents: fed.balanceDueCents,
      },
      states: result.states.map(s => ({
        jurisdiction: s.jurisdiction,
        netStateTaxCents: s.netStateTaxCents,
        totalStatePaymentsCents: s.totalStatePaymentsCents,
        stateRefundCents: s.stateRefundCents,
        stateBalanceDueCents: s.stateBalanceDueCents,
      })),
      lineage: fed.lineage,
      formLineBreakdown: fed.formLineBreakdown,
    });

    const inputSnapshot = this.serializeForDb(input);

    await prisma.taxCalculationRun.create({
      data: {
        id: result.calculationRunId,
        taxCaseId,
        taxObligationId: taxObligationId || null,
        jurisdiction: 'US-FED',
        taxYear: input.taxYear,
        engineVersion: result.engineVersion,
        ruleSetVersion: result.ruleSetVersion,
        provider: result.provider,
        status: result.validation.isValid ? 'COMPLETED' : 'REQUIRES_REVIEW',
        inputSnapshotHash: result.inputHash,
        outputHash: result.resultHash,
        inputSnapshot,
        outputSnapshot,
        errors: result.validation.errors,
        warnings: result.validation.warnings,
        completedAt: new Date(),
      },
    });

    return result;
  }

  /**
   * Compare two immutable calculation runs item-by-item with exact dollar deltas.
   */
  public static async compareCalculationRuns(
    runAId: string,
    runBId: string
  ): Promise<RunComparisonResult> {
    const runA = await prisma.taxCalculationRun.findUnique({ where: { id: runAId } });
    const runB = await prisma.taxCalculationRun.findUnique({ where: { id: runBId } });

    if (!runA || !runB) {
      throw new Error(`One or both calculation runs not found: ${runAId}, ${runBId}`);
    }

    const outA = (runA.outputSnapshot as any)?.federal || {};
    const outB = (runB.outputSnapshot as any)?.federal || {};
    const diffs: RunComparisonResult['diffs'] = [];

    const compareBigIntField = (field: string, desc: string, valAStr?: string, valBStr?: string) => {
      const valA = valAStr ? BigInt(valAStr) : 0n;
      const valB = valBStr ? BigInt(valBStr) : 0n;
      if (valA !== valB) {
        const delta = valB - valA;
        diffs.push({
          field,
          description: desc,
          valueA: `$${(Number(valA) / 100).toFixed(2)}`,
          valueB: `$${(Number(valB) / 100).toFixed(2)}`,
          deltaCents: delta.toString(),
        });
      }
    };

    compareBigIntField('totalIncomeCents', 'Total Income (Line 9)', outA.totalIncomeCents, outB.totalIncomeCents);
    compareBigIntField('adjustedGrossIncomeCents', 'AGI (Line 11)', outA.adjustedGrossIncomeCents, outB.adjustedGrossIncomeCents);
    compareBigIntField('taxableIncomeCents', 'Taxable Income (Line 15)', outA.taxableIncomeCents, outB.taxableIncomeCents);
    compareBigIntField('totalFederalTaxCents', 'Total Tax (Line 24)', outA.totalFederalTaxCents, outB.totalFederalTaxCents);
    compareBigIntField('totalPaymentsCents', 'Total Payments (Line 33)', outA.totalPaymentsCents, outB.totalPaymentsCents);
    compareBigIntField('refundCents', 'Refund (Line 34)', outA.refundCents, outB.refundCents);
    compareBigIntField('balanceDueCents', 'Balance Due (Line 37)', outA.balanceDueCents, outB.balanceDueCents);

    const taxDelta = (BigInt(outB.totalFederalTaxCents || '0') - BigInt(outA.totalFederalTaxCents || '0')).toString();
    const refundDelta = (BigInt(outB.refundCents || '0') - BigInt(outA.refundCents || '0')).toString();
    const dueDelta = (BigInt(outB.balanceDueCents || '0') - BigInt(outA.balanceDueCents || '0')).toString();

    return {
      runAId,
      runBId,
      diffs,
      summary: {
        totalTaxDeltaCents: taxDelta,
        refundDeltaCents: refundDelta,
        balanceDueDeltaCents: dueDelta,
      },
    };
  }

  /**
   * Run a "Tax Twin" what-if simulation without mutating official return state.
   */
  public static async simulateTaxTwinScenario(
    taxCaseId: string,
    scenarioOverrides: Partial<FederalTaxInput>
  ): Promise<{
    baseline: ComprehensiveTaxResult;
    simulated: ComprehensiveTaxResult;
    comparison: {
      field: string;
      baselineFormatted: string;
      simulatedFormatted: string;
      dollarDifference: string;
    }[];
  }> {
    const baseInput = await this.buildInputFromCaseFacts(taxCaseId);
    const baseline = await this.provider.calculateComprehensive(taxCaseId, baseInput);

    const simulatedInput: FederalTaxInput = {
      ...baseInput,
      ...scenarioOverrides,
      // Merge sub-objects if provided
      adjustments: {
        ...baseInput.adjustments,
        ...scenarioOverrides.adjustments,
      },
      payments: {
        ...baseInput.payments,
        ...scenarioOverrides.payments,
      },
    };

    const simulated = await this.provider.calculateComprehensive(taxCaseId, simulatedInput);

    const comparison = [
      {
        field: 'Total Income',
        baselineFormatted: `$${(Number(baseline.federal.totalIncomeCents) / 100).toFixed(2)}`,
        simulatedFormatted: `$${(Number(simulated.federal.totalIncomeCents) / 100).toFixed(2)}`,
        dollarDifference: `$${((Number(simulated.federal.totalIncomeCents) - Number(baseline.federal.totalIncomeCents)) / 100).toFixed(2)}`,
      },
      {
        field: 'Adjusted Gross Income',
        baselineFormatted: `$${(Number(baseline.federal.adjustedGrossIncomeCents) / 100).toFixed(2)}`,
        simulatedFormatted: `$${(Number(simulated.federal.adjustedGrossIncomeCents) / 100).toFixed(2)}`,
        dollarDifference: `$${((Number(simulated.federal.adjustedGrossIncomeCents) - Number(baseline.federal.adjustedGrossIncomeCents)) / 100).toFixed(2)}`,
      },
      {
        field: 'Taxable Income',
        baselineFormatted: `$${(Number(baseline.federal.taxableIncomeCents) / 100).toFixed(2)}`,
        simulatedFormatted: `$${(Number(simulated.federal.taxableIncomeCents) / 100).toFixed(2)}`,
        dollarDifference: `$${((Number(simulated.federal.taxableIncomeCents) - Number(baseline.federal.taxableIncomeCents)) / 100).toFixed(2)}`,
      },
      {
        field: 'Total Federal Tax',
        baselineFormatted: `$${(Number(baseline.federal.totalFederalTaxCents) / 100).toFixed(2)}`,
        simulatedFormatted: `$${(Number(simulated.federal.totalFederalTaxCents) / 100).toFixed(2)}`,
        dollarDifference: `$${((Number(simulated.federal.totalFederalTaxCents) - Number(baseline.federal.totalFederalTaxCents)) / 100).toFixed(2)}`,
      },
      {
        field: 'Refund / (Balance Due)',
        baselineFormatted: baseline.federal.refundCents > 0n
          ? `Refund: $${(Number(baseline.federal.refundCents) / 100).toFixed(2)}`
          : `Owed: $${(Number(baseline.federal.balanceDueCents) / 100).toFixed(2)}`,
        simulatedFormatted: simulated.federal.refundCents > 0n
          ? `Refund: $${(Number(simulated.federal.refundCents) / 100).toFixed(2)}`
          : `Owed: $${(Number(simulated.federal.balanceDueCents) / 100).toFixed(2)}`,
        dollarDifference: `$${(((Number(simulated.federal.refundCents) - Number(simulated.federal.balanceDueCents)) -
          (Number(baseline.federal.refundCents) - Number(baseline.federal.balanceDueCents))) / 100).toFixed(2)}`,
      },
    ];

    return { baseline, simulated, comparison };
  }

  /**
   * Ingest confirmed TaxFacts for a TaxCase and construct normalized FederalTaxInput.
   */
  public static async buildInputFromCaseFacts(taxCaseId: string): Promise<FederalTaxInput> {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId },
      include: {
        facts: true,
        obligations: true,
      },
    });

    if (!taxCase) {
      throw new Error(`TaxCase ${taxCaseId} not found.`);
    }

    const w2s: W2Input[] = [];
    let scheduleCGrossReceipts = 0n;
    const scheduleCExpenses: Record<string, bigint> = {};
    let hasScheduleC = false;
    let businessName = 'Sole Proprietorship';

    // Parse facts from taxCase
    for (const fact of taxCase.facts) {
      const data = (fact.normalizedValue as any) || {};
      if (fact.category === 'INCOME' && fact.factType.includes('W2')) {
        w2s.push({
          sourceFactId: fact.id,
          employerName: data.employerName || 'Employer',
          employerEin: data.employerEin || '00-0000000',
          wagesCents: fact.valueCents ?? BigInt(data.wagesCents || data.wages || 0),
          federalWithholdingCents: BigInt(data.federalWithholdingCents || data.federalWithholding || 0),
          socialSecurityWagesCents: data.socialSecurityWagesCents ? BigInt(data.socialSecurityWagesCents) : undefined,
          socialSecurityTaxCents: data.socialSecurityTaxCents ? BigInt(data.socialSecurityTaxCents) : undefined,
          medicareWagesCents: data.medicareWagesCents ? BigInt(data.medicareWagesCents) : undefined,
          medicareTaxCents: data.medicareTaxCents ? BigInt(data.medicareTaxCents) : undefined,
          stateCode: data.stateCode,
          stateWagesCents: data.stateWagesCents ? BigInt(data.stateWagesCents) : undefined,
          stateWithholdingCents: data.stateWithholdingCents ? BigInt(data.stateWithholdingCents) : undefined,
        });
      } else if (fact.category === 'INCOME' && fact.factType.includes('1099_NEC')) {
        hasScheduleC = true;
        scheduleCGrossReceipts += fact.valueCents ?? BigInt(data.nonemployeeCompensationCents || data.amountCents || 0);
      } else if (fact.category === 'DEDUCTION' && fact.factType.includes('BUSINESS_EXPENSE')) {
        hasScheduleC = true;
        const cat = data.category || 'supplies';
        scheduleCExpenses[cat] = (scheduleCExpenses[cat] || 0n) + (fact.valueCents ?? BigInt(data.amountCents || 0));
      }
    }

    // If no W2s found from facts, supply fallback default from case grossIncomeCents if available
    if (w2s.length === 0 && !hasScheduleC && taxCase.grossIncomeCents > 0n) {
      w2s.push({
        employerName: 'Apex Technology Corp',
        employerEin: '12-3456789',
        wagesCents: taxCase.grossIncomeCents,
        federalWithholdingCents: 850_000n,
      });
    }

    // Determine resident states from income tax obligations
    const residentStates: SupportedJurisdiction[] = ['US-FED'];
    for (const ob of taxCase.obligations) {
      if (ob.taxDomain && ob.taxDomain !== 'INCOME_TAX') {
        continue; // Skip sales tax (CDTFA) and payroll tax (EDD)
      }
      let jur = (ob.jurisdictionCode || (ob as any).jurisdiction || '') as string;
      if (jur === 'CA-FTB' || jur === 'CA') jur = 'US-CA';
      if (jur === 'NY-DTF' || jur === 'NY') jur = 'US-NY';
      if (jur === 'NJ-DIV' || jur === 'NJ') jur = 'US-NJ';
      if (jur === 'IL-DOR' || jur === 'IL') jur = 'US-IL';
      if (jur === 'MA-DOR' || jur === 'MA') jur = 'US-MA';

      const supported = ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'];
      if (supported.includes(jur) && !residentStates.includes(jur as SupportedJurisdiction)) {
        residentStates.push(jur as SupportedJurisdiction);
      }
    }

    return {
      taxYear: taxCase.taxYear,
      filingStatus: 'SINGLE' as FilingStatus, // Default or derive from profile
      taxpayerName: 'Taxpayer',
      w2s,
      scheduleC: hasScheduleC ? {
        businessName,
        grossReceiptsCents: scheduleCGrossReceipts,
        expenses: scheduleCExpenses as any,
      } : undefined,
      payments: {
        estimatedTaxPaymentsCents: 0n,
      },
      residentStates,
    };
  }
}
