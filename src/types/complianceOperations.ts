import { 
  TaxDomain, 
  JurisdictionLevel, 
  ComplianceStatus, 
  FilingFrequency, 
  CalculationProvenance 
} from './common';

// ============================================================================
// COMPLIANCE OPERATIONS ARCHITECTURE
// Covering: Employer Compliance, Business Tax Compliance, Registrations,
// Deadlines Calendar, and Payments & Remittance Engine
// ============================================================================

export type RegistrationType = 
  | 'SALES_TAX_PERMIT'
  | 'STATE_WITHHOLDING_ACCOUNT'
  | 'STATE_UNEMPLOYMENT_SUTA_ACCOUNT'
  | 'LOCAL_TAX_ACCOUNT'
  | 'FOREIGN_QUALIFICATION_SOS'
  | 'LOCAL_BUSINESS_LICENSE'
  | 'FINCEN_BOIR';

export interface TaxRegistrationRecord {
  id: string;
  domain: TaxDomain;
  registrationType: RegistrationType;
  jurisdictionId: string;
  stateCode: string;
  agencyName: string; // e.g. "California Employment Development Department (EDD)", "CDTFA"
  accountNumberMasked: string;
  legalEntityName: string;
  effectiveDate: string;
  renewalDate?: string;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'ACTION_REQUIRED' | 'SUSPENDED' | 'DEREGISTERED';
  filingFrequency: FilingFrequency;
  portalLoginUrl: string;
  associatedNexusTriggerId?: string; // Links registration to the SalesTaxNexus or Payroll physical presence event
  notes?: string;
}

export type DeadlineCategory = 
  | 'INCOME_TAX_ANNUAL'
  | 'INCOME_TAX_QUARTERLY_ESTIMATE'
  | 'SALES_TAX_RETURN'
  | 'SALES_TAX_PREPAYMENT'
  | 'PAYROLL_DEPOSIT_SEMI_WEEKLY'
  | 'PAYROLL_DEPOSIT_MONTHLY'
  | 'PAYROLL_FORM_941_QUARTERLY'
  | 'PAYROLL_FORM_940_ANNUAL'
  | 'YEAR_END_W2_W3_1099'
  | 'FRANCHISE_TAX_ANNUAL_REPORT'
  | 'FINCEN_BOIR_UPDATE';

export interface TaxDeadlineEvent {
  id: string;
  domain: TaxDomain;
  category: DeadlineCategory;
  title: string; // e.g. "Q1 Form 941 Quarterly Federal Return"
  jurisdictionCode: string; // e.g. "US-FED", "CA-CDTFA", "NY-NYS45", "DE-SOS"
  authorityName: string;
  statutoryDueDate: string; // Official statute date (e.g. Saturday, April 30, 2027)
  effectiveDueDate: string; // Rolled to next business day under IRC § 7503 / State Rules (e.g. Monday, May 2, 2027)
  isWeekendOrHolidayRolled: boolean;
  statutoryCitation: string; // e.g. "IRC § 6071", "Treas. Reg. § 31.6071(a)-1", "IRC § 7503"
  associatedLiabilityId?: string;
  estimatedAmountDue?: number;
  status: 'UPCOMING' | 'DUE_SOON' | 'ACTION_REQUIRED' | 'FILED_SATISFIED' | 'OVERDUE';
  daysRemaining: number;
  canBeExtended: boolean;
  extensionFormRequired?: string; // e.g. "Form 7004", "Form 4868"
  extendedDueDate?: string;
}

export type PaymentMethodType = 
  | 'FEDERAL_EFTPS'
  | 'STATE_ACH_DEBIT'
  | 'STATE_ACH_CREDIT_NACHA_TXP'
  | 'CREDIT_CARD_GATEWAY'
  | 'PAPER_CHECK_WITH_VOUCHER';

export interface TaxPaymentRemittance {
  id: string;
  domain: TaxDomain;
  periodId: string;
  jurisdictionId: string;
  jurisdictionName: string;
  agencyName: string;
  paymentType: 'TAX_DEPOSIT' | 'RETURN_BALANCE_DUE' | 'ESTIMATED_TAX' | 'ANNUAL_FEE' | 'PENALTY_SETTLEMENT';
  paymentMethod: PaymentMethodType;
  amount: number;
  safeHarborThresholdMet: boolean;
  safeHarborRuleDescription?: string; // e.g. "98% Semi-Weekly Shortfall Rule (Treas. Reg. § 31.6302-1(f))"
  scheduledInitiationDate: string;
  statutoryDeadlineDate: string;
  settlementDate?: string;
  status: 'DRAFT' | 'AUTHORIZED' | 'TRANSMITTED' | 'SETTLED' | 'REJECTED';
  confirmationTraceNumber?: string;
  eftpsBatchNumber?: string;
  nachaTxpRecord?: NachaTxpBankingPayload;
  provenance: CalculationProvenance;
}

// Banking Standard: NACHA CCD+ with TXP (Tax Payment) Banking Addenda Record
export interface NachaTxpBankingPayload {
  routingNumber: string;
  accountNumberMasked: string;
  taxPayerIdentificationNumber: string; // EIN or SSN
  taxPaymentTypeCode: string; // e.g. "94101" for Form 941 Q1, "1120" for Corporate Income
  taxPeriodEndDate: string; // YYMMDD
  subPaymentAmount: number;
  formattedAddendaRecord: string; // TXP*TIN*TXP_CODE*DATE*AMOUNT*T*...
}

export interface EmployerComplianceRecord {
  id: string;
  fein: string;
  legalEntityName: string;
  dbaName?: string;
  entityType: 'C_CORP' | 'S_CORP' | 'LLC' | 'PARTNERSHIP';
  stateOfIncorporation: string;
  activeEmployeeCount: number;
  activeContractorCount: number;
  nexusStatesCount: number;
  employerStateRegistrations: {
    stateCode: string;
    hasWithholdingAccount: boolean;
    withholdingAccountNumber?: string;
    hasSutaAccount: boolean;
    sutaAccountNumber?: string;
    sutaExperienceRate: number;
    hasPaidFamilyLeaveProgram: boolean;
    hasDisabilityProgram: boolean;
    workersCompPolicyNumber: string;
    workersCompCarrier: string;
    workersCompRenewalDate: string;
  }[];
  onboardingAudits: {
    w4CompletionRate: number; // 0 - 100%
    stateAllowanceCertificatesRate: number;
    w9CollectedContractorsRate: number;
    i9EmploymentVerificationRate: number;
  };
  laborLawPostersCompliant: boolean;
}

export interface BusinessTaxComplianceRecord {
  id: string;
  fein: string;
  legalEntityName: string;
  incorporationState: string;
  delawareFranchiseTax: {
    method: 'AUTHORIZED_SHARES' | 'ASSUMED_PAR_VALUE_CAPITAL';
    annualReportDueDate: string; // March 1 for Delaware corporations
    estimatedTaxOwed: number;
    status: 'CURRENT' | 'DUE_SOON' | 'PAID';
  };
  foreignQualifications: {
    stateCode: string;
    certificateOfAuthorityNumber: string;
    annualReportDueDate: string;
    goodStandingStatus: 'IN_GOOD_STANDING' | 'RENEWAL_PENDING' | 'FORFEITED';
  }[];
  fincenBoir: {
    initialReportFiledDate: string;
    boirTrackingId: string;
    requires30DayUpdate: boolean;
    beneficialOwnersCount: number;
  };
}
