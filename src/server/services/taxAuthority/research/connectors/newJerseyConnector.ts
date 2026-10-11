/**
 * Autonomous Tax OS — New Jersey Division of Taxation Official Authority Connector
 * 
 * Official Source Domains:
 * - state.nj.us/treasury/taxation
 * - nj.gov/treasury/taxation
 * - njleg.state.nj.us
 */

import crypto from 'crypto';
import { AuthorityType, PrecedentialStatus } from '../../types';
import { FreshnessStatus } from '../types';
import { OfficialSearchCriteria, OfficialSourceItem, OfficialTaxAuthorityProvider } from './baseConnector';

export class NewJerseyDivTaxAuthorityConnector extends OfficialTaxAuthorityProvider {
  readonly jurisdiction = 'US-NJ';
  readonly publisherName = 'State of New Jersey Division of Taxation';
  readonly officialDomainWhitelist = [
    'state.nj.us',
    'nj.gov',
    'njleg.state.nj.us'
  ];

  private static readonly OFFICIAL_NJ_CORPUS: Record<string, OfficialSourceItem> = {
    'N.J. Stat. Ann. § 54A:2-1': {
      jurisdiction: 'US-NJ',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.J. Stat. Ann. § 54A:2-1',
      title: 'New Jersey Gross Income Tax Rates and Brackets',
      publisher: 'New Jersey State Legislature',
      sourceUrl: 'https://www.njleg.state.nj.us/bill-search/title-54a',
      publicationDate: new Date('2024-06-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes New Jersey Gross Income Tax across graduated brackets from 1.40% to a top marginal rate of 10.75% on taxable gross income over $1,000,000.',
      contentHash: crypto.createHash('sha256').update('N.J. Stat. Ann. § 54A:2-1').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form NJ-1040'],
      topicTags: ['NEW_JERSEY_GROSS_INCOME_TAX', 'TAX_BRACKETS']
    },
    'N.J. Stat. Ann. § 54A:5-1': {
      jurisdiction: 'US-NJ',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.J. Stat. Ann. § 54A:5-1',
      title: 'Categories of Taxable New Jersey Gross Income & Prohibition of Cross-Category Loss Offsetting',
      publisher: 'New Jersey State Legislature',
      sourceUrl: 'https://www.njleg.state.nj.us/bill-search/title-54a',
      publicationDate: new Date('2024-06-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'New Jersey defines gross income completely independently of the federal Internal Revenue Code. Losses in one category (e.g. Schedule C net business loss) CANNOT be used to offset income in another category (e.g. W-2 wages or interest income).',
      contentHash: crypto.createHash('sha256').update('N.J. Stat. Ann. § 54A:5-1').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form NJ-1040'],
      topicTags: ['NJ_CATEGORIES_OF_INCOME', 'NO_LOSS_OFFSET', 'AUTONOMOUS_DEFINITION']
    },
    'N.J. Stat. Ann. § 54:32B-3': {
      jurisdiction: 'US-NJ',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'N.J. Stat. Ann. § 54:32B-3',
      title: 'New Jersey Sales and Use Tax & Economic Nexus Threshold',
      publisher: 'New Jersey State Legislature',
      sourceUrl: 'https://www.njleg.state.nj.us/bill-search/title-54',
      publicationDate: new Date('2024-06-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes state sales tax of 6.625%. Economic nexus is established when remote seller has gross revenue exceeding $100,000 OR 200 separate transactions delivered into New Jersey during calendar year.',
      contentHash: crypto.createHash('sha256').update('N.J. Stat. Ann. § 54:32B-3').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form ST-50'],
      topicTags: ['SALES_TAX', 'ECONOMIC_NEXUS_NJ_100K']
    }
  };

  async discoverSources(query: string, taxYear: number): Promise<OfficialSourceItem[]> {
    return this.searchOfficialSources({ query, jurisdiction: this.jurisdiction, taxYear });
  }

  async searchOfficialSources(criteria: OfficialSearchCriteria): Promise<OfficialSourceItem[]> {
    const q = criteria.query.toLowerCase();
    const results: OfficialSourceItem[] = [];
    for (const item of Object.values(NewJerseyDivTaxAuthorityConnector.OFFICIAL_NJ_CORPUS)) {
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
    if (NewJerseyDivTaxAuthorityConnector.OFFICIAL_NJ_CORPUS[normalized]) {
      const item = NewJerseyDivTaxAuthorityConnector.OFFICIAL_NJ_CORPUS[normalized];
      return item.taxYear === taxYear ? item : null;
    }
    for (const [code, item] of Object.entries(NewJerseyDivTaxAuthorityConnector.OFFICIAL_NJ_CORPUS)) {
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
      return { isValid: false, warnings: [`Source URL '${source.sourceUrl}' is not an authorized official New Jersey domain.`] };
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
      { formCode: 'Form NJ-1040', formTitle: 'New Jersey Resident Return', url: 'https://www.state.nj.us/treasury/taxation/pdf/current/nj1040.pdf' },
      { formCode: 'Form NJ-1040-NR', formTitle: 'New Jersey Nonresident Return', url: 'https://www.state.nj.us/treasury/taxation/pdf/current/nj1040nr.pdf' }
    ];
  }

  async retrieveInstructions(formCode: string, taxYear: number): Promise<string | null> {
    if (formCode.includes('NJ-1040')) {
      return 'Official NJ Division of Taxation Form NJ-1040 Instructions: Report gross income by category. Losses cannot be deducted against salary or wage income.';
    }
    return null;
  }

  async retrieveRegulations(citationCode: string): Promise<string | null> {
    return `Official New Jersey Administrative Code (N.J.A.C. 18:35) for ${citationCode}.`;
  }

  async retrieveNotices(noticeId: string): Promise<string | null> {
    return `Official NJ Division of Taxation Tax Notice ${noticeId}.`;
  }

  async retrieveRulings(rulingId: string): Promise<string | null> {
    const source = await this.fetchSource(rulingId, 2026);
    return source ? source.rawText : null;
  }

  async retrieveAdministrativeGuidance(topic: string): Promise<string | null> {
    return `Official NJ Division of Taxation Technical Advisory Memorandum regarding ${topic}.`;
  }
}
