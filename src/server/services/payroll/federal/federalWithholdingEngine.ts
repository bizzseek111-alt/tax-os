/**
 * Autonomous Tax OS — Deterministic Federal Withholding Engine
 * 
 * Implements authoritative IRS Publication 15-T (Percentage Method Tables
 * for Automated Payroll Systems, 2026 Tax Year):
 * - W-4 2020+ post-TCJA methodology
 * - Filing statuses: Single / MFS, Married Filing Jointly (MFJ), Head of Household (HOH)
 * - Pay frequencies: Weekly (52), Biweekly (26), Semimonthly (24), Monthly (12)
 * - W-4 Steps:
 *     Step 2: Multiple jobs / two-earner adjustment
 *     Step 3: Dependents tax credit reduction
 *     Step 4a: Other income addition
 *     Step 4b: Deductions subtraction
 *     Step 4c: Extra withholding addition
 * - Supplemental wages: Flat 22% (IRC § 3402)
 */

import { PayFrequency, W4Elections } from '../types';

interface TaxBracket {
  minAnnualCents: bigint;
  maxAnnualCents: bigint | null;
  baseTaxCents: bigint;
  ratePct: number;
}

export class FederalWithholdingEngine {
  private static readonly PERIODS_PER_YEAR: Record<PayFrequency, number> = {
    [PayFrequency.WEEKLY]: 52,
    [PayFrequency.BIWEEKLY]: 26,
    [PayFrequency.SEMIMONTHLY]: 24,
    [PayFrequency.MONTHLY]: 12
  };

  // 2026 Standard Brackets: Single / MFS (Step 2 Checked or Single Standard)
  private static readonly BRACKETS_SINGLE_2026: TaxBracket[] = [
    { minAnnualCents: BigInt(0), maxAnnualCents: BigInt(1460000), baseTaxCents: BigInt(0), ratePct: 0.0 },
    { minAnnualCents: BigInt(1460000), maxAnnualCents: BigInt(2620000), baseTaxCents: BigInt(0), ratePct: 0.10 },
    { minAnnualCents: BigInt(2620000), maxAnnualCents: BigInt(6175000), baseTaxCents: BigInt(116000), ratePct: 0.12 },
    { minAnnualCents: BigInt(6175000), maxAnnualCents: BigInt(11512500), baseTaxCents: BigInt(542600), ratePct: 0.22 },
    { minAnnualCents: BigInt(11512500), maxAnnualCents: BigInt(20655000), baseTaxCents: BigInt(1716850), ratePct: 0.24 },
    { minAnnualCents: BigInt(20655000), maxAnnualCents: BigInt(25825000), baseTaxCents: BigInt(3911050), ratePct: 0.32 },
    { minAnnualCents: BigInt(25825000), maxAnnualCents: BigInt(62635000), baseTaxCents: BigInt(5565450), ratePct: 0.35 },
    { minAnnualCents: BigInt(62635000), maxAnnualCents: null, baseTaxCents: BigInt(18448950), ratePct: 0.37 }
  ];

  // 2026 Standard Brackets: Married Filing Jointly (MFJ, Step 2 NOT checked)
  private static readonly BRACKETS_MFJ_2026: TaxBracket[] = [
    { minAnnualCents: BigInt(0), maxAnnualCents: BigInt(2920000), baseTaxCents: BigInt(0), ratePct: 0.0 },
    { minAnnualCents: BigInt(2920000), maxAnnualCents: BigInt(5240000), baseTaxCents: BigInt(0), ratePct: 0.10 },
    { minAnnualCents: BigInt(5240000), maxAnnualCents: BigInt(12350000), baseTaxCents: BigInt(232000), ratePct: 0.12 },
    { minAnnualCents: BigInt(12350000), maxAnnualCents: BigInt(23025000), baseTaxCents: BigInt(1085200), ratePct: 0.22 },
    { minAnnualCents: BigInt(23025000), maxAnnualCents: BigInt(41310000), baseTaxCents: BigInt(3433700), ratePct: 0.24 },
    { minAnnualCents: BigInt(41310000), maxAnnualCents: BigInt(51650000), baseTaxCents: BigInt(7822100), ratePct: 0.32 },
    { minAnnualCents: BigInt(51650000), maxAnnualCents: BigInt(75160000), baseTaxCents: BigInt(11130900), ratePct: 0.35 },
    { minAnnualCents: BigInt(75160000), maxAnnualCents: null, baseTaxCents: BigInt(19359400), ratePct: 0.37 }
  ];

  // 2026 Standard Brackets: Head of Household (HOH, Step 2 NOT checked)
  private static readonly BRACKETS_HOH_2026: TaxBracket[] = [
    { minAnnualCents: BigInt(0), maxAnnualCents: BigInt(2190000), baseTaxCents: BigInt(0), ratePct: 0.0 },
    { minAnnualCents: BigInt(2190000), maxAnnualCents: BigInt(3840000), baseTaxCents: BigInt(0), ratePct: 0.10 },
    { minAnnualCents: BigInt(3840000), maxAnnualCents: BigInt(8475000), baseTaxCents: BigInt(165000), ratePct: 0.12 },
    { minAnnualCents: BigInt(8475000), maxAnnualCents: BigInt(11512500), baseTaxCents: BigInt(721200), ratePct: 0.22 },
    { minAnnualCents: BigInt(11512500), maxAnnualCents: BigInt(20655000), baseTaxCents: BigInt(1389450), ratePct: 0.24 },
    { minAnnualCents: BigInt(20655000), maxAnnualCents: BigInt(25825000), baseTaxCents: BigInt(3583650), ratePct: 0.32 },
    { minAnnualCents: BigInt(25825000), maxAnnualCents: BigInt(62635000), baseTaxCents: BigInt(5238050), ratePct: 0.35 },
    { minAnnualCents: BigInt(62635000), maxAnnualCents: null, baseTaxCents: BigInt(18121550), ratePct: 0.37 }
  ];

  // 2026 Form W-4 Step 2 Checkbox IS Checked (Higher withholding rate table)
  private static readonly BRACKETS_STEP2_CHECKED_2026: TaxBracket[] = [
    { minAnnualCents: BigInt(0), maxAnnualCents: BigInt(730000), baseTaxCents: BigInt(0), ratePct: 0.0 },
    { minAnnualCents: BigInt(730000), maxAnnualCents: BigInt(1310000), baseTaxCents: BigInt(0), ratePct: 0.10 },
    { minAnnualCents: BigInt(1310000), maxAnnualCents: BigInt(3087500), baseTaxCents: BigInt(58000), ratePct: 0.12 },
    { minAnnualCents: BigInt(3087500), maxAnnualCents: BigInt(5756250), baseTaxCents: BigInt(271300), ratePct: 0.22 },
    { minAnnualCents: BigInt(5756250), maxAnnualCents: BigInt(10327500), baseTaxCents: BigInt(858425), ratePct: 0.24 },
    { minAnnualCents: BigInt(10327500), maxAnnualCents: BigInt(12912500), baseTaxCents: BigInt(1955525), ratePct: 0.32 },
    { minAnnualCents: BigInt(12912500), maxAnnualCents: BigInt(31317500), baseTaxCents: BigInt(2782725), ratePct: 0.35 },
    { minAnnualCents: BigInt(31317500), maxAnnualCents: null, baseTaxCents: BigInt(9224475), ratePct: 0.37 }
  ];

  /**
   * Calculates deterministic Federal Income Tax (FIT) withholding for a regular pay period.
   */
  public static calculateRegularWithholding(params: {
    taxableWageCents: bigint;
    frequency: PayFrequency;
    w4: W4Elections;
  }): {
    fitWithholdingCents: bigint;
    annualAdjustedWageCents: bigint;
    annualTaxCents: bigint;
  } {
    const P = BigInt(this.PERIODS_PER_YEAR[params.frequency]);
    const wage = params.taxableWageCents;

    // Step 1: Adjust wage for pay period
    // Add Step 4a (Other income per period)
    const otherIncomePerPeriod = params.w4.otherIncomeCents / P;
    // Subtract Step 4b (Deductions per period)
    const deductionsPerPeriod = params.w4.deductionsCents / P;

    let adjustedPeriodWage = wage + otherIncomePerPeriod;
    if (adjustedPeriodWage > deductionsPerPeriod) {
      adjustedPeriodWage -= deductionsPerPeriod;
    } else {
      adjustedPeriodWage = BigInt(0);
    }

    // Step 2: Annualize adjusted wage
    const annualAdjustedWageCents = adjustedPeriodWage * P;

    // Select bracket table based on W-4 status and Step 2 checkbox
    let brackets: TaxBracket[];
    if (params.w4.multipleJobs) {
      if (params.w4.filingStatus === 'MFJ' || params.w4.filingStatus === 'MARRIED_FILING_JOINTLY') {
        // In Pub 15-T, MFJ with Step 2 checked uses Single Standard table
        brackets = this.BRACKETS_SINGLE_2026;
      } else {
        // Single / HOH with Step 2 checked uses narrower brackets table
        brackets = this.BRACKETS_STEP2_CHECKED_2026;
      }
    } else if (params.w4.filingStatus === 'MFJ' || params.w4.filingStatus === 'MARRIED_FILING_JOINTLY') {
      brackets = this.BRACKETS_MFJ_2026;
    } else if (params.w4.filingStatus === 'HOH' || params.w4.filingStatus === 'HEAD_OF_HOUSEHOLD') {
      brackets = this.BRACKETS_HOH_2026;
    } else {
      brackets = this.BRACKETS_SINGLE_2026;
    }

    // Step 3: Compute annual tax from brackets
    let annualTaxCents = BigInt(0);
    for (const b of brackets) {
      if (annualAdjustedWageCents > b.minAnnualCents) {
        if (b.maxAnnualCents === null || annualAdjustedWageCents <= b.maxAnnualCents) {
          const excess = annualAdjustedWageCents - b.minAnnualCents;
          const taxOnExcess = BigInt(Math.round(Number(excess) * b.ratePct));
          annualTaxCents = b.baseTaxCents + taxOnExcess;
          break;
        }
      }
    }

    // Step 4: De-annualize tentative withholding
    let tentativePeriodTax = annualTaxCents / P;

    // Subtract Step 3 (Dependents tax credit per period)
    const depCreditPerPeriod = params.w4.claimDependentsCents / P;
    if (tentativePeriodTax > depCreditPerPeriod) {
      tentativePeriodTax -= depCreditPerPeriod;
    } else {
      tentativePeriodTax = BigInt(0);
    }

    // Add Step 4c (Extra withholding)
    let finalWithholding = tentativePeriodTax + params.w4.extraWithholdingCents;
    if (finalWithholding < BigInt(0)) {
      finalWithholding = BigInt(0);
    }

    return {
      fitWithholdingCents: finalWithholding,
      annualAdjustedWageCents,
      annualTaxCents
    };
  }

  /**
   * Supplemental / Bonus Wage Withholding:
   * Flat 22% for supplemental wages up to $1,000,000.
   * 37% for excess over $1,000,000.
   */
  public static calculateSupplementalWithholding(params: {
    bonusAmountCents?: bigint;
    supplementalWageCents?: bigint;
    priorYtdSupplementalCents?: bigint;
    ytdSupplementalWagesCents?: bigint;
  }): {
    fitWithholdingCents: bigint;
    taxableWageCents: bigint;
    ratePct: number;
  } {
    const bonus = params.supplementalWageCents ?? params.bonusAmountCents ?? BigInt(0);
    const prior = params.ytdSupplementalWagesCents ?? params.priorYtdSupplementalCents ?? BigInt(0);
    const millionThreshold = BigInt(100000000); // $1,000,000

    let fitWithholdingCents = BigInt(0);
    let ratePct = 0.22;

    if (prior >= millionThreshold) {
      fitWithholdingCents = BigInt(Math.round(Number(bonus) * 0.37));
      ratePct = 0.37;
    } else if (prior + bonus > millionThreshold) {
      const at22 = millionThreshold - prior;
      const at37 = bonus - at22;
      fitWithholdingCents = BigInt(Math.round(Number(at22) * 0.22)) + BigInt(Math.round(Number(at37) * 0.37));
      ratePct = 0.37;
    } else {
      fitWithholdingCents = BigInt(Math.round(Number(bonus) * 0.22));
      ratePct = 0.22;
    }

    return {
      fitWithholdingCents,
      taxableWageCents: bonus,
      ratePct
    };
  }
}
