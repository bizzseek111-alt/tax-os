/**
 * Autonomous Tax OS — Tax Authority Test Corpus Fixtures
 * 
 * Provides verified statutory sources, regulations, form instructions,
 * superseded guidance, and conflict test fixtures across all 6 jurisdictions.
 */

import {
  AuthorityType,
  PrecedentialStatus,
  SupportedJurisdiction
} from '../../server/services/taxAuthority/types';

export interface FixtureSource {
  citationCode: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  authorityType: AuthorityType;
  authorityLevel: number;
  precedentialStatus: PrecedentialStatus;
  title: string;
  sectionPath: string;
  content: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export const AUTHORITY_TEST_CORPUS: FixtureSource[] = [
  // 1. US-FED: IRC § 199A Statute (Binding, Rank 1)
  {
    citationCode: '26 U.S.C. § 199A',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Qualified Business Income Deduction',
    sectionPath: '26 U.S.C. § 199A > (a) > (1)',
    content: 'In the case of a taxpayer other than a corporation, there shall be allowed as a deduction for any taxable year an amount equal to the lesser of the combined qualified business income amount or 20 percent of taxable income excess over net capital gain.',
    effectiveFrom: new Date(2018, 0, 1)
  },

  // 2. US-FED: Treas. Reg. § 1.199A-1 (Binding, Rank 2)
  {
    citationCode: 'Treas. Reg. § 1.199A-1',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    authorityType: AuthorityType.REGULATION,
    authorityLevel: 2,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Operational Rules for Section 199A',
    sectionPath: 'Treas. Reg. § 1.199A-1 > (b) > (2)',
    content: 'For taxable years beginning in 2026, the threshold amount for qualified business income is $197,200 for single filers and $394,400 for married individuals filing jointly.',
    effectiveFrom: new Date(2019, 1, 8)
  },

  // 3. US-FED: IRS Form 1040 Instructions (Administrative, Rank 10)
  {
    citationCode: '2026 Form 1040 Instructions',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    authorityType: AuthorityType.FORM_INSTRUCTION,
    authorityLevel: 10,
    precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
    title: 'Form 1040 Line 13 Instructions',
    sectionPath: 'Form 1040 > Line 13',
    content: 'Line 13. Qualified business income deduction. Enter the deduction from Form 8995 or Form 8995-A.',
    effectiveFrom: new Date(2026, 0, 1)
  },

  // 4. US-FED: Notice 2020-01 (SUPERSEDED, Rank 6, Weight 0.0)
  {
    citationCode: 'Notice 2020-01',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    authorityType: AuthorityType.NOTICE,
    authorityLevel: 6,
    precedentialStatus: PrecedentialStatus.SUPERSEDED,
    title: 'Disaster Relief Deadlines (Superseded)',
    sectionPath: 'Notice 2020-01 > Section 3',
    content: 'Temporary relief provisions under Notice 2020-01 are obsolete and superseded by Treasury Decision 9980.',
    effectiveFrom: new Date(2020, 0, 1),
    effectiveTo: new Date(2022, 11, 31)
  },

  // 5. US-FED: Non-precedential FAQ (Rank 14)
  {
    citationCode: 'IRS FAQ Crypto Q42',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    authorityType: AuthorityType.FAQ,
    authorityLevel: 14,
    precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
    title: 'FAQ on Cryptocurrency Capital Loss Offset',
    sectionPath: 'IRS FAQ > Q42',
    content: 'Frequently Asked Question: Cryptocurrency losses cannot offset ordinary wage income beyond the $3,000 statutory limit under Section 1211.',
    effectiveFrom: new Date(2024, 0, 1)
  },

  // 6. US-CA: Cal. RTC § 17041 (Binding, Rank 1)
  {
    citationCode: 'Cal. RTC § 17041',
    jurisdiction: 'US-CA',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'California Personal Income Tax Rates and Brackets',
    sectionPath: 'Cal. RTC § 17041 > (a)',
    content: 'Imposes California personal income tax at progressive rates graduated from 1% to 12.3%, plus 1% Mental Health Services Act on income exceeding $1,000,000.',
    effectiveFrom: new Date(2012, 0, 1)
  },

  // 7. US-CA: Cal. RTC § 17215 (Binding, Rank 1) - HSA Addback
  {
    citationCode: 'Cal. RTC § 17215',
    jurisdiction: 'US-CA',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Disallowance of Health Savings Account Deduction',
    sectionPath: 'Cal. RTC § 17215',
    content: 'Section 223 of the Internal Revenue Code, relating to health savings accounts, shall not apply for California tax purposes. All HSA deductions must be added back.',
    effectiveFrom: new Date(2004, 0, 1)
  },

  // 8. US-NY: NY Tax Law § 601 (Binding, Rank 1)
  {
    citationCode: 'NY Tax Law § 601',
    jurisdiction: 'US-NY',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'New York Personal Income Tax and Recapture',
    sectionPath: 'NY Tax Law § 601 > (d)',
    content: 'Imposes New York State personal income tax up to 10.9% and enforces tax table benefit recapture for NY AGI exceeding $107,650.',
    effectiveFrom: new Date(2010, 0, 1)
  },

  // 9. US-NJ: N.J.S.A. 54A:5-2 (Binding, Rank 1) - Cross-Netting Prohibition
  {
    citationCode: 'N.J.S.A. 54A:5-2',
    jurisdiction: 'US-NJ',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Prohibition of Cross-Category Loss Netting',
    sectionPath: 'N.J.S.A. 54A:5-2',
    content: 'Losses incurred in one category of gross income shall not be used to offset gains or income realized in any other category of gross income under the New Jersey Gross Income Tax Act.',
    effectiveFrom: new Date(1976, 6, 8)
  },

  // 10. US-IL: 35 ILCS 5/203(a)(2)(F) (Binding, Rank 1) - Pension Exemption
  {
    citationCode: '35 ILCS 5/203(a)(2)(F)',
    jurisdiction: 'US-IL',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Illinois Subtraction for Retirement and Pension Income',
    sectionPath: '35 ILCS 5/203 > (a) > (2) > (F)',
    content: 'Full subtraction from federal adjusted gross income for all retirement plan distributions, qualified pensions, and Social Security benefits.',
    effectiveFrom: new Date(1969, 7, 1)
  },

  // 11. US-MA: Mass. Const. Amend. Art. XLIV (Binding, Rank 1) - 4% Fair Share Surtax
  {
    citationCode: 'Mass. Const. Amend. Art. XLIV',
    jurisdiction: 'US-MA',
    taxYear: 2026,
    authorityType: AuthorityType.STATUTE,
    authorityLevel: 1,
    precedentialStatus: PrecedentialStatus.BINDING,
    title: 'Massachusetts 4% Fair Share Surtax on Millionaires',
    sectionPath: 'Mass. Const. Amend. Art. XLIV',
    content: 'Additional tax of 4 percent on that portion of annual taxable income exceeding $1,000,000 adjusted annually for inflation.',
    effectiveFrom: new Date(2023, 0, 1)
  }
];
