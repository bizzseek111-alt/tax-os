/**
 * Autonomous Tax OS — Phase 9: Filing Domain Types & Interfaces
 */

import {
  FilingStatus,
  SignatureStatus,
  FilingSubmissionStatus,
  AcknowledgmentStatus,
  TaxDomain
} from '@prisma/client';

export {
  FilingStatus,
  SignatureStatus,
  FilingSubmissionStatus,
  AcknowledgmentStatus
};

export interface GateCheckResult {
  code: string;
  name: string;
  passed: boolean;
  blocking: boolean;
  message: string;
  metadata?: Record<string, any>;
}

export interface FilingReadinessResult {
  taxCaseId: string;
  returnVersionId?: string;
  isReadyForCustomerReview: boolean;
  isReadyForSignature: boolean;
  isReadyForTransmission: boolean;
  currentStatus: FilingStatus;
  blockingReasons: string[];
  checks: GateCheckResult[];
}

export interface TaxpayerReviewSummary {
  taxCaseId: string;
  taxYear: number;
  filingStatus: string;
  taxpayerName: string;
  spouseName?: string;
  jurisdictions: string[];
  grossIncomeCents: bigint;
  taxableIncomeCents: bigint;
  totalDeductionsCents: bigint;
  deductionType: 'STANDARD' | 'ITEMIZED';
  totalCreditsCents: bigint;
  federalTaxLiabilityCents: bigint;
  federalPaymentsCents: bigint;
  federalRefundOrDueCents: bigint; // Negative for refund, positive for balance due
  stateSummaries: {
    stateCode: string;
    stateTaxLiabilityCents: bigint;
    statePaymentsCents: bigint;
    stateRefundOrDueCents: bigint;
  }[];
  paymentInstructions?: {
    paymentMethod: 'DIRECT_DEBIT_EFW' | 'CHECK' | 'EFTPS' | 'DIRECT_PAY';
    amountCents: bigint;
    scheduledDate?: string;
    bankRoutingMasked?: string;
    bankAccountMasked?: string;
  };
  refundInstructions?: {
    refundMethod: 'DIRECT_DEPOSIT' | 'PAPER_CHECK';
    bankRoutingMasked?: string;
    bankAccountMasked?: string;
  };
  professionalReviewStatus: {
    isReviewed: boolean;
    reviewedBy?: string;
    credential?: string;
    reviewedAt?: string;
  };
  importantWarnings: string[];
  returnVersionHash: string;
  reviewedAt?: string;
}

export interface Form8879SignaturePayload {
  returnVersionId: string;
  primaryTaxpayerPin: string; // 5-digit self-selected PIN
  spousePin?: string; // 5-digit PIN if Married Filing Jointly
  eroEfin: string;
  eroPin: string;
  taxpayerIpAddress: string;
  taxpayerUserAgent?: string;
  taxpayerConsentAgreement: boolean;
  disclosureConsent7216: boolean;
  electronicFundsWithdrawalConsent?: boolean;
}

export interface ReturnPackage {
  taxYear: number;
  taxCaseId: string;
  returnVersionId: string;
  forms: string[];
  jurisdictions: string[];
  federalReturnXml: string;
  stateReturnPayloads: Record<string, any>;
  packageHash: string;
  generatedAt: Date;
  pdfSummaryDocumentId?: string;
}

export interface TransmissionResult {
  submissionId: string;
  idempotencyKey: string;
  transmissionId: string;
  status: FilingSubmissionStatus;
  provider: string;
  environment: string;
  submittedAt: Date;
  payloadHash: string;
}

export interface AcknowledgmentResult {
  acknowledgmentId: string;
  submissionId: string;
  status: AcknowledgmentStatus;
  receivedAt: Date;
  agencyAcknowledgmentNumber?: string;
  rejectionCodes?: string[];
  rawContent: string;
}

export interface RejectionResolution {
  rejectionId: string;
  rejectCode: string;
  customerFriendlyExplanation: string;
  professionalExplanation: string;
  suggestedActionType: 'TASK' | 'REVIEW' | 'LEGAL';
  fieldOrFormReference?: string;
}

export interface DeadlineCalculationResult {
  jurisdiction: string;
  taxYear: number;
  formType: string;
  isExtension: boolean;
  statutoryDueDate: string; // YYYY-MM-DD
  actualFilingDeadline: string; // YYYY-MM-DD (adjusted for weekend/holiday)
  adjustmentReason?: string;
  daysRemaining: number;
  isPastDue: boolean;
}
