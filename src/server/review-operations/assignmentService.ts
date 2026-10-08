/**
 * Autonomous Tax OS — Review Assignment Service
 * 
 * Manages intelligent reviewer matching, workload balancing, jurisdiction/domain
 * qualification, continuity optimization, and four-eyes separation.
 */

import { prisma } from '../db';
import { CredentialStatus, AvailabilityStatus, UserRole } from '@prisma/client';
import { ReviewAuthorizationEngine } from './authorizationEngine';
import { ReviewTaskStatus } from './types';
import { recordReviewAudit } from './auditHelper';

export interface EligibleReviewerCandidate {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  reviewLevel: number;
  currentActiveTasks: number;
  maxConcurrentTasks: number;
  capacityUtilization: number;
  hasCaseContinuity: boolean;
  score: number;
}

export class ReviewAssignmentService {
  /**
   * Finds all qualified, available reviewers for a given ReviewTask.
   */
  public static async findEligibleReviewers(taskId: string): Promise<EligibleReviewerCandidate[]> {
    const task = await prisma.reviewTask.findUnique({
      where: { id: taskId },
      include: { taxCase: true }
    });

    if (!task) {
      throw new Error(`ReviewTask ${taskId} not found`);
    }

    const materialityUsd = Number(task.materialityCents) / 100;

    // Load active professionals
    const profiles = await prisma.professionalProfile.findMany({
      where: {
        credentialStatus: CredentialStatus.ACTIVE,
        availabilityStatus: AvailabilityStatus.AVAILABLE
      },
      include: {
        user: true
      }
    });

    // Check case history to reward continuity
    const previousReviewsOnCase = await prisma.reviewTask.findMany({
      where: {
        taxCaseId: task.taxCaseId,
        assignedUserId: { not: null }
      },
      select: { assignedUserId: true }
    });
    const previousUserIds = new Set(previousReviewsOnCase.map(r => r.assignedUserId));

    const candidates: EligibleReviewerCandidate[] = [];

    for (const profile of profiles) {
      const user = profile.user;

      // Exclude expired credentials
      if (profile.credentialExpiration && profile.credentialExpiration < new Date()) {
        continue;
      }

      const activeCases = profile.currentActiveCases;
      const maxCapacity = profile.capacity || profile.maxActiveCaseCapacity || 25;

      // Check current capacity
      if (activeCases >= maxCapacity) {
        continue;
      }

      // Four-eyes separation for second review / QA
      if (
        (task.reviewType === 'QUALITY_ASSURANCE' ||
          task.status === ReviewTaskStatus.WAITING_ON_SECOND_REVIEWER) &&
        task.assignedUserId === user.id
      ) {
        // Primary reviewer cannot be secondary reviewer
        continue;
      }

      // Evaluate qualification
      const auth = await ReviewAuthorizationEngine.evaluateAuthorization({
        userId: user.id,
        jurisdiction: task.jurisdiction,
        taxDomain: task.taxDomain,
        materialityUsd,
        requiredRole: task.requiredRole
      });

      if (!auth.authorized) {
        continue;
      }

      const hasContinuity = previousUserIds.has(user.id);
      const utilization = activeCases / maxCapacity;

      // Scoring: lower utilization is better, continuity gives bonus, higher reviewLevel gives slight edge
      let score = 100 - utilization * 50;
      if (hasContinuity) score += 30;
      score += profile.reviewLevel * 5;

      candidates.push({
        userId: user.id,
        name: user.fullName || user.email,
        email: user.email,
        role: user.role,
        reviewLevel: profile.reviewLevel,
        currentActiveTasks: activeCases,
        maxConcurrentTasks: maxCapacity,
        capacityUtilization: utilization,
        hasCaseContinuity: hasContinuity,
        score
      });
    }

    // Sort candidates by score descending
    return candidates.sort((a, b) => b.score - a.score);
  }

  /**
   * Automatically assigns a task to the most suitable available professional.
   */
  public static async autoAssignTask(taskId: string, callerId?: string) {
    const candidates = await this.findEligibleReviewers(taskId);
    if (candidates.length === 0) {
      throw new Error(`NO_ELIGIBLE_REVIEWER: No available, credentialed reviewer found matching task ${taskId} criteria.`);
    }

    const bestMatch = candidates[0];
    return await this.manualAssignTask(taskId, bestMatch.userId, callerId || 'SYSTEM_AUTO_ASSIGN');
  }

  /**
   * Assigns or reassigns a task to a specific professional with validation.
   */
  public static async manualAssignTask(taskId: string, targetUserId: string, assignedByUserId: string) {
    const task = await prisma.reviewTask.findUnique({
      where: { id: taskId }
    });

    if (!task) throw new Error(`ReviewTask ${taskId} not found`);

    const materialityUsd = Number(task.materialityCents) / 100;

    // Strict authority verification
    await ReviewAuthorizationEngine.assertAuthorized({
      userId: targetUserId,
      jurisdiction: task.jurisdiction,
      taxDomain: task.taxDomain,
      materialityUsd,
      requiredRole: task.requiredRole
    });

    // Check capacity
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId: targetUserId }
    });

    const maxCapacity = profile ? (profile.capacity || profile.maxActiveCaseCapacity || 25) : 25;
    if (profile && profile.currentActiveCases >= maxCapacity) {
      throw new Error(`CAPACITY_EXCEEDED: Reviewer ${targetUserId} has reached maximum concurrent capacity (${maxCapacity}).`);
    }

    const previousAssigneeId = task.assignedUserId;

    // Decrement previous assignee workload if different
    if (previousAssigneeId && previousAssigneeId !== targetUserId) {
      await prisma.professionalProfile.updateMany({
        where: { userId: previousAssigneeId, currentActiveCases: { gt: 0 } },
        data: { currentActiveCases: { decrement: 1 } }
      });
    }

    // Increment target assignee workload if new
    if (previousAssigneeId !== targetUserId) {
      await prisma.professionalProfile.updateMany({
        where: { userId: targetUserId },
        data: { currentActiveCases: { increment: 1 } }
      });
    }

    const updatedTask = await prisma.reviewTask.update({
      where: { id: taskId },
      data: {
        assignedUserId: targetUserId,
        status: task.status === ReviewTaskStatus.UNASSIGNED ? ReviewTaskStatus.ASSIGNED : task.status
      },
      include: { assignedUser: true }
    });

    // Log assignment audit event
    await recordReviewAudit({
      taxCaseId: task.taxCaseId,
      actorId: assignedByUserId,
      actorType: 'USER',
      action: 'REVIEW_TASK_ASSIGNED',
      objectType: 'ReviewTask',
      objectId: task.id,
      metadata: {
        assignedUserId: targetUserId,
        assignedByUserId,
        previousAssigneeId,
        jurisdiction: task.jurisdiction,
        taxDomain: task.taxDomain
      }
    });

    return updatedTask;
  }

  /**
   * Unassigns a task and returns it to the UNASSIGNED pool.
   */
  public static async unassignTask(taskId: string, unassignedByUserId: string) {
    const task = await prisma.reviewTask.findUnique({
      where: { id: taskId }
    });

    if (!task) throw new Error(`ReviewTask ${taskId} not found`);

    if (task.assignedUserId) {
      await prisma.professionalProfile.updateMany({
        where: { userId: task.assignedUserId, currentActiveCases: { gt: 0 } },
        data: { currentActiveCases: { decrement: 1 } }
      });
    }

    const updatedTask = await prisma.reviewTask.update({
      where: { id: taskId },
      data: {
        assignedUserId: null,
        status: ReviewTaskStatus.UNASSIGNED
      }
    });

    await recordReviewAudit({
      taxCaseId: task.taxCaseId,
      actorId: unassignedByUserId,
      actorType: 'USER',
      action: 'REVIEW_TASK_UNASSIGNED',
      objectType: 'ReviewTask',
      objectId: task.id,
      metadata: {
        previousAssigneeId: task.assignedUserId
      }
    });

    return updatedTask;
  }
}
