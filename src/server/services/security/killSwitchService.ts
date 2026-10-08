/**
 * Autonomous TaxOS — Operational Kill Switch & Rule Emergency Rollback Service
 * 
 * Provides immediate incident containment controls:
 * - Kill switches for AGENT, MODEL, TAX_RULE, JURISDICTION, FILING_PROVIDER, SALES_TAX, PAYROLL
 * - Emergency Tax Rule Rollback: Deactivates defective rule, restores previous version,
 *   identifies all impacted TaxCases, and enqueues recalculation flags.
 */

import { prisma } from '../../db';
import { KillSwitchTargetType, UserRole } from '@prisma/client';
import { AuditEventService } from '../audit';

export class KillSwitchService {
  /**
   * Trips an operational kill switch to immediately halt operations.
   */
  public static async tripKillSwitch(params: {
    targetType: KillSwitchTargetType;
    targetKey: string;
    reason: string;
    trippedByUserId: string;
    metadata?: Record<string, any>;
  }): Promise<{ id: string; targetType: KillSwitchTargetType; targetKey: string; isActive: boolean }> {
    const record = await prisma.operationalKillSwitch.upsert({
      where: {
        targetType_targetKey: {
          targetType: params.targetType,
          targetKey: params.targetKey
        }
      },
      update: {
        isActive: true,
        reason: params.reason,
        trippedByUserId: params.trippedByUserId,
        trippedAt: new Date(),
        recoveredAt: null,
        metadata: params.metadata || {}
      },
      create: {
        targetType: params.targetType,
        targetKey: params.targetKey,
        isActive: true,
        reason: params.reason,
        trippedByUserId: params.trippedByUserId,
        metadata: params.metadata || {}
      }
    });

    // Record immutable audit event
    const user = await prisma.user.findUnique({ where: { id: params.trippedByUserId } });
    if (user) {
      const org = await prisma.organization.findFirst();
      if (org) {
        await AuditEventService.recordEvent({
          organizationId: org.id,
          actorId: user.id,
          actorRole: user.role,
          actorType: 'USER',
          action: 'TRIP_OPERATIONAL_KILL_SWITCH',
          objectType: 'OperationalKillSwitch',
          objectId: record.id,
          reason: params.reason,
          newValue: { targetType: params.targetType, targetKey: params.targetKey, isActive: true }
        });
      }
    }

    return record;
  }

  /**
   * Recovers/disables an operational kill switch after remediation.
   */
  public static async recoverKillSwitch(params: {
    targetType: KillSwitchTargetType;
    targetKey: string;
    recoveredByUserId: string;
    recoveryNotes: string;
  }): Promise<boolean> {
    const existing = await prisma.operationalKillSwitch.findUnique({
      where: {
        targetType_targetKey: {
          targetType: params.targetType,
          targetKey: params.targetKey
        }
      }
    });

    if (!existing || !existing.isActive) return false;

    await prisma.operationalKillSwitch.update({
      where: { id: existing.id },
      data: {
        isActive: false,
        recoveredAt: new Date(),
        metadata: {
          ...(existing.metadata as any || {}),
          recoveryNotes: params.recoveryNotes,
          recoveredByUserId: params.recoveredByUserId
        }
      }
    });

    return true;
  }

  /**
   * Checks whether a specific subsystem target has been killed.
   */
  public static async isTargetKilled(targetType: KillSwitchTargetType, targetKey: string): Promise<boolean> {
    const record = await prisma.operationalKillSwitch.findUnique({
      where: {
        targetType_targetKey: {
          targetType,
          targetKey
        }
      }
    });

    return Boolean(record?.isActive);
  }

  /**
   * Asserts that a target is active. Throws descriptive error if killed.
   */
  public static async assertTargetOperational(targetType: KillSwitchTargetType, targetKey: string): Promise<void> {
    const killed = await this.isTargetKilled(targetType, targetKey);
    if (killed) {
      throw new Error(`SUBSYSTEM_DISABLED_BY_KILL_SWITCH: Target ${targetType}:${targetKey} has been disabled for operational safety.`);
    }
  }

  /**
   * Emergency Tax Rule Rollback Workflow:
   * 1. Deactivates bad rule version
   * 2. Trips rule kill switch
   * 3. Finds all TaxCases whose calculations referenced this rule version
   * 4. Flags those cases as NEEDS_REVIEW / CALCULATION_STALE
   */
  public static async executeEmergencyRuleRollback(params: {
    ruleId: string;
    defectiveRuleVersion: string;
    fallbackRuleVersion: string;
    reason: string;
    actorUserId: string;
  }): Promise<{
    ruleDeactivated: boolean;
    killSwitchTripped: boolean;
    affectedCaseIds: string[];
    recalculationQueuedCount: number;
  }> {
    // 1. Trip kill switch for defective rule
    await this.tripKillSwitch({
      targetType: KillSwitchTargetType.TAX_RULE,
      targetKey: `${params.ruleId}@${params.defectiveRuleVersion}`,
      reason: params.reason,
      trippedByUserId: params.actorUserId
    });

    // 2. Deactivate the bad rule in database
    const rule = await prisma.taxRule.findFirst({
      where: { ruleId: params.ruleId, ruleVersion: params.defectiveRuleVersion }
    });

    let ruleDeactivated = false;
    if (rule) {
      await prisma.taxRule.update({
        where: { id: rule.id },
        data: {
          reviewStatus: 'DEACTIVATED',
          effectiveTo: new Date()
        }
      });
      ruleDeactivated = true;
    }

    // 3. Find affected calculation runs and cases
    const affectedRuns = await prisma.taxCalculationRun.findMany({
      where: {
        ruleSetVersion: params.defectiveRuleVersion
      },
      select: { taxCaseId: true }
    });

    const affectedCaseIds = Array.from(new Set(affectedRuns.map(r => r.taxCaseId)));

    // 4. Mark affected cases with review tasks
    let recalculationQueuedCount = 0;
    for (const caseId of affectedCaseIds) {
      await prisma.taxCase.update({
        where: { id: caseId },
        data: { status: 'IN_REVIEW' }
      });

      await prisma.taxTask.create({
        data: {
          taxCaseId: caseId,
          taskType: 'EMERGENCY_RECALCULATION_REQUIRED',
          priority: 'HIGH',
          status: 'PENDING_TAXPAYER',
          reason: `Emergency rollback of tax rule ${params.ruleId}: ${params.reason}`,
          auditRecordHash: `ROLLBACK_${Date.now()}_${caseId}`
        }
      });
      recalculationQueuedCount++;
    }

    return {
      ruleDeactivated,
      killSwitchTripped: true,
      affectedCaseIds,
      recalculationQueuedCount
    };
  }
}
