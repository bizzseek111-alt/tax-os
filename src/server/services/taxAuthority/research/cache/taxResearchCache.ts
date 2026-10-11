/**
 * Autonomous Tax OS — Tax Research Cache Architecture (L1 / L2)
 * 
 * L1: In-memory cache for fast lookups.
 * L2: Persistent DB cache with expiration, source hash tracking, and fact-invalidation.
 */

import crypto from 'crypto';
import prisma from '../../../../db';
import { ResearchDomain, TaxResearchResult } from '../types';

export class TaxResearchCache {
  private static instance: TaxResearchCache;
  private l1Cache: Map<string, { result: TaxResearchResult; expiresAt: number }> = new Map();
  private readonly DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  public static getInstance(): TaxResearchCache {
    if (!TaxResearchCache.instance) {
      TaxResearchCache.instance = new TaxResearchCache();
    }
    return TaxResearchCache.instance;
  }

  /**
   * Generates a deterministic hash for a cache query.
   */
  public generateCacheKey(
    jurisdiction: string,
    taxYear: number,
    domain: ResearchDomain,
    question: string,
    factsHash: string = ''
  ): string {
    const raw = `${jurisdiction}:${taxYear}:${domain}:${question.trim().toLowerCase()}:${factsHash}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Computes a SHA256 hash over an array of confirmed facts.
   */
  public hashFacts(facts: any[] = []): string {
    if (!facts || facts.length === 0) return 'empty';
    const sorted = [...facts].sort((a, b) => (a.key || '').localeCompare(b.key || ''));
    return crypto.createHash('sha256').update(JSON.stringify(sorted)).digest('hex').substring(0, 16);
  }

  /**
   * Looks up a cached research result from L1 or L2.
   */
  public async get(cacheKey: string): Promise<TaxResearchResult | null> {
    const now = Date.now();

    // Check L1
    const l1 = this.l1Cache.get(cacheKey);
    if (l1) {
      if (l1.expiresAt > now) {
        return l1.result;
      } else {
        this.l1Cache.delete(cacheKey);
      }
    }

    // Check L2 (DB)
    try {
      const entry = await prisma.researchCacheEntry.findUnique({
        where: { cacheKey }
      });
      if (entry && entry.expiresAt.getTime() > now) {
        const res = entry.cachedResult as any as TaxResearchResult;
        // Populate L1
        this.l1Cache.set(cacheKey, { result: res, expiresAt: entry.expiresAt.getTime() });
        return res;
      }
    } catch {
      // In-memory fallback
    }

    return null;
  }

  /**
   * Stores a research result in L1 and L2.
   */
  public async set(
    cacheKey: string,
    jurisdiction: string,
    taxYear: number,
    domain: ResearchDomain,
    factsHash: string,
    result: TaxResearchResult,
    sourceCitations: string[] = [],
    ttlMs: number = this.DEFAULT_TTL_MS
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMs);

    // L1
    this.l1Cache.set(cacheKey, { result, expiresAt: expiresAt.getTime() });

    // L2
    try {
      await prisma.researchCacheEntry.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          jurisdiction,
          taxYear,
          taxDomain: domain.toString(),
          topic: sourceCitations[0] || 'GENERAL',
          factsHash,
          cachedResult: result as any,
          expiresAt
        },
        update: {
          cachedResult: result as any,
          expiresAt
        }
      });
    } catch (err) {
      console.warn('[TaxResearchCache] L2 write failed, retained in L1:', err);
    }
  }

  /**
   * Invalidates cache entries when an official statutory source changes.
   */
  public async invalidateCitation(citationCode: string): Promise<number> {
    let invalidatedCount = 0;

    // Purge L1
    for (const [key, val] of this.l1Cache.entries()) {
      if (val.result.applicableRules?.some(r => r.ruleId.includes(citationCode)) ||
          val.result.authorityAssessments?.some(a => (a.authorityType as any).toString().includes(citationCode))) {
        this.l1Cache.delete(key);
        invalidatedCount++;
      }
    }

    // Purge L2
    try {
      const deleteResult = await prisma.researchCacheEntry.deleteMany({
        where: {
          topic: { contains: citationCode }
        }
      });
      invalidatedCount += deleteResult.count;
    } catch {
      // In-memory fallback
    }

    return invalidatedCount;
  }
}
