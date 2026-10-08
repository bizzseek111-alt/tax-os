import crypto from 'crypto';
import { prisma } from '../db';
import { UserRole } from '@prisma/client';

export interface RecordAuditEventInput {
  organizationId: string;
  actorId: string;
  actorRole: UserRole;
  actorType?: 'USER' | 'AGENT' | 'SYSTEM';
  taxCaseId?: string;
  action: string;
  objectType: string;
  objectId: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
  requestId?: string;
}

/**
 * Deterministically serializes objects into canonical JSON with sorted keys.
 * Ensures identical string representation across JS memory and Postgres jsonb queries.
 */
function canonicalJson(obj: any): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

export class AuditEventService {
  private static readonly GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Appends an audit event to the tenant's cryptographic blockchain ledger.
   */
  static async recordEvent(input: RecordAuditEventInput) {
    // 1. Fetch latest block for this organization
    const latestEvent = await prisma.auditEvent.findFirst({
      where: { organizationId: input.organizationId },
      orderBy: { sequence: 'desc' },
    });

    const previousBlockHash = latestEvent ? latestEvent.blockHash : this.GENESIS_HASH;
    const nextSequence = latestEvent ? latestEvent.sequence + 1n : 1n;
    const timestamp = new Date();

    // 2. Compute canonical SHA-256 block hash
    const blockPayload = [
      nextSequence.toString(),
      previousBlockHash,
      input.actorId,
      input.actorRole,
      input.action,
      input.objectType,
      input.objectId,
      canonicalJson(input.previousValue ?? null),
      canonicalJson(input.newValue ?? null),
      input.reason ?? '',
      timestamp.toISOString(),
    ].join('|');

    const blockHash = crypto.createHash('sha256').update(blockPayload).digest('hex');

    // 3. Persist block record
    return prisma.auditEvent.create({
      data: {
        sequence: nextSequence,
        timestamp,
        organizationId: input.organizationId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        actorType: input.actorType || 'USER',
        taxCaseId: input.taxCaseId,
        action: input.action,
        objectType: input.objectType,
        objectId: input.objectId,
        previousValue: input.previousValue ?? undefined,
        newValue: input.newValue ?? undefined,
        reason: input.reason,
        requestId: input.requestId,
        blockHash,
        previousBlockHash,
      },
    });
  }

  /**
   * Verifies the full cryptographic hash chain for an organization.
   * Detects tampering or retrofitted records.
   */
  static async verifyChainIntegrity(organizationId: string): Promise<{
    isValid: boolean;
    totalBlocksVerified: number;
    tamperedSequence?: bigint;
    error?: string;
  }> {
    const events = await prisma.auditEvent.findMany({
      where: { organizationId },
      orderBy: { sequence: 'asc' },
    });

    if (events.length === 0) {
      return { isValid: true, totalBlocksVerified: 0 };
    }

    let expectedPrevHash = this.GENESIS_HASH;

    for (const event of events) {
      if (event.previousBlockHash !== expectedPrevHash) {
        return {
          isValid: false,
          totalBlocksVerified: Number(event.sequence) - 1,
          tamperedSequence: event.sequence,
          error: `Broken hash chain at sequence ${event.sequence}: expected prevHash ${expectedPrevHash}, found ${event.previousBlockHash}`,
        };
      }

      // Re-hash block payload using identical canonical JSON serialization
      const blockPayload = [
        event.sequence.toString(),
        event.previousBlockHash,
        event.actorId,
        event.actorRole,
        event.action,
        event.objectType,
        event.objectId,
        canonicalJson(event.previousValue ?? null),
        canonicalJson(event.newValue ?? null),
        event.reason ?? '',
        event.timestamp.toISOString(),
      ].join('|');

      const recomputedHash = crypto.createHash('sha256').update(blockPayload).digest('hex');

      if (recomputedHash !== event.blockHash) {
        return {
          isValid: false,
          totalBlocksVerified: Number(event.sequence) - 1,
          tamperedSequence: event.sequence,
          error: `Block signature mismatch at sequence ${event.sequence}: data payload modified`,
        };
      }

      expectedPrevHash = event.blockHash;
    }

    return {
      isValid: true,
      totalBlocksVerified: events.length,
    };
  }
}
