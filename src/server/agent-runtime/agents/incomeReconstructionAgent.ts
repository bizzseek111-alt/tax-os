/**
 * Autonomous Tax OS — Income Reconstruction Agent
 * 
 * Reconciles economic income relationships:
 * - Form 1099-NEC / 1099-K reported revenues
 * - Bank account deposits
 * - Payment processor payouts (Stripe, Square)
 * 
 * Primary Objective:
 * PREVENT DOUBLE-COUNTING OF INCOME. If a $50,000 payment is reported on a 1099-NEC
 * and also deposited into checking, it must be recognized as ONE economic income event.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';

export interface ReconstructedIncomeEvent {
  eventId: string;
  grossAmountCents: bigint;
  sourcePayer: string;
  reportingDocumentType?: string;
  matchedDepositTransactionId?: string;
  isReconciled: boolean;
  confidence: number;
}

export interface IncomeReconstructionOutput {
  reconstructedEvents: ReconstructedIncomeEvent[];
  totalReconstructedGrossCents: bigint;
  reconciliationRatio: number;
  duplicateRisksFound: number;
}

export class IncomeReconstructionAgent extends BaseAgent<any, IncomeReconstructionOutput> {
  public readonly agentType = AgentType.INCOME_RECONSTRUCTION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<IncomeReconstructionOutput>> {
    // 1. Fetch 1099 Income Facts
    const incomeFacts = await prisma.taxFact.findMany({
      where: {
        taxCaseId: ctx.taxCaseId,
        category: 'INCOME'
      }
    });

    // 2. Fetch Bank Credit Transactions (Deposits)
    const deposits = await prisma.transaction.findMany({
      where: {
        taxCaseId: ctx.taxCaseId,
        direction: 'CREDIT'
      }
    });

    const reconstructedEvents: ReconstructedIncomeEvent[] = [];
    let duplicateRisks = 0;
    let totalGrossCents = 0n;

    for (const fact of incomeFacts) {
      if (!fact.valueCents) continue;

      const factAmount = fact.valueCents;
      const payer = fact.key;

      // Look for a corresponding deposit matching this amount (+/- 2% or exact)
      const matchingDeposit = deposits.find(d => {
        const diff = d.amountCents > factAmount ? d.amountCents - factAmount : factAmount - d.amountCents;
        return diff === 0n || Number(diff) < 5000; // within $50
      });

      if (matchingDeposit) {
        reconstructedEvents.push({
          eventId: `inc-event-${fact.id}`,
          grossAmountCents: factAmount,
          sourcePayer: payer,
          reportingDocumentType: fact.factType,
          matchedDepositTransactionId: matchingDeposit.id,
          isReconciled: true,
          confidence: 0.95
        });
      } else {
        reconstructedEvents.push({
          eventId: `inc-event-${fact.id}`,
          grossAmountCents: factAmount,
          sourcePayer: payer,
          reportingDocumentType: fact.factType,
          isReconciled: false,
          confidence: 0.80
        });
      }

      totalGrossCents += factAmount;
    }

    const reconciledCount = reconstructedEvents.filter(e => e.isReconciled).length;
    const ratio = reconstructedEvents.length > 0 ? reconciledCount / reconstructedEvents.length : 1.0;

    return this.createSuccessResult(ctx, {
      reconstructedEvents,
      totalReconstructedGrossCents: totalGrossCents,
      reconciliationRatio: parseFloat(ratio.toFixed(2)),
      duplicateRisksFound: duplicateRisks
    }, {
      confidence: 0.92,
      evidenceRefs: incomeFacts.map(f => f.id),
      recommendedNextAction: 'RUN_DUPLICATE_INCOME_AGENT'
    });
  }
}
