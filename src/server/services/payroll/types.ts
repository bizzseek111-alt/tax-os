/**
 * Autonomous Tax OS — Phase 8 Production Payroll Tax Engine Types
 * 
 * Core type definitions for deterministic payroll calculations,
 * statutory wage bases, federal and multi-state withholdings, deposit schedules,
 * tax forms (941, 940, W-2, W-3), and worker classification.
 */

import {
  PayFrequency,
  WorkerType,
  EmploymentStatus,
  PayrollRunStatus,
  EarningType,
  DeductionType,
  PayrollTaxType,
  DepositFrequency,
  DepositStatus,
  PayrollReturnStatus,
  PayrollReturnForm,
  PayrollPaymentStatus,
  WorkerClassificationRisk,
  WorkerClassificationStatus,
  EmployerRegistrationType,
  EmployerRegistrationStatus
} from '@prisma/client';

export {
  PayFrequency,
  WorkerType,
  EmploymentStatus,
  PayrollRunStatus,
  EarningType,
  DeductionType,
  PayrollTaxType,
  DepositFrequency,
  DepositStatus,
  PayrollReturnStatus,
  PayrollReturnForm,
  PayrollPaymentStatus,
  WorkerClassificationRisk,
  WorkerClassificationStatus,
  EmployerRegistrationType,
  EmployerRegistrationStatus
};

export interface W4Elections {
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH';
  multipleJobs: boolean;
  claimDependentsCents: bigint;
  otherIncomeCents: bigint;
  deductionsCents: bigint;
  extraWithholdingCents: bigint;
}

export interface StateWithholdingConfig {
  stateCode: string;
  allowances?: number;
  filingStatus?: string;
  additionalWithholdingCents?: bigint;
  exempt?: boolean;
}

export interface BenefitsConfig {
  retirement401kPct?: number; // e.g. 0.05 for 5%
  retirement401kCents?: bigint;
  healthInsuranceCents?: bigint;
  hsaCents?: bigint;
  fsaCents?: bigint;
  otherPostTaxCents?: bigint;
}

export interface EarningInput {
  employeeId: string;
  earningType: EarningType;
  hours?: number;
  rateCents?: bigint;
  amountCents: bigint;
}

export interface DeductionInput {
  employeeId: string;
  deductionType: DeductionType;
  amountCents: bigint;
}

export interface TaxableWageResult {
  taxType: PayrollTaxType;
  jurisdiction: string;
  grossAmountCents: bigint;
  subjectWagesCents: bigint;
  excessWagesCents: bigint;
  taxableWagesCents: bigint;
}

export interface EmployeeWithholdingResult {
  employeeId: string;
  taxType: PayrollTaxType;
  jurisdiction: string;
  wageBaseCents: bigint;
  taxAmountCents: bigint;
  calculationMethod: string;
}

export interface EmployerTaxResult {
  employeeId: string;
  taxType: PayrollTaxType;
  jurisdiction: string;
  wageBaseCents: bigint;
  taxAmountCents: bigint;
  employerRate: number;
}

export interface EmployeePayrollCalculation {
  employeeId: string;
  grossWagesCents: bigint;
  preTaxDeductionsFitCents: bigint;
  preTaxDeductionsFicaCents: bigint;
  preTaxDeductionsFutaCents: bigint;
  preTaxDeductionsSitCents: bigint;
  postTaxDeductionsCents: bigint;
  taxableWages: TaxableWageResult[];
  withholdings: EmployeeWithholdingResult[];
  employerTaxes: EmployerTaxResult[];
  totalEmployeeWithholdingsCents: bigint;
  totalEmployerTaxesCents: bigint;
  netPayCents: bigint;
}

export interface PayrollRunCalculationResult {
  employerId: string;
  payDate: Date;
  payFrequency: PayFrequency;
  employeeCalculations: EmployeePayrollCalculation[];
  grossWagesCents: bigint;
  employeeWithholdingsCents: bigint;
  employerTaxesCents: bigint;
  totalTaxLiabilityCents: bigint;
  netPayCents: bigint;
  calculationHash: string;
}

export interface DepositScheduleRecommendation {
  depositFrequency: DepositFrequency;
  lookbackLiabilityCents: bigint;
  reason: string;
}

export interface Form941CalculationResult {
  quarter: number;
  taxYear: number;
  line1NumEmployees: number;
  line2WagesCents: bigint;
  line3FitWithheldCents: bigint;
  line5aTaxableSsWagesCents: bigint;
  line5aTaxCents: bigint;
  line5bTaxableSsTipsCents: bigint;
  line5bTaxCents: bigint;
  line5cTaxableMedWagesCents: bigint;
  line5cTaxCents: bigint;
  line5dTaxableAddlMedWagesCents: bigint;
  line5dTaxCents: bigint;
  line5eTotalFicaCents: bigint;
  line6TotalTaxesBeforeAdjustments: bigint;
  line10TotalTaxesCents: bigint;
  line11TotalDepositsCents: bigint;
  line12BalanceDueCents: bigint;
  line15OverpaymentCents: bigint;
  scheduleBRequired: boolean;
  scheduleBAllocations: { date: string; amountCents: bigint }[];
}

export interface Form940CalculationResult {
  taxYear: number;
  line3TotalPaymentsCents: bigint;
  line4ExemptPaymentsCents: bigint;
  line7TotalTaxableWages: bigint;
  line8FutaTaxBeforeCredit: bigint;
  line9StateCreditCents: bigint;
  line12TotalFutaTaxCents: bigint;
  line12TotalFutaTaxAfterAdjustmentsCents: bigint;
  line13DepositsCents: bigint;
  line14BalanceDueCents: bigint;
  line15OverpaymentCents: bigint;
}

export interface W2CalculationResult {
  employeeId: string;
  taxYear: number;
  box1WagesCents: bigint;
  box2FitCents: bigint;
  box3SsWagesCents: bigint;
  box4SsTaxCents: bigint;
  box5MedWagesCents: bigint;
  box6MedTaxCents: bigint;
  box7SsTipsCents: bigint;
  box8AllocatedTipsCents: bigint;
  box10DependentCare: bigint;
  box11NonqualPlans: bigint;
  box12Codes: { code: string; amountCents: bigint }[];
  box13StatutoryEmployee: boolean;
  box13RetirementPlan: boolean;
  box13ThirdPartySickPay: boolean;
  box14Other: { label: string; amountCents: bigint }[];
  stateWithholdings: { state: string; stateWagesCents: bigint; stateTaxCents: bigint }[];
  localWithholdings: { locality: string; localWagesCents: bigint; localTaxCents: bigint }[];
}

export interface W3CalculationResult {
  taxYear: number;
  totalW2Count: number;
  box1TotalWagesCents: bigint;
  box2TotalFitCents: bigint;
  box3TotalSsWagesCents: bigint;
  box4TotalSsTaxCents: bigint;
  box5TotalMedWagesCents: bigint;
  box6TotalMedTaxCents: bigint;
  reconciliationStatus: 'BALANCED' | 'DISCREPANCY';
  discrepancies: string[];
}

export interface WorkerClassificationFactSet {
  workerId: string;
  workerName: string;
  stateCode: string;
  hasWrittenContract: boolean;
  contractSpecifiesIndependent: boolean;
  setsOwnHours: boolean;
  usesOwnEquipment: boolean;
  worksForOtherClients: boolean;
  hasIndependentBusinessEntity: boolean;
  performsCoreBusinessFunction: boolean;
  paidHourlyOrSalary: boolean;
  receivesEmployeeBenefits: boolean;
  canRealizeProfitOrLoss: boolean;
}

export interface WorkerClassificationEvaluation {
  workerId: string;
  riskLevel: WorkerClassificationRisk;
  status: WorkerClassificationStatus;
  primaryRiskFactors: string[];
  commonLawScore: number; // 0 to 100
  abcTestPassed: boolean;
  recommendation: 'MAINTAIN_CONTRACTOR' | 'POTENTIAL_RISK_REVIEW_REQUIRED' | 'HIGH_RISK_RECLASSIFICATION_RECOMMENDED';
  memo: string;
}

export interface ReconciliationAnomaly {
  code: string;
  description: string;
  expectedCents: bigint;
  actualCents: bigint;
  varianceCents: bigint;
  severity: 'WARNING' | 'ERROR';
}
