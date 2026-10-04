/**
 * Autonomous Tax OS — Tax Authority Engine Type Definitions
 * Strict types for authority metadata, declarative rules, research responses, and citation verification.
 */

export type JurisdictionCode = 'US-FED' | 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';

export type AuthorityType =
  | 'STATUTE'
  | 'REGULATION'
  | 'REVENUE_RULING'
  | 'REVENUE_PROCEDURE'
  | 'OFFICIAL_FORM_INSTRUCTION'
  | 'ADMINISTRATIVE_NOTICE'
  | 'COURT_DECISION'
  | 'SECONDARY_COMMENTARY';

export type PrecedentialStatus = 'BINDING' | 'PERSUASIVE' | 'NON_PRECEDENTIAL';

export interface TaxAuthoritySource {
  authorityId: string;
  jurisdiction: JurisdictionCode;
  taxYear: number;
  authorityType: AuthorityType;
  authorityLevel: 1 | 2 | 3 | 4 | 5;
  publisher: string;
  title: string;
  citationString: string;
  sourceUrl: string;
  publicationDate: string;
  effectiveFrom: string;
  effectiveTo?: string;
  precedentialStatus: PrecedentialStatus;
  supersededBy?: string;
  supersedes?: string[];
  affectedForms: string[];
  affectedSchedules: string[];
  topicTags: string[];
  contentHash: string;
  sourceVersion: string;
  reviewStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'DEPRECATED';
  fullText?: string;
}

export interface TaxRule {
  ruleId: string;
  jurisdiction: JurisdictionCode;
  taxYear: number;
  topic: string;
  description: string;
  conditions: any;
  requiredFacts: string[];
  exceptions?: any[];
  thresholds?: Record<string, number>;
  calculationReference: string;
  formMappings: Array<{
    targetForm: string;
    targetLine: string;
    lineDescription: string;
  }>;
  stateAdjustments?: {
    isConforming: boolean;
    additionModificationLine?: string;
    subtractionModificationLine?: string;
    stateCodeSection?: string;
  };
  authorityRefs: string[];          // References to TaxAuthoritySource.authorityId
  ruleVersion: string;
  reviewStatus: 'ACTIVE' | 'SUPERSEDED' | 'DRAFT';
}

export interface ResearchQuery {
  question: string;
  jurisdiction: JurisdictionCode;
  taxYear: number;
  topic?: string;
  excludeNonPrecedential?: boolean;
}

export type LatencyTier =
  | 'L1_CACHED_RULE'               // < 10ms
  | 'L2_HYBRID_RETRIEVAL'          // < 150ms
  | 'L3_DEEP_RESEARCH'             // < 3.5s
  | 'L4_PROFESSIONAL_ESCALATION';  // Async human review

export interface ResearchResponse {
  question: string;
  jurisdiction: JurisdictionCode;
  taxYear: number;
  latencyTier: LatencyTier;
  resolutionTimeMs: number;
  applicableRules: TaxRule[];
  authorityCitations: TaxAuthoritySource[];
  precedentialStrength: 'BINDING' | 'PERSUASIVE' | 'NON_PRECEDENTIAL';
  requiredFacts: string[];
  missingFacts: string[];
  conflictingAuthorities: string[];
  interpretation: string;
  uncertainty: number;             // 0.00 to 1.00
  professionalReviewRequired: boolean;
}

export interface CitationVerificationResult {
  valid: boolean;
  citationString: string;
  authorityExists: boolean;
  correctTaxYear: boolean;
  correctJurisdiction: boolean;
  notSuperseded: boolean;
  precedentialStatus: PrecedentialStatus;
  rejectionReason?: string;
}
