/**
 * Autonomous Tax OS — Case Concurrency Lock Service
 * 
 * Provides lease-based locking to prevent simultaneous conflicting edits
 * between human reviewers, customer actions, and automated agents.
 */

import { prisma } from '../db';
import { UserRole } from '@prisma/client';
import { recordReviewAudit } from './auditHelper';

export interface LockStatus {
  isLocked: boolean;
  lockedByUserId?: string;
  lockedByUserName?: string;
  lockedAt?: Date;
  expiresAt?: Date;
  isExpired: boolean;
  reason?: string;
}

export class CaseLockService {
  /**
   * Acquires a lease on a TaxCase. Default lease duration: 15 minutes.
   */
  public static async acquireLock(
    taxCaseId: string,
    userId: string,
    reason: string = 'Professional Review in progress',
    durationMinutes: number = 15
  ) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);

    const existingLock = await prisma.caseLock.findUnique({
      where: { taxCaseId },
      include: { lockedByUser: true }
    });

    if (existingLock) {
      const isExpired = existingLock.expiresAt <= now;
      const isSameUser = existingLock.lockedByUserId === userId;

      if (!isExpired && !isSameUser) {
        throw new Error(
          `CASE_LOCKED: TaxCase ${taxCaseId} is currently locked by ${existingLock.lockedByUser.fullName || existingLock.lockedByUser.email} until ${existingLock.expiresAt.toISOString()}. Reason: ${existingLock.reason}`
        );
      }

      // Re-acquire / extend existing lock
      return await prisma.caseLock.update({
        where: { taxCaseId },
        data: {
          lockedByUserId: userId,
          lockedAt: now,
          expiresAt,
          reason
        }
      });
    }

    return await prisma.caseLock.create({
      data: {
        taxCaseId,
        lockedByUserId: userId,
        lockedAt: now,
        expiresAt,
        reason
      }
    });
  }

  /**
   * Heartbeat to extend active lease.
   */
  public static async renewLock(
    taxCaseId: string,
    userId: string,
    extensionMinutes: number = 15
  ) {
    const now = new Date();
    const lock = await prisma.caseLock.findUnique({
      where: { taxCaseId }
    });

    if (!lock) {
      throw new Error(`LOCK_NOT_FOUND: No active lock found for TaxCase ${taxCaseId}`);
    }

    if (lock.lockedByUserId !== userId) {
      throw new Error(`LOCK_FORBIDDEN: Lock is held by another user.`);
    }

    if (lock.expiresAt <= now) {
      throw new Error(`LOCK_EXPIRED: Lock expired before renewal. Re-acquire required.`);
    }

    const newExpiresAt = new Date(now.getTime() + extensionMinutes * 60 * 1000);
    return await prisma.caseLock.update({
      where: { taxCaseId },
      data: { expiresAt: newExpiresAt }
    });
  }

  /**
   * Releases an active lock voluntarily.
   */
  public static async releaseLock(taxCaseId: string, userId: string): Promise<boolean> {
    const lock = await prisma.caseLock.findUnique({
      where: { taxCaseId }
    });

    if (!lock) return true;

    if (lock.lockedByUserId !== userId) {
      throw new Error(`LOCK_FORBIDDEN: Cannot release a lock held by another user.`);
    }

    await prisma.caseLock.delete({
      where: { taxCaseId }
    });

    return true;
  }

  /**
   * Administrative break-lock for supervisors and admins.
   */
  public static async breakLock(
    taxCaseId: string,
    brokenByUserId: string,
    breakReason: string
  ) {
    const breaker = await prisma.user.findUnique({
      where: { id: brokenByUserId },
      include: { professionalProfile: true }
    });

    if (!breaker) throw new Error('User not found');

    const isSeniorOrAdmin =
      breaker.role === UserRole.SUPER_ADMIN ||
      breaker.role === UserRole.FIRM_ADMIN ||
      breaker.role === UserRole.OPERATIONS_MANAGER ||
      breaker.role === UserRole.SENIOR_REVIEWER ||
      breaker.role === UserRole.CPA ||
      (breaker.professionalProfile && breaker.professionalProfile.reviewLevel >= 2);

    if (!isSeniorOrAdmin) {
      throw new Error(`PERMISSION_DENIED: Role ${breaker.role} cannot break active case locks.`);
    }

    const lock = await prisma.caseLock.findUnique({
      where: { taxCaseId },
      include: { lockedByUser: true }
    });

    if (!lock) return null;

    // Log audit event for break-lock
    await recordReviewAudit({
      taxCaseId,
      actorId: brokenByUserId,
      actorType: 'USER',
      action: 'CASE_LOCK_BROKEN',
      objectType: 'CaseLock',
      objectId: lock.id,
      metadata: {
        previousLockHolder: lock.lockedByUserId,
        previousLockExpiresAt: lock.expiresAt,
        breakReason,
        brokenByRole: breaker.role
      }
    });

    await prisma.caseLock.delete({
      where: { taxCaseId }
    });

    return lock;
  }

  /**
   * Checks current lock status of a case.
   */
  public static async checkLock(taxCaseId: string): Promise<LockStatus> {
    const lock = await prisma.caseLock.findUnique({
      where: { taxCaseId },
      include: { lockedByUser: true }
    });

    if (!lock) {
      return {
        isLocked: false,
        isExpired: true
      };
    }

    const now = new Date();
    const isExpired = lock.expiresAt <= now;

    return {
      isLocked: !isExpired,
      lockedByUserId: lock.lockedByUserId,
      lockedByUserName: lock.lockedByUser.fullName || lock.lockedByUser.email,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
      isExpired,
      reason: lock.reason
    };
  }
}
