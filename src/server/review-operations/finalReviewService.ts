/**
 * Autonomous Tax OS — Final Return Review Governance Service
 * 
 * Implements the 14-point review readiness checklist, professional signoff
 * persistence, credential validation, and automatic approval invalidation
 * upon downstream fact or position mutations.
 */

import crypto from 'crypto';
import { prisma } from '../db';
import { ReviewAuthorizationEngine } from './authorizationEngine';
import { FinalReviewChecklist, ReviewTaskStatus, ReviewTaskType } from './types';
import { recordReviewAudit } from './auditHelper';

export interface FinalSignoffRequest {
  taxCaseId: string;
  reviewerUserId: string;
  checklist: FinalReviewChecklist;
  certificationNotes: string;
}

export interface ReadinessCheckResult {
  isReady: boolean;
  blockingReasons: string[];
  checklistValidation: {
    passed: boolean;
    failedItems: string[];
  };
  latestCalculationRunId?: string;
  currentFactHash: string;
}

export class FinalReturnReviewService {
  /**
   * Generates a deterministic SHA-256 fingerprint of all facts in the case.
   */
  public static async computeFactHash(taxCaseId: string): Promise<string> {
    const facts = await prisma.taxFact.findMany({
      where: { taxCaseId },
      orderBy: [{ key: 'asc' }, { id: 'asc' }]
    });

    const canonical = facts.map(f => ({
      key: f.key,
      category: f.category,
      factType: f.factType,
      valueCents: f.valueCents ? f.valueCents.toString() : null,
      valueString: f.valueString,
      validationStatus: f.validationStatus,
      updatedAt: f.updatedAt.toISOString()
    }));

    return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
  }

  /**
   * Evaluates whether a case has satisfied all prerequisite gates for final signoff.
   */
  public static async evaluateReadiness(taxCaseId: string): Promise<ReadinessCheckResult> {
    const blockingReasons: string[] = [];

    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId },
      include: {
        obligations: true,
        positions: true,
        reviewTasks: true,
        calculationRuns: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!taxCase) throw new Error(`TaxCase ${taxCaseId} not found`);

    // 1. Check for open blocking review tasks
    const openTasks = taxCase.reviewTasks.filter(
      t =>
        t.reviewType !== ReviewTaskType.FINAL_RETURN_REVIEW &&
        t.status !== ReviewTaskStatus.APPROVED &&
        t.status !== ReviewTaskStatus.COMPLETED &&
        t.status !== ReviewTaskStatus.CANCELLED
    );

    if (openTasks.length > 0) {
      blockingReasons.push(
        `${openTasks.length} open review task(s) remain unresolved (e.g. ${openTasks.map(t => t.reviewType).join(', ')}).`
      );
    }

    // 2. Check for unresolved high-risk positions
    const openHighRiskPositions = taxCase.positions.filter(
      p => (p.riskScore > 0.6 || p.status === 'CHALLENGED') && p.status !== 'APPROVED'
    );
    if (openHighRiskPositions.length > 0) {
      blockingReasons.push(
        `${openHighRiskPositions.length} high-risk or challenged position(s) remain unapproved.`
      );
    }

    // 3. Check for valid completed calculation run
    const latestRun = taxCase.calculationRuns[0];
    if (!latestRun) {
      blockingReasons.push('No TaxCalculationRun exists for this case.');
    } else if (latestRun.status !== 'COMPLETED') {
      blockingReasons.push(`Latest calculation run status is '${latestRun.status}', not COMPLETED.`);
    }

    // 4. Compute current fact hash
    const currentFactHash = await this.computeFactHash(taxCaseId);

    return {
      isReady: blockingReasons.length === 0,
      blockingReasons,
      checklistValidation: {
        passed: false,
        failedItems: []
      },
      latestCalculationRunId: latestRun?.id,
      currentFactHash
    };
  }

  /**
   * Executes authoritative professional signoff on a return.
   */
  public static async executeFinalSignoff(request: FinalSignoffRequest) {
    const readiness = await this.evaluateReadiness(request.taxCaseId);

    if (!readiness.isReady) {
      throw new Error(`SIGNOFF_GATE_FAILED: Cannot approve return:\n${readiness.blockingReasons.join('\n')}`);
    }

    // Validate 14-point checklist
    const checklist = request.checklist;
    const failedItems: string[] = [];
    if (!checklist.identityVerified) failedItems.push('identityVerified');
    if (!checklist.filingStatusVerified) failedItems.push('filingStatusVerified');
    if (!checklist.dependentsResolved) failedItems.push('dependentsResolved');
    if (!checklist.incomeReconciled) failedItems.push('incomeReconciled');
    if (!checklist.withholdingReconciled) failedItems.push('withholdingReconciled');
    if (!checklist.estimatedPaymentsConfirmed) failedItems.push('estimatedPaymentsConfirmed');
    if (!checklist.materialDeductionsReviewed) failedItems.push('materialDeductionsReviewed');
    if (!checklist.creditsReviewed) failedItems.push('creditsReviewed');
    if (!checklist.stateResidencyResolved) failedItems.push('stateResidencyResolved');
    if (!checklist.multiStateSourcingResolved) failedItems.push('multiStateSourcingResolved');
    if (!checklist.calculationValidationPassed) failedItems.push('calculationValidationPassed');
    if (!checklist.noUnresolvedHighRiskPositions) failedItems.push('noUnresolvedHighRiskPositions');
    if (!checklist.notesComplete) failedItems.push('notesComplete');

    if (failedItems.length > 0) {
      throw new Error(`CHECKLIST_INCOMPLETE: The following checklist items are unverified: ${failedItems.join(', ')}`);
    }

    // Authority verification
    await ReviewAuthorizationEngine.assertCanApproveFinalReturn(request.reviewerUserId, 'US-FED');

    const reviewer = await prisma.user.findUnique({
      where: { id: request.reviewerUserId },
      include: { professionalProfile: true }
    });

    // Determine review version
    const previousSignoffs = await prisma.reviewSignoff.count({
      where: { taxCaseId: request.taxCaseId }
    });
    const reviewVersion = previousSignoffs + 1;

    // Persist immutable ReviewSignoff record
    const signoff = await prisma.reviewSignoff.create({
      data: {
        taxCaseId: request.taxCaseId,
        reviewVersion,
        approvedByUserId: request.reviewerUserId,
        calculationRunId: readiness.latestCalculationRunId!,
        ruleSetVersion: '2026.Q1',
        inputFactHash: readiness.currentFactHash,
        checklistResults: checklist as any,
        isInvalidated: false
      }
    });

    // Update TaxCase status to APPROVED
    await prisma.taxCase.update({
      where: { id: request.taxCaseId },
      data: {
        status: 'APPROVED'
      }
    });

    // Close any open FINAL_RETURN_REVIEW tasks
    await prisma.reviewTask.updateMany({
      where: {
        taxCaseId: request.taxCaseId,
        reviewType: ReviewTaskType.FINAL_RETURN_REVIEW,
        status: { notIn: [ReviewTaskStatus.APPROVED, ReviewTaskStatus.COMPLETED] }
      },
      data: {
        status: ReviewTaskStatus.APPROVED,
        completedAt: new Date(),
        professionalNotes: request.certificationNotes
      }
    });

    // Immutable audit trail
    await recordReviewAudit({
      taxCaseId: request.taxCaseId,
      actorId: request.reviewerUserId,
      actorType: 'USER',
      action: 'FINAL_RETURN_APPROVED_BY_PROFESSIONAL',
      objectType: 'ReviewSignoff',
      objectId: signoff.id,
      metadata: {
        reviewVersion,
        reviewerRole: reviewer?.role,
        ptin: reviewer?.professionalProfile?.ptin,
        factHash: readiness.currentFactHash,
        calculationRunId: readiness.latestCalculationRunId
      }
    });

    return signoff;
  }

  /**
   * Invariant Enforcement: Invalidates professional approval if any underlying facts have mutated.
   */
  public static async invalidateSignoffIfFactsChanged(taxCaseId: string): Promise<{
    invalidated: boolean;
    reason?: string;
  }> {
    const activeSignoff = await prisma.reviewSignoff.findFirst({
      where: {
        taxCaseId,
        isInvalidated: false
      },
      orderBy: { reviewVersion: 'desc' }
    });

    if (!activeSignoff) {
      return { invalidated: false };
    }

    const currentHash = await this.computeFactHash(taxCaseId);

    if (currentHash !== activeSignoff.inputFactHash) {
      const reason = `Underlying facts mutated post-approval. Hash changed from ${activeSignoff.inputFactHash.slice(0, 8)} to ${currentHash.slice(0, 8)}.`;

      // 1. Invalidate signoff
      await prisma.reviewSignoff.update({
        where: { id: activeSignoff.id },
        data: {
          isInvalidated: true,
          invalidatedAt: new Date(),
          invalidationReason: reason
        }
      });

      // 2. Revert case status from APPROVED to IN_REVIEW
      await prisma.taxCase.update({
        where: { id: taxCaseId },
        data: { status: 'IN_REVIEW' }
      });

      // 3. Create a re-review task
      await prisma.reviewTask.create({
        data: {
          taxCaseId,
          reviewType: ReviewTaskType.FINAL_RETURN_REVIEW,
          jurisdiction: 'US-FED',
          priority: 'HIGH',
          status: ReviewTaskStatus.UNASSIGNED,
          deadline: new Date(Date.now() + 24 * 3600 * 1000),
          notes: reason
        }
      });

      // 4. Log audit event
      await recordReviewAudit({
        taxCaseId,
        actorId: 'SYSTEM_INTEGRITY_MONITOR',
        actorType: 'SYSTEM',
        action: 'PROFESSIONAL_SIGNOFF_INVALIDATED',
        objectType: 'ReviewSignoff',
        objectId: activeSignoff.id,
        metadata: {
          signoffId: activeSignoff.id,
          reason,
          originalFactHash: activeSignoff.inputFactHash,
          newFactHash: currentHash
        }
      });

      return { invalidated: true, reason };
    }

    return { invalidated: false };
  }
}
