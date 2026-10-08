/**
 * Autonomous TaxOS — Tax Calculation Provider Abstraction
 * Workstream 3: Phase 3
 * 
 * Provides an enterprise abstraction over tax calculation engines.
 * Ships with the authoritative InternalDeterministicProvider.
 * Enables zero-downtime side-by-side verification and benchmarking
 * against external commercial tax calculation engines.
 */

import crypto from 'crypto';
import { FederalTaxEngine } from './federalEngine';
import { getStateTaxModule } from './states';
import {
  FederalTaxInput,
  ComprehensiveTaxResult,
  StateTaxResult,
  StateTaxInput,
  SupportedJurisdiction,
} from './types';
import { TaxParameterRegistry } from './parameterRegistry';
import { TaxMoney } from './money';

export interface TaxEngineProvider {
  readonly providerId: string;
  readonly name: string;
  readonly version: string;

  calculateComprehensive(
    taxCaseId: string,
    input: FederalTaxInput
  ): Promise<ComprehensiveTaxResult>;
}

export class InternalDeterministicProvider implements TaxEngineProvider {
  public readonly providerId = 'internal-deterministic';
  public readonly name = 'TaxOS Native Deterministic Rule Engine';
  public readonly version = TaxParameterRegistry.ENGINE_VERSION;

  /**
   * Helper to serialize input/output with BigInts for SHA-256 snapshotting.
   */
  public static canonicalJsonStringify(obj: any): string {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
  }

  /**
   * Compute deterministic SHA-256 hash.
   */
  public static computeSha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public async calculateComprehensive(
    taxCaseId: string,
    input: FederalTaxInput
  ): Promise<ComprehensiveTaxResult> {
    const inputCanonicalJson = InternalDeterministicProvider.canonicalJsonStringify(input);
    const inputHash = InternalDeterministicProvider.computeSha256(inputCanonicalJson);
    const calculatedAt = new Date().toISOString();

    // 1. Run Federal Deterministic Engine
    const federalResult = FederalTaxEngine.calculate(input);

    // 2. Run State Engines for each registered state
    const statesResults: StateTaxResult[] = [];
    const nonFedStates = (input.residentStates || []).filter(s => s !== 'US-FED');

    for (const stateJurisdiction of nonFedStates) {
      const stateModule = getStateTaxModule(stateJurisdiction);
      if (!stateModule) {
        throw new Error(`UNSUPPORTED_SCENARIO: Jurisdiction "${stateJurisdiction}" is not currently supported.`);
      }

      // Aggregate state withholding for this state from W-2s
      const stateCodeSuffix = stateJurisdiction.replace('US-', '');
      let stateWithholdingCents = 0n;
      for (const w2 of input.w2s) {
        if (w2.stateCode?.toUpperCase() === stateCodeSuffix) {
          stateWithholdingCents += w2.stateWithholdingCents || 0n;
        }
      }

      const stateInput: StateTaxInput = {
        jurisdiction: stateJurisdiction,
        taxYear: input.taxYear,
        residencyStatus: 'FULL_YEAR_RESIDENT',
        w2s: input.w2s,
        scheduleC: input.scheduleC,
        federalAgiCents: federalResult.adjustedGrossIncomeCents,
        federalTaxableIncomeCents: federalResult.taxableIncomeCents,
        federalItemizedCents: input.isItemizedClaimed ? input.itemizedDeductionCents : 0n,
        stateWithholdingCents,
        stateEstimatedPaymentsCents: 0n,
        customAdditionsCents: (stateJurisdiction === 'US-CA' && input.adjustments?.hsaDeductionCents)
          ? input.adjustments.hsaDeductionCents // CA non-conformity HSA add-back
          : 0n,
      };

      const stateRes = stateModule.calculate(stateInput, input.filingStatus);
      statesResults.push(stateRes);
    }

    // 3. Aggregate Combined Summary
    let combinedTaxLiabilityCents = federalResult.totalFederalTaxCents;
    let combinedTotalPaymentsCents = federalResult.totalPaymentsCents;
    let combinedRefundCents = federalResult.refundCents;
    let combinedBalanceDueCents = federalResult.balanceDueCents;

    for (const st of statesResults) {
      combinedTaxLiabilityCents += st.netStateTaxCents;
      combinedTotalPaymentsCents += st.totalStatePaymentsCents;
      combinedRefundCents += st.stateRefundCents;
      combinedBalanceDueCents += st.stateBalanceDueCents;
    }

    let totalEffectiveTaxRateBps = 0;
    if (federalResult.totalIncomeCents > 0n) {
      const rate = TaxMoney.multiplyFraction(combinedTaxLiabilityCents, 10000n, federalResult.totalIncomeCents);
      totalEffectiveTaxRateBps = Number(rate);
    }

    const combinedSummary = {
      totalEffectiveTaxRateBps,
      combinedTaxLiabilityCents,
      combinedTotalPaymentsCents,
      combinedRefundCents,
      combinedBalanceDueCents,
    };

    // 4. Invariant Validation
    const errors: string[] = [];
    const warnings: string[] = [];

    if (federalResult.taxableIncomeCents < 0n) {
      errors.push('CRITICAL: Federal taxable income cannot be negative.');
    }
    if (federalResult.totalFederalTaxCents < 0n) {
      errors.push('CRITICAL: Total federal tax cannot be negative.');
    }
    if (federalResult.refundCents > 0n && federalResult.balanceDueCents > 0n) {
      errors.push('CRITICAL: Invariant violation: Both refund and balance due cannot be positive simultaneously.');
    }

    for (const st of statesResults) {
      if (st.netStateTaxCents < 0n) {
        errors.push(`CRITICAL: State tax for ${st.jurisdiction} cannot be negative.`);
      }
      if (st.stateRefundCents > 0n && st.stateBalanceDueCents > 0n) {
        errors.push(`CRITICAL: Invariant violation on ${st.jurisdiction}: Both refund and balance due cannot be positive.`);
      }
    }

    const validation = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    const calculationRunId = `calc_run_${crypto.randomUUID()}`;

    const deterministicPayload = {
      taxCaseId,
      taxYear: input.taxYear,
      engineVersion: this.version,
      ruleSetVersion: TaxParameterRegistry.RULE_SET_VERSION,
      provider: this.providerId,
      inputHash,
      federal: federalResult,
      states: statesResults,
      combinedSummary,
      validation,
    };

    const resultCanonicalJson = InternalDeterministicProvider.canonicalJsonStringify(deterministicPayload);
    const resultHash = InternalDeterministicProvider.computeSha256(resultCanonicalJson);

    return {
      calculationRunId,
      calculatedAt,
      ...deterministicPayload,
      resultHash,
    };
  }
}
