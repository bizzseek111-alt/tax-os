/**
 * Autonomous TaxOS — Deterministic Tax Calculation Types & Data Contracts
 * Workstream 3: Phase 3 Core Types
 * 
 * All monetary amounts are represented as 64-bit integer cents (bigint)
 * to guarantee zero floating-point imprecision across progressive tax brackets.
 */

export type FilingStatus =
  | 'SINGLE'
  | 'MARRIED_FILING_JOINTLY'
  | 'MARRIED_FILING_SEPARATELY'
  | 'HEAD_OF_HOUSEHOLD'
  | 'QUALIFYING_SURVIVING_SPOUSE';

export type ResidencyStatus =
  | 'FULL_YEAR_RESIDENT'
  | 'PART_YEAR_RESIDENT'
  | 'NONRESIDENT';

export type SupportedJurisdiction =
  | 'US-FED'
  | 'US-CA'
  | 'US-NY'
  | 'US-NJ'
  | 'US-IL'
  | 'US-MA';

export interface TaxBracket {
  floorCents: bigint;
  ceilingCents: bigint | null; // null represents unbounded top bracket
  rateBps: number;             // Basis points: 1000 = 10.0%, 2400 = 24.0%, 3700 = 37.0%
  baseTaxCents: bigint;        // Pre-computed tax at floor
}

export type ScheduleCExpenseCategory =
  | 'advertising'
  | 'car_truck'
  | 'commissions'
  | 'contract_labor'
  | 'depreciation'
  | 'insurance'
  | 'interest'
  | 'legal_professional'
  | 'office_expense'
  | 'rent_lease'
  | 'repairs'
  | 'supplies'
  | 'taxes_licenses'
  | 'travel'
  | 'meals'
  | 'utilities'
  | 'other';

export interface W2Input {
  sourceFactId?: string;
  employerName: string;
  employerEin: string;
  wagesCents: bigint;               // Box 1
  federalWithholdingCents: bigint;  // Box 2
  socialSecurityWagesCents?: bigint;// Box 3
  socialSecurityTaxCents?: bigint;  // Box 4
  medicareWagesCents?: bigint;      // Box 5
  medicareTaxCents?: bigint;        // Box 6
  stateCode?: string;               // Box 15
  stateWagesCents?: bigint;         // Box 16
  stateWithholdingCents?: bigint;   // Box 17
}

export interface ScheduleCInput {
  businessName: string;
  einOrSsn?: string;
  principalActivityCode?: string;
  isSstb?: boolean;                 // Specified Service Trade or Business (IRC § 199A)
  grossReceiptsCents: bigint;       // Reconciled gross receipts (deduplicated 1099-NEC/1099-K/bank)
  returnsAndAllowancesCents?: bigint;
  costOfGoodsSoldCents?: bigint;
  expenses: Partial<Record<ScheduleCExpenseCategory, bigint>>;
}

export interface InvestmentIncomeInput {
  taxableInterestCents: bigint;     // Form 1099-INT Box 1
  taxExemptInterestCents?: bigint;  // Form 1099-INT Box 8
  ordinaryDividendsCents: bigint;   // Form 1099-DIV Box 1a
  qualifiedDividendsCents: bigint;  // Form 1099-DIV Box 1b
  shortTermCapitalGainsCents?: bigint;
  longTermCapitalGainsCents?: bigint;
}

export interface FederalAdjustmentsInput {
  educatorExpensesCents?: bigint;
  hsaDeductionCents?: bigint;       // Form 8889
  studentLoanInterestCents?: bigint;// Form 1098-E
  iraDeductionCents?: bigint;       // Traditional IRA
}

export interface FederalPaymentsInput {
  estimatedTaxPaymentsCents: bigint;
  priorYearOverpaymentAppliedCents?: bigint;
  extensionPaymentCents?: bigint;
}

export interface DependentInput {
  name: string;
  relationship: string;
  ageYears: number;
  monthsLivedWithTaxpayer: number;
  isUnder17: boolean;
  hasSsn: boolean;
}

export interface FederalTaxInput {
  taxYear: number;
  filingStatus: FilingStatus;
  taxpayerName: string;
  taxpayerSsnToken?: string;
  w2s: W2Input[];
  scheduleC?: ScheduleCInput;
  investmentIncome?: InvestmentIncomeInput;
  adjustments?: FederalAdjustmentsInput;
  payments: FederalPaymentsInput;
  dependents?: DependentInput[];
  residentStates: SupportedJurisdiction[];
  isItemizedClaimed?: boolean;
  itemizedDeductionCents?: bigint;
}

export interface SelfEmploymentTaxResult {
  netProfitCents: bigint;
  seEarningsCents: bigint;          // 92.35% under IRC § 1402(a)(12)
  oasdiTaxableCents: bigint;        // Capped at Social Security wage base
  oasdiTaxCents: bigint;            // 12.4%
  medicareTaxCents: bigint;         // 2.9% uncapped
  additionalMedicareTaxCents: bigint;// 0.9% above threshold
  totalSelfEmploymentTaxCents: bigint;
  deductibleSeTaxCents: bigint;     // 50% above-the-line deduction (IRC § 164(f))
}

export interface QbiResult {
  qualifiedBusinessIncomeCents: bigint;
  tentativeQbiDeductionCents: bigint; // 20%
  phaseoutApplied: boolean;
  phaseoutReductionCents: bigint;
  allowedQbiDeductionCents: bigint;  // Form 8995
}

export interface FederalCreditsResult {
  childTaxCreditCents: bigint;       // IRC § 24 ($2,000 / child)
  creditForOtherDependentsCents: bigint; // $500 / other dependent
  nonrefundableCreditsTotalCents: bigint;
  refundableChildTaxCreditCents: bigint; // Additional Child Tax Credit (Form 8812)
  totalCreditsCents: bigint;
}

export interface CalculationLineageNode {
  field: string;
  valueCents: bigint;
  formulaDescription: string;
  ruleParameters: Record<string, any>;
  statutoryAuthority: string;
  formLineRef: string;
  sourceFactIds: string[];
}

export interface FederalTaxResult {
  taxYear: number;
  filingStatus: FilingStatus;
  engineVersion: string;
  ruleSetVersion: string;

  // Income
  w2WagesTotalCents: bigint;
  scheduleCNetProfitCents: bigint;
  taxableInterestCents: bigint;
  ordinaryDividendsCents: bigint;
  totalIncomeCents: bigint;         // Form 1040 Line 9

  // Adjustments & AGI
  selfEmployment: SelfEmploymentTaxResult;
  totalAdjustmentsCents: bigint;    // Schedule 1 Line 26
  adjustedGrossIncomeCents: bigint; // Form 1040 Line 11

  // Deductions & QBI
  isItemized: boolean;
  standardDeductionCents: bigint;
  allowedDeductionCents: bigint;    // Form 1040 Line 12
  qbi: QbiResult;
  taxableIncomeCents: bigint;       // Form 1040 Line 15

  // Tax & Credits
  incomeTaxCents: bigint;           // Progressive bracket tax (Form 1040 Line 16)
  credits: FederalCreditsResult;
  taxAfterCreditsCents: bigint;
  totalFederalTaxCents: bigint;     // Form 1040 Line 24 (Income + SE + Other taxes)

  // Payments & Balance
  federalWithholdingTotalCents: bigint;
  estimatedPaymentsTotalCents: bigint;
  totalPaymentsCents: bigint;       // Form 1040 Line 33
  refundCents: bigint;              // Form 1040 Line 34
  balanceDueCents: bigint;          // Form 1040 Line 37

  lineage: Record<string, CalculationLineageNode>;
  formLineBreakdown: Record<string, bigint>;
}

export interface StateTaxInput {
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  residencyStatus: ResidencyStatus;
  residencyDaysInState?: number;
  w2s: W2Input[];
  scheduleC?: ScheduleCInput;
  federalAgiCents: bigint;
  federalTaxableIncomeCents: bigint;
  federalItemizedCents?: bigint;
  stateWithholdingCents: bigint;
  stateEstimatedPaymentsCents: bigint;
  outOfStateTaxPaidCents?: bigint;   // For other-state tax credit
  pensionIncomeCents?: number;       // For IL pension subtraction
  highEarnerNetGainCents?: bigint;   // For MA Fair Share Surtax
  customAdditionsCents?: bigint;
  customSubtractionsCents?: bigint;
}

export interface StateTaxResult {
  jurisdiction: SupportedJurisdiction;
  stateName: string;
  formName: string;
  taxYear: number;
  residencyStatus: ResidencyStatus;
  startingIncomeCents: bigint;
  stateAdditionsCents: bigint;
  stateSubtractionsCents: bigint;
  stateAgiCents: bigint;
  stateDeductionsCents: bigint;
  stateExemptionsCents: bigint;
  stateTaxableIncomeCents: bigint;
  stateGrossTaxCents: bigint;
  stateCreditsCents: bigint;
  otherStateTaxCreditCents: bigint;
  netStateTaxCents: bigint;
  stateWithholdingCents: bigint;
  stateEstimatedPaymentsCents: bigint;
  totalStatePaymentsCents: bigint;
  stateRefundCents: bigint;
  stateBalanceDueCents: bigint;
  lineage: Record<string, CalculationLineageNode>;
  formLineBreakdown: Record<string, bigint>;
}

export interface ComprehensiveTaxResult {
  calculationRunId: string;
  taxCaseId: string;
  taxYear: number;
  engineVersion: string;
  ruleSetVersion: string;
  provider: string;
  calculatedAt: string;
  inputHash: string;
  resultHash: string;
  federal: FederalTaxResult;
  states: StateTaxResult[];
  combinedSummary: {
    totalEffectiveTaxRateBps: number;
    combinedTaxLiabilityCents: bigint;
    combinedTotalPaymentsCents: bigint;
    combinedRefundCents: bigint;
    combinedBalanceDueCents: bigint;
  };
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface FormLineMapping {
  taxYear: number;
  jurisdiction: string;
  formName: string;
  schedule?: string;
  lineCode: string;
  description: string;
  calculationField: string;
}

export interface ValidationIssue {
  code: string;
  message: string;
  field?: string;
  severity: 'FATAL' | 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  isValid: boolean;
  status: 'VALID' | 'INVALID' | 'UNSUPPORTED' | 'REQUIRES_REVIEW';
  issues: ValidationIssue[];
}
