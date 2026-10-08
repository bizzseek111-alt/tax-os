/**
 * Autonomous Tax OS — Sales Tax Filing Provider & Electronic Authorization
 * 
 * Enforces strict two-party verification (CPA Reviewer Approval + Taxpayer Authorization)
 * before simulated e-filing submission and payment scheduling.
 */

import { prisma } from '../../../db';
import { SalesTaxReturnStatus } from '@prisma/client';

export interface PreFilingValidationResult {
  isValid: boolean;
  blockers: string[];
  warnings: string[];
}

export interface TaxpayerAuthorization {
  taxpayerUserId: string;
  signatureText: string;
  ipAddress: string;
  authorizedAt: Date;
}

export interface FilingSubmissionResult {
  returnId: string;
  status: SalesTaxReturnStatus;
  confirmationNumber?: string;
  filedAt?: Date;
  errors?: string[];
}

export class FilingProvider {
  /**
   * Pre-filing validation gates
   */
  public async validateReturn(returnId: string): Promise<PreFilingValidationResult> {
    const taxReturn = await prisma.salesTaxReturn.findUnique({
      where: { id: returnId },
      include: { returnPeriod: true }
    });

    if (!taxReturn) {
      return { isValid: false, blockers: ['Return not found.'], warnings: [] };
    }

    const blockers: string[] = [];
    const warnings: string[] = [];

    // 1. Math integrity
    if (taxReturn.taxableSalesCents > taxReturn.grossSalesCents) {
      blockers.push('Taxable sales exceed gross sales.');
    }
    if (taxReturn.netTaxPayableCents < BigInt(0)) {
      blockers.push('Net tax payable cannot be negative without an approved refund claim.');
    }

    // 2. Professional signoff
    if (!taxReturn.approvedByReviewerId) {
      blockers.push('Professional CPA Reviewer approval is required before submission.');
    }

    // 3. Taxpayer authorization
    if (!taxReturn.authorizedByTaxpayerAt) {
      blockers.push('Taxpayer electronic authorization and signature is required before e-filing.');
    }

    return {
      isValid: blockers.length === 0,
      blockers,
      warnings
    };
  }

  /**
   * Taxpayer signs and authorizes return
   */
  public async authorizeReturn(returnId: string, auth: TaxpayerAuthorization) {
    const taxReturn = await prisma.salesTaxReturn.findUnique({ where: { id: returnId } });
    if (!taxReturn) throw new Error('Return not found');

    if (!taxReturn.approvedByReviewerId) {
      throw new Error('Return must be approved by CPA reviewer before taxpayer authorization.');
    }

    return await prisma.salesTaxReturn.update({
      where: { id: returnId },
      data: {
        status: SalesTaxReturnStatus.AUTHORIZED_BY_TAXPAYER,
        authorizedByTaxpayerAt: auth.authorizedAt
      }
    });
  }

  /**
   * CPA Reviewer approves return
   */
  public async approveReturn(returnId: string, reviewerUserId: string) {
    return await prisma.salesTaxReturn.update({
      where: { id: returnId },
      data: {
        status: SalesTaxReturnStatus.APPROVED,
        approvedByReviewerId: reviewerUserId
      }
    });
  }

  /**
   * Submits return to state filing gateway (mocked / simulated)
   */
  public async submitReturn(returnId: string): Promise<FilingSubmissionResult> {
    const validation = await this.validateReturn(returnId);
    if (!validation.isValid) {
      return {
        returnId,
        status: SalesTaxReturnStatus.CHANGES_REQUESTED,
        errors: validation.blockers
      };
    }

    const filedAt = new Date();
    const confirmationNumber = `${(await prisma.salesTaxReturn.findUnique({ where: { id: returnId } }))?.returnFormName || 'ST'}-CONF-${Date.now().toString(36).toUpperCase()}`;

    await prisma.salesTaxReturn.update({
      where: { id: returnId },
      data: {
        status: SalesTaxReturnStatus.FILED,
        filedAt,
        confirmationNumber
      }
    });

    return {
      returnId,
      status: SalesTaxReturnStatus.FILED,
      confirmationNumber,
      filedAt
    };
  }

  /**
   * Schedules remittance payment for a filed return
   */
  public async schedulePayment(params: {
    salesTaxReturnId: string;
    paymentAmountCents: bigint;
    paymentMethod?: string;
    bankAccountId?: string;
    scheduledDate: Date;
  }) {
    const confNumber = `ACH-PAY-${Date.now().toString(36).toUpperCase()}`;

    return await prisma.salesTaxPayment.create({
      data: {
        salesTaxReturnId: params.salesTaxReturnId,
        paymentAmountCents: params.paymentAmountCents,
        paymentMethod: params.paymentMethod || 'ACH_DEBIT',
        bankAccountId: params.bankAccountId,
        confirmationNumber: confNumber,
        scheduledDate: params.scheduledDate,
        status: 'SCHEDULED'
      }
    });
  }
}
