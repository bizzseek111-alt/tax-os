/**
 * Autonomous Tax OS — Abstract Official Tax Authority Provider
 * 
 * Defines the contract for real-time live official authority discovery,
 * verification, change detection, and legal retrieval across official agency portals.
 * 
 * Anti-Tampering Invariant:
 * Only verified official domains (.gov or statutory legislature mirrors) are permitted.
 * Commercial SEO blogs, promotional articles, and social posts are strictly rejected.
 */

import { AuthorityType, PrecedentialStatus } from '../../types';
import { FreshnessStatus } from '../types';

export interface OfficialSourceItem {
  jurisdiction: string;
  taxYear: number;
  authorityType: AuthorityType;
  citationCode: string;
  title: string;
  publisher: string;
  sourceUrl: string;
  publicationDate: Date;
  effectiveFrom: Date;
  effectiveTo?: Date;
  precedentialStatus: PrecedentialStatus;
  rawText: string;
  contentHash: string;
  sourceVersion: string;
  affectedForms?: string[];
  topicTags?: string[];
}

export interface OfficialSearchCriteria {
  query: string;
  jurisdiction: string;
  taxYear: number;
  authorityTypes?: AuthorityType[];
  topic?: string;
  formCode?: string;
}

export abstract class OfficialTaxAuthorityProvider {
  abstract readonly jurisdiction: string;
  abstract readonly publisherName: string;
  abstract readonly officialDomainWhitelist: string[];

  /**
   * Validates whether a given URL belongs to an authorized official government domain.
   */
  public isOfficialUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      return this.officialDomainWhitelist.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }

  /**
   * Discovers sources dynamically from the official authority repository or live API.
   */
  abstract discoverSources(query: string, taxYear: number): Promise<OfficialSourceItem[]>;

  /**
   * Searches official legal authority matching search criteria.
   */
  abstract searchOfficialSources(criteria: OfficialSearchCriteria): Promise<OfficialSourceItem[]>;

  /**
   * Fetches a specific authoritative legal source by statutory citation code.
   */
  abstract fetchSource(citationCode: string, taxYear: number): Promise<OfficialSourceItem | null>;

  /**
   * Fetches a specific version of a statutory source.
   */
  abstract fetchSourceVersion(citationCode: string, version: string): Promise<OfficialSourceItem | null>;

  /**
   * Verifies the authenticity, signature, and cryptographic hash of a source item.
   */
  abstract verifySource(source: OfficialSourceItem): Promise<{ isValid: boolean; warnings?: string[] }>;

  /**
   * Detects whether official authority has changed compared to a known hash.
   */
  abstract detectChanges(citationCode: string, currentHash: string, taxYear: number): Promise<{
    hasChanged: boolean;
    status: FreshnessStatus;
    newHash?: string;
    newVersion?: string;
  }>;

  /**
   * Retrieves raw statutory or regulatory text for an official legal citation.
   */
  abstract retrieveAuthorityText(citationCode: string): Promise<string | null>;

  /**
   * Retrieves official return forms and schedules.
   */
  abstract retrieveForms(taxYear: number): Promise<{ formCode: string; formTitle: string; url: string }[]>;

  /**
   * Retrieves official form instructions.
   */
  abstract retrieveInstructions(formCode: string, taxYear: number): Promise<string | null>;

  /**
   * Retrieves official regulations (e.g. Treasury Regulations, State Codes).
   */
  abstract retrieveRegulations(citationCode: string): Promise<string | null>;

  /**
   * Retrieves official notices (IRS Notices, FTB Notices, etc.).
   */
  abstract retrieveNotices(noticeId: string): Promise<string | null>;

  /**
   * Retrieves published official rulings (Rev. Rul., Legal Rulings).
   */
  abstract retrieveRulings(rulingId: string): Promise<string | null>;

  /**
   * Retrieves official sub-regulatory administrative guidance.
   */
  abstract retrieveAdministrativeGuidance(topic: string): Promise<string | null>;
}
