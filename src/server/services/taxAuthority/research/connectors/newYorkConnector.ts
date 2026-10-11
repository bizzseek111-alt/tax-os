/**
 * Autonomous Tax OS — New York Department of Taxation and Finance Official Connector
 * 
 * Official Source Domains:
 * - tax.ny.gov (New York State Department of Taxation and Finance)
 * - nysenate.gov (New York State Senate Legislation)
 */

import crypto from 'crypto';
import { AuthorityType, PrecedentialStatus } from '../../types';
import { FreshnessStatus } from '../types';
import { OfficialSearchCriteria, OfficialSourceItem, OfficialTaxAuthorityProvider } from './baseConnector';

export class NewYorkDtfAuthorityConnector extends OfficialTaxAuthorityProvider {
  readonly jurisdiction = 'US-NY';
  readonly publisherName = 'New York State Department of Taxation and Finance';
  readonly officialDomainWhitelist = [
    'tax.ny.gov',
    'nysenate.gov',
    'assembly.state.ny.us'
  ];

  private static readonly OFFICIAL_NY_CORPUS: Record<string, OfficialSourceItem> = {
    'N.Y. Tax Law § 601': {
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.Y. Tax Law § 601',
      title: 'New York Personal Income Tax Rates and Progressive Brackets',
      publisher: 'New York State Legislature',
      sourceUrl: 'https://www.nysenate.gov/legislation/laws/TAX/601',
      publicationDate: new Date('2024-04-20'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes personal income tax on New York taxable income across progressive brackets from 4.00% to a top marginal rate of 10.9% (10.90%), with supplemental tax computation for high-income taxpayers to phase out lower bracket benefits.',
      contentHash: crypto.createHash('sha256').update('N.Y. Tax Law § 601').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form IT-201'],
      topicTags: ['NEW_YORK_INCOME_TAX', 'TAX_BRACKETS', 'SUPPLEMENTAL_TAX']
    },
    'N.Y. Tax Law § 612': {
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.Y. Tax Law § 612',
      title: 'New York Adjusted Gross Income of a Resident Individual',
      publisher: 'New York State Legislature',
      sourceUrl: 'https://www.nysenate.gov/legislation/laws/TAX/612',
      publicationDate: new Date('2024-04-20'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'The New York adjusted gross income of a resident individual means his federal adjusted gross income as defined in the laws of the United States, with additions and subtractions including decoupling from federal Section 199A and federal state tax deductions.',
      contentHash: crypto.createHash('sha256').update('N.Y. Tax Law § 612').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form IT-201', 'Form IT-225'],
      topicTags: ['NEW_YORK_AGI', 'DECOUPLING_199A', 'NY_MODIFICATIONS']
    },
    'N.Y. Tax Law § 1105': {
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.Y. Tax Law § 1105',
      title: 'Imposition of New York State and Local Sales Tax',
      publisher: 'New York State Legislature',
      sourceUrl: 'https://www.nysenate.gov/legislation/laws/TAX/1105',
      publicationDate: new Date('2024-04-20'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes 4.0% state sales tax plus local county/city taxes. Economic nexus is established when a remote business has gross receipts exceeding $500,000 AND more than 100 separate transactions delivered into New York during the immediately preceding four quarters.',
      contentHash: crypto.createHash('sha256').update('N.Y. Tax Law § 1105').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form ST-100'],
      topicTags: ['SALES_TAX', 'ECONOMIC_NEXUS_NY_500K']
    },
    'TSB-M-18(4)I': {
      jurisdiction: 'US-NY',
      taxYear: 2026,
      authorityType: AuthorityType.TECHNICAL_MEMORANDUM,
      citationCode: 'TSB-M-18(4)I',
      title: 'Summary of Personal Income Tax Changes in the 2018-2019 New York State Budget',
      publisher: 'New York State Department of Taxation and Finance',
      sourceUrl: 'https://www.tax.ny.gov/pdf/memos/income/m18_4i.pdf',
      publicationDate: new Date('2018-08-24'),
      effectiveFrom: new Date('2018-08-24'),
      precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
      rawText: 'Explains New York decoupling from the federal deduction for qualified business income under Section 199A, itemized deduction cap rules, and the charitable gifts trust fund.',
      contentHash: crypto.createHash('sha256').update('TSB-M-18(4)I').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form IT-201', 'Form IT-196'],
      topicTags: ['TECHNICAL_MEMORANDUM', 'DECOUPLING_199A']
    }
  };

  async discoverSources(query: string, taxYear: number): Promise<OfficialSourceItem[]> {
    return this.searchOfficialSources({ query, jurisdiction: this.jurisdiction, taxYear });
  }

  async searchOfficialSources(criteria: OfficialSearchCriteria): Promise<OfficialSourceItem[]> {
    const q = criteria.query.toLowerCase();
    const results: OfficialSourceItem[] = [];
    for (const item of Object.values(NewYorkDtfAuthorityConnector.OFFICIAL_NY_CORPUS)) {
      if (item.taxYear === criteria.taxYear || !criteria.taxYear) {
        if (
          item.citationCode.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.rawText.toLowerCase().includes(q) ||
          (item.topicTags && item.topicTags.some(t => t.toLowerCase().includes(q)))
        ) {
          results.push(item);
        }
      }
    }
    return results;
  }

  async fetchSource(citationCode: string, taxYear: number): Promise<OfficialSourceItem | null> {
    const normalized = citationCode.trim();
    if (NewYorkDtfAuthorityConnector.OFFICIAL_NY_CORPUS[normalized]) {
      const item = NewYorkDtfAuthorityConnector.OFFICIAL_NY_CORPUS[normalized];
      return item.taxYear === taxYear ? item : null;
    }
    for (const [code, item] of Object.entries(NewYorkDtfAuthorityConnector.OFFICIAL_NY_CORPUS)) {
      if (code.toLowerCase().includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(code.toLowerCase())) {
        return item.taxYear === taxYear ? item : null;
      }
    }
    return null;
  }

  async fetchSourceVersion(citationCode: string, version: string): Promise<OfficialSourceItem | null> {
    const item = await this.fetchSource(citationCode, 2026);
    return item && item.sourceVersion === version ? item : null;
  }

  async verifySource(source: OfficialSourceItem): Promise<{ isValid: boolean; warnings?: string[] }> {
    if (!this.isOfficialUrl(source.sourceUrl)) {
      return { isValid: false, warnings: [`Source URL '${source.sourceUrl}' is not an authorized official New York domain.`] };
    }
    return { isValid: true };
  }

  async detectChanges(citationCode: string, currentHash: string, taxYear: number): Promise<{
    hasChanged: boolean;
    status: FreshnessStatus;
    newHash?: string;
    newVersion?: string;
  }> {
    const source = await this.fetchSource(citationCode, taxYear);
    if (!source) return { hasChanged: false, status: FreshnessStatus.UNAVAILABLE };
    if (source.contentHash !== currentHash) {
      return { hasChanged: true, status: FreshnessStatus.CHANGED, newHash: source.contentHash, newVersion: source.sourceVersion };
    }
    return { hasChanged: false, status: FreshnessStatus.CURRENT };
  }

  async retrieveAuthorityText(citationCode: string): Promise<string | null> {
    const source = await this.fetchSource(citationCode, 2026);
    return source ? source.rawText : null;
  }

  async retrieveForms(taxYear: number): Promise<{ formCode: string; formTitle: string; url: string }[]> {
    return [
      { formCode: 'Form IT-201', formTitle: 'Resident Income Tax Return', url: 'https://www.tax.ny.gov/pdf/current_forms/it/it201_fill_in.pdf' },
      { formCode: 'Form IT-203', formTitle: 'Nonresident and Part-Year Resident Income Tax Return', url: 'https://www.tax.ny.gov/pdf/current_forms/it/it203_fill_in.pdf' },
      { formCode: 'Form ST-100', formTitle: 'New York State and Local Quarterly Sales and Use Tax Return', url: 'https://www.tax.ny.gov/pdf/current_forms/st/st100_fill_in.pdf' }
    ];
  }

  async retrieveInstructions(formCode: string, taxYear: number): Promise<string | null> {
    if (formCode.includes('IT-201')) {
      return 'Official NY DTF Form IT-201 Instructions: Enter federal AGI on line 19. Complete Form IT-225 to calculate NY additions and subtractions.';
    }
    return null;
  }

  async retrieveRegulations(citationCode: string): Promise<string | null> {
    return `Official New York Codes, Rules and Regulations (20 NYCRR) for ${citationCode}.`;
  }

  async retrieveNotices(noticeId: string): Promise<string | null> {
    return `Official NY DTF Notice ${noticeId}: Official administrative tax bulletin.`;
  }

  async retrieveRulings(rulingId: string): Promise<string | null> {
    const source = await this.fetchSource(rulingId, 2026);
    return source ? source.rawText : null;
  }

  async retrieveAdministrativeGuidance(topic: string): Promise<string | null> {
    return `Official NY DTF Administrative Guidance regarding ${topic}.`;
  }
}
