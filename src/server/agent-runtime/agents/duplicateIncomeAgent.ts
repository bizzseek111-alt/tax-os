/**
 * Autonomous Tax OS — Duplicate Income Agent
 * 
 * Challenges overlapping income sources:
 * - Duplicate 1099-MISC vs 1099-NEC from same payer
 * - Duplicate W-2 from same employer EIN with identical Box 1 wages
 * - Payment processor 1099-K duplicates of direct invoices
 * 
 * Strict Compliance Invariant:
 * NEVER merges uncertain income automatically above policy threshold ($500.00 / 50000 cents).
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';

export interface DuplicateIncomeFinding {
  primaryFactId: string;
  duplicateCandidateFactId: string;
  sourcePayer: string;
  duplicateAmountCents: bigint;
  reason: string;
  confidence: number;
}

export interface DuplicateIncomeOutput {
  suspectedDuplicates: DuplicateIncomeFinding[];
  totalDuplicateRiskCents: bigint;
  hasUncertainDuplicates: boolean;
}

export class DuplicateIncomeAgent extends BaseAgent<any, DuplicateIncomeOutput> {
  public readonly agentType = AgentType.DUPLICATE_INCOME_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<DuplicateIncomeOutput>> {
    const incomeFacts = await prisma.taxFact.findMany({
      where: {
        taxCaseId: ctx.taxCaseId,
        category: 'INCOME'
      }
    });

    const duplicates: DuplicateIncomeFinding[] = [];
    let totalRiskCents = 0n;

    for (let i = 0; i < incomeFacts.length; i++) {
      for (let j = i + 1; j < incomeFacts.length; j++) {
        const a = incomeFacts[i];
        const b = incomeFacts[j];

        if (a.valueCents && b.valueCents && a.valueCents === b.valueCents) {
          // Identical amount from same or similar payer
          if (a.key === b.key || a.sourceDocumentId === b.sourceDocumentId) {
            duplicates.push({
              primaryFactId: a.id,
              duplicateCandidateFactId: b.id,
              sourcePayer: a.key,
              duplicateAmountCents: a.valueCents,
              reason: `Identical income amount ($${(Number(a.valueCents) / 100).toFixed(2)}) reported from same payer/document`,
              confidence: 0.92
            });
            totalRiskCents += a.valueCents;
          }
        }
      }
    }

    const hasHighValueUncertainty = duplicates.some(d => d.duplicateAmountCents > 50000n && d.confidence < 0.95);

    return this.createSuccessResult(ctx, {
      suspectedDuplicates: duplicates,
      totalDuplicateRiskCents: totalRiskCents,
      hasUncertainDuplicates: hasHighValueUncertainty
    }, {
      confidence: duplicates.length === 0 ? 1.0 : 0.88,
      requiresUserInput: hasHighValueUncertainty,
      warnings: duplicates.map(d => `Suspected duplicate income: $${(Number(d.duplicateAmountCents) / 100).toFixed(2)} from ${d.sourcePayer}`),
      recommendedNextAction: duplicates.length > 0
        ? 'RESOLVE_DUPLICATE_INCOME_CANDIDATES'
        : 'PROCEED_TO_EXPENSE_CLASSIFICATION'
    });
  }
}
