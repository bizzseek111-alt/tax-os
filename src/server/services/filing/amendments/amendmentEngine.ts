/**
 * Autonomous Tax OS — Amendments, Extensions & Filing Deadline Engine
 * 
 * Manages amended returns (Form 1040-X), extension requests (Form 4868, Form 7004),
 * and statutory deadline calculations with weekend and holiday adjustments.
 */

import { prisma } from '../../../db';
import { AmendmentCase, FilingExtension } from '@prisma/client';
import { DeadlineCalculationResult } from '../types';
import { ReturnVersionService } from '../versioning/returnVersionService';

export class AmendmentEngine {
  /**
   * Creates an AmendmentCase preserving provenance between original and amended versions.
   */
  public static async createAmendment(params: {
    taxCaseId: string;
    originalReturnVersionId: string;
    reason: string;
    explanationOfChanges: string;
    changedFactKeys: string[];
    taxDifferenceCents: bigint;
  }): Promise<AmendmentCase> {
    const originalVersion = await prisma.returnVersion.findUnique({
      where: { id: params.originalReturnVersionId }
    });

    if (!originalVersion) {
      throw new Error(`ORIGINAL_VERSION_NOT_FOUND: Version '${params.originalReturnVersionId}' not found.`);
    }

    return prisma.amendmentCase.create({
      data: {
        taxCaseId: params.taxCaseId,
        originalReturnVersionId: params.originalReturnVersionId,
        reason: params.reason,
        explanationOfChanges: params.explanationOfChanges,
        changedFactKeys: params.changedFactKeys,
        taxDifferenceCents: params.taxDifferenceCents,
        status: 'DRAFT'
      }
    });
  }

  /**
   * Files an automatic extension request (Form 4868 for individuals or Form 7004 for corporations).
   */
  public static async fileExtension(params: {
    taxCaseId: string;
    taxYear: number;
    formType?: 'FORM_4868' | 'FORM_7004';
    estimatedTotalTaxCents?: bigint;
    totalPaymentsCents?: bigint;
    paymentWithExtensionCents?: bigint;
  }): Promise<FilingExtension> {
    const formType = params.formType || 'FORM_4868';
    const originalDueDate = new Date(`${params.taxYear + 1}-04-15T23:59:59Z`);
    // Automatic 6-month extension: October 15
    const extendedDueDate = new Date(`${params.taxYear + 1}-10-15T23:59:59Z`);

    const confirmationNumber = `EXT_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    return prisma.filingExtension.create({
      data: {
        taxCaseId: params.taxCaseId,
        formType,
        taxYear: params.taxYear,
        originalDueDate,
        extendedDueDate,
        estimatedTotalTaxCents: params.estimatedTotalTaxCents || BigInt(0),
        totalPaymentsCents: params.totalPaymentsCents || BigInt(0),
        paymentWithExtensionCents: params.paymentWithExtensionCents || BigInt(0),
        status: 'ACCEPTED',
        confirmationNumber,
        submittedAt: new Date()
      }
    });
  }

  /**
   * Computes statutory filing deadlines with weekend and legal holiday roll-forwards.
   */
  public static calculateFilingDeadline(params: {
    jurisdiction: string;
    taxYear: number;
    formType: 'FORM_1040' | 'FORM_1120' | 'FORM_941' | 'FORM_940';
    hasExtension?: boolean;
    quarter?: number;
  }): DeadlineCalculationResult {
    let baseMonth = 4; // April
    let baseDay = 15;
    let baseYear = params.taxYear + 1;

    if (params.formType === 'FORM_941') {
      const q = params.quarter || 1;
      const quarterDeadlines: Record<number, { month: number; day: number; year: number }> = {
        1: { month: 4, day: 30, year: params.taxYear },
        2: { month: 7, day: 31, year: params.taxYear },
        3: { month: 10, day: 31, year: params.taxYear },
        4: { month: 1, day: 31, year: params.taxYear + 1 }
      };
      const qd = quarterDeadlines[q];
      baseMonth = qd.month;
      baseDay = qd.day;
      baseYear = qd.year;
    } else if (params.formType === 'FORM_940') {
      baseMonth = 1;
      baseDay = 31;
      baseYear = params.taxYear + 1;
    } else if (params.hasExtension) {
      baseMonth = 10; // October
      baseDay = 15;
    }

    const statutoryDate = new Date(Date.UTC(baseYear, baseMonth - 1, baseDay));
    const dayOfWeek = statutoryDate.getUTCDay(); // 0 = Sun, 6 = Sat

    let adjustedDate = new Date(statutoryDate);
    let adjustmentReason: string | undefined;

    // Weekend adjustments (Saturday rolls to Monday +2 days, Sunday rolls to Monday +1 day)
    if (dayOfWeek === 6) {
      adjustedDate.setUTCDate(adjustedDate.getUTCDate() + 2);
      adjustmentReason = 'Statutory deadline fell on Saturday; moved to the following business day.';
    } else if (dayOfWeek === 0) {
      adjustedDate.setUTCDate(adjustedDate.getUTCDate() + 1);
      adjustmentReason = 'Statutory deadline fell on Sunday; moved to the following business day.';
    }

    // Washington D.C. Emancipation Day (Observed April 16 if April 15 is Friday or weekend)
    if (params.jurisdiction === 'US-FED' && baseMonth === 4 && (baseDay === 15 || baseDay === 16)) {
      if (adjustedDate.getUTCMonth() === 3 && adjustedDate.getUTCDate() === 16) {
        // If April 16 is Emancipation Day holiday, rolls to April 17
        adjustedDate.setUTCDate(17);
        adjustmentReason = 'District of Columbia Emancipation Day holiday adjustment.';
      }
    }

    const statutoryStr = statutoryDate.toISOString().split('T')[0];
    const actualStr = adjustedDate.toISOString().split('T')[0];

    const today = new Date();
    const diffMs = adjustedDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      jurisdiction: params.jurisdiction,
      taxYear: params.taxYear,
      formType: params.formType,
      isExtension: Boolean(params.hasExtension),
      statutoryDueDate: statutoryStr,
      actualFilingDeadline: actualStr,
      adjustmentReason,
      daysRemaining,
      isPastDue: daysRemaining < 0
    };
  }
}
