/**
 * Autonomous TaxOS — New York State Department of Taxation and Finance Form IT-201 Engine
 * Workstream 3: Phase 3
 * 
 * Statutory Authority:
 * - New York Tax Law § 601 (Progressive Rates 4.0% - 10.9%)
 * - New York Tax Law § 612 (New York Adjusted Gross Income)
 * - New York Tax Law § 614 (New York Standard Deduction $8,000 / $16,050 / $11,200)
 * - New York Tax Law § 620 (Resident Credit for Taxes Paid to Another Jurisdiction - Form IT-112-R)
 */

import { StateTaxModule } from './types';
import { FilingStatus, StateTaxInput, StateTaxResult, CalculationLineageNode } from '../types';
import { TaxMoney } from '../money';
import { TaxParameterRegistry } from '../parameterRegistry';

export class NewYorkTaxModule implements StateTaxModule {
  public readonly jurisdiction = 'US-NY';
  public readonly stateName = 'New York';
  public readonly formName = 'NY Form IT-201';

  public calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    const params = TaxParameterRegistry.getNewYorkParameters(filingStatus);

    // 1. Starting Income: Federal AGI (NY Form IT-201 Line 19)
    const startingIncomeCents = input.federalAgiCents;
    formLineBreakdown['NY_IT201:line_19'] = startingIncomeCents;

    // 2. NY Additions & Subtractions (NY Tax Law § 612)
    const stateAdditionsCents = BigInt(input.customAdditionsCents || 0);
    const stateSubtractionsCents = BigInt(input.customSubtractionsCents || 0);
    formLineBreakdown['NY_IT201:line_23'] = stateAdditionsCents;
    formLineBreakdown['NY_IT201:line_32'] = stateSubtractionsCents;

    // 3. NY AGI (NY Form IT-201 Line 33)
    const stateAgiCents = startingIncomeCents + stateAdditionsCents - stateSubtractionsCents;
    formLineBreakdown['NY_IT201:line_33'] = stateAgiCents;
    lineage['nyAgi'] = {
      field: 'nyAgi',
      valueCents: stateAgiCents,
      formulaDescription: 'Federal AGI + NY Additions - NY Subtractions',
      ruleParameters: { additions: stateAdditionsCents.toString(), subtractions: stateSubtractionsCents.toString() },
      statutoryAuthority: 'NY Tax Law § 612',
      formLineRef: 'NY Form IT-201, Line 33',
      sourceFactIds: [],
    };

    // 4. NY Standard Deduction (NY Form IT-201 Line 34)
    const stateDeductionsCents = params.standardDeductionCents;
    formLineBreakdown['NY_IT201:line_34'] = stateDeductionsCents;

    // 5. NY Taxable Income (NY Form IT-201 Line 37)
    const stateTaxableIncomeCents = TaxMoney.max(0n, stateAgiCents - stateDeductionsCents);
    formLineBreakdown['NY_IT201:line_37'] = stateTaxableIncomeCents;
    lineage['nyTaxableIncome'] = {
      field: 'nyTaxableIncome',
      valueCents: stateTaxableIncomeCents,
      formulaDescription: 'NY AGI (Line 33) - NY Standard Deduction (Line 34)',
      ruleParameters: { standardDeduction: stateDeductionsCents.toString() },
      statutoryAuthority: 'NY Tax Law § 614',
      formLineRef: 'NY Form IT-201, Line 37',
      sourceFactIds: [],
    };

    // 6. NY Progressive Tax (NY Form IT-201 Line 39)
    const stateGrossTaxCents = TaxMoney.calculateProgressiveTax(stateTaxableIncomeCents, params.brackets);
    formLineBreakdown['NY_IT201:line_39'] = stateGrossTaxCents;
    lineage['nyGrossTax'] = {
      field: 'nyGrossTax',
      valueCents: stateGrossTaxCents,
      formulaDescription: 'NY Tax Law § 601 progressive brackets (4.0% - 10.9%)',
      ruleParameters: { taxableIncome: stateTaxableIncomeCents.toString() },
      statutoryAuthority: 'NY Tax Law § 601',
      formLineRef: 'NY Form IT-201, Line 39',
      sourceFactIds: [],
    };

    // 7. Resident Credit for Taxes Paid to Another Jurisdiction (Form IT-112-R / Line 41)
    let otherStateTaxCreditCents = 0n;
    if (input.outOfStateTaxPaidCents && input.outOfStateTaxPaidCents > 0n) {
      otherStateTaxCreditCents = TaxMoney.min(input.outOfStateTaxPaidCents, stateGrossTaxCents);
    }
    formLineBreakdown['NY_IT201:line_41'] = otherStateTaxCreditCents;

    const netStateTaxCents = TaxMoney.max(0n, stateGrossTaxCents - otherStateTaxCreditCents);
    formLineBreakdown['NY_IT201:line_46'] = netStateTaxCents;

    // 8. Withholding & Payments (NY Form IT-201 Lines 72 & 75)
    const stateWithholdingCents = BigInt(input.stateWithholdingCents || 0);
    const stateEstimatedPaymentsCents = BigInt(input.stateEstimatedPaymentsCents || 0);
    const totalStatePaymentsCents = stateWithholdingCents + stateEstimatedPaymentsCents;

    formLineBreakdown['NY_IT201:line_72'] = stateWithholdingCents;
    formLineBreakdown['NY_IT201:line_75'] = stateEstimatedPaymentsCents;
    formLineBreakdown['NY_IT201:line_76'] = totalStatePaymentsCents;

    // 9. Refund vs Balance Due (NY Form IT-201 Lines 77 & 80)
    let stateRefundCents = 0n;
    let stateBalanceDueCents = 0n;

    if (totalStatePaymentsCents >= netStateTaxCents) {
      stateRefundCents = totalStatePaymentsCents - netStateTaxCents;
      formLineBreakdown['NY_IT201:line_77'] = stateRefundCents;
    } else {
      stateBalanceDueCents = netStateTaxCents - totalStatePaymentsCents;
      formLineBreakdown['NY_IT201:line_80'] = stateBalanceDueCents;
    }

    return {
      jurisdiction: 'US-NY',
      stateName: this.stateName,
      formName: this.formName,
      taxYear: input.taxYear,
      residencyStatus: input.residencyStatus,
      startingIncomeCents,
      stateAdditionsCents,
      stateSubtractionsCents,
      stateAgiCents,
      stateDeductionsCents,
      stateExemptionsCents: 0n,
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
