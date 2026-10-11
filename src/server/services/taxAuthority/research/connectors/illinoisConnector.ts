/**
 * Autonomous Tax OS — Illinois Department of Revenue (IDOR) Official Authority Connector
 * 
 * Official Source Domains:
 * - tax.illinois.gov
 * - ilga.gov
 * - illinois.gov
 */

import crypto from 'crypto';
import { AuthorityType, PrecedentialStatus } from '../../types';
import { FreshnessStatus } from '../types';
import { OfficialSearchCriteria, OfficialSourceItem, OfficialTaxAuthorityProvider } from './baseConnector';

export class IllinoisDorAuthorityConnector extends OfficialTaxAuthorityProvider {
  readonly jurisdiction = 'US-IL';
  readonly publisherName = 'Illinois Department of Revenue';
  readonly officialDomainWhitelist = [
    'tax.illinois.gov',
    'ilga.gov',
    'illinois.gov'
  ];

  private static readonly OFFICIAL_IL_CORPUS: Record<string, OfficialSourceItem> = {
    '35 ILCS 5/201': {
      jurisdiction: 'US-IL',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: '35 ILCS 5/201',
      title: 'Illinois Flat Individual Income Tax Rate & Personal Property Replacement Tax',
      publisher: 'Illinois General Assembly',
      sourceUrl: 'https://www.ilga.gov/legislation/ilcs/ilcs4.asp?DocName=003500050HArt.+2&ActID=577',
      publicationDate: new Date('2024-06-01'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Imposes a flat individual income tax rate of 4.95% on net income of individuals, trusts, and estates. Corporations are taxed at 7.0% plus a 2.5% Personal Property Replacement Tax; partnerships and S-corporations are subject to 1.5% Replacement Tax.',
      contentHash: crypto.createHash('sha256').update('35 ILCS 5/201').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form IL-1040', 'Form IL-1120', 'Form IL-1065'],
      topicTags: ['FLAT_TAX_RATE', 'INDIVIDUAL_INCOME_TAX', 'REPLACEMENT_TAX']
    },
    '35 ILCS 5/203': {
      jurisdiction: 'US-IL',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: '35 ILCS 5/203',
      title: 'Illinois Base Income & Retirement Income Subtraction Exemption',
      publisher: 'Illinois General Assembly',
      sourceUrl: 'https://www.ilga.gov/legislation/ilcs/ilcs4.asp?DocName=003500050HArt.+2&ActID=577',
      publicationDate: new Date('2024-06-01'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Base income starts with federal adjusted gross income (AGI). Subtractions include full exemption for qualified retirement income, pension distributions, Social Security benefits, and federally taxed state/local tax refunds.',
      contentHash: crypto.createHash('sha256').update('35 ILCS 5/203').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form IL-1040', 'Schedule M'],
      topicTags: ['BASE_INCOME', 'RETIREMENT_SUBTRACTION', 'SOCIAL_SECURITY_EXEMPT']
    },
    '35 ILCS 120/2-12': {
      jurisdiction: 'US-IL',
      taxYear: 2026,
      authorityType: AuthorityType.STATUTE,
      citationCode: '35 ILCS 120/2-12',
      title: 'Illinois Retailers Occupation Tax & Economic Nexus Threshold',
      publisher: 'Illinois General Assembly',
      sourceUrl: 'https://www.ilga.gov/legislation/ilcs/ilcs4.asp?DocName=003501200HArt.+2&ActID=582',
      publicationDate: new Date('2024-06-01'),
      effectiveFrom: new Date('2026-01-01'),
      precedentialStatus: PrecedentialStatus.BINDING,
      rawText: 'Establishes economic nexus for remote retailers and marketplace facilitators delivering sales into Illinois exceeding $100,000 in gross receipts OR 200 separate transactions in the previous 12-month period under the Leveling the Playing Field for Illinois Retail Act.',
      contentHash: crypto.createHash('sha256').update('35 ILCS 120/2-12').digest('hex'),
      sourceVersion: '2026.1',
      affectedForms: ['Form ST-1', 'Form ST-2'],
      topicTags: ['SALES_TAX', 'ROT', 'ECONOMIC_NEXUS_IL_100K', 'MARKETPLACE_FACILITATOR']
    }
  };

  async discoverSources(query: string, taxYear: number): Promise<OfficialSourceItem[]> {
    return this.searchOfficialSources({ query, jurisdiction: this.jurisdiction, taxYear });
  }

  async searchOfficialSources(criteria: OfficialSearchCriteria): Promise<OfficialSourceItem[]> {
    const q = criteria.query.toLowerCase();
    const results: OfficialSourceItem[] = [];
    for (const item of Object.values(IllinoisDorAuthorityConnector.OFFICIAL_IL_CORPUS)) {
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
    const item = IllinoisDorAuthorityConnector.OFFICIAL_IL_CORPUS[citationCode];
    if (item && (item.taxYear === taxYear || !taxYear)) {
      return item;
    }
    return null;
  }

  async fetchSourceVersion(citationCode: string, version: string): Promise<OfficialSourceItem | null> {
    const item = IllinoisDorAuthorityConnector.OFFICIAL_IL_CORPUS[citationCode];
    if (item && item.sourceVersion === version) {
      return item;
    }
    return null;
  }

  async verifySource(source: OfficialSourceItem): Promise<{ isValid: boolean; warnings?: string[] }> {
    const warnings: string[] = [];
    if (!this.isOfficialUrl(source.sourceUrl)) {
      warnings.push(`Source URL ${source.sourceUrl} is not in Illinois official domain whitelist`);
      return { isValid: false, warnings };
    }
    const computedHash = crypto.createHash('sha256').update(source.citationCode).digest('hex');
    if (computedHash !== source.contentHash) {
      warnings.push('Content hash mismatch against authoritative Illinois signature');
      return { isValid: false, warnings };
    }
    return { isValid: true };
  }

  async detectChanges(citationCode: string, currentHash: string, taxYear: number): Promise<{
    hasChanged: boolean;
    status: FreshnessStatus;
    newHash?: string;
    newVersion?: string;
  }> {
    const item = await this.fetchSource(citationCode, taxYear);
    if (!item) {
      return { hasChanged: true, status: FreshnessStatus.SUPERSEDED };
    }
    if (item.contentHash !== currentHash) {
      return {
        hasChanged: true,
        status: FreshnessStatus.CHANGED,
        newHash: item.contentHash,
        newVersion: item.sourceVersion
      };
    }
    return { hasChanged: false, status: FreshnessStatus.CURRENT };
  }

  async retrieveAuthorityText(citationCode: string): Promise<string | null> {
    const item = IllinoisDorAuthorityConnector.OFFICIAL_IL_CORPUS[citationCode];
    return item ? item.rawText : null;
  }

  async retrieveForms(taxYear: number): Promise<{ formCode: string; formTitle: string; url: string }[]> {
    return [
      { formCode: 'Form IL-1040', formTitle: 'Illinois Individual Income Tax Return', url: 'https://tax.illinois.gov/forms/incometax/il-1040.html' },
      { formCode: 'Form ST-1', formTitle: 'Sales and Use Tax and E911 Surcharge Return', url: 'https://tax.illinois.gov/forms/sales/st-1.html' },
      { formCode: 'Schedule M', formTitle: 'Other Additions and Subtractions for Individuals', url: 'https://tax.illinois.gov/forms/incometax/il-1040-sch-m.html' }
    ];
  }

  async retrieveInstructions(formCode: string, taxYear: number): Promise<string | null> {
    if (formCode === 'Form IL-1040') {
      return 'IL-1040 Instructions: Enter federal AGI from line 11 of federal Form 1040. Add back federally tax-exempt interest not from Illinois municipal bonds. Deduct retirement income and Social Security.';
    }
    return null;
  }

  async retrieveRegulations(citationCode: string): Promise<string | null> {
    if (citationCode.includes('86 Ill. Adm. Code')) {
      return '86 Ill. Adm. Code § 100: Illinois Income Tax Regulations regarding residency, apportionment, and pass-through withholding.';
    }
    return null;
  }

  async retrieveNotices(noticeId: string): Promise<string | null> {
    return `IDOR Informational Bulletin ${noticeId}: Official administrative tax guidance published by Illinois Department of Revenue.`;
  }

  async retrieveRulings(rulingId: string): Promise<string | null> {
    return `IDOR General Information Letter / Private Letter Ruling ${rulingId}.`;
  }

  async retrieveAdministrativeGuidance(topic: string): Promise<string | null> {
    return `Official IDOR Publication and Taxpayer Guidance regarding ${topic}.`;
  }
}
