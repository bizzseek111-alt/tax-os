/**
 * Autonomous Tax OS — Adversarial IRS Challenger Agent
 * 
 * Acts as an adversarial IRS Revenue Agent / Tax Examiner.
 * Systematically stress-tests proposed tax positions, questions substantiation,
 * evaluates audit exposure, and challenges aggressive or unsubstantiated stances.
 * 
 * Invariant: Can reject or challenge positions, but CANNOT autonomously approve them.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface PositionToChallenge {
  id?: string;
  category: string;
  title: string;
  amount: number;
  statutoryBasis: string;
  evidenceRefs: string[];
  ruleRefs: string[];
}

export interface ChallengerInput {
  positions: PositionToChallenge[];
  taxpayerProfile?: {
    totalRevenue: number;
    businessEntity: string;
  };
}

export interface PositionChallengeResult {
  positionTitle: string;
  verdict: 'DEFENSIBLE' | 'VULNERABLE' | 'UNSUBSTANTIATED' | 'AGGRESSIVE';
  riskScore: number; // 0 - 100
  auditVulnerability: string;
  recommendedStatus: TaxPositionStatus;
  statutoryCounterArgument?: string;
}

export interface ChallengerAgentResult {
  evaluations: PositionChallengeResult[];
  averageRiskScore: number;
  highRiskCount: number;
  reviewTaskIdCreated?: string;
}

export class IrsChallengerAgent extends BaseAgent<ChallengerInput, ChallengerAgentResult> {
  public readonly agentType = AgentType.IRS_CHALLENGER_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: ChallengerInput
  ): Promise<AgentResult<ChallengerAgentResult>> {
    const evaluations: PositionChallengeResult[] = [];
    let highRiskCount = 0;

    for (const pos of input.positions) {
      const evaluation = await this.invokeTool(
        ctx,
        'challengeTaxPosition',
        { title: pos.title, amount: pos.amount, evidenceCount: pos.evidenceRefs.length },
        async () => {
          let verdict: 'DEFENSIBLE' | 'VULNERABLE' | 'UNSUBSTANTIATED' | 'AGGRESSIVE' = 'DEFENSIBLE';
          let riskScore = 15;
          let auditVulnerability = 'Position is supported by statutory authority and records.';
          let recommendedStatus = TaxPositionStatus.RULE_VERIFIED;
          let statutoryCounterArgument: string | undefined;

          const titleLower = pos.title.toLowerCase();

          // 1. Strict substantiation under IRC § 274(d)
          if (/travel|meal|vehicle|mileage/i.test(titleLower) && pos.evidenceRefs.length === 0) {
            verdict = 'UNSUBSTANTIATED';
            riskScore = 85;
            auditVulnerability = 'Fails IRC § 274(d) strict substantiation; no contemporaneous logs or receipts attached.';
            recommendedStatus = TaxPositionStatus.CHALLENGED;
            statutoryCounterArgument = 'Treas. Reg. § 1.274-5T disallows deduction in absence of precise log of business destination, purpose, and relationship.';
          } else if (pos.amount > 10000 && pos.evidenceRefs.length === 0) {
            verdict = 'VULNERABLE';
            riskScore = 65;
            auditVulnerability = 'Large non-substantiated deduction exceeds standard risk threshold.';
            recommendedStatus = TaxPositionStatus.CHALLENGED;
            statutoryCounterArgument = 'IRC § 6001 requires taxpayer to keep books and records sufficient to establish gross income and deductions.';
          } else if (/entertainment/i.test(titleLower)) {
            verdict = 'AGGRESSIVE';
            riskScore = 95;
            auditVulnerability = 'IRC § 274(a)(1) categorically disallows entertainment expenses.';
            recommendedStatus = TaxPositionStatus.REJECTED;
            statutoryCounterArgument = 'TCJA § 13304 eliminated deductions for entertainment, amusement, or recreation.';
          }

          if (pos.id && ctx.taxCaseId) {
            // Update position in database
            await ctx.prisma.taxPosition.update({
              where: { id: pos.id },
              data: {
                status: recommendedStatus,
                challengerNotes: `${verdict}: ${auditVulnerability}`
              }
            });
          }

          return {
            positionTitle: pos.title,
            verdict,
            riskScore,
            auditVulnerability,
            recommendedStatus,
            statutoryCounterArgument
          };
        }
      );

      if (evaluation.riskScore > 60) {
        highRiskCount++;
      }
      evaluations.push(evaluation);
    }

    const avgRisk = evaluations.length > 0
      ? Math.round(evaluations.reduce((s, e) => s + e.riskScore, 0) / evaluations.length)
      : 0;

    let reviewTaskId: string | undefined;
    if (highRiskCount > 0) {
      reviewTaskId = await this.invokeTool(
        ctx,
        'createReviewTask',
        { title: `Adversarial Audit: ${highRiskCount} Challenged Tax Positions` },
        async () => {
          if (ctx.taxCaseId) {
            const task = await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: `IRS Adversarial Review: ${highRiskCount} High-Risk Positions`,
              reason: 'Positions failed strict IRC § 274(d) or § 6001 substantiation checks during adversarial review.',
              priority: 'HIGH',
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
        evaluations,
        averageRiskScore: avgRisk,
        highRiskCount,
        reviewTaskIdCreated: reviewTaskId
      },
      {
        confidence: 0.95,
        warnings: evaluations.filter(e => e.riskScore > 60).map(e => `${e.positionTitle}: ${e.auditVulnerability}`),
        requiresProfessionalReview: highRiskCount > 0
      }
    );
  }
}
