/**
 * Autonomous Tax OS — Tax Case Messaging & Legal Privilege Service
 * 
 * Enforces strict role-based message visibility and attorney-client legal
 * privilege isolation across all case communication.
 */

import { prisma } from '../db';
import { UserRole } from '@prisma/client';
import { MessageRecipientScope } from './types';
import { recordReviewAudit } from './auditHelper';

export interface PostMessageInput {
  taxCaseId: string;
  senderUserId: string;
  content: string;
  recipientScope: MessageRecipientScope;
  isPrivilegedLegal?: boolean;
  attachments?: any[];
}

export class TaxCaseMessagingService {
  /**
   * Posts a message with recipient scoping and legal privilege enforcement.
   */
  public static async postMessage(input: PostMessageInput) {
    const sender = await prisma.user.findUnique({
      where: { id: input.senderUserId }
    });

    if (!sender) throw new Error(`User ${input.senderUserId} not found`);

    const isPrivileged = input.isPrivilegedLegal || input.recipientScope === MessageRecipientScope.REVIEWER_ATTORNEY;

    // Privilege invariant: Only licensed attorneys or super admins can create privileged legal communications
    if (isPrivileged) {
      if (sender.role !== UserRole.ATTORNEY && sender.role !== UserRole.SUPER_ADMIN) {
        throw new Error(
          `PRIVILEGE_VIOLATION: Only a licensed Attorney can author privileged legal communications.`
        );
      }
    }

    const message = await prisma.taxCaseMessage.create({
      data: {
        taxCaseId: input.taxCaseId,
        senderUserId: input.senderUserId,
        senderRole: sender.role,
        recipientScope: input.recipientScope,
        content: input.content,
        isPrivilegedLegal: isPrivileged,
        attachments: input.attachments || []
      },
      include: {
        sender: {
          select: { id: true, fullName: true, email: true, role: true }
        }
      }
    });

    // Immutable audit log (never exposes raw privileged legal text in audit events)
    await recordReviewAudit({
      taxCaseId: input.taxCaseId,
      actorId: input.senderUserId,
      actorType: 'USER',
      action: 'CASE_MESSAGE_SENT',
      objectType: 'TaxCaseMessage',
      objectId: message.id,
      metadata: {
        senderRole: sender.role,
        recipientScope: input.recipientScope,
        isPrivilegedLegal: isPrivileged,
        attachmentCount: (input.attachments || []).length
      }
    });

    return message;
  }

  /**
   * Retrieves messages for a case based on reader's authorization and role.
   */
  public static async getMessagesForCase(taxCaseId: string, readerUserId: string) {
    const reader = await prisma.user.findUnique({
      where: { id: readerUserId }
    });

    if (!reader) throw new Error(`User ${readerUserId} not found`);

    const taxCase = await prisma.taxCase.findUnique({
      where: { id: taxCaseId }
    });

    if (!taxCase) throw new Error(`TaxCase ${taxCaseId} not found`);

    const isOwner = taxCase.ownerId === readerUserId;

    // 1. Customer (Taxpayer) visibility
    if (isOwner) {
      return await prisma.taxCaseMessage.findMany({
        where: {
          taxCaseId,
          isPrivilegedLegal: false,
          recipientScope: {
            in: [MessageRecipientScope.ALL, MessageRecipientScope.CUSTOMER_REVIEWER]
          }
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    // 2. Customer Support visibility (Non-preparer / Tier 1 support)
    if (reader.role === UserRole.CUSTOMER_SUPPORT) {
      return await prisma.taxCaseMessage.findMany({
        where: {
          taxCaseId,
          isPrivilegedLegal: false,
          recipientScope: {
            in: [
              MessageRecipientScope.ALL,
              MessageRecipientScope.CUSTOMER_REVIEWER,
              MessageRecipientScope.REVIEWER_OPS
            ]
          }
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    // 3. CPA / EA / Preparers visibility
    if (
      reader.role === UserRole.CPA ||
      reader.role === UserRole.EA ||
      reader.role === UserRole.SENIOR_REVIEWER ||
      reader.role === UserRole.CASE_MANAGER ||
      reader.role === UserRole.OPERATIONS_MANAGER
    ) {
      return await prisma.taxCaseMessage.findMany({
        where: {
          taxCaseId,
          isPrivilegedLegal: false,
          recipientScope: {
            in: [
              MessageRecipientScope.ALL,
              MessageRecipientScope.CUSTOMER_REVIEWER,
              MessageRecipientScope.REVIEWER_OPS,
              MessageRecipientScope.REVIEWER_SENIOR
            ]
          }
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    // 4. Attorney & Super Admin visibility (Full access including Privileged Legal Work Product)
    if (reader.role === UserRole.ATTORNEY || reader.role === UserRole.SUPER_ADMIN) {
      return await prisma.taxCaseMessage.findMany({
        where: { taxCaseId },
        include: {
          sender: { select: { id: true, fullName: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      });
    }

    // Default fallback: only public messages
    return await prisma.taxCaseMessage.findMany({
      where: {
        taxCaseId,
        isPrivilegedLegal: false,
        recipientScope: MessageRecipientScope.ALL
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }
}
