/**
 * Autonomous Tax OS — Review Task State Machine
 * 
 * Enforces valid state transitions and immutable audit event logging
 * across all professional review tasks.
 */

import { prisma } from '../db';
import { ReviewTaskStatus } from './types';
import { recordReviewAudit } from './auditHelper';

export interface StateTransitionResult {
  taskId: string;
  previousStatus: ReviewTaskStatus;
  currentStatus: ReviewTaskStatus;
  actorId: string;
  reason?: string;
  transitionedAt: Date;
}

export class ReviewTaskStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ReviewTaskStatus, ReviewTaskStatus[]> = {
    [ReviewTaskStatus.UNASSIGNED]: [
      ReviewTaskStatus.ASSIGNED,
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.ASSIGNED]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.UNASSIGNED,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.IN_REVIEW]: [
      ReviewTaskStatus.WAITING_ON_CUSTOMER,
      ReviewTaskStatus.WAITING_ON_AI,
      ReviewTaskStatus.WAITING_ON_DOCUMENT,
      ReviewTaskStatus.WAITING_ON_SECOND_REVIEWER,
      ReviewTaskStatus.WAITING_ON_ATTORNEY,
      ReviewTaskStatus.CHANGES_REQUIRED,
      ReviewTaskStatus.APPROVED,
      ReviewTaskStatus.REJECTED,
      ReviewTaskStatus.COMPLETED,
      ReviewTaskStatus.ASSIGNED,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.WAITING_ON_CUSTOMER]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.WAITING_ON_DOCUMENT,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.WAITING_ON_AI]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.CHANGES_REQUIRED,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.WAITING_ON_DOCUMENT]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.WAITING_ON_CUSTOMER,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.WAITING_ON_SECOND_REVIEWER]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.APPROVED,
      ReviewTaskStatus.REJECTED,
      ReviewTaskStatus.CHANGES_REQUIRED
    ],
    [ReviewTaskStatus.WAITING_ON_ATTORNEY]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.APPROVED,
      ReviewTaskStatus.REJECTED,
      ReviewTaskStatus.CHANGES_REQUIRED
    ],
    [ReviewTaskStatus.CHANGES_REQUIRED]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.WAITING_ON_AI,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.APPROVED]: [
      ReviewTaskStatus.WAITING_ON_SECOND_REVIEWER,
      ReviewTaskStatus.COMPLETED,
      ReviewTaskStatus.IN_REVIEW // Reverted if subsequent fact change invalidates
    ],
    [ReviewTaskStatus.REJECTED]: [
      ReviewTaskStatus.IN_REVIEW,
      ReviewTaskStatus.CANCELLED
    ],
    [ReviewTaskStatus.CANCELLED]: [
      ReviewTaskStatus.UNASSIGNED // Admin reopen
    ],
    [ReviewTaskStatus.COMPLETED]: [
      ReviewTaskStatus.IN_REVIEW // Reopen if audit requires revision
    ]
  };

  /**
   * Validates whether a transition from fromStatus to toStatus is permitted.
   */
  public static canTransition(fromStatus: ReviewTaskStatus, toStatus: ReviewTaskStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[fromStatus];
    return allowed ? allowed.includes(toStatus) : false;
  }

  /**
   * Transitions a ReviewTask to a new status with validation and audit logging.
   */
  public static async transition(params: {
    taskId: string;
    targetStatus: ReviewTaskStatus;
    actorId: string;
    reason?: string;
    metadata?: Record<string, any>;
  }): Promise<StateTransitionResult> {
    const task = await prisma.reviewTask.findUnique({
      where: { id: params.taskId },
      include: { taxCase: true }
    });

    if (!task) {
      throw new Error(`TASK_NOT_FOUND: Review task ${params.taskId} does not exist.`);
    }

    const currentStatus = task.status as ReviewTaskStatus;
    const targetStatus = params.targetStatus;

    if (currentStatus === targetStatus) {
      return {
        taskId: task.id,
        previousStatus: currentStatus,
        currentStatus: targetStatus,
        actorId: params.actorId,
        reason: params.reason,
        transitionedAt: new Date()
      };
    }

    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: Cannot transition ReviewTask from '${currentStatus}' to '${targetStatus}'.`
      );
    }

    const now = new Date();
    const updateData: any = {
      status: targetStatus,
      decisionReason: params.reason || task.decisionReason
    };

    if (targetStatus === ReviewTaskStatus.IN_REVIEW && !task.startedAt) {
      updateData.startedAt = now;
    }

    if (
      targetStatus === ReviewTaskStatus.APPROVED ||
      targetStatus === ReviewTaskStatus.REJECTED ||
      targetStatus === ReviewTaskStatus.COMPLETED
    ) {
      updateData.completedAt = now;
    }

    // If reverting from approved/completed back to review, clear completedAt
    if (
      (currentStatus === ReviewTaskStatus.APPROVED || currentStatus === ReviewTaskStatus.COMPLETED) &&
      targetStatus === ReviewTaskStatus.IN_REVIEW
    ) {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.reviewTask.update({
      where: { id: task.id },
      data: updateData
    });

    const previousStatus = currentStatus;

    // Immutable audit trail
    await recordReviewAudit({
      taxCaseId: task.taxCaseId,
      actorId: params.actorId,
      actorType: 'USER',
      action: 'REVIEW_TASK_STATUS_CHANGED',
      objectType: 'ReviewTask',
      objectId: task.id,
      metadata: {
        previousStatus,
        newStatus: targetStatus,
        reason: params.reason || null,
        reviewType: task.reviewType,
        jurisdiction: task.jurisdiction,
        taxDomain: task.taxDomain,
        ...(params.metadata || {})
      }
    });

    // Synchronize Case status if waiting on customer
    if (targetStatus === ReviewTaskStatus.WAITING_ON_CUSTOMER) {
      await prisma.taxCase.update({
        where: { id: task.taxCaseId },
        data: { status: 'NEEDS_YOU' }
      });
    } else if (currentStatus === ReviewTaskStatus.WAITING_ON_CUSTOMER && targetStatus === ReviewTaskStatus.IN_REVIEW) {
      // Check if there are other tasks waiting on customer
      const otherWaiting = await prisma.reviewTask.count({
        where: {
          taxCaseId: task.taxCaseId,
          status: ReviewTaskStatus.WAITING_ON_CUSTOMER,
          id: { not: task.id }
        }
      });
      if (otherWaiting === 0) {
        await prisma.taxCase.update({
          where: { id: task.taxCaseId },
          data: { status: 'IN_REVIEW' }
        });
      }
    }

    return {
      taskId: updatedTask.id,
      previousStatus: currentStatus,
      currentStatus: targetStatus,
      actorId: params.actorId,
      reason: params.reason,
      transitionedAt: now
    };
  }
}
