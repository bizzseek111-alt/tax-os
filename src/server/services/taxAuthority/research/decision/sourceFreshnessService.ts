/**
 * Autonomous Tax OS — Official Source Freshness Service
 * 
 * Tracks freshness, source hashes, TTL windows, and change detection across official sources.
 * TTL Rules:
 * - Statutes: 365 days
 * - Regulations: 180 days
 * - Administrative Guidance / Notices / Instructions: 90 days
 * - FAQs / Bulletins: 30 days
 */

import crypto from 'crypto';
import prisma from '../../../../db';
import { AuthorityType } from '../../types';
import { FreshnessStatus } from '@prisma/client';
import { OfficialConnectorRegistry } from '../connectors/connectorRegistry';
import { OfficialSourceItem } from '../connectors/baseConnector';

export interface SourceFreshnessCheckResult {
  citationCode: string;
  jurisdiction: string;
  status: FreshnessStatus;
  isExpired: boolean;
  daysSinceLastCheck: number;
  currentHash: string;
  latestHash?: string;
  newVersion?: string;
}

export class OfficialSourceFreshnessService {
  private static instance: OfficialSourceFreshnessService;

  private constructor() {}

  public static getInstance(): OfficialSourceFreshnessService {
    if (!OfficialSourceFreshnessService.instance) {
      OfficialSourceFreshnessService.instance = new OfficialSourceFreshnessService();
    }
    return OfficialSourceFreshnessService.instance;
  }

  /**
   * Returns the maximum allowable TTL in days before a re-check against the official agency portal is mandatory.
   */
  public getTtlDays(authorityType: AuthorityType): number {
    switch (authorityType) {
      case AuthorityType.STATUTE:
        return 365;
      case AuthorityType.REGULATION:
        return 180;
      case AuthorityType.REVENUE_RULING:
      case AuthorityType.REVENUE_PROCEDURE:
      case AuthorityType.NOTICE:
      case AuthorityType.FORM_INSTRUCTION:
      case AuthorityType.LEGAL_RULING:
      case AuthorityType.TECHNICAL_MEMORANDUM:
        return 90;
      case AuthorityType.OFFICIAL_PUBLICATION:
      case AuthorityType.ADMINISTRATIVE_GUIDANCE:
      case AuthorityType.FAQ:
      default:
        return 30;
    }
  }

  /**
   * Checks the freshness status of an official citation code.
   */
  public async checkFreshness(
    jurisdiction: string,
    citationCode: string,
    authorityType: AuthorityType,
    taxYear: number
  ): Promise<SourceFreshnessCheckResult> {
    const ttlDays = this.getTtlDays(authorityType);
    let record: any = null;

    try {
      record = await prisma.officialSourceFreshness.findUnique({
        where: {
          jurisdiction_citationCode_taxYear_sourceVersion: {
            jurisdiction,
            citationCode,
            taxYear,
            sourceVersion: '2026.1'
          }
        }
      });
    } catch {
      // In-memory or fallback mode if DB query fails
    }

    const now = new Date();
    if (!record) {
      // Never checked before: CHECK_REQUIRED
      return {
        citationCode,
        jurisdiction,
        status: FreshnessStatus.CHECK_REQUIRED,
        isExpired: true,
        daysSinceLastCheck: 999,
        currentHash: ''
      };
    }

    const diffMs = now.getTime() - new Date(record.lastCheckedAt).getTime();
    const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = daysSince > ttlDays;

    if (isExpired) {
      return {
        citationCode,
        jurisdiction,
        status: FreshnessStatus.CHECK_REQUIRED,
        isExpired: true,
        daysSinceLastCheck: daysSince,
        currentHash: record.sourceHash
      };
    }

    return {
      citationCode,
      jurisdiction,
      status: record.status as FreshnessStatus,
      isExpired: false,
      daysSinceLastCheck: daysSince,
      currentHash: record.sourceHash
    };
  }

  /**
   * Executes live verification against the official connector to verify whether the source text or hash has changed.
   */
  public async verifyAndRecordSource(source: OfficialSourceItem): Promise<OfficialSourceFreshnessCheckResult> {
    const registry = OfficialConnectorRegistry.getInstance();
    const connector = registry.getConnector(source.jurisdiction);
    if (!connector) {
      throw new Error(`No connector registered for jurisdiction ${source.jurisdiction}`);
    }

    const now = new Date();
    const changeResult = await connector.detectChanges(source.citationCode, source.contentHash, source.taxYear);

    let finalStatus: FreshnessStatus = changeResult.status as FreshnessStatus;
    let finalHash = source.contentHash;

    if (changeResult.hasChanged && changeResult.newHash) {
      finalHash = changeResult.newHash;
      finalStatus = changeResult.status as FreshnessStatus;
    }

    try {
      await prisma.officialSourceFreshness.upsert({
        where: {
          jurisdiction_citationCode_taxYear_sourceVersion: {
            citationCode: source.citationCode,
            jurisdiction: source.jurisdiction,
            taxYear: source.taxYear,
            sourceVersion: source.sourceVersion || '2026.1'
          }
        },
        create: {
          citationCode: source.citationCode,
          jurisdiction: source.jurisdiction,
          taxYear: source.taxYear,
          sourceHash: finalHash,
          sourceVersion: source.sourceVersion || '2026.1',
          lastCheckedAt: now,
          status: finalStatus,
          checkDetails: {
            title: source.title,
            precedentialStatus: source.precedentialStatus,
            effectiveFrom: source.effectiveFrom.toISOString(),
            effectiveTo: source.effectiveTo ? source.effectiveTo.toISOString() : null
          }
        },
        update: {
          sourceHash: finalHash,
          sourceVersion: source.sourceVersion || '2026.1',
          lastCheckedAt: now,
          status: finalStatus,
          checkDetails: {
            title: source.title,
            precedentialStatus: source.precedentialStatus,
            effectiveFrom: source.effectiveFrom.toISOString(),
            effectiveTo: source.effectiveTo ? source.effectiveTo.toISOString() : null
          }
        }
      });
    } catch (err) {
      // In-memory or transient fallback
      console.warn('[OfficialSourceFreshnessService] DB update failed, proceeding in memory:', err);
    }

    return {
      citationCode: source.citationCode,
      jurisdiction: source.jurisdiction,
      status: finalStatus,
      isExpired: false,
      daysSinceLastCheck: 0,
      currentHash: finalHash,
      newVersion: changeResult.newVersion
    };
  }
}

export type OfficialSourceFreshnessCheckResult = SourceFreshnessCheckResult;
