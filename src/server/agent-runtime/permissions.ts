/**
 * Autonomous Tax OS — Agent Permission Controller
 * 
 * Enforces strict principle of least privilege (PoLP) on all agents.
 * No agent receives unrestricted database access or system execution permissions.
 * 
 * Critical Legal Invariants:
 * 1. An autonomous agent can NEVER approve a final tax position or filing.
 * 2. State agents are strictly restricted to their designated jurisdiction.
 * 3. Untrusted input (OCR texts, receipts, emails) cannot alter permissions.
 */

import { AgentPermission, AgentType } from './types';

export class AgentPermissionController {
  private static readonly PERMISSION_MAP: Record<AgentType, AgentPermission> = {
    [AgentType.TAXCASE_SUPERVISOR]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxFact', 'TaxPosition', 'TaxTask', 'ReviewTask', 'AuditEvent'],
      allowedWriteTables: ['TaxCase', 'TaxTask'],
      allowedTools: ['readTaxCase', 'planTasks', 'dispatchAgent', 'stopExecution', 'createTaxTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.TASK_PLANNER]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxFact', 'TaxPosition', 'Document'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['readTaxCase', 'buildTaskGraph'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.INTAKE_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxpayerProfile', 'BusinessProfile', 'Document'],
      allowedWriteTables: ['TaxFact', 'TaxTask'],
      allowedTools: ['readTaxCase', 'createTaxFact', 'requestUserFact'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.PRIOR_RETURN_AGENT]: {
      allowedReadTables: ['TaxCase', 'Document', 'TaxFact'],
      allowedWriteTables: ['TaxFact'],
      allowedTools: ['readTaxCase', 'createTaxFact', 'readPriorYearDocuments'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.MISSING_DOCUMENT_AGENT]: {
      allowedReadTables: ['TaxCase', 'Document', 'Transaction', 'Evidence'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['readTaxCase', 'readEvidence', 'createTaxTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.INCOME_RECONSTRUCTION_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'Document'],
      allowedWriteTables: ['TaxFact', 'Evidence'],
      allowedTools: ['readTaxCase', 'createTaxFact', 'linkEvidence'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.DUPLICATE_INCOME_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'Document'],
      allowedWriteTables: ['TaxFact', 'TaxTask'],
      allowedTools: ['readTaxCase', 'flagDuplicateIncome', 'createTaxTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.TRANSACTION_CLASSIFICATION_AGENT]: {
      allowedReadTables: ['Transaction', 'FinancialAccount', 'AgentMemory'],
      allowedWriteTables: ['Transaction', 'Evidence'],
      allowedTools: ['readTransactions', 'classifyTransaction', 'linkEvidence'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.MERCHANT_INTELLIGENCE_AGENT]: {
      allowedReadTables: ['Transaction', 'ResolvedEntity', 'AgentMemory'],
      allowedWriteTables: ['ResolvedEntity', 'AgentMemory'],
      allowedTools: ['resolveMerchantAlias', 'saveAgentMemory'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.RECEIPT_MATCHING_AGENT]: {
      allowedReadTables: ['Transaction', 'Document', 'Evidence'],
      allowedWriteTables: ['Evidence'],
      allowedTools: ['matchReceiptToTransaction', 'linkEvidence'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.SPEND_INVESTIGATOR]: {
      allowedReadTables: ['Transaction', 'Document', 'Evidence', 'AgentMemory'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['investigateSpend', 'requestUserFact'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.BUSINESS_PURPOSE_AGENT]: {
      allowedReadTables: ['Transaction', 'Evidence', 'TaxFact'],
      allowedWriteTables: ['Evidence'],
      allowedTools: ['evaluateBusinessPurpose', 'linkEvidence'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.DEDUCTION_HUNTER]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'Evidence', 'TaxRule'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'searchTaxAuthority', 'readTaxRules'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.CREDIT_HUNTER]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Evidence', 'TaxRule'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'searchTaxAuthority', 'readTaxRules'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.HOME_OFFICE_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Evidence', 'TaxRule'],
      allowedWriteTables: ['TaxFact', 'TaxPosition'],
      allowedTools: ['createTaxFact', 'createTaxPositionCandidate'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.VEHICLE_MILEAGE_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Evidence', 'TaxRule'],
      allowedWriteTables: ['TaxFact', 'TaxPosition'],
      allowedTools: ['createTaxFact', 'createTaxPositionCandidate'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.TRAVEL_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Evidence', 'Transaction'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'requestUserFact'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.ASSET_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'TaxRule'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'searchTaxAuthority'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.INVESTMENT_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Document'],
      allowedWriteTables: ['TaxFact', 'TaxTask'],
      allowedTools: ['createTaxFact', 'createTaxTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.TAX_RESEARCH_AGENT]: {
      allowedReadTables: ['TaxAuthoritySource', 'TaxAuthorityChunk', 'TaxRule'],
      allowedWriteTables: ['CitationVerificationRecord'],
      allowedTools: ['searchTaxAuthority', 'validateCitation'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.FEDERAL_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-FED'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.CALIFORNIA_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-CA'], // Strictly restricted to California!
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.NEW_YORK_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-NY'], // Strictly restricted to New York!
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.NEW_JERSEY_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-NJ'], // Strictly restricted to New Jersey!
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.ILLINOIS_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-IL'], // Strictly restricted to Illinois!
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.MASSACHUSETTS_TAX_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxCalculationRun'],
      allowedTools: ['runTaxCalculation', 'validatePositions'],
      allowedJurisdictions: ['US-MA'], // Strictly restricted to Massachusetts!
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.RESIDENCY_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Document', 'TaxRule'],
      allowedWriteTables: ['TaxFact', 'ReviewTask'],
      allowedTools: ['createTaxFact', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.MULTI_STATE_ALLOCATION_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'TaxRule'],
      allowedWriteTables: ['TaxFact', 'ReviewTask'],
      allowedTools: ['createTaxFact', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.CONFORMITY_AGENT]: {
      allowedReadTables: ['TaxPosition', 'FederalStateConformity', 'TaxRule'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'checkConformity'],
      allowedJurisdictions: ['US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.OPTIMIZER_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxPosition', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['createTaxPositionCandidate', 'searchTaxAuthority'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.IRS_CHALLENGER_AGENT]: {
      allowedReadTables: ['TaxPosition', 'Evidence', 'TaxFact', 'TaxRule'],
      allowedWriteTables: ['TaxPosition', 'ReviewTask'],
      allowedTools: ['challengeTaxPosition', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.EVIDENCE_EXAMINER]: {
      allowedReadTables: ['Evidence', 'Document', 'Transaction'],
      allowedWriteTables: ['Evidence'],
      allowedTools: ['classifyEvidence', 'verifyDocumentSignatures'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.RECONCILIATION_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact', 'Transaction', 'TaxCalculationRun'],
      allowedWriteTables: ['ReviewTask'],
      allowedTools: ['reconcileTotals', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.CROSS_YEAR_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxFact'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['compareHistoricalYears', 'createTaxTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.ANOMALY_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxPosition', 'TaxFact', 'Transaction'],
      allowedWriteTables: ['ReviewTask'],
      allowedTools: ['detectAnomalies', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.CONFIDENCE_ENGINE]: {
      allowedReadTables: ['TaxPosition', 'Evidence', 'TaxRule', 'TaxFact'],
      allowedWriteTables: ['TaxPosition'],
      allowedTools: ['scoreConfidence'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.QUESTION_REDUCTION_AGENT]: {
      allowedReadTables: ['TaxTask', 'TaxFact', 'Document', 'Transaction', 'AgentMemory'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['suppressRedundantQuestions'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.MINIMAL_QUESTION_GENERATOR]: {
      allowedReadTables: ['TaxFact', 'TaxTask'],
      allowedWriteTables: ['TaxTask'],
      allowedTools: ['formatSingleQuestion'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: true,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.CONSENSUS_ENGINE]: {
      allowedReadTables: ['TaxPosition', 'TaxFact', 'Evidence', 'TaxRule'],
      allowedWriteTables: ['TaxPosition', 'ReviewTask'],
      allowedTools: ['reachConsensus', 'createReviewTask'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: true,
      canApproveTaxTreatment: false
    },

    [AgentType.HUMAN_ESCALATION_ROUTER]: {
      allowedReadTables: ['TaxCase', 'TaxPosition', 'ReviewTask'],
      allowedWriteTables: ['ReviewTask'],
      allowedTools: ['routeToSpecialist'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    },

    [AgentType.PROFESSIONAL_REVIEW_BRIEF_AGENT]: {
      allowedReadTables: ['TaxCase', 'TaxObligation', 'TaxPosition', 'Evidence', 'TaxFact', 'TaxRule', 'ReviewTask'],
      allowedWriteTables: ['ProfessionalReview'],
      allowedTools: ['generateAuditBrief'],
      allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      allowedTaxDomains: ['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX'],
      canTriggerUserQuestions: false,
      canMutateTaxPositions: false,
      canApproveTaxTreatment: false
    }
  };

  public static getPermissions(agentType: AgentType): AgentPermission {
    const perm = this.PERMISSION_MAP[agentType];
    if (!perm) {
      throw new Error(`SECURITY_ERROR: No permission profile defined for agent type '${agentType}'`);
    }
    return perm;
  }

  public static assertToolAllowed(agentType: AgentType, toolName: string): void {
    const perm = this.getPermissions(agentType);
    if (!perm.allowedTools.includes(toolName)) {
      throw new Error(`PERMISSION_DENIED: Agent '${agentType}' is not authorized to call tool '${toolName}'`);
    }
  }

  public static assertJurisdictionAllowed(agentType: AgentType, jurisdiction: string): void {
    const perm = this.getPermissions(agentType);
    if (!perm.allowedJurisdictions.includes(jurisdiction)) {
      throw new Error(
        `JURISDICTION_PERMISSION_DENIED: Agent '${agentType}' is restricted from accessing jurisdiction '${jurisdiction}'. Permitted: [${perm.allowedJurisdictions.join(', ')}]`
      );
    }
  }
}
