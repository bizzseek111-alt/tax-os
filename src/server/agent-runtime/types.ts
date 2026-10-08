/**
 * Autonomous Tax OS — Agent Runtime & Tax Intelligence Types
 * 
 * Defines the core contracts for the Phase 5 executable agent system:
 * - Structured AgentResult<T> output contract
 * - Agent types, execution statuses, and evidence tiers
 * - Typed permissions and model routing classes
 * - Workflow tasks and consensus states
 */

export enum AgentType {
  // Supervisor & Orchestration
  TAXCASE_SUPERVISOR = 'TAXCASE_SUPERVISOR',
  TASK_PLANNER = 'TASK_PLANNER',

  // Discovery & Ingestion Intelligence
  INTAKE_AGENT = 'INTAKE_AGENT',
  PRIOR_RETURN_AGENT = 'PRIOR_RETURN_AGENT',
  MISSING_DOCUMENT_AGENT = 'MISSING_DOCUMENT_AGENT',
  INCOME_RECONSTRUCTION_AGENT = 'INCOME_RECONSTRUCTION_AGENT',
  DUPLICATE_INCOME_AGENT = 'DUPLICATE_INCOME_AGENT',

  // Financial & Expense Intelligence
  TRANSACTION_CLASSIFICATION_AGENT = 'TRANSACTION_CLASSIFICATION_AGENT',
  MERCHANT_INTELLIGENCE_AGENT = 'MERCHANT_INTELLIGENCE_AGENT',
  RECEIPT_MATCHING_AGENT = 'RECEIPT_MATCHING_AGENT',
  SPEND_INVESTIGATOR = 'SPEND_INVESTIGATOR',
  BUSINESS_PURPOSE_AGENT = 'BUSINESS_PURPOSE_AGENT',

  // Deduction & Credit Intelligence
  DEDUCTION_HUNTER = 'DEDUCTION_HUNTER',
  CREDIT_HUNTER = 'CREDIT_HUNTER',
  HOME_OFFICE_AGENT = 'HOME_OFFICE_AGENT',
  VEHICLE_MILEAGE_AGENT = 'VEHICLE_MILEAGE_AGENT',
  TRAVEL_AGENT = 'TRAVEL_AGENT',
  ASSET_AGENT = 'ASSET_AGENT',
  INVESTMENT_AGENT = 'INVESTMENT_AGENT',

  // Legal & Jurisdictional Intelligence
  TAX_RESEARCH_AGENT = 'TAX_RESEARCH_AGENT',
  FEDERAL_TAX_AGENT = 'FEDERAL_TAX_AGENT',
  CALIFORNIA_TAX_AGENT = 'CALIFORNIA_TAX_AGENT',
  NEW_YORK_TAX_AGENT = 'NEW_YORK_TAX_AGENT',
  NEW_JERSEY_TAX_AGENT = 'NEW_JERSEY_TAX_AGENT',
  ILLINOIS_TAX_AGENT = 'ILLINOIS_TAX_AGENT',
  MASSACHUSETTS_TAX_AGENT = 'MASSACHUSETTS_TAX_AGENT',
  RESIDENCY_AGENT = 'RESIDENCY_AGENT',
  MULTI_STATE_ALLOCATION_AGENT = 'MULTI_STATE_ALLOCATION_AGENT',
  CONFORMITY_AGENT = 'CONFORMITY_AGENT',
  OPTIMIZER_AGENT = 'OPTIMIZER_AGENT',

  // Adversarial Review & Verification
  IRS_CHALLENGER_AGENT = 'IRS_CHALLENGER_AGENT',
  EVIDENCE_EXAMINER = 'EVIDENCE_EXAMINER',
  RECONCILIATION_AGENT = 'RECONCILIATION_AGENT',
  CROSS_YEAR_AGENT = 'CROSS_YEAR_AGENT',
  ANOMALY_AGENT = 'ANOMALY_AGENT',

  // Routing & Communication Intelligence
  CONFIDENCE_ENGINE = 'CONFIDENCE_ENGINE',
  QUESTION_REDUCTION_AGENT = 'QUESTION_REDUCTION_AGENT',
  MINIMAL_QUESTION_GENERATOR = 'MINIMAL_QUESTION_GENERATOR',
  CONSENSUS_ENGINE = 'CONSENSUS_ENGINE',
  HUMAN_ESCALATION_ROUTER = 'HUMAN_ESCALATION_ROUTER',
  PROFESSIONAL_REVIEW_BRIEF_AGENT = 'PROFESSIONAL_REVIEW_BRIEF_AGENT',

  // Phase 7 Sales & Use Tax Intelligence
  SALES_TAX_SUPERVISOR = 'SALES_TAX_SUPERVISOR',
  NEXUS_AGENT = 'NEXUS_AGENT',
  PHYSICAL_NEXUS_AGENT = 'PHYSICAL_NEXUS_AGENT',
  ECONOMIC_NEXUS_AGENT = 'ECONOMIC_NEXUS_AGENT',
  REGISTRATION_AGENT = 'REGISTRATION_AGENT',
  TAXABILITY_AGENT = 'TAXABILITY_AGENT',
  SOURCING_AGENT = 'SOURCING_AGENT',
  MARKETPLACE_AGENT = 'MARKETPLACE_AGENT',
  EXEMPTION_AGENT = 'EXEMPTION_AGENT',
  SALES_TAX_RECONCILIATION_AGENT = 'SALES_TAX_RECONCILIATION_AGENT',
  SALES_TAX_RETURN_AGENT = 'SALES_TAX_RETURN_AGENT',
  SALES_TAX_NOTICE_AGENT = 'SALES_TAX_NOTICE_AGENT',

  // Phase 8 Payroll & Employer Compliance Intelligence
  PAYROLL_TAX_SUPERVISOR = 'PAYROLL_TAX_SUPERVISOR',
  PAYROLL_IMPORT_AGENT = 'PAYROLL_IMPORT_AGENT',
  PAYROLL_RECONCILIATION_AGENT = 'PAYROLL_RECONCILIATION_AGENT',
  FEDERAL_WITHHOLDING_AGENT = 'FEDERAL_WITHHOLDING_AGENT',
  FICA_AGENT = 'FICA_AGENT',
  FUTA_AGENT = 'FUTA_AGENT',
  STATE_WITHHOLDING_AGENT = 'STATE_WITHHOLDING_AGENT',
  STATE_UNEMPLOYMENT_AGENT = 'STATE_UNEMPLOYMENT_AGENT',
  DEPOSIT_SCHEDULE_AGENT = 'DEPOSIT_SCHEDULE_AGENT',
  FORM_941_AGENT = 'FORM_941_AGENT',
  FORM_940_AGENT = 'FORM_940_AGENT',
  W2_AGENT = 'W2_AGENT',
  W3_AGENT = 'W3_AGENT',
  WORKER_CLASSIFICATION_RISK_AGENT = 'WORKER_CLASSIFICATION_RISK_AGENT',
  PAYROLL_NOTICE_AGENT = 'PAYROLL_NOTICE_AGENT'
}

export enum ExecutionStatus {
  SUCCESS = 'SUCCESS',
  PARTIAL = 'PARTIAL',
  RETRYABLE_FAILURE = 'RETRYABLE_FAILURE',
  PERMANENT_FAILURE = 'PERMANENT_FAILURE',
  BLOCKED_MISSING_DATA = 'BLOCKED_MISSING_DATA',
  BLOCKED_RULE_UNCERTAINTY = 'BLOCKED_RULE_UNCERTAINTY',
  PRO_REVIEW_REQUIRED = 'PRO_REVIEW_REQUIRED'
}

export enum EvidenceClassification {
  DOCUMENTARY = 'DOCUMENTARY',           // W-2, 1099, official closing statement, formal receipt
  CONNECTED_SOURCE = 'CONNECTED_SOURCE', // Plaid bank transaction, Stripe feed, Gusto payroll
  USER_CONFIRMED = 'USER_CONFIRMED',     // Direct taxpayer affidavit / answer to specific inquiry
  DERIVED = 'DERIVED',                   // Calculated deterministically from verified documentary facts
  INFERRED = 'INFERRED'                  // Estimated or hypothesized by pattern recognition (NEVER documentary)
}

export enum TaxPositionStatus {
  PROPOSED = 'PROPOSED',
  INVESTIGATING = 'INVESTIGATING',
  AWAITING_FACT = 'AWAITING_FACT',
  RULE_VERIFIED = 'RULE_VERIFIED',
  EVIDENCE_VERIFIED = 'EVIDENCE_VERIFIED',
  CHALLENGED = 'CHALLENGED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PRO_REVIEW = 'PRO_REVIEW',
  FINAL = 'FINAL'
}

export enum ConsensusVerdict {
  APPROVED_AUTOMATED = 'APPROVED_AUTOMATED',
  USER_INPUT_REQUIRED = 'USER_INPUT_REQUIRED',
  PRO_REVIEW_REQUIRED = 'PRO_REVIEW_REQUIRED',
  REJECTED = 'REJECTED',
  UNANIMOUS = 'UNANIMOUS',
  DEADLOCK = 'DEADLOCK',
  ESCALATE_TO_PROFESSIONAL = 'ESCALATE_TO_PROFESSIONAL'
}

export enum ModelClass {
  FAST_CLASSIFIER = 'FAST_CLASSIFIER',             // Quick routing, merchant alias normalization
  DOCUMENT_REASONER = 'DOCUMENT_REASONER',         // OCR parsing, invoice line item matching
  DEEP_REASONER = 'DEEP_REASONER',                 // Multi-step complex deduction analysis, economic substance
  TAX_RESEARCH_REASONER = 'TAX_RESEARCH_REASONER', // Statutory interpretation with Phase 4 RAG
  VISION = 'VISION',                               // Receipt and tax form image comprehension
  EMBEDDINGS = 'EMBEDDINGS'                        // Vector similarity projection
}

export interface CostMetadata {
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number;
}

export interface AgentResult<T = any> {
  status: ExecutionStatus;
  result: T;
  confidence: number;                             // 0.0 to 1.0 composite confidence
  evidenceRefs: string[];                         // Document/Transaction IDs substantiating this output
  ruleRefs: string[];                             // TaxRule IDs or statutory citations supporting treatment
  sourceRefs: string[];                           // Specific TaxAuthoritySource IDs
  taxCaseRefs: string[];                          // TaxCase IDs referenced
  contradictions: string[];                       // Conflicting facts, documents, or claims identified
  unresolvedFacts: string[];                      // Missing prerequisites preventing final determination
  warnings: string[];                             // Compliance alerts, audit risks, or cautionary notes
  requiresUserInput: boolean;                     // Triggers Question Reduction and Minimal Question Generator
  requiresProfessionalReview: boolean;            // Triggers Human Escalation Router to CPA/EA/Attorney
  recommendedNextAction: string;                  // Plain-text operational instruction for Task Planner
  auditMetadata: {
    agentType: AgentType;
    agentVersion: string;
    modelClass: ModelClass;
    executionTimeMs: number;
    costUsd: number;
    timestamp: string;
  };
}

export interface AgentPermission {
  allowedReadTables: string[];
  allowedWriteTables: string[];
  allowedTools: string[];
  allowedJurisdictions: string[];
  allowedTaxDomains: string[];
  canTriggerUserQuestions: boolean;
  canMutateTaxPositions: boolean;
  canApproveTaxTreatment: boolean; // Strictly FALSE for all autonomous agents
}

export interface ToolCallInvocation {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface WorkflowTaskNode {
  taskId: string;
  agentType: AgentType;
  dependencies: string[];
  input?: Record<string, any>;
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  result?: AgentResult;
  phase?: number;
  phaseName?: string;
  isParallel?: boolean;
  jurisdiction?: string;
}
