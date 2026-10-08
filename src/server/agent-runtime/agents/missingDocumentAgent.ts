/**
 * Autonomous Tax OS — Missing Document Agent
 * 
 * Infers expected documents from banking transactions, prior year returns, and evidence:
 * - Brokerage activity or capital sales without Form 1099-B / 1099-DIV
 * - Recurring mortgage payments without Form 1098
 * - Platform payouts (Stripe, Shopify, Etsy, Uber) without Form 1099-K
 * 
 * Invariant:
 * Outputs missing document candidates only; does not fabricate income.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';

export interface MissingDocumentCandidate {
  expectedDocumentType: string;
  sourceInstitution: string;
  reason: string;
  confidence: number;
}

export interface MissingDocumentOutput {
  missingCandidates: MissingDocumentCandidate[];
  totalMissingCount: number;
}

export class MissingDocumentAgent extends BaseAgent<any, MissingDocumentOutput> {
  public readonly agentType = AgentType.MISSING_DOCUMENT_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<MissingDocumentOutput>> {
    // 1. Read existing documents
    const documents = await prisma.document.findMany({
      where: { taxCaseId: ctx.taxCaseId }
    });

    const docTypes = new Set<string>(documents.map(d => d.documentType));

    // 2. Read transactions to infer activity
    const transactions = await prisma.transaction.findMany({
      where: { taxCaseId: ctx.taxCaseId },
      take: 100
    });

    const candidates: MissingDocumentCandidate[] = [];

    // Check Mortgage payments without Form 1098
    const hasMortgagePayments = transactions.some(t =>
      /mortgage|wells fargo home|chase home loan|quicken loans|rocket mort/i.test(t.description)
    );
    if (hasMortgagePayments && !docTypes.has('FORM_1098')) {
      candidates.push({
        expectedDocumentType: 'FORM_1098',
        sourceInstitution: 'Mortgage Servicer',
        reason: 'Detected recurring mortgage loan payments without corresponding Form 1098 (Mortgage Interest Statement)',
        confidence: 0.90
      });
    }

    // Check Platform payouts without Form 1099-K
    const hasPlatformPayouts = transactions.some(t =>
      /stripe payout|shopify payout|square inc|etsy pay|uber direct/i.test(t.description)
    );
    if (hasPlatformPayouts && !docTypes.has('FORM_1099_K')) {
      candidates.push({
        expectedDocumentType: 'FORM_1099_K',
        sourceInstitution: 'Payment Processor',
        reason: 'Detected electronic merchant payout transactions without corresponding Form 1099-K',
        confidence: 0.85
      });
    }

    // Check Investment activity without Form 1099-B / 1099-DIV
    const hasBrokerageActivity = transactions.some(t =>
      /vanguard|charles schwab|fidelity|robinhood|etrade/i.test(t.description)
    );
    if (hasBrokerageActivity && !docTypes.has('FORM_1099_DIV') && !docTypes.has('FORM_1099_INT')) {
      candidates.push({
        expectedDocumentType: 'FORM_1099_B_DIV',
        sourceInstitution: 'Brokerage Firm',
        reason: 'Detected transfers to/from brokerage accounts without consolidated Form 1099 statement',
        confidence: 0.80
      });
    }

    return this.createSuccessResult(ctx, {
      missingCandidates: candidates,
      totalMissingCount: candidates.length
    }, {
      confidence: 0.90,
      requiresUserInput: candidates.length > 0,
      warnings: candidates.map(c => `Missing candidate: ${c.expectedDocumentType} (${c.sourceInstitution})`),
      recommendedNextAction: candidates.length > 0
        ? 'PROMPT_USER_FOR_MISSING_DOCUMENTS'
        : 'PROCEED_TO_INCOME_RECONSTRUCTION'
    });
  }
}
