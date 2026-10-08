/**
 * Autonomous Tax OS — Deterministic Taxable Wage Base Service
 * 
 * Computes exact taxable wage bases per tax type:
 * - Federal Income Tax (FIT): Gross wages minus 401(k), Section 125, HSA, FSA.
 * - Social Security (FICA OASDI): Gross wages minus Sec 125/HSA/FSA (401(k) is taxable), capped at $176,100.
 * - Medicare (FICA HI): Gross wages minus Sec 125/HSA/FSA (no cap).
 * - Additional Medicare: Wages exceeding $200,000 threshold.
 * - FUTA: Gross wages minus Sec 125, capped at $7,000.
 * - State Income Tax (SIT): Conforms to FIT taxable base for CA, NY, NJ, IL, MA.
 * - State Unemployment (SUI): State-specific statutory caps.
 */

import {
  PayrollTaxType,
  DeductionType,
  EarningInput,
  DeductionInput,
  TaxableWageResult
} from '../types';

export class WageBaseService {
  // Statutory 2026 Wage Base Limits (in integer Cents)
  public static readonly SOCIAL_SECURITY_WAGE_BASE_CENTS_2026 = BigInt(17610000); // $176,100
  public static readonly ADDITIONAL_MEDICARE_THRESHOLD_CENTS = BigInt(20000000); // $200,000
  public static readonly FUTA_WAGE_BASE_CENTS = BigInt(700000); // $7,000

  public static readonly STATE_SUI_WAGE_BASES_2026: Record<string, bigint> = {
    'US-CA': BigInt(700000),   // $7,000
    'US-NY': BigInt(1300000),  // $13,000
    'US-NJ': BigInt(4450000),  // $44,500
    'US-IL': BigInt(1359000),  // $13,590
    'US-MA': BigInt(1500000)   // $15,000
  };

  /**
   * Evaluates pre-tax deduction exemptions per tax type.
   */
  public static computePreTaxDeductions(deductions: DeductionInput[]): {
    fitPreTaxCents: bigint;
    ficaPreTaxCents: bigint;
    futaPreTaxCents: bigint;
    sitPreTaxCents: bigint;
    postTaxCents: bigint;
  } {
    let fitPreTaxCents = BigInt(0);
    let ficaPreTaxCents = BigInt(0);
    let futaPreTaxCents = BigInt(0);
    let sitPreTaxCents = BigInt(0);
    let postTaxCents = BigInt(0);

    for (const d of deductions) {
      switch (d.deductionType) {
        case DeductionType.RETIREMENT_401K:
          // IRC § 402(g): Pre-tax for FIT and SIT, but TAXABLE for FICA and FUTA (IRC § 3121(a)(5)(A))
          fitPreTaxCents += d.amountCents;
          sitPreTaxCents += d.amountCents;
          break;

        case DeductionType.HEALTH_INSURANCE:
        case DeductionType.HSA:
        case DeductionType.FSA:
        case DeductionType.CAFETERIA_SECTION125:
          // IRC § 125, § 106, § 223: Pre-tax for all taxes
          fitPreTaxCents += d.amountCents;
          ficaPreTaxCents += d.amountCents;
          futaPreTaxCents += d.amountCents;
          sitPreTaxCents += d.amountCents;
          break;

        case DeductionType.OTHER_POST_TAX:
        default:
          postTaxCents += d.amountCents;
          break;
      }
    }

    return {
      fitPreTaxCents,
      ficaPreTaxCents,
      futaPreTaxCents,
      sitPreTaxCents,
      postTaxCents
    };
  }

  /**
   * Computes taxable wage bases for a specific employee in a pay period,
   * factoring in year-to-date (YTD) cumulative wages for statutory caps.
   */
  public static calculateTaxableWages(params: {
    grossWagesCents: bigint;
    deductions: DeductionInput[];
    priorYtdSubjectWages: {
      socialSecurityCents: bigint;
      medicareCents: bigint;
      futaCents: bigint;
      suiCents: bigint;
    };
    workLocationState: string;
  }): {
    preTaxSummary: ReturnType<typeof WageBaseService.computePreTaxDeductions>;
    taxableWages: TaxableWageResult[];
  } {
    const preTax = this.computePreTaxDeductions(params.deductions);
    const gross = params.grossWagesCents;

    // 1. Federal Income Tax Subject Wages
    const fitTaxableWages = gross > preTax.fitPreTaxCents ? gross - preTax.fitPreTaxCents : BigInt(0);

    // 2. FICA / Social Security (OASDI)
    const ssSubjectWages = gross > preTax.ficaPreTaxCents ? gross - preTax.ficaPreTaxCents : BigInt(0);
    const priorSs = params.priorYtdSubjectWages.socialSecurityCents;
    const ssCap = this.SOCIAL_SECURITY_WAGE_BASE_CENTS_2026;
    let ssTaxableWages = BigInt(0);
    let ssExcessWages = BigInt(0);

    if (priorSs >= ssCap) {
      ssTaxableWages = BigInt(0);
      ssExcessWages = ssSubjectWages;
    } else if (priorSs + ssSubjectWages > ssCap) {
      ssTaxableWages = ssCap - priorSs;
      ssExcessWages = ssSubjectWages - ssTaxableWages;
    } else {
      ssTaxableWages = ssSubjectWages;
      ssExcessWages = BigInt(0);
    }

    // 3. FICA / Medicare (HI) - No ceiling
    const medTaxableWages = gross > preTax.ficaPreTaxCents ? gross - preTax.ficaPreTaxCents : BigInt(0);

    // 4. Additional Medicare Tax (wages over $200k)
    const priorMed = params.priorYtdSubjectWages.medicareCents;
    const addlMedThreshold = this.ADDITIONAL_MEDICARE_THRESHOLD_CENTS;
    let addlMedTaxableWages = BigInt(0);

    if (priorMed >= addlMedThreshold) {
      addlMedTaxableWages = medTaxableWages;
    } else if (priorMed + medTaxableWages > addlMedThreshold) {
      addlMedTaxableWages = priorMed + medTaxableWages - addlMedThreshold;
    } else {
      addlMedTaxableWages = BigInt(0);
    }

    // 5. FUTA (Capped at $7,000)
    const futaSubjectWages = gross > preTax.futaPreTaxCents ? gross - preTax.futaPreTaxCents : BigInt(0);
    const priorFuta = params.priorYtdSubjectWages.futaCents;
    const futaCap = this.FUTA_WAGE_BASE_CENTS;
    let futaTaxableWages = BigInt(0);
    let futaExcessWages = BigInt(0);

    if (priorFuta >= futaCap) {
      futaTaxableWages = BigInt(0);
      futaExcessWages = futaSubjectWages;
    } else if (priorFuta + futaSubjectWages > futaCap) {
      futaTaxableWages = futaCap - priorFuta;
      futaExcessWages = futaSubjectWages - futaTaxableWages;
    } else {
      futaTaxableWages = futaSubjectWages;
      futaExcessWages = BigInt(0);
    }

    // 6. State Income Tax (SIT)
    const sitTaxableWages = gross > preTax.sitPreTaxCents ? gross - preTax.sitPreTaxCents : BigInt(0);

    // 7. State Unemployment (SUI)
    const state = params.workLocationState;
    const suiCap = this.STATE_SUI_WAGE_BASES_2026[state] || BigInt(700000);
    const suiSubjectWages = gross > preTax.futaPreTaxCents ? gross - preTax.futaPreTaxCents : BigInt(0);
    const priorSui = params.priorYtdSubjectWages.suiCents;
    let suiTaxableWages = BigInt(0);
    let suiExcessWages = BigInt(0);

    if (priorSui >= suiCap) {
      suiTaxableWages = BigInt(0);
      suiExcessWages = suiSubjectWages;
    } else if (priorSui + suiSubjectWages > suiCap) {
      suiTaxableWages = suiCap - priorSui;
      suiExcessWages = suiSubjectWages - suiTaxableWages;
    } else {
      suiTaxableWages = suiSubjectWages;
      suiExcessWages = BigInt(0);
    }

    const results: TaxableWageResult[] = [
      {
        taxType: PayrollTaxType.FEDERAL_INCOME,
        jurisdiction: 'US-FED',
        grossAmountCents: gross,
        subjectWagesCents: fitTaxableWages,
        excessWagesCents: BigInt(0),
        taxableWagesCents: fitTaxableWages
      },
      {
        taxType: PayrollTaxType.SOCIAL_SECURITY,
        jurisdiction: 'US-FED',
        grossAmountCents: gross,
        subjectWagesCents: ssSubjectWages,
        excessWagesCents: ssExcessWages,
        taxableWagesCents: ssTaxableWages
      },
      {
        taxType: PayrollTaxType.MEDICARE,
        jurisdiction: 'US-FED',
        grossAmountCents: gross,
        subjectWagesCents: medTaxableWages,
        excessWagesCents: BigInt(0),
        taxableWagesCents: medTaxableWages
      },
      {
        taxType: PayrollTaxType.ADDITIONAL_MEDICARE,
        jurisdiction: 'US-FED',
        grossAmountCents: gross,
        subjectWagesCents: medTaxableWages,
        excessWagesCents: medTaxableWages - addlMedTaxableWages,
        taxableWagesCents: addlMedTaxableWages
      },
      {
        taxType: PayrollTaxType.FUTA,
        jurisdiction: 'US-FED',
        grossAmountCents: gross,
        subjectWagesCents: futaSubjectWages,
        excessWagesCents: futaExcessWages,
        taxableWagesCents: futaTaxableWages
      },
      {
        taxType: PayrollTaxType.STATE_INCOME,
        jurisdiction: state,
        grossAmountCents: gross,
        subjectWagesCents: sitTaxableWages,
        excessWagesCents: BigInt(0),
        taxableWagesCents: sitTaxableWages
      },
      {
        taxType: PayrollTaxType.STATE_UNEMPLOYMENT,
        jurisdiction: state,
        grossAmountCents: gross,
        subjectWagesCents: suiSubjectWages,
        excessWagesCents: suiExcessWages,
        taxableWagesCents: suiTaxableWages
      }
    ];

    return {
      preTaxSummary: preTax,
      taxableWages: results
    };
  }
}
