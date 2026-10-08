/**
 * Autonomous Tax OS — New York Department of Taxation and Finance (US-NY) Authority Provider
 * 
 * Ingests authoritative New York statutes, regulations, TSB-M memoranda,
 * and Form IT-201 instructions.
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

export class NyDtfProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-NY';
  public readonly publisherName: string = 'NY_DEPT_TAX_FINANCE';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      {
        jurisdiction: 'US-NY',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'NY_STATE_SENATE',
        title: 'NY Tax Law § 601 - Personal Income Tax Rates and Surcharges',
        citationCode: 'NY Tax Law § 601',
        effectiveFrom: new Date(2010, 0, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form IT-201'],
        topicTags: ['NEW_YORK_TAX_RATES', 'BENEFIT_RECAPTURE', 'IT201'],
        sourceVersion: '2026.1',
        rawContent: `NY Tax Law § 601.
(a) Resident individuals. There is hereby imposed on the New York taxable income of every resident individual a tax computed at progressive rates ranging from 4.0% to 10.9%.
(d) Tax table benefit recapture. For taxpayers with New York adjusted gross income exceeding $107,650, the benefit of the lower tax brackets is recaptured via the tax computation worksheet.`
      },
      {
        jurisdiction: 'US-NY',
        taxYear,
        authorityType: AuthorityType.TECHNICAL_MEMORANDUM,
        publisher: 'NY_DEPT_TAX_FINANCE',
        title: 'TSB-M-18(4)I - New York State Decoupling from Federal TCJA Provisions',
        citationCode: 'TSB-M-18(4)I',
        effectiveFrom: new Date(2018, 5, 1),
        precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
        affectedForms: ['Form IT-201', 'Form IT-558'],
        topicTags: ['TCJA_DECOUPLING', 'SALT_DEDUCTION', 'SECTION_199A'],
        sourceVersion: '2026.1',
        rawContent: `TSB-M-18(4)I Summary of 2018-2019 Budget Legislation:
New York State personal income tax does not allow the federal qualified business income deduction under IRC Section 199A on Form IT-201. Taxpayers must compute New York taxable income starting from federal AGI without reducing income by Section 199A.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'NY-TAX-LAW-601-BRACKET-RECAPTURE',
        jurisdiction: 'US-NY',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'BENEFIT_RECAPTURE',
        title: 'New York Tax Table Benefit Recapture',
        description: 'Recaptures the tax savings from the lower tax brackets for high-income taxpayers with NY AGI exceeding $107,650.',
        conditions: {
          type: 'LEAF',
          factKey: 'income.new_york_agi_cents',
          operator: 'GREATER_THAN',
          value: 10765000,
          description: 'New York AGI exceeds $107,650'
        },
        requiredFacts: ['income.new_york_agi_cents'],
        exceptions: [],
        thresholds: {
          recaptureThresholdCents: 10765000n
        },
        phaseOuts: {},
        elections: {},
        calculationReference: 'newYorkEngine.calculateTaxBenefitRecapture',
        formMappings: ['Form IT-201:Line 39'],
        federalConformityBehavior: 'MODIFIED',
        authorityRefs: ['NY Tax Law § 601(d)', 'NY Form IT-201 Instructions'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(2010, 0, 1)
      }
    ];
  }

  public async getConformityRecords(taxYear: number): Promise<StateConformityRecord[]> {
    return [
      {
        federalRuleId: 'FED-SEC-199A-QBI-DEDUCTION',
        state: 'US-NY',
        taxYear,
        conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
        stateAdjustmentRule: {
          adjustmentType: 'COMPLETE_DISALLOWANCE',
          description: 'New York begins with federal AGI and does not allow the below-the-line IRC § 199A deduction on Form IT-201.',
          stateFormLine: 'NY Form IT-201, Line 19'
        },
        authorityRefs: ['NY Tax Law § 607', 'TSB-M-18(4)I'],
        effectiveFrom: new Date(2018, 0, 1)
      }
    ];
  }
}
