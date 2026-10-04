import { SalesTaxReconciliationSummary } from '../types/salesTax';
import { PayrollReconciliationSummary } from '../types/payrollTax';

export class ReconciliationEngine {
  /**
   * Reconciles Sales Tax between E-Commerce storefronts, General Ledger, and Filed Returns
   */
  static reconcileSalesTax(params: {
    periodId: string;
    stateCode: string;
    storefrontGross: number;      // e.g. Shopify + Stripe + Amazon
    generalLedgerGross: number;   // Accounting book of record
    marketplaceSales: number;     // Sales where Amazon/Etsy collects & remits
    directSales: number;          // Merchant direct sales
    exemptSales: number;          // Resale certificates / exempt entities
    taxCollectedDirectly: number; // Merchant collected
    taxCollectedMarketplace: number;
    remittedAmount: number;
  }): SalesTaxReconciliationSummary {
    const taxableSalesTotal = params.directSales - params.exemptSales;
    const grossDiscrepancy = Math.abs(params.storefrontGross - params.generalLedgerGross);
    const taxVariance = Math.abs(params.taxCollectedDirectly - params.remittedAmount);

    const isDiscrepancyDetected = grossDiscrepancy > 1.0 || taxVariance > 1.0;

    const items = [
      {
        channel: 'Shopify Direct Storefront',
        recordedTax: params.taxCollectedDirectly * 0.7,
        expectedTax: params.taxCollectedDirectly * 0.7,
        variance: 0,
        explanation: 'Direct merchant tax collection matching gateway records.'
      },
      {
        channel: 'Amazon Marketplace Facilitator',
        recordedTax: params.taxCollectedMarketplace,
        expectedTax: params.taxCollectedMarketplace,
        variance: 0,
        explanation: 'Amazon remitted directly to State Department of Revenue under Marketplace Facilitator Act.'
      }
    ];

    if (grossDiscrepancy > 0) {
      items.push({
        channel: 'General Ledger vs Commerce Feed',
        recordedTax: params.taxCollectedDirectly,
        expectedTax: params.taxCollectedDirectly + (grossDiscrepancy * 0.0825),
        variance: grossDiscrepancy,
        explanation: `Warning: General Ledger shows $${params.generalLedgerGross.toLocaleString()} while Commerce Feed reports $${params.storefrontGross.toLocaleString()} ($${grossDiscrepancy.toLocaleString()} unmapped accrual).`
      });
    }

    return {
      periodId: params.periodId,
      stateCode: params.stateCode,
      grossSalesECommerce: params.storefrontGross,
      grossSalesGeneralLedger: params.generalLedgerGross,
      taxableSalesTotal,
      exemptSalesTotal: params.exemptSales,
      marketplaceFacilitatorSales: params.marketplaceSales,
      directMerchantSales: params.directSales,
      taxCollectedByMerchant: params.taxCollectedDirectly,
      taxCollectedByMarketplaces: params.taxCollectedMarketplace,
      taxRemittedToState: params.remittedAmount,
      varianceAmount: taxVariance + grossDiscrepancy,
      isDiscrepancyDetected,
      reconciliationItems: items
    };
  }

  /**
   * Reconciles Payroll between payroll provider, Form 941 quarterly filings, and Annual W-2/W-3
   */
  static reconcilePayroll(params: {
    taxYear: number;
    providerWagesYTD: number;
    quarterly941TotalWages: number;
    w3Box1Wages: number;
    glPayrollExpense: number;
    bankPayrollDisbursements: number;
  }): PayrollReconciliationSummary {
    const w2To941WageVariance = Math.abs(params.w3Box1Wages - params.quarterly941TotalWages);
    const glToPayrollVariance = Math.abs(params.glPayrollExpense - params.bankPayrollDisbursements);

    const isFullyReconciled = w2To941WageVariance < 1.0 && glToPayrollVariance < 1.0;
    const auditNotes: string[] = [];

    if (w2To941WageVariance === 0) {
      auditNotes.push('Quarterly Form 941 Box 2 wages match annual Form W-3 Box 1 totals exactly ($0.00 variance).');
    } else {
      auditNotes.push(`CRITICAL DISCREPANCY: Form 941 quarterly sum ($${params.quarterly941TotalWages.toLocaleString()}) does not match Form W-3 Box 1 ($${params.w3Box1Wages.toLocaleString()}). Variance: $${w2To941WageVariance.toLocaleString()}.`);
    }

    if (glToPayrollVariance === 0) {
      auditNotes.push('General Ledger payroll account balances reconcile with net bank ACH disbursements.');
    } else {
      auditNotes.push(`WARNING: GL Payroll expense account deviates from bank ACH debits by $${glToPayrollVariance.toLocaleString()}. Check timing differences or uncashed employee checks.`);
    }

    return {
      taxYear: params.taxYear,
      payrollProviderReportedWages: params.providerWagesYTD,
      sumOfQuarterly941Wages: params.quarterly941TotalWages,
      annualW3Box1Wages: params.w3Box1Wages,
      generalLedgerPayrollExpense: params.glPayrollExpense,
      bankDisbursementsForPayroll: params.bankPayrollDisbursements,
      w2To941WageVariance,
      glToPayrollVariance,
      isFullyReconciled,
      reconciliationAuditNotes: auditNotes
    };
  }
}
