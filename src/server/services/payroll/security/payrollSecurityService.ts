/**
 * Autonomous Tax OS — Payroll Security & PII Isolation Service
 * 
 * Enforces strict field-level protection, role boundaries, and time-limited PAM:
 * - Full SSNs masked by default (***-**-1234)
 * - Privileged PII Access Grants expire automatically after 15 minutes
 * - Sales Tax Reviewers and Customer Support strictly blocked from payroll PII
 * - Full audit ledger recording on every unmask action
 */

import { prisma } from '../../../db';
import { UserRole } from '@prisma/client';
import { AuditEventService } from '../../audit';

export class PayrollSecurityService {
  /**
   * Masks sensitive employee SSN to last 4 digits only.
   */
  public static maskSsn(fullSsnOrLast4: string): string {
    const clean = fullSsnOrLast4.replace(/\D/g, '');
    const last4 = clean.slice(-4).padStart(4, '0');
    return `***-**-${last4}`;
  }

  /**
   * Masks sensitive employer EIN to last 4 digits only (**-***1234).
   */
  public static maskEin(fullEinOrLast4: string): string {
    const clean = fullEinOrLast4.replace(/\D/g, '');
    const last4 = clean.slice(-4).padStart(4, '0');
    return `**-***${last4}`;
  }

  /**
   * Evaluates whether a user role can access the payroll domain.
   */
  public static canAccessPayrollDomain(userRole: UserRole): boolean {
    const barredRoles: UserRole[] = [
      UserRole.SALES_TAX_REVIEWER,
      UserRole.CUSTOMER_SUPPORT,
      UserRole.VIEWER
    ];
    return !barredRoles.includes(userRole);
  }

  /**
   * Evaluates whether a user is authorized to view payroll PII.
   */
  public static assertPayrollAccessAuthorized(userRole: UserRole): void {
    if (!this.canAccessPayrollDomain(userRole)) {
      throw new Error(
        `PAYROLL_ACCESS_DENIED: Role '${userRole}' is strictly prohibited from accessing employee payroll PII or compensation records.`
      );
    }
  }

  /**
   * Verifies whether an active, unexpired 15-minute privileged PAM grant exists.
   */
  public static async verifyPrivilegedAccess(params: string | {
    grantToken?: string;
    userId?: string;
    targetEmployeeId?: string;
    organizationId?: string;
  }): Promise<{ isAuthorized: boolean; isValid: boolean; remainingSeconds: number }> {
    let grant = null;

    if (typeof params === 'string') {
      grant = await prisma.privilegedPiiAccessGrant.findUnique({
        where: { id: params }
      });
    } else if (params.grantToken) {
      grant = await prisma.privilegedPiiAccessGrant.findUnique({
        where: { id: params.grantToken }
      });
    } else if (params.userId && params.targetEmployeeId && params.organizationId) {
      grant = await prisma.privilegedPiiAccessGrant.findFirst({
        where: {
          userId: params.userId,
          targetRecordId: params.targetEmployeeId,
          organizationId: params.organizationId,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { expiresAt: 'desc' }
      });
    }

    if (!grant || (grant.expiresAt && grant.expiresAt.getTime() <= Date.now()) || grant.revokedAt) {
      return { isAuthorized: false, isValid: false, remainingSeconds: 0 };
    }

    const remainingSeconds = Math.max(0, Math.floor((grant.expiresAt.getTime() - Date.now()) / 1000));
    return { isAuthorized: true, isValid: true, remainingSeconds };
  }

  /**
   * Requests a 15-minute time-limited PAM grant to inspect payroll PII.
   */
  public static async grantPrivilegedAccess(params: {
    userId: string;
    userRole: UserRole;
    organizationId: string;
    targetEmployeeId: string;
    reason: string;
    authFactorUsed: string;
    taxCaseId?: string;
  }): Promise<{ grantId: string; grantToken: string; expiresAt: Date }> {
    this.assertPayrollAccessAuthorized(params.userRole);

    let taxCaseId = params.taxCaseId;
    if (!taxCaseId) {
      const tc = await prisma.taxCase.findFirst({
        where: { organizationId: params.organizationId }
      });
      if (tc) {
        taxCaseId = tc.id;
      } else {
        const fallbackCase = await prisma.taxCase.create({
          data: {
            organizationId: params.organizationId,
            ownerId: params.userId,
            taxYear: new Date().getFullYear(),
            caseType: 'PAYROLL_TAX' as any,
            reviewMode: 'HUMAN_VERIFIED' as any,
            status: 'DRAFT',
            completionPercent: 0
          }
        });
        taxCaseId = fallbackCase.id;
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // Exactly 15 minutes

    const grant = await prisma.privilegedPiiAccessGrant.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        taxCaseId: taxCaseId,
        targetRecordId: params.targetEmployeeId,
        reason: params.reason,
        authFactorUsed: params.authFactorUsed,
        grantedAt: now,
        expiresAt
      }
    });

    // Record immutable audit event
    await AuditEventService.recordEvent({
      organizationId: params.organizationId,
      actorId: params.userId,
      actorRole: params.userRole,
      actorType: 'USER',
      taxCaseId: taxCaseId,
      action: 'UNMASK_PAYROLL_PII',
      objectType: 'Employee',
      objectId: params.targetEmployeeId,
      newValue: { grantId: grant.id, expiresAt, reason: params.reason }
    });

    return { grantId: grant.id, grantToken: grant.id, expiresAt };
  }
}
