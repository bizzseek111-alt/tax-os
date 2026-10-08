import { prisma } from '../db';
import { CaseStatus, ReviewMode, CaseType, RiskLevel, UserRole } from '@prisma/client';
import { AuditEventService } from './audit';
import crypto from 'crypto';

export const VALID_CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  [CaseStatus.DRAFT]: [CaseStatus.DISCOVERY, CaseStatus.DOCUMENT_INTAKE],
  [CaseStatus.DISCOVERY]: [CaseStatus.DOCUMENT_INTAKE],
  [CaseStatus.DOCUMENT_INTAKE]: [CaseStatus.NEEDS_YOU, CaseStatus.CALCULATING],
  [CaseStatus.NEEDS_YOU]: [CaseStatus.CALCULATING, CaseStatus.READY_FOR_REVIEW],
  [CaseStatus.CALCULATING]: [CaseStatus.NEEDS_YOU, CaseStatus.READY_FOR_REVIEW],
  [CaseStatus.READY_FOR_REVIEW]: [CaseStatus.IN_REVIEW],
  [CaseStatus.IN_REVIEW]: [CaseStatus.NEEDS_YOU, CaseStatus.APPROVED],
  [CaseStatus.APPROVED]: [CaseStatus.FILED],
  [CaseStatus.FILED]: [CaseStatus.TRANSMITTED],
  [CaseStatus.TRANSMITTED]: [CaseStatus.ACCEPTED, CaseStatus.REJECTED],
  [CaseStatus.ACCEPTED]: [CaseStatus.ARCHIVED],
  [CaseStatus.REJECTED]: [CaseStatus.NEEDS_YOU, CaseStatus.CALCULATING],
  [CaseStatus.ARCHIVED]: [],
};

export class TaxCaseService {
  /**
   * Retrieves a TaxCase by ID, enforcing strict tenant isolation.
   */
  static async getCaseById(caseId: string, organizationId: string) {
    const taxCase = await prisma.taxCase.findFirst({
      where: {
        id: caseId,
        organizationId,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        obligations: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        positions: true,
        documents: true,
        reviewTasks: true,
      },
    });

    if (!taxCase) {
      throw new Error('CASE_NOT_FOUND_OR_ACCESS_DENIED');
    }

    return taxCase;
  }

  /**
   * Retrieves active TaxCase for a given user and organization.
   */
  static async getActiveCase(userId: string, organizationId: string, taxYear = 2026) {
    return prisma.taxCase.findFirst({
      where: {
        organizationId,
        ownerId: userId,
        taxYear,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        obligations: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        positions: true,
        documents: true,
      },
    });
  }

  /**
   * Transitions a case status, validating the state machine and recording audit block.
   */
  static async transitionStatus(
    caseId: string,
    organizationId: string,
    newStatus: CaseStatus,
    actorId: string,
    actorRole: UserRole,
    reason: string
  ) {
    const currentCase = await this.getCaseById(caseId, organizationId);
    const allowed = VALID_CASE_TRANSITIONS[currentCase.status] || [];

    if (!allowed.includes(newStatus)) {
      throw new Error(`ILLEGAL_CASE_TRANSITION: Cannot transition from ${currentCase.status} to ${newStatus}`);
    }

    // Compute updated case audit hash
    const updatedAuditHash = crypto
      .createHash('sha256')
      .update(`${currentCase.id}|${newStatus}|${new Date().toISOString()}|${currentCase.auditHash}`)
      .digest('hex');

    const updatedCase = await prisma.taxCase.update({
      where: { id: caseId },
      data: {
        status: newStatus,
        auditHash: updatedAuditHash,
      },
      include: {
        obligations: true,
        tasks: true,
      },
    });

    await AuditEventService.recordEvent({
      organizationId,
      actorId,
      actorRole,
      taxCaseId: caseId,
      action: 'CASE_STATUS_TRANSITION',
      objectType: 'TaxCase',
      objectId: caseId,
      previousValue: { status: currentCase.status },
      newValue: { status: newStatus, auditHash: updatedAuditHash },
      reason,
    });

    return updatedCase;
  }

  /**
   * Sets or modifies review mode (persisted to database).
   */
  static async updateReviewMode(
    caseId: string,
    organizationId: string,
    reviewMode: ReviewMode,
    actorId: string,
    actorRole: UserRole
  ) {
    const currentCase = await this.getCaseById(caseId, organizationId);

    const updated = await prisma.taxCase.update({
      where: { id: caseId },
      data: { reviewMode },
    });

    await AuditEventService.recordEvent({
      organizationId,
      actorId,
      actorRole,
      taxCaseId: caseId,
      action: 'UPDATE_REVIEW_MODE',
      objectType: 'TaxCase',
      objectId: caseId,
      previousValue: { reviewMode: currentCase.reviewMode },
      newValue: { reviewMode },
      reason: `Client adjusted review tier to ${reviewMode}`,
    });

    return updated;
  }
}
