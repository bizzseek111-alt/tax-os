/**
 * Autonomous Tax OS — Massachusetts Department of Revenue (US-MA) Authority Provider
 * 
 * Ingests authoritative Massachusetts General Laws Chapter 62 statutes,
 * 4% Fair Share Amendment provisions, and Form 1 instructions.
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

export class MaDorProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-MA';
  public readonly publisherName: string = 'MA_DEPT_REVENUE';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      {
        jurisdiction: 'US-MA',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'MA_GENERAL_COURT',
        title: 'M.G.L. c. 62 § 4 - Massachusetts Personal Income Tax Rates',
        citationCode: 'M.G.L. c. 62 § 4',
        effectiveFrom: new Date(2020, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 1'],
        topicTags: ['PART_B_INCOME', 'STANDARD_RATE', 'FORM_1'],
        sourceVersion: '2026.1',
        rawContent: `M.G.L. c. 62 § 4.
Part B taxable income shall be taxed at the rate of 5.0 percent. Part A taxable income consisting of short-term capital gains shall be taxed at 8.5 percent.`
      },
      {
        jurisdiction: 'US-MA',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'MA_GENERAL_COURT',
        title: 'Mass. Const. Amend. Art. XLIV - 4% Fair Share Surtax on Millionaires',
        citationCode: 'Mass. Const. Amend. Art. XLIV',
        effectiveFrom: new Date(2023, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 1', 'Schedule 4% Surtax'],
        topicTags: ['SURTAX', 'MILLIONAIRE_TAX', 'FAIR_SHARE_AMENDMENT'],
        sourceVersion: '2026.1',
        rawContent: `Mass. Const. Amend. Art. XLIV:
There shall be an additional tax of 4 percent on that portion of annual taxable income in excess of $1,000,000 (adjusted annually for inflation) to provide resources for education and transportation.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'MA-CONST-ART-44-FAIR-SHARE-SURTAX',
        jurisdiction: 'US-MA',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'HIGH_INCOME_SURTAX',
        title: 'Massachusetts 4% Fair Share Surtax on Taxable Income Over $1,000,000',
        description: 'Applies an additional 4.0% surtax on Massachusetts taxable income exceeding the statutory $1,000,000 threshold (adjusted for inflation to $1,053,750 for 2026).',
        conditions: {
          type: 'LEAF',
          factKey: 'income.massachusetts_taxable_income_cents',
          operator: 'GREATER_THAN',
          value: 105375000,
          description: 'Total Massachusetts taxable income exceeds statutory inflation-adjusted threshold'
        },
        requiredFacts: ['income.massachusetts_taxable_income_cents'],
        exceptions: [],
        thresholds: {
          surtaxThresholdCents: 105375000n
        },
        phaseOuts: {},
        elections: {},
        calculationReference: 'massachusettsEngine.calculateFairShareSurtax',
        formMappings: ['MA Form 1:Line 28b'],
        federalConformityBehavior: 'DECOUPLED',
        authorityRefs: ['Mass. Const. Amend. Art. XLIV', 'M.G.L. c. 62 § 4', 'TIR 23-4'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(2023, 0, 1)
      }
    ];
  }

  public async getConformityRecords(taxYear: number): Promise<StateConformityRecord[]> {
    return [
      {
        federalRuleId: 'FED-SEC-199A-QBI-DEDUCTION',
        state: 'US-MA',
        taxYear,
        conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
        stateAdjustmentRule: {
          adjustmentType: 'COMPLETE_DISALLOWANCE',
          description: 'Massachusetts conforms to the IRC as of 2022 and specifically decouples from § 199A on MA Form 1.',
          stateFormLine: 'MA Form 1, Line 14'
        },
        authorityRefs: ['M.G.L. c. 62 § 1(c)', 'TIR 18-14'],
        effectiveFrom: new Date(2018, 0, 1)
      }
    ];
  }
}
