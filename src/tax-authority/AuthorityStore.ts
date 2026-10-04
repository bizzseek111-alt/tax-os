/**
 * Autonomous Tax OS — Authoritative Legal Knowledge Store
 * Normalized, versioned primary sources across US Federal, CA, NY, NJ, IL, and MA.
 */

import { TaxAuthoritySource, TaxRule } from './types';

export class AuthorityStore {
  /**
   * Primary Legal Authorities (Level 1–4)
   */
  public static readonly AUTHORITIES: TaxAuthoritySource[] = [
    // -------------------------------------------------------------
    // US FEDERAL PRIMARY AUTHORITIES
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-FED-IRC-162',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Internal Revenue Service / US Congress',
      title: 'IRC § 162 - Trade or Business Expenses',
      citationString: '26 U.S.C. § 162(a)',
      sourceUrl: 'https://www.law.cornell.edu/uscode/text/26/162',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['1040-SCH-C', '1120-S', '1065'],
      affectedSchedules: ['Schedule C'],
      topicTags: ['ordinary_necessary', 'business_expenses', 'software', 'advertising'],
      contentHash: 'hash_irc_162_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'There shall be allowed as a deduction all the ordinary and necessary expenses paid or incurred during the taxable year in carrying on any trade or business.'
    },
    {
      authorityId: 'AUTH-FED-IRC-274-MEALS',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Internal Revenue Service',
      title: 'IRC § 274(n) - 50% Limitation on Business Meals',
      citationString: '26 U.S.C. § 274(n)(1)',
      sourceUrl: 'https://www.law.cornell.edu/uscode/text/26/274',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['1040-SCH-C'],
      affectedSchedules: ['Schedule C Line 24b'],
      topicTags: ['meals', 'substantiation', '50_percent_limit'],
      contentHash: 'hash_irc_274_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'The amount allowable as a deduction under this chapter for any expense for food or beverages shall not exceed 50 percent of the amount of such expense.'
    },
    {
      authorityId: 'AUTH-FED-IRC-280A',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Internal Revenue Service',
      title: 'IRC § 280A - Disallowance of Certain Expenses in Connection with Business Use of Home',
      citationString: '26 U.S.C. § 280A(c)(1)',
      sourceUrl: 'https://www.law.cornell.edu/uscode/text/26/280A',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form 8829', '1040-SCH-C'],
      affectedSchedules: ['Schedule C Line 30'],
      topicTags: ['home_office', 'regular_and_exclusive_use'],
      contentHash: 'hash_irc_280a_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'Subsection (a) shall not apply to any item to the extent such item is allocable to a portion of the dwelling unit which is exclusively used on a regular basis as the principal place of business.'
    },
    {
      authorityId: 'AUTH-FED-IRC-199A',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Internal Revenue Service',
      title: 'IRC § 199A - Qualified Business Income (QBI) Deduction',
      citationString: '26 U.S.C. § 199A(a)',
      sourceUrl: 'https://www.law.cornell.edu/uscode/text/26/199A',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form 8995', 'Form 8995-A', 'Form 1040 Line 13'],
      affectedSchedules: ['Form 1040'],
      topicTags: ['qbi', 'pass_through', 'twenty_percent', 'sstb'],
      contentHash: 'hash_irc_199a_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'In the case of a taxpayer other than a corporation, there shall be allowed as a deduction for any taxable year an amount equal to 20 percent of the taxpayer qualified business income.'
    },

    // -------------------------------------------------------------
    // CALIFORNIA PRIMARY AUTHORITIES (FTB)
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-CA-RTC-17215-HSA',
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'California Legislature / FTB',
      title: 'Cal. RTC § 17215.4 - Non-Conformity to Federal Health Savings Accounts (HSA)',
      citationString: 'Cal. Rev. & Tax. Code § 17215.4',
      sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=17215.4.&lawCode=RTC',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['CA-540-SCH-CA'],
      affectedSchedules: ['Schedule CA Part I Line 13'],
      topicTags: ['hsa_nonconformity', 'addition_modification', 'california_adjustments'],
      contentHash: 'hash_ca_rtc_17215_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'Section 223 of the Internal Revenue Code, relating to health savings accounts, shall not apply in California. Federal HSA deductions must be added back on Schedule CA.'
    },
    {
      authorityId: 'AUTH-CA-RTC-17255-SEC179',
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'California Franchise Tax Board',
      title: 'Cal. RTC § 17255 - Section 179 Expense Dollar Limitation ($25,000 Cap)',
      citationString: 'Cal. Rev. & Tax. Code § 17255',
      sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=17255.&lawCode=RTC',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['FTB Form 3885A', 'CA-540-SCH-CA'],
      affectedSchedules: ['Schedule CA Part I Line 3'],
      topicTags: ['section_179_cap', 'california_depreciation', '25000_limit'],
      contentHash: 'hash_ca_rtc_17255_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'The aggregate cost which may be taken into account under Section 179 of the Internal Revenue Code for any taxable year in California shall not exceed twenty-five thousand dollars ($25,000).'
    },

    // -------------------------------------------------------------
    // NEW YORK PRIMARY AUTHORITIES (DTF)
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-NY-20NYCRR-CONVENIENCE',
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: 'REGULATION',
      authorityLevel: 2,
      publisher: 'New York Department of Taxation and Finance',
      title: '20 NYCRR § 131.18 - Convenience of the Employer Telecommuting Rule',
      citationString: '20 NYCRR § 131.18',
      sourceUrl: 'https://www.tax.ny.gov/rules/regulations/20nycrr.htm',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form IT-203', 'Form IT-203-B'],
      affectedSchedules: ['IT-203 Schedule B'],
      topicTags: ['convenience_of_employer', 'telecommuting', 'sourcing_wages', 'remote_work'],
      contentHash: 'hash_ny_convenience_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'Any allowance claimed for days worked outside New York State must be based upon the performance of services which of necessity, as distinguished from convenience, obligate the employee to out-of-state duties.'
    },
    {
      authorityId: 'AUTH-NY-TAX-LAW-605-RESIDENCY',
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'New York Department of Taxation and Finance',
      title: 'NY Tax Law § 605(b) - Statutory Residency and Domicile',
      citationString: 'N.Y. Tax Law § 605(b)(1)(B)',
      sourceUrl: 'https://www.nysenate.gov/legislation/laws/TAX/605',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form IT-201', 'Form IT-203'],
      affectedSchedules: ['Form IT-201'],
      topicTags: ['statutory_residency', '183_day_rule', 'permanent_place_of_abode'],
      contentHash: 'hash_ny_residency_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'A resident individual includes one who is not domiciled in this state but maintains a permanent place of abode in this state and spends in the aggregate more than 183 days of the taxable year in this state.'
    },

    // -------------------------------------------------------------
    // NEW JERSEY PRIMARY AUTHORITIES (Division of Taxation)
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-NJ-NJSA-54A-LOSS-NETTING',
      jurisdiction: 'US-NJ',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'New Jersey Division of Taxation',
      title: 'N.J.S.A. 54A:5-2 - Prohibition on Cross-Category Loss Netting',
      citationString: 'N.J. Stat. Ann. § 54A:5-2',
      sourceUrl: 'https://law.justia.com/codes/new-jersey/title-54a/section-54a-5-2/',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form NJ-1040', 'Schedule NJ-BUS-1'],
      affectedSchedules: ['NJ-1040 Lines 15-26'],
      topicTags: ['loss_netting_prohibition', 'git_categories', 'business_losses'],
      contentHash: 'hash_nj_loss_netting_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'Losses in one category of gross income shall not be used to offset gains in another category of gross income, nor may losses be carried forward or backward to other taxable years.'
    },

    // -------------------------------------------------------------
    // ILLINOIS PRIMARY AUTHORITIES (IDOR)
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-IL-35ILCS-203-PENSION',
      jurisdiction: 'US-IL',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Illinois Department of Revenue',
      title: '35 ILCS 5/203(a)(2)(F) - 100% Pension and Retirement Subtraction Modification',
      citationString: '35 ILCS 5/203(a)(2)(F)',
      sourceUrl: 'https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=003500050K203',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form IL-1040', 'Schedule M'],
      affectedSchedules: ['Schedule M Line 5'],
      topicTags: ['illinois_pension_subtraction', 'retirement_exemption', 'schedule_m'],
      contentHash: 'hash_il_pension_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'There shall be subtracted from federal adjusted gross income all amounts included in such total pursuant to the provisions of Section 402(a), 403(a), 403(b), 408, or 457 of the Internal Revenue Code.'
    },

    // -------------------------------------------------------------
    // MASSACHUSETTS PRIMARY AUTHORITIES (DOR)
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-MA-MGL-C62-FAIR-SHARE',
      jurisdiction: 'US-MA',
      taxYear: 2026,
      authorityType: 'STATUTE',
      authorityLevel: 1,
      publisher: 'Massachusetts Department of Revenue',
      title: 'M.G.L. c. 62, § 4(d) - 4% Fair Share Amendment Surtax on High Incomes',
      citationString: 'Mass. Gen. Laws ch. 62, § 4(d)',
      sourceUrl: 'https://malegislature.gov/Laws/GeneralLaws/PartI/TitleIX/Chapter62/Section4',
      publicationDate: '2024-01-01',
      effectiveFrom: '2024-01-01',
      precedentialStatus: 'BINDING',
      affectedForms: ['Form 1', 'Form 1-NR/PY'],
      affectedSchedules: ['Form 1 Line 28'],
      topicTags: ['fair_share_surtax', 'millionaires_tax', 'four_percent_surtax'],
      contentHash: 'hash_ma_fair_share_2026',
      sourceVersion: '2026.1',
      reviewStatus: 'VERIFIED',
      fullText: 'There shall be an additional tax of 4 percent on that portion of taxable income reported on the return of any taxpayer that exceeds $1,000,000 (adjusted for inflation).'
    },

    // -------------------------------------------------------------
    // TEST FIXTURES: SUPERSEDED & NON-PRECEDENTIAL AUTHORITIES
    // -------------------------------------------------------------
    {
      authorityId: 'AUTH-FED-NOTICE-2021-25-SUPERSEDED',
      jurisdiction: 'US-FED',
      taxYear: 2021,                   // Older Tax Year
      authorityType: 'ADMINISTRATIVE_NOTICE',
      authorityLevel: 3,
      publisher: 'Internal Revenue Service',
      title: 'IRS Notice 2021-25 - Temporary 100% Restaurant Meal Deduction (EXPIRED)',
      citationString: 'IRS Notice 2021-25, 2021-17 I.R.B. 1078',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/n-21-25.pdf',
      publicationDate: '2021-04-08',
      effectiveFrom: '2021-01-01',
      effectiveTo: '2022-12-31',        // Explicitly Expired Sunset Date
      precedentialStatus: 'NON_PRECEDENTIAL',
      supersededBy: 'AUTH-FED-IRC-274-MEALS',
      affectedForms: ['1040-SCH-C'],
      affectedSchedules: ['Schedule C'],
      topicTags: ['meals', 'temporary_100_percent', 'expired_covid_relief'],
      contentHash: 'hash_notice_2021_25',
      sourceVersion: '2021.1',
      reviewStatus: 'DEPRECATED',
      fullText: 'Section 210 of the Taxpayer Certainty and Disaster Tax Relief Act of 2020 provides a temporary 100 percent deduction for food or beverages provided by a restaurant incurred after Dec 31 2020 and before Jan 1 2023.'
    },
    {
      authorityId: 'AUTH-FED-PLR-202201001-NONPREC',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      authorityType: 'ADMINISTRATIVE_NOTICE',
      authorityLevel: 4,
      publisher: 'Internal Revenue Service Office of Chief Counsel',
      title: 'IRS Private Letter Ruling 202201001 (Non-Precedential)',
      citationString: 'PLR 202201001',
      sourceUrl: 'https://www.irs.gov/pub/irs-wd/202201001.pdf',
      publicationDate: '2022-01-07',
      effectiveFrom: '2022-01-07',
      precedentialStatus: 'NON_PRECEDENTIAL', // Strictly Non-Precedential
      affectedForms: ['Form 1040'],
      affectedSchedules: [],
      topicTags: ['private_letter_ruling', 'non_precedential_test'],
      contentHash: 'hash_plr_202201001',
      sourceVersion: '2022.1',
      reviewStatus: 'VERIFIED',
      fullText: 'This document may not be used or cited as precedent under Section 6110(k)(3) of the Internal Revenue Code.'
    }
  ];

  /**
   * Declarative Tax Rules
   */
  public static readonly RULES: TaxRule[] = [
    {
      ruleId: 'RULE-FED-2026-IRC-162-SOFTWARE',
      jurisdiction: 'US-FED',
      taxYear: 2026,
      topic: 'BUSINESS_SOFTWARE_EXPENSE',
      description: 'Business software subscriptions and SaaS digital tools are 100% deductible as current operating expenses under IRC § 162.',
      conditions: {
        and: [
          { '==': [{ var: 'expense.category' }, 'SOFTWARE'] },
          { '==': [{ var: 'expense.businessPurpose' }, true] }
        ]
      },
      requiredFacts: ['expense.amountCents', 'expense.businessPurpose'],
      calculationReference: 'calculateOrdinaryBusinessExpense',
      formMappings: [{ targetForm: '1040-SCH-C', targetLine: 'Line 27a', lineDescription: 'Other expenses: Software and subscriptions' }],
      authorityRefs: ['AUTH-FED-IRC-162'],
      ruleVersion: '2026.1.0',
      reviewStatus: 'ACTIVE'
    },
    {
      ruleId: 'RULE-CA-2026-HSA-ADDITION',
      jurisdiction: 'US-CA',
      taxYear: 2026,
      topic: 'CALIFORNIA_HSA_ADDITION_MODIFICATION',
      description: 'California does not conform to federal HSA deductions. Federal contributions must be added back to California income.',
      conditions: {
        and: [{ '>': [{ var: 'federal.hsaDeductionCents' }, 0] }]
      },
      requiredFacts: ['federal.hsaDeductionCents'],
      calculationReference: 'calculateCaliforniaHsaAddition',
      formMappings: [{ targetForm: 'CA-540-SCH-CA', targetLine: 'Part I Line 13 Col B', lineDescription: 'HSA deduction non-conformity addition' }],
      stateAdjustments: { isConforming: false, additionModificationLine: 'Part I Line 13 Col B', stateCodeSection: 'Cal. RTC § 17215.4' },
      authorityRefs: ['AUTH-CA-RTC-17215-HSA'],
      ruleVersion: '2026.1.0',
      reviewStatus: 'ACTIVE'
    },
    {
      ruleId: 'RULE-NY-2026-CONVENIENCE-SOURCING',
      jurisdiction: 'US-NY',
      taxYear: 2026,
      topic: 'NEW_YORK_CONVENIENCE_TELECOMMUTING',
      description: 'Telecommuting days worked outside NY for a NY employer are treated as NY work days unless bona fide employer office test is satisfied.',
      conditions: {
        and: [
          { '==': [{ var: 'employment.employerState' }, 'NY'] },
          { '==': [{ var: 'telecommuting.isEmployeeConvenience' }, true] }
        ]
      },
      requiredFacts: ['employment.employerState', 'telecommuting.daysWorkedOutsideNy'],
      calculationReference: 'calculateNewYorkConvenienceAllocation',
      formMappings: [{ targetForm: 'Form IT-203', targetLine: 'Line 1 NY Amount', lineDescription: 'New York source wage allocation' }],
      authorityRefs: ['AUTH-NY-20NYCRR-CONVENIENCE'],
      ruleVersion: '2026.1.0',
      reviewStatus: 'ACTIVE'
    },
    {
      ruleId: 'RULE-IL-2026-PENSION-SUBTRACTION',
      jurisdiction: 'US-IL',
      taxYear: 2026,
      topic: 'ILLINOIS_RETIREMENT_SUBTRACTION',
      description: 'Illinois exempts 100% of federally taxable pension and retirement income via Schedule M subtraction modification.',
      conditions: {
        and: [{ '>': [{ var: 'federal.taxableRetirementCents' }, 0] }]
      },
      requiredFacts: ['federal.taxableRetirementCents'],
      calculationReference: 'calculateIllinoisPensionSubtraction',
      formMappings: [{ targetForm: 'Form IL-1040', targetLine: 'Schedule M Line 5', lineDescription: 'Federally taxable retirement subtraction' }],
      stateAdjustments: { isConforming: false, subtractionModificationLine: 'Schedule M Line 5', stateCodeSection: '35 ILCS 5/203(a)(2)(F)' },
      authorityRefs: ['AUTH-IL-35ILCS-203-PENSION'],
      ruleVersion: '2026.1.0',
      reviewStatus: 'ACTIVE'
    },
    {
      ruleId: 'RULE-MA-2026-FAIR-SHARE-SURTAX',
      jurisdiction: 'US-MA',
      taxYear: 2026,
      topic: 'MASSACHUSETTS_4_PERCENT_SURTAX',
      description: 'Massachusetts imposes a 4% surtax on Massachusetts taxable income exceeding the $1,053,750 statutory threshold.',
      conditions: {
        and: [{ '>': [{ var: 'massachusetts.taxableIncomeCents' }, 105375000] }]
      },
      requiredFacts: ['massachusetts.taxableIncomeCents'],
      thresholds: { surtaxThresholdCents: 105375000, surtaxRate: 0.04 },
      calculationReference: 'calculateMassachusettsFairShareSurtax',
      formMappings: [{ targetForm: 'Form 1', targetLine: 'Line 28b', lineDescription: '4% Fair Share Amendment Surtax' }],
      authorityRefs: ['AUTH-MA-MGL-C62-FAIR-SHARE'],
      ruleVersion: '2026.1.0',
      reviewStatus: 'ACTIVE'
    }
  ];

  public static getAuthorityById(id: string): TaxAuthoritySource | undefined {
    return this.AUTHORITIES.find(a => a.authorityId === id);
  }

  public static getRuleById(id: string): TaxRule | undefined {
    return this.RULES.find(r => r.ruleId === id);
  }
}
