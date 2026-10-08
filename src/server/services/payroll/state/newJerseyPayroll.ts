/**
 * Autonomous Tax OS — New Jersey State Payroll Module
 * 
 * Implements New Jersey Division of Taxation standards:
 * - NJ-WT Gross Income Tax withholding
 * - NJ Employee SUI (0.3825%) and FLI (0.09%) up to $44,500
 * - NJ Employer SUI: $44,500 wage base
 * - Form NJ-927 quarterly return mapping
 */

import {
  PayFrequency,
  PayrollTaxType,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../types';

export class NewJerseyPayrollModule {
  public static readonly STATE_CODE = 'US-NJ';
  public static readonly SUI_WAGE_BASE_CENTS = BigInt(4450000); // $44,500
  public static readonly NJ_EMPLOYEE_SUI_RATE = 0.003825; // 0.3825%
  public static readonly NJ_EMPLOYEE_FLI_RATE = 0.0009;   // 0.09%

  private static readonly PERIODS_PER_YEAR: Record<PayFrequency, number> = {
    [PayFrequency.WEEKLY]: 52,
    [PayFrequency.BIWEEKLY]: 26,
    [PayFrequency.SEMIMONTHLY]: 24,
    [PayFrequency.MONTHLY]: 12
  };

  /**
   * Calculates NJ Gross Income Tax Withholding (Rate Table A / Single).
   */
  public static calculatePitWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
  }): bigint {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const annualWagesCents = params.taxableWageCents * P;

    const allowances = params.config?.allowances || 1;
    const allowanceDeductionCents = BigInt(allowances * 100000); // $1,000 per allowance
    const netAnnual = annualWagesCents > allowanceDeductionCents
      ? annualWagesCents - allowanceDeductionCents
      : BigInt(0);

    // NJ Rate Table A (Single / Married Filing Separate)
    const brackets = [
      { min: BigInt(0), max: BigInt(2000000), rate: 0.014, base: BigInt(0) },
      { min: BigInt(2000000), max: BigInt(3500000), rate: 0.0175, base: BigInt(28000) },
      { min: BigInt(3500000), max: BigInt(4000000), rate: 0.035, base: BigInt(54250) },
      { min: BigInt(4000000), max: BigInt(7500000), rate: 0.05525, base: BigInt(71750) },
      { min: BigInt(7500000), max: BigInt(50000000), rate: 0.0637, base: BigInt(265125) },
      { min: BigInt(50000000), max: BigInt(100000000), rate: 0.0897, base: BigInt(2972375) },
      { min: BigInt(100000000), max: null, rate: 0.1075, base: BigInt(7457375) }
    ];

    let annualTaxCents = BigInt(0);
    for (const b of brackets) {
      if (netAnnual > b.min) {
        if (b.max === null || netAnnual <= b.max) {
          const excess = netAnnual - b.min;
          annualTaxCents = b.base + BigInt(Math.round(Number(excess) * b.rate));
          break;
        }
      }
    }

    return annualTaxCents / P;
  }

  /**
   * Calculates New Jersey taxes for an employee pay period.
   */
  public static calculateNewJerseyTaxes(params: {
    employeeId: string;
    sitTaxableWageCents: bigint;
    suiTaxableWageCents: bigint;
    grossWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
    employerSuiRate?: number; // default 3.1%
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalNjEmployeeCents: bigint;
    totalNjEmployerCents: bigint;
  } {
    // 1. Employee PIT Withholding
    const pitTaxCents = this.calculatePitWithholding({
      taxableWageCents: params.sitTaxableWageCents,
      frequency: params.frequency,
      config: params.config
    });

    // 2. Employee SUI (0.3825% up to $44,500)
    const empSuiTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * this.NJ_EMPLOYEE_SUI_RATE));

    // 3. Employee FLI (0.09% up to $44,500)
    const empFliTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * this.NJ_EMPLOYEE_FLI_RATE));

    // 4. Employer SUI
    const suiRate = params.employerSuiRate || 0.031;
    const employerSuiTaxCents = BigInt(Math.round(Number(params.suiTaxableWageCents) * suiRate));

    const withholdings: EmployeeWithholdingResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_INCOME,
        jurisdiction: 'US-NJ',
        wageBaseCents: params.sitTaxableWageCents,
        taxAmountCents: pitTaxCents,
        calculationMethod: 'NJ_WT_TABLE_A'
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: 'US-NJ',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: empSuiTaxCents,
        calculationMethod: 'NJ_EE_SUI_0.3825%'
      },
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_DISABILITY,
        jurisdiction: 'US-NJ-FLI',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: empFliTaxCents,
        calculationMethod: 'NJ_EE_FLI_0.09%'
      }
    ];

    const employerTaxes: EmployerTaxResult[] = [
      {
        employeeId: params.employeeId,
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: 'US-NJ',
        wageBaseCents: params.suiTaxableWageCents,
        taxAmountCents: employerSuiTaxCents,
        employerRate: suiRate
      }
    ];

    return {
      withholdings,
      employerTaxes,
      totalNjEmployeeCents: pitTaxCents + empSuiTaxCents + empFliTaxCents,
      totalNjEmployerCents: employerSuiTaxCents
    };
  }
}
