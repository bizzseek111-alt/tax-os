/**
 * Autonomous Tax OS — Tax Authority Provider Registry & Ingestion Orchestrator
 * 
 * Coordinates the legal ingestion pipeline across all supported jurisdictions:
 * US-FED, US-CA, US-NY, US-NJ, US-IL, US-MA.
 * 
 * Pipeline:
 * Provider -> Chunker -> Hasher -> Vector Embedder -> PostgreSQL Persistence
 */

import { prisma } from '../../../db';
import { StatutoryChunker } from '../chunker';
import { TaxEmbeddingEngine } from '../rag/embeddings';
import { TaxHasher } from '../hasher';
import {
  AuthorityType,
  AUTHORITY_HIERARCHY_RANK,
  PrecedentialStatus,
  RuleReviewStatus,
  SupportedJurisdiction
} from '../types';
import { TaxAuthorityProvider } from './base';
import { IrsProvider } from './irsProvider';
import { CaFtbProvider } from './caFtbProvider';
import { NyDtfProvider } from './nyDtfProvider';
import { NjDivTaxProvider } from './njDivTaxProvider';
import { IlDorProvider } from './ilDorProvider';
import { MaDorProvider } from './maDorProvider';

export class TaxAuthorityProviderRegistry {
  private static readonly providers: Map<SupportedJurisdiction, TaxAuthorityProvider> = new Map([
    ['US-FED', new IrsProvider()],
    ['US-CA', new CaFtbProvider()],
    ['US-NY', new NyDtfProvider()],
    ['US-NJ', new NjDivTaxProvider()],
    ['US-IL', new IlDorProvider()],
    ['US-MA', new MaDorProvider()]
  ]);

  public static getProvider(jurisdiction: SupportedJurisdiction): TaxAuthorityProvider {
    const provider = this.providers.get(jurisdiction);
    if (!provider) {
      throw new Error(`UNSUPPORTED_JURISDICTION: No authority provider registered for ${jurisdiction}`);
    }
    return provider;
  }

  public static getAllProviders(): TaxAuthorityProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Orchestrates the complete ingestion, chunking, embedding, and persistence for a jurisdiction.
   */
  public static async ingestJurisdiction(
    jurisdiction: SupportedJurisdiction,
    taxYear: number = 2026
  ): Promise<{ sourcesCount: number; chunksCount: number; rulesCount: number }> {
    const provider = this.getProvider(jurisdiction);
    const sources = await provider.getSources(taxYear);
    const rules = await provider.getRules(taxYear);
    const conformityRecords = provider.getConformityRecords ? await provider.getConformityRecords(taxYear) : [];

    let totalChunks = 0;

    // 1. Ingest Sources and Chunks
    for (const src of sources) {
      const contentHash = TaxHasher.hashSource(src);
      const authorityLevel = AUTHORITY_HIERARCHY_RANK[src.authorityType] ?? 10;

      // Upsert Source
      const sourceRecord = await prisma.taxAuthoritySource.upsert({
        where: {
          jurisdiction_citationCode_taxYear_sourceVersion: {
            jurisdiction: src.jurisdiction,
            citationCode: src.citationCode,
            taxYear: src.taxYear,
            sourceVersion: src.sourceVersion || '2026.1'
          }
        },
        update: {
          title: src.title,
          rawContent: src.rawContent,
          normalizedContent: src.rawContent,
          contentHash,
          authorityType: src.authorityType,
          authorityLevel,
          precedentialStatus: src.precedentialStatus,
          affectedForms: src.affectedForms as any,
          affectedSchedules: src.affectedSchedules as any,
          topicTags: src.topicTags as any
        },
        create: {
          jurisdiction: src.jurisdiction,
          taxYear: src.taxYear,
          authorityType: src.authorityType,
          authorityLevel,
          publisher: src.publisher,
          title: src.title,
          sourceUrl: src.sourceUrl,
          citationCode: src.citationCode,
          publicationDate: src.publicationDate,
          effectiveFrom: src.effectiveFrom,
          effectiveTo: src.effectiveTo,
          supersedesSourceId: src.supersedesSourceId,
          precedentialStatus: src.precedentialStatus,
          affectedForms: src.affectedForms as any,
          affectedSchedules: src.affectedSchedules as any,
          topicTags: src.topicTags as any,
          contentHash,
          sourceVersion: src.sourceVersion || '2026.1',
          reviewStatus: 'APPROVED',
          rawContent: src.rawContent,
          normalizedContent: src.rawContent
        }
      });

      // Chunk source
      const chunks = StatutoryChunker.chunkDocument(src.rawContent, {
        baseSection: src.citationCode,
        authorityType: src.authorityType,
        precedentialStatus: src.precedentialStatus
      });

      // Clear previous chunks and recreate
      await prisma.taxAuthorityChunk.deleteMany({
        where: { sourceId: sourceRecord.id }
      });

      for (const ch of chunks) {
        const embedding = TaxEmbeddingEngine.generateEmbedding(ch.content);
        await prisma.taxAuthorityChunk.create({
          data: {
            sourceId: sourceRecord.id,
            jurisdiction: src.jurisdiction,
            taxYear: src.taxYear,
            sectionPath: ch.sectionPath,
            heading: ch.heading,
            content: ch.content,
            pageNumber: ch.pageNumber,
            lineNumber: ch.lineNumber,
            authorityLevel: ch.authorityLevel,
            precedentialStatus: ch.precedentialStatus,
            embedding: embedding as any
          }
        });
        totalChunks++;
      }
    }

    // 2. Ingest Rules
    for (const r of rules) {
      await prisma.taxRule.upsert({
        where: {
          ruleId_taxYear_ruleVersion: {
            ruleId: r.ruleId,
            taxYear: r.taxYear,
            ruleVersion: r.ruleVersion || '2026.1'
          }
        },
        update: {
          title: r.title,
          description: r.description,
          conditions: r.conditions as any,
          requiredFacts: r.requiredFacts as any,
          exceptions: r.exceptions as any,
          thresholds: r.thresholds as any,
          phaseOuts: r.phaseOuts as any,
          elections: r.elections as any,
          calculationReference: r.calculationReference,
          formMappings: r.formMappings as any,
          federalConformityBehavior: r.federalConformityBehavior ?? 'CONFORMS',
          authorityRefs: r.authorityRefs as any,
          reviewStatus: RuleReviewStatus.ACTIVE,
          effectiveFrom: r.effectiveFrom
        },
        create: {
          ruleId: r.ruleId,
          jurisdiction: r.jurisdiction,
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
          calculationReference: r.calculationReference,
          formMappings: r.formMappings as any,
          federalConformityBehavior: r.federalConformityBehavior ?? 'CONFORMS',
          authorityRefs: r.authorityRefs as any,
          ruleVersion: r.ruleVersion || '2026.1',
          reviewStatus: RuleReviewStatus.ACTIVE,
          effectiveFrom: r.effectiveFrom
        }
      });
    }

    // 3. Ingest Conformity Records
    for (const cr of conformityRecords) {
      await prisma.federalStateConformity.upsert({
        where: {
          federalRuleId_state_taxYear: {
            federalRuleId: cr.federalRuleId,
            state: cr.state,
            taxYear: cr.taxYear
          }
        },
        update: {
          conformityStatus: cr.conformityStatus,
          stateAdjustmentRule: cr.stateAdjustmentRule as any,
          authorityRefs: cr.authorityRefs as any,
          effectiveFrom: cr.effectiveFrom
        },
        create: {
          federalRuleId: cr.federalRuleId,
          state: cr.state,
          taxYear: cr.taxYear,
          conformityStatus: cr.conformityStatus,
          stateAdjustmentRule: cr.stateAdjustmentRule as any,
          authorityRefs: cr.authorityRefs as any,
          effectiveFrom: cr.effectiveFrom
        }
      });
    }

    return {
      sourcesCount: sources.length,
      chunksCount: totalChunks,
      rulesCount: rules.length
    };
  }

  /**
   * Seeds all 6 jurisdictional packages into database.
   */
  public static async seedAllJurisdictions(taxYear: number = 2026): Promise<Record<string, any>> {
    const summary: Record<string, any> = {};
    for (const code of Array.from(this.providers.keys())) {
      summary[code] = await this.ingestJurisdiction(code, taxYear);
    }
    return summary;
  }
}
