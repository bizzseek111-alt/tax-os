/**
 * Autonomous Tax OS — Return Versioning & Immutable Snapshot Service
 * 
 * Guarantees provenance and immutability for tax filings:
 * - Creates cryptographically hashed ReturnVersion snapshots (SHA-256)
 * - Binds calculations, facts, rules, and reviews into a single frozen artifact
 * - Automatically invalidates signatures if underlying tax positions or facts change
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import { ReturnVersion, SignatureStatus, FilingStatus, UserRole } from '@prisma/client';
import { AuditEventService } from '../../audit';

export class ReturnVersionService {
  /**
   * Computes deterministic canonical SHA-256 hash for a return snapshot.
   */
  public static computeSnapshotHash(payload: {
    taxCaseId: string;
    taxYear: number;
    jurisdictions: string[];
    forms: string[];
    calculationRunIds: string[];
    ruleSetVersions: string[];
    factsSnapshot: any;
    positionsSnapshot?: any;
    reviewVersion: string;
  }): string {
    const canonicalPayload = JSON.stringify({
      taxCaseId: payload.taxCaseId,
      taxYear: payload.taxYear,
      jurisdictions: [...payload.jurisdictions].sort(),
      forms: [...payload.forms].sort(),
      calculationRunIds: [...payload.calculationRunIds].sort(),
      ruleSetVersions: [...payload.ruleSetVersions].sort(),
      factsSnapshot: payload.factsSnapshot,
      positionsSnapshot: payload.positionsSnapshot || null,
      reviewVersion: payload.reviewVersion
    });

    return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  }

  /**
   * Freezes and creates an immutable ReturnVersion.
   */
  public static async createReturnVersion(params: {
    taxCaseId: string;
    taxYear: number;
    jurisdictions: string[];
    forms: string[];
    calculationRunIds: string[];
    ruleSetVersions: string[];
    factsSnapshot: Record<string, any>;
    positionsSnapshot?: Record<string, any>;
    reviewVersion?: string;
    packagePayload?: any;
    xmlPayload?: string;
    pdfDocumentId?: string;
    actorUserId?: string;
  }): Promise<ReturnVersion> {
    const reviewVersion = params.reviewVersion || '1.0';

    // 1. Determine next version number for this case
    const latestVersion = await prisma.returnVersion.findFirst({
      where: { taxCaseId: params.taxCaseId },
      orderBy: { versionNumber: 'desc' }
    });
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // 2. Compute canonical cryptographic hash
    const hash = this.computeSnapshotHash({
      taxCaseId: params.taxCaseId,
      taxYear: params.taxYear,
      jurisdictions: params.jurisdictions,
      forms: params.forms,
      calculationRunIds: params.calculationRunIds,
      ruleSetVersions: params.ruleSetVersions,
      factsSnapshot: params.factsSnapshot,
      positionsSnapshot: params.positionsSnapshot,
      reviewVersion
    });

    // 3. Persist immutable ReturnVersion
    const returnVersion = await prisma.returnVersion.create({
      data: {
        taxCaseId: params.taxCaseId,
        versionNumber: nextVersionNumber,
        taxYear: params.taxYear,
        jurisdictions: params.jurisdictions,
        forms: params.forms,
        calculationRunIds: params.calculationRunIds,
        ruleSetVersions: params.ruleSetVersions,
        factsSnapshot: params.factsSnapshot,
        positionsSnapshot: params.positionsSnapshot,
        reviewVersion,
        hash,
        packagePayload: params.packagePayload,
        xmlPayload: params.xmlPayload,
        pdfDocumentId: params.pdfDocumentId,
        filingStatus: FilingStatus.DRAFT
      }
    });

    // 4. Log immutable audit event
    const taxCase = await prisma.taxCase.findUnique({ where: { id: params.taxCaseId } });
    if (taxCase) {
      await AuditEventService.recordEvent({
        organizationId: taxCase.organizationId,
        actorId: params.actorUserId || taxCase.ownerId,
        actorRole: UserRole.SUPER_ADMIN,
        actorType: 'SYSTEM',
        taxCaseId: taxCase.id,
        action: 'CREATE_RETURN_VERSION',
        objectType: 'ReturnVersion',
        objectId: returnVersion.id,
        newValue: { versionNumber: nextVersionNumber, hash, forms: params.forms }
      });
    }

    return returnVersion;
  }

  /**
   * Retrieves the current active or latest ReturnVersion for a TaxCase.
   */
  public static async getLatestReturnVersion(taxCaseId: string): Promise<ReturnVersion | null> {
    return prisma.returnVersion.findFirst({
      where: { taxCaseId },
      orderBy: { versionNumber: 'desc' }
    });
  }

  /**
   * Verifies if a ReturnVersion's payload is authentic and untampered.
   */
  public static verifyVersionIntegrity(returnVersion: ReturnVersion): boolean {
    const computed = this.computeSnapshotHash({
      taxCaseId: returnVersion.taxCaseId,
      taxYear: returnVersion.taxYear,
      jurisdictions: returnVersion.jurisdictions,
      forms: returnVersion.forms,
      calculationRunIds: returnVersion.calculationRunIds,
      ruleSetVersions: returnVersion.ruleSetVersions,
      factsSnapshot: returnVersion.factsSnapshot,
      positionsSnapshot: returnVersion.positionsSnapshot,
      reviewVersion: returnVersion.reviewVersion
    });
    return computed === returnVersion.hash;
  }

  /**
   * Invalidates active signature requests when underlying facts or calculations mutate.
   */
  public static async invalidatePriorSignatures(taxCaseId: string, reason: string): Promise<{
    invalidatedRequestsCount: number;
  }> {
    const activeRequests = await prisma.signatureRequest.findMany({
      where: {
        returnVersion: { taxCaseId },
        status: { in: [SignatureStatus.PENDING, SignatureStatus.VIEWED, SignatureStatus.SIGNED] }
      }
    });

    for (const req of activeRequests) {
      await prisma.signatureRequest.update({
        where: { id: req.id },
        data: { status: SignatureStatus.INVALIDATED }
      });

      await prisma.signatureEvent.create({
        data: {
          signatureRequestId: req.id,
          eventType: 'INVALIDATED',
          metadata: { reason, invalidatedAt: new Date().toISOString() }
        }
      });
    }

    // Reset isSigned on latest version
    await prisma.returnVersion.updateMany({
      where: { taxCaseId },
      data: { isSigned: false }
    });

    return { invalidatedRequestsCount: activeRequests.length };
  }
}
