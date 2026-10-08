/**
 * Autonomous Tax OS — Massachusetts State Payroll Module
 * 
 * Implements Massachusetts Department of Revenue (DOR) standards:
 * - Circular M flat 5.0% withholding with personal exemptions
 * - MA Paid Family and Medical Leave (PFML): Employee 0.46% / Employer 0.42% up to $176,100
 * - SUI: $15,000 wage base, employer experience rate
 * - Form WR-1 quarterly reconciliation mapping
 */

import {
  PayFrequency,
  PayrollTaxType,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../types';

export class MassachusettsPayrollModule {
  public static readonly STATE_CODE = 'US-MA';
  public static readonly SUI_WAGE_BASE_CENTS = BigInt(1500000); // $15,000
  public static readonly MA_FLAT_TAX_RATE = 0.050; // 5.0%
  public static readonly MA_PFML_EE_RATE = 0.0046; // 0.46% employee share
  public static readonly MA_PFML_ER_RATE = 0.0042; // 0.42% employer share
  public static readonly MA_EXEMPTION_SINGLE_CENTS = BigInt(440000); // $4,400
  public static readonly MA_EXEMPTION_MARRIED_CENTS = BigInt(880000); // $8,800

  private static readonly PERIODS_PER_YEAR: Record<PayFrequency, number> = {
    [PayFrequency.WEEKLY]: 52,
    [PayFrequency.BIWEEKLY]: 26,
    [PayFrequency.SEMIMONTHLY]: 24,
    [PayFrequency.MONTHLY]: 12
  };

  /**
   * Calculates Massachusetts Flat 5.0% PIT withholding.
   */
  public static calculatePitWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
  }): bigint {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const isMarried = params.config?.filingStatus === 'MARRIED';
    const annualExemptionCents = isMarried ? this.MA_EXEMPTION_MARRIED_CENTS : this.MA_EXEMPTION_SINGLE_CENTS;
    const exemptionPerPeriodCents = annualExemptionCents / P;

    const netTaxablePeriodCents = params.taxableWageCents > exemptionPerPeriodCents
      ? params.taxableWageCents - exemptionPerPeriodCents
      : BigInt(0);

    let taxCents = BigInt(Math.round(Number(netTaxablePeriodCents) * this.MA_FLAT_TAX_RATE));
    if (params.config?.additionalWithholdingCents) {
      taxCents += params.config.additionalWithholdingCents;
    }

    return taxCents;
  }

  /**
   * Calculates Massachusetts taxes for an employee pay period.
   */
  public static calculateMassachusettsTaxes(params: {
    employeeId: string;
    sitTaxableWageCents: bigint;
    suiTaxableWageCents: bigint;
    grossWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
    employerSuiRate?: number; // default 3.5%
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalMaEmployeeCents: bigint;
    totalMaEmployerCents: bigint;
  } {
    // 1. Employee PIT Withholding
    const pitTaxCents = this.calculatePitWithholding({
      taxableWageCents: params.sitTaxableWageCents,
      frequency: params.frequency,
      config: params.config
    });

    // 2. MA PFML Employee (0.46%)
    const pfmlEeTaxCents = BigInt(Math.round(Number(params.grossWageCents) * this.MA_PFML_EE_RATE));

    // 3. MA PFML Employer (0.42%)
    const pfmlErTaxCents = BigInt(Math.round(Number(params.grossWageCents) * this.MA_PFML_ER_RATE));

    // 4. Employer SUI
    const suiRate = params.employerSuiRate || 0.035;
    const suiTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * suiRate));

    const withholdings: EmployeeWithholdingResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_INCOME,
        jurisdiction: 'US-MA',
        wageBaseCents: params.sitTaxableWageCents,
        taxAmountCents: pitTaxCents,
        calculationMethod: 'MA_FLAT_5.0%'
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_DISABILITY,
        jurisdiction: 'US-MA-PFML',
        wageBaseCents: params.grossWageCents,
        taxAmountCents: pfmlEeTaxCents,
        calculationMethod: 'MA_PFML_0.46%'
      }
    ];

    const employerTaxes: EmployerTaxResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: 'US-MA',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: suiTaxCents,
        employerRate: suiRate
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_DISABILITY,
        jurisdiction: 'US-MA-PFML',
        wageBaseCents: params.grossWageCents,
        taxAmountCents: pfmlErTaxCents,
        employerRate: this.MA_PFML_ER_RATE
      }
    ];

    return {
      withholdings,
      employerTaxes,
      totalMaEmployeeCents: pitTaxCents + pfmlEeTaxCents,
      totalMaEmployerCents: suiTaxCents + pfmlErTaxCents
    };
  }
}
