/**
 * Autonomous Tax OS — Quality Assurance & Four-Eyes Governance Service
 * 
 * Manages post-review sampling policies, quality audits, reviewer scoring,
 * four-eyes peer review enforcement, and defect remediation.
 */

import { prisma } from '../db';
import { QaAction, QaSamplingReason } from './types';
import { recordReviewAudit } from './auditHelper';

export interface QaEvaluationResult {
  shouldSample: boolean;
  reason?: QaSamplingReason;
  details?: string;
}

export interface CompleteQaReviewInput {
  qaReviewId: string;
  qaReviewerUserId: string;
  action: QaAction;
  score: number; // 0 - 100
  findings?: any[];
  correctiveActions?: string;
}

export class QualityAssuranceService {
  /**
   * Evaluates if a completed or approved case should be sampled for QA.
   */
  public static async evaluateSamplingPolicy(
    taxCaseId: string,
    primaryReviewerId: string
  ): Promise<QaEvaluationResult> {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId },
      include: {
        positions: true,
        corrections: true
      }
    });

    if (!taxCase) throw new Error(`TaxCase ${taxCaseId} not found`);

    // 1. High Risk Check
    if (taxCase.riskLevel === 'HIGH' || taxCase.riskLevel === 'CRITICAL') {
      return {
        shouldSample: true,
        reason: QaSamplingReason.HIGH_RISK,
        details: `Case is designated ${taxCase.riskLevel} risk.`
      };
    }

    // 2. New Reviewer Check (<10 historical signoffs)
    const signoffCount = await prisma.reviewSignoff.count({
      where: { approvedByUserId: primaryReviewerId }
    });
    if (signoffCount < 10) {
      return {
        shouldSample: true,
        reason: QaSamplingReason.NEW_REVIEWER,
        details: `Reviewer has completed ${signoffCount} signoffs (<10 required for probation release).`
      };
    }

    // 3. Large Deduction Check (> $25,000)
    const hasLargeDeduction = taxCase.positions.some(
      p => p.positionType === 'DEDUCTION' && Number(p.amountCents) > 2500000
    );
    if (hasLargeDeduction) {
      return {
        shouldSample: true,
        reason: QaSamplingReason.LARGE_DEDUCTION,
        details: 'Case contains single deduction exceeding $25,000.'
      };
    }

    // 4. Large Manual Override Check (> $5,000 adjustment)
    const hasLargeOverride = taxCase.corrections.some(c => {
      const orig = (c.originalProposal as any)?.amountCents;
      const dec = (c.professionalDecision as any)?.amountCents;
      if (orig && dec) {
        return Math.abs(Number(dec) - Number(orig)) > 500000;
      }
      return false;
    });
    if (hasLargeOverride) {
      return {
        shouldSample: true,
        reason: QaSamplingReason.MANUAL_OVERRIDE,
        details: 'Reviewer made a manual adjustment exceeding $5,000.'
      };
    }

    // 5. Random 5% sampling
    if (Math.random() < 0.05) {
      return {
        shouldSample: true,
        reason: QaSamplingReason.RANDOM_SAMPLE,
        details: 'Selected via random 5% audit sampling algorithm.'
      };
    }

    return { shouldSample: false };
  }

  /**
   * Instantiates a QualityReview record for an eligible case.
   */
  public static async createQualityReview(params: {
    taxCaseId: string;
    reviewTaskId?: string;
    qaReviewerId: string;
    samplingReason: QaSamplingReason;
  }) {
    // Four-eyes invariant: QA reviewer cannot be the primary case owner or recent signoff reviewer
    const recentSignoff = await prisma.reviewSignoff.findFirst({
      where: { taxCaseId: params.taxCaseId },
      orderBy: { createdAt: 'desc' }
    });

    if (recentSignoff && recentSignoff.approvedByUserId === params.qaReviewerId) {
      throw new Error(
        `FOUR_EYES_VIOLATION: Quality reviewer cannot be the professional who approved the return.`
      );
    }

    const qa = await prisma.qualityReview.create({
      data: {
        taxCaseId: params.taxCaseId,
        reviewTaskId: params.reviewTaskId,
        qaReviewerId: params.qaReviewerId,
        samplingReason: params.samplingReason,
        status: 'PENDING'
      }
    });

    await recordReviewAudit({
      taxCaseId: params.taxCaseId,
      actorId: params.qaReviewerId,
      actorType: 'USER',
      action: 'QUALITY_REVIEW_SCHEDULED',
      objectType: 'QualityReview',
      objectId: qa.id,
      metadata: {
        samplingReason: params.samplingReason
      }
    });

    return qa;
  }

  /**
   * Completes a quality review and updates reviewer quality metrics.
   */
  public static async completeQualityReview(input: CompleteQaReviewInput) {
    const qa = await prisma.qualityReview.findUnique({
      where: { id: input.qaReviewId },
      include: { taxCase: true }
    });

    if (!qa) throw new Error(`QualityReview ${input.qaReviewId} not found`);

    // Verify QA Reviewer level (Must be Senior Reviewer Level 2+)
    const qaReviewerProfile = await prisma.professionalProfile.findUnique({
      where: { userId: input.qaReviewerUserId }
    });

    if (!qaReviewerProfile || qaReviewerProfile.reviewLevel < 2) {
      throw new Error(`QA_AUTHORIZATION_DENIED: Quality review requires Senior Reviewer (Level 2+).`);
    }

    const updated = await prisma.qualityReview.update({
      where: { id: input.qaReviewId },
      data: {
        status: input.action === QaAction.PASS ? 'PASS' : 'CORRECTION_REQUIRED',
        action: input.action,
        score: input.score,
        findings: input.findings || [],
        correctiveActions: input.correctiveActions,
        completedAt: new Date()
      }
    });

    // Update primary reviewer's cumulative quality score
    const primarySignoff = await prisma.reviewSignoff.findFirst({
      where: { taxCaseId: qa.taxCaseId },
      orderBy: { createdAt: 'desc' }
    });

    if (primarySignoff) {
      const primaryUserId = primarySignoff.approvedByUserId;
      const allQasForPrimary = await prisma.qualityReview.findMany({
        where: {
          taxCase: {
            reviewSignoffs: { some: { approvedByUserId: primaryUserId } }
          },
          score: { not: null }
        }
      });

      if (allQasForPrimary.length > 0) {
        const totalScore = allQasForPrimary.reduce((acc, q) => acc + (q.score || 0), 0);
        const avgScore = Number((totalScore / allQasForPrimary.length).toFixed(2));

        await prisma.professionalProfile.update({
          where: { userId: primaryUserId },
          data: { qualityScore: avgScore }
        });
      }
    }

    // Audit event
    await recordReviewAudit({
      taxCaseId: qa.taxCaseId,
      actorId: input.qaReviewerUserId,
      actorType: 'USER',
      action: 'QUALITY_REVIEW_COMPLETED',
      objectType: 'QualityReview',
      objectId: qa.id,
      metadata: {
        action: input.action,
        score: input.score,
        findingsCount: (input.findings || []).length
      }
    });

    return updated;
  }
}
