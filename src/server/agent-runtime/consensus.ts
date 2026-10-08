/**
 * Autonomous Tax OS — Adversarial Multi-Party Consensus Engine
 * 
 * Conducts structured 5-party verification protocol before any position reaches review:
 * 1. Proposing Agent (Deduction/Credit Hunter)
 * 2. Tax Research Agent (Statutory Authority)
 * 3. Evidence Examiner (Documentary Proof)
 * 4. Adversarial IRS Challenger (Aggressiveness & Audit Exposure)
 * 5. Deterministic Calculation Engine (Mathematical Lineage)
 * 
 * Strict Legal Invariant:
 * Agents CANNOT override tax statutes by majority vote. If any statutory rule
 * is broken or documentary proof is missing, consensus fails and escalates.
 */

import { BaseAgent } from './agents/base';
import { AgentExecutionContext } from './context';
import { AgentResult, AgentType, ConsensusVerdict, TaxPositionStatus } from './types';
import { AgentDbHelper } from './dbHelpers';

export interface ConsensusInput {
  positionId: string;
  positionTitle: string;
  amount: number;
  proposingAgentVerdict: boolean;
  statutoryResearchVerified: boolean;
  evidenceTierVerified: boolean;
  irsChallengerObjection: boolean;
  deterministicCalculationVerified: boolean;
  challengerNotes?: string;
}

export interface ConsensusResult {
  positionId: string;
  verdict: ConsensusVerdict;
  dissentingAgents: string[];
  consensusScore: number;
  resolvedStatus: TaxPositionStatus;
  reviewTaskIdCreated?: string;
  summaryRationale: string;
}

export class ConsensusEngine extends BaseAgent<ConsensusInput, ConsensusResult> {
  public readonly agentType = AgentType.CONSENSUS_ENGINE;

  protected async run(
    ctx: AgentExecutionContext,
    input: ConsensusInput
  ): Promise<AgentResult<ConsensusResult>> {
    const dissentingAgents: string[] = [];

    if (!input.proposingAgentVerdict) dissentingAgents.push('PROPOSING_AGENT');
    if (!input.statutoryResearchVerified) dissentingAgents.push('TAX_RESEARCH_AGENT');
    if (!input.evidenceTierVerified) dissentingAgents.push('EVIDENCE_EXAMINER');
    if (input.irsChallengerObjection) dissentingAgents.push('IRS_CHALLENGER_AGENT');
    if (!input.deterministicCalculationVerified) dissentingAgents.push('DETERMINISTIC_ENGINE');

    const result = await this.invokeTool(
      ctx,
      'reachConsensus',
      { positionId: input.positionId, dissentingCount: dissentingAgents.length },
      async () => {
        let verdict: ConsensusVerdict = ConsensusVerdict.UNANIMOUS;
        let resolvedStatus: TaxPositionStatus = TaxPositionStatus.RULE_VERIFIED;
        let summaryRationale = 'All 5 validation parties consented to this tax position.';
        let consensusScore = 1.0;

        // Hard Statutory Gate: Statutory rule or deterministic math failure = immediate dead stop
        if (!input.statutoryResearchVerified || !input.deterministicCalculationVerified) {
          verdict = ConsensusVerdict.DEADLOCK;
          resolvedStatus = TaxPositionStatus.REJECTED;
          consensusScore = 0.0;
          summaryRationale = 'Hard statutory or mathematical rule failure. Position rejected.';
        } else if (input.irsChallengerObjection || !input.evidenceTierVerified) {
          // Adversarial dissent or substantiation weakness -> ESCALATE TO PRO
          verdict = ConsensusVerdict.ESCALATE_TO_PROFESSIONAL;
          resolvedStatus = TaxPositionStatus.CHALLENGED;
          consensusScore = 0.65;
          summaryRationale = `Adversarial objection raised (${input.challengerNotes || 'Missing Tier 1/2 substantiation'}). Escalated to Human CPA.`;
        } else if (dissentingAgents.length === 0) {
          verdict = ConsensusVerdict.UNANIMOUS;
          resolvedStatus = TaxPositionStatus.APPROVED;
          consensusScore = 1.0;
        }

        // Update TaxPosition in database
        if (input.positionId && ctx.taxCaseId) {
          await ctx.prisma.taxPosition.update({
            where: { id: input.positionId },
            data: {
              status: resolvedStatus,
              challengerNotes: input.challengerNotes,
              confidence: consensusScore
            }
          });
        }

        return {
          positionId: input.positionId,
          verdict,
          dissentingAgents,
          consensusScore,
          resolvedStatus,
          summaryRationale
        };
      }
    );

    let reviewTaskId: string | undefined;
    if (result.verdict === ConsensusVerdict.ESCALATE_TO_PROFESSIONAL || result.verdict === ConsensusVerdict.DEADLOCK) {
      reviewTaskId = await this.invokeTool(
        ctx,
        'createReviewTask',
        { positionId: input.positionId, reason: result.summaryRationale },
        async () => {
          if (ctx.taxCaseId) {
            const task = await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: `Consensus Disagreement: ${input.positionTitle}`,
              reason: result.summaryRationale,
              priority: 'HIGH',
              materialityUsd: input.amount,
              requiredRole: 'CPA'
            });
            return task.id;
          }
          return undefined;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        ...result,
        reviewTaskIdCreated: reviewTaskId
      },
      {
        confidence: result.consensusScore,
        contradictions: dissentingAgents.map(a => `Dissent from ${a}`),
        requiresProfessionalReview: result.verdict !== ConsensusVerdict.UNANIMOUS
      }
    );
  }
}
