export type TaskOwnerType = 
  | 'AI' 
  | 'TAXPAYER' 
  | 'CPA' 
  | 'EA' 
  | 'PREPARER' 
  | 'ATTORNEY' 
  | 'SALES_TAX_SPECIALIST' 
  | 'PAYROLL_SPECIALIST' 
  | 'OPERATIONS';

export type TaskStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'AWAITING_INPUT' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'DISMISSED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaxTask {
  id: string;
  taxCaseId: string;
  taxObligationId?: string;
  jurisdiction: string;
  taxDomain: 'INCOME_TAX' | 'SALES_USE_TAX' | 'PAYROLL_TAX' | 'EMPLOYER_COMPLIANCE';
  taskType: 
    | 'FACT_CONFIRMATION'
    | 'DOCUMENT_REQUEST'
    | 'ADVERSARIAL_CHALLENGE'
    | 'EXCEPTION_REVIEW'
    | 'STATUTORY_CONFLICT'
    | 'NEXUS_REGISTRATION'
    | 'WORKER_CLASSIFICATION'
    | 'PAYMENT_AUTHORIZATION'
    | 'EFILE_TRANSMISSION';
  
  ownerType: TaskOwnerType;
  ownerId?: string;
  sourceAgent: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  reason: string;
  financialImpactCents?: number;
  requiredEvidence: string[];
  resolutionDecision?: string;
  auditRecordHash: string;
  createdAt: string;
  resolvedAt?: string;
}
