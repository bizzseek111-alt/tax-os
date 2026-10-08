/**
 * Autonomous TaxOS — Illinois Department of Revenue Form IL-1040 Engine
 * Workstream 3: Phase 3
 * 
 * Statutory Authority:
 * - Illinois Constitution Art. IX, § 3 (Constitutional Flat Tax Mandate)
 * - 35 ILCS 5/201(b)(14) (Flat Individual Income Tax Rate: 4.95%)
 * - 35 ILCS 5/203(a)(2)(F) (100% Subtraction for Federally Taxed Retirement/Pension Income)
 * - 35 ILCS 5/204(b) (Standard Exemption: $2,775 per person)
 * - 35 ILCS 5/601 (Credit for Taxes Paid to Other States - Schedule CR)
 */

import { StateTaxModule } from './types';
import { FilingStatus, StateTaxInput, StateTaxResult, CalculationLineageNode } from '../types';
import { TaxMoney } from '../money';
import { TaxParameterRegistry } from '../parameterRegistry';

export class IllinoisTaxModule implements StateTaxModule {
  public readonly jurisdiction = 'US-IL';
  public readonly stateName = 'Illinois';
  public readonly formName = 'IL Form IL-1040';

  public calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    const params = TaxParameterRegistry.getIllinoisParameters();

    // 1. Starting Income: Federal AGI (IL Form IL-1040 Line 1)
    const startingIncomeCents = input.federalAgiCents;
    formLineBreakdown['IL_1040:line_1'] = startingIncomeCents;

    // 2. Illinois Additions (IL-1040 Line 2)
    const stateAdditionsCents = input.customAdditionsCents || 0n;
    formLineBreakdown['IL_1040:line_2'] = stateAdditionsCents;

    // 3. Illinois Subtractions (IL-1040 Line 5 / Schedule M)
    // 35 ILCS 5/203(a)(2)(F): 100% subtraction for qualified retirement/pension income
    let pensionSubtractionCents = 0n;
    if (input.pensionIncomeCents && input.pensionIncomeCents > 0) {
      pensionSubtractionCents = BigInt(input.pensionIncomeCents);
    }
    const stateSubtractionsCents = pensionSubtractionCents + (input.customSubtractionsCents || 0n);
    formLineBreakdown['IL_1040:line_5'] = stateSubtractionsCents;

    // 4. Base Income (IL-1040 Line 9)
    const stateAgiCents = startingIncomeCents + stateAdditionsCents - stateSubtractionsCents;
    formLineBreakdown['IL_1040:line_9'] = stateAgiCents;
    lineage['ilBaseIncome'] = {
      field: 'ilBaseIncome',
      valueCents: stateAgiCents,
      formulaDescription: 'Federal AGI + IL Additions - IL Subtractions (including 100% pension subtraction)',
      ruleParameters: {
        additions: stateAdditionsCents.toString(),
        pensionSubtraction: pensionSubtractionCents.toString(),
      },
      statutoryAuthority: '35 ILCS 5/203',
      formLineRef: 'IL Form IL-1040, Line 9',
      sourceFactIds: [],
    };

    // 5. Exemption Allowance (IL-1040 Line 10)
    // Basic exemption of $2,775 per person (taxpayer + spouse if joint)
    const personCount = (filingStatus === 'MARRIED_FILING_JOINTLY' || filingStatus === 'QUALIFYING_SURVIVING_SPOUSE') ? 2 : 1;
    const stateExemptionsCents = BigInt(personCount) * params.basicExemptionPerPersonCents;
    formLineBreakdown['IL_1040:line_10'] = stateExemptionsCents;

    // 6. Net Income (IL-1040 Line 11)
    const stateTaxableIncomeCents = TaxMoney.max(0n, stateAgiCents - stateExemptionsCents);
    formLineBreakdown['IL_1040:line_11'] = stateTaxableIncomeCents;
    lineage['ilNetIncome'] = {
      field: 'ilNetIncome',
      valueCents: stateTaxableIncomeCents,
      formulaDescription: 'IL Base Income (Line 9) - Exemption Allowance (Line 10)',
      ruleParameters: { exemption: stateExemptionsCents.toString() },
      statutoryAuthority: '35 ILCS 5/204(b)',
      formLineRef: 'IL Form IL-1040, Line 11',
      sourceFactIds: [],
    };

    // 7. Flat Tax Calculation: 4.95% (IL-1040 Line 12)
    const stateGrossTaxCents = TaxMoney.multiplyBps(stateTaxableIncomeCents, params.flatRateBps);
    formLineBreakdown['IL_1040:line_12'] = stateGrossTaxCents;
    lineage['ilGrossTax'] = {
      field: 'ilGrossTax',
      valueCents: stateGrossTaxCents,
      formulaDescription: 'Flat 4.95% tax on IL Net Income under 35 ILCS 5/201(b)(14)',
      ruleParameters: { rateBps: params.flatRateBps, taxableIncome: stateTaxableIncomeCents.toString() },
      statutoryAuthority: '35 ILCS 5/201(b)(14)',
      formLineRef: 'IL Form IL-1040, Line 12',
      sourceFactIds: [],
    };

    // 8. Credit for Taxes Paid to Other States (Schedule CR / Line 15)
    let otherStateTaxCreditCents = 0n;
    if (input.outOfStateTaxPaidCents && input.outOfStateTaxPaidCents > 0n) {
      otherStateTaxCreditCents = TaxMoney.min(input.outOfStateTaxPaidCents, stateGrossTaxCents);
    }
    formLineBreakdown['IL_1040:line_15'] = otherStateTaxCreditCents;

    const netStateTaxCents = TaxMoney.max(0n, stateGrossTaxCents - otherStateTaxCreditCents);
    formLineBreakdown['IL_1040:line_24'] = netStateTaxCents;

    // 9. Withholding & Payments (IL-1040 Lines 25 & 26)
    const stateWithholdingCents = BigInt(input.stateWithholdingCents || 0);
    const stateEstimatedPaymentsCents = BigInt(input.stateEstimatedPaymentsCents || 0);
    const totalStatePaymentsCents = stateWithholdingCents + stateEstimatedPaymentsCents;

    formLineBreakdown['IL_1040:line_25'] = stateWithholdingCents;
    formLineBreakdown['IL_1040:line_26'] = stateEstimatedPaymentsCents;
    formLineBreakdown['IL_1040:line_32'] = totalStatePaymentsCents;

    // 10. Refund vs Balance Due (IL-1040 Lines 36 & 39)
    let stateRefundCents = 0n;
    let stateBalanceDueCents = 0n;

    if (totalStatePaymentsCents >= netStateTaxCents) {
      stateRefundCents = totalStatePaymentsCents - netStateTaxCents;
      formLineBreakdown['IL_1040:line_36'] = stateRefundCents;
    } else {
      stateBalanceDueCents = netStateTaxCents - totalStatePaymentsCents;
      formLineBreakdown['IL_1040:line_39'] = stateBalanceDueCents;
    }

    return {
      jurisdiction: 'US-IL',
      stateName: this.stateName,
      formName: this.formName,
      taxYear: input.taxYear,
      residencyStatus: input.residencyStatus,
      startingIncomeCents,
      stateAdditionsCents,
      stateSubtractionsCents,
      stateAgiCents,
      stateDeductionsCents: 0n,
      stateExemptionsCents,
      stateTaxableIncomeCents,
      stateGrossTaxCents,
      stateCreditsCents: 0n,
      otherStateTaxCreditCents,
      netStateTaxCents,
      stateWithholdingCents,
      stateEstimatedPaymentsCents,
      totalStatePaymentsCents,
      stateRefundCents,
      stateBalanceDueCents,
      lineage,
      formLineBreakdown,
    };
  }
}
