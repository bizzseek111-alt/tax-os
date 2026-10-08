/**
 * Autonomous Tax OS — Deterministic Form 941 Engine
 * 
 * Prepares IRS Form 941 (Employer's Quarterly Federal Tax Return):
 * - Line 1: Number of employees
 * - Line 2: Wages, tips, and other compensation
 * - Line 3: Federal income tax withheld
 * - Line 5a: Taxable Social Security wages x 12.4%
 * - Line 5c: Taxable Medicare wages & tips x 2.9%
 * - Line 5d: Additional Medicare tax x 0.9%
 * - Line 5e: Total Social Security and Medicare taxes
 * - Line 6 / 10: Total taxes
 * - Line 11: Total deposits
 * - Line 12: Balance due / Line 15: Overpayment
 * - Schedule B generation for semi-weekly depositors
 */

import { Form941CalculationResult, DepositFrequency } from '../types';

export class Form941Engine {
  /**
   * Aggregates payroll runs into a deterministic Form 941 return.
   */
  public static calculateForm941(params: {
    taxYear: number;
    quarter: number;
    numEmployees: number;
    grossWagesCents: bigint;
    fitWithheldCents: bigint;
    taxableSsWagesCents: bigint;
    taxableMedWagesCents: bigint;
    taxableAddlMedWagesCents: bigint;
    totalDepositsCents: bigint;
    depositFrequency: DepositFrequency;
    dailyLiabilities?: { date: string; amountCents: bigint }[];
  }): Form941CalculationResult {
    // Line 5a: Taxable SS wages x 12.4% (6.2% EE + 6.2% ER)
    const line5aTaxCents = BigInt(Math.round(Number(params.taxableSsWagesCents) * 0.124));

    // Line 5c: Taxable Medicare wages x 2.9% (1.45% EE + 1.45% ER)
    const line5cTaxCents = BigInt(Math.round(Number(params.taxableMedWagesCents) * 0.029));

    // Line 5d: Additional Medicare tax x 0.9%
    const line5dTaxCents = BigInt(Math.round(Number(params.taxableAddlMedWagesCents) * 0.009));

    // Line 5e: Total SS and Medicare
    const line5eTotalFicaCents = line5aTaxCents + line5cTaxCents + line5dTaxCents;

    // Line 6 / 10: Total Taxes
    const totalTaxesCents = params.fitWithheldCents + line5eTotalFicaCents;

    // Line 12 vs 15: Balance Due vs Overpayment
    let balanceDueCents = BigInt(0);
    let overpaymentCents = BigInt(0);

    if (totalTaxesCents > params.totalDepositsCents) {
      balanceDueCents = totalTaxesCents - params.totalDepositsCents;
    } else {
      overpaymentCents = params.totalDepositsCents - totalTaxesCents;
    }

    const scheduleBRequired = params.depositFrequency === DepositFrequency.SEMI_WEEKLY;
    const scheduleBAllocations = params.dailyLiabilities || [];

    return {
      quarter: params.quarter,
      taxYear: params.taxYear,
      line1NumEmployees: params.numEmployees,
      line2WagesCents: params.grossWagesCents,
      line3FitWithheldCents: params.fitWithheldCents,
      line5aTaxableSsWagesCents: params.taxableSsWagesCents,
      line5aTaxCents,
      line5bTaxableSsTipsCents: BigInt(0),
      line5bTaxCents: BigInt(0),
      line5cTaxableMedWagesCents: params.taxableMedWagesCents,
      line5cTaxCents,
      line5dTaxableAddlMedWagesCents: params.taxableAddlMedWagesCents,
      line5dTaxCents,
      line5eTotalFicaCents,
      line6TotalTaxesBeforeAdjustments: totalTaxesCents,
      line10TotalTaxesCents: totalTaxesCents,
      line11TotalDepositsCents: params.totalDepositsCents,
      line12BalanceDueCents: balanceDueCents,
      line15OverpaymentCents: overpaymentCents,
      scheduleBRequired,
      scheduleBAllocations
    };
  }
}
