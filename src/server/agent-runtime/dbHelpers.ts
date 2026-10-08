/**
 * Autonomous Tax OS — Agent Runtime Database Helpers
 * 
 * Provides type-safe Prisma creation wrappers for TaxPosition, TaxFact,
 * ReviewTask, and TaxTask, handling BigInt cents conversions and required audit fields.
 */

import crypto from 'crypto';
import { prisma } from '../db';
import { TaxPositionStatus, EvidenceClassification } from './types';

export class AgentDbHelper {
  public static async createTaxPosition(params: {
    taxCaseId: string;
    positionType?: string;
    category?: string;
    title: string;
    amount: number;
    statutoryCitation?: string;
    rationale?: string;
    confidence?: number;
    status?: TaxPositionStatus | string;
    sourceAgent?: string;
    ruleRefs?: string[];
    evidenceRefs?: string[];
    challengerNotes?: string;
  }) {
    return await prisma.taxPosition.create({
      data: {
        taxCaseId: params.taxCaseId,
        positionType: params.positionType || 'DEDUCTION',
        category: params.category || 'GENERAL',
        title: params.title,
        amountCents: BigInt(Math.round(params.amount * 100)),
        statutoryCitation: params.statutoryCitation || 'IRC § 162',
        rationale: params.rationale || params.title,
        confidence: params.confidence ?? 0.95,
        status: params.status || TaxPositionStatus.PROPOSED,
        sourceAgent: params.sourceAgent,
        ruleRefs: params.ruleRefs || [],
        evidenceRefs: params.evidenceRefs || [],
        challengerNotes: params.challengerNotes
      }
    });
  }

  public static async createTaxFact(params: {
    taxCaseId: string;
    category?: string;
    factType: string;
    key?: string;
    amount?: number;
    valueString?: string;
    normalizedValue?: any;
    confidence?: number;
  }) {
    return await prisma.taxFact.create({
      data: {
        taxCaseId: params.taxCaseId,
        category: params.category || 'DEDUCTION',
        factType: params.factType,
        key: params.key || params.factType.toLowerCase(),
        valueCents: params.amount !== undefined ? BigInt(Math.round(params.amount * 100)) : null,
        valueString: params.valueString,
        normalizedValue: params.normalizedValue || {},
        confidence: params.confidence ?? 0.95
      }
    });
  }

  public static async createReviewTask(params: {
    taxCaseId: string;
    title?: string;
    reason: string;
    jurisdiction?: string;
    requiredRole?: 'CPA' | 'ENROLLED_AGENT' | 'TAX_ATTORNEY' | 'BOOKKEEPER' | 'ATTORNEY' | 'EA' | 'PAID_PREPARER' | string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    materialityUsd?: number;
    notes?: string;
  }) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    let roleEnum: any = 'CPA';
    if (params.requiredRole === 'TAX_ATTORNEY' || params.requiredRole === 'ATTORNEY') {
      roleEnum = 'ATTORNEY';
    } else if (params.requiredRole === 'ENROLLED_AGENT' || params.requiredRole === 'EA') {
      roleEnum = 'EA';
    } else if (params.requiredRole === 'BOOKKEEPER' || params.requiredRole === 'PAID_PREPARER') {
      roleEnum = 'PAID_PREPARER';
    } else if (params.requiredRole) {
      roleEnum = params.requiredRole;
    }

    return await prisma.reviewTask.create({
      data: {
        taxCaseId: params.taxCaseId,
        jurisdiction: params.jurisdiction || 'US-FED',
        taxDomain: 'INCOME_TAX',
        requiredRole: roleEnum,
        riskLevel: params.priority === 'URGENT' || params.priority === 'HIGH' ? 'HIGH' : 'LOW',
        materialityCents: BigInt(Math.round((params.materialityUsd || 0) * 100)),
        status: 'PENDING_ROUTING',
        deadline,
        notes: params.notes || params.reason
      }
    });
  }

  public static async createTaxTask(params: {
    taxCaseId: string;
    taskType?: string;
    title?: string;
    reason: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) {
    const hash = crypto.createHash('sha256').update(`${params.taxCaseId}:${Date.now()}`).digest('hex');

    return await prisma.taxTask.create({
      data: {
        taxCaseId: params.taxCaseId,
        taskType: params.taskType || 'MISSING_DOCUMENT',
        reason: params.reason || params.title || 'TaxTask requested by agent',
        priority: params.priority === 'HIGH' || params.priority === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        status: 'PENDING_TAXPAYER',
        auditRecordHash: hash
      }
    });
  }
}
