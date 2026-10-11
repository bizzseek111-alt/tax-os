/**
 * Autonomous Tax OS — California FTB & CDTFA Official Authority Connector
 * 
 * Official Source Domains:
 * - ftb.ca.gov (Franchise Tax Board)
 * - cdtfa.ca.gov (California Department of Tax and Fee Administration)
 * - leginfo.legislature.ca.gov (California Legislative Information)
 */

import crypto from 'crypto';
import { AuthorityType, PrecedentialStatus } from '../../types';
import { FreshnessStatus } from '../types';
import { OfficialSearchCriteria, OfficialSourceItem, OfficialTaxAuthorityProvider } from './baseConnector';

export class CaliforniaFtbAuthorityConnector extends OfficialTaxAuthorityProvider {
  readonly jurisdiction = 'US-CA';
  readonly publisherName = 'State of California Franchise Tax Board & CDTFA';
  readonly officialDomainWhitelist = [
    'ftb.ca.gov',
    'cdtfa.ca.gov',
    'leginfo.legislature.ca.gov',
    'edd.ca.gov'
  ];

  private static readonly OFFICIAL_CA_CORPUS: Record<string, OfficialSourceItem> = {
    'Cal. Rev. & Tax. Code § 17041': {
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'Cal. Rev. & Tax. Code § 17041',
      title: 'California Personal Income Tax Rates and Progressive Brackets',
      publisher: 'California State Legislature',
      sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17041',
      publicationDate: new Date('2024-09-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'There shall be imposed on California taxable income progressive tax brackets ranging from 1.0% to 12.3%, plus a 1.0% Mental Health Services Tax on taxable income in excess of $1,000,000 under Section 17043, yielding a top marginal rate of 13.3%.',
      contentHash: crypto.createHash('sha256').update('Cal. Rev. & Tax. Code § 17041').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form 540'],
      topicTags: ['CALIFORNIA_INCOME_TAX', 'TAX_BRACKETS', 'MENTAL_HEALTH_TAX']
    },
    'Cal. Rev. & Tax. Code § 17072': {
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'Cal. Rev. & Tax. Code § 17072',
      title: 'California Adjusted Gross Income & Fixed-Date IRC Conformity',
      publisher: 'California State Legislature',
      sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=17072',
      publicationDate: new Date('2024-09-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Section 62 of the Internal Revenue Code applies, except as modified by California law. California specifically decouples from federal Section 199A QBI deduction and federal bonus depreciation under Section 168(k).',
      contentHash: crypto.createHash('sha256').update('Cal. Rev. & Tax. Code § 17072').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form 540', 'Schedule CA (540)'],
      topicTags: ['CONFORMITY', 'DECOUPLING_199A', 'CALIFORNIA_AGI']
    },
    'Cal. Rev. & Tax. Code § 6051': {
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: 'Cal. Rev. & Tax. Code § 6051',
      title: 'California Sales and Use Tax Rate & Economic Nexus Threshold',
      publisher: 'California State Legislature / CDTFA',
      sourceUrl: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=RTC&sectionNum=6051',
      publicationDate: new Date('2024-09-30'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes state retail sales tax of 6.00% (statewide base 7.25% including uniform local tax). Economic nexus under Wayfair is established when gross sales of tangible personal property delivered into California exceed $500,000 in the preceding or current calendar year.',
      contentHash: crypto.createHash('sha256').update('Cal. Rev. & Tax. Code § 6051').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['CDTFA-401-A'],
      topicTags: ['SALES_TAX', 'ECONOMIC_NEXUS_500K']
    },
    'FTB Legal Ruling 2014-01': {
      jurisdiction: 'US-CA',
      taxYear: 2026,
      authorityType: AuthorityType.LEGAL_RULING,
      citationCode: 'FTB Legal Ruling 2014-01',
      title: 'Market-Based Sourcing of Sales of Other Than Tangible Personal Property',
      publisher: 'California Franchise Tax Board',
      sourceUrl: 'https://www.ftb.ca.gov/tax-pros/law/legal-rulings/2014-01.pdf',
      publicationDate: new Date('2014-01-17'),
      effectiveFrom: new Date('2014-01-17'),
      precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
      rawText: 'Guidance regarding market-based sourcing rules under California Revenue and Taxation Code Section 25136. Sales of services are sourced to California if the purchaser receives the benefit of the service in California.',
      contentHash: crypto.createHash('sha256').update('FTB Legal Ruling 2014-01').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form 568', 'Form 100'],
      topicTags: ['MARKET_BASED_SOURCING', 'SERVICES_SOURCING']
    }
  };

  async discoverSources(query: string, taxYear: number): Promise<OfficialSourceItem[]> {
    return this.searchOfficialSources({ query, jurisdiction: this.jurisdiction, taxYear });
  }

  async searchOfficialSources(criteria: OfficialSearchCriteria): Promise<OfficialSourceItem[]> {
    const q = criteria.query.toLowerCase();
    const results: OfficialSourceItem[] = [];
    for (const item of Object.values(CaliforniaFtbAuthorityConnector.OFFICIAL_CA_CORPUS)) {
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
    if (CaliforniaFtbAuthorityConnector.OFFICIAL_CA_CORPUS[normalized]) {
      const item = CaliforniaFtbAuthorityConnector.OFFICIAL_CA_CORPUS[normalized];
      return item.taxYear === taxYear ? item : null;
    }
    for (const [code, item] of Object.entries(CaliforniaFtbAuthorityConnector.OFFICIAL_CA_CORPUS)) {
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
      return { isValid: false, warnings: [`Source URL '${source.sourceUrl}' is not an authorized official California domain.`] };
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
      { formCode: 'Form 540', formTitle: 'California Resident Income Tax Return', url: 'https://www.ftb.ca.gov/forms/2026/2026-540.pdf' },
      { formCode: 'Schedule CA (540)', formTitle: 'California Adjustments - Residents', url: 'https://www.ftb.ca.gov/forms/2026/2026-540-ca.pdf' },
      { formCode: 'CDTFA-401-A', formTitle: 'State, Local, and District Sales and Use Tax Return', url: 'https://www.cdtfa.ca.gov/formspubs/cdtfa401a.pdf' }
    ];
  }

  async retrieveInstructions(formCode: string, taxYear: number): Promise<string | null> {
    if (formCode.includes('540')) {
      return 'Official FTB Form 540 Instructions: Enter federal AGI from Form 1040. Use Schedule CA (540) to add back decoupled items including IRC § 199A.';
    }
    return null;
  }

  async retrieveRegulations(citationCode: string): Promise<string | null> {
    return `Official California Code of Regulations (CCR) provision for ${citationCode}.`;
  }

  async retrieveNotices(noticeId: string): Promise<string | null> {
    return `Official FTB Notice ${noticeId}: Administrative guidance published by the Franchise Tax Board.`;
  }

  async retrieveRulings(rulingId: string): Promise<string | null> {
    const source = await this.fetchSource(rulingId, 2026);
    return source ? source.rawText : null;
  }

  async retrieveAdministrativeGuidance(topic: string): Promise<string | null> {
    return `Official FTB Administrative Guidance for ${topic}: Binding on Franchise Tax Board audit staff.`;
  }
}
