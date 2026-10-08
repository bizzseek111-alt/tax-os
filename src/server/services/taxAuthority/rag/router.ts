/**
 * Autonomous Tax OS — Tax Law Query Router & Jurisdiction Isolation Guard
 * 
 * Invariants Enforced:
 * 1. Jurisdiction Isolation: Queries for California (US-CA) NEVER accidentally retrieve New York (US-NY) laws.
 * 2. Tax Year Isolation: Queries for tax year 2026 NEVER return 2025 or 2024 rules unless explicitly auditing prior years.
 * 3. Scope Verification: Validates that queries have valid statutory targets.
 */

import { SupportedJurisdiction, TaxResearchQuery } from '../types';

export class TaxLawQueryRouter {
  public static readonly VALID_JURISDICTIONS: SupportedJurisdiction[] = [
    'US-FED',
    'US-CA',
    'US-NY',
    'US-NJ',
    'US-IL',
    'US-MA'
  ];

  public static routeAndValidate(rawQuery: TaxResearchQuery): TaxResearchQuery {
    if (!rawQuery.query || rawQuery.query.trim().length === 0) {
      throw new Error('INVALID_TAX_QUERY: Query text cannot be empty');
    }

    // 1. Verify jurisdiction
    if (!this.VALID_JURISDICTIONS.includes(rawQuery.jurisdiction)) {
      throw new Error(
        `UNSUPPORTED_JURISDICTION: Jurisdiction '${rawQuery.jurisdiction}' is not supported. Supported jurisdictions: ${this.VALID_JURISDICTIONS.join(', ')}`
      );
    }

    // 2. Verify tax year
    const taxYear = rawQuery.taxYear ?? 2026;
    if (isNaN(taxYear) || taxYear < 2018 || taxYear > 2030) {
      throw new Error(`INVALID_TAX_YEAR: Tax year ${taxYear} is out of supported range (2018-2030)`);
    }

    return {
      ...rawQuery,
      query: rawQuery.query.trim(),
      taxYear,
      limit: rawQuery.limit && rawQuery.limit > 0 ? Math.min(rawQuery.limit, 50) : 10
    };
  }

  /**
   * Detects whether a federal rule query has state conformity implications.
   */
  public static detectConformityTriggers(queryText: string): {
    hasConformityTrigger: boolean;
    suggestedStates: SupportedJurisdiction[];
    topic?: string;
  } {
    const text = queryText.toLowerCase();
    const suggested: SupportedJurisdiction[] = [];

    let topic: string | undefined;
    if (text.includes('199a') || text.includes('qbi') || text.includes('qualified business income')) {
      topic = 'QUALIFIED_BUSINESS_INCOME';
      suggested.push('US-CA', 'US-NY', 'US-NJ');
    } else if (text.includes('bonus depreciation') || text.includes('168(k)')) {
      topic = 'BONUS_DEPRECIATION';
      suggested.push('US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA');
    } else if (text.includes('hsa') || text.includes('health savings')) {
      topic = 'HEALTH_SAVINGS_ACCOUNT';
      suggested.push('US-CA', 'US-NJ');
    } else if (text.includes('pension') || text.includes('retirement subtraction')) {
      topic = 'RETIREMENT_SUBTRACTION';
      suggested.push('US-IL');
    } else if (text.includes('millionaire') || text.includes('surtax') || text.includes('high income surtax')) {
      topic = 'HIGH_INCOME_SURTAX';
      suggested.push('US-MA', 'US-NY', 'US-NJ');
    }

    return {
      hasConformityTrigger: suggested.length > 0,
      suggestedStates: suggested,
      topic
    };
  }
}
