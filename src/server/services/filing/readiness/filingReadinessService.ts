/**
 * Autonomous Tax OS — Filing Readiness & State Machine Service
 * 
 * Enforces rigid statutory and operational gates:
 * - A return cannot transition to READY_FOR_TRANSMISSION until all 8 mandatory gates pass
 * - Coordinates transitions through the 19-stage filing state machine
 */

import { prisma } from '../../../db';
import { FilingStatus, ReviewMode, UserRole } from '@prisma/client';
import { FilingReadinessResult, GateCheckResult } from '../types';
import { AuditEventService } from '../../audit';

export class FilingReadinessService {
  /**
   * Valid transitions for the 19-stage Filing State Machine.
   */
  private static readonly ALLOWED_TRANSITIONS: Record<FilingStatus, FilingStatus[]> = {
    [FilingStatus.DRAFT]: [FilingStatus.CALCULATING, FilingStatus.NEEDS_INFORMATION, FilingStatus.WITHDRAWN],
    [FilingStatus.CALCULATING]: [FilingStatus.NEEDS_REVIEW, FilingStatus.NEEDS_INFORMATION, FilingStatus.DRAFT],
    [FilingStatus.NEEDS_INFORMATION]: [FilingStatus.CALCULATING, FilingStatus.DRAFT, FilingStatus.WITHDRAWN],
    [FilingStatus.NEEDS_REVIEW]: [FilingStatus.PROFESSIONALLY_REVIEWED, FilingStatus.NEEDS_INFORMATION, FilingStatus.CALCULATING],
    [FilingStatus.PROFESSIONALLY_REVIEWED]: [FilingStatus.READY_FOR_CUSTOMER_REVIEW, FilingStatus.NEEDS_REVIEW, FilingStatus.CALCULATING],
    [FilingStatus.READY_FOR_CUSTOMER_REVIEW]: [FilingStatus.CUSTOMER_REVIEWED, FilingStatus.NEEDS_REVIEW],
    [FilingStatus.CUSTOMER_REVIEWED]: [FilingStatus.SIGNATURE_REQUIRED, FilingStatus.NEEDS_REVIEW],
    [FilingStatus.SIGNATURE_REQUIRED]: [FilingStatus.AUTHORIZED, FilingStatus.NEEDS_REVIEW, FilingStatus.CUSTOMER_REVIEWED],
    [FilingStatus.AUTHORIZED]: [FilingStatus.READY_FOR_TRANSMISSION, FilingStatus.CORRECTION_REQUIRED, FilingStatus.NEEDS_REVIEW],
    [FilingStatus.READY_FOR_TRANSMISSION]: [FilingStatus.QUEUED_FOR_TRANSMISSION, FilingStatus.CORRECTION_REQUIRED, FilingStatus.WITHDRAWN],
    [FilingStatus.QUEUED_FOR_TRANSMISSION]: [FilingStatus.TRANSMITTED, FilingStatus.READY_FOR_TRANSMISSION],
    [FilingStatus.TRANSMITTED]: [FilingStatus.ACKNOWLEDGED, FilingStatus.ACCEPTED, FilingStatus.REJECTED],
    [FilingStatus.ACKNOWLEDGED]: [FilingStatus.ACCEPTED, FilingStatus.REJECTED],
    [FilingStatus.ACCEPTED]: [FilingStatus.AMENDED, FilingStatus.CLOSED],
    [FilingStatus.REJECTED]: [FilingStatus.CORRECTION_REQUIRED, FilingStatus.CLOSED],
    [FilingStatus.CORRECTION_REQUIRED]: [FilingStatus.CALCULATING, FilingStatus.DRAFT, FilingStatus.WITHDRAWN],
    [FilingStatus.AMENDED]: [FilingStatus.CALCULATING, FilingStatus.DRAFT, FilingStatus.CLOSED],
    [FilingStatus.WITHDRAWN]: [FilingStatus.DRAFT, FilingStatus.CLOSED],
    [FilingStatus.CLOSED]: [FilingStatus.AMENDED]
  };

  /**
   * Evaluates all 8 filing gates for a given TaxCase.
   */
  public static async evaluateReadiness(taxCaseId: string): Promise<FilingReadinessResult> {
    const checks: GateCheckResult[] = [];
    const blockingReasons: string[] = [];

    // 1. Fetch TaxCase and associations
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId },
      include: {
        facts: true,
        calculationRuns: { orderBy: { createdAt: 'desc' }, take: 1 },
        reviewTasks: true,
        qualityReviews: true,
        returnVersions: { orderBy: { versionNumber: 'desc' }, take: 1 },
        taxpayerAuthorizations: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!taxCase) {
      throw new Error(`TAX_CASE_NOT_FOUND: TaxCase '${taxCaseId}' does not exist.`);
    }

    const latestVersion = taxCase.returnVersions[0] || null;
    const latestCalcRun = taxCase.calculationRuns[0] || null;
    const latestAuth = taxCase.taxpayerAuthorizations[0] || null;

    // Gate 1: Required Facts Resolved
    const conflictingFacts = taxCase.facts.filter((f) => f.validationStatus === 'CONFLICTED');
    const factsPassed = taxCase.facts.length > 0 && conflictingFacts.length === 0;
    checks.push({
      code: 'GATE_FACTS_RESOLVED',
      name: 'Required Facts Resolved',
      passed: factsPassed,
      blocking: true,
      message: factsPassed
        ? `All ${taxCase.facts.length} tax facts verified without conflicts.`
        : `Found ${conflictingFacts.length} unresolved fact conflicts or missing facts.`
    });
    if (!factsPassed) {
      blockingReasons.push('Fact conflicts must be resolved before filing readiness.');
    }

    // Gate 2: Required Documents Complete
    const unverifiedFacts = taxCase.facts.filter((f) => !f.sourceDocumentId && f.factType !== 'BOOLEAN');
    const docsPassed = unverifiedFacts.length === 0;
    checks.push({
      code: 'GATE_DOCUMENTS_COMPLETE',
      name: 'Required Documents Complete',
      passed: docsPassed,
      blocking: true,
      message: docsPassed
        ? 'All evidentiary documents present and linked.'
        : `Found ${unverifiedFacts.length} facts lacking evidentiary source documents.`
    });
    if (!docsPassed) {
      blockingReasons.push('Evidentiary documentation missing for required positions.');
    }

    // Gate 3: Deterministic Calculation Valid
    const calcPassed = Boolean(latestCalcRun && latestCalcRun.status === 'COMPLETED' && latestCalcRun.outputHash);
    checks.push({
      code: 'GATE_DETERMINISTIC_CALC_VALID',
      name: 'Deterministic Calculation Valid',
      passed: calcPassed,
      blocking: true,
      message: calcPassed
        ? `Deterministic calculation run ${latestCalcRun?.id} verified (Hash: ${latestCalcRun?.outputHash?.slice(0, 10)}...).`
        : 'Valid deterministic tax calculation run is missing or uncompleted.'
    });
    if (!calcPassed) {
      blockingReasons.push('Authoritative deterministic calculation run is required.');
    }

    // Gate 4: Mandatory Reviews Complete
    const openReviewTasks = taxCase.reviewTasks.filter((t) => t.status !== 'RESOLVED' && t.status !== 'APPROVED');
    const qualityPassed =
      taxCase.reviewMode !== ReviewMode.HUMAN_VERIFIED ||
      taxCase.qualityReviews.length === 0 ||
      taxCase.qualityReviews.some((qr) => qr.status === 'APPROVED');
    const reviewsPassed = openReviewTasks.length === 0 && qualityPassed;
    checks.push({
      code: 'GATE_MANDATORY_REVIEWS_COMPLETE',
      name: 'Mandatory Reviews Complete',
      passed: reviewsPassed,
      blocking: true,
      message: reviewsPassed
        ? 'All professional review tasks and quality gates approved.'
        : `Pending ${openReviewTasks.length} open review tasks or quality signoffs.`
    });
    if (!reviewsPassed) {
      blockingReasons.push('Open CPA review tasks or quality signoffs remain unresolved.');
    }

    // Gate 5: Rule Versions Current
    const ruleVersionCurrent = Boolean(latestCalcRun && latestCalcRun.ruleSetVersion.startsWith('2026'));
    checks.push({
      code: 'GATE_RULE_VERSIONS_CURRENT',
      name: 'Rule Versions Current',
      passed: ruleVersionCurrent,
      blocking: true,
      message: ruleVersionCurrent
        ? `Active rule-set version ${latestCalcRun?.ruleSetVersion} is current.`
        : 'Outdated or unverified rule-set version.'
    });
    if (!ruleVersionCurrent) {
      blockingReasons.push('Tax rules must be updated to the current statutory release.');
    }

    // Gate 6: No Blocking Tasks
    const blockingTasks = taxCase.reviewTasks.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED');
    const noBlockers = blockingTasks.length === 0;
    checks.push({
      code: 'GATE_NO_BLOCKING_TASKS',
      name: 'No Blocking Tasks',
      passed: noBlockers,
      blocking: true,
      message: noBlockers
        ? 'Zero critical blocking tasks.'
        : `Found ${blockingTasks.length} critical blocking tasks.`
    });
    if (!noBlockers) {
      blockingReasons.push('Critical blockers exist on case.');
    }

    // Gate 7: Taxpayer Reviewed Required Summary
    const customerReviewed = Boolean(
      latestVersion && (latestVersion.filingStatus === FilingStatus.CUSTOMER_REVIEWED ||
      latestVersion.filingStatus === FilingStatus.SIGNATURE_REQUIRED ||
      latestVersion.filingStatus === FilingStatus.AUTHORIZED ||
      latestVersion.filingStatus === FilingStatus.READY_FOR_TRANSMISSION)
    );
    checks.push({
      code: 'GATE_TAXPAYER_REVIEWED_SUMMARY',
      name: 'Taxpayer Reviewed Summary',
      passed: customerReviewed,
      blocking: true,
      message: customerReviewed
        ? 'Taxpayer completed required return review and approved presentation summary.'
        : 'Taxpayer has not yet reviewed required return summary presentation.'
    });
    if (!customerReviewed) {
      blockingReasons.push('Customer review of return summary is mandatory prior to transmission.');
    }

    // Gate 8: Authorization & Signature Complete
    const sigPassed = Boolean(latestVersion && latestVersion.isSigned && latestAuth && latestAuth.isAuthorized);
    checks.push({
      code: 'GATE_AUTHORIZATION_COMPLETE',
      name: 'Authorization & Signature Complete',
      passed: sigPassed,
      blocking: true,
      message: sigPassed
        ? `Valid taxpayer authorization on file (Auth ID: ${latestAuth?.id}).`
        : 'Signed ReturnVersion and Form 8879 / electronic authorization are missing.'
    });
    if (!sigPassed) {
      blockingReasons.push('Electronic return authorization and required signatures are mandatory.');
    }

    const currentFilingStatus = latestVersion?.filingStatus || FilingStatus.DRAFT;
    const isReadyForCustomerReview = factsPassed && docsPassed && calcPassed && reviewsPassed;
    const isReadyForSignature = isReadyForCustomerReview && customerReviewed;
    const isReadyForTransmission = blockingReasons.length === 0;

    return {
      taxCaseId,
      returnVersionId: latestVersion?.id,
      isReadyForCustomerReview,
      isReadyForSignature,
      isReadyForTransmission,
      currentStatus: currentFilingStatus,
      blockingReasons,
      checks
    };
  }

  /**
   * Validates and transitions the filing state machine.
   */
  public static async transitionStatus(params: {
    taxCaseId: string;
    targetStatus: FilingStatus;
    actorUserId: string;
    reason?: string;
  }): Promise<{ previousStatus: FilingStatus; newStatus: FilingStatus }> {
    const latestVersion = await prisma.returnVersion.findFirst({
      where: { taxCaseId: params.taxCaseId },
      orderBy: { versionNumber: 'desc' }
    });

    const previousStatus = latestVersion?.filingStatus || FilingStatus.DRAFT;

    // Check transition validity
    const allowedTargets = this.ALLOWED_TRANSITIONS[previousStatus] || [];
    if (!allowedTargets.includes(params.targetStatus)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: Cannot transition from '${previousStatus}' to '${params.targetStatus}'. Allowed: [${allowedTargets.join(', ')}]`
      );
    }

    // If moving to READY_FOR_TRANSMISSION, enforce all gates
    if (params.targetStatus === FilingStatus.READY_FOR_TRANSMISSION) {
      const readiness = await this.evaluateReadiness(params.taxCaseId);
      if (!readiness.isReadyForTransmission) {
        throw new Error(
          `FILING_GATES_FAILED: Return cannot reach READY_FOR_TRANSMISSION. Blocking reasons: ${readiness.blockingReasons.join('; ')}`
        );
      }
    }

    // Update ReturnVersion status
    if (latestVersion) {
      await prisma.returnVersion.update({
        where: { id: latestVersion.id },
        data: { filingStatus: params.targetStatus }
      });
    }

    // Record audit event
    const taxCase = await prisma.taxCase.findUnique({ where: { id: params.taxCaseId } });
    if (taxCase) {
      await AuditEventService.recordEvent({
        organizationId: taxCase.organizationId,
        actorId: params.actorUserId,
        actorRole: UserRole.SUPER_ADMIN,
        actorType: 'USER',
        taxCaseId: taxCase.id,
        action: 'FILING_STATE_TRANSITION',
        objectType: 'ReturnVersion',
        objectId: latestVersion?.id || taxCase.id,
        previousValue: { status: previousStatus },
        newValue: { status: params.targetStatus, reason: params.reason }
      });
    }

    return { previousStatus, newStatus: params.targetStatus };
  }
}
