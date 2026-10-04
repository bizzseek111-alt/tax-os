// ============================================================================
// COMMON TAX COMPLIANCE DOMAIN MODEL
// Shared across: Income Tax, Sales & Use Tax, Payroll & Employment Tax
// ============================================================================

export type LifecycleStage = 'ARCHITECTED' | 'FOUNDATION' | 'BETA' | 'PRODUCTION';

export type TaxDomain = 'INCOME_TAX' | 'SALES_USE_TAX' | 'PAYROLL_TAX';

export type JurisdictionLevel = 'FEDERAL' | 'STATE' | 'COUNTY' | 'CITY' | 'SPECIAL_DISTRICT';

export type FilingFrequency = 'ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'SEMI_MONTHLY' | 'SEMI_WEEKLY' | 'NEXT_DAY' | 'OCCASIONAL';

export type ComplianceStatus = 'COMPLIANT' | 'ACTION_REQUIRED' | 'UNDER_REVIEW' | 'OVERDUE' | 'EXEMPT';

export interface TaxAuthority {
  id: string;
  name: string; // e.g. "Internal Revenue Service", "California Department of Tax and Fee Administration", "NYS Dept of Taxation and Finance"
  jurisdictionLevel: JurisdictionLevel;
  jurisdictionCode: string;
  officialStatuteTitle: string; // e.g. "Internal Revenue Code (Title 26)", "California Revenue and Taxation Code"
  portalUrl?: string;
  eFileSupported: boolean;
}

export interface TaxJurisdiction {
  id: string;
  name: string;
  code: string; // e.g. "US", "CA", "NY-NYC", "TX-AUSTIN-MTA"
  level: JurisdictionLevel;
  parentJurisdictionId?: string;
  authorityName: string; // e.g. "Internal Revenue Service", "California CDTFA", "NYS Tax & Finance"
  portalUrl?: string;
}

export interface TaxPeriod {
  id: string;
  domain: TaxDomain;
  frequency: FilingFrequency;
  year: number;
  periodNumber?: number; // e.g. Quarter 1-4, Month 1-12
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;
  dueDate: string;
  extendedDueDate?: string;
}

export interface TaxObligation {
  id: string;
  domain: TaxDomain;
  jurisdictionId: string;
  periodId: string;
  obligationName: string; // e.g. "2027 Q1 Form 941 Filing", "California March Sales Tax Remittance"
  status: ComplianceStatus;
  filingDueDate: string;
  paymentDueDate: string;
  isMandatoryElectronicPayment: boolean;
  statutoryReference: string;
}

export interface Registration {
  id: string;
  domain: TaxDomain;
  jurisdictionId: string;
  accountNumber: string; // masked or hashed for display
  registrationDate: string;
  status: 'ACTIVE' | 'PENDING' | 'REVOKED' | 'DEREGISTERED';
  filingFrequency: FilingFrequency;
  notes?: string;
}

export type TaxRegistration = Registration;

export interface TaxRule {
  id: string;
  ruleCode: string;
  domain: TaxDomain;
  jurisdictionId: string;
  version: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  title: string;
  description: string;
  statutoryCitation: string; // e.g. "IRC § 3101", "Cal. Rev. & Tax. Code § 6051"
  parameters: Record<string, any>;
}

export interface TaxLiability {
  id: string;
  domain: TaxDomain;
  jurisdictionId: string;
  periodId: string;
  grossAmount: number;
  exemptAmount: number;
  taxableAmount: number;
  taxRate: number; // effective rate
  taxOwed: number;
  penalties: number;
  interest: number;
  totalDue: number;
  currency: string;
  calculatedAt: string;
  provenance: CalculationProvenance;
}

export interface CalculationProvenance {
  engineVersion: string;
  ruleSetVersion: string;
  ruleIds: string[];
  inputHash: string;
  calculatedAt: string;
  citations: string[]; // Legal statutory authorities (e.g., "IRC § 3101", "Cal. Rev. & Tax. Code § 6051")
  traceLog?: string[];
}

export interface TaxPayment {
  id: string;
  domain: TaxDomain;
  liabilityId: string;
  jurisdictionId: string;
  amount: number;
  paymentMethod: 'EFTPS' | 'ACH_DEBIT' | 'ACH_CREDIT' | 'CREDIT_CARD' | 'CHECK';
  confirmationNumber?: string;
  scheduledDate: string;
  settledDate?: string;
  status: 'SCHEDULED' | 'PENDING' | 'SETTLED' | 'REJECTED';
}

export interface TaxReturn {
  id: string;
  domain: TaxDomain;
  periodId: string;
  jurisdictionId: string;
  formType: string;
  grossAmount: number;
  taxableAmount: number;
  taxLiability: number;
  filingStatus: 'DRAFT' | 'AI_GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  provenance: CalculationProvenance;
}

export interface TaxFiling {
  id: string;
  domain: TaxDomain;
  periodId: string;
  jurisdictionId: string;
  formName: string; // e.g. "Form 1120-S", "CDTFA-401-A", "Form 941"
  status: 'DRAFT' | 'AI_GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  submissionId?: string;
  submittedAt?: string;
  acceptedAt?: string;
  payloadHash?: string;
  professionalReview?: TaxProfessionalReview;
}

export interface TaxDeadline {
  id: string;
  domain: TaxDomain;
  jurisdictionId: string;
  periodId: string;
  deadlineType: 'FILING' | 'PAYMENT' | 'REGISTRATION_RENEWAL' | 'NOTICE_RESPONSE';
  dueDate: string;
  extendedDate?: string;
  isHardStatuteOfLimitations: boolean;
  penaltyWarningDescription: string;
}

export interface TaxProfessionalReview {
  id: string;
  domain: TaxDomain;
  reviewerId: string;
  reviewerName: string;
  credentials: 'EA' | 'CPA' | 'TAX_ATTORNEY' | 'SUPERVISORY_PREPARER';
  status: 'ASSIGNED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'ESCALATED';
  findings: string[];
  recommendations: string[];
  signedOffAt?: string;
  signatureHash?: string;
}

export interface TaxNotice {
  id: string;
  domain: TaxDomain;
  jurisdictionId: string;
  noticeNumber: string; // e.g. "CP2000", "CDTFA-Notice-of-Determination", "941-Penalty-Notice"
  receivedDate: string;
  responseDeadline: string;
  summary: string;
  assessedAmount?: number;
  status: 'NEW' | 'ANALYZED' | 'RESPONSE_DRAFTED' | 'RESOLVED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface TaxEvidence {
  id: string;
  domain: TaxDomain;
  sourceType: 'INVOICE' | 'BANK_STATEMENT' | 'PAYROLL_REPORT' | 'W2' | '1099' | 'RECEIPT' | 'EXEMPTION_CERT' | 'LEDGER_ENTRY';
  fileName: string;
  fileHash: string;
  uploadedAt: string;
  extractedFields: Record<string, any>;
  confidenceScore: number;
  verificationStatus: 'PENDING' | 'AI_EXTRACTED' | 'HUMAN_VERIFIED' | 'DISCREPANCY';
}
