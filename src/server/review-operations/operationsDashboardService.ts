/**
 * Autonomous Tax OS — Review Operations Dashboard & Support Boundaries Service
 * 
 * Provides real-time queue analytics, reviewer capacity monitoring,
 * and scoped, privacy-compliant case visibility for Customer Support personnel.
 */

import { prisma } from '../db';
import { UserRole } from '@prisma/client';
import { ServiceLevelAgreementEngine } from './slaEngine';
import { ReviewTaskStatus } from './types';
import { recordReviewAudit } from './auditHelper';

export interface OperationsDashboardMetrics {
  totalActiveTasks: number;
  unassignedTasks: number;
  inReviewTasks: number;
  waitingOnCustomerTasks: number;
  waitingOnAttorneyTasks: number;
  jurisdictionBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  reviewerCapacity: {
    userId: string;
    name: string;
    role: string;
    reviewLevel: number;
    activeTasks: number;
    maxTasks: number;
    utilizationPercent: number;
    qualityScore: number;
  }[];
  slaHealth: {
    atRiskCount: number;
    breachedCount: number;
  };
}

export interface SupportCaseSummary {
  caseId: string;
  taxYear: number;
  caseType: string;
  caseStatus: string;
  completionPercent: number;
  openCustomerRequestsCount: number;
  unresolvedQuestions: string[];
  isLocked: boolean;
  assignedReviewerName?: string;
  sanitizedNotice: string;
}

export class ReviewOperationsDashboardService {
  /**
   * Generates operations executive summary across all queues and professionals.
   */
  public static async getOperationsDashboard(): Promise<OperationsDashboardMetrics> {
    const activeTasks = await prisma.reviewTask.findMany({
      where: {
        status: {
          notIn: [ReviewTaskStatus.APPROVED, ReviewTaskStatus.COMPLETED, ReviewTaskStatus.CANCELLED]
        }
      }
    });

    const unassignedTasks = activeTasks.filter(t => t.status === ReviewTaskStatus.UNASSIGNED).length;
    const inReviewTasks = activeTasks.filter(t => t.status === ReviewTaskStatus.IN_REVIEW).length;
    const waitingOnCustomerTasks = activeTasks.filter(t => t.status === ReviewTaskStatus.WAITING_ON_CUSTOMER).length;
    const waitingOnAttorneyTasks = activeTasks.filter(t => t.status === ReviewTaskStatus.WAITING_ON_ATTORNEY).length;

    const jurisdictionBreakdown: Record<string, number> = {};
    const priorityBreakdown: Record<string, number> = {};

    for (const task of activeTasks) {
      jurisdictionBreakdown[task.jurisdiction] = (jurisdictionBreakdown[task.jurisdiction] || 0) + 1;
      priorityBreakdown[task.priority] = (priorityBreakdown[task.priority] || 0) + 1;
    }

    // Reviewer capacity
    const profiles = await prisma.professionalProfile.findMany({
      where: {
        credentialStatus: 'ACTIVE'
      },
      include: { user: true }
    });

    const reviewerCapacity = profiles.map(p => {
      const activeCases = p.currentActiveCases;
      const maxCap = p.capacity || p.maxActiveCaseCapacity || 25;
      return {
        userId: p.userId,
        name: p.user.fullName || p.user.email,
        role: p.user.role,
        reviewLevel: p.reviewLevel,
        activeTasks: activeCases,
        maxTasks: maxCap,
        utilizationPercent: Number(((activeCases / Math.max(1, maxCap)) * 100).toFixed(1)),
        qualityScore: p.qualityScore
      };
    });

    // SLA health
    const { atRisk, breached } = await ServiceLevelAgreementEngine.getAtRiskAndBreachedTasks();

    return {
      totalActiveTasks: activeTasks.length,
      unassignedTasks,
      inReviewTasks,
      waitingOnCustomerTasks,
      waitingOnAttorneyTasks,
      jurisdictionBreakdown,
      priorityBreakdown,
      reviewerCapacity,
      slaHealth: {
        atRiskCount: atRisk.length,
        breachedCount: breached.length
      }
    };
  }

  /**
   * Scoped Case Summary for Customer Support.
   * Strips SSNs, detailed tax calculations, and attorney privileged notes.
   */
  public static async getCustomerSupportCaseSummary(
    taxCaseId: string,
    supportUserId: string
  ): Promise<SupportCaseSummary> {
    const user = await prisma.user.findUnique({
      where: { id: supportUserId }
    });

    if (!user) throw new Error('User not found');

    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId },
      include: {
        customerRequests: {
          where: { status: 'PENDING' }
        },
        caseLock: {
          include: { lockedByUser: true }
        },
        reviewTasks: {
          where: { status: { in: [ReviewTaskStatus.ASSIGNED, ReviewTaskStatus.IN_REVIEW] } },
          include: { assignedUser: true },
          take: 1
        }
      }
    });

    if (!taxCase) throw new Error(`TaxCase ${taxCaseId} not found`);

    // Audit support access to case
    await recordReviewAudit({
      taxCaseId,
      actorId: supportUserId,
      actorType: 'USER',
      action: 'SUPPORT_CASE_STATUS_INSPECTED',
      objectType: 'TaxCase',
      objectId: taxCase.id,
      metadata: {
        userRole: user.role
      }
    });

    const isLocked = !!taxCase.caseLock && taxCase.caseLock.expiresAt > new Date();
    const assignedUser = taxCase.reviewTasks[0]?.assignedUser;

    return {
      caseId: taxCase.id,
      taxYear: taxCase.taxYear,
      caseType: taxCase.caseType,
      caseStatus: taxCase.status,
      completionPercent: taxCase.completionPercent,
      openCustomerRequestsCount: taxCase.customerRequests.length,
      unresolvedQuestions: taxCase.customerRequests.map(r => r.prompt),
      isLocked,
      assignedReviewerName: assignedUser ? assignedUser.fullName || assignedUser.email : undefined,
      sanitizedNotice: 'SUPPORT_SCOPED_VIEW: Raw PII, tax return math schedules, and privileged attorney notes are masked per security policy.'
    };
  }
}
