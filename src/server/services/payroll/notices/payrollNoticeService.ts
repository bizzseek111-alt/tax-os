/**
 * Autonomous Tax OS — Payroll Notice Defense & Workflow Service
 * 
 * Ingests IRS and state agency payroll notices (CP161, DE 2176, NYS DTF assessments):
 * - Extracts assessed tax, penalties, and interest
 * - Generates high-priority ReviewTasks for credentialed payroll CPAs
 * - Tracks response due dates and defense resolution status
 */

import { prisma } from '../../../db';
import { SalesTaxNoticeSeverity, RiskLevel, UserRole, TaxDomain } from '@prisma/client';

export class PayrollNoticeService {
  /**
   * Ingests a state or federal payroll tax notice and routes it to review.
   */
  public static async ingestPayrollNotice(params: {
    employerId: string;
    organizationId: string;
    taxCaseId?: string;
    agencyName: string;
    jurisdiction: string;
    noticeType: string;
    noticeNumber?: string;
    periodCovered?: string;
    assessedAmountCents: bigint;
    responseDueDate?: Date;
    severity?: SalesTaxNoticeSeverity;
    documentId?: string;
  }) {
    const notice = await prisma.payrollNotice.create({
      data: {
        employerId: params.employerId,
        organizationId: params.organizationId,
        agencyName: params.agencyName,
        jurisdiction: params.jurisdiction,
        noticeType: params.noticeType,
        noticeNumber: params.noticeNumber,
        periodCovered: params.periodCovered,
        assessedAmountCents: params.assessedAmountCents,
        responseDueDate: params.responseDueDate,
        severity: params.severity || SalesTaxNoticeSeverity.DEFICIENCY,
        status: 'OPEN',
        documentId: params.documentId
      }
    });

    // If an associated TaxCase exists, provision a high-priority ReviewTask
    if (params.taxCaseId) {
      const reviewTask = await prisma.reviewTask.create({
        data: {
          taxCaseId: params.taxCaseId,
          reviewType: 'NOTICE_REVIEW',
          taxDomain: TaxDomain.PAYROLL_TAX,
          jurisdiction: params.jurisdiction,
          requiredRole: UserRole.PAYROLL_REVIEWER,
          riskLevel: RiskLevel.HIGH,
          materialityCents: params.assessedAmountCents,
          priority: 'HIGH',
          status: 'UNASSIGNED',
          deadline: params.responseDueDate || new Date(Date.now() + 14 * 86400000),
          notes: `Payroll Notice ingested from ${params.agencyName} (${params.noticeType}). Assessed: $${Number(params.assessedAmountCents) / 100}`,
          qualityReviewRequired: true
        }
      });

      return await prisma.payrollNotice.update({
        where: { id: notice.id },
        data: { reviewTaskId: reviewTask.id }
      });
    }

    return notice;
  }

  /**
   * Resolves an open payroll notice with summary documentation.
   */
  public static async resolveNotice(noticeId: string, resolutionSummary: string) {
    return await prisma.payrollNotice.update({
      where: { id: noticeId },
      data: {
        status: 'RESOLVED',
        resolutionSummary,
        updatedAt: new Date()
      }
    });
  }
}
