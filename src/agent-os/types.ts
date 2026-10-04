/**
 * Autonomous Tax OS — Agent Operating System (AOS) Type Definitions
 * Strict typed schemas for AgentResult<T>, permissions, consensus, and orchestration.
 */

export type AgentStatus = 'SUCCESS' | 'PARTIAL' | 'BLOCKED' | 'FAILED' | 'CHALLENGED';

export interface AuditMetadata {
  agentName: string;
  agentVersion: string;
  runId: string;
  timestamp: string;               // ISO 8601
  executionDurationMs: number;
  inputHash: string;               // SHA-256 of input state
  outputHash: string;              // SHA-256 of result
  modelUsed: string;
  totalTokens: number;
  estimatedCostUsd: number;
}

/**
 * Canonical Standard Result Schema for All Agents
 * No free-form unstructured strings allowed as agent outputs.
 */
export interface AgentResult<T = any> {
  status: AgentStatus;
  result: T;
  confidence: number;              // 0.00 to 1.00
  evidenceRefs: string[];          // Evidence Graph IDs (hashes, receipts, documents)
  ruleRefs: string[];              // Tax Rule Graph IDs (e.g. "RULE-FED-2026-IRC-162")
  sourceRefs: string[];            // Transaction IDs or Document IDs
  taxCaseRefs: string[];           // Target TaxCase IDs
  warnings: string[];
  contradictions: string[];        // Detected factual or document contradictions
  unresolvedFacts: string[];       // Facts requiring user or document input
  requiresUserInput: boolean;      // True if a Tax Inbox card must be emitted
  requiresProfessionalReview: boolean; // True if CPA/Attorney review is mandated
  recommendedNextAction: string;
  auditMetadata: AuditMetadata;
}

/**
 * Model Classification Hierarchy
 */
export type ModelClass =
  | 'FAST_CLASSIFIER'             // Fast categorization (<200ms)
  | 'DOCUMENT_EXTRACTOR'          // OCR & table bounding boxes
  | 'SEMANTIC_RETRIEVAL'          // Hybrid RAG & rule search
  | 'DEEP_REASONER'               // Complex statutory analysis & IRS Challenger
  | 'TAX_RESEARCH_REASONER'       // Authority conflict resolution & circuit splits
  | 'DETERMINISTIC_MATH'          // Pure code execution (0 LLM tokens)
  | 'VISION_MULTIMODAL'           // Scanned receipts, photo IDs
  | 'EMBEDDINGS';                 // Vector indexing

/**
 * Agent Capability & Least Privilege Permission Grant
 */
export interface AgentPermissionGrant {
  grantId: string;
  agentName: string;
  taxCaseId: string;
  tenantId: string;
  allowedReadPaths: string[];      // Whitelist of TaxCase sub-paths
  allowedWritePaths: string[];     // Whitelist of mutable entities
  allowedTools: string[];          // Whitelist of executable tool identifiers
  allowedJurisdictions: string[];  // e.g. ['US-FED', 'US-CA', 'US-NY']
  piiClearanceLevel: 'ANONYMIZED' | 'MASKED' | 'UNMASKED_PII_CLEARANCE';
  canAccessRawSsn: boolean;        // Strictly false for non-gateway agents
  canAccessRawBankNumbers: boolean;
  maxExecutionTimeMs: number;
  maxTokenBudget: number;
}

/**
 * Consensus Engine Data Types
 */
export interface ConsensusProposal {
  proposalId: string;
  topic: string;
  proposedByAgent: string;
  targetFormLine: string;
  amountCents: number;
  statutoryCitation: string;
  evidenceRefs: string[];
  confidence: number;
}

export interface AdversarialChallenge {
  challengeId: string;
  proposalId: string;
  challengerAgent: string;
  auditRiskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  objectionRationale: string;
  missingProofElements: string[];
  auditTechniqueGuideRef?: string;
}

export type ConsensusDecision =
  | 'APPROVED'
  | 'REJECTED'
  | 'USER_INPUT_REQUIRED'
  | 'PRO_REVIEW_REQUIRED'
  | 'ESCALATED_LEGAL';

export interface ConsensusVerdict {
  proposalId: string;
  decision: ConsensusDecision;
  approvedAmountCents: number;
  statutoryJustification: string;
  requiredInboxCard?: {
    promptTitle: string;
    questionText: string;
    suggestedAnswers: string[];
  };
  reviewQueueNote?: string;
  arbitrationTimestamp: string;
}

/**
 * Granular Emergency Kill Switch Scope
 */
export type KillSwitchScope =
  | 'GLOBAL_PLATFORM'
  | 'SPECIFIC_AGENT'
  | 'SPECIFIC_MODEL'
  | 'SPECIFIC_PROVIDER'
  | 'SPECIFIC_JURISDICTION'
  | 'SPECIFIC_TAX_RULE'
  | 'SPECIFIC_FEATURE';

export interface KillSwitchRule {
  id: string;
  scope: KillSwitchScope;
  targetIdentifier: string;        // e.g. "US-CA", "DeductionHunter", "RULE-FED-2026-HSA"
  active: boolean;
  reason: string;
  trippedBy: string;
  trippedAt: string;
}
