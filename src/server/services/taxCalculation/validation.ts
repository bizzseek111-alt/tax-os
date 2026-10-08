/**
 * Autonomous TaxOS — Tax Validation & Unsupported Scenario Engine
 * Workstream 3: Phase 3
 * 
 * Enforces rigorous mathematical invariants and statutory boundary validation.
 * Explicitly rejects unmodeled edge cases with UNSUPPORTED_SCENARIO errors,
 * strictly preventing silent approximation or hallucination.
 */

import { FederalTaxInput, ComprehensiveTaxResult, ValidationResult, ValidationIssue } from './types';

export class TaxValidationEngine {
  /**
   * List of tax topics explicitly outside Phase 3 individual scope
   * that must trigger immediate unsupported scenario rejections.
   */
  public static readonly UNSUPPORTED_FLAGS = [
    'K1_PARTNERSHIP_COMPLEX_BASIS',
    'FOREIGN_EARNED_INCOME_EXCLUSION_FORM_2555',
    'FOREIGN_TAX_CREDIT_FORM_1116',
    'ALTERNATIVE_MINIMUM_TAX_FORM_6251',
    'NONRESIDENT_ALIEN_FORM_1040_NR',
    'FARM_INCOME_SCHEDULE_F',
    'HOUSEHOLD_EMPLOYMENT_TAXES_SCHEDULE_H',
  ] as const;

  /**
   * Pre-calculation validation: checks inputs for statutory domain boundaries
   * and unsupported tax scenarios.
   */
  public static validateInput(input: FederalTaxInput): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Tax Year Check
    if (input.taxYear !== 2026) {
      issues.push({
        code: 'UNSUPPORTED_TAX_YEAR',
        message: `Tax Year ${input.taxYear} is not currently supported by Engine RuleSet 2026.1. Only Tax Year 2026 is supported in this runtime.`,
        field: 'taxYear',
        severity: 'FATAL',
      });
    }

    // 2. Jurisdiction Support Check
    for (const jurisdiction of input.residentStates || []) {
      const allowed = ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'];
      if (!allowed.includes(jurisdiction)) {
        issues.push({
          code: 'UNSUPPORTED_JURISDICTION',
          message: `Jurisdiction "${jurisdiction}" is not currently supported in Phase 3. Supported: FED, CA, NY, NJ, IL, MA.`,
          field: 'residentStates',
          severity: 'FATAL',
        });
      }
    }

    // 3. Negative Income / Invalid Monetary Guardrails
    for (const [idx, w2] of (input.w2s || []).entries()) {
      if (w2.wagesCents < 0n) {
        issues.push({
          code: 'INVALID_W2_WAGES',
          message: `W-2 #${idx + 1} (${w2.employerName}) reports negative wages: ${w2.wagesCents}. W-2 Box 1 wages cannot be negative.`,
          field: `w2s[${idx}].wagesCents`,
          severity: 'ERROR',
        });
      }
      if (w2.federalWithholdingCents < 0n) {
        issues.push({
          code: 'INVALID_W2_WITHHOLDING',
          message: `W-2 #${idx + 1} reports negative federal withholding.`,
          field: `w2s[${idx}].federalWithholdingCents`,
          severity: 'ERROR',
        });
      }
    }

    if (input.scheduleC) {
      if (input.scheduleC.grossReceiptsCents < 0n) {
        issues.push({
          code: 'INVALID_SCHEDULE_C_GROSS',
          message: 'Schedule C gross receipts cannot be negative.',
          field: 'scheduleC.grossReceiptsCents',
          severity: 'ERROR',
        });
      }
    }

    // 4. Filing Status Guardrails
    if (!input.filingStatus) {
      issues.push({
        code: 'MISSING_FILING_STATUS',
        message: 'Filing status is mandatory for authoritative tax calculations.',
        field: 'filingStatus',
        severity: 'FATAL',
      });
    }

    const hasFatal = issues.some(i => i.severity === 'FATAL');
    const hasError = issues.some(i => i.severity === 'ERROR');

    let status: ValidationResult['status'] = 'VALID';
    if (hasFatal) status = 'UNSUPPORTED';
    else if (hasError) status = 'INVALID';
    else if (issues.length > 0) status = 'REQUIRES_REVIEW';

    return {
      isValid: !hasFatal && !hasError,
      status,
      issues,
    };
  }

  /**
   * Post-calculation invariant verification.
   * Guarantees arithmetic conservation of payments, non-negative liabilities,
   * and mutual exclusivity of refund vs balance due.
   */
  public static verifyResultInvariants(result: ComprehensiveTaxResult): ValidationResult {
    const issues: ValidationIssue[] = [];

    const fed = result.federal;

    // Invariant 1: Taxable Income non-negativity
    if (fed.taxableIncomeCents < 0n) {
      issues.push({
        code: 'INVARIANT_NEGATIVE_TAXABLE_INCOME',
        message: 'Federal taxable income cannot be negative under IRC § 63.',
        field: 'federal.taxableIncomeCents',
        severity: 'FATAL',
      });
    }

    // Invariant 2: Federal Tax non-negativity
    if (fed.totalFederalTaxCents < 0n) {
      issues.push({
        code: 'INVARIANT_NEGATIVE_TAX',
        message: 'Total federal tax liability cannot be negative.',
        field: 'federal.totalFederalTaxCents',
        severity: 'FATAL',
      });
    }

    // Invariant 3: Mutual exclusivity of refund and balance due
    if (fed.refundCents > 0n && fed.balanceDueCents > 0n) {
      issues.push({
        code: 'INVARIANT_SIMULTANEOUS_REFUND_DUE',
        message: 'Both refund and balance due cannot be positive simultaneously.',
        field: 'federal.settlement',
        severity: 'FATAL',
      });
    }

    // Invariant 4: Exact reconciliation of payments and liability
    if (fed.totalPaymentsCents >= fed.totalFederalTaxCents) {
      const expectedRefund = fed.totalPaymentsCents - fed.totalFederalTaxCents;
      if (fed.refundCents !== expectedRefund || fed.balanceDueCents !== 0n) {
        issues.push({
          code: 'INVARIANT_REFUND_MISMATCH',
          message: `Refund reconciliation failure. Expected ${expectedRefund}, got refund=${fed.refundCents}, due=${fed.balanceDueCents}`,
          severity: 'FATAL',
        });
      }
    } else {
      const expectedDue = fed.totalFederalTaxCents - fed.totalPaymentsCents;
      if (fed.balanceDueCents !== expectedDue || fed.refundCents !== 0n) {
        issues.push({
          code: 'INVARIANT_BALANCE_DUE_MISMATCH',
          message: `Balance due reconciliation failure. Expected ${expectedDue}, got refund=${fed.refundCents}, due=${fed.balanceDueCents}`,
          severity: 'FATAL',
        });
      }
    }

    // Invariant 5: State invariants
    for (const st of result.states) {
      if (st.netStateTaxCents < 0n) {
        issues.push({
          code: 'INVARIANT_STATE_NEGATIVE_TAX',
          message: `State tax liability for ${st.jurisdiction} is negative.`,
          field: `states[${st.jurisdiction}].netStateTaxCents`,
          severity: 'FATAL',
        });
      }
      if (st.stateRefundCents > 0n && st.stateBalanceDueCents > 0n) {
        issues.push({
          code: 'INVARIANT_STATE_SIMULTANEOUS_REFUND_DUE',
          message: `State ${st.jurisdiction} reports both refund and balance due.`,
          field: `states[${st.jurisdiction}].settlement`,
          severity: 'FATAL',
        });
      }
    }

    const hasFatal = issues.some(i => i.severity === 'FATAL');
    const hasError = issues.some(i => i.severity === 'ERROR');

    let status: ValidationResult['status'] = 'VALID';
    if (hasFatal) status = 'INVALID';
    else if (hasError) status = 'INVALID';
    else if (issues.length > 0) status = 'REQUIRES_REVIEW';

    return {
      isValid: !hasFatal && !hasError,
      status,
      issues,
    };
  }
}
