/**
 * Autonomous Tax OS — Filing Payments, Bank Security & Refund Tracking Service
 * 
 * Manages Electronic Funds Withdrawal (EFW), direct deposit refunds, and estimated payments:
 * - Bank routing and account numbers masked by default (XXXX0123, XXXXX6789)
 * - Explicit payment authorization required before any fund debits
 * - Zero fabricated refund promises (clear agency tracking instructions)
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import { FilingPayment, UserRole } from '@prisma/client';
import { AuditEventService } from '../../audit';

export class FilingPaymentService {
  /**
   * Masks sensitive bank routing transit number to last 4 digits only.
   */
  public static maskRoutingNumber(routing: string): string {
    const clean = routing.replace(/\D/g, '');
    const last4 = clean.slice(-4).padStart(4, '0');
    return `XXXX${last4}`;
  }

  /**
   * Masks sensitive bank account number to last 4 digits only.
   */
  public static maskAccountNumber(account: string): string {
    const clean = account.replace(/\D/g, '');
    const last4 = clean.slice(-4).padStart(4, '0');
    return `XXXXX${last4}`;
  }

  /**
   * Authorizes an electronic tax payment (e.g. Electronic Funds Withdrawal).
   * STRICT INVARIANT: Requires explicit customer authorization with explicit account coordinates.
   */
  public static async authorizePayment(params: {
    taxCaseId: string;
    submissionId?: string;
    jurisdiction: string;
    amountCents: bigint;
    routingNumber: string;
    accountNumber: string;
    accountType?: 'CHECKING' | 'SAVINGS';
    scheduledDate?: Date;
    actorUserId: string;
    explicitPaymentConsent: boolean;
  }): Promise<FilingPayment> {
    if (!params.explicitPaymentConsent) {
      throw new Error(
        'EXPLICIT_PAYMENT_AUTHORIZATION_REQUIRED: Bank accounts cannot be debited without explicit taxpayer electronic payment consent.'
      );
    }

    if (!/^\d{9}$/.test(params.routingNumber.replace(/\D/g, ''))) {
      throw new Error('INVALID_ROUTING_NUMBER: US Bank routing numbers must be exactly 9 digits.');
    }

    const bankRoutingMasked = this.maskRoutingNumber(params.routingNumber);
    const bankAccountMasked = this.maskAccountNumber(params.accountNumber);

    // Mock encryption for secure storage
    const bankRoutingEncrypted = `enc_rtn_${crypto.createHash('sha256').update(params.routingNumber).digest('hex').slice(0, 16)}`;
    const bankAccountEncrypted = `enc_acct_${crypto.createHash('sha256').update(params.accountNumber).digest('hex').slice(0, 16)}`;

    const payment = await prisma.filingPayment.create({
      data: {
        taxCaseId: params.taxCaseId,
        submissionId: params.submissionId,
        jurisdiction: params.jurisdiction,
        paymentType: 'DIRECT_DEBIT_EFW',
        amountCents: params.amountCents,
        bankRoutingMasked,
        bankAccountMasked,
        bankAccountType: params.accountType || 'CHECKING',
        bankRoutingEncrypted,
        bankAccountEncrypted,
        scheduledDebitDate: params.scheduledDate || new Date(),
        isAuthorized: true,
        status: 'AUTHORIZED',
        confirmationNumber: `EFW_CONF_${Date.now()}_${Math.floor(Math.random() * 100000)}`
      }
    });

    const taxCase = await prisma.taxCase.findUnique({ where: { id: params.taxCaseId } });
    if (taxCase) {
      await AuditEventService.recordEvent({
        organizationId: taxCase.organizationId,
        actorId: params.actorUserId,
        actorRole: UserRole.TAXPAYER,
        actorType: 'USER',
        taxCaseId: params.taxCaseId,
        action: 'AUTHORIZE_FILING_PAYMENT',
        objectType: 'FilingPayment',
        objectId: payment.id,
        newValue: {
          amountCents: params.amountCents.toString(),
          bankRoutingMasked,
          bankAccountMasked,
          jurisdiction: params.jurisdiction
        }
      });
    }

    return payment;
  }

  /**
   * Returns current refund status and transparent agency tracker links.
   * STRICT INVARIANT: Does not fabricate or promise refund timing.
   */
  public static getRefundTrackingInfo(params: {
    taxYear: number;
    expectedRefundCents: bigint;
    filingStatus: string;
    submittedAt?: Date;
  }): {
    expectedAmountCents: bigint;
    agencyStatus: string;
    estimatedTimingText: string;
    irsWhereIsMyRefundUrl: string;
    stateTrackers: Record<string, string>;
  } {
    return {
      expectedAmountCents: params.expectedRefundCents,
      agencyStatus: params.filingStatus === 'ACCEPTED' ? 'ACCEPTED_BY_IRS_PROCESSING' : 'PENDING_TRANSMISSION',
      estimatedTimingText:
        'The IRS typically issues most refunds within 21 calendar days of electronic acceptance. Actual timing varies depending on IRS fraud filters and review queues.',
      irsWhereIsMyRefundUrl: 'https://www.irs.gov/refunds',
      stateTrackers: {
        'US-CA': 'https://www.ftb.ca.gov/refund/index.asp',
        'US-NY': 'https://www.tax.ny.gov/pit/file/refund.htm',
        'US-NJ': 'https://www.nj.gov/treasury/taxation/checkrefundstatus.shtml',
        'US-IL': 'https://mytax.illinois.gov/_/',
        'US-MA': 'https://mtc.dor.state.ma.us/mtc/_/'
      }
    };
  }
}
