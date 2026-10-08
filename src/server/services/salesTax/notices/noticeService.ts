/**
 * Autonomous Tax OS — Sales Tax Notice Service
 * 
 * Ingests, tracks, and routes state sales tax notices (deficiencies, audit inquiries,
 * penalties) into high-priority professional review tasks.
 */

import { prisma } from '../../../db';
import { SalesTaxNoticeSeverity, TaxDomain, UserRole } from '@prisma/client';

export interface IngestNoticeParams {
  organizationId: string;
  taxCaseId?: string;
  stateCode: string;
  noticeDate: Date;
  noticeType: 'ASSESSMENT' | 'INQUIRY' | 'DEFICIENCY' | 'AUDIT_NOTICE';
  noticeNumber?: string;
  agencyName: string;
  periodCovered?: string;
  assessedTaxCents?: bigint;
  assessedPenaltyCents?: bigint;
  assessedInterestCents?: bigint;
  responseDueDate?: Date;
  severity?: SalesTaxNoticeSeverity;
  documentId?: string;
}

export class NoticeService {
  /**
   * Ingests a state sales tax notice and escalates to professional review
   */
  public async ingestNotice(params: IngestNoticeParams) {
    const assessedTax = params.assessedTaxCents || BigInt(0);
    const assessedPenalty = params.assessedPenaltyCents || BigInt(0);
    const assessedInterest = params.assessedInterestCents || BigInt(0);
    const totalAssessment = assessedTax + assessedPenalty + assessedInterest;

    const notice = await prisma.salesTaxNotice.create({
      data: {
        organizationId: params.organizationId,
        stateCode: params.stateCode.toUpperCase(),
        noticeDate: params.noticeDate,
        noticeType: params.noticeType,
        noticeNumber: params.noticeNumber,
        agencyName: params.agencyName,
        periodCovered: params.periodCovered,
        assessedTaxCents: assessedTax,
        assessedPenaltyCents: assessedPenalty,
        assessedInterestCents: assessedInterest,
        totalAssessmentCents: totalAssessment,
        responseDueDate: params.responseDueDate,
        severity: params.severity || SalesTaxNoticeSeverity.INQUIRY,
        documentId: params.documentId,
        status: 'OPEN'
      }
    });

    // If linked to a TaxCase, auto-create a high-priority ReviewTask
    if (params.taxCaseId) {
      const deadline = params.responseDueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      const reviewTask = await prisma.reviewTask.create({
        data: {
          taxCaseId: params.taxCaseId,
          reviewType: 'SALES_TAX_NOTICE_REVIEW',
          taxDomain: TaxDomain.SALES_TAX,
          jurisdiction: `US-${params.stateCode.toUpperCase()}`,
          requiredRole: UserRole.CPA,
          priority: params.severity === SalesTaxNoticeSeverity.AUDIT_INTENT || params.severity === SalesTaxNoticeSeverity.LIEN_THREAT ? 'URGENT' : 'HIGH',
          materialityCents: totalAssessment,
          deadline,
          status: 'UNASSIGNED',
          notes: `State Sales Tax Notice received from ${params.agencyName} for ${params.periodCovered || 'Unspecified Period'}. Assessment: $${(Number(totalAssessment) / 100).toFixed(2)}.`,
          qualityReviewRequired: true
        }
      });

      return await prisma.salesTaxNotice.update({
        where: { id: notice.id },
        data: { reviewTaskId: reviewTask.id }
      });
    }

    return notice;
  }

  /**
   * Resolves notice with summary
   */
  public async resolveNotice(noticeId: string, resolutionSummary: string) {
    return await prisma.salesTaxNotice.update({
      where: { id: noticeId },
      data: {
        status: 'RESOLVED',
        resolutionSummary
      }
    });
  }
}
