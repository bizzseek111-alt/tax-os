/**
 * Autonomous Tax OS — Phase 11A Real-Time Tax Authority Research Types
 * 
 * Defines core contracts for live statutory research, official connector queries,
 * multi-jurisdiction coordination, fact binding, authority hierarchy, and legal escalations.
 */

import { ResearchDomain, FreshnessStatus, AuthorityEscalationType } from '@prisma/client';
import { AuthorityType, PrecedentialStatus } from '../types';

export { ResearchDomain, FreshnessStatus, AuthorityEscalationType };

export enum ResearchLatencyTier {
  FAST = 'FAST',       // Level 1: Approved TaxRule graph lookup
  NORMAL = 'NORMAL',   // Level 2: Ingested & verified authority library (Hybrid RAG)
  DEEP = 'DEEP',       // Level 3-4: Live official research across multiple sources
  EXPERT = 'EXPERT'    // Level 5: Professional / attorney human escalation
}

export enum NextActionRecommendation {
  PROCEED = 'PROCEED',
  REQUEST_FACT = 'REQUEST_FACT',
  CPA_REVIEW = 'CPA_REVIEW',
  ATTORNEY_ESCALATION = 'ATTORNEY_ESCALATION',
  REJECT_POSITION = 'REJECT_POSITION',
  RESEARCH_DEFERRED = 'RESEARCH_DEFERRED'
}

export interface ConfirmedFact {
  key: string;
  value: any;
  category?: string;
  sourceDocumentId?: string;
  confidence?: number;
}

export interface UnresolvedFact {
  key: string;
  description: string;
  neededForRuleId?: string;
  potentialImpact?: string;
}

export interface TaxResearchRequest {
  taxCaseId: string;
  taxYear?: number;
  taxDomain: ResearchDomain;
  jurisdiction?: string;
  jurisdictions?: string[];
  taxpayerType?: string; // "INDIVIDUAL", "SOLE_PROP", "LLC", "S_CORP", "C_CORP", "PARTNERSHIP"
  confirmedFacts?: ConfirmedFact[];
  unresolvedFacts?: UnresolvedFact[];
  materiality?: number;
  materialityCents?: bigint;
  question: string;
  topic?: string;
  facts?: Record<string, any>;
  ruleSetVersions?: Record<string, string>;
  forceLiveResearch?: boolean;
}

export interface MissingResearchContext {
  isMissingContext: true;
  missingFields: ('taxYear' | 'jurisdictions' | 'taxCaseId' | 'question')[];
  reason: string;
  promptForUser: string;
}

export interface AuthorityAssessment {
  authorityType: AuthorityType;
  authorityLevel: number; // 1 = Highest (Statute), 15 = Lowest (Secondary)
  precedentialStatus: PrecedentialStatus;
  jurisdictionMatch: boolean;
  taxYearMatch: boolean;
  effectivePeriodMatch: boolean;
  sourceAuthenticity: boolean;
  supersessionStatus: 'CURRENT' | 'SUPERSEDED' | 'MODIFIED';
  directnessOfSupport: 'DIRECT' | 'ANALOGOUS' | 'PERSUASIVE' | 'DISTINGUISHABLE';
  conflictStatus: 'NONE' | 'CONFLICTING_PRIMARY' | 'CONFLICTING_SECONDARY';
  authorityWeight: number; // 0.0 to 1.0
}

export interface FactConditionBinding {
  ruleId: string;
  conditionDescription: string;
  requiredFactKey: string;
  matchedFactValue?: any;
  status: 'SATISFIED' | 'UNSATISFIED' | 'UNKNOWN';
}

export interface FactApplicabilityMap {
  caseId: string;
  ruleId: string;
  bindings: FactConditionBinding[];
  allConditionsSatisfied: boolean;
  hasMissingFacts: boolean;
  missingFactKeys?: string[];
  missingFacts?: MinimalFactQuestion[];
}

export interface MinimalFactQuestion {
  factKey: string;
  questionText: string;
  expectedType?: 'BOOLEAN' | 'CURRENCY' | 'STRING' | 'DATE' | 'ENUM';
  options?: string[];
  whyNeeded?: string;
  statutoryReason?: string;
  ruleId?: string;
}

export interface CaseApplicableRule {
  ruleId: string;
  ruleTitle?: string;
  jurisdiction: string;
  taxYear: number;
  isCandidateRule?: boolean;
  candidateId?: string;
  applicabilityStatus: 'FULLY_APPLICABLE' | 'CONDITIONALLY_APPLICABLE' | 'NOT_APPLICABLE' | 'BLOCKED_BY_MISSING_FACTS';
  statutoryCitation?: string;
  authorityLevel?: number;
  confidenceScore: number;
  authorityAssessment: AuthorityAssessment;
  applicabilityMap: FactApplicabilityMap;
  conditionsEvaluated?: FactConditionBinding[];
  ruleSummary?: string;
}

export interface TaxRuleCandidateInput {
  candidateRuleId: string;
  jurisdiction: string;
  taxYear: number;
  taxDomain: string;
  topic: string;
  title: string;
  description: string;
  conditions: any[];
  authorityRefs: any[];
  confidence: number;
  discoveredByResearchId?: string;
}

export interface AuthorityConflictDetail {
  id?: string;
  conflictType: string;
  topic: string;
  jurisdiction: string;
  jurisdictions?: string[];
  taxYear: number;
  taxYears?: number[];
  primarySourceCode: string;
  conflictingSourceCode: string;
  primaryRank: number;
  conflictingRank: number;
  conflictSummary: string;
  materialityCents: bigint;
  escalationRequired: AuthorityEscalationType;
  status?: string;
}

export interface AIResearchBrief {
  issueStatement: string;
  applicableFacts: {
    confirmed: string[];
    unconfirmed: string[];
  };
  competingAuthorities: {
    citation: string;
    rank: number;
    weight: number;
    quote: string;
    argument: string;
  }[];
  argumentsAnalysis: string;
  financialExposure: {
    bestCaseDollars: number;
    worstCaseDollars: number;
    expectedLiabilityDollars: number;
  };
  substantialAuthorityAssessment: {
    meetsSubstantialAuthority: boolean;
    likelihoodPercentage: number;
    penaltyProtectionNotes: string;
  };
  reasonableBasisAssessment: {
    meetsReasonableBasis: boolean;
    likelihoodPercentage: number;
  };
  recommendedPosition: string;
  questionsForReviewer: string[];
}

export interface PropositionNodeData {
  id?: string;
  taxPositionId?: string;
  propositionText: string;
  statutoryCitation: string;
  authorityLevel: number;
  sourceChunkId?: string;
  sourceId?: string;
  ruleId?: string;
  validationStatus: string;
  verificationDetails?: Record<string, any>;
  sourceUrl?: string;
  sourceChunkText?: string;
  sourceHash?: string;
  authorityWeight?: number;
  createdAt?: Date;
}

export interface TaxResearchResult {
  recordId: string;
  taxCaseId: string;
  question: string;
  taxYear: number;
  jurisdiction: string;
  jurisdictions?: string[];
  taxDomain: ResearchDomain;
  latencyTier: ResearchLatencyTier;
  answer: string;
  applicableRules: CaseApplicableRule[];
  candidateRules?: TaxRuleCandidateInput[];
  authorityAssessments: AuthorityAssessment[];
  authoritySources?: {
    citationCode: string;
    title: string;
    authorityType: AuthorityType;
    authorityLevel: number;
    url?: string;
    assessment: AuthorityAssessment;
  }[];
  missingFacts: MinimalFactQuestion[];
  conflicts?: AuthorityConflictDetail[];
  freshnessStatus: FreshnessStatus;
  confidenceScore: number;
  confidence?: number;
  escalationType: AuthorityEscalationType;
  aiResearchBrief?: AIResearchBrief;
  nextActionRecommendation: NextActionRecommendation;
  propositionGraph?: PropositionNodeData[];
  auditTimestamp?: Date;
}
