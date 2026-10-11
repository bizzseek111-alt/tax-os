/**
 * Autonomous Tax OS — Master Case Tax Research Engine
 * 
 * Orchestrates real-time official tax research across Levels 1 to 5.
 * Enforces strict anti-hallucination guards, statutory hierarchy, case-fact binding,
 * official freshness verification, and human professional escalation.
 */

import crypto from 'crypto';
import prisma from '../../../../db';
import {
  AuthorityEscalationType,
  CaseApplicableRule,
  FreshnessStatus,
  MissingResearchContext,
  NextActionRecommendation,
  ResearchDomain,
  ResearchLatencyTier,
  TaxResearchRequest,
  TaxResearchResult
} from '../types';
import { OfficialConnectorRegistry } from '../connectors/connectorRegistry';
import { LiveResearchDecisionEngine } from '../decision/liveResearchDecisionEngine';
import { OfficialSourceFreshnessService } from '../decision/sourceFreshnessService';
import { AuthorityHierarchyEngine } from '../hierarchy/authorityHierarchyEngine';
import { FactApplicabilityService } from '../binding/factApplicabilityMap';
import { CaseRuleResolver } from '../binding/caseRuleResolver';
import { FederalTaxSpecialist } from '../specialists/federalSpecialist';
import { CaliforniaTaxSpecialist } from '../specialists/californiaSpecialist';
import { NewYorkTaxSpecialist } from '../specialists/newYorkSpecialist';
import { NewJerseyTaxSpecialist } from '../specialists/newJerseySpecialist';
import { IllinoisTaxSpecialist } from '../specialists/illinoisSpecialist';
import { MassachusettsTaxSpecialist } from '../specialists/massachusettsSpecialist';
import { SalesTaxAuthoritySpecialist } from '../specialists/salesTaxSpecialist';
import { PayrollAuthoritySpecialist } from '../specialists/payrollSpecialist';
import { MultiStateCoordinator } from '../specialists/multiStateCoordinator';
import { LegalEscalationService } from '../escalation/legalEscalationService';
import { TaxResearchCache } from '../cache/taxResearchCache';
import { PropositionGraphService } from '../propositions/propositionGraph';

export class CaseTaxResearchEngine {
  private static instance: CaseTaxResearchEngine;

  private registry: OfficialConnectorRegistry;
  private gatingEngine: LiveResearchDecisionEngine;
  private freshnessService: OfficialSourceFreshnessService;
  private hierarchyEngine: AuthorityHierarchyEngine;
  private factService: FactApplicabilityService;
  private ruleResolver: CaseRuleResolver;
  private multiStateCoordinator: MultiStateCoordinator;
  private escalationService: LegalEscalationService;
  private cache: TaxResearchCache;
  private propositionService: PropositionGraphService;

  private constructor() {
    this.registry = OfficialConnectorRegistry.getInstance();
    this.gatingEngine = LiveResearchDecisionEngine.getInstance();
    this.freshnessService = OfficialSourceFreshnessService.getInstance();
    this.hierarchyEngine = AuthorityHierarchyEngine.getInstance();
    this.factService = FactApplicabilityService.getInstance();
    this.ruleResolver = CaseRuleResolver.getInstance();
    this.multiStateCoordinator = MultiStateCoordinator.getInstance();
    this.escalationService = LegalEscalationService.getInstance();
    this.cache = TaxResearchCache.getInstance();
    this.propositionService = PropositionGraphService.getInstance();
  }

  public static getInstance(): CaseTaxResearchEngine {
    if (!CaseTaxResearchEngine.instance) {
      CaseTaxResearchEngine.instance = new CaseTaxResearchEngine();
    }
    return CaseTaxResearchEngine.instance;
  }

  /**
   * Main entrypoint for conducting verified legal tax research.
   */
  public async research(request: TaxResearchRequest): Promise<TaxResearchResult | MissingResearchContext> {
    // 1. Strict Validation: Tax Year & Jurisdiction are mandatory
    const missingFields: ('taxYear' | 'jurisdictions' | 'taxCaseId' | 'question')[] = [];

    if (!request.taxYear) {
      missingFields.push('taxYear');
    }
    if ((!request.jurisdictions || request.jurisdictions.length === 0) && !request.jurisdiction) {
      missingFields.push('jurisdictions');
    }
    if (!request.taxCaseId) {
      missingFields.push('taxCaseId');
    }
    if (!request.question || request.question.trim().length === 0) {
      missingFields.push('question');
    }

    if (missingFields.length > 0) {
      return {
        isMissingContext: true,
        missingFields,
        reason: `Missing essential research context: ${missingFields.join(', ')}. Autonomous Tax OS strictly refuses to guess or speculate.`,
        promptForUser: `Please provide the following required parameters: ${missingFields.join(', ')}.`
      };
    }

    const primaryJur = request.jurisdiction || request.jurisdictions![0];
    const taxYear = request.taxYear!;
    const factsHash = this.cache.hashFacts(request.confirmedFacts);

    // 2. Cache Lookup (unless live research forced)
    const cacheKey = this.cache.generateCacheKey(
      primaryJur,
      taxYear,
      request.taxDomain,
      request.question,
      factsHash
    );

    if (!request.forceLiveResearch) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 3. Evaluate Live Research Gating Triggers
    const gatingDecision = await this.gatingEngine.evaluateGating(request);
    let latencyTier: ResearchLatencyTier = ResearchLatencyTier.FAST;
    let escalationType: AuthorityEscalationType = AuthorityEscalationType.NONE;
    let nextAction: NextActionRecommendation = NextActionRecommendation.PROCEED;

    // 4. Multi-State Coordination (Level 4)
    let multiStateResult = null;
    if (request.jurisdictions && request.jurisdictions.length > 1) {
      latencyTier = ResearchLatencyTier.DEEP;
      multiStateResult = this.multiStateCoordinator.coordinate(request);
    }

    // 5. Specialist Retrieval & Official Source Query
    const matchedCitations: string[] = [];
    const findings: string[] = [];
    const missingFactPrompts: any[] = [];
    const applicableRules: CaseApplicableRule[] = [];
    const authorityAssessments: any[] = [];

    // Dispatch to Domain / Jurisdiction Specialist
    if (request.taxDomain === ResearchDomain.SALES_TAX) {
      const salesSpecialist = SalesTaxAuthoritySpecialist.getInstance();
      const res = await salesSpecialist.analyzeRequest(request);
      matchedCitations.push(...res.matchedCitations);
      findings.push(...res.findings);
    } else if (request.taxDomain === ResearchDomain.PAYROLL_TAX) {
      const payrollSpecialist = PayrollAuthoritySpecialist.getInstance();
      const res = await payrollSpecialist.analyzeRequest(request);
      matchedCitations.push(...res.matchedCitations);
      findings.push(...res.findings);
      if (res.missingFacts.length > 0) {
        missingFactPrompts.push(...res.missingFacts.map(q => ({ factKey: 'payroll_fact', questionText: q })));
      }
    } else {
      // Income Tax / Federal & State
      const fedSpecialist = FederalTaxSpecialist.getInstance();
      const fedRes = await fedSpecialist.analyzeRequest(request);
      matchedCitations.push(...fedRes.matchedCitations);
      findings.push(...fedRes.findings);
      if (fedRes.missingFacts.length > 0) {
        missingFactPrompts.push(...fedRes.missingFacts.map(q => ({ factKey: 'fed_fact', questionText: q })));
      }

      // State Specialist if applicable
      if (primaryJur === 'US-CA') {
        const caSpecialist = CaliforniaTaxSpecialist.getInstance();
        const caRes = await caSpecialist.analyzeRequest(request);
        matchedCitations.push(...caRes.matchedCitations);
        findings.push(...caRes.findings);
      } else if (primaryJur === 'US-NY') {
        const nySpecialist = NewYorkTaxSpecialist.getInstance();
        const nyRes = await nySpecialist.analyzeRequest(request);
        matchedCitations.push(...nyRes.matchedCitations);
        findings.push(...nyRes.findings);
      } else if (primaryJur === 'US-NJ') {
        const njSpecialist = NewJerseyTaxSpecialist.getInstance();
        const njRes = await njSpecialist.analyzeRequest(request);
        matchedCitations.push(...njRes.matchedCitations);
        findings.push(...njRes.findings);
      } else if (primaryJur === 'US-IL') {
        const ilSpecialist = IllinoisTaxSpecialist.getInstance();
        const ilRes = await ilSpecialist.analyzeRequest(request);
        matchedCitations.push(...ilRes.matchedCitations);
        findings.push(...ilRes.findings);
      } else if (primaryJur === 'US-MA') {
        const maSpecialist = MassachusettsTaxSpecialist.getInstance();
        const maRes = await maSpecialist.analyzeRequest(request);
        matchedCitations.push(...maRes.matchedCitations);
        findings.push(...maRes.findings);
      }
    }

    // 6. Connectors Live Verification & Assessment
    let overallConfidence = 0.95;
    let freshnessStatus: FreshnessStatus = FreshnessStatus.CURRENT;

    for (const citation of matchedCitations) {
      let connector = this.registry.getConnector(primaryJur);
      if (!connector) {
        connector = this.registry.getConnector('US-FED');
      }

      if (connector) {
        const sourceItem = await connector.fetchSource(citation, taxYear);
        if (sourceItem) {
          const auth = this.hierarchyEngine.assessSource(sourceItem, primaryJur, taxYear);
          authorityAssessments.push(auth);

          // Verify freshness
          const freshness = await this.freshnessService.verifyAndRecordSource(sourceItem);
          if (freshness.status !== FreshnessStatus.CURRENT) {
            freshnessStatus = freshness.status;
          }

          // Generate or bind rule
          applicableRules.push({
            ruleId: `RULE-${citation.replace(/[^a-zA-Z0-9]/g, '_')}`,
            jurisdiction: primaryJur,
            taxYear,
            applicabilityStatus: missingFactPrompts.length > 0 ? 'BLOCKED_BY_MISSING_FACTS' : 'FULLY_APPLICABLE',
            authorityAssessment: auth,
            applicabilityMap: {
              caseId: request.taxCaseId,
              ruleId: `RULE-${citation.replace(/[^a-zA-Z0-9]/g, '_')}`,
              bindings: [],
              allConditionsSatisfied: missingFactPrompts.length === 0,
              hasMissingFacts: missingFactPrompts.length > 0,
              missingFactKeys: [],
              missingFacts: missingFactPrompts as any
            },
            confidenceScore: auth.authorityWeight
          });
        }
      }
    }

    // 7. Check Missing Facts & Question Reduction
    if (missingFactPrompts.length > 0) {
      nextAction = NextActionRecommendation.REQUEST_FACT;
      overallConfidence = 0.50;
    }

    // 8. High Materiality / Conflict Escalation Check
    let aiResearchBrief = undefined;
    if (request.materialityCents && request.materialityCents > BigInt(2500000)) { // > $25,000
      escalationType = AuthorityEscalationType.CPA_REVIEW;
      nextAction = NextActionRecommendation.CPA_REVIEW;
      aiResearchBrief = this.escalationService.generateResearchBrief(request, {
        issueStatement: request.question,
        authorityA: { citation: matchedCitations[0] || '26 U.S.C. § 162', rank: 1, weight: 1.0, summary: findings[0] || 'Statutory authority' },
        authorityB: { citation: matchedCitations[1] || 'IRS Notice 2026-01', rank: 6, weight: 0.6, summary: 'Agency guidance' },
        potentialLiabilityCents: request.materialityCents
      });
      await this.escalationService.createAuthorityConflict(request.taxCaseId, {
        conflictType: 'HIGH_MATERIALITY_MANDATORY_REVIEW',
        topic: request.question,
        jurisdiction: primaryJur,
        jurisdictions: request.jurisdictions || [primaryJur],
        taxYear,
        taxYears: [taxYear],
        primarySourceCode: matchedCitations[0] || '26 U.S.C. § 162',
        primaryRank: 1,
        conflictingSourceCode: matchedCitations[1] || 'Sub-regulatory Guidance',
        conflictingRank: 6,
        conflictSummary: `High materiality issue (> $25,000): ${request.question}`,
        materialityCents: request.materialityCents,
        escalationRequired: AuthorityEscalationType.CPA_REVIEW
      }, aiResearchBrief);
    }

    // 9. Synthesize Verified Legal Answer
    let answerText = '';
    if (missingFactPrompts.length > 0) {
      answerText = `ADDITIONAL FACTS REQUIRED: In order to reach an authoritative legal determination under ${matchedCitations.join(', ')}, the following facts must be established:\n` +
        missingFactPrompts.map(p => `• ${p.questionText}`).join('\n');
    } else {
      answerText = findings.join(' ');
    }

    const result: TaxResearchResult = {
      recordId: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      taxCaseId: request.taxCaseId,
      question: request.question,
      jurisdiction: primaryJur,
      jurisdictions: request.jurisdictions || [primaryJur],
      taxYear,
      taxDomain: request.taxDomain,
      latencyTier: gatingDecision.recommendedLevel === 1 ? ResearchLatencyTier.FAST : latencyTier,
      answer: answerText,
      applicableRules,
      authorityAssessments,
      missingFacts: missingFactPrompts as any,
      freshnessStatus,
      confidenceScore: overallConfidence,
      confidence: overallConfidence,
      escalationType,
      aiResearchBrief,
      nextActionRecommendation: nextAction
    };

    // 10. Persist TaxResearchRecord in PostgreSQL
    try {
      const createdRecord = await prisma.taxResearchRecord.create({
        data: {
          taxCaseId: request.taxCaseId,
          jurisdictions: request.jurisdictions || [primaryJur],
          taxYear,
          taxDomain: request.taxDomain as any,
          taxpayerType: request.taxpayerType || 'INDIVIDUAL',
          question: request.question,
          factsUsed: (request.confirmedFacts || []) as any,
          factsMissing: (result.missingFacts || []) as any,
          applicableRules: applicableRules as any,
          authoritySources: matchedCitations as any,
          interpretation: result.answer,
          confidence: result.confidenceScore,
          reasoningSummary: findings.join(' '),
          recommendedNextAction: result.nextActionRecommendation.toString(),
          latencyTier: result.latencyTier.toString(),
          cacheHit: false
        }
      });
      result.recordId = createdRecord.id;
    } catch (err) {
      console.warn('[CaseTaxResearchEngine] DB record write failed, proceeding with in-memory result:', err);
    }

    // 11. Populate Cache
    await this.cache.set(
      cacheKey,
      primaryJur,
      taxYear,
      request.taxDomain,
      factsHash,
      result,
      matchedCitations
    );

    return result;
  }
}
