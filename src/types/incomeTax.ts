import { 
  TaxPeriod, 
  CalculationProvenance, 
  TaxFiling, 
  TaxLiability, 
  TaxPayment, 
  TaxNotice, 
  TaxProfessionalReview 
} from './common';

// ============================================================================
// INDIVIDUAL & BUSINESS INCOME TAX DOMAIN GRAPH OBJECTS
// ============================================================================

export type IncomeEntityStructure = 'INDIVIDUAL_1040' | 'C_CORP_1120' | 'S_CORP_1120S' | 'PARTNERSHIP_1065' | 'SINGLE_MEMBER_LLC';

export interface IncomeTaxProfile {
  id: string;
  taxpayerId: string;
  entityType: IncomeEntityStructure;
  legalName: string;
  federalEinOrSsnMasked: string;
  fiscalYearEndMonth: number; // 12 for calendar year
  primaryStateJurisdiction: string;
  multiStateApportionmentRequired: boolean;
}

export type { TaxCase, IncomeTaxCase } from './taxCase';

export interface IncomeTaxReturn {
  id: string;
  taxCaseId: string;
  taxYear: number;
  formType: 'FORM_1040' | 'FORM_1120' | 'FORM_1120_S' | 'FORM_1065';
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  totalDeductions: number;
  netTaxableIncome: number;
  taxLiability: TaxLiability;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  quarterlyEstimatedTaxesPaid: number;
  refundOrBalanceDue: number;
  filing: TaxFiling;
  review?: TaxProfessionalReview;
  provenance: CalculationProvenance;
}

export interface ScheduleCDetails {
  grossReceiptsOrSales: number;
  returnsAndAllowances: number;
  costOfGoodsSold: number;
  advertising: number;
  carAndTruckExpenses: number;
  depreciationSection179: number;
  insurance: number;
  legalAndProfessionalServices: number;
  officeExpense: number;
  homeOfficeDeduction: number;
  travelAndMeals: number;
  utilities: number;
  netBusinessProfitOrLoss: number;
  selfEmploymentTaxableAmount: number;
}
