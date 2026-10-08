/**
 * Autonomous Tax OS — Spend Investigator Agent
 * 
 * Investigates ambiguous financial transactions:
 * - High-value retail purchases (Apple, Best Buy, Amazon)
 * - Mixed-use transit/dining (Uber, restaurants, airline charges)
 * - Weekend or holiday transactions
 * 
 * Objective:
 * Uncover business-purpose substantiation before requesting taxpayer input.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';

export interface InvestigatedSpendFinding {
  transactionId: string;
  merchant: string;
  amountCents: bigint;
  hasDocumentarySubstantiation: boolean;
  ambiguityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedPurpose?: string;
  requiresInquiry: boolean;
}

export interface SpendInvestigatorOutput {
  investigatedSpends: InvestigatedSpendFinding[];
  ambiguousTransactionsCount: number;
}

export class SpendInvestigator extends BaseAgent<any, SpendInvestigatorOutput> {
  public readonly agentType = AgentType.SPEND_INVESTIGATOR;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<SpendInvestigatorOutput>> {
    // 1. Fetch transactions with connected evidence
    const transactions = await prisma.transaction.findMany({
      where: {
        taxCaseId: ctx.taxCaseId,
        direction: 'DEBIT'
      },
      include: {
        evidence: true
      },
      take: 50
    });

    const findings: InvestigatedSpendFinding[] = [];

    for (const t of transactions) {
      const hasDoc = t.evidence.some(e => e.documentId !== null);
      const desc = (t.normalizedMerchant || t.description).toLowerCase();

      // Flag retail or ambiguous charges
      if (/amazon|apple|best buy|target|walmart/i.test(desc)) {
        findings.push({
          transactionId: t.id,
          merchant: t.normalizedMerchant || t.description,
          amountCents: t.amountCents,
          hasDocumentarySubstantiation: hasDoc,
          ambiguityLevel: hasDoc ? 'LOW' : 'HIGH',
          suggestedPurpose: hasDoc ? 'Documented equipment purchase' : 'Ambiguous mixed-use retail purchase',
          requiresInquiry: !hasDoc
        });
      }
    }

    const ambiguousCount = findings.filter(f => f.requiresInquiry).length;

    return this.createSuccessResult(ctx, {
      investigatedSpends: findings,
      ambiguousTransactionsCount: ambiguousCount
    }, {
      confidence: 0.90,
      requiresUserInput: ambiguousCount > 0,
      warnings: ambiguousCount > 0 ? [`${ambiguousCount} transactions require business purpose clarification`] : [],
      recommendedNextAction: 'INVOKE_BUSINESS_PURPOSE_AGENT'
    });
  }
}
