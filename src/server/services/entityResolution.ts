/**
 * Autonomous TaxOS — Entity Resolution Service (Phase 2)
 * 
 * Manages matching and normalization for:
 * - Employers (Form W-2)
 * - Payers (Form 1099-NEC, 1099-K, 1099-INT)
 * - Merchants (Receipts, Invoices, Bank Feeds)
 * - Financial Institutions (Plaid feeds)
 * - Business Entities (Pass-throughs)
 * 
 * Never merges uncertain entities destructively; persists candidate matches with confidence.
 */

import { prisma } from '../db';

export interface EntityMatchResult {
  entityId: string;
  name: string;
  normalizedName: string;
  confidence: number;
  isExisting: boolean;
}

export class EntityResolutionService {
  /**
   * Normalizes raw company/merchant strings for deterministic comparison.
   * Strips corporate suffixes (LLC, Inc, Corp, Co) and non-alphanumeric punctuation.
   */
  static normalizeEntityName(rawName: string): string {
    if (!rawName) return '';
    let name = rawName.toUpperCase();
    name = name.replace(/[^A-Z0-9\s]/g, ' ');
    // Remove corporate suffixes
    name = name.replace(/\b(LLC|INC|INCORPORATED|CORP|CORPORATION|CO|COMPANY|LTD|LP)\b/g, ' ');
    return name.replace(/\s+/g, ' ').trim();
  }

  /**
   * Resolves or registers an entity within the organization boundary.
   */
  static async resolveEntity(
    organizationId: string,
    rawName: string,
    entityType: 'EMPLOYER' | 'PAYER' | 'MERCHANT' | 'FINANCIAL_INSTITUTION' | 'BUSINESS_ENTITY',
    tinOrEin?: string
  ): Promise<EntityMatchResult> {
    const normalized = this.normalizeEntityName(rawName);

    // 1. Search for existing normalized entity
    const existing = await prisma.resolvedEntity.findFirst({
      where: {
        organizationId,
        entityType,
        normalizedName: normalized,
      },
    });

    if (existing) {
      return {
        entityId: existing.id,
        name: existing.name,
        normalizedName: existing.normalizedName,
        confidence: existing.confidence,
        isExisting: true,
      };
    }

    // 2. Register candidate entity
    const tinLast4 = tinOrEin ? tinOrEin.slice(-4) : undefined;
    const created = await prisma.resolvedEntity.create({
      data: {
        organizationId,
        entityType,
        name: rawName.trim(),
        normalizedName: normalized,
        tinLast4,
        confidence: 0.95,
      },
    });

    return {
      entityId: created.id,
      name: created.name,
      normalizedName: created.normalizedName,
      confidence: created.confidence,
      isExisting: false,
    };
  }
}
