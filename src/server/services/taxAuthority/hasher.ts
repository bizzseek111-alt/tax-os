/**
 * Autonomous Tax OS — Tax Law Cryptographic Hasher
 * 
 * Provides deterministic SHA-256 hashing for:
 * - Raw and normalized legal source texts
 * - Structural legal chunks
 * - Normalized TaxRule AST conditions
 * - Complete TaxRuleSet versions
 * - State conformity definitions
 * 
 * Guarantees bit-for-bit change detection and immutable audit trails.
 */

import crypto from 'crypto';
import {
  AuthorityChunkInput,
  AuthoritySourceInput,
  NormalizedRulePayload,
  StateConformityRecord
} from './types';

export class TaxHasher {
  public static sha256(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public static hashSource(source: AuthoritySourceInput): string {
    const canonical = {
      jurisdiction: source.jurisdiction,
      taxYear: source.taxYear,
      authorityType: source.authorityType,
      citationCode: source.citationCode.trim(),
      title: source.title.trim(),
      effectiveFrom: source.effectiveFrom.toISOString(),
      effectiveTo: source.effectiveTo ? source.effectiveTo.toISOString() : null,
      rawContent: source.rawContent.trim()
    };
    return this.sha256(JSON.stringify(canonical));
  }

  public static hashChunk(chunk: AuthorityChunkInput): string {
    const canonical = {
      sectionPath: chunk.sectionPath.trim(),
      heading: chunk.heading ? chunk.heading.trim() : null,
      content: chunk.content.trim(),
      authorityLevel: chunk.authorityLevel,
      precedentialStatus: chunk.precedentialStatus
    };
    return this.sha256(JSON.stringify(canonical));
  }

  public static safeStringify(obj: any): string {
    return JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  }

  public static hashRule(rule: NormalizedRulePayload): string {
    const canonical = {
      ruleId: rule.ruleId,
      jurisdiction: rule.jurisdiction,
      taxYear: rule.taxYear,
      topic: rule.topic,
      conditions: rule.conditions,
      requiredFacts: [...rule.requiredFacts].sort(),
      exceptions: [...rule.exceptions].sort(),
      thresholds: rule.thresholds,
      phaseOuts: rule.phaseOuts,
      calculationReference: rule.calculationReference ?? null,
      formMappings: [...rule.formMappings].sort(),
      federalConformityBehavior: rule.federalConformityBehavior ?? 'CONFORMS',
      authorityRefs: [...rule.authorityRefs].sort()
    };
    return this.sha256(this.safeStringify(canonical));
  }

  public static hashRuleSet(rules: NormalizedRulePayload[]): string {
    const sortedHashes = rules
      .slice()
      .sort((a, b) => a.ruleId.localeCompare(b.ruleId))
      .map(r => `${r.ruleId}:${this.hashRule(r)}`);
    return this.sha256(sortedHashes.join('|'));
  }

  public static hashConformity(record: StateConformityRecord): string {
    const canonical = {
      federalRuleId: record.federalRuleId,
      state: record.state,
      taxYear: record.taxYear,
      conformityStatus: record.conformityStatus,
      stateAdjustmentRule: record.stateAdjustmentRule,
      authorityRefs: [...record.authorityRefs].sort()
    };
    return this.sha256(JSON.stringify(canonical));
  }
}
