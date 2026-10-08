/**
 * Autonomous Tax OS — Internal Revenue Service (US-FED) Authority Provider
 * 
 * Ingests authoritative Federal statutes, regulations, revenue rulings, form instructions,
 * and official publications for the Internal Revenue Code.
 */

import {
  AuthoritySourceInput,
  AuthorityType,
  NormalizedRulePayload,
  PrecedentialStatus,
  SupportedJurisdiction
} from '../types';
import { TaxAuthorityProvider } from './base';

export class IrsProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-FED';
  public readonly publisherName: string = 'INTERNAL_REVENUE_SERVICE';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      // 1. STATUTE: IRC § 199A - Qualified Business Income
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'OFFICE_OF_THE_LAW_REVISION_COUNSEL',
        title: '26 U.S.C. § 199A - Qualified Business Income',
        citationCode: '26 U.S.C. § 199A',
        effectiveFrom: new Date(2018, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 1040', 'Form 8995', 'Form 8995-A'],
        affectedSchedules: ['Schedule C', 'Schedule E'],
        topicTags: ['QUALIFIED_BUSINESS_INCOME', 'QBI', 'PASS_THROUGH', 'SECTION_199A'],
        sourceVersion: '2026.1',
        rawContent: `§ 199A. Qualified business income
(a) Allowance of deduction
In the case of a taxpayer other than a corporation, there shall be allowed as a deduction for any taxable year an amount equal to the lesser of—
(1) the combined qualified business income amount of the taxpayer, or
(2) an amount equal to 20 percent of the excess (if any) of—
(A) the taxable income of the taxpayer for the taxable year, over
(B) the net capital gain of the taxpayer for such taxable year.
(b) Combined qualified business income amount
(1) In general
The term "combined qualified business income amount" includes the sum of 20 percent of the taxpayer's qualified business income with respect to each qualified trade or business.
(2) Limitation based on W-2 wages and capital
In the case of any qualified trade or business other than a specified service trade or business, the amount determined under paragraph (1) shall not exceed the greater of—
(A) 50 percent of the W-2 wages with respect to the qualified trade or business, or
(B) the sum of 25 percent of the W-2 wages plus 2.5 percent of the unadjusted basis immediately after acquisition of qualified property.`
      },

      // 2. STATUTE: IRC § 62 - Adjusted Gross Income
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'OFFICE_OF_THE_LAW_REVISION_COUNSEL',
        title: '26 U.S.C. § 62 - Adjusted Gross Income Defined',
        citationCode: '26 U.S.C. § 62',
        effectiveFrom: new Date(1954, 7, 16),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 1040'],
        affectedSchedules: ['Schedule 1', 'Schedule C'],
        topicTags: ['ADJUSTED_GROSS_INCOME', 'ABOVE_THE_LINE_DEDUCTIONS'],
        sourceVersion: '2026.1',
        rawContent: `§ 62. Adjusted gross income defined
(a) General rule
For purposes of this subtitle, the term "adjusted gross income" means, in the case of an individual, gross income minus the following deductions:
(1) Trade and business deductions
The deductions allowed by this chapter which are attributable to a trade or business carried on by the taxpayer, if such trade or business does not consist of the performance of services by the taxpayer as an employee.
(2) Certain trade and business deductions of employees
(3) Losses from sale or exchange of property`
      },

      // 3. STATUTE: IRC § 1401 - Self-Employment Tax
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'OFFICE_OF_THE_LAW_REVISION_COUNSEL',
        title: '26 U.S.C. § 1401 - Rate of Tax on Self-Employment Income',
        citationCode: '26 U.S.C. § 1401',
        effectiveFrom: new Date(1984, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 1040', 'Schedule SE'],
        affectedSchedules: ['Schedule SE'],
        topicTags: ['SELF_EMPLOYMENT_TAX', 'SECA', 'SCHEDULE_SE'],
        sourceVersion: '2026.1',
        rawContent: `§ 1401. Rate of tax
(a) Old-age, survivors, and disability insurance
In addition to other taxes, there shall be imposed for each taxable year, on the self-employment income of every individual, a tax equal to 12.4 percent of the amount of the self-employment income for such taxable year.
(b) Hospital insurance
In addition to the tax imposed by the preceding subsection, there shall be imposed for each taxable year, on the self-employment income of every individual, a tax equal to 2.9 percent of the amount of the self-employment income for such taxable year.`
      },

      // 4. REGULATION: 26 CFR § 1.199A-1
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.REGULATION,
        publisher: 'DEPARTMENT_OF_THE_TREASURY',
        title: 'Treas. Reg. § 1.199A-1 - Operational rules for Section 199A',
        citationCode: 'Treas. Reg. § 1.199A-1',
        effectiveFrom: new Date(2019, 1, 8),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 8995'],
        topicTags: ['QUALIFIED_BUSINESS_INCOME', 'OPERATIONAL_RULES'],
        sourceVersion: '2026.1',
        rawContent: `Treas. Reg. § 1.199A-1 Operational rules.
(a) Overview. This section provides operational rules for calculating the deduction for qualified business income under section 199A.
(b) Definitions.
(1) Qualified business income (QBI) means the net amount of qualified items of income, gain, deduction, and loss with respect to any qualified trade or business of the taxpayer.
(2) Threshold amount. For taxable years beginning in 2026, the threshold amount is $197,200 ($394,400 in the case of a joint return).`
      },

      // 5. FORM INSTRUCTION: 2026 Form 1040 Instructions
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.FORM_INSTRUCTION,
        publisher: 'INTERNAL_REVENUE_SERVICE',
        title: '2026 Instructions for Form 1040',
        citationCode: '2026 Form 1040 Instructions',
        effectiveFrom: new Date(2026, 0, 1),
        precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
        affectedForms: ['Form 1040'],
        topicTags: ['FORM_1040', 'LINE_INSTRUCTIONS'],
        sourceVersion: '2026.1',
        rawContent: `2026 Form 1040 Instructions
Line 1z. Add lines 1a through 1h. Enter total wages, salaries, and tips.
Line 12. Standard deduction or itemized deductions. Enter the standard deduction for your filing status.
Line 13. Qualified business income deduction. Enter the deduction from Form 8995 or Form 8995-A.
Line 15. Taxable income. Subtract line 14 from line 11.
Line 16. Tax. Compute tax using the 2026 Tax Table or Tax Computation Worksheet.
Line 24. Total tax. Add lines 22 and 23.`
      },

      // 6. HISTORICAL / SUPERSEDED GUIDANCE: IRS Notice 2020-01 (SUPERSEDED)
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.NOTICE,
        publisher: 'INTERNAL_REVENUE_SERVICE',
        title: 'IRS Notice 2020-01 (Superseded Guidance)',
        citationCode: 'Notice 2020-01',
        effectiveFrom: new Date(2020, 0, 1),
        effectiveTo: new Date(2022, 11, 31),
        precedentialStatus: PrecedentialStatus.SUPERSEDED,
        affectedForms: ['Form 1040'],
        topicTags: ['DISASTER_RELIEF', 'HISTORICAL'],
        sourceVersion: '2020.1',
        rawContent: `Notice 2020-01. Extension of Deadlines for Disaster Relief. This notice has been formally superseded and obsolete by Treasury Decision 9980.`
      },

      // 7. NON-PRECEDENTIAL GUIDANCE: IRS FAQ on Crypto Assets
      {
        jurisdiction: 'US-FED',
        taxYear,
        authorityType: AuthorityType.FAQ,
        publisher: 'INTERNAL_REVENUE_SERVICE',
        title: 'Frequently Asked Questions on Virtual Currency Transactions',
        citationCode: 'IRS FAQ Virtual Currency Q42',
        effectiveFrom: new Date(2024, 0, 1),
        precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
        affectedForms: ['Form 1040'],
        topicTags: ['DIGITAL_ASSETS', 'CRYPTO'],
        sourceVersion: '2026.1',
        rawContent: `Frequently Asked Questions on Virtual Currency:
Q42: Can a taxpayer deduct personal crypto losses against ordinary wage income?
A42: No. Under general principles of the Code, capital losses are subject to the limitation under section 1211(b), allowing up to $3,000 against ordinary income.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'FED-SEC-199A-QBI-DEDUCTION',
        jurisdiction: 'US-FED',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'QUALIFIED_BUSINESS_INCOME',
        title: 'Section 199A Qualified Business Income Deduction',
        description: 'Allows an eligible non-corporate taxpayer a 20% deduction on qualified business income from a sole proprietorship, partnership, or S corporation.',
        conditions: {
          type: 'COMPOUND',
          logicalOp: 'AND',
          conditions: [
            {
              type: 'LEAF',
              factKey: 'business.has_qualified_business_income',
              operator: 'IS_TRUE',
              description: 'Taxpayer must have qualified business income from an active trade or business'
            },
            {
              type: 'LEAF',
              factKey: 'taxpayer.is_corporation',
              operator: 'IS_FALSE',
              description: 'Taxpayer must not be a C corporation'
            }
          ]
        },
        requiredFacts: ['business.has_qualified_business_income', 'taxpayer.is_corporation'],
        exceptions: ['Specified Service Trade or Business (SSTB) above phaseout threshold'],
        thresholds: {
          singleThresholdCents: 19720000n,
          mfjThresholdCents: 39440000n
        },
        phaseOuts: {
          singlePhaseOutRangeCents: 5000000n,
          mfjPhaseOutRangeCents: 10000000n
        },
        elections: {},
        calculationReference: 'federalEngine.calculateQbiDeduction',
        formMappings: ['Form 1040:Line 13', 'Form 8995:Line 15'],
        federalConformityBehavior: 'CONFORMS',
        authorityRefs: ['26 U.S.C. § 199A', 'Treas. Reg. § 1.199A-1'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(2018, 0, 1)
      },
      {
        ruleId: 'FED-SEC-1401-SELF-EMPLOYMENT-TAX',
        jurisdiction: 'US-FED',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'SELF_EMPLOYMENT_TAX',
        title: 'Section 1401 Self-Employment Tax',
        description: 'Imposes 15.3% SECA tax (12.4% OASDI up to wage base + 2.9% Medicare) on 92.35% of net self-employment earnings exceeding $400.',
        conditions: {
          type: 'LEAF',
          factKey: 'schedule_c.net_profit_cents',
          operator: 'GREATER_THAN',
          value: 40000,
          description: 'Net self-employment profit exceeds statutory threshold of $400.00'
        },
        requiredFacts: ['schedule_c.net_profit_cents'],
        exceptions: ['Statutory employees and certain ministers with approved Form 4361'],
        thresholds: {
          statutoryThresholdCents: 40000n,
          oasdiWageBaseCents: 17610000n
        },
        phaseOuts: {},
        elections: {},
        calculationReference: 'federalEngine.calculateSelfEmploymentTax',
        formMappings: ['Schedule SE:Line 12', 'Form 1040:Line 23'],
        federalConformityBehavior: 'CONFORMS',
        authorityRefs: ['26 U.S.C. § 1401', '26 U.S.C. § 1402'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(1984, 0, 1)
      }
    ];
  }
}
