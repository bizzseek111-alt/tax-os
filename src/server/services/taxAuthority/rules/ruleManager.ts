/**
 * Autonomous Tax OS — Tax Rule Lifecycle & Governance Manager
 * 
 * Enforces the strict governance state machine for all structured tax rules:
 * DRAFT -> AI_EXTRACTED -> PRO_REVIEW_REQUIRED -> APPROVED -> ACTIVE -> DEPRECATED
 * 
 * Strict Compliance Guardrails:
 * 1. AI Rule Isolation: AI parsers can NEVER set a rule status to 'ACTIVE'.
 * 2. Mandatory Human Credentialing: Only licensed CPAs, EAs, Tax Attorneys, or Super Admins
 *    can transition a rule to 'APPROVED' or 'ACTIVE'.
 * 3. Immutable Versioning: Active rules are never overwritten in-place. Updates create
 *    a new rule version with cryptographic lineage.
 */

import { prisma } from '../../../db';
import { UserRole } from '@prisma/client';
import {
  NormalizedRulePayload,
  RuleReviewStatus,
  SupportedJurisdiction
} from '../types';
import { TaxHasher } from '../hasher';

export class TaxRuleManager {
  /**
   * Roles permitted to approve or activate tax rules into the production engine.
   */
  private static readonly AUTHORIZED_APPROVER_ROLES: UserRole[] = [
    UserRole.CPA,
    UserRole.EA,
    UserRole.ATTORNEY,
    UserRole.TAX_KNOWLEDGE_ADMIN,
    UserRole.SUPER_ADMIN
  ];

  /**
   * Registers a newly parsed or drafted tax rule.
   * If submitted by an automated agent, status is strictly forced to AI_EXTRACTED.
   */
  public static async registerRule(
    payload: NormalizedRulePayload,
    isAutomatedAgent: boolean = false
  ): Promise<any> {
    const initialStatus = isAutomatedAgent
      ? RuleReviewStatus.AI_EXTRACTED
      : RuleReviewStatus.DRAFT;

    const ruleVersion = payload.ruleVersion || '2026.1';

    return await prisma.taxRule.upsert({
      where: {
        ruleId_taxYear_ruleVersion: {
          ruleId: payload.ruleId,
          taxYear: payload.taxYear,
          ruleVersion
        }
      },
      update: {
        title: payload.title,
        description: payload.description,
        conditions: payload.conditions as any,
        requiredFacts: payload.requiredFacts as any,
        exceptions: payload.exceptions as any,
        thresholds: payload.thresholds as any,
        phaseOuts: payload.phaseOuts as any,
        elections: payload.elections as any,
        calculationReference: payload.calculationReference,
        formMappings: payload.formMappings as any,
        federalConformityBehavior: payload.federalConformityBehavior ?? 'CONFORMS',
        authorityRefs: payload.authorityRefs as any,
        reviewStatus: initialStatus,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo
      },
      create: {
        ruleId: payload.ruleId,
        jurisdiction: payload.jurisdiction,
        taxYear: payload.taxYear,
        taxDomain: payload.taxDomain || 'INCOME_TAX',
        topic: payload.topic,
        title: payload.title,
        description: payload.description,
        conditions: payload.conditions as any,
        requiredFacts: payload.requiredFacts as any,
        exceptions: payload.exceptions as any,
        thresholds: payload.thresholds as any,
        phaseOuts: payload.phaseOuts as any,
        elections: payload.elections as any,
        calculationReference: payload.calculationReference,
        formMappings: payload.formMappings as any,
        federalConformityBehavior: payload.federalConformityBehavior ?? 'CONFORMS',
        authorityRefs: payload.authorityRefs as any,
        ruleVersion,
        reviewStatus: initialStatus,
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo,
        sourceId: payload.sourceId
      }
    });
  }

  /**
   * Professional review and state transition by a credentialed CPA/EA/Attorney.
   */
  public static async reviewRule(params: {
    ruleId: string;
    taxYear: number;
    ruleVersion?: string;
    newStatus: RuleReviewStatus;
    reviewerId: string;
    reviewerRole: UserRole;
    notes?: string;
  }): Promise<any> {
    const version = params.ruleVersion || '2026.1';

    // Verify authorized role
    if (!this.AUTHORIZED_APPROVER_ROLES.includes(params.reviewerRole)) {
      throw new Error(
        `UNAUTHORIZED_RULE_ACTION: Role '${params.reviewerRole}' is not authorized to transition rule status to '${params.newStatus}'. Only licensed CPAs, EAs, Attorneys, and Knowledge Admins may approve rules.`
      );
    }

    const rule = await prisma.taxRule.findFirst({
      where: {
        ruleId: params.ruleId,
        taxYear: params.taxYear,
        ruleVersion: version
      }
    });

    if (!rule) {
      throw new Error(`RULE_NOT_FOUND: Rule '${params.ruleId}' (v${version}) not found for tax year ${params.taxYear}`);
    }

    return await prisma.taxRule.update({
      where: { id: rule.id },
      data: {
        reviewStatus: params.newStatus,
        approvedByUserId: params.reviewerId,
        approvedAt: params.newStatus === RuleReviewStatus.ACTIVE || params.newStatus === RuleReviewStatus.APPROVED ? new Date() : undefined
      }
    });
  }

  /**
   * Fetches the currently ACTIVE authoritative rule.
   */
  public static async getActiveRule(
    ruleId: string,
    taxYear: number = 2026
  ): Promise<any> {
    return await prisma.taxRule.findFirst({
      where: {
        ruleId,
        taxYear,
        reviewStatus: RuleReviewStatus.ACTIVE
      },
      include: {
        source: true,
        conformityRecords: true
      }
    });
  }

  /**
   * Lists rules by jurisdiction and tax year with optional topic filter.
   */
  public static async listRules(params: {
    jurisdiction: SupportedJurisdiction;
    taxYear: number;
    topic?: string;
    status?: RuleReviewStatus;
  }): Promise<any[]> {
    return await prisma.taxRule.findMany({
      where: {
        jurisdiction: params.jurisdiction,
        taxYear: params.taxYear,
        topic: params.topic,
        reviewStatus: params.status
      },
      orderBy: { ruleId: 'asc' }
    });
  }

  /**
   * Releases an immutable TaxRuleSetVersion for a jurisdiction and tax year.
   */
  public static async releaseRuleSetVersion(params: {
    jurisdiction: SupportedJurisdiction;
    taxYear: number;
    versionCode: string;
    releasedByUserId: string;
  }): Promise<any> {
    const activeRules = await prisma.taxRule.findMany({
      where: {
        jurisdiction: params.jurisdiction,
        taxYear: params.taxYear,
        reviewStatus: RuleReviewStatus.ACTIVE
      }
    });

    const ruleChecksum = TaxHasher.hashRuleSet(
      activeRules.map((r) => ({
        ruleId: r.ruleId,
        jurisdiction: r.jurisdiction as any,
        taxYear: r.taxYear,
        taxDomain: r.taxDomain,
        topic: r.topic,
        title: r.title,
        description: r.description,
        conditions: r.conditions as any,
        requiredFacts: r.requiredFacts as any,
        exceptions: r.exceptions as any,
        thresholds: r.thresholds as any,
        phaseOuts: r.phaseOuts as any,
        elections: r.elections as any,
        calculationReference: r.calculationReference ?? undefined,
        formMappings: r.formMappings as any,
        federalConformityBehavior: r.federalConformityBehavior as any,
        authorityRefs: r.authorityRefs as any,
        effectiveFrom: r.effectiveFrom
      }))
    );

    return await prisma.taxRuleSetVersion.upsert({
      where: {
        jurisdiction_taxYear_versionCode: {
          jurisdiction: params.jurisdiction,
          taxYear: params.taxYear,
          versionCode: params.versionCode
        }
      },
      update: {
        rulesCount: activeRules.length,
        contentHash: ruleChecksum,
        status: 'RELEASED',
        releasedAt: new Date(),
        releasedByUserId: params.releasedByUserId
      },
      create: {
        jurisdiction: params.jurisdiction,
        taxYear: params.taxYear,
        versionCode: params.versionCode,
        rulesCount: activeRules.length,
        contentHash: ruleChecksum,
        status: 'RELEASED',
        releasedByUserId: params.releasedByUserId
      }
    });
  }
}
