/**
 * Autonomous TaxOS — Deterministic Federal Tax Calculation Engine
 * Workstream 3: Phase 3
 * 
 * Implements pure deterministic calculation of Form 1040, Schedule 1, Schedule C,
 * Schedule SE, Form 8995 (QBI), and Form 8812 (CTC) for Tax Year 2026.
 * Zero LLM reliance. Zero floating point drift.
 */

import { TaxMoney } from './money';
import { TaxParameterRegistry } from './parameterRegistry';
import {
  FederalTaxInput,
  FederalTaxResult,
  SelfEmploymentTaxResult,
  QbiResult,
  FederalCreditsResult,
  CalculationLineageNode,
  ScheduleCExpenseCategory,
} from './types';

export class FederalTaxEngine {
  /**
   * Run authoritative deterministic federal tax calculation.
   */
  public static calculate(input: FederalTaxInput): FederalTaxResult {
    const lineage: Record<string, CalculationLineageNode> = {};
    const formLineBreakdown: Record<string, bigint> = {};

    // 1. W-2 Income & Withholding Aggregation
    let w2WagesTotalCents = 0n;
    let federalWithholdingTotalCents = 0n;
    let w2SocialSecurityWagesTotalCents = 0n;
    const w2SourceFactIds: string[] = [];

    for (const w2 of (input.w2s || [])) {
      const wages = BigInt(w2.wagesCents || 0);
      const withholding = BigInt(w2.federalWithholdingCents || 0);
      w2WagesTotalCents += wages;
      federalWithholdingTotalCents += withholding;
      w2SocialSecurityWagesTotalCents += w2.socialSecurityWagesCents !== undefined ? BigInt(w2.socialSecurityWagesCents) : wages;
      if (w2.sourceFactId) {
        w2SourceFactIds.push(w2.sourceFactId);
      }
    }

    formLineBreakdown['1040:line_1z'] = w2WagesTotalCents;
    lineage['w2WagesTotal'] = {
      field: 'w2WagesTotal',
      valueCents: w2WagesTotalCents,
      formulaDescription: 'Sum of Box 1 wages from all confirmed Form W-2 records',
      ruleParameters: { count: (input.w2s || []).length },
      statutoryAuthority: 'IRC § 61(a)(1)',
      formLineRef: 'Form 1040, Line 1z',
      sourceFactIds: w2SourceFactIds,
    };

    // 2. Schedule C Net Profit Calculation
    let scheduleCNetProfitCents = 0n;
    let totalScheduleCExpensesCents = 0n;
    if (input.scheduleC) {
      const grossReceipts = BigInt(input.scheduleC.grossReceiptsCents || 0) - BigInt(input.scheduleC.returnsAndAllowancesCents || 0);
      const cogs = BigInt(input.scheduleC.costOfGoodsSoldCents || 0);
      const grossIncome = grossReceipts - cogs;

      const expenseEntries = Object.entries(input.scheduleC.expenses || {}) as [ScheduleCExpenseCategory, any][];
      for (const [, amount] of expenseEntries) {
        if (amount) {
          totalScheduleCExpensesCents += BigInt(amount);
        }
      }

      scheduleCNetProfitCents = grossIncome - totalScheduleCExpensesCents;

      formLineBreakdown['Sch_C:line_1'] = BigInt(input.scheduleC.grossReceiptsCents || 0);
      formLineBreakdown['Sch_C:line_7'] = grossIncome;
      formLineBreakdown['Sch_C:line_28'] = totalScheduleCExpensesCents;
      formLineBreakdown['Sch_C:line_31'] = scheduleCNetProfitCents;
      formLineBreakdown['Sch_1:line_3'] = scheduleCNetProfitCents;

      lineage['scheduleCNetProfit'] = {
        field: 'scheduleCNetProfit',
        valueCents: scheduleCNetProfitCents,
        formulaDescription: 'Gross Receipts - Returns - COGS - Total Ordinary and Necessary Expenses',
        ruleParameters: { businessName: input.scheduleC.businessName, totalExpenses: totalScheduleCExpensesCents.toString() },
        statutoryAuthority: 'IRC § 162(a)',
        formLineRef: 'Schedule C Line 31, Schedule 1 Line 3',
        sourceFactIds: [],
      };
    }

    // 3. Investment Income
    const taxableInterestCents = BigInt(input.investmentIncome?.taxableInterestCents || 0);
    const ordinaryDividendsCents = BigInt(input.investmentIncome?.ordinaryDividendsCents || 0);
    if (taxableInterestCents > 0n) formLineBreakdown['1040:line_2b'] = taxableInterestCents;
    if (ordinaryDividendsCents > 0n) formLineBreakdown['1040:line_3b'] = ordinaryDividendsCents;

    // 4. Total Income (Form 1040 Line 9)
    // Note: Net business loss reduces total income under IRC § 62(a)(1)
    const totalIncomeCents = w2WagesTotalCents + scheduleCNetProfitCents + taxableInterestCents + ordinaryDividendsCents;
    formLineBreakdown['1040:line_9'] = totalIncomeCents;
    lineage['totalIncome'] = {
      field: 'totalIncome',
      valueCents: totalIncomeCents,
      formulaDescription: 'Sum of Wages + Schedule C Profit/Loss + Interest + Dividends',
      ruleParameters: {},
      statutoryAuthority: 'IRC § 61',
      formLineRef: 'Form 1040, Line 9',
      sourceFactIds: [],
    };

    // 5. Schedule SE: Self-Employment Tax Calculation
    const seParams = TaxParameterRegistry.getSelfEmploymentParameters();
    let seEarningsCents = 0n;
    let oasdiTaxableCents = 0n;
    let oasdiTaxCents = 0n;
    let medicareTaxCents = 0n;
    let additionalMedicareTaxCents = 0n;
    let totalSelfEmploymentTaxCents = 0n;
    let deductibleSeTaxCents = 0n;

    if (scheduleCNetProfitCents > 0n) {
      // Net earnings from SE: 92.35% (IRC § 1402(a)(12))
      seEarningsCents = TaxMoney.multiplyBps(scheduleCNetProfitCents, seParams.netEarningsMultiplierBps);

      // De minimis exception: if SE earnings < $400, no SE tax (IRC § 1402(b)(2))
      if (seEarningsCents >= 40_000n) {
        // OASDI: Capped at Social Security wage base minus W-2 SS wages already paid
        const remainingOasdiCap = TaxMoney.max(0n, seParams.oasdiWageBaseCents - w2SocialSecurityWagesTotalCents);
        oasdiTaxableCents = TaxMoney.min(seEarningsCents, remainingOasdiCap);
        oasdiTaxCents = TaxMoney.multiplyBps(oasdiTaxableCents, seParams.oasdiRateBps);

        // Medicare: 2.9% uncapped
        medicareTaxCents = TaxMoney.multiplyBps(seEarningsCents, seParams.medicareRateBps);

        // Additional Medicare: 0.9% on combined compensation above threshold (Form 8959)
        const addMedThreshold = seParams.additionalMedicareThresholds[input.filingStatus];
        const combinedCompensation = w2WagesTotalCents + seEarningsCents;
        if (combinedCompensation > addMedThreshold) {
          const totalExcess = combinedCompensation - addMedThreshold;
          // SE portion of excess over threshold
          const w2Excess = TaxMoney.max(0n, w2WagesTotalCents - addMedThreshold);
          const seExcess = TaxMoney.min(totalExcess - w2Excess, seEarningsCents);
          if (seExcess > 0n) {
            additionalMedicareTaxCents = TaxMoney.multiplyBps(seExcess, seParams.additionalMedicareRateBps);
          }
        }

        totalSelfEmploymentTaxCents = oasdiTaxCents + medicareTaxCents + additionalMedicareTaxCents;

        // Deductible SE Tax: 50% of OASDI + standard Medicare (IRC § 164(f))
        deductibleSeTaxCents = TaxMoney.multiplyFraction(oasdiTaxCents + medicareTaxCents, 1n, 2n);

        formLineBreakdown['Sch_SE:line_4c'] = seEarningsCents;
        formLineBreakdown['Sch_SE:line_5a'] = oasdiTaxCents;
        formLineBreakdown['Sch_SE:line_6'] = medicareTaxCents;
        formLineBreakdown['Sch_SE:line_12'] = totalSelfEmploymentTaxCents;
        formLineBreakdown['Sch_1:line_15'] = deductibleSeTaxCents;
        formLineBreakdown['1040:line_23'] = totalSelfEmploymentTaxCents;

        lineage['selfEmploymentTax'] = {
          field: 'selfEmploymentTax',
          valueCents: totalSelfEmploymentTaxCents,
          formulaDescription: 'OASDI (12.4% up to cap) + Medicare (2.9%) + Additional Medicare (0.9%)',
          ruleParameters: {
            seEarnings: seEarningsCents.toString(),
            oasdiTaxable: oasdiTaxableCents.toString(),
            oasdiTax: oasdiTaxCents.toString(),
            medicareTax: medicareTaxCents.toString(),
          },
          statutoryAuthority: 'IRC §§ 1401, 1402',
          formLineRef: 'Schedule SE Line 12, Schedule 2 Line 4',
          sourceFactIds: [],
        };
      }
    }

    const selfEmployment: SelfEmploymentTaxResult = {
      netProfitCents: scheduleCNetProfitCents,
      seEarningsCents,
      oasdiTaxableCents,
      oasdiTaxCents,
      medicareTaxCents,
      additionalMedicareTaxCents,
      totalSelfEmploymentTaxCents,
      deductibleSeTaxCents,
    };

    // 6. Adjustments to Income (Schedule 1 Part II)
    const educatorExpenses = BigInt(input.adjustments?.educatorExpensesCents || 0);
    const hsaDeduction = BigInt(input.adjustments?.hsaDeductionCents || 0);
    const studentLoanInterest = BigInt(input.adjustments?.studentLoanInterestCents || 0);
    const iraDeduction = BigInt(input.adjustments?.iraDeductionCents || 0);

    const totalAdjustmentsCents = deductibleSeTaxCents + educatorExpenses + hsaDeduction + studentLoanInterest + iraDeduction;
    formLineBreakdown['Sch_1:line_26'] = totalAdjustmentsCents;
    formLineBreakdown['1040:line_10'] = totalAdjustmentsCents;

    // 7. Adjusted Gross Income (Form 1040 Line 11)
    const adjustedGrossIncomeCents = totalIncomeCents - totalAdjustmentsCents;
    formLineBreakdown['1040:line_11'] = adjustedGrossIncomeCents;
    lineage['adjustedGrossIncome'] = {
      field: 'adjustedGrossIncome',
      valueCents: adjustedGrossIncomeCents,
      formulaDescription: 'Total Income (Line 9) - Total Adjustments (Schedule 1 Line 26)',
      ruleParameters: { totalAdjustments: totalAdjustmentsCents.toString() },
      statutoryAuthority: 'IRC § 62',
      formLineRef: 'Form 1040, Line 11',
      sourceFactIds: [],
    };

    // 8. Standard vs Itemized Deduction (Form 1040 Line 12)
    const stdDeductionParam = TaxParameterRegistry.getFederalStandardDeduction(input.filingStatus);
    const standardDeductionCents = stdDeductionParam.value;

    let isItemized = false;
    let allowedDeductionCents = standardDeductionCents;

    if (input.isItemizedClaimed && BigInt(input.itemizedDeductionCents || 0) > standardDeductionCents) {
      isItemized = true;
      allowedDeductionCents = BigInt(input.itemizedDeductionCents!);
    }
    formLineBreakdown['1040:line_12'] = allowedDeductionCents;

    // 9. Qualified Business Income Deduction (QBI - IRC § 199A / Form 8995)
    let qbiResult: QbiResult = {
      qualifiedBusinessIncomeCents: 0n,
      tentativeQbiDeductionCents: 0n,
      phaseoutApplied: false,
      phaseoutReductionCents: 0n,
      allowedQbiDeductionCents: 0n,
    };

    const taxableIncomeBeforeQbi = TaxMoney.max(0n, adjustedGrossIncomeCents - allowedDeductionCents);

    if (scheduleCNetProfitCents > 0n) {
      const qbiParams = TaxParameterRegistry.getQbiParameters(input.filingStatus);
      // Net QBI = Net Profit - Deductible SE Tax (Treas. Reg. § 1.199A-3(b)(1)(vi))
      const netQbi = TaxMoney.max(0n, scheduleCNetProfitCents - deductibleSeTaxCents);
      const tentativeQbiDeduction = TaxMoney.multiplyBps(netQbi, qbiParams.deductionRateBps); // 20%

      // Overall limitation: 20% of (Taxable Income before QBI - Net Capital Gains)
      const overallCap = TaxMoney.multiplyBps(taxableIncomeBeforeQbi, qbiParams.deductionRateBps);

      let allowedQbi = TaxMoney.min(tentativeQbiDeduction, overallCap);

      // Phaseout check for high earners
      let phaseoutApplied = false;
      let phaseoutReduction = 0n;

      if (taxableIncomeBeforeQbi > qbiParams.thresholdCents) {
        phaseoutApplied = true;
        const excess = taxableIncomeBeforeQbi - qbiParams.thresholdCents;
        if (excess >= qbiParams.phaseoutRangeCents) {
          // If SSTB and completely phased out, QBI deduction is 0
          if (input.scheduleC?.isSstb) {
            phaseoutReduction = allowedQbi;
            allowedQbi = 0n;
          }
        } else {
          // Pro-rata phaseout for SSTB
          if (input.scheduleC?.isSstb) {
            phaseoutReduction = TaxMoney.multiplyFraction(allowedQbi, excess, qbiParams.phaseoutRangeCents);
            allowedQbi = TaxMoney.max(0n, allowedQbi - phaseoutReduction);
          }
        }
      }

      qbiResult = {
        qualifiedBusinessIncomeCents: netQbi,
        tentativeQbiDeductionCents: tentativeQbiDeduction,
        phaseoutApplied,
        phaseoutReductionCents: phaseoutReduction,
        allowedQbiDeductionCents: allowedQbi,
      };

      formLineBreakdown['Form_8995:line_15'] = allowedQbi;
      formLineBreakdown['1040:line_13'] = allowedQbi;
      lineage['qbiDeduction'] = {
        field: 'qbiDeduction',
        valueCents: allowedQbi,
        formulaDescription: '20% of Qualified Business Income subject to overall taxable income limitation',
        ruleParameters: {
          netQbi: netQbi.toString(),
          tentative: tentativeQbiDeduction.toString(),
          overallCap: overallCap.toString(),
        },
        statutoryAuthority: qbiParams.citation,
        formLineRef: 'Form 8995 Line 15, Form 1040 Line 13',
        sourceFactIds: [],
      };
    }

    // 10. Taxable Income (Form 1040 Line 15)
    const taxableIncomeCents = TaxMoney.max(0n, taxableIncomeBeforeQbi - qbiResult.allowedQbiDeductionCents);
    formLineBreakdown['1040:line_15'] = taxableIncomeCents;
    lineage['taxableIncome'] = {
      field: 'taxableIncome',
      valueCents: taxableIncomeCents,
      formulaDescription: 'AGI - Allowed Deduction - QBI Deduction (cannot be less than 0)',
      ruleParameters: {
        agi: adjustedGrossIncomeCents.toString(),
        deduction: allowedDeductionCents.toString(),
        qbi: qbiResult.allowedQbiDeductionCents.toString(),
      },
      statutoryAuthority: 'IRC § 63',
      formLineRef: 'Form 1040, Line 15',
      sourceFactIds: [],
    };

    // 11. Progressive Income Tax Calculation (Form 1040 Line 16)
    const bracketsParam = TaxParameterRegistry.getFederalBrackets(input.filingStatus);
    const incomeTaxCents = TaxMoney.calculateProgressiveTax(taxableIncomeCents, bracketsParam.value);
    formLineBreakdown['1040:line_16'] = incomeTaxCents;
    lineage['incomeTax'] = {
      field: 'incomeTax',
      valueCents: incomeTaxCents,
      formulaDescription: 'Progressive 7-bracket tax calculation under IRC § 1(j)',
      ruleParameters: { filingStatus: input.filingStatus, taxableIncome: taxableIncomeCents.toString() },
      statutoryAuthority: bracketsParam.citation,
      formLineRef: 'Form 1040, Line 16',
      sourceFactIds: [],
    };

    // 12. Credits: Child Tax Credit & Other Dependents (Form 1040 Line 19 & 28)
    const ctcParams = TaxParameterRegistry.getChildTaxCreditParameters(input.filingStatus);
    let childTaxCreditCents = 0n;
    let creditForOtherDependentsCents = 0n;
    let refundableChildTaxCreditCents = 0n;

    if (input.dependents && input.dependents.length > 0) {
      let qualifyingChildrenCount = 0;
      let otherDependentsCount = 0;

      for (const dep of input.dependents) {
        if (dep.isUnder17 && dep.hasSsn) {
          qualifyingChildrenCount++;
        } else {
          otherDependentsCount++;
        }
      }

      const rawCtc = BigInt(qualifyingChildrenCount) * ctcParams.creditPerChildCents;
      const rawOdc = BigInt(otherDependentsCount) * ctcParams.creditPerOtherDependentCents;
      let totalTentativeCredits = rawCtc + rawOdc;

      // Phaseout above threshold ($200k / $400k)
      if (adjustedGrossIncomeCents > ctcParams.phaseoutThresholdCents) {
        const excess = adjustedGrossIncomeCents - ctcParams.phaseoutThresholdCents;
        // $50 reduction per $1,000 (or fraction thereof)
        const thousands = (excess + 99_999n) / 100_000n;
        const phaseoutAmount = thousands * ctcParams.phaseoutRatePerThousandCents;
        totalTentativeCredits = TaxMoney.max(0n, totalTentativeCredits - phaseoutAmount);
      }

      // Nonrefundable credit is limited to income tax liability
      childTaxCreditCents = TaxMoney.min(totalTentativeCredits, incomeTaxCents);

      // Refundable Additional Child Tax Credit (Schedule 8812)
      // Unused portion of CTC for qualifying children may be refundable up to $1,700/child
      const unusedCredit = totalTentativeCredits - childTaxCreditCents;
      if (unusedCredit > 0n && qualifyingChildrenCount > 0) {
        const maxRefundableCap = BigInt(qualifyingChildrenCount) * ctcParams.refundableCapPerChildCents;
        // Earned income formula: 15% of earned income exceeding $2,500
        const earnedIncome = w2WagesTotalCents + (scheduleCNetProfitCents > 0n ? scheduleCNetProfitCents : 0n);
        const earnedIncomeExcess = TaxMoney.max(0n, earnedIncome - 250_000n);
        const earnedIncomeLimit = TaxMoney.multiplyBps(earnedIncomeExcess, 1500); // 15%

        refundableChildTaxCreditCents = TaxMoney.min(
          TaxMoney.min(unusedCredit, maxRefundableCap),
          earnedIncomeLimit
        );
      }
    }

    const nonrefundableCreditsTotalCents = childTaxCreditCents + creditForOtherDependentsCents;
    const totalCreditsCents = nonrefundableCreditsTotalCents + refundableChildTaxCreditCents;

    const creditsResult: FederalCreditsResult = {
      childTaxCreditCents,
      creditForOtherDependentsCents,
      nonrefundableCreditsTotalCents,
      refundableChildTaxCreditCents,
      totalCreditsCents,
    };

    if (nonrefundableCreditsTotalCents > 0n) formLineBreakdown['1040:line_19'] = nonrefundableCreditsTotalCents;
    if (refundableChildTaxCreditCents > 0n) formLineBreakdown['1040:line_28'] = refundableChildTaxCreditCents;

    // 13. Total Federal Tax (Form 1040 Line 24)
    const taxAfterCreditsCents = TaxMoney.max(0n, incomeTaxCents - nonrefundableCreditsTotalCents);
    const totalFederalTaxCents = taxAfterCreditsCents + totalSelfEmploymentTaxCents;
    formLineBreakdown['1040:line_22'] = taxAfterCreditsCents;
    formLineBreakdown['1040:line_24'] = totalFederalTaxCents;

    lineage['totalFederalTax'] = {
      field: 'totalFederalTax',
      valueCents: totalFederalTaxCents,
      formulaDescription: 'Tax After Credits (Line 22) + Other Taxes including Self-Employment Tax (Line 23)',
      ruleParameters: {
        incomeTaxAfterCredits: taxAfterCreditsCents.toString(),
        selfEmploymentTax: totalSelfEmploymentTaxCents.toString(),
      },
      statutoryAuthority: 'IRC §§ 1, 1401',
      formLineRef: 'Form 1040, Line 24',
      sourceFactIds: [],
    };

    // 14. Payments & Withholding (Form 1040 Line 33)
    const estimatedPaymentsTotalCents = BigInt(input.payments?.estimatedTaxPaymentsCents || 0);
    const totalPaymentsCents = federalWithholdingTotalCents + estimatedPaymentsTotalCents + refundableChildTaxCreditCents;

    formLineBreakdown['1040:line_25d'] = federalWithholdingTotalCents;
    formLineBreakdown['1040:line_26'] = estimatedPaymentsTotalCents;
    formLineBreakdown['1040:line_33'] = totalPaymentsCents;

    // 15. Reconciliation: Refund or Balance Due (Lines 34 & 37)
    let refundCents = 0n;
    let balanceDueCents = 0n;

    if (totalPaymentsCents >= totalFederalTaxCents) {
      refundCents = totalPaymentsCents - totalFederalTaxCents;
      balanceDueCents = 0n;
      formLineBreakdown['1040:line_34'] = refundCents;
    } else {
      refundCents = 0n;
      balanceDueCents = totalFederalTaxCents - totalPaymentsCents;
      formLineBreakdown['1040:line_37'] = balanceDueCents;
    }

    lineage['settlement'] = {
      field: refundCents > 0n ? 'refund' : 'balanceDue',
      valueCents: refundCents > 0n ? refundCents : balanceDueCents,
      formulaDescription: refundCents > 0n
        ? 'Total Payments (Line 33) - Total Federal Tax (Line 24)'
        : 'Total Federal Tax (Line 24) - Total Payments (Line 33)',
      ruleParameters: {
        totalFederalTax: totalFederalTaxCents.toString(),
        totalPayments: totalPaymentsCents.toString(),
      },
      statutoryAuthority: 'IRC §§ 6401, 6402 (Refunds) / IRC § 6151 (Payment)',
      formLineRef: refundCents > 0n ? 'Form 1040, Line 34' : 'Form 1040, Line 37',
      sourceFactIds: [],
    };

    return {
      taxYear: input.taxYear,
      filingStatus: input.filingStatus,
      engineVersion: TaxParameterRegistry.ENGINE_VERSION,
      ruleSetVersion: TaxParameterRegistry.RULE_SET_VERSION,

      w2WagesTotalCents,
      scheduleCNetProfitCents,
      taxableInterestCents,
      ordinaryDividendsCents,
      totalIncomeCents,

      selfEmployment,
      totalAdjustmentsCents,
      adjustedGrossIncomeCents,

      isItemized,
      standardDeductionCents,
      allowedDeductionCents,
      qbi: qbiResult,
      taxableIncomeCents,

      incomeTaxCents,
      credits: creditsResult,
      taxAfterCreditsCents,
      totalFederalTaxCents,

      federalWithholdingTotalCents,
      estimatedPaymentsTotalCents,
      totalPaymentsCents,
      refundCents,
      balanceDueCents,

      lineage,
      formLineBreakdown,
    };
  }
}
