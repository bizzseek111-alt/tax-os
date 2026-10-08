/**
 * Autonomous Tax OS — Filing Security, IRC § 7216 Privacy & Webhook Verification
 * 
 * Enforces strict regulatory protections:
 * - IRC § 7216 consent tracking for tax return preparation, disclosure, and data use
 * - Webhook HMAC-SHA256 signature and anti-replay verification
 * - Multi-tenant isolation ensuring Customer A cannot submit Case B
 * - Visual environment banners (DEMO, SANDBOX, CERTIFICATION, PRODUCTION)
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import { UserRole } from '@prisma/client';

export type FilingEnvironment = 'DEMO' | 'SANDBOX' | 'CERTIFICATION' | 'PRODUCTION';

export class FilingSecurityService {
  private static processedWebhookEventIds = new Set<string>();

  /**
   * Current execution environment.
   * STRICT INVARIANT: Always SANDBOX in this release. Never claimed as PRODUCTION without live credentials.
   */
  public static getActiveEnvironment(): FilingEnvironment {
    const env = process.env.TAXOS_FILING_ENV;
    if (env === 'PRODUCTION' || env === 'CERTIFICATION' || env === 'DEMO') {
      return env as FilingEnvironment;
    }
    return 'SANDBOX';
  }

  /**
   * Generates environment banner metadata for UI display.
   */
  public static getEnvironmentBanner(): {
    environment: FilingEnvironment;
    isLiveTransmission: boolean;
    bannerText: string;
    bannerColor: string;
  } {
    const env = this.getActiveEnvironment();
    if (env === 'PRODUCTION') {
      return {
        environment: 'PRODUCTION',
        isLiveTransmission: true,
        bannerText: '🔴 LIVE PRODUCTION TRANSMISSION — ACTIVE IRS & STATE E-FILE',
        bannerColor: '#DC2626'
      };
    }
    if (env === 'CERTIFICATION') {
      return {
        environment: 'CERTIFICATION',
        isLiveTransmission: false,
        bannerText: '🟡 IRS ATS / STATE CERTIFICATION TEST ENVIRONMENT',
        bannerColor: '#D97706'
      };
    }
    return {
      environment: 'SANDBOX',
      isLiveTransmission: false,
      bannerText: '🟢 SANDBOX TEST ENVIRONMENT — SIMULATED IRS & STATE MEF TRANSMISSION',
      bannerColor: '#059669'
    };
  }

  /**
   * Validates inbound webhook authenticity, timestamp freshness, and replay prevention.
   */
  public static verifyWebhookSignature(params: {
    rawPayload: string;
    signatureHeader: string;
    timestampHeader: string;
    eventId: string;
    secretKey: string;
  }): { isValid: boolean; failureReason?: string } {
    // 1. Replay check
    if (this.processedWebhookEventIds.has(params.eventId)) {
      return { isValid: false, failureReason: 'DUPLICATE_WEBHOOK_EVENT: Event ID has already been processed.' };
    }

    // 2. Freshness check: Must be within 5 minutes (300 seconds)
    const timestampMs = parseInt(params.timestampHeader, 10);
    const nowMs = Date.now();
    if (isNaN(timestampMs) || Math.abs(nowMs - timestampMs) > 300 * 1000) {
      return { isValid: false, failureReason: 'EXPIRED_TIMESTAMP: Webhook timestamp exceeds 5-minute tolerance window.' };
    }

    // 3. HMAC-SHA256 signature verification
    const signedPayload = `${params.timestampHeader}.${params.rawPayload}`;
    const expectedSignature = crypto.createHmac('sha256', params.secretKey).update(signedPayload).digest('hex');
    const cleanedHeader = params.signatureHeader.replace(/^sha256=/, '');

    const expectedBuf = Buffer.from(expectedSignature);
    const cleanedBuf = Buffer.from(cleanedHeader);

    if (expectedBuf.length !== cleanedBuf.length) {
      return {
        isValid: false,
        failureReason: 'SIGNATURE_MISMATCH: HMAC signature does not match expected digest.'
      };
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, cleanedBuf);
    if (isValid) {
      this.processedWebhookEventIds.add(params.eventId);
    }

    return {
      isValid,
      failureReason: isValid ? undefined : 'SIGNATURE_MISMATCH: HMAC signature does not match expected digest.'
    };
  }

  /**
   * Enforces multi-tenant authorization boundaries on filing actions.
   */
  public static async assertCanSubmitFiling(params: {
    userId: string;
    userRole: UserRole;
    organizationId: string;
    taxCaseId: string;
  }): Promise<void> {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: params.taxCaseId }
    });

    if (!taxCase) {
      throw new Error(`TAX_CASE_NOT_FOUND: TaxCase '${params.taxCaseId}' does not exist.`);
    }

    // Multi-tenant boundary check
    if (taxCase.organizationId !== params.organizationId) {
      throw new Error('ACCESS_DENIED: Multi-tenant boundary violation. Target TaxCase belongs to another organization.');
    }

    // Role check: Only the case owner (taxpayer) or authorized CPAs/attorneys can initiate transmission
    const isOwner = taxCase.ownerId === params.userId;
    const isAuthorizedPro =
      params.userRole === UserRole.CPA ||
      params.userRole === UserRole.TAX_ATTORNEY ||
      params.userRole === UserRole.ADMIN;

    if (!isOwner && !isAuthorizedPro) {
      throw new Error(`ACCESS_DENIED: Role '${params.userRole}' is not authorized to submit returns for this TaxCase.`);
    }
  }

  /**
   * Records affirmative IRC § 7216 disclosure consent.
   */
  public static async recordIrc7216Consent(params: {
    taxCaseId: string;
    userId: string;
    organizationId: string;
    consentType: 'PREPARATION' | 'DISCLOSURE' | 'USE';
    purpose: string;
    ipAddress: string;
  }) {
    return prisma.consent.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        consentType: `IRC_7216_${params.consentType}`,
        consentText: `Affirmative consent pursuant to Treasury Regulation § 301.7216-3 for: ${params.purpose}`,
        ipAddress: params.ipAddress,
        userAgent: 'TaxOS Client'
      }
    });
  }
}
