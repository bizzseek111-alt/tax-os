/**
 * Autonomous Tax OS — Illinois Department of Revenue (US-IL) Authority Provider
 * 
 * Ingests authoritative Illinois Income Tax Act statutes, regulations,
 * and Form IL-1040 instructions.
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

export class IlDorProvider implements TaxAuthorityProvider {
  public readonly jurisdiction: SupportedJurisdiction = 'US-IL';
  public readonly publisherName: string = 'IL_DEPT_REVENUE';

  public async getSources(taxYear: number): Promise<AuthoritySourceInput[]> {
    return [
      {
        jurisdiction: 'US-IL',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'IL_GENERAL_ASSEMBLY',
        title: '35 ILCS 5/201 - Illinois Flat Tax Rate',
        citationCode: '35 ILCS 5/201',
        effectiveFrom: new Date(2017, 6, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form IL-1040'],
        topicTags: ['FLAT_TAX_RATE', 'INDIVIDUAL_INCOME_TAX'],
        sourceVersion: '2026.1',
        rawContent: `35 ILCS 5/201. Tax Imposed.
In the case of an individual, trust or estate, for taxable years beginning on or after July 1, 2017, the tax imposed shall be an amount equal to 4.95% of the taxpayer's net income for the taxable year.`
      },
      {
        jurisdiction: 'US-IL',
        taxYear,
        authorityType: AuthorityType.STATUTE,
        publisher: 'IL_GENERAL_ASSEMBLY',
        title: '35 ILCS 5/203(a)(2)(F) - Subtraction of Retirement and Pension Income',
        citationCode: '35 ILCS 5/203(a)(2)(F)',
        effectiveFrom: new Date(1969, 7, 1),
        precedentialStatus: PrecedentialStatus.BINDING,
        affectedForms: ['Form IL-1040'],
        topicTags: ['PENSION_SUBTRACTION', 'RETIREMENT_EXEMPTION'],
        sourceVersion: '2026.1',
        rawContent: `35 ILCS 5/203(a)(2)(F).
There shall be subtracted from federal adjusted gross income an amount equal to all amounts included therein which are exempt from taxation by this State, including amounts received by reason of participation in a qualified employee pension, retirement, or disability plan, and Social Security benefits.`
      }
    ];
  }

  public async getRules(taxYear: number): Promise<NormalizedRulePayload[]> {
    return [
      {
        ruleId: 'IL-STAT-203-PENSION-SUBTRACTION',
        jurisdiction: 'US-IL',
        taxYear,
        taxDomain: 'INCOME_TAX',
        topic: 'RETIREMENT_SUBTRACTION',
        title: 'Illinois 100% Pension and Retirement Subtraction',
        description: 'Exempts 100% of federally taxable retirement plan distributions, qualified pensions, and Social Security benefits from Illinois income tax.',
        conditions: {
          type: 'LEAF',
          factKey: 'income.federally_taxable_pension_cents',
          operator: 'GREATER_THAN',
          value: 0,
          description: 'Taxpayer has federally taxable pension or retirement income included in AGI'
        },
        requiredFacts: ['income.federally_taxable_pension_cents'],
        exceptions: [],
        thresholds: {},
        phaseOuts: {},
        elections: {},
        calculationReference: 'illinoisEngine.calculateRetirementSubtraction',
        formMappings: ['Form IL-1040:Line 5'],
        federalConformityBehavior: 'CONFORMS',
        authorityRefs: ['35 ILCS 5/203(a)(2)(F)', 'IL Regs. § 100.2470'],
        ruleVersion: '2026.1',
        effectiveFrom: new Date(1969, 7, 1)
      }
    ];
  }

  public async getConformityRecords(taxYear: number): Promise<StateConformityRecord[]> {
    return [
      {
        federalRuleId: 'FED-SEC-199A-QBI-DEDUCTION',
        state: 'US-IL',
        taxYear,
        conformityStatus: ConformityStatus.ROLLING_CONFORMITY,
        stateAdjustmentRule: {
          adjustmentType: 'COMPLETE_DISALLOWANCE',
          description: 'Illinois base income starts at federal AGI; § 199A is a below-the-line deduction and is not subtracted on IL-1040.',
          stateFormLine: 'IL-1040, Line 1'
        },
        authorityRefs: ['35 ILCS 5/203(e)'],
        effectiveFrom: new Date(2018, 0, 1)
      }
    ];
  }
}
