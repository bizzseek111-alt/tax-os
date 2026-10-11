/**
 * Autonomous Tax OS — Live Research Decision Engine
 * 
 * Determines whether authoritative tax resolution can be completed safely using
 * Level 1 (Approved TaxRule Graph) / Level 2 (Hybrid RAG Authority Library),
 * or whether Level 3 (Live Official Source Research) or Level 4/5 Escalation is mandatory.
 */

import { TaxRule } from '@prisma/client';
import { TaxResearchRequest } from '../types';
import { OfficialSourceFreshnessService } from './sourceFreshnessService';

export interface ResearchGatingDecision {
  shouldConductLiveResearch: boolean;
  recommendedLevel: 1 | 2 | 3 | 4 | 5;
  reason: string;
  triggerFactors: string[];
  ttlExpired: boolean;
  materialityExceeded: boolean;
}

export class LiveResearchDecisionEngine {
  private static instance: LiveResearchDecisionEngine;
  private freshnessService: OfficialSourceFreshnessService;

  private constructor() {
    this.freshnessService = OfficialSourceFreshnessService.getInstance();
  }

  public static getInstance(): LiveResearchDecisionEngine {
    if (!LiveResearchDecisionEngine.instance) {
      LiveResearchDecisionEngine.instance = new LiveResearchDecisionEngine();
    }
    return LiveResearchDecisionEngine.instance;
  }

  /**
   * Evaluates research gating triggers based on request, existing rule, and source freshness.
   */
  public async evaluateGating(
    request: TaxResearchRequest,
    existingRule?: TaxRule | null
  ): Promise<ResearchGatingDecision> {
    const triggerFactors: string[] = [];
    const primaryJur = request.jurisdiction || request.jurisdictions?.[0] || 'US-FED';
    const taxYear = request.taxYear || 2026;

    // 1. Explicit Professional Verification Request
    if (request.forceLiveResearch) {
      triggerFactors.push('EXPLICIT_PROFESSIONAL_RESEARCH_REQUEST');
    }

    // 2. High Financial Materiality (> $5,000)
    let materialityExceeded = false;
    if (
      (request.materiality && request.materiality > 5000) ||
      (request.materialityCents && request.materialityCents > BigInt(500000))
    ) {
      materialityExceeded = true;
      triggerFactors.push('HIGH_MATERIALITY_AMOUNT_EXCEEDED');
    }

    // 3. Multi-State Nexus / Cross-Border Complexity
    const isMultiState = (request.jurisdictions && request.jurisdictions.length > 1) ||
      (request.confirmedFacts && request.confirmedFacts.some(f => f.key === 'multiStateNexus'));
    if (isMultiState) {
      triggerFactors.push('MULTI_STATE_CROSS_BORDER_INTERACTION');
    }

    // 4. Missing or Draft Rule in Level 1
    if (!existingRule) {
      triggerFactors.push('NO_APPROVED_TAXRULE_FOUND');
    } else {
      if (existingRule.reviewStatus === 'DRAFT' || existingRule.reviewStatus === 'AI_EXTRACTED') {
        triggerFactors.push('TAXRULE_STATUS_DRAFT_OR_PENDING');
      }

      // Check tax year compatibility
      if (existingRule.taxYear && existingRule.taxYear !== taxYear) {
        triggerFactors.push(`TAXRULE_YEAR_MISMATCH_${existingRule.taxYear}_VS_${taxYear}`);
      }

      // Check TTL and freshness if citation is available in authorityRefs
      const refs = existingRule.authorityRefs as any;
      const citation = Array.isArray(refs) && refs.length > 0 ? (refs[0].citation || refs[0]) : null;

      if (citation && typeof citation === 'string') {
        const freshness = await this.freshnessService.checkFreshness(
          primaryJur,
          citation,
          (refs[0]?.authorityType as any) || 'STATUTE',
          taxYear
        );

        if (freshness.isExpired || freshness.status === 'CHECK_REQUIRED') {
          triggerFactors.push('SOURCE_TTL_EXPIRED_CHECK_REQUIRED');
        } else if (freshness.status === 'CHANGED') {
          triggerFactors.push('OFFICIAL_SOURCE_HASH_CHANGED');
        } else if (freshness.status === 'SUPERSEDED') {
          triggerFactors.push('OFFICIAL_AUTHORITY_SUPERSEDED');
        }
      }
    }

    // Determine Recommendation
    const shouldConductLiveResearch = triggerFactors.length > 0;
    const ttlExpired = triggerFactors.includes('SOURCE_TTL_EXPIRED_CHECK_REQUIRED');

    let recommendedLevel: 1 | 2 | 3 | 4 | 5 = 1;
    let reason = 'Approved, fresh TaxRule matches taxpayer facts cleanly with high confidence (Level 1).';

    if (triggerFactors.includes('MULTI_STATE_CROSS_BORDER_INTERACTION')) {
      recommendedLevel = 4;
      reason = 'Multi-state nexus and residency interaction requires Level 4 MultiStateCoordinator research.';
    } else if (shouldConductLiveResearch) {
      recommendedLevel = 3;
      reason = `Live official-source research (Level 3) triggered by: ${triggerFactors.join(', ')}.`;
    } else if (existingRule) {
      recommendedLevel = 1;
      reason = 'Resolved via Level 1 approved TaxRule graph fast lookup.';
    } else {
      recommendedLevel = 2;
      reason = 'Resolved via Level 2 hybrid RAG authority library verification.';
    }

    return {
      shouldConductLiveResearch,
      recommendedLevel,
      reason,
      triggerFactors,
      ttlExpired,
      materialityExceeded
    };
  }
}
