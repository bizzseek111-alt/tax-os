/**
 * Autonomous Tax OS — Transaction Classification Agent
 * 
 * Classifies raw financial transactions:
 * - Normalized expense category (e.g. SOFTWARE_SAAS, OFFICE_SUPPLIES, ADVERTISING)
 * - Candidate disposition: BUSINESS_EXPENSE vs PERSONAL_EXPENSE
 * 
 * Invariant:
 * Does NOT declare tax deductibility alone. Merely determines business candidate vs personal.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';
import { AgentMemoryManager } from '../memory';

export interface ClassifiedTransactionCandidate {
  transactionId: string;
  rawMerchant: string;
  normalizedCategory: string;
  isBusinessCandidate: boolean;
  confidence: number;
  reason: string;
}

export interface TransactionClassificationOutput {
  classifiedCount: number;
  classifications: ClassifiedTransactionCandidate[];
  businessCandidates: ClassifiedTransactionCandidate[];
  personalCandidates: ClassifiedTransactionCandidate[];
  totalBusinessExpenseCents: bigint;
}

export class TransactionClassificationAgent extends BaseAgent<any, TransactionClassificationOutput> {
  public readonly agentType = AgentType.TRANSACTION_CLASSIFICATION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<TransactionClassificationOutput>> {
    const transactions = (_input?.transactions && Array.isArray(_input.transactions))
      ? _input.transactions.map((t: any) => ({
          id: t.id || 'tx-mock',
          description: t.description || '',
          rawMerchant: t.rawMerchant || t.description || '',
          normalizedMerchant: t.normalizedMerchant || t.description || '',
          amountCents: t.amountCents ? BigInt(t.amountCents) : BigInt(Math.round((t.amount || 0) * 100)),
          direction: t.direction || 'DEBIT'
        }))
      : await prisma.transaction.findMany({
          where: {
            taxCaseId: ctx.taxCaseId,
            direction: 'DEBIT'
          },
          take: 100
        });

    const businessCandidates: ClassifiedTransactionCandidate[] = [];
    const personalCandidates: ClassifiedTransactionCandidate[] = [];
    let totalBusinessCents = 0n;

    for (const t of transactions) {
      const desc = (t.normalizedMerchant || t.description).toLowerCase();
      let isBusiness = false;
      let category = 'GENERAL_EXPENSE';
      let confidence = 0.85;
      let reason = 'Heuristic pattern match';

      // 1. Check learned classification memory
      const memoryCat = await AgentMemoryManager.getMemory(
        ctx.organizationId,
        'CLASSIFICATION_PATTERN',
        `desc:${desc.slice(0, 30)}`
      );

      if (memoryCat) {
        category = memoryCat.category;
        isBusiness = memoryCat.isBusiness;
        confidence = 0.95;
        reason = 'Learned from confirmed historical organization pattern';
      } else if (/aws|github|digitalocean|heroku|google cloud|vercel/i.test(desc)) {
        category = 'SOFTWARE_AND_HOSTING';
        isBusiness = true;
        confidence = 0.95;
        reason = 'Cloud hosting & development infrastructure';
      } else if (/staples|office depot|best buy|apple store/i.test(desc)) {
        category = 'OFFICE_SUPPLIES_EQUIPMENT';
        isBusiness = true;
        confidence = 0.85;
        reason = 'Office equipment & electronics merchant';
      } else if (/delta|united air|marriott|hilton|uber|lyft/i.test(desc)) {
        category = 'TRAVEL_AND_LODGING';
        isBusiness = true; // Flagged as business candidate for Travel Agent investigation
        confidence = 0.75;
        reason = 'Travel & transit candidate requiring business connection validation';
      } else if (/safeway|trader joe|kroger|whole foods|target/i.test(desc)) {
        category = 'PERSONAL_GROCERIES';
        isBusiness = false;
        confidence = 0.90;
        reason = 'Personal retail / grocery merchant';
      }

      const candidate: ClassifiedTransactionCandidate = {
        transactionId: t.id,
        rawMerchant: t.rawMerchant || t.description,
        normalizedCategory: category,
        isBusinessCandidate: isBusiness,
        confidence,
        reason
      };

      if (isBusiness) {
        businessCandidates.push(candidate);
        totalBusinessCents += t.amountCents;
      } else {
        personalCandidates.push(candidate);
      }
    }

    const classifications = [...businessCandidates, ...personalCandidates];

    return this.createSuccessResult(ctx, {
      classifiedCount: classifications.length,
      classifications,
      businessCandidates,
      personalCandidates,
      totalBusinessExpenseCents: totalBusinessCents
    }, {
      confidence: 0.90,
      evidenceRefs: businessCandidates.map(c => c.transactionId),
      recommendedNextAction: 'INVOKE_RECEIPT_MATCHING_AGENT'
    });
  }
}
