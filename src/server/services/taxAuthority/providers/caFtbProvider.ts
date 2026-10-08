/**
 * Autonomous Tax OS — California Franchise Tax Board (US-CA) Authority Provider
 * 
 * Ingests authoritative California statutes, regulations, FTB legal rulings,
 * and Form 540 instructions.
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

export class CaFtbProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-CA';
  public readonly publisherName: string = 'CA_FRANCHISE_TAX_BOARD';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      {
        jurisdiction: 'US-CA',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'CA_OFFICE_OF_LEGISLATIVE_COUNSEL',
        title: 'Cal. Rev. & Tax. Code § 17041 - California Personal Income Tax Rates',
        citationCode: 'Cal. RTC § 17041',
        effectiveFrom: new Date(2012, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 540'],
        affectedSchedules: ['Schedule CA (540)'],
        topicTags: ['CALIFORNIA_TAX_RATES', 'PROGRESSIVE_TAX', 'MENTAL_HEALTH_SERVICES_TAX'],
        sourceVersion: '2026.1',
        rawContent: `Cal. Rev. & Tax. Code § 17041.
(a) There shall be imposed for each taxable year upon the entire taxable income of every resident of this state, taxes in the following rates and brackets:
(1) 1 percent on taxable income up to bracket ceiling;
(2) Progressive brackets up to 12.3 percent on taxable income exceeding statutory thresholds.
(h) Mental Health Services Act: An additional tax of 1 percent shall be imposed on California taxable income in excess of one million dollars ($1,000,000).`
      },
      {
        jurisdiction: 'US-CA',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'CA_OFFICE_OF_LEGISLATIVE_COUNSEL',
        title: 'Cal. Rev. & Tax. Code § 17215 - Disallowance of HSA Deduction',
        citationCode: 'Cal. RTC § 17215',
        effectiveFrom: new Date(2004, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form 540'],
        affectedSchedules: ['Schedule CA (540)'],
        topicTags: ['HSA_DEDUCTION', 'DISALLOWANCE', 'SCHEDULE_CA'],
        sourceVersion: '2026.1',
        rawContent: `Cal. Rev. & Tax. Code § 17215.
Section 223 of the Internal Revenue Code, relating to health savings accounts, shall not apply for purposes of this part. Any contributions deducted on federal Form 1040 must be added back as California income on Schedule CA (540).`
      },
      {
        jurisdiction: 'US-CA',
        taxYear,
        authorityType: AuthorityType.LEGAL_RULING,
        publisher: 'CA_FRANCHISE_TAX_BOARD',
        title: 'FTB Legal Ruling 2019-01 - Treatment of Federal Section 199A',
        citationCode: 'FTB Legal Ruling 2019-01',
        effectiveFrom: new Date(2019, 0, 1),
        precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
        affectedForms: ['Form 540'],
        topicTags: ['QBI_NON_CONFORMITY', 'PASS_THROUGH_ENTITIES'],
        sourceVersion: '2026.1',
        rawContent: `FTB Legal Ruling 2019-01:
Subject: Non-Conformity to IRC Section 199A Qualified Business Income Deduction.
California has not conformed to the federal deduction for qualified business income under Section 199A. Taxpayers calculating California taxable income may not claim the Section 199A deduction on California Form 540.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'CA-RTC-17215-HSA-ADD-BACK',
        jurisdiction: 'US-CA',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'HEALTH_SAVINGS_ACCOUNT',
        title: 'California HSA Deduction Disallowance and Add-Back',
        description: 'Disallows federal deduction under IRC § 223 for HSA contributions and adds back employer/individual contributions on Schedule CA (540).',
        conditions: {
          type: 'LEAF',
          factKey: 'deductions.federal_hsa_deduction_cents',
          operator: 'GREATER_THAN',
          value: 0,
          description: 'Taxpayer claimed a federal HSA deduction on Form 1040 Schedule 1'
        },
        requiredFacts: ['deductions.federal_hsa_deduction_cents'],
        exceptions: [],
        thresholds: {},
        phaseOuts: {},
        elections: {},
        calculationReference: 'californiaEngine.calculateHsaAdjustment',
        formMappings: ['Schedule CA (540):Part I, Section C, Line 13'],
        federalConformityBehavior: 'DECOUPLED',
        authorityRefs: ['Cal. Rev. & Tax. Code § 17215', 'FTB Pub 1001'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(2004, 0, 1)
      }
    ];
  }

  public async getConformityRecords(taxYear: number): Promise<StateConformityRecord[]> {
    return [
      {
        federalRuleId: 'FED-SEC-199A-QBI-DEDUCTION',
        state: 'US-CA',
        taxYear,
        conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
        stateAdjustmentRule: {
          adjustmentType: 'COMPLETE_DISALLOWANCE',
          description: 'California does not conform to IRC § 199A. The QBI deduction is disallowed on CA Form 540.',
          stateFormLine: 'CA Form 540, Line 18'
        },
        authorityRefs: ['Cal. Rev. & Tax. Code § 17024.5', 'FTB Legal Ruling 2019-01'],
        effectiveFrom: new Date(2018, 0, 1)
      }
    ];
  }
}
