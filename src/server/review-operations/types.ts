/**
 * Autonomous Tax OS — Phase 6: Professional Operations & Review Governance Types
 */

import { UserRole, CredentialType, CredentialStatus, AvailabilityStatus, RiskLevel, TaxDomain } from '@prisma/client';

export enum ReviewTaskType {
  FINAL_RETURN_REVIEW = 'FINAL_RETURN_REVIEW',
  POSITION_REVIEW = 'POSITION_REVIEW',
  STATE_REVIEW = 'STATE_REVIEW',
  MULTI_STATE_REVIEW = 'MULTI_STATE_REVIEW',
  DEDUCTION_REVIEW = 'DEDUCTION_REVIEW',
  CREDIT_REVIEW = 'CREDIT_REVIEW',
  EVIDENCE_REVIEW = 'EVIDENCE_REVIEW',
  CALCULATION_DISCREPANCY = 'CALCULATION_DISCREPANCY',
  DOCUMENT_REVIEW = 'DOCUMENT_REVIEW',
  RESIDENCY_REVIEW = 'RESIDENCY_REVIEW',
  SALES_TAX_REVIEW = 'SALES_TAX_REVIEW',
  PAYROLL_REVIEW = 'PAYROLL_REVIEW',
  LEGAL_REVIEW = 'LEGAL_REVIEW',
  NOTICE_REVIEW = 'NOTICE_REVIEW',
  AMENDMENT_REVIEW = 'AMENDMENT_REVIEW',
  QUALITY_ASSURANCE = 'QUALITY_ASSURANCE'
}

export enum ReviewTaskStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  IN_REVIEW = 'IN_REVIEW',
  WAITING_ON_CUSTOMER = 'WAITING_ON_CUSTOMER',
  WAITING_ON_AI = 'WAITING_ON_AI',
  WAITING_ON_DOCUMENT = 'WAITING_ON_DOCUMENT',
  WAITING_ON_SECOND_REVIEWER = 'WAITING_ON_SECOND_REVIEWER',
  WAITING_ON_ATTORNEY = 'WAITING_ON_ATTORNEY',
  CHANGES_REQUIRED = 'CHANGES_REQUIRED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum CustomerRequestType {
  QUESTION = 'QUESTION',
  DOCUMENT_REQUEST = 'DOCUMENT_REQUEST',
  CONFIRMATION = 'CONFIRMATION',
  SIGNATURE_REQUEST = 'SIGNATURE_REQUEST',
  PAYMENT_INFORMATION = 'PAYMENT_INFORMATION'
}

export enum CustomerRequestStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum MessageRecipientScope {
  ALL = 'ALL',
  CUSTOMER_REVIEWER = 'CUSTOMER_REVIEWER',
  REVIEWER_OPS = 'REVIEWER_OPS',
  REVIEWER_SENIOR = 'REVIEWER_SENIOR',
  REVIEWER_ATTORNEY = 'REVIEWER_ATTORNEY'
}

export enum QaAction {
  PASS = 'PASS',
  CORRECTION_REQUIRED = 'CORRECTION_REQUIRED',
  ESCALATE = 'ESCALATE',
  PROCESS_ISSUE = 'PROCESS_ISSUE',
  AGENT_ISSUE = 'AGENT_ISSUE',
  RULE_ISSUE = 'RULE_ISSUE'
}

export enum QaSamplingReason {
  RANDOM_SAMPLE = 'RANDOM_SAMPLE',
  HIGH_RISK = 'HIGH_RISK',
  NEW_REVIEWER = 'NEW_REVIEWER',
  LARGE_DEDUCTION = 'LARGE_DEDUCTION',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
  AGENT_CONFLICT = 'AGENT_CONFLICT'
}

export interface FinalReviewChecklist {
  identityVerified: boolean;
  filingStatusVerified: boolean;
  dependentsResolved: boolean;
  incomeReconciled: boolean;
  withholdingReconciled: boolean;
  estimatedPaymentsConfirmed: boolean;
  materialDeductionsReviewed: boolean;
  creditsReviewed: boolean;
  stateResidencyResolved: boolean;
  multiStateSourcingResolved: boolean;
  calculationValidationPassed: boolean;
  noUnresolvedHighRiskPositions: boolean;
  notesComplete: boolean;
}

export interface ReviewerAuthorizationCheck {
  authorized: boolean;
  reasons: string[];
  reviewerId: string;
  credentialStatus: CredentialStatus;
  reviewLevel: number;
  authorizedJurisdictions: string[];
  authorizedTaxDomains: string[];
}
