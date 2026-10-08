/**
 * Autonomous Tax OS — Illinois State Payroll Module
 * 
 * Implements Illinois Department of Revenue (IDOR) standards:
 * - IL-700-T flat 4.95% withholding with basic exemption allowances
 * - SUI: $13,590 wage base, employer experience rate
 * - Form IL-941 quarterly reconciliation mapping
 */

import {
  PayFrequency,
  PayrollTaxType,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../types';

export class IllinoisPayrollModule {
  public static readonly STATE_CODE = 'US-IL';
  public static readonly SUI_WAGE_BASE_CENTS = BigInt(1359000); // $13,590
  public static readonly IL_FLAT_TAX_RATE = 0.0495; // 4.95%
  public static readonly IL_ALLOWANCE_ANNUAL_CENTS = BigInt(277500); // $2,775

  private static readonly PERIODS_PER_YEAR: Record<PayFrequency, number> = {
    [PayFrequency.WEEKLY]: 52,
    [PayFrequency.BIWEEKLY]: 26,
    [PayFrequency.SEMIMONTHLY]: 24,
    [PayFrequency.MONTHLY]: 12
  };

  /**
   * Calculates Illinois Flat 4.95% PIT withholding.
   */
  public static calculatePitWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
  }): bigint {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const allowances = params.config?.allowances !== undefined ? params.config.allowances : 1;
    const allowancePerPeriodCents = (BigInt(allowances) * this.IL_ALLOWANCE_ANNUAL_CENTS) / P;

    const netTaxablePeriodCents = params.taxableWageCents > allowancePerPeriodCents
      ? params.taxableWageCents - allowancePerPeriodCents
      : BigInt(0);

    let taxCents = BigInt(Math.round(Number(netTaxablePeriodCents) * this.IL_FLAT_TAX_RATE));
    if (params.config?.additionalWithholdingCents) {
      taxCents += params.config.additionalWithholdingCents;
    }

    return taxCents;
  }

  /**
   * Calculates Illinois taxes for an employee pay period.
   */
  public static calculateIllinoisTaxes(params: {
    employeeId: string;
    sitTaxableWageCents: bigint;
    suiTaxableWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
    employerSuiRate?: number; // default 3.45%
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalIlEmployeeCents: bigint;
    totalIlEmployerCents: bigint;
  } {
    // 1. Employee PIT Withholding
    const pitTaxCents = this.calculatePitWithholding({
      taxableWageCents: params.sitTaxableWageCents,
      frequency: params.frequency,
      config: params.config
    });

    // 2. Employer SUI
    const suiRate = params.employerSuiRate || 0.0345;
    const suiTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * suiRate));

    const withholdings: EmployeeWithholdingResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_INCOME,
        jurisdiction: 'US-IL',
        wageBaseCents: params.sitTaxableWageCents,
        taxAmountCents: pitTaxCents,
        calculationMethod: 'IL_FLAT_4.95%'
      }
    ];

    const employerTaxes: EmployerTaxResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: 'US-IL',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: suiTaxCents,
        employerRate: suiRate
      }
    ];

    return {
      withholdings,
      employerTaxes,
      totalIlEmployeeCents: pitTaxCents,
      totalIlEmployerCents: suiTaxCents
    };
  }
}
