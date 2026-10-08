/**
 * Autonomous Tax OS — Position Review Service
 * 
 * Manages human professional review actions (APPROVE, MODIFY, REJECT, REQUEST_INFO)
 * on proposed tax positions with deterministic recalculation and learning memory.
 */

import crypto from 'crypto';
import { prisma } from '../db';
import { ReviewAuthorizationEngine } from './authorizationEngine';
import { CalculationRunService } from '../services/taxCalculation/calculationRunService';
import { ReviewTaskStatus, CustomerRequestType } from './types';
import { recordReviewAudit } from './auditHelper';

export interface ModifyPositionInput {
  amountCents?: bigint;
  rationale?: string;
  statutoryCitation?: string;
  category?: string;
  notes?: string;
}

export class PositionReviewService {
  /**
   * Approves a proposed tax position as compliant.
   */
  public static async approvePosition(positionId: string, reviewerId: string, notes?: string) {
    const position = await prisma.taxPosition.findUnique({
      where: { id: positionId },
      include: { taxCase: true, taxObligation: true }
    });

    if (!position) throw new Error(`TaxPosition ${positionId} not found`);

    const materialityUsd = Number(position.amountCents) / 100;
    const jurisdiction = position.taxObligation?.jurisdictionCode || 'US-FED';
    const taxDomain = position.taxObligation?.taxDomain || 'INCOME_TAX';

    await ReviewAuthorizationEngine.assertAuthorized({
      userId: reviewerId,
      jurisdiction,
      taxDomain,
      materialityUsd
    });

    const user = await prisma.user.findUnique({ where: { id: reviewerId } });

    const updatedPosition = await prisma.taxPosition.update({
      where: { id: positionId },
      data: {
        status: 'APPROVED',
        proReviewNotes: notes || position.proReviewNotes
      }
    });

    const auditHash = crypto
      .createHash('sha256')
      .update(`${positionId}:APPROVED:${reviewerId}:${Date.now()}`)
      .digest('hex');

    await prisma.taxDecision.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        deciderType: user?.role === 'ATTORNEY' ? 'ATTORNEY_MEMO' : 'CPA_OVERRIDE',
        deciderId: reviewerId,
        decisionAction: 'APPROVED',
        rationale: notes || 'Approved by professional reviewer',
        auditHash
      }
    });

    await recordReviewAudit({
      taxCaseId: position.taxCaseId,
      actorId: reviewerId,
      actorType: 'USER',
      action: 'POSITION_APPROVED',
      objectType: 'TaxPosition',
      objectId: position.id,
      metadata: {
        amountCents: position.amountCents.toString(),
        category: position.category,
        statutoryCitation: position.statutoryCitation
      }
    });

    return updatedPosition;
  }

  /**
   * Modifies a position amount or rationale, triggering learning correction,
   * signoff invalidation, and deterministic recalculation.
   */
  public static async modifyPosition(
    positionId: string,
    reviewerId: string,
    updates: ModifyPositionInput,
    reason: string
  ) {
    const position = await prisma.taxPosition.findUnique({
      where: { id: positionId },
      include: { taxCase: true, taxObligation: true }
    });

    if (!position) throw new Error(`TaxPosition ${positionId} not found`);

    const materialityUsd = Math.max(
      Number(position.amountCents) / 100,
      Number(updates.amountCents ?? position.amountCents) / 100
    );
    const jurisdiction = position.taxObligation?.jurisdictionCode || 'US-FED';
    const taxDomain = position.taxObligation?.taxDomain || 'INCOME_TAX';

    await ReviewAuthorizationEngine.assertAuthorized({
      userId: reviewerId,
      jurisdiction,
      taxDomain,
      materialityUsd
    });

    const user = await prisma.user.findUnique({ where: { id: reviewerId } });

    const originalProposal = {
      amountCents: position.amountCents.toString(),
      rationale: position.rationale,
      statutoryCitation: position.statutoryCitation,
      category: position.category
    };

    const professionalDecision = {
      amountCents: (updates.amountCents ?? position.amountCents).toString(),
      rationale: updates.rationale ?? position.rationale,
      statutoryCitation: updates.statutoryCitation ?? position.statutoryCitation,
      category: updates.category ?? position.category,
      notes: updates.notes
    };

    // 1. Record ProfessionalCorrection for AI agent learning
    await prisma.professionalCorrection.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        originalProposal,
        professionalDecision,
        reason,
        ruleRefs: position.ruleRefs as any,
        reviewerId,
        reviewerRole: user?.role || 'CPA'
      }
    });

    // 2. Update position
    const updatedPosition = await prisma.taxPosition.update({
      where: { id: positionId },
      data: {
        amountCents: updates.amountCents ?? position.amountCents,
        rationale: updates.rationale ?? position.rationale,
        statutoryCitation: updates.statutoryCitation ?? position.statutoryCitation,
        category: updates.category ?? position.category,
        status: 'APPROVED',
        proReviewNotes: updates.notes || `Modified by reviewer: ${reason}`
      }
    });

    // 3. Record TaxDecision
    const auditHash = crypto
      .createHash('sha256')
      .update(`${positionId}:ADJUSTED:${reviewerId}:${Date.now()}`)
      .digest('hex');

    await prisma.taxDecision.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        deciderType: user?.role === 'ATTORNEY' ? 'ATTORNEY_MEMO' : 'CPA_OVERRIDE',
        deciderId: reviewerId,
        decisionAction: 'ADJUSTED',
        rationale: reason,
        auditHash
      }
    });

    // 4. Invalidate prior signoffs on this TaxCase
    await this.invalidateActiveSignoffs(
      position.taxCaseId,
      `Position '${position.title}' was modified by reviewer ${reviewerId}. Recalculation required.`
    );

    // 5. Invalidate & re-execute deterministic calculation
    let calcResult = null;
    try {
      calcResult = await CalculationRunService.executeAndPersistRun(position.taxCaseId);
    } catch (err: any) {
      console.warn(`[PositionReviewService] Recalculation after position modification note: ${err.message}`);
    }

    // 6. Audit event
    await recordReviewAudit({
      taxCaseId: position.taxCaseId,
      actorId: reviewerId,
      actorType: 'USER',
      action: 'POSITION_MODIFIED_BY_REVIEWER',
      objectType: 'TaxPosition',
      objectId: position.id,
      metadata: {
        originalProposal,
        professionalDecision,
        reason
      }
    });

    return {
      position: updatedPosition,
      recalculation: calcResult
    };
  }

  /**
   * Rejects/disallows a proposed position, triggering deterministic recalculation.
   */
  public static async rejectPosition(positionId: string, reviewerId: string, reason: string) {
    const position = await prisma.taxPosition.findUnique({
      where: { id: positionId },
      include: { taxCase: true, taxObligation: true }
    });

    if (!position) throw new Error(`TaxPosition ${positionId} not found`);

    const materialityUsd = Number(position.amountCents) / 100;
    const jurisdiction = position.taxObligation?.jurisdictionCode || 'US-FED';
    const taxDomain = position.taxObligation?.taxDomain || 'INCOME_TAX';

    await ReviewAuthorizationEngine.assertAuthorized({
      userId: reviewerId,
      jurisdiction,
      taxDomain,
      materialityUsd
    });

    const user = await prisma.user.findUnique({ where: { id: reviewerId } });

    // 1. Record correction
    await prisma.professionalCorrection.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        originalProposal: {
          amountCents: position.amountCents.toString(),
          category: position.category,
          rationale: position.rationale
        },
        professionalDecision: {
          action: 'REJECTED',
          reason
        },
        reason,
        ruleRefs: position.ruleRefs as any,
        reviewerId,
        reviewerRole: user?.role || 'CPA'
      }
    });

    // 2. Update position status
    const updatedPosition = await prisma.taxPosition.update({
      where: { id: positionId },
      data: {
        status: 'REJECTED',
        proReviewNotes: `Disallowed by reviewer: ${reason}`
      }
    });

    // 3. Record TaxDecision
    const auditHash = crypto
      .createHash('sha256')
      .update(`${positionId}:DISALLOWED:${reviewerId}:${Date.now()}`)
      .digest('hex');

    await prisma.taxDecision.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        deciderType: user?.role === 'ATTORNEY' ? 'ATTORNEY_MEMO' : 'CPA_OVERRIDE',
        deciderId: reviewerId,
        decisionAction: 'DISALLOWED',
        rationale: reason,
        auditHash
      }
    });

    // 4. Invalidate prior signoffs
    await this.invalidateActiveSignoffs(
      position.taxCaseId,
      `Position '${position.title}' was rejected by reviewer ${reviewerId}.`
    );

    // 5. Invalidate & re-execute deterministic calculation
    let calcResult = null;
    try {
      calcResult = await CalculationRunService.executeAndPersistRun(position.taxCaseId);
    } catch (err: any) {
      console.warn(`[PositionReviewService] Recalculation after position rejection note: ${err.message}`);
    }

    // 6. Audit event
    await recordReviewAudit({
      taxCaseId: position.taxCaseId,
      actorId: reviewerId,
      actorType: 'USER',
      action: 'POSITION_REJECTED_BY_REVIEWER',
      objectType: 'TaxPosition',
      objectId: position.id,
      metadata: {
        reason
      }
    });

    return {
      position: updatedPosition,
      recalculation: calcResult
    };
  }

  /**
   * Generates a CustomerRequest linked to a position and moves task to WAITING_ON_CUSTOMER.
   */
  public static async requestInfoForPosition(params: {
    positionId: string;
    reviewerId: string;
    prompt: string;
    reason: string;
    expectedAnswerType?: string;
    options?: string[];
  }) {
    const position = await prisma.taxPosition.findUnique({
      where: { id: params.positionId }
    });

    if (!position) throw new Error(`TaxPosition ${params.positionId} not found`);

    const customerReq = await prisma.customerRequest.create({
      data: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        requestType: CustomerRequestType.QUESTION,
        prompt: params.prompt,
        reason: params.reason,
        expectedAnswerType: params.expectedAnswerType || 'TEXT',
        options: params.options || [],
        requestedByUserId: params.reviewerId,
        status: 'PENDING'
      }
    });

    // Update case status to NEEDS_YOU
    await prisma.taxCase.update({
      where: { id: position.taxCaseId },
      data: { status: 'NEEDS_YOU' }
    });

    // Move associated review tasks to WAITING_ON_CUSTOMER
    await prisma.reviewTask.updateMany({
      where: {
        taxCaseId: position.taxCaseId,
        taxPositionId: position.id,
        status: ReviewTaskStatus.IN_REVIEW
      },
      data: {
        status: ReviewTaskStatus.WAITING_ON_CUSTOMER
      }
    });

    await recordReviewAudit({
      taxCaseId: position.taxCaseId,
      actorId: params.reviewerId,
      actorType: 'USER',
      action: 'CUSTOMER_INFO_REQUESTED_FOR_POSITION',
      objectType: 'CustomerRequest',
      objectId: customerReq.id,
      metadata: {
        positionId: position.id,
        prompt: params.prompt,
        reason: params.reason
      }
    });

    return customerReq;
  }

  /**
   * Helper to invalidate any active signoffs when a position changes.
   */
  private static async invalidateActiveSignoffs(taxCaseId: string, reason: string) {
    const activeSignoffs = await prisma.reviewSignoff.findMany({
      where: {
        taxCaseId,
        isInvalidated: false
      }
    });

    if (activeSignoffs.length > 0) {
      await prisma.reviewSignoff.updateMany({
        where: {
          taxCaseId,
          isInvalidated: false
        },
        data: {
          isInvalidated: true,
          invalidatedAt: new Date(),
          invalidationReason: reason
        }
      });

      // Reset case status to IN_REVIEW if it was APPROVED
      await prisma.taxCase.updateMany({
        where: {
          id: taxCaseId,
          status: 'APPROVED'
        },
        data: {
          status: 'IN_REVIEW'
        }
      });
    }
  }
}
