import { 
  TaxJurisdiction, 
  Registration,
  TaxRegistration, 
  TaxPeriod, 
  CalculationProvenance, 
  TaxFiling, 
  TaxPayment, 
  TaxNotice, 
  TaxReturn,
  TaxProfessionalReview 
} from './common';

// ============================================================================
// PAYROLL & EMPLOYMENT TAX DOMAIN GRAPH OBJECTS
// ============================================================================

export type WorkerType = 'W2_EMPLOYEE' | '1099_CONTRACTOR' | 'STATUTORY_EMPLOYEE' | 'EXEMPT_OFFICER';
export type PayFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY';
export type DepositScheduleType = 'SEMI_WEEKLY' | 'MONTHLY' | 'NEXT_DAY_100K_RULE';

export interface Employer {
  id: string;
  legalBusinessName: string;
  dbaName?: string;
  fein: string; // Federal Employer Identification Number (e.g. 12-3456789)
  entityStructure: 'C_CORP' | 'S_CORP' | 'LLC' | 'PARTNERSHIP' | 'SOLE_PROP';
  isSeasonalEmployer: boolean;
  depositSchedule: PayrollDepositSchedule;
  registrations: EmployerRegistration[];
}

export interface StateUnemploymentAccount {
  id: string;
  employerId: string;
  stateCode: string; // e.g. "CA", "NY"
  stateAgencyName: string; // e.g. "California Employment Development Department (EDD)"
  accountNumber: string;
  experienceRate: number; // e.g. 2.7%
  wageBaseLimit: number; // e.g. $7,000 in CA
  isActive: boolean;
}

export interface LocalTaxAccount {
  id: string;
  employerId: string;
  localityId: string;
  localAgencyName: string; // e.g. "Pennsylvania Local Earned Income Tax (EIT)", "NYC Dept of Finance"
  accountNumber: string;
  localTaxRate: number;
  withholdingRequired: boolean;
}

export interface EmployerRegistration extends TaxRegistration {
  domain: 'PAYROLL_TAX';
  stateCode: string;
  stateWithholdingAccountId: string;
  stateUnemploymentAccountId: string;
  stateUnemploymentAccount: StateUnemploymentAccount;
  localTaxAccounts: LocalTaxAccount[];
  sutaAssignedRate: number; // State Unemployment Tax rate assigned by state (e.g. 2.7%)
  sutaWageBaseLimit: number; // e.g. California $7,000, Washington $68,500
}

export interface PayrollJurisdiction extends TaxJurisdiction {
  supportsSui: boolean;
  supportsPaidFamilyLeave: boolean;
  supportsLocalWithholding: boolean;
}

export interface Employee {
  id: string;
  employerId: string;
  employeeNumber: string;
  // SENSITIVE PII - RBAC Isolated
  firstName: string;
  lastName: string;
  ssnMasked: string; // e.g. "XXX-XX-1234" (accessible only with payroll:read_pii)
  homeAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  workLocationState: string;
  employmentPeriod: EmploymentPeriod;
  hireDate: string;
  terminationDate?: string;
  w4Status: {
    filingStatus: 'SINGLE_OR_SEPARATE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';
    multipleJobsOrSpouseWorks: boolean;
    dependentCreditAmount: number;
    otherIncomeAmount: number;
    deductionsAmount: number;
    extraWithholdingPerPaycheck: number;
  };
  compensation: {
    payType: 'SALARY' | 'HOURLY';
    baseRate: number; // RBAC Isolated
    payFrequency: PayFrequency;
  };
}

export interface EmploymentPeriod {
  id: string;
  workerId: string;
  startDate: string;
  endDate?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'SEASONAL' | 'TEMPORARY';
  standardHoursPerWeek: number;
  isOfficer: boolean;
}

export interface Contractor {
  id: string;
  employerId: string;
  contractorName: string;
  einOrSsnMasked: string;
  businessAddress: string;
  serviceDescription: string;
  totalCompensationYTD: number;
  hasW9OnRecord: boolean;
  requires1099Nec: boolean;
}

export interface WorkerClassification {
  id: string;
  workerId: string;
  workerName: string;
  currentDesignation: WorkerType;
  // Fact-finding matrix based on IRS Common Law Rules & DOL ABC Test
  facts: {
    behavioralControl: {
      instructionsGivenLevel: 'HIGH' | 'MODERATE' | 'LOW';
      trainingProvidedByEmployer: boolean;
      evaluationSystemsControl: boolean;
    };
    financialControl: {
      significantInvestmentInTools: boolean;
      unreimbursedBusinessExpenses: boolean;
      servicesAvailableToOpenMarket: boolean;
      methodOfPayment: 'HOURLY_SALARY' | 'FLAT_FEE_PER_PROJECT';
      opportunityForProfitOrLoss: boolean;
    };
    typeOfRelationship: {
      writtenContractsInPlace: boolean;
      employeeBenefitsProvided: boolean; // health, pension, PTO
      permanencyOfRelationship: 'INDEFINITE' | 'PROJECT_BASED';
      servicesCoreToRegularBusiness: boolean;
    };
  };
  // AI Safeguards: Flag concerns without declaring legally binding verdict
  aiFactFindingSummary: string;
  riskAssessment: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_INCONSISTENCY' | 'CRITICAL_DISPUTED';
  identifiedAuthorities: string[]; // e.g. "IRS Revenue Ruling 87-41 (20-Factor Test)", "29 CFR Part 795"
  escalationStatus: 'NOT_ESCALATED' | 'ESCALATED_TO_CPA' | 'ESCALATED_TO_TAX_ATTORNEY' | 'RESOLVED_BY_COUNSEL';
  review?: TaxProfessionalReview;
}

export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  checkDate: string;
  payFrequency: PayFrequency;
}

export interface PayrollEarning {
  grossPay: number;
  regularPay: number;
  overtimePay: number;
  bonusPay: number;
  commissionPay: number;
}

export interface PreTaxDeduction {
  deductionType: 'SECTION_125_HEALTH' | 'TRADITIONAL_401K' | 'HSA_CONTRIBUTION' | 'COMMUTER_BENEFIT';
  amount: number;
  isFicaExempt: boolean;
  isFederalIncomeTaxExempt: boolean;
}

export interface TaxableWage {
  federalIncomeTaxTaxable: number;
  socialSecurityTaxable: number;
  medicareTaxable: number;
  futaTaxable: number;
  stateIncomeTaxTaxable: number;
  sutaTaxable: number;
}

export interface EmployeeWithholding {
  federalIncomeTax: number;
  socialSecurityEmployee: number; // 6.2% up to annual cap
  medicareEmployee: number;       // 1.45%
  additionalMedicareEmployee: number; // 0.9% for wages > $200k
  stateIncomeTax: number;
  stateDisabilityInsurance?: number;
  paidFamilyLeaveEmployee?: number;
  localTaxWithholding?: number;
  totalEmployeeWithholdings: number;
}

export interface EmployerTax {
  socialSecurityEmployer: number; // 6.2% match
  medicareEmployer: number;       // 1.45% match
  futaEmployer: number;           // Federal Unemployment 0.6% (net of state credit)
  sutaEmployer: number;           // State Unemployment based on employer assigned rate
  statePaidFamilyLeaveEmployer?: number;
  localEmployerTax?: number;
  totalEmployerTax: number;
}

export interface PayrollRun {
  id: string;
  employerId: string;
  payPeriod: PayPeriod;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PROCESSED' | 'RECONCILED';
  employeeCount: number;
  totalGrossWages: number;
  totalPreTaxDeductions: number;
  totalEmployeeWithholding: number;
  totalEmployerTaxes: number;
  totalNetPay: number;
  totalPayrollCost: number; // Gross Wages + Employer Taxes
  provenance: CalculationProvenance;
}

export interface PayrollTaxLiability {
  id: string;
  payrollRunId: string;
  jurisdictionId: string;
  federalDepositAmount: number; // 941 liability: Employee FIT + Employee FICA + Employer FICA
  futaLiabilityAmount: number;   // Form 940 quarterly accrual
  stateWithholdingAmount: number;
  stateUnemploymentAmount: number;
  dueDate: string;
  status: 'PENDING' | 'DEPOSITED' | 'OVERDUE';
}

export interface PayrollTaxDeposit extends TaxPayment {
  domain: 'PAYROLL_TAX';
  depositType: 'FEDERAL_941_EFTPS' | 'FEDERAL_940_FUTA' | 'STATE_WITHHOLDING' | 'STATE_SUTA';
  scheduledDate: string;
  settledDate?: string;
  traceNumber?: string;
  eftpsBatchNumber?: string;
  depositScheduleApplied: DepositScheduleType;
}

export interface PayrollDepositSchedule {
  federalSchedule: DepositScheduleType;
  lookbackPeriodLiability: number; // Total Form 941 liability reported in 4-quarter lookback
  stateSchedule: string;
  nextDepositDeadline: string;
  isNextDayRuleTriggered: boolean; // Triggered if liability >= $100,000 on any single day
}

export interface FederalPayrollReturn extends TaxReturn {
  formType: 'FORM_941' | 'FORM_940' | 'FORM_W3';
  taxYear: number;
  quarter?: 1 | 2 | 3 | 4;
  totalWages: number;
  federalWithheld: number;
  ficaTotal: number;
  totalDeposits: number;
  filing: PayrollFiling;
}

export interface StatePayrollReturn extends TaxReturn {
  stateCode: string;
  formName: string; // e.g. "California DE-9 / DE-9C", "NYS NYS-45"
  stateWages: number;
  stateIncomeTaxWithheld: number;
  stateUnemploymentWages: number;
  stateUnemploymentTaxDue: number;
  filing: PayrollFiling;
}

export interface LocalPayrollReturn extends TaxReturn {
  localityId: string;
  localityName: string;
  localWages: number;
  localTaxDue: number;
  filing: PayrollFiling;
}

export interface PayrollFiling extends TaxFiling {
  domain: 'PAYROLL_TAX';
  irsTransmissionId?: string;
  stateFilingConfirmation?: string;
}

export interface PayrollPayment extends TaxPayment {
  domain: 'PAYROLL_TAX';
  payrollRunId?: string;
}

export interface Form941Record extends FederalPayrollReturn {
  id: string;
  taxYear: number;
  quarter: 1 | 2 | 3 | 4;
  numberOfEmployees: number;
  wagesTipsOtherCompensation: number; // Box 2
  federalIncomeTaxWithheld: number;   // Box 3
  taxableSocialSecurityWages: number; // Box 5a
  socialSecurityTax: number;
  taxableMedicareWages: number;       // Box 5c
  medicareTax: number;
  totalTaxesBeforeAdjustments: number;
  totalDepositsForQuarter: number;
  balanceDueOrOverpayment: number;
  filing: PayrollFiling;
}

export interface Form940Record extends FederalPayrollReturn {
  id: string;
  taxYear: number;
  totalPaymentsToEmployees: number;
  paymentsExemptFromFuta: number;
  totalTaxableFutaWages: number; // capped at $7,000 per employee
  futaTaxBeforeCreditReduction: number;
  totalFutaTaxAfterCredit: number; // typically 0.6%
  totalFutaDepositsMade: number;
  filing: PayrollFiling;
}

export interface W2Record {
  id: string;
  employeeId: string;
  taxYear: number;
  box1WagesTips: number;
  box2FederalWithheld: number;
  box3SocialSecurityWages: number;
  box4SocialSecurityWithheld: number;
  box5MedicareWages: number;
  box6MedicareWithheld: number;
  box12Items: { code: string; amount: number }[];
  stateRecords: {
    stateCode: string;
    stateWages: number;
    stateTaxWithheld: number;
  }[];
}

export interface W3Record {
  taxYear: number;
  totalW2Count: number;
  totalBox1Wages: number;
  totalBox2Withheld: number;
  totalBox3SsWages: number;
  totalBox4SsWithheld: number;
  totalBox5MedWages: number;
  totalBox6MedWithheld: number;
}

export interface Form1099Record {
  id: string;
  contractorId: string;
  taxYear: number;
  formType: '1099_NEC' | '1099_MISC';
  nonemployeeCompensation: number; // Box 1
  federalTaxWithheld: number;
  filing: PayrollFiling;
}

export interface PayrollNotice extends TaxNotice {
  domain: 'PAYROLL_TAX';
  penalizedDepositAmount?: number;
  failureToDepositPenaltyRate?: number; // 2%, 5%, 10%, or 15% under IRC § 6656
}

export interface PayrollReconciliationSummary {
  taxYear: number;
  payrollProviderReportedWages: number;
  sumOfQuarterly941Wages: number;
  annualW3Box1Wages: number;
  generalLedgerPayrollExpense: number;
  bankDisbursementsForPayroll: number;
  w2To941WageVariance: number;
  glToPayrollVariance: number;
  isFullyReconciled: boolean;
  reconciliationAuditNotes: string[];
}

// Provider Abstraction for third-party payroll engines
export interface PayrollDataProvider {
  providerName: 'Gusto' | 'ADP' | 'Rippling' | 'QuickBooksPayroll' | 'Paychex' | 'SquarePayroll' | 'Deel' | 'Remote' | 'CustomPayroll';
  fetchEmployers(): Promise<Employer[]>;
  fetchEmployees(employerId: string): Promise<Employee[]>;
  fetchPayrollRuns(employerId: string, startDate: string, endDate: string): Promise<PayrollRun[]>;
  fetchYtdTotals(employerId: string, year: number): Promise<Record<string, number>>;
}

export interface PayrollTaxEngineProvider {
  engineName: string;
  calculateWithholding(employee: Employee, grossEarning: PayrollEarning, preTax: PreTaxDeduction[]): Promise<EmployeeWithholding>;
  calculateEmployerTaxes(employee: Employee, grossEarning: PayrollEarning, employer: Employer): Promise<EmployerTax>;
  determineDepositSchedule(lookbackLiabilities: number[]): Promise<PayrollDepositSchedule>;
  calculateFederalPayroll(payrollRun: PayrollRun): Promise<PayrollTaxLiability>;
  calculateStatePayroll(payrollRun: PayrollRun, stateCode: string): Promise<PayrollTaxLiability>;
  calculateLocalPayroll(payrollRun: PayrollRun, localityId: string): Promise<PayrollTaxLiability>;
  validatePayrollReturn(form941: Form941Record): Promise<{ isValid: boolean; validationErrors: string[] }>;
  generatePayrollForms(employerId: string, quarter: number, year: number): Promise<{ form941: Form941Record }>;
  generateFilingPayload(filingId: string): Promise<{ payload: Record<string, any>; xmlData?: string }>;
  filePayrollReturn(filingId: string): Promise<{ confirmationNumber: string; acceptedTimestamp: string }>;
  retrieveFilingStatus(filingId: string): Promise<{ status: string; irsAcknowledgmentCode?: string }>;
}
