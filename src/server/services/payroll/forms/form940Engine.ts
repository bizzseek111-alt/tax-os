/**
 * Autonomous Tax OS — Deterministic Form 940 Engine
 * 
 * Prepares IRS Form 940 (Employer's Annual Federal Unemployment Tax Return):
 * - Line 3: Total payments to all employees
 * - Line 4: Exempt payments
 * - Line 7: Total taxable FUTA wages (capped at $7,000 per employee)
 * - Line 8: FUTA tax before adjustments (6.0%)
 * - Line 9: Maximum allowable state unemployment credit (5.4%)
 * - Line 12: Total FUTA tax (0.6% effective net rate)
 * - Line 13: FUTA deposits made
 * - Line 14: Balance due / Line 15: Overpayment
 */

import { Form940CalculationResult } from '../types';

export class Form940Engine {
  public static readonly STATUTORY_FUTA_RATE = 0.060; // 6.0%
  public static readonly SUTA_CREDIT_RATE = 0.054; // 5.4%
  public static readonly NET_FUTA_RATE = 0.006; // 0.6%

  /**
   * Calculates Form 940 return lines deterministically.
   */
  public static calculateForm940(params: {
    taxYear: number;
    totalPaymentsCents: bigint;
    exemptPaymentsCents: bigint;
    taxableFutaWagesCents: bigint;
    totalDepositsCents: bigint;
    creditReductionRate?: number; // default 0.0
  }): Form940CalculationResult {
    const taxableWages = params.taxableFutaWagesCents;
    const creditReduction = params.creditReductionRate || 0.0;

    const line8GrossTax = BigInt(Math.round(Number(taxableWages) * this.STATUTORY_FUTA_RATE));
    const effectiveCreditRate = Math.max(0, this.SUTA_CREDIT_RATE - creditReduction);
    const line9StateCredit = BigInt(Math.round(Number(taxableWages) * effectiveCreditRate));

    const effectiveNetRate = this.NET_FUTA_RATE + creditReduction;
    const line12NetTax = BigInt(Math.round(Number(taxableWages) * effectiveNetRate));

    let balanceDueCents = BigInt(0);
    let overpaymentCents = BigInt(0);

    if (line12NetTax > params.totalDepositsCents) {
      balanceDueCents = line12NetTax - params.totalDepositsCents;
    } else {
      overpaymentCents = params.totalDepositsCents - line12NetTax;
    }

    return {
      taxYear: params.taxYear,
      line3TotalPaymentsCents: params.totalPaymentsCents,
      line4ExemptPaymentsCents: params.exemptPaymentsCents,
      line7TotalTaxableWages: taxableWages,
      line8FutaTaxBeforeCredit: line8GrossTax,
      line9StateCreditCents: line9StateCredit,
      line12TotalFutaTaxCents: line12NetTax,
      line12TotalFutaTaxAfterAdjustmentsCents: line12NetTax,
      line13DepositsCents: params.totalDepositsCents,
      line14BalanceDueCents: balanceDueCents,
      line15OverpaymentCents: overpaymentCents
    };
  }
}
