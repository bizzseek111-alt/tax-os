import { 
  Employee, 
  PayrollEarning, 
  PreTaxDeduction, 
  EmployeeWithholding, 
  EmployerTax, 
  PayrollDepositSchedule, 
  Form941Record,
  PayrollRun
} from '../types/payrollTax';
import { CalculationProvenance } from '../types/common';

// 2027 Tax Year Constants
export const PAYROLL_CONSTANTS_2027 = {
  SOCIAL_SECURITY_RATE: 0.062,
  SOCIAL_SECURITY_WAGE_BASE: 168600,
  MEDICARE_RATE: 0.0145,
  ADDITIONAL_MEDICARE_RATE: 0.009,
  ADDITIONAL_MEDICARE_THRESHOLD_SINGLE: 200000,
  FUTA_STATUTORY_RATE: 0.060,
  FUTA_MAX_STATE_CREDIT: 0.054,
  FUTA_EFFECTIVE_RATE: 0.006, // 0.6% net
  FUTA_WAGE_BASE: 7000,
  LOOKBACK_SEMI_WEEKLY_THRESHOLD: 50000, // IRC § 6302 threshold
  ONE_DAY_100K_RULE_THRESHOLD: 100000
};

export class PayrollEngine {
  /**
   * Calculate employee withholdings for a payroll period
   */
  static calculateEmployeeWithholding(params: {
    grossWages: number;
    ytdGrossWages: number;
    preTaxDeductions: PreTaxDeduction[];
    filingStatus: 'SINGLE_OR_SEPARATE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';
    stateCode: string;
    extraWithholding: number;
  }): { withholding: EmployeeWithholding; provenance: CalculationProvenance } {
    // Separate pre-tax deductions that reduce FICA vs FIT
    let ficaPreTax = 0;
    let fitPreTax = 0;

    for (const d of params.preTaxDeductions) {
      if (d.isFicaExempt) ficaPreTax += d.amount;
      if (d.isFederalIncomeTaxExempt) fitPreTax += d.amount;
    }

    const fitTaxableWages = Math.max(0, params.grossWages - fitPreTax);
    const ficaTaxableWages = Math.max(0, params.grossWages - ficaPreTax);

    // Social Security (capped at $168,600)
    let ssTaxable = 0;
    if (params.ytdGrossWages < PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_WAGE_BASE) {
      const remainingCap = PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_WAGE_BASE - params.ytdGrossWages;
      ssTaxable = Math.min(ficaTaxableWages, remainingCap);
    }
    const socialSecurityEmployee = Math.round(ssTaxable * PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_RATE * 100) / 100;

    // Medicare (no base limit)
    const medicareEmployee = Math.round(ficaTaxableWages * PAYROLL_CONSTANTS_2027.MEDICARE_RATE * 100) / 100;

    // Additional Medicare (0.9% for YTD wages over $200k)
    let additionalMedicareEmployee = 0;
    const newYtd = params.ytdGrossWages + ficaTaxableWages;
    if (newYtd > PAYROLL_CONSTANTS_2027.ADDITIONAL_MEDICARE_THRESHOLD_SINGLE) {
      const excessWages = Math.min(
        ficaTaxableWages,
        newYtd - PAYROLL_CONSTANTS_2027.ADDITIONAL_MEDICARE_THRESHOLD_SINGLE
      );
      additionalMedicareEmployee = Math.round(excessWages * PAYROLL_CONSTANTS_2027.ADDITIONAL_MEDICARE_RATE * 100) / 100;
    }

    // Federal Income Tax (simplified progressive withholding estimate)
    let fitRate = 0.12;
    if (fitTaxableWages > 4000) fitRate = 0.22;
    if (fitTaxableWages > 8000) fitRate = 0.24;
    const federalIncomeTax = Math.round(fitTaxableWages * fitRate * 100) / 100 + params.extraWithholding;

    // State Withholding (CA: ~6%, NY: ~5%, TX: 0%)
    let stateTax = 0;
    if (params.stateCode === 'CA') stateTax = Math.round(fitTaxableWages * 0.06 * 100) / 100;
    else if (params.stateCode === 'NY') stateTax = Math.round(fitTaxableWages * 0.055 * 100) / 100;

    const totalEmployeeWithholdings = 
      federalIncomeTax + 
      socialSecurityEmployee + 
      medicareEmployee + 
      additionalMedicareEmployee + 
      stateTax;

    const withholding: EmployeeWithholding = {
      federalIncomeTax,
      socialSecurityEmployee,
      medicareEmployee,
      additionalMedicareEmployee,
      stateIncomeTax: stateTax,
      totalEmployeeWithholdings
    };

    const provenance: CalculationProvenance = {
      engineVersion: 'PayrollEngine-v3.1.0',
      ruleSetVersion: '2027-FED-PUB-15T',
      ruleIds: ['IRC-3101-FICA', 'IRC-3402-FIT', `STATE-WITHHOLDING-${params.stateCode}`],
      inputHash: `pw-${params.grossWages}-${params.stateCode}`,
      calculatedAt: new Date().toISOString(),
      citations: [
        'IRC § 3101(a) (Social Security 6.2%)',
        'IRC § 3101(b)(1) (Medicare 1.45%)',
        'IRC § 3101(b)(2) (Additional Medicare 0.9%)',
        'IRC § 3402 (Income Tax Withholding at Source)'
      ]
    };

    return { withholding, provenance };
  }

  /**
   * Calculate employer taxes for a payroll period
   */
  static calculateEmployerTaxes(params: {
    grossWages: number;
    ytdGrossWages: number;
    sutaRate: number; // e.g. 0.027
    stateWageBase: number; // e.g. 7000 or 10000
  }): EmployerTax {
    // Employer Social Security Match (6.2%)
    let ssTaxable = 0;
    if (params.ytdGrossWages < PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_WAGE_BASE) {
      const remainingCap = PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_WAGE_BASE - params.ytdGrossWages;
      ssTaxable = Math.min(params.grossWages, remainingCap);
    }
    const socialSecurityEmployer = Math.round(ssTaxable * PAYROLL_CONSTANTS_2027.SOCIAL_SECURITY_RATE * 100) / 100;

    // Employer Medicare Match (1.45%)
    const medicareEmployer = Math.round(params.grossWages * PAYROLL_CONSTANTS_2027.MEDICARE_RATE * 100) / 100;

    // FUTA (0.6% up to $7,000 wage base per employee)
    let futaTaxable = 0;
    if (params.ytdGrossWages < PAYROLL_CONSTANTS_2027.FUTA_WAGE_BASE) {
      const remainingCap = PAYROLL_CONSTANTS_2027.FUTA_WAGE_BASE - params.ytdGrossWages;
      futaTaxable = Math.min(params.grossWages, remainingCap);
    }
    const futaEmployer = Math.round(futaTaxable * PAYROLL_CONSTANTS_2027.FUTA_EFFECTIVE_RATE * 100) / 100;

    // SUTA (State Unemployment)
    let sutaTaxable = 0;
    if (params.ytdGrossWages < params.stateWageBase) {
      const remainingCap = params.stateWageBase - params.ytdGrossWages;
      sutaTaxable = Math.min(params.grossWages, remainingCap);
    }
    const sutaEmployer = Math.round(sutaTaxable * params.sutaRate * 100) / 100;

    const totalEmployerTax = socialSecurityEmployer + medicareEmployer + futaEmployer + sutaEmployer;

    return {
      socialSecurityEmployer,
      medicareEmployer,
      futaEmployer,
      sutaEmployer,
      totalEmployerTax
    };
  }

  /**
   * Determine deposit schedule according to IRC § 6302 lookback period rules
   */
  static determineDepositSchedule(lookbackPeriodTotalLiability: number): PayrollDepositSchedule {
    const isSemiWeekly = lookbackPeriodTotalLiability > PAYROLL_CONSTANTS_2027.LOOKBACK_SEMI_WEEKLY_THRESHOLD;

    return {
      federalSchedule: isSemiWeekly ? 'SEMI_WEEKLY' : 'MONTHLY',
      lookbackPeriodLiability: lookbackPeriodTotalLiability,
      stateSchedule: isSemiWeekly ? 'SEMI_WEEKLY' : 'MONTHLY',
      nextDepositDeadline: isSemiWeekly ? 'Every Wednesday/Friday (Next 3 business days)' : '15th of the following month',
      isNextDayRuleTriggered: false
    };
  }
}
