/**
 * Autonomous TaxOS — Payroll Data Provider Abstraction & Data Retention (Phase 2 Foundation)
 * 
 * Provides foundation for payroll providers (Gusto, ADP, Rippling, QuickBooks Payroll)
 * and configurable compliance data retention policies.
 */

export interface PayrollRun {
  payrollId: string;
  payDate: string;
  periodStart: string;
  periodEnd: string;
  grossPayCents: bigint;
  netPayCents: bigint;
  employeeTaxWithholdingCents: bigint;
  employerTaxLiabilityCents: bigint;
  federalWithholdingCents: bigint;
  socialSecurityCents: bigint;
  medicareCents: bigint;
  stateWithholdingCents: bigint;
}

export interface PayrollDataProvider {
  name: string;
  isSandbox: boolean;
  fetchPayrollRuns(year: number): Promise<PayrollRun[]>;
  fetchAnnualTaxSummary(year: number): Promise<{
    totalGrossWagesCents: bigint;
    totalFicaLiabilityCents: bigint;
    totalFederalWithholdingCents: bigint;
    totalStateWithholdingCents: bigint;
  }>;
}

export class SandboxPayrollProvider implements PayrollDataProvider {
  name = 'Gusto (Sandbox)';
  isSandbox = true;

  async fetchPayrollRuns(_year: number): Promise<PayrollRun[]> {
    return [
      {
        payrollId: 'pr_run_q1_01',
        payDate: '2026-03-31',
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
        grossPayCents: 916667n, // $9,166.67
        netPayCents: 684210n,
        employeeTaxWithholdingCents: 232457n,
        employerTaxLiabilityCents: 70125n,
        federalWithholdingCents: 124500n,
        socialSecurityCents: 56833n,
        medicareCents: 13292n,
        stateWithholdingCents: 37832n,
      },
    ];
  }

  async fetchAnnualTaxSummary(_year: number) {
    return {
      totalGrossWagesCents: 11000000n, // $110,000.00
      totalFicaLiabilityCents: 841500n,  // $8,415.00
      totalFederalWithholdingCents: 1494000n, // $14,940.00
      totalStateWithholdingCents: 453980n,   // $4,539.80
    };
  }
}

export const payrollDataProvider: PayrollDataProvider = new SandboxPayrollProvider();

/**
 * Data Retention Classes (Pending Formal Tax/Legal Review)
 */
export enum DataRetentionClass {
  DOCUMENT = 'DOCUMENT',
  FINANCIAL_TRANSACTION = 'FINANCIAL_TRANSACTION',
  OCR_OUTPUT = 'OCR_OUTPUT',
  PROVIDER_TOKEN = 'PROVIDER_TOKEN',
  AUDIT_EVENT = 'AUDIT_EVENT',
}

export interface RetentionPolicy {
  classification: DataRetentionClass;
  retentionYears: number;
  description: string;
  legalStatus: string;
}

export const PLATFORM_RETENTION_POLICIES: Record<DataRetentionClass, RetentionPolicy> = {
  [DataRetentionClass.DOCUMENT]: {
    classification: DataRetentionClass.DOCUMENT,
    retentionYears: 7, // General 26 U.S.C. § 6501 limitation period buffer
    description: 'Source tax documents, Form W-2s, 1099s, expense receipts, and invoice records',
    legalStatus: 'REQUIRES TAX/LEGAL REVIEW',
  },
  [DataRetentionClass.FINANCIAL_TRANSACTION]: {
    classification: DataRetentionClass.FINANCIAL_TRANSACTION,
    retentionYears: 7,
    description: 'Aggregated bank feed line items, categorized ledgers, and commerce receipts',
    legalStatus: 'REQUIRES TAX/LEGAL REVIEW',
  },
  [DataRetentionClass.OCR_OUTPUT]: {
    classification: DataRetentionClass.OCR_OUTPUT,
    retentionYears: 7,
    description: 'Raw OCR bounding boxes, normalized page representations, and key-value pairs',
    legalStatus: 'REQUIRES TAX/LEGAL REVIEW',
  },
  [DataRetentionClass.PROVIDER_TOKEN]: {
    classification: DataRetentionClass.PROVIDER_TOKEN,
    retentionYears: 0, // Revoked upon connection termination; max 1 year inactive
    description: 'Encrypted third-party OAuth access tokens for Plaid/Stripe feeds',
    legalStatus: 'REQUIRES TAX/LEGAL REVIEW',
  },
  [DataRetentionClass.AUDIT_EVENT]: {
    classification: DataRetentionClass.AUDIT_EVENT,
    retentionYears: 10, // Extended audit defense ledger
    description: 'Cryptographic SHA-256 blockchain compliance records and mutation logs',
    legalStatus: 'REQUIRES TAX/LEGAL REVIEW',
  },
};
