/**
 * Autonomous Tax OS — Service Level Agreement (SLA) Engine
 * 
 * Monitors turnaround deadlines, detects at-risk queues, flags breached tasks,
 * and automatically escalates critical path reviews.
 */

import { prisma } from '../db';
import { ReviewTaskStatus } from './types';
import { recordReviewAudit } from './auditHelper';

export interface TaskSlaStatus {
  taskId: string;
  taxCaseId: string;
  reviewType: string;
  status: string;
  priority: string;
  startedAt: Date;
  dueAt: Date;
  elapsedHours: number;
  remainingHours: number;
  isAtRisk: boolean;
  isBreached: boolean;
  policyName?: string;
}

export class ServiceLevelAgreementEngine {
  /**
   * Evaluates the real-time SLA metrics for an individual review task.
   */
  public static async evaluateTaskSla(taskId: string): Promise<TaskSlaStatus> {
    const task = await prisma.reviewTask.findUnique({
      where: { id: taskId },
      include: { slaPolicy: true }
    });

    if (!task) throw new Error(`ReviewTask ${taskId} not found`);

    const now = new Date();
    const startedAt = task.startedAt || task.createdAt;

    // Use SLA policy or fall back to 24h standard turnaround
    const targetHours = task.slaPolicy?.targetTurnaroundHours ?? 24;
    const warningHours = task.slaPolicy?.warningThresholdHours ?? 18;

    const dueAt = task.dueAt || task.deadline || new Date(startedAt.getTime() + targetHours * 3600 * 1000);
    const warningAt = new Date(startedAt.getTime() + warningHours * 3600 * 1000);

    const elapsedHours = Number(((now.getTime() - startedAt.getTime()) / (3600 * 1000)).toFixed(2));
    const remainingHours = Number(((dueAt.getTime() - now.getTime()) / (3600 * 1000)).toFixed(2));

    const isBreached = now > dueAt && task.status !== ReviewTaskStatus.APPROVED && task.status !== ReviewTaskStatus.COMPLETED;
    const isAtRisk = now > warningAt && !isBreached && task.status !== ReviewTaskStatus.APPROVED && task.status !== ReviewTaskStatus.COMPLETED;

    return {
      taskId: task.id,
      taxCaseId: task.taxCaseId,
      reviewType: task.reviewType,
      status: task.status,
      priority: task.priority,
      startedAt,
      dueAt,
      elapsedHours,
      remainingHours,
      isAtRisk,
      isBreached,
      policyName: task.slaPolicy?.name ?? 'Standard 24h Turnaround'
    };
  }

  /**
   * Retrieves all active tasks that are either at-risk or have breached their SLA.
   */
  public static async getAtRiskAndBreachedTasks(jurisdiction?: string): Promise<{
    atRisk: TaskSlaStatus[];
    breached: TaskSlaStatus[];
  }> {
    const activeTasks = await prisma.reviewTask.findMany({
      where: {
        status: {
          in: [
            ReviewTaskStatus.UNASSIGNED,
            ReviewTaskStatus.ASSIGNED,
            ReviewTaskStatus.IN_REVIEW,
            ReviewTaskStatus.WAITING_ON_SECOND_REVIEWER,
            ReviewTaskStatus.WAITING_ON_ATTORNEY,
            ReviewTaskStatus.CHANGES_REQUIRED
          ]
        },
        ...(jurisdiction ? { jurisdiction } : {})
      },
      include: { slaPolicy: true }
    });

    const atRisk: TaskSlaStatus[] = [];
    const breached: TaskSlaStatus[] = [];

    for (const task of activeTasks) {
      const evaluation = await this.evaluateTaskSla(task.id);
      if (evaluation.isBreached) {
        breached.push(evaluation);
      } else if (evaluation.isAtRisk) {
        atRisk.push(evaluation);
      }
    }

    return { atRisk, breached };
  }

  /**
   * Automatically elevates priority of all breached tasks to URGENT.
   */
  public static async escalateBreachedTasks(): Promise<number> {
    const { breached } = await this.getAtRiskAndBreachedTasks();
    let escalatedCount = 0;

    for (const item of breached) {
      if (item.priority !== 'URGENT') {
        await prisma.reviewTask.update({
          where: { id: item.taskId },
          data: { priority: 'URGENT' }
        });

        await recordReviewAudit({
          taxCaseId: item.taxCaseId,
          actorId: 'SLA_ENGINE_DAEMON',
          actorType: 'SYSTEM',
          action: 'SLA_BREACH_ESCALATED',
          objectType: 'ReviewTask',
          objectId: item.taskId,
          metadata: {
            elapsedHours: item.elapsedHours,
            previousPriority: item.priority,
            newPriority: 'URGENT'
          }
        });

        escalatedCount++;
      }
    }

    return escalatedCount;
  }
}
