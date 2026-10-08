/**
 * Autonomous Tax OS — New Jersey Division of Taxation (US-NJ) Authority Provider
 * 
 * Ingests authoritative New Jersey Gross Income Tax Act statutes, regulations,
 * and Form NJ-1040 instructions.
 */

import {
  AuthoritySourceInput,
  AuthorityType,
  ConformityStatus,
  NormalizedRulePayload,
  PrecedentialStatus,
  StateConformityRecord,
  SupportedJurisdiction
} from '../types';
import { TaxAuthorityProvider } from './base';

export class NjDivTaxProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-NJ';
  public readonly publisherName: string = 'NJ_DIV_TAXATION';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      {
        jurisdiction: 'US-NJ',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'NJ_LEGISLATURE',
        title: 'N.J.S.A. 54A:2-1 - Imposition of New Jersey Gross Income Tax',
        citationCode: 'N.J.S.A. 54A:2-1',
        effectiveFrom: new Date(1976, 6, 8),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form NJ-1040'],
        topicTags: ['GROSS_INCOME_TAX', 'TAX_RATES', 'NJ1040'],
        sourceVersion: '2026.1',
        rawContent: `N.J.S.A. 54A:2-1. Imposition of tax.
There is hereby imposed a tax upon the New Jersey gross income of every individual at rates graduated from 1.4% up to 10.75% for income exceeding $1,000,000.`
      },
      {
        jurisdiction: 'US-NJ',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'NJ_LEGISLATURE',
        title: 'N.J.S.A. 54A:5-2 - Prohibition of Cross-Category Loss Netting',
        citationCode: 'N.J.S.A. 54A:5-2',
        effectiveFrom: new Date(1976, 6, 8),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form NJ-1040'],
        topicTags: ['CROSS_NETTING_PROHIBITION', 'CATEGORICAL_INCOME'],
        sourceVersion: '2026.1',
        rawContent: `N.J.S.A. 54A:5-2. Losses.
Losses incurred in one category of gross income shall not be used to offset gains or income realized in any other category of gross income. A net loss in business profits (Schedule C) may not reduce gross wages or interest income.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'NJ-STAT-54A-5-2-NO-CROSS-NETTING',
        jurisdiction: 'US-NJ',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'INCOME_CATEGORIES',
        title: 'New Jersey Cross-Category Loss Netting Prohibition',
        description: 'Prohibits taxpayers from using a net loss in one income category (e.g. sole proprietorship) to offset income in another category (e.g. wages).',
        conditions: {
          type: 'LEAF',
          factKey: 'business.net_profit_cents',
          operator: 'LESS_THAN',
          value: 0,
          description: 'Taxpayer sustained a net loss in business income category'
        },
        requiredFacts: ['business.net_profit_cents'],
        exceptions: [],
        thresholds: {},
        phaseOuts: {},
        elections: {},
        calculationReference: 'newJerseyEngine.enforceCategoricalIncomeIsolation',
        formMappings: ['Form NJ-1040:Line 17'],
        federalConformityBehavior: 'DECOUPLED',
        authorityRefs: ['N.J.S.A. 54A:5-2', 'N.J.A.C. 18:35-1.1'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(1976, 6, 8)
      }
    ];
  }

  public async getConformityRecords(taxYear: number): Promise<StateConformityRecord[]> {
    return [
      {
        federalRuleId: 'FED-SEC-199A-QBI-DEDUCTION',
        state: 'US-NJ',
        taxYear,
        conformityStatus: ConformityStatus.COMPLETELY_INDEPENDENT,
        stateAdjustmentRule: {
          adjustmentType: 'COMPLETE_DISALLOWANCE',
          description: 'New Jersey Gross Income Tax is completely independent of the IRC and does not recognize IRC § 199A.',
          stateFormLine: 'NJ-1040, Line 17'
        },
        authorityRefs: ['N.J.S.A. 54A:5-1', 'NJ Div of Taxation GIT-9'],
        effectiveFrom: new Date(2018, 0, 1)
      }
    ];
  }
}
