/**
 * Autonomous Tax OS — Tax Twin & Year-Round Planning Service
 * Workstream 15: Continuous digital twin, what-if simulations, quarterly safe harbor calculations.
 */

export interface TaxTwinSnapshot {
  taxYear: number;
  projectedGrossIncomeCents: number;
  projectedEffectiveRatePercent: number;
  safeHarborThresholdCents: number;
  priorYearTaxCents: number;
}

export class TaxTwinService {
  /**
   * Simulates Section 179 equipment expensing across federal and state boundaries.
   */
  public static simulateSection179(
    equipmentCostCents: number,
    stateJurisdiction: 'US-CA' | 'US-NY' | 'US-FED'
  ): {
    federalDeductionCents: number;
    stateDeductionCents: number;
    estimatedTaxSavingsCents: number;
    stateNonConformityExcessCents: number;
  } {
    const federalDeductionCents = equipmentCostCents;
    let stateDeductionCents = equipmentCostCents;
    let stateNonConformityExcessCents = 0;

    // California Section 179 cap is $25,000 (Cal. RTC § 17255)
    if (stateJurisdiction === 'US-CA') {
      const caCapCents = 2500000;
      stateDeductionCents = Math.min(equipmentCostCents, caCapCents);
      stateNonConformityExcessCents = Math.max(0, equipmentCostCents - caCapCents);
    }

    const federalSavings = Math.round(federalDeductionCents * 0.24);
    const stateSavings = Math.round(stateDeductionCents * 0.093);
    const estimatedTaxSavingsCents = federalSavings + stateSavings;

    return {
      federalDeductionCents,
      stateDeductionCents,
      estimatedTaxSavingsCents,
      stateNonConformityExcessCents
    };
  }

  /**
   * Simulates S-Corporation tax savings (FICA tax reduction on distributions).
   */
  public static simulateSCorpElection(
    netProfitCents: number,
    reasonableSalaryCents: number
  ): {
    distributionsCents: number;
    ficaSavingsCents: number;
  } {
    const distributionsCents = Math.max(0, netProfitCents - reasonableSalaryCents);
    // 15.3% SE/FICA tax saved on distribution portion
    const ficaSavingsCents = Math.round(distributionsCents * 0.153);

    return {
      distributionsCents,
      ficaSavingsCents
    };
  }

  /**
   * Computes Form 1040-ES quarterly estimated payments under IRC § 6654 Safe Harbor rules.
   */
  public static calculateQuarterlySafeHarbor(
    priorYearTaxCents: number,
    projectedCurrentYearTaxCents: number,
    method: 'PRIOR_YEAR_110' | 'CURRENT_YEAR_90' = 'PRIOR_YEAR_110'
  ): {
    totalRequiredAnnualPaymentCents: number;
    quarterlyVoucherCents: number;
    deadlines: Array<{ quarter: string; dueDate: string; amountCents: number }>;
  } {
    const totalRequiredAnnualPaymentCents = method === 'PRIOR_YEAR_110'
      ? Math.round(priorYearTaxCents * 1.10)
      : Math.round(projectedCurrentYearTaxCents * 0.90);

    const quarterlyVoucherCents = Math.round(totalRequiredAnnualPaymentCents / 4);

    return {
      totalRequiredAnnualPaymentCents,
      quarterlyVoucherCents,
      deadlines: [
        { quarter: 'Q1', dueDate: 'April 15, 2026', amountCents: quarterlyVoucherCents },
        { quarter: 'Q2', dueDate: 'June 16, 2026', amountCents: quarterlyVoucherCents },
        { quarter: 'Q3', dueDate: 'September 15, 2026', amountCents: quarterlyVoucherCents },
        { quarter: 'Q4', dueDate: 'January 15, 2027', amountCents: quarterlyVoucherCents }
      ]
    };
  }
}
