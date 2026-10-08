/**
 * Autonomous TaxOS — California Franchise Tax Board (FTB) Form 540 Engine
 * Workstream 3: Phase 3
 * 
 * Statutory Authority:
 * - California Revenue and Taxation Code (CRTC) § 17041 (Progressive Rates 1.0% - 12.3%)
 * - CRTC § 17043 (Mental Health Services Surtax 1.0% on CA Taxable Income > $1,000,000)
 * - CRTC § 17215.4 (Non-conformity to IRC § 223 HSA deduction - required addition)
 * - CRTC § 17072 / § 17073 (California Standard Deduction $5,540 / $11,080)
 * - CRTC § 17054 (California Personal Exemption Credit $149 / $298)
 * - CRTC § 18001 (Credit for Taxes Paid to Another State - Schedule S)
 */

import { StateTaxModule } from './types';
import { FilingStatus, StateTaxInput, StateTaxResult, CalculationLineageNode } from '../types';
import { TaxMoney } from '../money';
import { TaxParameterRegistry } from '../parameterRegistry';

export class CaliforniaTaxModule implements StateTaxModule {
  public readonly jurisdiction = 'US-CA';
  public readonly stateName = 'California';
  public readonly formName = 'CA Form 540';

  public calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    const params = TaxParameterRegistry.getCaliforniaParameters(filingStatus);

    // 1. Starting Income: Federal AGI (CA Form 540 Line 13)
    const startingIncomeCents = input.federalAgiCents;
    formLineBreakdown['CA_540:line_13'] = startingIncomeCents;

    // 2. California Additions (Schedule CA 540 Part I)
    // Non-conformity additions: e.g. HSA deduction add-back, custom additions
    let stateAdditionsCents = BigInt(input.customAdditionsCents || 0);
    formLineBreakdown['CA_540:line_14'] = stateAdditionsCents;

    // 3. California Subtractions (Schedule CA 540 Part I)
    let stateSubtractionsCents = BigInt(input.customSubtractionsCents || 0);
    formLineBreakdown['CA_540:line_15'] = stateSubtractionsCents;

    // 4. California AGI (CA Form 540 Line 17)
    const stateAgiCents = startingIncomeCents + stateAdditionsCents - stateSubtractionsCents;
    formLineBreakdown['CA_540:line_17'] = stateAgiCents;
    lineage['caAgi'] = {
      field: 'caAgi',
      valueCents: stateAgiCents,
      formulaDescription: 'Federal AGI (Line 13) + CA Additions (Line 14) - CA Subtractions (Line 15)',
      ruleParameters: { additions: stateAdditionsCents.toString(), subtractions: stateSubtractionsCents.toString() },
      statutoryAuthority: 'Cal. Rev. & Tax. Code § 17072',
      formLineRef: 'CA Form 540, Line 17',
      sourceFactIds: [],
    };

    // 5. CA Deductions: Standard Deduction (CA Form 540 Line 18)
    const stateDeductionsCents = params.standardDeductionCents;
    formLineBreakdown['CA_540:line_18'] = stateDeductionsCents;

    // 6. CA Taxable Income (CA Form 540 Line 19)
    const stateTaxableIncomeCents = TaxMoney.max(0n, stateAgiCents - stateDeductionsCents);
    formLineBreakdown['CA_540:line_19'] = stateTaxableIncomeCents;
    lineage['caTaxableIncome'] = {
      field: 'caTaxableIncome',
      valueCents: stateTaxableIncomeCents,
      formulaDescription: 'CA AGI (Line 17) - CA Standard Deduction (Line 18)',
      ruleParameters: { standardDeduction: stateDeductionsCents.toString() },
      statutoryAuthority: 'Cal. Rev. & Tax. Code § 17073',
      formLineRef: 'CA Form 540, Line 19',
      sourceFactIds: [],
    };

    // 7. CA Progressive Bracket Tax (CA Form 540 Line 31)
    let baseTaxCents = TaxMoney.calculateProgressiveTax(stateTaxableIncomeCents, params.brackets);

    // Mental Health Services Tax: 1% surtax on taxable income exceeding $1,000,000 (CRTC § 17043)
    let mentalHealthTaxCents = 0n;
    if (stateTaxableIncomeCents > params.mentalHealthSurtaxThresholdCents) {
      const surtaxBase = stateTaxableIncomeCents - params.mentalHealthSurtaxThresholdCents;
      mentalHealthTaxCents = TaxMoney.multiplyBps(surtaxBase, params.mentalHealthSurtaxRateBps);
    }

    const stateGrossTaxCents = baseTaxCents + mentalHealthTaxCents;
    formLineBreakdown['CA_540:line_31'] = stateGrossTaxCents;
    lineage['caGrossTax'] = {
      field: 'caGrossTax',
      valueCents: stateGrossTaxCents,
      formulaDescription: 'CRTC § 17041 progressive brackets (1%-12.3%) + CRTC § 17043 Mental Health Surtax (1% over $1M)',
      ruleParameters: {
        baseTax: baseTaxCents.toString(),
        mentalHealthTax: mentalHealthTaxCents.toString(),
      },
      statutoryAuthority: 'Cal. Rev. & Tax. Code §§ 17041, 17043',
      formLineRef: 'CA Form 540, Line 31',
      sourceFactIds: [],
    };

    // 8. Credits: Personal Exemption Credit & Other-State Tax Credit (Schedule S)
    const stateExemptionsCents = params.personalExemptionCreditCents;
    formLineBreakdown['CA_540:line_32'] = stateExemptionsCents;

    let taxAfterExemptions = TaxMoney.max(0n, stateGrossTaxCents - stateExemptionsCents);

    // Other State Tax Credit (CRTC § 18001 / Schedule S)
    let otherStateTaxCreditCents = 0n;
    if (input.outOfStateTaxPaidCents && input.outOfStateTaxPaidCents > 0n) {
      // Credit limited to lesser of actual out of state tax or CA tax liability
      otherStateTaxCreditCents = TaxMoney.min(input.outOfStateTaxPaidCents, taxAfterExemptions);
      taxAfterExemptions = TaxMoney.max(0n, taxAfterExemptions - otherStateTaxCreditCents);
    }

    const netStateTaxCents = taxAfterExemptions;
    formLineBreakdown['CA_540:line_48'] = netStateTaxCents;

    // 9. Withholding & Payments
    const stateWithholdingCents = BigInt(input.stateWithholdingCents || 0);
    const stateEstimatedPaymentsCents = BigInt(input.stateEstimatedPaymentsCents || 0);
    const totalStatePaymentsCents = stateWithholdingCents + stateEstimatedPaymentsCents;

    formLineBreakdown['CA_540:line_71'] = stateWithholdingCents;
    formLineBreakdown['CA_540:line_72'] = stateEstimatedPaymentsCents;
    formLineBreakdown['CA_540:line_78'] = totalStatePaymentsCents;

    // 10. Refund vs Balance Due
    let stateRefundCents = 0n;
    let stateBalanceDueCents = 0n;

    if (totalStatePaymentsCents >= netStateTaxCents) {
      stateRefundCents = totalStatePaymentsCents - netStateTaxCents;
      formLineBreakdown['CA_540:line_99'] = stateRefundCents;
    } else {
      stateBalanceDueCents = netStateTaxCents - totalStatePaymentsCents;
      formLineBreakdown['CA_540:line_104'] = stateBalanceDueCents;
    }

    return {
      jurisdiction: 'US-CA',
      stateName: this.stateName,
      formName: this.formName,
      taxYear: input.taxYear,
      residencyStatus: input.residencyStatus,
      startingIncomeCents,
      stateAdditionsCents,
      stateSubtractionsCents,
      stateAgiCents,
      stateDeductionsCents,
      stateExemptionsCents,
      stateTaxableIncomeCents,
      stateGrossTaxCents,
      stateCreditsCents: stateExemptionsCents,
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
