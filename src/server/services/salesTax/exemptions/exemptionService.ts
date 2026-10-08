/**
 * Autonomous Tax OS — Sales Tax Exemption & Resale Certificate Service
 * 
 * Manages customer tax profiles, resale certificates, exemption documents,
 * and deterministic transaction exemption determinations.
 */

import { prisma } from '../../../db';
import { ExemptionCertificateStatus } from '@prisma/client';

export interface ExemptionValidationResult {
  isExempt: boolean;
  status: ExemptionCertificateStatus;
  certificateId?: string;
  certificateNumber?: string;
  reason: string;
}

export class ExemptionService {
  /**
   * Registers a customer exemption certificate
   */
  public async registerCertificate(params: {
    organizationId: string;
    customerId: string;
    stateCode: string;
    certificateNumber: string;
    certificateType?: 'RESALE' | 'DIRECT_PAY' | 'GOVERNMENT' | 'CHARITABLE' | 'MANUFACTURING';
    issuedDate: Date;
    expirationDate?: Date;
    documentId?: string;
    documentUri?: string;
    verifiedByReviewerId?: string;
  }) {
    const cert = await prisma.exemptionCertificate.create({
      data: {
        organizationId: params.organizationId,
        customerId: params.customerId,
        stateCode: params.stateCode.toUpperCase(),
        certificateNumber: params.certificateNumber,
        certificateType: params.certificateType || 'RESALE',
        issuedDate: params.issuedDate,
        expirationDate: params.expirationDate,
        status: params.verifiedByReviewerId ? ExemptionCertificateStatus.VALID : ExemptionCertificateStatus.PENDING_VERIFICATION,
        verifiedByReviewerId: params.verifiedByReviewerId,
        documentId: params.documentId,
        documentUri: params.documentUri
      }
    });

    // Update customer exemption flag
    await prisma.salesTaxCustomer.update({
      where: { id: params.customerId },
      data: {
        isExempt: true,
        exemptionType: params.certificateType || 'RESALE'
      }
    });

    return cert;
  }

  /**
   * Validates if customer is exempt for a specific destination state and transaction date
   */
  public async validateExemption(
    customerId: string,
    stateCode: string,
    transactionDate: Date = new Date()
  ): Promise<ExemptionValidationResult> {
    const customer = await prisma.salesTaxCustomer.findUnique({
      where: { id: customerId },
      include: {
        exemptionCertificates: {
          where: {
            stateCode: stateCode.toUpperCase()
          }
        }
      }
    });

    if (!customer) {
      return {
        isExempt: false,
        status: ExemptionCertificateStatus.REJECTED,
        reason: 'Customer not found.'
      };
    }

    if (customer.customerType === 'GOVERNMENT') {
      return {
        isExempt: true,
        status: ExemptionCertificateStatus.VALID,
        reason: 'Statutory exemption: Federal/State Government Entity.'
      };
    }

    const cert = customer.exemptionCertificates[0];
    if (!cert) {
      return {
        isExempt: false,
        status: ExemptionCertificateStatus.REJECTED,
        reason: `No exemption certificate on file for state ${stateCode}.`
      };
    }

    // Check expiration date
    if (cert.expirationDate && cert.expirationDate < transactionDate) {
      return {
        isExempt: false,
        status: ExemptionCertificateStatus.EXPIRED,
        certificateId: cert.id,
        certificateNumber: cert.certificateNumber,
        reason: `Exemption certificate ${cert.certificateNumber} expired on ${cert.expirationDate.toISOString().slice(0, 10)}.`
      };
    }

    if (cert.status !== ExemptionCertificateStatus.VALID) {
      return {
        isExempt: false,
        status: cert.status,
        certificateId: cert.id,
        certificateNumber: cert.certificateNumber,
        reason: `Exemption certificate ${cert.certificateNumber} is currently ${cert.status}. CPA verification required.`
      };
    }

    return {
      isExempt: true,
      status: ExemptionCertificateStatus.VALID,
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      reason: `Verified ${cert.certificateType} certificate on file.`
    };
  }

  /**
   * Reviewer approves or verifies an exemption certificate
   */
  public async verifyCertificate(certificateId: string, reviewerUserId: string) {
    return await prisma.exemptionCertificate.update({
      where: { id: certificateId },
      data: {
        status: ExemptionCertificateStatus.VALID,
        verifiedByReviewerId: reviewerUserId
      }
    });
  }
}
