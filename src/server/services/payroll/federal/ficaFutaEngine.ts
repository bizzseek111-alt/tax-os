/**
 * Autonomous Tax OS — Deterministic FICA & FUTA Engine
 * 
 * Computes exact employee and employer shares:
 * - Social Security (OASDI): 6.2% employee / 6.2% employer, capped at $176,100
 * - Medicare (HI): 1.45% employee / 1.45% employer (no cap)
 * - Additional Medicare: 0.9% employee on wages > $200,000 (no employer match)
 * - FUTA: 6.0% gross - 5.4% max state credit = 0.6% net employer tax on first $7,000
 */

import { PayrollTaxType, EmployeeWithholdingResult, EmployerTaxResult } from '../types';

export class FicaFutaEngine {
  public static readonly OASDI_RATE = 0.062; // 6.2%
  public static readonly MEDICARE_RATE = 0.0145; // 1.45%
  public static readonly ADDITIONAL_MEDICARE_RATE = 0.009; // 0.9%
  public static readonly GROSS_FUTA_RATE = 0.060; // 6.0%
  public static readonly SUTA_CREDIT_RATE = 0.054; // 5.4%
  public static readonly NET_FUTA_RATE = 0.006; // 0.6%

  /**
   * Calculates FICA taxes for an employee's pay period.
   */
  public static calculateFica(params: {
    employeeId: string;
    taxableSsWagesCents: bigint;
    taxableMedWagesCents: bigint;
    taxableAddlMedWagesCents: bigint;
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalFicaEmployeeCents: bigint;
    totalFicaEmployerCents: bigint;
  } {
    // 1. Social Security (OASDI)
    const ssEmployeeTaxCents = BigInt(Math.round(Number(params.taxableSsWagesCents) * this.OASDI_RATE));
    const ssEmployerTaxCents = BigInt(Math.round(Number(params.taxableSsWagesCents) * this.OASDI_RATE));

    // 2. Medicare (HI)
    const medEmployeeTaxCents = BigInt(Math.round(Number(params.taxableMedWagesCents) * this.MEDICARE_RATE));
    const medEmployerTaxCents = BigInt(Math.round(Number(params.taxableMedWagesCents) * this.MEDICARE_RATE));

    // 3. Additional Medicare
    const addlMedEmployeeTaxCents = BigInt(Math.round(Number(params.taxableAddlMedWagesCents) * this.ADDITIONAL_MEDICARE_RATE));

    const withholdings: EmployeeWithholdingResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.SOCIAL_SECURITY,
        jurisdiction: 'US-FED',
        wageBaseCents: params.taxableSsWagesCents,
        taxAmountCents: ssEmployeeTaxCents,
        calculationMethod: 'FICA_OASDI_6.2%'
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.MEDICARE,
        jurisdiction: 'US-FED',
        wageBaseCents: params.taxableMedWagesCents,
        taxAmountCents: medEmployeeTaxCents,
        calculationMethod: 'FICA_MEDICARE_1.45%'
      }
    ];

    if (addlMedEmployeeTaxCents > BigInt(0)) {
      withholdings.push({
        employeeId: params.employeeId,
        taxType: PayrollTaxType.ADDITIONAL_MEDICARE,
        jurisdiction: 'US-FED',
        wageBaseCents: params.taxableAddlMedWagesCents,
        taxAmountCents: addlMedEmployeeTaxCents,
        calculationMethod: 'ADDITIONAL_MEDICARE_0.9%'
      });
    }

    const employerTaxes: EmployerTaxResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.SOCIAL_SECURITY,
        jurisdiction: 'US-FED',
        wageBaseCents: params.taxableSsWagesCents,
        taxAmountCents: ssEmployerTaxCents,
        employerRate: this.OASDI_RATE
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.MEDICARE,
        jurisdiction: 'US-FED',
        wageBaseCents: params.taxableMedWagesCents,
        taxAmountCents: medEmployerTaxCents,
        employerRate: this.MEDICARE_RATE
      }
    ];

    return {
      withholdings,
      employerTaxes,
      totalFicaEmployeeCents: ssEmployeeTaxCents + medEmployeeTaxCents + addlMedEmployeeTaxCents,
      totalFicaEmployerCents: ssEmployerTaxCents + medEmployerTaxCents
    };
  }

  /**
   * Calculates employer FUTA liability for an employee's pay period.
   */
  public static calculateFuta(params: {
    employeeId: string;
    taxableFutaWagesCents: bigint;
    creditReductionRate?: number; // e.g. 0.0 for normal states, >0 for FUTA credit reduction states
  }): EmployerTaxResult {
    const creditReduction = params.creditReductionRate || 0.0;
    const effectiveRate = this.NET_FUTA_RATE + creditReduction;
    const futaTaxCents = BigInt(Math.round(Number(params.taxableFutaWagesCents) * effectiveRate));

    return {
      employeeId: params.employeeId,
      taxType: PayrollTaxType.FUTA,
      jurisdiction: 'US-FED',
      wageBaseCents: params.taxableFutaWagesCents,
      taxAmountCents: futaTaxCents,
      employerRate: effectiveRate
    };
  }
}
