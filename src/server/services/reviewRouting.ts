import { prisma } from '../db';
import { UserRole, TaxDomain, CredentialStatus } from '@prisma/client';
import { AuditEventService } from './audit';
import crypto from 'crypto';

export interface ClaimReviewTaskInput {
  reviewTaskId: string;
  reviewerUserId: string;
}

export interface SignoffReviewTaskInput {
  reviewTaskId: string;
  reviewerUserId: string;
  ptin: string;
  notes?: string;
}

export class ReviewRoutingService {
  /**
   * Retrieves open or assignable review tasks for a professional reviewer based on their authorized jurisdictions & domains.
   */
  static async getEligibleQueue(reviewerUserId: string) {
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId: reviewerUserId },
      include: { user: true },
    });

    if (!professional || professional.credentialStatus !== CredentialStatus.ACTIVE) {
      throw new Error('INACTIVE_OR_UNAUTHORIZED_PROFESSIONAL_PROFILE');
    }

    return prisma.reviewTask.findMany({
      where: {
        jurisdiction: { in: professional.authorizedJurisdictions },
        taxDomain: { in: professional.authorizedTaxDomains as TaxDomain[] },
        OR: [
          { assignedUserId: reviewerUserId },
          { assignedUserId: null },
        ],
      },
      include: {
        taxCase: {
          select: {
            id: true,
            taxYear: true,
            status: true,
            reviewMode: true,
            riskLevel: true,
            organizationId: true,
            owner: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        taxObligation: true,
        taxPosition: true,
      },
      orderBy: { deadline: 'asc' },
    });
  }

  /**
   * Claims a review task, strictly validating reviewer's jurisdiction and tax domain authorization.
   */
  static async claimTask(input: ClaimReviewTaskInput) {
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId: input.reviewerUserId },
      include: { user: true },
    });

    if (!professional || professional.credentialStatus !== CredentialStatus.ACTIVE) {
      throw new Error('UNAUTHORIZED_PROFESSIONAL');
    }

    if (professional.currentActiveCases >= professional.maxActiveCaseCapacity) {
      throw new Error('PROFESSIONAL_CAPACITY_EXCEEDED');
    }

    const task = await prisma.reviewTask.findUnique({
      where: { id: input.reviewTaskId },
      include: { taxCase: true },
    });

    if (!task) {
      throw new Error('REVIEW_TASK_NOT_FOUND');
    }

    // 1. Enforce Jurisdiction Authorization Check
    if (!professional.authorizedJurisdictions.includes(task.jurisdiction)) {
      throw new Error(`UNAUTHORIZED_JURISDICTION: Professional is not authorized for jurisdiction ${task.jurisdiction}`);
    }

    // 2. Enforce Tax Domain Authorization Check
    if (!professional.authorizedTaxDomains.includes(task.taxDomain)) {
      throw new Error(`UNAUTHORIZED_TAX_DOMAIN: Professional is not authorized for domain ${task.taxDomain}`);
    }

    // 3. Update task and increment active workload count
    const updatedTask = await prisma.reviewTask.update({
      where: { id: task.id },
      data: {
        assignedUserId: input.reviewerUserId,
        status: 'IN_REVIEW',
      },
    });

    await prisma.professionalProfile.update({
      where: { id: professional.id },
      data: {
        currentActiveCases: { increment: 1 },
      },
    });

    await AuditEventService.recordEvent({
      organizationId: task.taxCase.organizationId,
      actorId: input.reviewerUserId,
      actorRole: professional.user.role,
      taxCaseId: task.taxCaseId,
      action: 'CLAIM_REVIEW_TASK',
      objectType: 'ReviewTask',
      objectId: task.id,
      reason: `Assigned to ${professional.user.fullName} (${professional.credentialType})`,
      newValue: { status: 'IN_REVIEW', assignedUserId: input.reviewerUserId },
    });

    return updatedTask;
  }

  /**
   * Finalizes review task sign-off with PTIN and cryptographically sealed review record.
   */
  static async signoffTask(input: SignoffReviewTaskInput) {
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId: input.reviewerUserId },
      include: { user: true },
    });

    if (!professional) {
      throw new Error('PROFESSIONAL_NOT_FOUND');
    }

    if (professional.ptin && professional.ptin !== input.ptin) {
      throw new Error('PTIN_VERIFICATION_MISMATCH');
    }

    const task = await prisma.reviewTask.findUnique({
      where: { id: input.reviewTaskId },
      include: { taxCase: true },
    });

    if (!task) {
      throw new Error('REVIEW_TASK_NOT_FOUND');
    }

    const timestamp = new Date();
    const signoffHash = crypto
      .createHash('sha256')
      .update(`${task.id}|${input.reviewerUserId}|${input.ptin}|${timestamp.toISOString()}|SIGNOFF_AUTHORIZED`)
      .digest('hex');

    // 1. Create permanent ProfessionalReview entity
    const reviewRecord = await prisma.professionalReview.create({
      data: {
        taxCaseId: task.taxCaseId,
        reviewerId: input.reviewerUserId,
        ptin: input.ptin,
        jurisdiction: task.jurisdiction,
        domain: task.taxDomain,
        overrideCount: 0,
        signoffHash,
        signedAt: timestamp,
      },
    });

    // 2. Mark task approved and completed
    const updatedTask = await prisma.reviewTask.update({
      where: { id: task.id },
      data: {
        status: 'APPROVED',
        completedAt: timestamp,
        notes: input.notes,
        decision: {
          ptin: input.ptin,
          signoffHash,
          signedAt: timestamp.toISOString(),
        },
      },
    });

    // 3. Decrement active load
    if (professional.currentActiveCases > 0) {
      await prisma.professionalProfile.update({
        where: { id: professional.id },
        data: {
          currentActiveCases: { decrement: 1 },
        },
      });
    }

    await AuditEventService.recordEvent({
      organizationId: task.taxCase.organizationId,
      actorId: input.reviewerUserId,
      actorRole: professional.user.role,
      taxCaseId: task.taxCaseId,
      action: 'PROFESSIONAL_SIGNOFF',
      objectType: 'ProfessionalReview',
      objectId: reviewRecord.id,
      reason: `Formal professional sign-off executed under PTIN ${input.ptin}`,
      newValue: { signoffHash, reviewTaskId: task.id },
    });

    return {
      task: updatedTask,
      reviewRecord,
    };
  }
}
