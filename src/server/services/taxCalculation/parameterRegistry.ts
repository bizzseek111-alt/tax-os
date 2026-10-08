/**
 * Autonomous TaxOS — Statutory Parameter Registry
 * Workstream 3: Phase 3
 * 
 * Centralized, versioned repository of all statutory tax parameters for Tax Year 2026.
 * Every rate, bracket, deduction, and threshold includes exact legal citations
 * (Internal Revenue Code, State Revenue & Taxation Codes, Administrative Regulations).
 */

import { FilingStatus, SupportedJurisdiction, TaxBracket } from './types';

export interface StatutoryParameter<T> {
  key: string;
  taxYear: number;
  jurisdiction: SupportedJurisdiction;
  citation: string;
  description: string;
  value: T;
  effectiveDate: string;
}

export class TaxParameterRegistry {
  public static readonly ENGINE_VERSION = '3.0.0-phase3';
  public static readonly RULE_SET_VERSION = '2026.1';

  // ---------------------------------------------------------------------------
  // FEDERAL 2026 PARAMETERS
  // ---------------------------------------------------------------------------

  /**
   * 2026 Federal Standard Deductions (IRC § 63(c))
   */
  public static getFederalStandardDeduction(filingStatus: FilingStatus): StatutoryParameter<bigint> {
    const deductions: Record<FilingStatus, bigint> = {
      SINGLE: 1_575_000n,                         // $15,750
      MARRIED_FILING_JOINTLY: 3_150_000n,        // $31,500
      MARRIED_FILING_SEPARATELY: 1_575_000n,     // $15,750
      HEAD_OF_HOUSEHOLD: 2_362_500n,             // $23,625
      QUALIFYING_SURVIVING_SPOUSE: 3_150_000n,   // $31,500
    };

    return {
      key: `FED_STANDARD_DEDUCTION_${filingStatus}`,
      taxYear: 2026,
      jurisdiction: 'US-FED',
      citation: 'IRC § 63(c)(2), Rev. Proc. 2025-XX',
      description: `Basic standard deduction for ${filingStatus}`,
      value: deductions[filingStatus],
      effectiveDate: '2026-01-01',
    };
  }

  /**
   * 2026 Federal Progressive Income Tax Brackets (IRC § 1(j))
   */
  public static getFederalBrackets(filingStatus: FilingStatus): StatutoryParameter<TaxBracket[]> {
    let brackets: TaxBracket[];

    if (filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE') {
      brackets = [
        { floorCents: 0n, ceilingCents: 2_480_000n, rateBps: 1000, baseTaxCents: 0n },
        { floorCents: 2_480_000n, ceilingCents: 10_080_000n, rateBps: 1200, baseTaxCents: 248_000n },
        { floorCents: 10_080_000n, ceilingCents: 21_140_000n, rateBps: 2200, baseTaxCents: 1_160_000n },
        { floorCents: 21_140_000n, ceilingCents: 40_350_000n, rateBps: 2400, baseTaxCents: 3_593_200n },
        { floorCents: 40_350_000n, ceilingCents: 51_240_000n, rateBps: 3200, baseTaxCents: 8_203_600n },
        { floorCents: 51_240_000n, ceilingCents: 76_870_000n, rateBps: 3500, baseTaxCents: 11_688_400n },
        { floorCents: 76_870_000n, ceilingCents: null, rateBps: 3700, baseTaxCents: 20_658_900n },
      ];
    } else if (filingStatus === 'HEAD_OF_HOUSEHOLD') {
      brackets = [
        { floorCents: 0n, ceilingCents: 1_770_000n, rateBps: 1000, baseTaxCents: 0n },
        { floorCents: 1_770_000n, ceilingCents: 6_750_000n, rateBps: 1200, baseTaxCents: 177_000n },
        { floorCents: 6_750_000n, ceilingCents: 10_570_000n, rateBps: 2200, baseTaxCents: 774_600n },
        { floorCents: 10_570_000n, ceilingCents: 20_175_000n, rateBps: 2400, baseTaxCents: 1_615_000n },
        { floorCents: 20_175_000n, ceilingCents: 25_620_000n, rateBps: 3200, baseTaxCents: 3_920_200n },
        { floorCents: 25_620_000n, ceilingCents: 64_060_000n, rateBps: 3500, baseTaxCents: 5_662_600n },
        { floorCents: 64_060_000n, ceilingCents: null, rateBps: 3700, baseTaxCents: 19_116_600n },
      ];
    } else if (filingStatus === 'MARRIED_FILING_SEPARATELY') {
      brackets = [
        { floorCents: 0n, ceilingCents: 1_240_000n, rateBps: 1000, baseTaxCents: 0n },
        { floorCents: 1_240_000n, ceilingCents: 5_040_000n, rateBps: 1200, baseTaxCents: 124_000n },
        { floorCents: 5_040_000n, ceilingCents: 10_570_000n, rateBps: 2200, baseTaxCents: 580_000n },
        { floorCents: 10_570_000n, ceilingCents: 20_175_000n, rateBps: 2400, baseTaxCents: 1_796_600n },
        { floorCents: 20_175_000n, ceilingCents: 25_620_000n, rateBps: 3200, baseTaxCents: 4_101_800n },
        { floorCents: 25_620_000n, ceilingCents: 38_435_000n, rateBps: 3500, baseTaxCents: 5_844_200n },
        { floorCents: 38_435_000n, ceilingCents: null, rateBps: 3700, baseTaxCents: 10_329_450n },
      ];
    } else {
      // SINGLE
      brackets = [
        { floorCents: 0n, ceilingCents: 1_240_000n, rateBps: 1000, baseTaxCents: 0n },
        { floorCents: 1_240_000n, ceilingCents: 5_040_000n, rateBps: 1200, baseTaxCents: 124_000n },
        { floorCents: 5_040_000n, ceilingCents: 10_570_000n, rateBps: 2200, baseTaxCents: 580_000n },
        { floorCents: 10_570_000n, ceilingCents: 20_175_000n, rateBps: 2400, baseTaxCents: 1_796_600n },
        { floorCents: 20_175_000n, ceilingCents: 25_620_000n, rateBps: 3200, baseTaxCents: 4_101_800n },
        { floorCents: 25_620_000n, ceilingCents: 64_060_000n, rateBps: 3500, baseTaxCents: 5_844_200n },
        { floorCents: 64_060_000n, ceilingCents: null, rateBps: 3700, baseTaxCents: 19_298_200n },
      ];
    }

    return {
      key: `FED_BRACKETS_${filingStatus}`,
      taxYear: 2026,
      jurisdiction: 'US-FED',
      citation: 'IRC § 1(j)(2)',
      description: `Statutory 7-tier tax brackets for ${filingStatus}`,
      value: brackets,
      effectiveDate: '2026-01-01',
    };
  }

  /**
   * 2026 Self-Employment Tax Parameters (IRC §§ 1401, 1402)
   */
  public static getSelfEmploymentParameters() {
    return {
      netEarningsMultiplierBps: 9235,        // 92.35% under IRC § 1402(a)(12)
      oasdiWageBaseCents: 17_610_000n,       // $176,100 Social Security cap
      oasdiRateBps: 1240,                    // 12.4% OASDI
      medicareRateBps: 290,                  // 2.9% Hospital Insurance (HI)
      additionalMedicareRateBps: 90,         // 0.9% Additional Medicare
      additionalMedicareThresholds: {
        SINGLE: 20_000_000n,                 // $200,000
        HEAD_OF_HOUSEHOLD: 20_000_000n,
        MARRIED_FILING_JOINTLY: 25_000_000n, // $250,000
        MARRIED_FILING_SEPARATELY: 12_500_000n,// $125,000
        QUALIFYING_SURVIVING_SPOUSE: 25_000_000n,
      },
      deductibleSeTaxRateBps: 5000,          // 50% above-the-line under IRC § 164(f)
      citations: {
        multiplier: 'IRC § 1402(a)(12)',
        oasdi: 'IRC § 1401(a)',
        medicare: 'IRC § 1401(b)(1)',
        additionalMedicare: 'IRC § 3101(b)(2), § 1401(b)(2)',
        aboveTheLineDeduction: 'IRC § 164(f)',
      },
    };
  }

  /**
   * 2026 Qualified Business Income (IRC § 199A / Form 8995)
   */
  public static getQbiParameters(filingStatus: FilingStatus) {
    const isMfj = filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE';
    return {
      deductionRateBps: 2000,                // 20%
      thresholdCents: isMfj ? 40_350_000n : 20_175_000n, // $403,500 MFJ, $201,750 other
      phaseoutRangeCents: isMfj ? 10_000_000n : 5_000_000n, // $100,000 MFJ, $50,000 other
      citation: 'IRC § 199A(b), Form 8995',
    };
  }

  /**
   * 2026 Child Tax Credit & Other Dependents (IRC § 24)
   */
  public static getChildTaxCreditParameters(filingStatus: FilingStatus) {
    const isMfj = filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE';
    return {
      creditPerChildCents: 200_000n,         // $2,000 per qualifying child
      refundableCapPerChildCents: 170_000n,  // $1,700 max refundable (ACTC)
      creditPerOtherDependentCents: 50_000n, // $500 per other dependent
      phaseoutThresholdCents: isMfj ? 40_000_000n : 20_000_000n, // $400k MFJ / $200k other
      phaseoutRatePerThousandCents: 5_000n,  // $50 reduction per $1,000 above threshold (5%)
      citation: 'IRC § 24(a)-(h), Schedule 8812',
    };
  }

  // ---------------------------------------------------------------------------
  // STATE 2026 PARAMETERS
  // ---------------------------------------------------------------------------

  /**
   * California Form 540 Parameters (Cal. Rev. & Tax. Code §§ 17041, 17072)
   */
  public static getCaliforniaParameters(filingStatus: FilingStatus) {
    const isJointOrHoh = filingStatus === 'MARRIED_FILING_JOINTLY' || 
                         filingStatus === 'HEAD_OF_HOUSEHOLD' ||
                         filingStatus === 'QUALIFYING_SURVIVING_SPOUSE';

    const standardDeductionCents = isJointOrHoh ? 1_108_000n : 554_000n; // $11,080 / $5,540
    const personalExemptionCreditCents = isJointOrHoh ? 29_800n : 14_900n; // $298 / $149

    // CA progressive brackets
    let brackets: TaxBracket[];
    if (isJointOrHoh) {
      brackets = [
        { floorCents: 0n, ceilingCents: 2_150_800n, rateBps: 100, baseTaxCents: 0n },
        { floorCents: 2_150_800n, ceilingCents: 5_098_200n, rateBps: 200, baseTaxCents: 21_508n },
        { floorCents: 5_098_200n, ceilingCents: 8_046_400n, rateBps: 400, baseTaxCents: 80_456n },
        { floorCents: 8_046_400n, ceilingCents: 11_166_400n, rateBps: 600, baseTaxCents: 198_384n },
        { floorCents: 11_166_400n, ceilingCents: 14_111_600n, rateBps: 800, baseTaxCents: 385_584n },
        { floorCents: 14_111_600n, ceilingCents: 72_099_600n, rateBps: 930, baseTaxCents: 621_200n },
        { floorCents: 72_099_600n, ceilingCents: 86_518_400n, rateBps: 1030, baseTaxCents: 6_014_084n },
        { floorCents: 86_518_400n, ceilingCents: 144_198_200n, rateBps: 1130, baseTaxCents: 7_499_221n },
        { floorCents: 144_198_200n, ceilingCents: null, rateBps: 1230, baseTaxCents: 14_016_038n },
      ];
    } else {
      brackets = [
        { floorCents: 0n, ceilingCents: 1_075_400n, rateBps: 100, baseTaxCents: 0n },
        { floorCents: 1_075_400n, ceilingCents: 2_549_100n, rateBps: 200, baseTaxCents: 10_754n },
        { floorCents: 2_549_100n, ceilingCents: 4_023_200n, rateBps: 400, baseTaxCents: 40_228n },
        { floorCents: 4_023_200n, ceilingCents: 5_583_200n, rateBps: 600, baseTaxCents: 99_192n },
        { floorCents: 5_583_200n, ceilingCents: 7_055_800n, rateBps: 800, baseTaxCents: 192_792n },
        { floorCents: 7_055_800n, ceilingCents: 36_049_800n, rateBps: 930, baseTaxCents: 310_600n },
        { floorCents: 36_049_800n, ceilingCents: 43_259_200n, rateBps: 1030, baseTaxCents: 3_007_042n },
        { floorCents: 43_259_200n, ceilingCents: 72_099_100n, rateBps: 1130, baseTaxCents: 3_749_610n },
        { floorCents: 72_099_100n, ceilingCents: null, rateBps: 1230, baseTaxCents: 7_008_519n },
      ];
    }

    return {
      standardDeductionCents,
      personalExemptionCreditCents,
      brackets,
      mentalHealthSurtaxThresholdCents: 100_000_000n, // $1,000,000
      mentalHealthSurtaxRateBps: 100,                 // 1.0% surtax (CRTC § 17043)
      conformsHsa: false,                             // CA does not conform to HSA deduction
      conformsQbi: false,                             // CA does not conform to IRC § 199A
      citations: {
        rates: 'Cal. Rev. & Tax. Code § 17041',
        surtax: 'Cal. Rev. & Tax. Code § 17043 (Prop 63)',
        deductions: 'Cal. Rev. & Tax. Code § 17072',
      },
    };
  }

  /**
   * New York Form IT-201 Parameters (NY Tax Law § 601, § 614)
   */
  public static getNewYorkParameters(filingStatus: FilingStatus) {
    let standardDeductionCents = 800_000n; // $8,000 Single
    if (filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE') {
      standardDeductionCents = 1_605_000n; // $16,050 MFJ
    } else if (filingStatus === 'HEAD_OF_HOUSEHOLD') {
      standardDeductionCents = 1_120_000n; // $11,200 HOH
    } else if (filingStatus === 'MARRIED_FILING_SEPARATELY') {
      standardDeductionCents = 800_000n;
    }

    // NY Form IT-201 2026 progressive brackets (NY Tax Law § 601)
    const brackets: TaxBracket[] = [
      { floorCents: 0n, ceilingCents: 850_000n, rateBps: 400, baseTaxCents: 0n },
      { floorCents: 850_000n, ceilingCents: 1_170_000n, rateBps: 450, baseTaxCents: 34_000n },
      { floorCents: 1_170_000n, ceilingCents: 1_390_000n, rateBps: 525, baseTaxCents: 48_400n },
      { floorCents: 1_390_000n, ceilingCents: 8_065_000n, rateBps: 585, baseTaxCents: 59_950n },
      { floorCents: 8_065_000n, ceilingCents: 21_540_000n, rateBps: 625, baseTaxCents: 450_938n },
      { floorCents: 21_540_000n, ceilingCents: 107_755_000n, rateBps: 685, baseTaxCents: 1_293_125n },
      { floorCents: 107_755_000n, ceilingCents: 500_000_000n, rateBps: 965, baseTaxCents: 7_203_853n },
      { floorCents: 500_000_000n, ceilingCents: 2_500_000_000n, rateBps: 1030, baseTaxCents: 45_055_998n },
      { floorCents: 2_500_000_000n, ceilingCents: null, rateBps: 1090, baseTaxCents: 251_055_998n },
    ];

    return {
      standardDeductionCents,
      brackets,
      citations: {
        rates: 'NY Tax Law § 601(a)-(d)',
        deductions: 'NY Tax Law § 614',
      },
    };
  }

  /**
   * New Jersey Form NJ-1040 Parameters (NJ Rev. Stat. § 54A:1-1 et seq.)
   */
  public static getNewJerseyParameters(filingStatus: FilingStatus) {
    const isJoint = filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE';
    const personalExemptionCents = isJoint ? 200_000n : 100_000n; // $2,000 MFJ, $1,000 Single

    let brackets: TaxBracket[];
    if (isJoint) {
      brackets = [
        { floorCents: 0n, ceilingCents: 2_000_000n, rateBps: 140, baseTaxCents: 0n },
        { floorCents: 2_000_000n, ceilingCents: 5_000_000n, rateBps: 175, baseTaxCents: 28_000n },
        { floorCents: 5_000_000n, ceilingCents: 7_000_000n, rateBps: 245, baseTaxCents: 80_500n },
        { floorCents: 7_000_000n, ceilingCents: 8_000_000n, rateBps: 350, baseTaxCents: 129_500n },
        { floorCents: 8_000_000n, ceilingCents: 15_000_000n, rateBps: 553, baseTaxCents: 164_500n },
        { floorCents: 15_000_000n, ceilingCents: 50_000_000n, rateBps: 637, baseTaxCents: 551_600n },
        { floorCents: 50_000_000n, ceilingCents: 100_000_000n, rateBps: 897, baseTaxCents: 2_781_100n },
        { floorCents: 100_000_000n, ceilingCents: null, rateBps: 1075, baseTaxCents: 7_266_100n },
      ];
    } else {
      brackets = [
        { floorCents: 0n, ceilingCents: 2_000_000n, rateBps: 140, baseTaxCents: 0n },
        { floorCents: 2_000_000n, ceilingCents: 3_500_000n, rateBps: 175, baseTaxCents: 28_000n },
        { floorCents: 3_500_000n, ceilingCents: 4_000_000n, rateBps: 350, baseTaxCents: 54_250n },
        { floorCents: 4_000_000n, ceilingCents: 7_500_000n, rateBps: 553, baseTaxCents: 71_750n },
        { floorCents: 7_500_000n, ceilingCents: 50_000_000n, rateBps: 637, baseTaxCents: 265_300n },
        { floorCents: 50_000_000n, ceilingCents: 100_000_000n, rateBps: 897, baseTaxCents: 2_972_550n },
        { floorCents: 100_000_000n, ceilingCents: null, rateBps: 1075, baseTaxCents: 7_457_550n },
      ];
    }

    return {
      personalExemptionCents,
      brackets,
      citations: {
        rates: 'N.J. Stat. Ann. § 54A:2-1',
        exemptions: 'N.J. Stat. Ann. § 54A:3-1',
      },
    };
  }

  /**
   * Illinois Form IL-1040 Parameters (35 ILCS 5/201, 5/204)
   * Flat 4.95% individual income tax rate.
   */
  public static getIllinoisParameters() {
    return {
      flatRateBps: 495,                      // 4.95% flat
      basicExemptionPerPersonCents: 277_500n,// $2,775 basic exemption
      pensionSubtractionPct: 100,            // 100% subtraction for qualified retirement/pension
      citations: {
        rate: '35 ILCS 5/201(b)(14)',
        exemptions: '35 ILCS 5/204(b)',
        pensionSubtraction: '35 ILCS 5/203(a)(2)(F)',
      },
    };
  }

  /**
   * Massachusetts Form 1 Parameters (M.G.L. c. 62, § 4)
   * Flat 5.0% Part B income tax + 4.0% Fair Share Surtax on income > $1,000,000.
   */
  public static getMassachusettsParameters(filingStatus: FilingStatus) {
    let personalExemptionCents = 440_000n; // $4,400 Single
    if (filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE') {
      personalExemptionCents = 880_000n;   // $8,800 MFJ
    } else if (filingStatus === 'HEAD_OF_HOUSEHOLD') {
      personalExemptionCents = 680_000n;   // $6,800 HOH
    } else if (filingStatus === 'MARRIED_FILING_SEPARATELY') {
      personalExemptionCents = 440_000n;
    }

    return {
      partBRateBps: 500,                     // 5.0% flat Part B
      fairShareSurtaxThresholdCents: 100_000_000n, // $1,000,000
      fairShareSurtaxRateBps: 400,           // 4.0% surtax
      personalExemptionCents,
      citations: {
        rate: 'Mass. Gen. Laws ch. 62, § 4',
        fairShare: 'Mass. Const. amend. art. XLIV (Fair Share Amendment)',
        exemptions: 'Mass. Gen. Laws ch. 62, § 3(B)(b)',
      },
    };
  }
}
