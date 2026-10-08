/**
 * Autonomous Tax OS — Attorney Escalation & Legal Work Product Service
 * 
 * Manages tax controversy escalation, statutory fraud risk routing,
 * legal opinions, and attorney-client privilege boundaries.
 */

import { prisma } from '../db';
import { UserRole } from '@prisma/client';
import { ReviewAuthorizationEngine } from './authorizationEngine';
import { ReviewTaskType, ReviewTaskStatus, MessageRecipientScope } from './types';
import { TaxCaseMessagingService } from './messagingService';
import { recordReviewAudit } from './auditHelper';

export interface EscalateToAttorneyInput {
  taxCaseId: string;
  referredByUserId: string;
  escalationReason: string;
  controversyType: 'FRAUD_RISK' | 'LISTED_TRANSACTION' | 'FOREIGN_ASSET_NONDISCLOSURE' | 'STATE_NEXUS_DISPUTE' | 'CIVIL_PENALTY_EXPOSURE';
  materialityCents?: bigint;
}

export interface AttorneyOpinionInput {
  taskId: string;
  attorneyUserId: string;
  legalOpinionSummary: string;
  recommendation: 'PROCEED' | 'MODIFY_POSITION' | 'DISALLOW_POSITION' | 'WITHDRAW_REPRESENTATION';
  privilegedNotes: string;
}

export class AttorneyEscalationService {
  /**
   * Escalates a TaxCase to the Legal Review queue with attorney privilege protection.
   */
  public static async escalateToAttorney(input: EscalateToAttorneyInput) {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: input.taxCaseId }
    });

    if (!taxCase) throw new Error(`TaxCase ${input.taxCaseId} not found`);

    // 1. Create a specialized LEGAL_REVIEW ReviewTask
    const task = await prisma.reviewTask.create({
      data: {
        taxCaseId: input.taxCaseId,
        reviewType: ReviewTaskType.LEGAL_REVIEW,
        requiredRole: UserRole.ATTORNEY,
        jurisdiction: 'US-FED',
        taxDomain: 'INCOME_TAX',
        priority: 'URGENT',
        riskLevel: 'CRITICAL',
        status: ReviewTaskStatus.WAITING_ON_ATTORNEY,
        isPrivileged: true,
        materialityCents: input.materialityCents || BigInt(0),
        deadline: new Date(Date.now() + 24 * 3600 * 1000), // 24-hour turnaround for legal escalations
        notes: `[LEGAL_ESCALATION] ${input.controversyType}: ${input.escalationReason}`
      }
    });

    // 2. Post attorney-referral communication
    const referrer = await prisma.user.findUnique({ where: { id: input.referredByUserId } });
    const isAttorney = referrer?.role === UserRole.ATTORNEY || referrer?.role === UserRole.SUPER_ADMIN;
    await TaxCaseMessagingService.postMessage({
      taxCaseId: input.taxCaseId,
      senderUserId: input.referredByUserId,
      recipientScope: isAttorney ? MessageRecipientScope.REVIEWER_ATTORNEY : MessageRecipientScope.REVIEWER_SENIOR,
      isPrivilegedLegal: isAttorney,
      content: `LEGAL ESCALATION REFERRAL:\nCase escalated for ${input.controversyType}.\nReason: ${input.escalationReason}`
    });

    // 3. Log an unprivileged audit event noting that an escalation occurred (without disclosing privileged details)
    await recordReviewAudit({
      taxCaseId: input.taxCaseId,
      actorId: input.referredByUserId,
      actorType: 'USER',
      action: 'CASE_ESCALATED_TO_ATTORNEY',
      objectType: 'ReviewTask',
      objectId: task.id,
      metadata: {
        controversyType: input.controversyType,
        isPrivileged: true
      }
    });

    return task;
  }

  /**
   * Licensed tax attorney submits authoritative legal analysis and recommendation.
   */
  public static async submitLegalOpinion(input: AttorneyOpinionInput) {
    const task = await prisma.reviewTask.findUnique({
      where: { id: input.taskId },
      include: { taxCase: true }
    });

    if (!task) throw new Error(`ReviewTask ${input.taskId} not found`);

    // Verify attorney authority
    await ReviewAuthorizationEngine.assertAuthorized({
      userId: input.attorneyUserId,
      jurisdiction: task.jurisdiction,
      taxDomain: task.taxDomain,
      isLegalControversy: true,
      requiredRole: UserRole.ATTORNEY
    });

    const attorney = await prisma.user.findUnique({
      where: { id: input.attorneyUserId }
    });

    // Update the review task
    const updatedTask = await prisma.reviewTask.update({
      where: { id: input.taskId },
      data: {
        status: ReviewTaskStatus.COMPLETED,
        completedAt: new Date(),
        assignedUserId: input.attorneyUserId,
        decision: {
          recommendation: input.recommendation,
          opinionSummary: input.legalOpinionSummary
        },
        professionalNotes: input.privilegedNotes
      }
    });

    // Post privileged legal memorandum
    await TaxCaseMessagingService.postMessage({
      taxCaseId: task.taxCaseId,
      senderUserId: input.attorneyUserId,
      recipientScope: MessageRecipientScope.REVIEWER_ATTORNEY,
      isPrivilegedLegal: true,
      content: `LEGAL OPINION & COUNSEL GUIDANCE:\nRecommendation: ${input.recommendation}\nSummary: ${input.legalOpinionSummary}\n\nPrivileged Analysis:\n${input.privilegedNotes}`
    });

    // Take downstream case action based on legal counsel recommendation
    if (input.recommendation === 'WITHDRAW_REPRESENTATION') {
      await prisma.taxCase.update({
        where: { id: task.taxCaseId },
        data: { status: 'ARCHIVED' }
      });
    } else if (input.recommendation === 'DISALLOW_POSITION' || input.recommendation === 'MODIFY_POSITION') {
      await prisma.taxCase.update({
        where: { id: task.taxCaseId },
        data: { status: 'IN_REVIEW' }
      });
    }

    // Audit event (privileged flag set)
    await recordReviewAudit({
      taxCaseId: task.taxCaseId,
      actorId: input.attorneyUserId,
      actorType: 'USER',
      action: 'ATTORNEY_LEGAL_OPINION_SUBMITTED',
      objectType: 'ReviewTask',
      objectId: task.id,
      metadata: {
        attorneyName: attorney?.fullName || attorney?.email,
        recommendation: input.recommendation,
        isPrivileged: true
      }
    });

    return updatedTask;
  }
}
