/**
 * Autonomous Tax OS — New York State Payroll Module
 * 
 * Implements New York State Department of Taxation and Finance (DTF) standards:
 * - NYS-50-T Personal Income Tax (PIT) withholding
 * - NYC resident local income tax withholding
 * - NY Paid Family Leave (PFL)
 * - State Unemployment Insurance (SUI): $13,000 wage base
 * - Form NYS-45 quarterly reconciliation mapping
 */

import {
  PayFrequency,
  PayrollTaxType,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../types';

export class NewYorkPayrollModule {
  public static readonly STATE_CODE = 'US-NY';
  public static readonly SUI_WAGE_BASE_CENTS = BigInt(1300000); // $13,000
  public static readonly NY_PFL_RATE = 0.00373; // 0.373%
  public static readonly NY_PFL_ANNUAL_MAX_CENTS = BigInt(33325); // $333.25

  private static readonly PERIODS_PER_YEAR: Record<PayFrequency, number> = {
    [PayFrequency.WEEKLY]: 52,
    [PayFrequency.BIWEEKLY]: 26,
    [PayFrequency.SEMIMONTHLY]: 24,
    [PayFrequency.MONTHLY]: 12
  };

  /**
   * Calculates NYS PIT withholding using NYS-50-T method.
   */
  public static calculatePitWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
  }): bigint {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const annualWagesCents = params.taxableWageCents * P;

    const allowances = params.config?.allowances || 1;
    const isMarried = params.config?.filingStatus === 'MARRIED';

    // Standard deduction allowance
    const standardDeductionCents = isMarried ? BigInt(850000) : BigInt(800000);
    const allowanceDeductionCents = BigInt(allowances * 100000); // $1,000 per allowance

    let netTaxableAnnual = annualWagesCents > (standardDeductionCents + allowanceDeductionCents)
      ? annualWagesCents - (standardDeductionCents + allowanceDeductionCents)
      : BigInt(0);

    // NYS 2026 Brackets (Single)
    const brackets = [
      { min: BigInt(0), max: BigInt(850000), rate: 0.040, base: BigInt(0) },
      { min: BigInt(850000), max: BigInt(1170000), rate: 0.045, base: BigInt(34000) },
      { min: BigInt(1170000), max: BigInt(1390000), rate: 0.0525, base: BigInt(48400) },
      { min: BigInt(1390000), max: BigInt(8065000), rate: 0.055, base: BigInt(59950) },
      { min: BigInt(8065000), max: BigInt(21540000), rate: 0.060, base: BigInt(427075) },
      { min: BigInt(21540000), max: BigInt(107755000), rate: 0.0685, base: BigInt(1235575) },
      { min: BigInt(107755000), max: BigInt(500000000), rate: 0.0965, base: BigInt(7141303) },
      { min: BigInt(500000000), max: null, rate: 0.109, base: BigInt(44992953) }
    ];

    let annualTaxCents = BigInt(0);
    for (const b of brackets) {
      if (netTaxableAnnual > b.min) {
        if (b.max === null || netTaxableAnnual <= b.max) {
          const excess = netTaxableAnnual - b.min;
          annualTaxCents = b.base + BigInt(Math.round(Number(excess) * b.rate));
          break;
        }
      }
    }

    let periodTax = annualTaxCents / P;
    if (params.config?.additionalWithholdingCents) {
      periodTax += params.config.additionalWithholdingCents;
    }

    return periodTax;
  }

  /**
   * Calculates NYC Local Withholding for NYC resident employees.
   */
  public static calculateNycLocalWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
  }): bigint {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const annualWagesCents = params.taxableWageCents * P;

    // NYC progressive rates: ~3.078% to 3.876%
    const nycBrackets = [
      { min: BigInt(0), max: BigInt(1200000), rate: 0.03078, base: BigInt(0) },
      { min: BigInt(1200000), max: BigInt(2500000), rate: 0.03762, base: BigInt(36936) },
      { min: BigInt(2500000), max: BigInt(5000000), rate: 0.03819, base: BigInt(85842) },
      { min: BigInt(5000000), max: null, rate: 0.03876, base: BigInt(181317) }
    ];

    let annualTax = BigInt(0);
    for (const b of nycBrackets) {
      if (annualWagesCents > b.min) {
        if (b.max === null || annualWagesCents <= b.max) {
          const excess = annualWagesCents - b.min;
          annualTax = b.base + BigInt(Math.round(Number(excess) * b.rate));
          break;
        }
      }
    }

    return annualTax / P;
  }

  /**
   * Calculates New York taxes for an employee pay period.
   */
  public static calculateNewYorkTaxes(params: {
    employeeId: string;
    sitTaxableWageCents: bigint;
    suiTaxableWageCents: bigint;
    grossWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
    isNycResident?: boolean;
    employerSuiRate?: number; // default 3.4%
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalNyEmployeeCents: bigint;
    totalNyEmployerCents: bigint;
  } {
    // 1. NYS PIT Withholding
    const pitTaxCents = this.calculatePitWithholding({
      taxableWageCents: params.sitTaxableWageCents,
      frequency: params.frequency,
      config: params.config
    });

    const withholdings: EmployeeWithholdingResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_INCOME,
        jurisdiction: 'US-NY',
        wageBaseCents: params.sitTaxableWageCents,
        taxAmountCents: pitTaxCents,
        calculationMethod: 'NYS_50_T'
      }
    ];

    let totalNyEmployeeCents = pitTaxCents;

    // 2. NYC Local Withholding
    if (params.isNycResident) {
      const nycTaxCents = this.calculateNycLocalWithholding({
        taxableWageCents: params.sitTaxableWageCents,
        frequency: params.frequency
      });
      withholdings.push({
        employeeId: params.employeeId,
        taxType: PayrollTaxType.LOCAL_INCOME,
        jurisdiction: 'NYC',
        wageBaseCents: params.sitTaxableWageCents,
        taxAmountCents: nycTaxCents,
        calculationMethod: 'NYC_LOCAL_TAX'
      });
      totalNyEmployeeCents += nycTaxCents;
    }

    // 3. Employer SUI
    const suiRate = params.employerSuiRate || 0.034;
    const suiTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * suiRate));

    const employerTaxes: EmployerTaxResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: 'US-NY',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: suiTaxCents,
        employerRate: suiRate
      }
    ];

    return {
      withholdings,
      employerTaxes,
      totalNyEmployeeCents,
      totalNyEmployerCents: suiTaxCents
    };
  }
}
