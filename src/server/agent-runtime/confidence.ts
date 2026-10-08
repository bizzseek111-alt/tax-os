/**
 * Autonomous Tax OS — Composite Confidence Engine
 * 
 * Computes deterministic multi-factor confidence scores for tax positions:
 * Confidence = w1 * EvidenceScore + w2 * StatutoryScore + w3 * AdversarialScore + w4 * ConsistencyScore
 * 
 * Invariant: Positions below threshold (< 0.85) cannot proceed without human review.
 */

import { BaseAgent } from './agents/base';
import { AgentExecutionContext } from './context';
import { AgentResult, AgentType, EvidenceClassification, TaxPositionStatus } from './types';

export interface ConfidenceEvaluationInput {
  positionId?: string;
  title: string;
  amount: number;
  evidenceTier: EvidenceClassification;
  citationVerified: boolean;
  isStatuteOrReg: boolean;
  adversarialStatus: TaxPositionStatus;
  reconciliationDiscrepancy: number;
}

export interface ConfidenceScoreResult {
  positionId?: string;
  title: string;
  compositeConfidence: number;
  evidenceSubscore: number;
  statutorySubscore: number;
  adversarialSubscore: number;
  consistencySubscore: number;
  eligibleForAutoApproval: boolean;
  recommendedStatus: TaxPositionStatus;
}

export class ConfidenceEngine extends BaseAgent<ConfidenceEvaluationInput, ConfidenceScoreResult> {
  public readonly agentType = AgentType.CONFIDENCE_ENGINE;

  protected async run(
    ctx: AgentExecutionContext,
    input: ConfidenceEvaluationInput
  ): Promise<AgentResult<ConfidenceScoreResult>> {
    const scored = await this.invokeTool(
      ctx,
      'scoreConfidence',
      { positionTitle: input.title, tier: input.evidenceTier },
      async () => {
        // 1. Evidence Subscore (0.0 - 1.0)
        let evidenceSubscore = 0.5;
        switch (input.evidenceTier) {
          case EvidenceClassification.DOCUMENTARY:
            evidenceSubscore = 1.0;
            break;
          case EvidenceClassification.CONNECTED_SOURCE:
            evidenceSubscore = 0.95;
            break;
          case EvidenceClassification.DERIVED:
            evidenceSubscore = 0.98;
            break;
          case EvidenceClassification.USER_CONFIRMED:
            evidenceSubscore = 0.85;
            break;
          case EvidenceClassification.INFERRED:
            evidenceSubscore = 0.60;
            break;
        }

        // 2. Statutory Subscore (0.0 - 1.0)
        let statutorySubscore = 0.6;
        if (input.citationVerified && input.isStatuteOrReg) {
          statutorySubscore = 1.0;
        } else if (input.citationVerified) {
          statutorySubscore = 0.90;
        }

        // 3. Adversarial Subscore (0.0 - 1.0)
        let adversarialSubscore = 0.5;
        if (input.adversarialStatus === TaxPositionStatus.RULE_VERIFIED || input.adversarialStatus === TaxPositionStatus.EVIDENCE_VERIFIED) {
          adversarialSubscore = 0.95;
        } else if (input.adversarialStatus === TaxPositionStatus.APPROVED) {
          adversarialSubscore = 1.0;
        } else if (input.adversarialStatus === TaxPositionStatus.CHALLENGED) {
          adversarialSubscore = 0.50;
        } else if (input.adversarialStatus === TaxPositionStatus.REJECTED) {
          adversarialSubscore = 0.0;
        }

        // 4. Consistency Subscore (0.0 - 1.0)
        const consistencySubscore = input.reconciliationDiscrepancy === 0 ? 1.0 : Math.max(0, 1.0 - input.reconciliationDiscrepancy / 100);

        // Weighted Composite: 35% Evidence, 30% Statutory, 25% Adversarial, 10% Consistency
        const composite = (
          0.35 * evidenceSubscore +
          0.30 * statutorySubscore +
          0.25 * adversarialSubscore +
          0.10 * consistencySubscore
        );

        const compositeConfidence = Math.round(composite * 1000) / 1000;
        const eligibleForAutoApproval = compositeConfidence >= 0.92 && input.adversarialStatus !== TaxPositionStatus.CHALLENGED && input.adversarialStatus !== TaxPositionStatus.REJECTED;

        let recommendedStatus = input.adversarialStatus;
        if (eligibleForAutoApproval && input.adversarialStatus === TaxPositionStatus.RULE_VERIFIED) {
          recommendedStatus = TaxPositionStatus.EVIDENCE_VERIFIED;
        } else if (compositeConfidence < 0.85) {
          recommendedStatus = TaxPositionStatus.PRO_REVIEW;
        }

        if (input.positionId && ctx.taxCaseId) {
          await ctx.prisma.taxPosition.update({
            where: { id: input.positionId },
            data: {
              confidence: compositeConfidence,
              status: recommendedStatus
            }
          });
        }

        return {
          positionId: input.positionId,
          title: input.title,
          compositeConfidence,
          evidenceSubscore,
          statutorySubscore,
          adversarialSubscore,
          consistencySubscore,
          eligibleForAutoApproval,
          recommendedStatus
        };
      }
    );

    return this.createSuccessResult(
      ctx,
      scored,
      {
        confidence: scored.compositeConfidence,
        requiresProfessionalReview: !scored.eligibleForAutoApproval
      }
    );
  }
}
