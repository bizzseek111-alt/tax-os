/**
 * Autonomous Tax OS — Structured Agent Memory Subsystem
 * 
 * Enforces structured memory retrieval and storage across 4 canonical categories:
 * 1. TAXPAYER_PATTERN: Confirmed taxpayer accounting elections and recurring profiles
 * 2. PROFESSIONAL_CORRECTION: CPA/Attorney historical overrides and rationale
 * 3. MERCHANT_IDENTITY: Resolved canonical entity names from raw bank descriptors
 * 4. CLASSIFICATION_PATTERN: Learned transaction categorization patterns
 * 
 * Strict Invariants:
 * - Conversational / freeform memory is strictly prohibited.
 * - Tax-year-specific elections remain strictly year-scoped.
 */

import { prisma } from '../db';

export interface MemoryEntry {
  category: 'TAXPAYER_PATTERN' | 'PROFESSIONAL_CORRECTION' | 'MERCHANT_IDENTITY' | 'CLASSIFICATION_PATTERN';
  key: string;
  value: any;
  taxYear?: number;
  confidence?: number;
  sourceAgent?: string;
  verifiedByUserId?: string;
}

export class AgentMemoryManager {
  /**
   * Retrieves a memory value for an organization and category.
   */
  public static async getMemory(
    organizationId: string,
    category: 'TAXPAYER_PATTERN' | 'PROFESSIONAL_CORRECTION' | 'MERCHANT_IDENTITY' | 'CLASSIFICATION_PATTERN',
    key: string,
    taxYear?: number
  ): Promise<any | null> {
    const memory = await prisma.agentMemory.findFirst({
      where: {
        organizationId,
        category,
        key,
        OR: [
          { taxYear: null },
          { taxYear: taxYear ?? null }
        ]
      }
    });

    return memory ? memory.value : null;
  }

  /**
   * Saves or updates a structured memory entry.
   */
  public static async setMemory(
    organizationId: string,
    entry: MemoryEntry
  ): Promise<any> {
    return await prisma.agentMemory.upsert({
      where: {
        organizationId_category_key: {
          organizationId,
          category: entry.category,
          key: entry.key
        }
      },
      update: {
        value: entry.value,
        taxYear: entry.taxYear,
        confidence: entry.confidence ?? 1.0,
        sourceAgent: entry.sourceAgent,
        verifiedByUserId: entry.verifiedByUserId
      },
      create: {
        organizationId,
        category: entry.category,
        key: entry.key,
        value: entry.value,
        taxYear: entry.taxYear,
        confidence: entry.confidence ?? 1.0,
        sourceAgent: entry.sourceAgent,
        verifiedByUserId: entry.verifiedByUserId
      }
    });
  }

  /**
   * Resolves a raw merchant string using historical memory and patterns.
   */
  public static async resolveMerchant(
    organizationId: string,
    rawMerchant: string
  ): Promise<{ normalizedMerchant: string; confidence: number } | null> {
    const cleanKey = rawMerchant.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 50);

    // 1. Check database memory
    const directMatch = await this.getMemory(organizationId, 'MERCHANT_IDENTITY', `merchant:${cleanKey}`);
    if (directMatch) {
      return { normalizedMerchant: directMatch.canonicalName, confidence: directMatch.confidence || 0.95 };
    }

    // 2. Built-in merchant resolver aliases
    const commonAliases: Record<string, string> = {
      AMZN: 'Amazon',
      AMAZON: 'Amazon',
      AWS: 'Amazon Web Services',
      UBER: 'Uber Technologies',
      LYFT: 'Lyft Inc',
      GITHUB: 'GitHub Inc',
      GOOGLE: 'Google LLC',
      ADOBE: 'Adobe Systems',
      MICROSOFT: 'Microsoft Corporation',
      APPLE: 'Apple Inc',
      SLACK: 'Slack Technologies',
      STRIPE: 'Stripe Payments',
      ZOOM: 'Zoom Video Communications',
      HOME_DEPOT: 'The Home Depot',
      OFFICE_DEPOT: 'Office Depot'
    };

    for (const [pattern, canonical] of Object.entries(commonAliases)) {
      if (cleanKey.includes(pattern)) {
        return { normalizedMerchant: canonical, confidence: 0.90 };
      }
    }

    return null;
  }
}
