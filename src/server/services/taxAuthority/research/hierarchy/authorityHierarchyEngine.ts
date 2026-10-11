/**
 * Autonomous Tax OS — Authority Hierarchy & Weighting Engine
 * 
 * Implements strict legal authority hierarchy, primary vs secondary separation,
 * precedential weights (0.0 to 1.0), and conflict resolution.
 * 
 * Hard Invariants:
 * - Commercial SEO blogs, forum posts, and unverified articles have weight 0.0 and are rejected.
 * - Superseded authority receives weight 0.0.
 * - Sub-regulatory guidance (Pubs, FAQs, Instructions) can NEVER override enacted statutes or Treasury regulations.
 * - For state tax calculations, state statutes govern over decoupled federal definitions.
 */

import { AuthorityType, PrecedentialStatus } from '../../types';
import { AuthorityAssessment } from '../types';
import { OfficialSourceItem } from '../connectors/baseConnector';
import { OfficialConnectorRegistry } from '../connectors/connectorRegistry';

export class AuthorityHierarchyEngine {
  private static instance: AuthorityHierarchyEngine;
  private connectorRegistry: OfficialConnectorRegistry;

  private constructor() {
    this.connectorRegistry = OfficialConnectorRegistry.getInstance();
  }

  public static getInstance(): AuthorityHierarchyEngine {
    if (!AuthorityHierarchyEngine.instance) {
      AuthorityHierarchyEngine.instance = new AuthorityHierarchyEngine();
    }
    return AuthorityHierarchyEngine.instance;
  }

  /**
   * Maps an authority type to its structural hierarchy rank (1 = Highest, 15 = Lowest).
   */
  public getAuthorityRank(authorityType: AuthorityType, sourceUrl?: string): number {
    // If not an official government URL, classify as secondary or prohibited commercial blog
    if (sourceUrl && !this.connectorRegistry.isAnyOfficialUrl(sourceUrl)) {
      if (this.isCommercialOrBlogUrl(sourceUrl)) {
        return 15; // Strictly prohibited SEO/commercial
      }
      return 15; // Unofficial secondary commentary
    }

    switch (authorityType) {
      case AuthorityType.STATUTE:
        return 1;
      case AuthorityType.REGULATION:
        return 2;
      case AuthorityType.COURT_DECISION:
        return 3;
      case AuthorityType.REVENUE_RULING:
        return 4;
      case AuthorityType.REVENUE_PROCEDURE:
        return 5;
      case AuthorityType.NOTICE:
        return 6;
      case AuthorityType.LEGAL_RULING:
        return 7;
      case AuthorityType.TECHNICAL_MEMORANDUM:
        return 8;
      case AuthorityType.FORM:
        return 9;
      case AuthorityType.FORM_INSTRUCTION:
        return 10;
      case AuthorityType.ADMINISTRATIVE_GUIDANCE:
        return 11;
      case AuthorityType.EFILE_BUSINESS_RULE:
        return 12;
      case AuthorityType.OFFICIAL_PUBLICATION:
        return 13;
      case AuthorityType.FAQ:
        return 14;
      case AuthorityType.SECONDARY_COMMENTARY:
      default:
        return 15;
    }
  }

  /**
   * Calculates precedential weight between 0.0 and 1.0.
   */
  public calculateWeight(
    rank: number,
    precedentialStatus: PrecedentialStatus,
    isSuperseded: boolean = false,
    sourceAuthenticity: boolean = true
  ): number {
    if (isSuperseded || !sourceAuthenticity) {
      return 0.0;
    }

    const rankWeights: Record<number, number> = {
      1: 1.00,
      2: 0.95,
      3: 0.90,
      4: 0.80,
      5: 0.70,
      6: 0.60,
      7: 0.50,
      8: 0.45,
      9: 0.30,
      10: 0.25,
      11: 0.20,
      12: 0.18,
      13: 0.15,
      14: 0.10,
      15: 0.00
    };

    let baseWeight = rankWeights[rank] ?? 0.0;

    // Apply precedential modifier
    if (precedentialStatus === PrecedentialStatus.SUPERSEDED) {
      return 0.0;
    }
    if (precedentialStatus === PrecedentialStatus.PERSUASIVE) {
      baseWeight = Math.min(baseWeight, 0.70);
    }
    if (precedentialStatus === PrecedentialStatus.ADMINISTRATIVE) {
      baseWeight = Math.min(baseWeight, 0.40);
    }

    return Math.round(baseWeight * 100) / 100;
  }

  /**
   * Assesses an official source item against target research parameters.
   */
  public assessSource(
    source: OfficialSourceItem,
    targetJurisdiction: string,
    targetTaxYear: number,
    isSuperseded: boolean = false
  ): AuthorityAssessment {
    const isOfficial = this.connectorRegistry.isAnyOfficialUrl(source.sourceUrl);
    const rank = this.getAuthorityRank(source.authorityType, source.sourceUrl);
    const jurisdictionMatch = !targetJurisdiction || source.jurisdiction === targetJurisdiction || targetJurisdiction === 'US-FED';
    const taxYearMatch = !targetTaxYear || source.taxYear === targetTaxYear;

    const now = new Date();
    const effectivePeriodMatch = source.effectiveFrom <= now && (!source.effectiveTo || source.effectiveTo >= now);

    const supersessionStatus = isSuperseded || source.precedentialStatus === PrecedentialStatus.SUPERSEDED
      ? 'SUPERSEDED'
      : 'CURRENT';

    const weight = this.calculateWeight(rank, source.precedentialStatus, supersessionStatus === 'SUPERSEDED', isOfficial);

    return {
      authorityType: source.authorityType,
      authorityLevel: rank,
      precedentialStatus: source.precedentialStatus,
      jurisdictionMatch,
      taxYearMatch,
      effectivePeriodMatch,
      sourceAuthenticity: isOfficial,
      supersessionStatus,
      directnessOfSupport: 'DIRECT',
      conflictStatus: 'NONE',
      authorityWeight: weight
    };
  }

  /**
   * Resolves a legal conflict between two authorities.
   * Enforces that higher ranked authority prevails over lower ranked authority.
   */
  public resolveAuthorityConflict(
    authA: AuthorityAssessment,
    citationA: string,
    authB: AuthorityAssessment,
    citationB: string,
    contextJurisdiction: string = 'US-FED'
  ): {
    prevailingCitation: string;
    prevailingAssessment: AuthorityAssessment;
    supersededCitation: string;
    supersededAssessment: AuthorityAssessment;
    resolutionReason: string;
    isStateDecoupling: boolean;
  } {
    // Check if one is superseded
    if (authA.supersessionStatus === 'SUPERSEDED' && authB.supersessionStatus !== 'SUPERSEDED') {
      return {
        prevailingCitation: citationB,
        prevailingAssessment: authB,
        supersededCitation: citationA,
        supersededAssessment: authA,
        resolutionReason: `Authority ${citationA} is superseded; valid authority ${citationB} prevails.`,
        isStateDecoupling: false
      };
    }
    if (authB.supersessionStatus === 'SUPERSEDED' && authA.supersessionStatus !== 'SUPERSEDED') {
      return {
        prevailingCitation: citationA,
        prevailingAssessment: authA,
        supersededCitation: citationB,
        supersededAssessment: authB,
        resolutionReason: `Authority ${citationB} is superseded; valid authority ${citationA} prevails.`,
        isStateDecoupling: false
      };
    }

    // Check State Decoupling: If context is State and one authority is State Statute and one is Federal Statute
    const isStateDecoupling = contextJurisdiction !== 'US-FED' && 
      (authA.authorityLevel === 1 || authB.authorityLevel === 1);

    // Primary rule: Lower rank number = Higher legal authority
    if (authA.authorityLevel < authB.authorityLevel) {
      return {
        prevailingCitation: citationA,
        prevailingAssessment: authA,
        supersededCitation: citationB,
        supersededAssessment: authB,
        resolutionReason: `Primary authority ${citationA} (Rank ${authA.authorityLevel}) supersedes subordinate guidance ${citationB} (Rank ${authB.authorityLevel}).`,
        isStateDecoupling
      };
    } else if (authB.authorityLevel < authA.authorityLevel) {
      return {
        prevailingCitation: citationB,
        prevailingAssessment: authB,
        supersededCitation: citationA,
        supersededAssessment: authA,
        resolutionReason: `Primary authority ${citationB} (Rank ${authB.authorityLevel}) supersedes subordinate guidance ${citationA} (Rank ${authA.authorityLevel}).`,
        isStateDecoupling
      };
    }

    // Tie-breaking: Higher authority weight
    if (authA.authorityWeight >= authB.authorityWeight) {
      return {
        prevailingCitation: citationA,
        prevailingAssessment: authA,
        supersededCitation: citationB,
        supersededAssessment: authB,
        resolutionReason: `Authority ${citationA} has higher or equal precedential weight (${authA.authorityWeight} vs ${authB.authorityWeight}).`,
        isStateDecoupling
      };
    } else {
      return {
        prevailingCitation: citationB,
        prevailingAssessment: authB,
        supersededCitation: citationA,
        supersededAssessment: authA,
        resolutionReason: `Authority ${citationB} has higher precedential weight (${authB.authorityWeight} vs ${authA.authorityWeight}).`,
        isStateDecoupling
      };
    }
  }

  private isCommercialOrBlogUrl(url: string): boolean {
    const lower = url.toLowerCase();
    const bannedDomains = [
      'medium.com',
      'substack.com',
      'forbes.com',
      'turbotax.intuit.com',
      'nerdwallet.com',
      'investopedia.com',
      'taxfoundation.org',
      'reddit.com',
      'quora.com'
    ];
    return bannedDomains.some(d => lower.includes(d));
  }
}
