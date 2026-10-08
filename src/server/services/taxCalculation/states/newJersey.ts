/**
 * Autonomous TaxOS — New Jersey Division of Taxation Form NJ-1040 Engine
 * Workstream 3: Phase 3
 * 
 * Statutory Authority:
 * - New Jersey Gross Income Tax Act (N.J. Stat. Ann. § 54A:1-1 et seq.)
 * - N.J. Stat. Ann. § 54A:2-1 (Progressive Rates 1.4% - 10.75%)
 * - N.J. Stat. Ann. § 54A:3-1 (Personal Exemptions: $1,000 Single / $2,000 Joint)
 * - N.J. Stat. Ann. § 54A:4-1 (Credit for Taxes Paid to Other Jurisdictions - Schedule NJ-COJ)
 * 
 * Non-Conformity Notice:
 * New Jersey does NOT conform to federal AGI or federal standard/itemized deductions.
 * NJ Gross Income is calculated independently from gross statutory income categories.
 */

import { StateTaxModule } from './types';
import { FilingStatus, StateTaxInput, StateTaxResult, CalculationLineageNode } from '../types';
import { TaxMoney } from '../money';
import { TaxParameterRegistry } from '../parameterRegistry';

export class NewJerseyTaxModule implements StateTaxModule {
  public readonly jurisdiction = 'US-NJ';
  public readonly stateName = 'New Jersey';
  public readonly formName = 'NJ Form NJ-1040';

  public calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    const params = TaxParameterRegistry.getNewJerseyParameters(filingStatus);

    // 1. NJ Gross Income Compilation (N.J. Stat. Ann. § 54A:5-1)
    // In NJ, gross wages come from W-2 Box 16 or Box 1
    let njWagesCents = 0n;
    for (const w2 of input.w2s) {
      njWagesCents += (w2.stateCode === 'NJ' && w2.stateWagesCents !== undefined)
        ? w2.stateWagesCents
        : w2.wagesCents;
    }
    formLineBreakdown['NJ_1040:line_15'] = njWagesCents;

    // Net profits from business (N.J. Stat. Ann. § 54A:5-1(b))
    let njBusinessProfitsCents = 0n;
    if (input.scheduleC) {
      // Calculate gross receipts minus ordinary expenses; NJ does not allow SE deduction or QBI
      let totalExp = 0n;
      for (const val of Object.values(input.scheduleC.expenses || {})) {
        if (val) totalExp += val;
      }
      const net = input.scheduleC.grossReceiptsCents - (input.scheduleC.costOfGoodsSoldCents || 0n) - totalExp;
      njBusinessProfitsCents = TaxMoney.max(0n, net);
    }
    formLineBreakdown['NJ_1040:line_18'] = njBusinessProfitsCents;

    // Total NJ Gross Income (NJ Form NJ-1040 Line 29)
    const stateGrossIncomeCents = njWagesCents + njBusinessProfitsCents;
    formLineBreakdown['NJ_1040:line_29'] = stateGrossIncomeCents;
    lineage['njGrossIncome'] = {
      field: 'njGrossIncome',
      valueCents: stateGrossIncomeCents,
      formulaDescription: 'NJ Gross Wages (Line 15) + NJ Business Profit (Line 18) under NJ-GIT rules',
      ruleParameters: { wages: njWagesCents.toString(), business: njBusinessProfitsCents.toString() },
      statutoryAuthority: 'N.J. Stat. Ann. § 54A:5-1',
      formLineRef: 'NJ Form NJ-1040, Line 29',
      sourceFactIds: [],
    };

    // 2. Personal Exemptions (NJ Form NJ-1040 Line 30) - N.J. Stat. Ann. § 54A:3-1
    const stateExemptionsCents = params.personalExemptionCents;
    formLineBreakdown['NJ_1040:line_30'] = stateExemptionsCents;

    // 3. NJ Taxable Income (NJ Form NJ-1040 Line 39)
    // Note: NJ allows NO standard deduction or federal itemized deductions
    const stateTaxableIncomeCents = TaxMoney.max(0n, stateGrossIncomeCents - stateExemptionsCents);
    formLineBreakdown['NJ_1040:line_39'] = stateTaxableIncomeCents;
    lineage['njTaxableIncome'] = {
      field: 'njTaxableIncome',
      valueCents: stateTaxableIncomeCents,
      formulaDescription: 'NJ Gross Income (Line 29) - NJ Personal Exemptions (Line 30)',
      ruleParameters: { exemption: stateExemptionsCents.toString() },
      statutoryAuthority: 'N.J. Stat. Ann. § 54A:3-1',
      formLineRef: 'NJ Form NJ-1040, Line 39',
      sourceFactIds: [],
    };

    // 4. NJ Progressive Tax (NJ Form NJ-1040 Line 41)
    const stateGrossTaxCents = TaxMoney.calculateProgressiveTax(stateTaxableIncomeCents, params.brackets);
    formLineBreakdown['NJ_1040:line_41'] = stateGrossTaxCents;
    lineage['njGrossTax'] = {
      field: 'njGrossTax',
      valueCents: stateGrossTaxCents,
      formulaDescription: 'N.J. Stat. Ann. § 54A:2-1 progressive brackets (1.4% - 10.75%)',
      ruleParameters: { taxableIncome: stateTaxableIncomeCents.toString() },
      statutoryAuthority: 'N.J. Stat. Ann. § 54A:2-1',
      formLineRef: 'NJ Form NJ-1040, Line 41',
      sourceFactIds: [],
    };

    // 5. Credit for Taxes Paid to Other Jurisdictions (Schedule NJ-COJ / Line 43)
    let otherStateTaxCreditCents = 0n;
    if (input.outOfStateTaxPaidCents && input.outOfStateTaxPaidCents > 0n) {
      otherStateTaxCreditCents = TaxMoney.min(input.outOfStateTaxPaidCents, stateGrossTaxCents);
    }
    formLineBreakdown['NJ_1040:line_43'] = otherStateTaxCreditCents;

    const netStateTaxCents = TaxMoney.max(0n, stateGrossTaxCents - otherStateTaxCreditCents);
    formLineBreakdown['NJ_1040:line_46'] = netStateTaxCents;

    // 6. Withholding & Payments (NJ Form NJ-1040 Lines 54 & 55)
    const stateWithholdingCents = BigInt(input.stateWithholdingCents || 0);
    const stateEstimatedPaymentsCents = BigInt(input.stateEstimatedPaymentsCents || 0);
    const totalStatePaymentsCents = stateWithholdingCents + stateEstimatedPaymentsCents;

    formLineBreakdown['NJ_1040:line_54'] = stateWithholdingCents;
    formLineBreakdown['NJ_1040:line_55'] = stateEstimatedPaymentsCents;
    formLineBreakdown['NJ_1040:line_57'] = totalStatePaymentsCents;

    // 7. Refund vs Balance Due (NJ Form NJ-1040 Lines 58 & 61)
    let stateRefundCents = 0n;
    let stateBalanceDueCents = 0n;

    if (totalStatePaymentsCents >= netStateTaxCents) {
      stateRefundCents = totalStatePaymentsCents - netStateTaxCents;
      formLineBreakdown['NJ_1040:line_58'] = stateRefundCents;
    } else {
      stateBalanceDueCents = netStateTaxCents - totalStatePaymentsCents;
      formLineBreakdown['NJ_1040:line_61'] = stateBalanceDueCents;
    }

    return {
      jurisdiction: 'US-NJ',
      stateName: this.stateName,
      formName: this.formName,
      taxYear: input.taxYear,
      residencyStatus: input.residencyStatus,
      startingIncomeCents: stateGrossIncomeCents,
      stateAdditionsCents: 0n,
      stateSubtractionsCents: 0n,
      stateAgiCents: stateGrossIncomeCents,
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
