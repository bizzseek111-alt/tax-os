import { 
  TaxPaymentRemittance, 
  NachaTxpBankingPayload, 
  PaymentMethodType 
} from '../types/complianceOperations';
import { TaxDomain, CalculationProvenance } from '../types/common';

export class TaxPaymentsEngine {
  /**
   * Generates a standardized NACHA CCD+ TXP (Tax Payment) Banking Addenda Record.
   * Standard syntax defined by NACHA / Bankers Automated Clearing House & Multi-State Tax Commission:
   * TXP * TaxpayerID * TaxType * PeriodEndDate * Amount * TaxTypeSub * ... \
   */
  static formatNachaTxpRecord(params: {
    tin: string;           // 9 digits (EIN without hyphens)
    taxTypeCode: string;   // e.g. "94101" for Form 941 Q1, "11201" for 1120 Corp, "SALES"
    periodEndDate: string; // YYYY-MM-DD -> converted to YYMMDD
    amountCents: number;   // Amount in pennies (or standard integer cents)
  }): string {
    const cleanTin = params.tin.replace(/\D/g, '');
    const cleanDate = params.periodEndDate.replace(/-/g, '').slice(2); // YYMMDD
    const amountStr = Math.round(params.amountCents).toString();

    // Standard TXP record segments delimited by asterisk and terminated with backslash
    return `TXP*${cleanTin}*${params.taxTypeCode}*${cleanDate}*T*${amountStr}*\\`;
  }

  /**
   * Evaluates IRS Payroll 98% Semi-Weekly Shortfall Safe Harbor (Treas. Reg. § 31.6302-1(f))
   * Employer is treated as satisfying deposit requirement if shortfall does not exceed greater of $100 or 2%.
   */
  static evaluatePayrollSafeHarbor(depositedAmount: number, totalRequiredLiability: number): {
    isSafeHarborMet: boolean;
    shortfallAmount: number;
    shortfallPercentage: number;
    shortfallMakeUpDeadline: string;
    description: string;
  } {
    const shortfall = Math.max(0, totalRequiredLiability - depositedAmount);
    const shortfallPercent = (shortfall / totalRequiredLiability) * 100;
    const allowedShortfallMax = Math.max(100, totalRequiredLiability * 0.02); // 2% or $100

    const isMet = shortfall <= allowedShortfallMax;

    return {
      isSafeHarborMet: isMet,
      shortfallAmount: shortfall,
      shortfallPercentage: shortfallPercent,
      shortfallMakeUpDeadline: 'First Wednesday or Friday after the 15th of the following month (or return due date)',
      description: isMet 
        ? `Safe harbor satisfied: Deposit covers ${((depositedAmount / totalRequiredLiability) * 100).toFixed(1)}% (shortfall within 2% statutory allowance under Treas. Reg. § 31.6302-1(f)).`
        : `Safe harbor breached: Shortfall $${shortfall.toLocaleString()} exceeds statutory 2% limit. Deposit shortfall immediately to mitigate IRC § 6656 failure-to-deposit penalties.`
    };
  }

  /**
   * Prepares electronic remittance package with provenance
   */
  static createPaymentRemittance(params: {
    id: string;
    domain: TaxDomain;
    periodId: string;
    jurisdictionId: string;
    jurisdictionName: string;
    agencyName: string;
    paymentType: 'TAX_DEPOSIT' | 'RETURN_BALANCE_DUE' | 'ESTIMATED_TAX' | 'ANNUAL_FEE';
    paymentMethod: PaymentMethodType;
    amount: number;
    requiredLiability: number;
    routingNumber: string;
    accountNumber: string;
    ein: string;
    taxTypeCode: string;
    periodEndDate: string;
    scheduledInitiationDate: string;
    statutoryDeadlineDate: string;
  }): TaxPaymentRemittance {
    const safeHarbor = this.evaluatePayrollSafeHarbor(params.amount, params.requiredLiability);
    const txpString = this.formatNachaTxpRecord({
      tin: params.ein,
      taxTypeCode: params.taxTypeCode,
      periodEndDate: params.periodEndDate,
      amountCents: params.amount * 100
    });

    const nachaPayload: NachaTxpBankingPayload = {
      routingNumber: params.routingNumber,
      accountNumberMasked: `****${params.accountNumber.slice(-4)}`,
      taxPayerIdentificationNumber: params.ein,
      taxPaymentTypeCode: params.taxTypeCode,
      taxPeriodEndDate: params.periodEndDate,
      subPaymentAmount: params.amount,
      formattedAddendaRecord: txpString
    };

    const provenance: CalculationProvenance = {
      engineVersion: 'TaxPaymentsEngine-v2.1',
      ruleSetVersion: '2027.PAYMENTS',
      ruleIds: ['NACHA-TXP-RULE', 'IRC-6302-EFTPS'],
      inputHash: `pay-${params.id}-${params.amount}`,
      calculatedAt: new Date().toISOString(),
      citations: [
        'NACHA Operating Rules & Guidelines (CCD+ TXP Addenda)',
        'IRC § 6302(h) (Electronic Funds Transfer of Taxes)',
        'Treas. Reg. § 31.6302-1(f) (Safe Harbor Rule)'
      ]
    };

    return {
      id: params.id,
      domain: params.domain,
      periodId: params.periodId,
      jurisdictionId: params.jurisdictionId,
      jurisdictionName: params.jurisdictionName,
      agencyName: params.agencyName,
      paymentType: params.paymentType,
      paymentMethod: params.paymentMethod,
      amount: params.amount,
      safeHarborThresholdMet: safeHarbor.isSafeHarborMet,
      safeHarborRuleDescription: safeHarbor.description,
      scheduledInitiationDate: params.scheduledInitiationDate,
      statutoryDeadlineDate: params.statutoryDeadlineDate,
      status: 'AUTHORIZED',
      confirmationTraceNumber: `TRC-${Date.now().toString().slice(-8)}`,
      eftpsBatchNumber: params.paymentMethod === 'FEDERAL_EFTPS' ? `EFTPS-B-${Date.now().toString().slice(-6)}` : undefined,
      nachaTxpRecord: nachaPayload,
      provenance
    };
  }
}
