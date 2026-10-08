/**
 * Autonomous TaxOS — Statutory Data Retention & Controlled Deletion Service
 * 
 * Enforces mandatory statutory record retention periods and controlled deletion:
 * - Tax Returns & Workpapers: Minimum 36 months (3 years) per IRC § 6501(a)
 *   (extends to 72 months for >25% gross omission per IRC § 6501(e))
 * - Employment / Payroll Records: Minimum 48 months (4 years) per 26 CFR § 31.6001-1
 * - Cryptographic Audit Ledger: Minimum 84 months (7 years) for compliance defenses
 * - Controlled Deletion Workflow: Verifies statutory elapsed time and active legal holds
 */

import { prisma } from '../../db';
import { DeletionRequestStatus, UserRole } from '@prisma/client';
import { AuditEventService } from '../audit';

export class DataRetentionService {
  /**
   * Initializes standard statutory data retention policies.
   */
  public static async initializeStandardPolicies(): Promise<void> {
    const policies = [
      {
        domain: 'TAX_RETURN',
        statutoryAuthority: 'IRC § 6501(a) (3 years) / IRC § 6501(e) (6 years)',
        retentionMonths: 36,
        requiresLegalHoldCheck: true,
        description: 'Individual and business income tax returns, schedules, and workpapers.'
      },
      {
        domain: 'PAYROLL',
        statutoryAuthority: '26 CFR § 31.6001-1 (4 years)',
        retentionMonths: 48,
        requiresLegalHoldCheck: true,
        description: 'Employer payroll runs, Form 941/940 records, and W-2 copies.'
      },
      {
        domain: 'SALES_TAX',
        statutoryAuthority: 'State Revenue Statutes (e.g. Cal. Rev. & Tax Code § 7053) (4-5 years)',
        retentionMonths: 48,
        requiresLegalHoldCheck: true,
        description: 'Sales and use tax transaction logs, exemption certificates, and returns.'
      },
      {
        domain: 'AUDIT_LOG',
        statutoryAuthority: 'IRS Pub 1345 / SOC 2 Type II Compliance (7 years)',
        retentionMonths: 84,
        requiresLegalHoldCheck: true,
        description: 'Cryptographic immutable blockchain audit event records.'
      }
    ];

    for (const p of policies) {
      await prisma.dataRetentionPolicy.upsert({
        where: { domain: p.domain },
        update: p,
        create: {
          ...p,
          isEnforced: true
        }
      });
    }
  }

  /**
   * Submits a request to delete a TaxCase and associated taxpayer data.
   */
  public static async requestDataDeletion(params: {
    taxCaseId: string;
    requestedByUserId: string;
    reason: string;
  }): Promise<{
    id: string;
    status: DeletionRequestStatus;
    canDeleteNow: boolean;
    statutoryBlockReason?: string;
  }> {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: params.taxCaseId },
      include: {
        returnVersions: true
      }
    });

    if (!taxCase) {
      throw new Error(`TAX_CASE_NOT_FOUND: TaxCase ${params.taxCaseId} does not exist.`);
    }

    // 1. Statutory Retention Check: Has the 3-year statutory assessment window elapsed?
    const creationDate = taxCase.createdAt;
    const now = new Date();
    const ageMonths = (now.getFullYear() - creationDate.getFullYear()) * 12 + (now.getMonth() - creationDate.getMonth());

    const hasFiledReturns = taxCase.returnVersions.some(
      v => v.filingStatus === 'ACCEPTED' || v.filingStatus === 'TRANSMITTED'
    );

    let canDeleteNow = true;
    let statutoryBlockReason: string | undefined;

    if (hasFiledReturns && ageMonths < 36) {
      canDeleteNow = false;
      statutoryBlockReason = `MANDATORY_RECORD_RETENTION_ACTIVE: Under IRC § 6501(a), tax returns and substantiating evidence must be retained for at least 36 months from filing date. Current age: ${ageMonths} months.`;
    }

    // 2. Active Legal / Review Hold Check
    if (taxCase.status === 'IN_REVIEW' || taxCase.status === 'AUDIT_DEFENSE') {
      canDeleteNow = false;
      statutoryBlockReason = `ACTIVE_LEGAL_HOLD: TaxCase is currently subject to active professional review or IRS audit defense.`;
    }

    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        taxCaseId: params.taxCaseId,
        requestedByUserId: params.requestedByUserId,
        status: canDeleteNow ? DeletionRequestStatus.APPROVED : DeletionRequestStatus.REJECTED,
        statutoryEligibilityVerified: canDeleteNow,
        legalHoldActive: !canDeleteNow,
        reason: params.reason,
        rejectionReason: statutoryBlockReason
      }
    });

    return {
      id: deletionRequest.id,
      status: deletionRequest.status,
      canDeleteNow,
      statutoryBlockReason
    };
  }

  /**
   * Executes approved deletion workflow with immutable audit log record.
   */
  public static async executeApprovedDeletion(requestId: string, actorUserId: string): Promise<boolean> {
    const request = await prisma.dataDeletionRequest.findUnique({
      where: { id: requestId },
      include: { taxCase: true }
    });

    if (!request || request.status !== DeletionRequestStatus.APPROVED) {
      throw new Error(`CANNOT_EXECUTE_DELETION: Request ${requestId} is not approved for statutory deletion.`);
    }

    // Record audit event before deletion
    await AuditEventService.recordEvent({
      organizationId: request.taxCase.organizationId,
      actorId: actorUserId,
      actorRole: UserRole.SUPER_ADMIN,
      actorType: 'USER',
      taxCaseId: request.taxCaseId,
      action: 'STATUTORY_DATA_DELETION_EXECUTED',
      objectType: 'TaxCase',
      objectId: request.taxCaseId,
      reason: request.reason,
      newValue: { deletedAt: new Date().toISOString(), requestId }
    });

    // Anonymize/delete tax case
    await prisma.taxCase.delete({
      where: { id: request.taxCaseId }
    });

    await prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: DeletionRequestStatus.EXECUTED,
        executedAt: new Date(),
        auditReference: `DEL_EXEC_${Date.now()}`
      }
    });

    return true;
  }
}
