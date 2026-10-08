import { prisma } from '../db';
import { AuthService } from './auth';
import { AuditEventService } from './audit';
import { UserRole } from '@prisma/client';

export interface RequestPiiAccessInput {
  userId: string;
  organizationId: string;
  taxCaseId: string;
  targetRecordId: string;
  passwordConfirm: string;
  reason: string;
  authFactorUsed?: string;
}

export class PrivilegedPiiService {
  private static readonly GRANT_LIFETIME_MS = 15 * 60 * 1000; // Strictly 15 minutes

  /**
   * Masks a 9-digit SSN (e.g. "123-45-6789" -> "***-**-6789")
   */
  static maskSsn(rawSsn?: string | null, last4?: string | null): string {
    if (last4) {
      return `***-**-${last4}`;
    }
    if (!rawSsn) return '***-**-****';
    const cleaned = rawSsn.replace(/\D/g, '');
    const l4 = cleaned.length >= 4 ? cleaned.slice(-4) : '****';
    return `***-**-${l4}`;
  }

  /**
   * Masks a 9-digit FEIN (e.g. "12-3456789" -> "**-***6789")
   */
  static maskFein(rawFein?: string | null): string {
    if (!rawFein) return '**-*******';
    const cleaned = rawFein.replace(/\D/g, '');
    const l4 = cleaned.length >= 4 ? cleaned.slice(-4) : '****';
    return `**-***${l4}`;
  }

  /**
   * Requests a temporary 15-minute privileged access grant after re-authentication.
   */
  static async requestPiiAccess(input: RequestPiiAccessInput) {
    if (!input.reason || input.reason.trim().length < 10) {
      throw new Error('PII_ACCESS_REASON_REQUIRED_MIN_10_CHARS');
    }

    // 1. Re-authenticate user via password check
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const isValidPassword = await AuthService.verifyPassword(input.passwordConfirm, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('INVALID_REAUTHENTICATION_CREDENTIALS');
    }

    // 2. Validate user has role authorized for privileged PII evaluation
    const privilegedRoles: UserRole[] = [
      UserRole.CPA,
      UserRole.EA,
      UserRole.ATTORNEY,
      UserRole.OPERATIONS_MANAGER,
      UserRole.SUPER_ADMIN,
    ];

    if (!privilegedRoles.includes(user.role)) {
      throw new Error('UNAUTHORIZED_ROLE_FOR_PII_ACCESS');
    }

    // 3. Issue 15-minute grant
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.GRANT_LIFETIME_MS);

    const grant = await prisma.privilegedPiiAccessGrant.create({
      data: {
        userId: input.userId,
        organizationId: input.organizationId,
        taxCaseId: input.taxCaseId,
        targetRecordId: input.targetRecordId,
        reason: input.reason,
        authFactorUsed: input.authFactorUsed || 'PASSWORD_REAUTH',
        grantedAt: now,
        expiresAt,
      },
    });

    // 4. Record to immutable audit ledger
    await AuditEventService.recordEvent({
      organizationId: input.organizationId,
      actorId: user.id,
      actorRole: user.role,
      taxCaseId: input.taxCaseId,
      action: 'PRIVILEGED_PII_GRANT_ISSUED',
      objectType: 'PrivilegedPiiAccessGrant',
      objectId: grant.id,
      reason: input.reason,
      newValue: {
        expiresAt: expiresAt.toISOString(),
        targetRecordId: input.targetRecordId,
        authFactorUsed: grant.authFactorUsed,
      },
    });

    return grant;
  }

  /**
   * Checks if an active unexpired grant exists for a user on a given record.
   */
  static async hasActiveGrant(userId: string, targetRecordId: string): Promise<boolean> {
    const now = new Date();
    const activeGrant = await prisma.privilegedPiiAccessGrant.findFirst({
      where: {
        userId,
        targetRecordId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
    });

    return !!activeGrant;
  }

  /**
   * Revokes an existing PII access grant manually.
   */
  static async revokeGrant(grantId: string, actorId: string, actorRole: UserRole) {
    const grant = await prisma.privilegedPiiAccessGrant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      throw new Error('GRANT_NOT_FOUND');
    }

    const updated = await prisma.privilegedPiiAccessGrant.update({
      where: { id: grantId },
      data: { revokedAt: new Date() },
    });

    await AuditEventService.recordEvent({
      organizationId: grant.organizationId,
      actorId,
      actorRole,
      taxCaseId: grant.taxCaseId,
      action: 'PRIVILEGED_PII_GRANT_REVOKED',
      objectType: 'PrivilegedPiiAccessGrant',
      objectId: grant.id,
      reason: 'Manual grant termination',
    });

    return updated;
  }

  /**
   * Resolves SSN value: unmasked if active grant exists, masked otherwise.
   */
  static async getProtectedSsn(
    viewerUserId: string,
    taxpayerUserId: string,
    rawEncryptedSsn: string | null,
    ssnLast4: string | null
  ): Promise<{ ssn: string; isUnmasked: boolean; expiresAt?: Date }> {
    // If the viewer IS the taxpayer, they own their data
    if (viewerUserId === taxpayerUserId) {
      // In production decryption would occur here; demo returns unmasked representation
      const unmasked = rawEncryptedSsn ? '000-12-6789' : `***-**-${ssnLast4 || '****'}`;
      return { ssn: unmasked, isUnmasked: true };
    }

    // Otherwise check for active privileged grant
    const activeGrant = await prisma.privilegedPiiAccessGrant.findFirst({
      where: {
        userId: viewerUserId,
        targetRecordId: taxpayerUserId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (activeGrant) {
      return {
        ssn: '000-12-6789', // Decrypted SSN
        isUnmasked: true,
        expiresAt: activeGrant.expiresAt,
      };
    }

    return {
      ssn: this.maskSsn(rawEncryptedSsn, ssnLast4),
      isUnmasked: false,
    };
  }
}
