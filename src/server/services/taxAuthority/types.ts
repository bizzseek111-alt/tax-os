/**
 * Autonomous Tax OS — Tax Authority Engine & Real Tax-Law RAG Types
 * 
 * Defines the statutory authority hierarchy, rule AST structures, conformity types,
 * citation validation schemas, and search scoring interfaces.
 */

export enum AuthorityType {
  STATUTE = 'STATUTE',                               // 1: Internal Revenue Code (26 U.S.C.), State Codes
  REGULATION = 'REGULATION',                         // 2: Treasury Regulations (26 CFR), State Administrative Codes
  COURT_DECISION = 'COURT_DECISION',                 // 3: SCOTUS, Circuit Courts, Tax Court reported opinions
  REVENUE_RULING = 'REVENUE_RULING',                 // 4: IRS Published Revenue Rulings (binding on IRS)
  REVENUE_PROCEDURE = 'REVENUE_PROCEDURE',           // 5: IRS Procedural Guidance
  NOTICE = 'NOTICE',                                 // 6: IRS Official Notices (substantive guidance)
  LEGAL_RULING = 'LEGAL_RULING',                     // 7: State Agency Legal Rulings (e.g. CA FTB Legal Rulings)
  TECHNICAL_MEMORANDUM = 'TECHNICAL_MEMORANDUM',     // 8: NY TSB-M, State Technical Guidance
  FORM = 'FORM',                                     // 9: Official Forms & Return Schedules
  FORM_INSTRUCTION = 'FORM_INSTRUCTION',             // 10: IRS & State Form Instructions
  ADMINISTRATIVE_GUIDANCE = 'ADMINISTRATIVE_GUIDANCE', // 11: Fact Sheets, Info Releases
  EFILE_BUSINESS_RULE = 'EFILE_BUSINESS_RULE',       // 12: MeF & State E-file Business Rules
  OFFICIAL_PUBLICATION = 'OFFICIAL_PUBLICATION',     // 13: IRS Pubs (Pub 17, 334, 535)
  FAQ = 'FAQ',                                       // 14: Agency FAQs (Non-precedential)
  SECONDARY_COMMENTARY = 'SECONDARY_COMMENTARY'      // 15: Treatises, articles, internal notes
}

export const AUTHORITY_HIERARCHY_RANK: Record<AuthorityType, number> = {
  [AuthorityType.STATUTE]: 1,
  [AuthorityType.REGULATION]: 2,
  [AuthorityType.COURT_DECISION]: 3,
  [AuthorityType.REVENUE_RULING]: 4,
  [AuthorityType.REVENUE_PROCEDURE]: 5,
  [AuthorityType.NOTICE]: 6,
  [AuthorityType.LEGAL_RULING]: 7,
  [AuthorityType.TECHNICAL_MEMORANDUM]: 8,
  [AuthorityType.FORM]: 9,
  [AuthorityType.FORM_INSTRUCTION]: 10,
  [AuthorityType.ADMINISTRATIVE_GUIDANCE]: 11,
  [AuthorityType.EFILE_BUSINESS_RULE]: 12,
  [AuthorityType.OFFICIAL_PUBLICATION]: 13,
  [AuthorityType.FAQ]: 14,
  [AuthorityType.SECONDARY_COMMENTARY]: 15
};

export enum PrecedentialStatus {
  BINDING = 'BINDING',             // Enforceable law (Statutes, final regulations, Supreme Court)
  PERSUASIVE = 'PERSUASIVE',       // Appellate court rulings from outside jurisdiction, proposed regs
  ADMINISTRATIVE = 'ADMINISTRATIVE', // Agency guidance binding on the government but not courts
  SUPERSEDED = 'SUPERSEDED',       // Overturned, amended, or obsoleted by subsequent law
  PROPOSED = 'PROPOSED',           // Proposed regulations/amendments not yet effective
  HISTORICAL = 'HISTORICAL'        // Expired rules kept strictly for prior-year audits
}

export enum RuleReviewStatus {
  DRAFT = 'DRAFT',
  AI_EXTRACTED = 'AI_EXTRACTED',               // Extracted by AI parser, awaiting human verification
  PRO_REVIEW_REQUIRED = 'PRO_REVIEW_REQUIRED', // Flagged for CPA/Attorney credentialed sign-off
  APPROVED = 'APPROVED',                       // Reviewed and validated by licensed professional
  ACTIVE = 'ACTIVE',                           // Live in calculation and compliance engine
  DEPRECATED = 'DEPRECATED'                    // Retired or replaced by newer version
}

export enum ConformityStatus {
  ROLLING_CONFORMITY = 'ROLLING_CONFORMITY',         // Automatically adopts IRC as enacted
  FIXED_DATE_CONFORMITY = 'FIXED_DATE_CONFORMITY',   // Conforms to IRC as of specific date (e.g. CA to 2015 IRC)
  SELECTIVE_DECOUPLING = 'SELECTIVE_DECOUPLING',     // Selectively decouples from specific IRC provisions (e.g. Sec 199A, Bonus Depr)
  COMPLETELY_INDEPENDENT = 'COMPLETELY_INDEPENDENT'  // Autonomous state definition of income (e.g. NJ Gross Income Tax)
}

export type SupportedJurisdiction = 'US-FED' | 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';

export interface AuthoritySourceInput {
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  authorityType: AuthorityType;
  publisher: string;
  title: string;
  sourceUrl?: string;
  citationCode: string;
  publicationDate?: Date;
  effectiveFrom: Date;
  effectiveTo?: Date;
  supersedesSourceId?: string;
  precedentialStatus: PrecedentialStatus;
  affectedForms?: string[];
  affectedSchedules?: string[];
  topicTags?: string[];
  sourceVersion?: string;
  rawContent: string;
}

export interface AuthorityChunkInput {
  sectionPath: string;
  heading?: string;
  content: string;
  pageNumber?: number;
  lineNumber?: number;
  authorityLevel: number;
  precedentialStatus: PrecedentialStatus;
}

// ============================================================================
// RULE AST & EVALUATION TYPES
// ============================================================================

export type ASTOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS'
  | 'EXISTS'
  | 'IS_TRUE'
  | 'IS_FALSE';

export interface ASTLeafCondition {
  type: 'LEAF';
  factKey: string;
  operator: ASTOperator;
  value?: any;
  description?: string;
}

export interface ASTCompoundCondition {
  type: 'COMPOUND';
  logicalOp: 'AND' | 'OR' | 'NOT';
  conditions: Array<ASTLeafCondition | ASTCompoundCondition>;
}

export type RuleConditionAST = ASTLeafCondition | ASTCompoundCondition;

export interface NormalizedRulePayload {
  ruleId: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  taxDomain: string;
  topic: string;
  title: string;
  description: string;
  conditions: RuleConditionAST;
  requiredFacts: string[];
  exceptions: string[];
  thresholds: Record<string, any>;
  phaseOuts: Record<string, any>;
  elections: Record<string, any>;
  calculationReference?: string;
  formMappings: string[];
  federalConformityBehavior?: 'CONFORMS' | 'DECOUPLED' | 'MODIFIED' | 'NOT_APPLICABLE';
  authorityRefs: string[];
  ruleVersion?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  sourceId?: string;
}

// ============================================================================
// RAG & RETRIEVAL TYPES
// ============================================================================

export interface TaxResearchQuery {
  query: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  topic?: string;
  authorityTypeFilter?: AuthorityType[];
  includeAdministrative?: boolean;
  minAuthorityLevel?: number;
  limit?: number;
}

export interface TaxSearchResult {
  chunkId: string;
  sourceId: string;
  citationCode: string;
  authorityType: AuthorityType;
  authorityLevel: number;
  precedentialStatus: PrecedentialStatus;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  sectionPath: string;
  heading?: string;
  content: string;
  lexicalScore: number;
  semanticScore: number;
  authorityWeight: number;
  finalScore: number;
  matchedKeywords: string[];
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface CitationValidationRequest {
  citationCode: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  propositionText?: string;
}

export interface CitationValidationResult {
  citationCode: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  isVerified: boolean;
  verificationStatus:
    | 'VERIFIED'
    | 'INVALID_CITATION'
    | 'WRONG_JURISDICTION'
    | 'WRONG_YEAR'
    | 'SUPERSEDED'
    | 'AMBIGUOUS';
  authorityType?: AuthorityType;
  authorityLevel?: number;
  precedentialStatus?: PrecedentialStatus;
  sourceId?: string;
  chunkId?: string;
  sectionPath?: string;
  sourceTitle?: string;
  reasons: string[];
  groundingConfidence?: number;
}

// ============================================================================
// STATE CONFORMITY & TAX LAW WATCHER TYPES
// ============================================================================

export interface StateConformityRecord {
  federalRuleId: string;
  state: SupportedJurisdiction;
  taxYear: number;
  conformityStatus: ConformityStatus;
  stateAdjustmentRule: {
    adjustmentType: 'ADDITION' | 'SUBTRACTION' | 'RATE_OVERRIDE' | 'COMPLETE_DISALLOWANCE' | 'FULL_CONFORMITY';
    formula?: string;
    description: string;
    stateFormLine?: string;
  };
  authorityRefs: string[];
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface RuleImpactAnalysis {
  ruleId: string;
  changeType: 'AMENDED' | 'REPEALED' | 'RATE_CHANGED' | 'THRESHOLD_CHANGED';
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  affectedCasesCount: number;
  sampleImpactedCases: Array<{
    taxCaseId: string;
    organizationId: string;
    estimatedDifferenceCents: bigint;
    reason: string;
  }>;
}
