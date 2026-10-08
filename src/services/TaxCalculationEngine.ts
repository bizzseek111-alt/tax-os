/**
 * Autonomous Tax OS — Deterministic Tax Calculation Adapter
 * Workstream 3: Phase 3
 * 
 * Bridges client/legacy interface directly to the Phase 3 authoritative
 * deterministic FederalTaxEngine and State modules.
 * Eliminates all mock/hardcoded heuristics (e.g. 15% assumed refund, crude flat rates).
 */

import { FederalTaxEngine } from '../server/services/taxCalculation/federalEngine';
import { getStateTaxModule } from '../server/services/taxCalculation/states';
import { FilingStatus, FederalTaxInput, StateTaxInput } from '../server/services/taxCalculation/types';

export interface TaxCalculationInput {
  taxYear: number;
  filingStatus: 'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD';
  w2WagesCents: number;
  scheduleCGrossCents: number;
  scheduleCExpensesCents: number;
  hsaContributionCents: number;
  residentState: 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';
  pensionIncomeCents?: number;
  highEarnerNetGainCents?: number;
}

export interface TaxCalculationOutput {
  taxYear: number;
  filingStatus: string;
  // Federal
  scheduleCNetProfitCents: number;
  selfEmploymentTaxCents: number;
  deductibleSeTaxCents: number;
  qbiDeductionCents: number;
  adjustedGrossIncomeCents: number;
  standardDeductionCents: number;
  taxableIncomeCents: number;
  totalFederalTaxCents: number;
  federalRefundOrDueCents: number;
  // State
  stateJurisdiction: string;
  stateTaxableIncomeCents: number;
  stateTaxCents: number;
  stateRefundOrDueCents: number;
  // Form Line Proofs
  formLineBreakdown: Record<string, number>;
}

export class TaxCalculationEngine {
  /**
   * Deterministic 2026 Federal & State Tax Calculation
   */
  public static calculate(input: TaxCalculationInput): TaxCalculationOutput {
    if (input.taxYear !== 2026) {
      throw new Error(`TaxCalculationEngine strictly anchored to tax year 2026. Given: ${input.taxYear}`);
    }

    const filingStatus: FilingStatus =
      input.filingStatus === 'MARRIED_JOINT' ? 'MARRIED_FILING_JOINTLY' : input.filingStatus;

    // Convert input numbers to BigInt cents
    const fedInput: FederalTaxInput = {
      taxYear: 2026,
      filingStatus,
      taxpayerName: 'Taxpayer',
      w2s: input.w2WagesCents > 0 ? [{
        employerName: 'Primary Employer',
        employerEin: '00-0000000',
        wagesCents: BigInt(input.w2WagesCents),
        federalWithholdingCents: 0n,
      }] : [],
      scheduleC: input.scheduleCGrossCents > 0 ? {
        businessName: 'Consulting Practice',
        grossReceiptsCents: BigInt(input.scheduleCGrossCents),
        expenses: {
          supplies: BigInt(input.scheduleCExpensesCents),
        },
      } : undefined,
      adjustments: input.hsaContributionCents > 0 ? {
        hsaDeductionCents: BigInt(input.hsaContributionCents),
      } : undefined,
      payments: {
        estimatedTaxPaymentsCents: 0n,
      },
      residentStates: [input.residentState],
    };

    // Authoritative Federal calculation
    const fedResult = FederalTaxEngine.calculate(fedInput);

    // Authoritative State calculation
    const stateModule = getStateTaxModule(input.residentState);
    if (!stateModule) {
      throw new Error(`Unsupported state jurisdiction: ${input.residentState}`);
    }

    const stateInput: StateTaxInput = {
      jurisdiction: input.residentState,
      taxYear: 2026,
      residencyStatus: 'FULL_YEAR_RESIDENT',
      w2s: fedInput.w2s,
      scheduleC: fedInput.scheduleC,
      federalAgiCents: fedResult.adjustedGrossIncomeCents,
      federalTaxableIncomeCents: fedResult.taxableIncomeCents,
      stateWithholdingCents: 0n,
      stateEstimatedPaymentsCents: 0n,
      pensionIncomeCents: input.pensionIncomeCents,
      highEarnerNetGainCents: input.highEarnerNetGainCents ? BigInt(input.highEarnerNetGainCents) : undefined,
      customAdditionsCents: (input.residentState === 'US-CA' && input.hsaContributionCents > 0)
        ? BigInt(input.hsaContributionCents)
        : 0n,
    };

    const stateResult = stateModule.calculate(stateInput, filingStatus);

    const formLineBreakdown: Record<string, number> = {
      'Form 1040 Line 1z (W-2 Wages)': Number(fedResult.w2WagesTotalCents),
      'Schedule C Line 31 (Net Profit)': Number(fedResult.scheduleCNetProfitCents),
      'Form 1040 Line 9 (Total Income)': Number(fedResult.totalIncomeCents),
      'Form 1040 Line 11 (AGI)': Number(fedResult.adjustedGrossIncomeCents),
      'Form 1040 Line 12 (Standard Deduction)': Number(fedResult.allowedDeductionCents),
      'Form 1040 Line 13 (QBI Deduction)': Number(fedResult.qbi.allowedQbiDeductionCents),
      'Form 1040 Line 15 (Taxable Income)': Number(fedResult.taxableIncomeCents),
      'Form 1040 Line 16 (Regular Tax)': Number(fedResult.incomeTaxCents),
      'Form 1040 Line 23 (Other Taxes SE)': Number(fedResult.selfEmployment.totalSelfEmploymentTaxCents),
      'Form 1040 Line 24 (Total Tax)': Number(fedResult.totalFederalTaxCents),
    };

    // Signed settlement: negative means balance due
    const federalRefundOrDueCents = fedResult.refundCents > 0n
      ? Number(fedResult.refundCents)
      : -Number(fedResult.balanceDueCents);

    const stateRefundOrDueCents = stateResult.stateRefundCents > 0n
      ? Number(stateResult.stateRefundCents)
      : -Number(stateResult.stateBalanceDueCents);

    return {
      taxYear: 2026,
      filingStatus: input.filingStatus,
      scheduleCNetProfitCents: Number(fedResult.scheduleCNetProfitCents),
      selfEmploymentTaxCents: Number(fedResult.selfEmployment.totalSelfEmploymentTaxCents),
      deductibleSeTaxCents: Number(fedResult.selfEmployment.deductibleSeTaxCents),
      qbiDeductionCents: Number(fedResult.qbi.allowedQbiDeductionCents),
      adjustedGrossIncomeCents: Number(fedResult.adjustedGrossIncomeCents),
      standardDeductionCents: Number(fedResult.allowedDeductionCents),
      taxableIncomeCents: Number(fedResult.taxableIncomeCents),
      totalFederalTaxCents: Number(fedResult.totalFederalTaxCents),
      federalRefundOrDueCents,
      stateJurisdiction: input.residentState,
      stateTaxableIncomeCents: Number(stateResult.stateTaxableIncomeCents),
      stateTaxCents: Number(stateResult.netStateTaxCents),
      stateRefundOrDueCents,
      formLineBreakdown,
    };
  }
}
