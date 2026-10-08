/**
 * Autonomous Tax OS — Multi-Way Payroll Reconciliation Engine
 * 
 * Performs automated reconciliation across four financial dimensions:
 * 1. Payroll Runs <-> Quarterly Form 941 totals
 * 2. 4 Quarters Form 941 <-> Annual W-2 / W-3 totals
 * 3. Tax Liabilities <-> Bank Deposits (EFTPS / State ACH)
 * 4. Payroll Runs <-> General Ledger (GL) Wages & Payroll Tax Expense
 * 
 * Discrepancy codes:
 * - 941_W2_MISMATCH
 * - PAYROLL_GL_MISMATCH
 * - DEPOSIT_MISMATCH
 * - WITHHOLDING_MISMATCH
 * - EMPLOYEE_YEAR_TO_DATE_MISMATCH
 * - STATE_RETURN_MISMATCH
 */

import { ReconciliationAnomaly } from '../types';

export class PayrollReconciliationEngine {
  /**
   * Reconciles payroll runs against Form 941 quarterly return values.
   */
  public static reconcilePayrollRunsTo941(params: {
    runTotalGrossWagesCents: bigint;
    runTotalFitWithheldCents: bigint;
    runTotalFicaTaxesCents: bigint;
    form941Line2WagesCents: bigint;
    form941Line3FitCents: bigint;
    form941Line5eFicaCents: bigint;
  }): {
    isBalanced: boolean;
    anomalies: ReconciliationAnomaly[];
  } {
    const anomalies: ReconciliationAnomaly[] = [];

    // Line 2 Gross Wages parity
    if (params.runTotalGrossWagesCents !== params.form941Line2WagesCents) {
      const variance = params.runTotalGrossWagesCents - params.form941Line2WagesCents;
      anomalies.push({
        code: 'WITHHOLDING_MISMATCH',
        description: 'Gross wages in payroll runs do not match Form 941 Line 2',
        expectedCents: params.runTotalGrossWagesCents,
        actualCents: params.form941Line2WagesCents,
        varianceCents: variance,
        severity: 'ERROR'
      });
    }

    // Line 3 FIT Withheld parity
    if (params.runTotalFitWithheldCents !== params.form941Line3FitCents) {
      const variance = params.runTotalFitWithheldCents - params.form941Line3FitCents;
      anomalies.push({
        code: 'FIT_WITHHOLDING_MISMATCH',
        description: 'FIT withheld in payroll runs does not match Form 941 Line 3',
        expectedCents: params.runTotalFitWithheldCents,
        actualCents: params.form941Line3FitCents,
        varianceCents: variance,
        severity: 'ERROR'
      });
    }

    // Line 5e FICA Taxes parity
    if (params.runTotalFicaTaxesCents !== params.form941Line5eFicaCents) {
      const variance = params.runTotalFicaTaxesCents - params.form941Line5eFicaCents;
      anomalies.push({
        code: 'WITHHOLDING_MISMATCH',
        description: 'FICA taxes in payroll runs do not match Form 941 Line 5e',
        expectedCents: params.runTotalFicaTaxesCents,
        actualCents: params.form941Line5eFicaCents,
        varianceCents: variance,
        severity: 'ERROR'
      });
    }

    return {
      isBalanced: anomalies.length === 0,
      anomalies
    };
  }

  /**
   * Reconciles Form 941 tax liability against actual bank deposits.
   */
  public static reconcileTaxLiabilitiesToDeposits(params: {
    totalTaxLiabilityCents: bigint;
    totalDepositsCents: bigint;
  }): {
    isBalanced: boolean;
    balanceDueOrOverpaymentCents: bigint;
    anomalies: ReconciliationAnomaly[];
  } {
    const anomalies: ReconciliationAnomaly[] = [];
    const variance = params.totalTaxLiabilityCents - params.totalDepositsCents;

    if (variance !== BigInt(0)) {
      anomalies.push({
        code: 'DEPOSIT_MISMATCH',
        description: variance > BigInt(0)
          ? `Undeposited tax liability detected: $${Number(variance) / 100} due`
          : `Deposit overpayment detected: $${Number(-variance) / 100}`,
        expectedCents: params.totalTaxLiabilityCents,
        actualCents: params.totalDepositsCents,
        varianceCents: variance,
        severity: variance > BigInt(0) ? 'ERROR' : 'WARNING'
      });
    }

    return {
      isBalanced: variance === BigInt(0),
      balanceDueOrOverpaymentCents: variance,
      anomalies
    };
  }

  /**
   * Reconciles payroll run wages against General Ledger (GL) accounts.
   */
  public static reconcilePayrollToGeneralLedger(params: {
    payrollGrossWagesCents: bigint;
    payrollEmployerTaxesCents: bigint;
    glWagesExpenseCents: bigint;
    glEmployerTaxesExpenseCents: bigint;
  }): {
    isBalanced: boolean;
    anomalies: ReconciliationAnomaly[];
  } {
    const anomalies: ReconciliationAnomaly[] = [];

    // Check Wages Expense
    if (params.payrollGrossWagesCents !== params.glWagesExpenseCents) {
      const variance = params.payrollGrossWagesCents - params.glWagesExpenseCents;
      anomalies.push({
        code: 'PAYROLL_GL_MISMATCH',
        description: 'Payroll run gross wages do not match GL Wages Expense account',
        expectedCents: params.payrollGrossWagesCents,
        actualCents: params.glWagesExpenseCents,
        varianceCents: variance,
        severity: 'ERROR'
      });
    }

    // Check Employer Taxes Expense
    if (params.payrollEmployerTaxesCents !== params.glEmployerTaxesExpenseCents) {
      const variance = params.payrollEmployerTaxesCents - params.glEmployerTaxesExpenseCents;
      anomalies.push({
        code: 'PAYROLL_GL_MISMATCH',
        description: 'Payroll run employer taxes do not match GL Payroll Tax Expense account',
        expectedCents: params.payrollEmployerTaxesCents,
        actualCents: params.glEmployerTaxesExpenseCents,
        varianceCents: variance,
        severity: 'ERROR'
      });
    }

    return {
      isBalanced: anomalies.length === 0,
      anomalies
    };
  }
}
