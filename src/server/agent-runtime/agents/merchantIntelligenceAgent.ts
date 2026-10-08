/**
 * Autonomous Tax OS — Merchant Intelligence Agent
 * 
 * Resolves noisy merchant descriptor strings into canonical legal business entities:
 * Example:
 * AMZN MKTP US*2K34 -> Amazon
 * GOOGLE *WORKSPACE -> Google LLC
 * UBER *TRIP 0914   -> Uber Technologies
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';
import { AgentMemoryManager } from '../memory';

export interface ResolvedMerchantResult {
  transactionId: string;
  rawMerchant: string;
  canonicalMerchant: string;
  confidence: number;
}

export interface MerchantIntelligenceOutput {
  canonicalName?: string;
  normalizedMerchant?: string;
  resolvedMerchants: ResolvedMerchantResult[];
  resolvedCount: number;
}

export class MerchantIntelligenceAgent extends BaseAgent<any, MerchantIntelligenceOutput> {
  public readonly agentType = AgentType.MERCHANT_INTELLIGENCE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<MerchantIntelligenceOutput>> {
    // If a single raw descriptor is passed in input
    if (_input?.rawDescriptor) {
      const raw = _input.rawDescriptor;
      const match = await AgentMemoryManager.resolveMerchant(ctx.organizationId, raw);
      const canonical = match ? match.normalizedMerchant : raw;
      const resolvedSingle: ResolvedMerchantResult = {
        transactionId: _input.transactionId || 'single-descriptor',
        rawMerchant: raw,
        canonicalMerchant: canonical,
        confidence: match ? match.confidence : 0.8
      };

      return this.createSuccessResult(ctx, {
        canonicalName: canonical,
        normalizedMerchant: canonical,
        resolvedMerchants: [resolvedSingle],
        resolvedCount: 1
      }, {
        confidence: resolvedSingle.confidence,
        recommendedNextAction: 'INVOKE_TRANSACTION_CLASSIFICATION_AGENT'
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: { taxCaseId: ctx.taxCaseId },
      take: 50
    });

    const resolved: ResolvedMerchantResult[] = [];

    for (const t of transactions) {
      const raw = t.rawMerchant || t.description;
      const match = await AgentMemoryManager.resolveMerchant(ctx.organizationId, raw);

      if (match) {
        resolved.push({
          transactionId: t.id,
          rawMerchant: raw,
          canonicalMerchant: match.normalizedMerchant,
          confidence: match.confidence
        });

        // Update transaction normalizedMerchant in database
        await prisma.transaction.update({
          where: { id: t.id },
          data: { normalizedMerchant: match.normalizedMerchant }
        });
      }
    }

    return this.createSuccessResult(ctx, {
      resolvedMerchants: resolved,
      resolvedCount: resolved.length
    }, {
      confidence: 0.95,
      recommendedNextAction: 'INVOKE_TRANSACTION_CLASSIFICATION_AGENT'
    });
  }
}
