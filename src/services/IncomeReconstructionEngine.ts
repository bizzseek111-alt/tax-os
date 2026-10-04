/**
 * Autonomous Tax OS — Income Reconstruction Engine
 * Workstream 5: Triangulates processor (Stripe), 1099-K/NEC, and bank deposits.
 * PERMANENT INVARIANT: Never automatically sum overlapping sources.
 */

export interface IncomeSourceItem {
  id: string;
  sourceType: 'W2_EMPLOYER' | 'FORM_1099_NEC' | 'FORM_1099_K_PROCESSOR' | 'BANK_DEPOSIT_FEED';
  payerName: string;
  grossAmountCents: number;
  metadata: Record<string, any>;
}

export interface ReconciledIncomeResult {
  totalGrossIncomeCents: number;
  w2WagesCents: number;
  scheduleCRevenuesCents: number;
  overlappingDeduplicatedCents: number;
  reconciliationNotes: string[];
  auditProvenanceTrail: Array<{
    item: string;
    acceptedAmountCents: number;
    disallowedOverlapCents: number;
    reason: string;
  }>;
}

export class IncomeReconstructionEngine {
  /**
   * Reconciles multiple potentially overlapping income streams without double-counting.
   */
  public static reconcile(sources: IncomeSourceItem[]): ReconciledIncomeResult {
    let w2WagesCents = 0;
    let scheduleCRevenuesCents = 0;
    let overlappingDeduplicatedCents = 0;
    const notes: string[] = [];
    const trail: ReconciledIncomeResult['auditProvenanceTrail'] = [];

    // 1. Process W-2 Wage statements (Non-overlapping with Schedule C)
    const w2Sources = sources.filter(s => s.sourceType === 'W2_EMPLOYER');
    for (const w2 of w2Sources) {
      w2WagesCents += w2.grossAmountCents;
      trail.push({
        item: `W-2 Wages: ${w2.payerName}`,
        acceptedAmountCents: w2.grossAmountCents,
        disallowedOverlapCents: 0,
        reason: 'Statutory Form W-2 Box 1 wage statement.'
      });
    }

    // 2. Identify 1099-NEC contracts
    const necSources = sources.filter(s => s.sourceType === 'FORM_1099_NEC');
    const processorSources = sources.filter(s => s.sourceType === 'FORM_1099_K_PROCESSOR');
    const bankDeposits = sources.filter(s => s.sourceType === 'BANK_DEPOSIT_FEED');

    // Reconcile 1099-NEC vs Stripe vs Bank Deposits
    for (const nec of necSources) {
      scheduleCRevenuesCents += nec.grossAmountCents;

      // Check for identical processor payouts
      const matchingProcessor = processorSources.find(
        p => Math.abs(p.grossAmountCents - nec.grossAmountCents) <= 100 // within $1 tolerance
      );

      // Check for matching bank deposit feed
      const matchingBank = bankDeposits.find(
        b => Math.abs(b.grossAmountCents - nec.grossAmountCents) <= 100
      );

      let disallowedOverlap = 0;
      if (matchingProcessor) {
        disallowedOverlap += matchingProcessor.grossAmountCents;
        notes.push(
          `Detected Stripe 1099-K (${matchingProcessor.payerName}) matching 1099-NEC contract (${nec.payerName}). Deduplicated $${(matchingProcessor.grossAmountCents / 100).toLocaleString()} to prevent double-counting.`
        );
      }

      if (matchingBank) {
        disallowedOverlap += matchingBank.grossAmountCents;
        notes.push(
          `Detected Bank Deposit Feed matching business receipts. Deduplicated $${(matchingBank.grossAmountCents / 100).toLocaleString()} bank transfer.`
        );
      }

      overlappingDeduplicatedCents += disallowedOverlap;

      trail.push({
        item: `Schedule C: ${nec.payerName}`,
        acceptedAmountCents: nec.grossAmountCents,
        disallowedOverlapCents: disallowedOverlap,
        reason: 'Primary 1099-NEC nonemployee compensation reconciled against processor payout.'
      });
    }

    const totalGrossIncomeCents = w2WagesCents + scheduleCRevenuesCents;

    return {
      totalGrossIncomeCents,
      w2WagesCents,
      scheduleCRevenuesCents,
      overlappingDeduplicatedCents,
      reconciliationNotes: notes,
      auditProvenanceTrail: trail
    };
  }
}
