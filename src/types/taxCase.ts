import { 
  TaxDomain, 
  CalculationProvenance, 
  FilingFrequency, 
  ComplianceStatus, 
  TaxProfessionalReview 
} from './common';
import { IncomeEntityStructure } from './incomeTax';

// ============================================================================
// HIERARCHICAL TAXCASE ARCHITECTURE
// TaxCase
//   ├── IncomeTaxCase
//   ├── SalesTaxCase / SalesTaxObligation
//   └── PayrollTaxCase / PayrollTaxObligation
// ============================================================================

export type CaseStatus = 
  | 'DISCOVERY' 
  | 'DOCUMENT_INTAKE' 
  | 'CALCULATING' 
  | 'REVIEW_REQUIRED' 
  | 'APPROVED' 
  | 'FILED' 
  | 'ARCHIVED';

/**
 * Base Polymorphic TaxCase
 * Shared across Income Tax, Sales & Use Tax, and Payroll Tax domains
 */
export interface TaxCase {
  id: string;
  businessId: string;
  taxYear: number;
  domain: TaxDomain;
  title: string;
  status: CaseStatus;
  readinessScore: number; // 0 - 100%
  assignedPreparerId?: string;
  assignedReviewerId?: string; // EA, CPA, or Attorney
  evidenceNodeIds: string[];
  openIssueIds: string[];
  professionalReview?: TaxProfessionalReview;
  provenance: CalculationProvenance;
  createdAt: string;
  updatedAt: string;
}

/**
 * Domain 1: IncomeTaxCase
 * Specialization for pass-through entities (1120-S, 1065) and corporate/individual returns (1120, 1040)
 */
export interface IncomeTaxCase extends TaxCase {
  domain: 'INCOME_TAX';
  entityStructure: IncomeEntityStructure;
  formType: 'FORM_1120_S' | 'FORM_1120' | 'FORM_1065' | 'FORM_1040';
  fiscalYearEndMonth: number; // 12 for calendar year
  primaryStateJurisdiction: string;
  apportionmentStateCodes: string[];
  
  // Financial Highlights
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  totalDeductions: number;
  ordinaryBusinessIncome: number;
  
  // Cross-Domain Linkage: Line 8 Salaries & Wages verified from PayrollTaxCase
  line8WageDeductionLink?: {
    payrollTaxCaseId: string;
    verifiedAggregateWages: number;
    reconciliationVariance: number;
  };
  
  k1ShareholderCount: number;
  returnId?: string;
}

/**
 * Domain 2: SalesTaxCase / SalesTaxObligation
 * Specialization for multi-tier state & local sales tax returns, sourcing, and nexus
 */
export interface SalesTaxCase extends TaxCase {
  domain: 'SALES_USE_TAX';
  jurisdictionId: string;
  stateCode: string;
  periodFrequency: FilingFrequency;
  periodLabel: string; // e.g. "Q1 2027 (Jan - Mar)"
  returnDueDate: string;
  
  // Transaction Revenue Breakdown
  grossSales: number;
  taxableSales: number;
  exemptSales: number;
  marketplaceFacilitatorSales: number;
  directMerchantSales: number;
  
  // Tax Calculations
  compositeRateApplied: number; // e.g. 0.0950 (9.50% State + County + City + District)
  taxCalculated: number;
  taxCollected: number;
  marketplaceCollectedAmount: number;
  prepaymentsDeducted: number;
  netRemittanceDue: number;
  
  // Sourcing & Nexus
  sourcingRule: 'DESTINATION' | 'ORIGIN';
  associatedNexusId?: string;
  salesReturnId?: string;
}

export type SalesTaxObligation = SalesTaxCase;

/**
 * Domain 3: PayrollTaxCase / PayrollTaxObligation
 * Specialization for quarterly Form 941, annual Form 940, and state unemployment/withholding
 */
export interface PayrollTaxCase extends TaxCase {
  domain: 'PAYROLL_TAX';
  formType: 'FORM_941' | 'FORM_940' | 'STATE_EDD_DE9' | 'NYS_NYS45';
  quarterNumber?: 1 | 2 | 3 | 4;
  periodLabel: string; // e.g. "Q1 2027 (Quarter Ended March 31)"
  filingDueDate: string;
  
  // Payroll Metrics
  coveredEmployeeCount: number;
  totalGrossWages: number; // Reconciles to IncomeTaxCase Line 8 deduction!
  taxableSocialSecurityWages: number;
  socialSecurityTaxTotal: number; // Employee 6.2% + Employer 6.2%
  taxableMedicareWages: number;
  medicareTaxTotal: number;       // Employee 1.45% + Employer 1.45%
  federalIncomeTaxWithheld: number;
  totalFederalTaxLiability: number; // Form 941 Box 10
  
  // Deposit & Banking Schedule
  depositSchedule: 'SEMI_WEEKLY' | 'MONTHLY';
  totalDepositsRemitted: number;
  balanceDueOrOverpayment: number;
  isTreasRegSafeHarborMet: boolean;
  
  // Worker Classification Audits
  flaggedWorkerClassificationIds: string[];
  payrollReturnId?: string;
}

export type PayrollTaxObligation = PayrollTaxCase;
