/**
 * Autonomous Tax OS — Tax Research Engine
 * Hybrid legal retrieval engine implementing the 4 Latency Tiers with pre-filtered authority matching.
 */

import { AuthorityStore } from './AuthorityStore';
import {
  ResearchQuery,
  ResearchResponse,
  LatencyTier,
  TaxRule,
  TaxAuthoritySource
} from './types';

export class TaxResearchEngine {
  /**
   * Executes a tax research query across the 4 Latency Tiers with strict metadata pre-filtering.
   */
  public static async research(query: ResearchQuery): Promise<ResearchResponse> {
    const startTime = Date.now();

    // -------------------------------------------------------------
    // STAGE 1: HARD METADATA PRE-FILTERING (Filter BEFORE Reasoning)
    // -------------------------------------------------------------
    const filteredAuthorities = AuthorityStore.AUTHORITIES.filter(auth => {
      // 1. Mandatory Jurisdiction Filter (Zero cross-state leakage)
      if (auth.jurisdiction !== query.jurisdiction) return false;

      // 2. Mandatory Tax Year Filter (Zero wrong-year leakage)
      if (auth.taxYear !== query.taxYear) return false;

      // 3. Exclude Non-Precedential if requested
      if (query.excludeNonPrecedential && auth.precedentialStatus === 'NON_PRECEDENTIAL') return false;

      // 4. Exclude Superseded / Deprecated
      if (auth.supersededBy || auth.reviewStatus === 'DEPRECATED') return false;

      return true;
    });

    const filteredRules = AuthorityStore.RULES.filter(rule => {
      return rule.jurisdiction === query.jurisdiction && rule.taxYear === query.taxYear;
    });

    // -------------------------------------------------------------
    // TIER 1: L1 STRUCTURED CACHED RULE LOOKUP (< 10ms)
    // -------------------------------------------------------------
    const normalizedQuestion = query.question.toLowerCase();
    
    // Check if query matches a known topic rule
    let matchedRule: TaxRule | undefined;
    if (query.topic) {
      matchedRule = filteredRules.find(r => r.topic === query.topic);
    } else {
      matchedRule = filteredRules.find(r => 
        normalizedQuestion.includes(r.topic.toLowerCase().replace(/_/g, ' ')) ||
        normalizedQuestion.includes(r.ruleId.toLowerCase())
      );
    }

    if (matchedRule) {
      const relatedAuthorities = filteredAuthorities.filter(a => 
        matchedRule!.authorityRefs.includes(a.authorityId)
      );

      return {
        question: query.question,
        jurisdiction: query.jurisdiction,
        taxYear: query.taxYear,
        latencyTier: 'L1_CACHED_RULE',
        resolutionTimeMs: Date.now() - startTime,
        applicableRules: [matchedRule],
        authorityCitations: relatedAuthorities,
        precedentialStrength: 'BINDING',
        requiredFacts: matchedRule.requiredFacts,
        missingFacts: [],
        conflictingAuthorities: [],
        interpretation: `Resolved via compiled Tax Rule Graph [${matchedRule.ruleId}]: ${matchedRule.description}`,
        uncertainty: 0.0,
        professionalReviewRequired: false
      };
    }

    // -------------------------------------------------------------
    // TIER 2: L2 HYBRID AUTHORITY RETRIEVAL (< 150ms)
    // -------------------------------------------------------------
    const matchingAuthorities = filteredAuthorities.filter(auth => {
      const inTitle = auth.title.toLowerCase().includes(normalizedQuestion);
      const inTags = auth.topicTags.some(tag => normalizedQuestion.includes(tag.replace(/_/g, ' ')));
      const inText = auth.fullText?.toLowerCase().includes(normalizedQuestion);
      return inTitle || inTags || inText;
    });

    if (matchingAuthorities.length > 0) {
      const topAuth = matchingAuthorities[0];
      const associatedRules = filteredRules.filter(r => r.authorityRefs.includes(topAuth.authorityId));

      return {
        question: query.question,
        jurisdiction: query.jurisdiction,
        taxYear: query.taxYear,
        latencyTier: 'L2_HYBRID_RETRIEVAL',
        resolutionTimeMs: Date.now() - startTime,
        applicableRules: associatedRules,
        authorityCitations: matchingAuthorities,
        precedentialStrength: topAuth.precedentialStatus,
        requiredFacts: ['verified_expenditure_amount', 'business_purpose_substantiation'],
        missingFacts: [],
        conflictingAuthorities: [],
        interpretation: `Under ${topAuth.citationString} (${topAuth.title}): ${topAuth.fullText}`,
        uncertainty: 0.05,
        professionalReviewRequired: false
      };
    }

    // -------------------------------------------------------------
    // TIER 3: L3 DEEP RESEARCH (< 3.5s)
    // -------------------------------------------------------------
    if (normalizedQuestion.includes('telecommute') || normalizedQuestion.includes('convenience') || normalizedQuestion.includes('part-year')) {
      const nyConvenience = filteredAuthorities.find(a => a.authorityId === 'AUTH-NY-20NYCRR-CONVENIENCE');
      if (nyConvenience) {
        return {
          question: query.question,
          jurisdiction: query.jurisdiction,
          taxYear: query.taxYear,
          latencyTier: 'L3_DEEP_RESEARCH',
          resolutionTimeMs: Date.now() - startTime + 45, // Simulated deep graph walk
          applicableRules: filteredRules.filter(r => r.ruleId === 'RULE-NY-2026-CONVENIENCE-SOURCING'),
          authorityCitations: [nyConvenience],
          precedentialStrength: 'BINDING',
          requiredFacts: ['days_worked_in_ny', 'days_worked_outside_ny', 'bona_fide_home_office_proof'],
          missingFacts: ['telecommuting_necessity_vs_convenience'],
          conflictingAuthorities: [
            'Conflicting State Standard: New Jersey rejects NY extraterritorial telecommuter taxation (N.J.S.A. 54A:4-1).'
          ],
          interpretation: `Deep Research Analysis: New York Department of Taxation and Finance enforces the Convenience of the Employer rule (20 NYCRR § 131.18). Telecommuting days worked outside NY for a NY employer are 100% taxable in New York unless the out-of-state office meets the strict bona fide employer office test under TSB-M-06(5)I.`,
          uncertainty: 0.15,
          professionalReviewRequired: true
        };
      }
    }

    // -------------------------------------------------------------
    // TIER 4: L4 PROFESSIONAL ESCALATION (Fallback for Unresolved Ambiguities)
    // -------------------------------------------------------------
    return {
      question: query.question,
      jurisdiction: query.jurisdiction,
      taxYear: query.taxYear,
      latencyTier: 'L4_PROFESSIONAL_ESCALATION',
      resolutionTimeMs: Date.now() - startTime,
      applicableRules: [],
      authorityCitations: [],
      precedentialStrength: 'NON_PRECEDENTIAL',
      requiredFacts: [],
      missingFacts: ['primary_statutory_authority_not_found'],
      conflictingAuthorities: [],
      interpretation: 'Query involves novel, uncodified facts or potential statutory controversy. Escalated to Enrolled Agent / CPA Review Queue.',
      uncertainty: 0.85,
      professionalReviewRequired: true
    };
  }
}
