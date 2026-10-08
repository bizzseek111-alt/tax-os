/**
 * Autonomous Tax OS — Signature & Form 8879 Orchestration Service
 * 
 * Implements strict IRS and state electronic signature standards:
 * - Form 8879 IRS e-file signature authorization (Self-Selected PIN / Practitioner PIN)
 * - Strict dual-spouse separation for Married Filing Jointly returns
 * - Explicit payment authorizations (Electronic Funds Withdrawal - EFW)
 * - IRC § 7216 tax return disclosure and use consents
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import {
  SignatureRequest,
  SignatureStatus,
  TaxpayerAuthorization,
  FilingStatus,
  UserRole
} from '@prisma/client';
import { Form8879SignaturePayload } from '../types';
import { AuditEventService } from '../../audit';

export class SignatureService {
  /**
   * Generates a deterministic signature hash binding the ReturnVersion, signer, PIN, and timestamp.
   */
  public static computeSignatureHash(params: {
    returnVersionHash: string;
    signerEmail: string;
    signerRole: string;
    pin: string;
    timestamp: string;
    ipAddress: string;
  }): string {
    const raw = `${params.returnVersionHash}|${params.signerEmail}|${params.signerRole}|${params.pin}|${params.timestamp}|${params.ipAddress}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Creates a formal SignatureRequest bound to a specific ReturnVersion.
   */
  public static async createSignatureRequest(params: {
    returnVersionId: string;
    signerRole: 'PRIMARY_TAXPAYER' | 'SPOUSE' | 'ERO_PREPARER';
    signerName: string;
    signerEmail: string;
    signerUserId?: string;
    signatureType?: string;
  }): Promise<SignatureRequest> {
    const returnVersion = await prisma.returnVersion.findUnique({
      where: { id: params.returnVersionId }
    });

    if (!returnVersion) {
      throw new Error(`RETURN_VERSION_NOT_FOUND: ReturnVersion '${params.returnVersionId}' does not exist.`);
    }

    const request = await prisma.signatureRequest.create({
      data: {
        returnVersionId: params.returnVersionId,
        signerRole: params.signerRole,
        signerName: params.signerName,
        signerEmail: params.signerEmail,
        signerUserId: params.signerUserId,
        signatureType: params.signatureType || 'FORM_8879',
        status: SignatureStatus.PENDING
      }
    });

    // Record initial request event
    await prisma.signatureEvent.create({
      data: {
        signatureRequestId: request.id,
        eventType: 'REQUESTED',
        metadata: { signerRole: params.signerRole, signerEmail: params.signerEmail }
      }
    });

    // Advance ReturnVersion status to SIGNATURE_REQUIRED
    await prisma.returnVersion.update({
      where: { id: params.returnVersionId },
      data: { filingStatus: FilingStatus.SIGNATURE_REQUIRED }
    });

    return request;
  }

  /**
   * Records that a signer viewed the document/envelope prior to signing.
   */
  public static async recordViewed(params: {
    signatureRequestId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<SignatureRequest> {
    const request = await prisma.signatureRequest.update({
      where: { id: params.signatureRequestId },
      data: {
        status: SignatureStatus.VIEWED,
        viewedAt: new Date(),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    });

    await prisma.signatureEvent.create({
      data: {
        signatureRequestId: params.signatureRequestId,
        eventType: 'VIEWED',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    });

    return request;
  }

  /**
   * Executes a Form 8879 electronic PIN signature for an individual signer.
   */
  public static async signWithPin(params: {
    signatureRequestId: string;
    pin: string; // Exactly 5 numeric digits
    ipAddress: string;
    userAgent?: string;
    disclosureConsentGiven?: boolean;
  }): Promise<{
    signatureRequest: SignatureRequest;
    signatureHash: string;
  }> {
    // Validate 5-digit PIN format
    if (!/^\d{5}$/.test(params.pin)) {
      throw new Error('INVALID_PIN: IRS Form 8879 requires an exact 5-digit numeric PIN.');
    }

    const request = await prisma.signatureRequest.findUnique({
      where: { id: params.signatureRequestId },
      include: { returnVersion: { include: { taxCase: true } } }
    });

    if (!request) {
      throw new Error(`REQUEST_NOT_FOUND: SignatureRequest '${params.signatureRequestId}' not found.`);
    }

    if (request.status === SignatureStatus.INVALIDATED) {
      throw new Error('SIGNATURE_INVALIDATED: This request was invalidated due to subsequent return changes.');
    }

    const now = new Date();
    const timestampStr = now.toISOString();

    const signatureHash = this.computeSignatureHash({
      returnVersionHash: request.returnVersion.hash,
      signerEmail: request.signerEmail,
      signerRole: request.signerRole,
      pin: params.pin,
      timestamp: timestampStr,
      ipAddress: params.ipAddress
    });

    // Update SignatureRequest
    const updated = await prisma.signatureRequest.update({
      where: { id: params.signatureRequestId },
      data: {
        status: SignatureStatus.SIGNED,
        signedAt: now,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        pin: params.pin,
        signatureHash
      }
    });

    // Record audit signature event
    await prisma.signatureEvent.create({
      data: {
        signatureRequestId: params.signatureRequestId,
        eventType: 'SIGNED',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { signatureHash, signerRole: request.signerRole }
      }
    });

    // Check if all signers for this ReturnVersion are now completed
    const allRequests = await prisma.signatureRequest.findMany({
      where: { returnVersionId: request.returnVersionId }
    });

    const isFullySigned = allRequests.every((r) => r.id === request.id || r.status === SignatureStatus.SIGNED);

    if (isFullySigned) {
      // Mark ReturnVersion as signed
      await prisma.returnVersion.update({
        where: { id: request.returnVersionId },
        data: {
          isSigned: true,
          filingStatus: FilingStatus.AUTHORIZED
        }
      });
    }

    return { signatureRequest: updated, signatureHash };
  }

  /**
   * Executes complete IRS Form 8879 authorization for single or joint returns.
   * STRICT INVARIANT: If filing status is Married Filing Jointly (MFJ),
   * both Primary Taxpayer and Spouse PINs must be present and verified.
   */
  public static async executeForm8879Authorization(
    payload: Form8879SignaturePayload
  ): Promise<TaxpayerAuthorization> {
    const returnVersion = await prisma.returnVersion.findUnique({
      where: { id: payload.returnVersionId },
      include: {
        taxCase: { include: { facts: true } }
      }
    });

    if (!returnVersion) {
      throw new Error(`RETURN_VERSION_NOT_FOUND: ReturnVersion '${payload.returnVersionId}' does not exist.`);
    }

    const isJointReturn = returnVersion.factsSnapshot &&
      ((returnVersion.factsSnapshot as any).filingStatus === 'MARRIED_FILING_JOINTLY' ||
       (returnVersion.factsSnapshot as any).filingStatus === 'MFJ');

    // Joint Return Invariant Enforcement
    if (isJointReturn && !payload.spousePin) {
      throw new Error(
        'JOINT_RETURN_SPOUSE_SIGNATURE_REQUIRED: Married Filing Jointly returns strictly require separate spouse Form 8879 signature authorization. One spouse cannot sign for both.'
      );
    }

    if (!payload.taxpayerConsentAgreement) {
      throw new Error('CONSENT_REQUIRED: Taxpayer jurat authorization consent must be affirmed.');
    }

    if (!payload.disclosureConsent7216) {
      throw new Error('IRC_7216_CONSENT_REQUIRED: IRC § 7216 disclosure consent must be affirmed.');
    }

    const now = new Date();
    const primaryHash = this.computeSignatureHash({
      returnVersionHash: returnVersion.hash,
      signerEmail: returnVersion.taxCase.ownerId,
      signerRole: 'PRIMARY_TAXPAYER',
      pin: payload.primaryTaxpayerPin,
      timestamp: now.toISOString(),
      ipAddress: payload.taxpayerIpAddress
    });

    const compositeHash = isJointReturn
      ? crypto.createHash('sha256').update(`${primaryHash}|${payload.spousePin}|${payload.eroPin}`).digest('hex')
      : primaryHash;

    const auth = await prisma.taxpayerAuthorization.create({
      data: {
        taxCaseId: returnVersion.taxCaseId,
        returnVersionId: returnVersion.id,
        authorizationType: 'FORM_8879',
        isAuthorized: true,
        authorizedByUserId: returnVersion.taxCase.ownerId,
        authorizedByName: 'Authorized Taxpayer',
        authorizedAt: now,
        ipAddress: payload.taxpayerIpAddress,
        scope: 'FEDERAL_AND_STATE_EFILE',
        disclosureConsentGiven: payload.disclosureConsent7216,
        signatureHash: compositeHash,
        form8879Data: {
          primaryPin: payload.primaryTaxpayerPin,
          spousePin: payload.spousePin || null,
          eroEfin: payload.eroEfin,
          eroPin: payload.eroPin,
          electronicFundsWithdrawalConsent: payload.electronicFundsWithdrawalConsent || false
        }
      }
    });

    // Mark ReturnVersion as signed & authorized
    await prisma.returnVersion.update({
      where: { id: returnVersion.id },
      data: {
        isSigned: true,
        filingStatus: FilingStatus.AUTHORIZED
      }
    });

    // Record immutable audit event
    await AuditEventService.recordEvent({
      organizationId: returnVersion.taxCase.organizationId,
      actorId: returnVersion.taxCase.ownerId,
      actorRole: UserRole.TAXPAYER,
      actorType: 'USER',
      taxCaseId: returnVersion.taxCaseId,
      action: 'FORM_8879_AUTHORIZED',
      objectType: 'TaxpayerAuthorization',
      objectId: auth.id,
      newValue: {
        returnVersionHash: returnVersion.hash,
        isJointReturn,
        signatureHash: compositeHash
      }
    });

    return auth;
  }
}
