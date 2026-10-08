/**
 * Autonomous TaxOS — Massachusetts Department of Revenue Form 1 Engine
 * Workstream 3: Phase 3
 * 
 * Statutory Authority:
 * - Mass. Gen. Laws ch. 62, § 4 (Flat Part B Income Tax Rate: 5.0%)
 * - Mass. Const. amend. art. XLIV (Fair Share Amendment: 4.0% Surtax on Taxable Income > $1,000,000)
 * - Mass. Gen. Laws ch. 62, § 3(B)(b) (Personal Exemptions: $4,400 Single / $8,800 Joint)
 * - Mass. Gen. Laws ch. 62, § 6(a) (Credit for Taxes Paid to Other Jurisdictions - Schedule OJC)
 */

import { StateTaxModule } from './types';
import { FilingStatus, StateTaxInput, StateTaxResult, CalculationLineageNode } from '../types';
import { TaxMoney } from '../money';
import { TaxParameterRegistry } from '../parameterRegistry';

export class MassachusettsTaxModule implements StateTaxModule {
  public readonly jurisdiction = 'US-MA';
  public readonly stateName = 'Massachusetts';
  public readonly formName = 'MA Form 1';

  public calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    const params = TaxParameterRegistry.getMassachusettsParameters(filingStatus);

    // 1. Starting Income: Federal AGI (MA Form 1 Line 10)
    const startingIncomeCents = input.federalAgiCents;
    formLineBreakdown['MA_1:line_10'] = startingIncomeCents;

    // 2. MA Additions & Subtractions
    const stateAdditionsCents = input.customAdditionsCents || 0n;
    const stateSubtractionsCents = input.customSubtractionsCents || 0n;
    formLineBreakdown['MA_1:line_11'] = stateAdditionsCents;
    formLineBreakdown['MA_1:line_15'] = stateSubtractionsCents;

    // 3. MA Total Income
    const stateAgiCents = startingIncomeCents + stateAdditionsCents - stateSubtractionsCents;
    formLineBreakdown['MA_1:line_17'] = stateAgiCents;

    // 4. Personal Exemption (MA Form 1 Line 18) - M.G.L. c. 62, § 3(B)(b)
    const stateExemptionsCents = params.personalExemptionCents;
    formLineBreakdown['MA_1:line_18'] = stateExemptionsCents;

    // 5. MA Taxable Income (MA Form 1 Line 19)
    const stateTaxableIncomeCents = TaxMoney.max(0n, stateAgiCents - stateExemptionsCents);
    formLineBreakdown['MA_1:line_19'] = stateTaxableIncomeCents;
    lineage['maTaxableIncome'] = {
      field: 'maTaxableIncome',
      valueCents: stateTaxableIncomeCents,
      formulaDescription: 'MA AGI (Line 17) - Personal Exemption (Line 18)',
      ruleParameters: { exemption: stateExemptionsCents.toString() },
      statutoryAuthority: 'Mass. Gen. Laws ch. 62, § 3',
      formLineRef: 'MA Form 1, Line 19',
      sourceFactIds: [],
    };

    // 6. Base Tax: 5.0% Part B (MA Form 1 Line 20)
    const partBTaxCents = TaxMoney.multiplyBps(stateTaxableIncomeCents, params.partBRateBps);
    formLineBreakdown['MA_1:line_20'] = partBTaxCents;

    // 7. Fair Share Amendment 4.0% Surtax on income > $1,000,000 (MA Form 1 Line 28b / Schedule 4%)
    let fairShareSurtaxCents = 0n;
    if (stateTaxableIncomeCents > params.fairShareSurtaxThresholdCents) {
      const surtaxBase = stateTaxableIncomeCents - params.fairShareSurtaxThresholdCents;
      fairShareSurtaxCents = TaxMoney.multiplyBps(surtaxBase, params.fairShareSurtaxRateBps);
    }
    formLineBreakdown['MA_1:line_28b'] = fairShareSurtaxCents;

    const stateGrossTaxCents = partBTaxCents + fairShareSurtaxCents;
    formLineBreakdown['MA_1:line_32'] = stateGrossTaxCents;
    lineage['maGrossTax'] = {
      field: 'maGrossTax',
      valueCents: stateGrossTaxCents,
      formulaDescription: '5.0% Part B flat tax + 4.0% Fair Share Surtax on taxable income > $1M',
      ruleParameters: {
        partBTax: partBTaxCents.toString(),
        fairShareSurtax: fairShareSurtaxCents.toString(),
      },
      statutoryAuthority: 'Mass. Gen. Laws ch. 62, § 4; Mass. Const. amend. art. XLIV',
      formLineRef: 'MA Form 1, Line 32',
      sourceFactIds: [],
    };

    // 8. Credit for Taxes Paid to Other Jurisdictions (Schedule OJC / Line 39)
    let otherStateTaxCreditCents = 0n;
    if (input.outOfStateTaxPaidCents && input.outOfStateTaxPaidCents > 0n) {
      otherStateTaxCreditCents = TaxMoney.min(input.outOfStateTaxPaidCents, stateGrossTaxCents);
    }
    formLineBreakdown['MA_1:line_39'] = otherStateTaxCreditCents;

    const netStateTaxCents = TaxMoney.max(0n, stateGrossTaxCents - otherStateTaxCreditCents);
    formLineBreakdown['MA_1:line_44'] = netStateTaxCents;

    // 9. Withholding & Payments (MA Form 1 Lines 45 & 46)
    const stateWithholdingCents = BigInt(input.stateWithholdingCents || 0);
    const stateEstimatedPaymentsCents = BigInt(input.stateEstimatedPaymentsCents || 0);
    const totalStatePaymentsCents = stateWithholdingCents + stateEstimatedPaymentsCents;

    formLineBreakdown['MA_1:line_45'] = stateWithholdingCents;
    formLineBreakdown['MA_1:line_46'] = stateEstimatedPaymentsCents;
    formLineBreakdown['MA_1:line_50'] = totalStatePaymentsCents;

    // 10. Refund vs Balance Due (MA Form 1 Lines 51 & 54)
    let stateRefundCents = 0n;
    let stateBalanceDueCents = 0n;

    if (totalStatePaymentsCents >= netStateTaxCents) {
      stateRefundCents = totalStatePaymentsCents - netStateTaxCents;
      formLineBreakdown['MA_1:line_51'] = stateRefundCents;
    } else {
      stateBalanceDueCents = netStateTaxCents - totalStatePaymentsCents;
      formLineBreakdown['MA_1:line_54'] = stateBalanceDueCents;
    }

    return {
      jurisdiction: 'US-MA',
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
