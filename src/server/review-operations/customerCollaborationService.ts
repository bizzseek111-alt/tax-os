/**
 * Autonomous Tax OS — Customer-Professional Collaboration Service
 * 
 * Manages the "Needs You" customer queue, structured information requests,
 * document requests, confirmations, and automatic unblocking of review tasks.
 */

import { prisma } from '../db';
import { CustomerRequestType, CustomerRequestStatus, ReviewTaskStatus } from './types';
import { ReviewTaskStateMachine } from './stateMachine';
import { recordReviewAudit } from './auditHelper';

export interface CreateCustomerRequestInput {
  taxCaseId: string;
  reviewTaskId?: string;
  taxPositionId?: string;
  requestType: CustomerRequestType;
  prompt: string;
  reason: string;
  expectedAnswerType?: string;
  options?: any[];
  deadline?: Date;
  requestedByUserId: string;
}

export interface RespondCustomerRequestInput {
  requestId: string;
  userId: string;
  responsePayload?: any;
  responseDocumentId?: string;
}

export class CustomerCollaborationService {
  /**
   * Professional creates a structured request for customer input.
   */
  public static async createRequest(input: CreateCustomerRequestInput) {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: input.taxCaseId }
    });

    if (!taxCase) throw new Error(`TaxCase ${input.taxCaseId} not found`);

    const request = await prisma.customerRequest.create({
      data: {
        taxCaseId: input.taxCaseId,
        reviewTaskId: input.reviewTaskId,
        taxPositionId: input.taxPositionId,
        requestType: input.requestType,
        prompt: input.prompt,
        reason: input.reason,
        expectedAnswerType: input.expectedAnswerType || 'TEXT',
        options: input.options || [],
        deadline: input.deadline,
        requestedByUserId: input.requestedByUserId,
        status: CustomerRequestStatus.PENDING
      }
    });

    // Put TaxCase into NEEDS_YOU status
    await prisma.taxCase.update({
      where: { id: input.taxCaseId },
      data: { status: 'NEEDS_YOU' }
    });

    // If linked to review task, transition to WAITING_ON_CUSTOMER
    if (input.reviewTaskId) {
      await ReviewTaskStateMachine.transition({
        taskId: input.reviewTaskId,
        targetStatus: ReviewTaskStatus.WAITING_ON_CUSTOMER,
        actorId: input.requestedByUserId,
        reason: `Customer request created: ${input.prompt}`
      });
    }

    // Immutable audit log
    await recordReviewAudit({
      taxCaseId: input.taxCaseId,
      actorId: input.requestedByUserId,
      actorType: 'USER',
      action: 'CUSTOMER_REQUEST_CREATED',
      objectType: 'CustomerRequest',
      objectId: request.id,
      metadata: {
        requestType: input.requestType,
        prompt: input.prompt,
        reason: input.reason
      }
    });

    return request;
  }

  /**
   * Retrieves pending requests for a TaxCase ("Needs You" items).
   */
  public static async getPendingRequestsForCase(taxCaseId: string) {
    return await prisma.customerRequest.findMany({
      where: {
        taxCaseId,
        status: CustomerRequestStatus.PENDING
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Retrieves all pending requests for a user across all their tax cases.
   */
  public static async getPendingRequestsForUser(userId: string) {
    return await prisma.customerRequest.findMany({
      where: {
        taxCase: { ownerId: userId },
        status: CustomerRequestStatus.PENDING
      },
      include: {
        taxCase: {
          select: { id: true, taxYear: true, caseType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Customer submits an answer or document to resolve a pending request.
   */
  public static async respondToRequest(input: RespondCustomerRequestInput) {
    const request = await prisma.customerRequest.findUnique({
      where: { id: input.requestId },
      include: { taxCase: true }
    });

    if (!request) throw new Error(`CustomerRequest ${input.requestId} not found`);

    if (request.status !== CustomerRequestStatus.PENDING) {
      throw new Error(`REQUEST_NOT_PENDING: Request ${input.requestId} is already in status ${request.status}`);
    }

    const now = new Date();

    const updatedRequest = await prisma.customerRequest.update({
      where: { id: input.requestId },
      data: {
        status: CustomerRequestStatus.RESPONDED,
        responsePayload: input.responsePayload || {},
        responseDocumentId: input.responseDocumentId,
        respondedAt: now
      }
    });

    // Log response audit event
    await recordReviewAudit({
      taxCaseId: request.taxCaseId,
      actorId: input.userId,
      actorType: 'USER',
      action: 'CUSTOMER_REQUEST_RESOLVED',
      objectType: 'CustomerRequest',
      objectId: request.id,
      metadata: {
        responsePayload: input.responsePayload,
        responseDocumentId: input.responseDocumentId
      }
    });

    // If associated with a review task, unblock it if no more pending requests for that task
    if (request.reviewTaskId) {
      const remainingForTask = await prisma.customerRequest.count({
        where: {
          reviewTaskId: request.reviewTaskId,
          status: CustomerRequestStatus.PENDING
        }
      });

      if (remainingForTask === 0) {
        await ReviewTaskStateMachine.transition({
          taskId: request.reviewTaskId,
          targetStatus: ReviewTaskStatus.IN_REVIEW,
          actorId: input.userId,
          reason: 'Customer responded to all required questions.'
        });
      }
    }

    // Check if any other pending requests remain for this entire case
    const totalRemainingForCase = await prisma.customerRequest.count({
      where: {
        taxCaseId: request.taxCaseId,
        status: CustomerRequestStatus.PENDING
      }
    });

    if (totalRemainingForCase === 0) {
      // Return case to IN_REVIEW or READY_FOR_REVIEW
      await prisma.taxCase.update({
        where: { id: request.taxCaseId },
        data: { status: 'IN_REVIEW' }
      });
    }

    return updatedRequest;
  }

  /**
   * Cancels a pending request.
   */
  public static async cancelRequest(requestId: string, cancelledByUserId: string, reason: string) {
    const request = await prisma.customerRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) throw new Error(`CustomerRequest ${requestId} not found`);

    const updated = await prisma.customerRequest.update({
      where: { id: requestId },
      data: {
        status: CustomerRequestStatus.CANCELLED
      }
    });

    await recordReviewAudit({
      taxCaseId: request.taxCaseId,
      actorId: cancelledByUserId,
      actorType: 'USER',
      action: 'CUSTOMER_REQUEST_CANCELLED',
      objectType: 'CustomerRequest',
      objectId: request.id,
      metadata: { reason }
    });

    return updated;
  }
}
