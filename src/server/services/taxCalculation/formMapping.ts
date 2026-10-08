/**
 * Autonomous TaxOS — Statutory Form Mapping Service
 * Workstream 3: Phase 3
 * 
 * Maps internal deterministic calculation variables to official IRS and State tax form lines.
 * Serves as the authoritative source of truth for UI tax form previews,
 * IRS MeF / state XML e-filing schemas, and CPA workpaper exports.
 */

import { FormLineMapping, ComprehensiveTaxResult } from './types';

export class FormMappingService {
  private static readonly MAPPINGS: FormLineMapping[] = [
    // -------------------------------------------------------------------------
    // IRS FORM 1040 & SCHEDULES
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_1z',
      description: 'Wages, salaries, tips, etc. from Form(s) W-2 Box 1',
      calculationField: 'w2WagesTotalCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_2b',
      description: 'Taxable interest from Form(s) 1099-INT Box 1',
      calculationField: 'taxableInterestCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_3b',
      description: 'Ordinary dividends from Form(s) 1099-DIV Box 1a',
      calculationField: 'ordinaryDividendsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      schedule: 'Schedule 1',
      lineCode: 'Sch_1:line_3',
      description: 'Business income or (loss) from Schedule C Line 31',
      calculationField: 'scheduleCNetProfitCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_9',
      description: 'Total income (sum of lines 1z through 8)',
      calculationField: 'totalIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      schedule: 'Schedule 1',
      lineCode: 'Sch_1:line_15',
      description: 'Deductible part of self-employment tax from Schedule SE Line 13',
      calculationField: 'selfEmployment.deductibleSeTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      schedule: 'Schedule 1',
      lineCode: 'Sch_1:line_26',
      description: 'Total adjustments to income',
      calculationField: 'totalAdjustmentsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_11',
      description: 'Adjusted Gross Income (AGI)',
      calculationField: 'adjustedGrossIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_12',
      description: 'Standard deduction or itemized deductions',
      calculationField: 'allowedDeductionCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      schedule: 'Form 8995',
      lineCode: '1040:line_13',
      description: 'Qualified business income deduction from Form 8995 Line 15',
      calculationField: 'qbi.allowedQbiDeductionCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_15',
      description: 'Taxable income',
      calculationField: 'taxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_16',
      description: 'Regular tax calculated from tax brackets',
      calculationField: 'incomeTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_19',
      description: 'Child tax credit or credit for other dependents',
      calculationField: 'credits.nonrefundableCreditsTotalCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_22',
      description: 'Total tax after credits',
      calculationField: 'taxAfterCreditsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      schedule: 'Schedule 2',
      lineCode: '1040:line_23',
      description: 'Other taxes, including self-employment tax from Schedule 2 Line 21',
      calculationField: 'selfEmployment.totalSelfEmploymentTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_24',
      description: 'Total tax (Line 22 + Line 23)',
      calculationField: 'totalFederalTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_25d',
      description: 'Federal income tax withheld from Forms W-2 and 1099',
      calculationField: 'federalWithholdingTotalCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_26',
      description: '2026 estimated tax payments and amount applied from prior year',
      calculationField: 'estimatedPaymentsTotalCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_28',
      description: 'Refundable Additional child tax credit from Schedule 8812',
      calculationField: 'credits.refundableChildTaxCreditCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_33',
      description: 'Total payments (withholding + estimated + refundable credits)',
      calculationField: 'totalPaymentsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_34',
      description: 'Amount overpaid (Refundable to taxpayer)',
      calculationField: 'refundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Form 1040',
      lineCode: '1040:line_37',
      description: 'Amount you owe (Balance Due to IRS)',
      calculationField: 'balanceDueCents',
    },

    // -------------------------------------------------------------------------
    // SCHEDULE SE
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Schedule SE',
      lineCode: 'Sch_SE:line_4c',
      description: 'Net earnings from self-employment (92.35% of Line 3)',
      calculationField: 'selfEmployment.seEarningsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Schedule SE',
      lineCode: 'Sch_SE:line_5a',
      description: 'Social Security tax (12.4% on taxable SE earnings)',
      calculationField: 'selfEmployment.oasdiTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Schedule SE',
      lineCode: 'Sch_SE:line_6',
      description: 'Medicare tax (2.9% on SE earnings)',
      calculationField: 'selfEmployment.medicareTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-FED',
      formName: 'Schedule SE',
      lineCode: 'Sch_SE:line_12',
      description: 'Total self-employment tax',
      calculationField: 'selfEmployment.totalSelfEmploymentTaxCents',
    },

    // -------------------------------------------------------------------------
    // CALIFORNIA FORM 540
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_13',
      description: 'Federal AGI from Form 1040 Line 11',
      calculationField: 'startingIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_17',
      description: 'California AGI',
      calculationField: 'stateAgiCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_18',
      description: 'California standard deduction',
      calculationField: 'stateDeductionsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_19',
      description: 'California taxable income',
      calculationField: 'stateTaxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_31',
      description: 'Tax before exemption credits',
      calculationField: 'stateGrossTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_48',
      description: 'Total California tax liability',
      calculationField: 'netStateTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_99',
      description: 'California refund amount',
      calculationField: 'stateRefundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-CA',
      formName: 'CA Form 540',
      lineCode: 'CA_540:line_104',
      description: 'California amount you owe',
      calculationField: 'stateBalanceDueCents',
    },

    // -------------------------------------------------------------------------
    // NEW YORK FORM IT-201
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_19',
      description: 'Federal AGI',
      calculationField: 'startingIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_33',
      description: 'New York AGI',
      calculationField: 'stateAgiCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_34',
      description: 'New York standard deduction',
      calculationField: 'stateDeductionsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_37',
      description: 'New York taxable income',
      calculationField: 'stateTaxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_46',
      description: 'Total New York State tax liability',
      calculationField: 'netStateTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_77',
      description: 'New York State refund amount',
      calculationField: 'stateRefundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NY',
      formName: 'NY Form IT-201',
      lineCode: 'NY_IT201:line_80',
      description: 'New York State amount you owe',
      calculationField: 'stateBalanceDueCents',
    },

    // -------------------------------------------------------------------------
    // NEW JERSEY FORM NJ-1040
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_15',
      description: 'Wages, salaries, tips, and other employee compensation',
      calculationField: 'njWagesCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_29',
      description: 'Total New Jersey Gross Income',
      calculationField: 'startingIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_30',
      description: 'Total New Jersey exemptions',
      calculationField: 'stateExemptionsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_39',
      description: 'New Jersey Taxable Income',
      calculationField: 'stateTaxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_46',
      description: 'Total New Jersey Tax Liability',
      calculationField: 'netStateTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_58',
      description: 'New Jersey refund amount',
      calculationField: 'stateRefundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-NJ',
      formName: 'NJ Form NJ-1040',
      lineCode: 'NJ_1040:line_61',
      description: 'New Jersey balance due',
      calculationField: 'stateBalanceDueCents',
    },

    // -------------------------------------------------------------------------
    // ILLINOIS FORM IL-1040
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_1',
      description: 'Federal AGI from 1040 Line 11',
      calculationField: 'startingIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_9',
      description: 'Illinois base income',
      calculationField: 'stateAgiCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_10',
      description: 'Illinois standard exemption allowance',
      calculationField: 'stateExemptionsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_11',
      description: 'Illinois net income',
      calculationField: 'stateTaxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_12',
      description: 'Tax at flat 4.95%',
      calculationField: 'stateGrossTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_24',
      description: 'Net Illinois tax liability',
      calculationField: 'netStateTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_36',
      description: 'Illinois refund amount',
      calculationField: 'stateRefundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-IL',
      formName: 'IL Form IL-1040',
      lineCode: 'IL_1040:line_39',
      description: 'Illinois balance due',
      calculationField: 'stateBalanceDueCents',
    },

    // -------------------------------------------------------------------------
    // MASSACHUSETTS FORM 1
    // -------------------------------------------------------------------------
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_10',
      description: 'Federal AGI',
      calculationField: 'startingIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_18',
      description: 'Massachusetts personal exemption',
      calculationField: 'stateExemptionsCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_19',
      description: 'Massachusetts taxable Part B income',
      calculationField: 'stateTaxableIncomeCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_20',
      description: 'Part B 5.0% tax',
      calculationField: 'partBTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_28b',
      description: 'Fair Share 4.0% surtax on taxable income > $1,000,000',
      calculationField: 'fairShareSurtaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_32',
      description: 'Total Massachusetts tax liability',
      calculationField: 'netStateTaxCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_51',
      description: 'Massachusetts refund amount',
      calculationField: 'stateRefundCents',
    },
    {
      taxYear: 2026,
      jurisdiction: 'US-MA',
      formName: 'MA Form 1',
      lineCode: 'MA_1:line_54',
      description: 'Massachusetts balance due',
      calculationField: 'stateBalanceDueCents',
    },
  ];

  public static getAllMappings(): FormLineMapping[] {
    return this.MAPPINGS;
  }

  public static getMappingsByJurisdiction(jurisdiction: string): FormLineMapping[] {
    return this.MAPPINGS.filter(m => m.jurisdiction === jurisdiction);
  }

  public static getMappingByLineCode(lineCode: string): FormLineMapping | undefined {
    return this.MAPPINGS.find(m => m.lineCode === lineCode);
  }
}
