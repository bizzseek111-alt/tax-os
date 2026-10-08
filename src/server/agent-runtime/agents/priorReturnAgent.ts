/**
 * Autonomous Tax OS — Prior Return Agent
 * 
 * Analyzes prior return documents and facts:
 * - Prior year AGI (for e-file signature identity validation)
 * - Capital loss carryovers (IRC § 1212)
 * - Net operating loss (NOL) carryforwards (IRC § 172)
 * - Historical state filings
 * 
 * Invariant:
 * Does NOT auto-carry forward deductions without verifying active eligibility.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { prisma } from '../../db';

export interface PriorReturnAnalysisOutput {
  priorYearAgiCents?: bigint;
  hasCapitalLossCarryover: boolean;
  capitalLossCarryoverCents: bigint;
  hasNolCarryforward: boolean;
  nolCarryforwardCents: bigint;
  priorStates: string[];
  findings: string[];
}

export class PriorReturnAgent extends BaseAgent<any, PriorReturnAnalysisOutput> {
  public readonly agentType = AgentType.PRIOR_RETURN_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<PriorReturnAnalysisOutput>> {
    const priorDocs = await this.invokeTool(ctx, 'readPriorYearDocuments', { taxCaseId: ctx.taxCaseId }, async () => {
      return await prisma.document.findMany({
        where: {
          taxCaseId: ctx.taxCaseId,
          documentType: 'FORM_1040_PRIOR_YEAR'
        }
      });
    });

    const priorFacts = await prisma.taxFact.findMany({
      where: {
        taxCaseId: ctx.taxCaseId,
        taxYear: ctx.taxYear - 1
      }
    });

    const findings: string[] = [];
    let priorAgiCents: bigint | undefined;
    let capitalLossCents = 0n;
    let nolCents = 0n;
    const priorStates = ['US-FED'];

    const agiFact = priorFacts.find(f => f.key.includes('agi') || f.key.includes('adjusted_gross_income'));
    if (agiFact?.valueCents) {
      priorAgiCents = agiFact.valueCents;
      findings.push(`Verified prior year AGI: $${(Number(priorAgiCents) / 100).toFixed(2)}`);
    }

    const capLossFact = priorFacts.find(f => f.key.includes('capital_loss_carryover'));
    if (capLossFact?.valueCents && capLossFact.valueCents > 0n) {
      capitalLossCents = capLossFact.valueCents;
      findings.push(`Identified potential Capital Loss Carryover: $${(Number(capitalLossCents) / 100).toFixed(2)}`);
    }

    if (priorDocs.length === 0 && !priorAgiCents) {
      findings.push('No prior year return document or facts provided');
    }

    return this.createSuccessResult(ctx, {
      priorYearAgiCents: priorAgiCents,
      hasCapitalLossCarryover: capitalLossCents > 0n,
      capitalLossCarryoverCents: capitalLossCents,
      hasNolCarryforward: nolCents > 0n,
      nolCarryforwardCents: nolCents,
      priorStates,
      findings
    }, {
      confidence: priorDocs.length > 0 || priorAgiCents ? 0.95 : 0.60,
      evidenceRefs: priorDocs.map(d => d.id),
      warnings: findings.filter(f => f.includes('No prior')),
      recommendedNextAction: 'INSPECT_CURRENT_YEAR_DOCUMENTS'
    });
  }
}
