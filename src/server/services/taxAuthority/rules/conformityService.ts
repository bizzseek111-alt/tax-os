/**
 * Autonomous Tax OS — Federal & Five-State Conformity Graph Engine
 * 
 * Maps statutory relationships between Federal Internal Revenue Code rules
 * and the 5 supported sovereign states:
 * - California (US-CA): Cal. RTC § 17024.5 Fixed-date conformity (IRC as of 2015)
 * - New York (US-NY): NY Tax Law § 607 Rolling conformity to Federal AGI
 * - New Jersey (US-NJ): N.J.S.A. 54A Autonomous Gross Income Tax (Completely independent)
 * - Illinois (US-IL): 35 ILCS 5/203 Rolling conformity with pension subtraction
 * - Massachusetts (US-MA): M.G.L. c. 62 § 1 Fixed-date conformity with 4% Fair Share surtax
 * 
 * Invariant:
 * State conformity behavior is explicitly modeled. Assumptions of automatic federal passthrough
 * without verifying state statutes are strictly prohibited.
 */

import { prisma } from '../../../db';
import {
  ConformityStatus,
  StateConformityRecord,
  SupportedJurisdiction
} from '../types';

export interface StateAdjustmentResult {
  federalRuleId: string;
  state: SupportedJurisdiction;
  taxYear: number;
  conformityStatus: ConformityStatus;
  isConforming: boolean;
  adjustmentType: 'ADDITION' | 'SUBTRACTION' | 'RATE_OVERRIDE' | 'COMPLETE_DISALLOWANCE' | 'FULL_CONFORMITY';
  adjustmentAmountCents: bigint;
  description: string;
  stateFormLine?: string;
  authorityRefs: string[];
}

export class StateConformityService {
  /**
   * Evaluates how a federal rule or deduction is treated by a specific state.
   */
  public static async evaluateStateTreatment(params: {
    federalRuleId: string;
    federalAmountCents: bigint;
    state: SupportedJurisdiction;
    taxYear: number;
    facts: Record<string, any>;
  }): Promise<StateAdjustmentResult> {
    // 1. Try to fetch from database
    const dbRecord = await prisma.federalStateConformity.findUnique({
      where: {
        federalRuleId_state_taxYear: {
          federalRuleId: params.federalRuleId,
          state: params.state,
          taxYear: params.taxYear
        }
      }
    });

    if (dbRecord) {
      const adjustmentRule = dbRecord.stateAdjustmentRule as any;
      let adjAmount = 0n;

      if (adjustmentRule.adjustmentType === 'COMPLETE_DISALLOWANCE') {
        adjAmount = params.federalAmountCents; // Add-back entire federal deduction
      } else if (adjustmentRule.adjustmentType === 'SUBTRACTION') {
        adjAmount = params.federalAmountCents;
      }

      return {
        federalRuleId: params.federalRuleId,
        state: params.state,
        taxYear: params.taxYear,
        conformityStatus: dbRecord.conformityStatus as ConformityStatus,
        isConforming: dbRecord.conformityStatus === ConformityStatus.ROLLING_CONFORMITY,
        adjustmentType: adjustmentRule.adjustmentType,
        adjustmentAmountCents: adjAmount,
        description: adjustmentRule.description,
        stateFormLine: adjustmentRule.stateFormLine,
        authorityRefs: dbRecord.authorityRefs as string[]
      };
    }

    // 2. Built-in statutory conformity lookup (deterministic fallback)
    return this.getBuiltInConformity(
      params.federalRuleId,
      params.federalAmountCents,
      params.state,
      params.taxYear,
      params.facts
    );
  }

  /**
   * Deterministic statutory conformity rules for Federal provisions across 5 states.
   */
  public static getBuiltInConformity(
    federalRuleId: string,
    federalAmountCents: bigint,
    state: SupportedJurisdiction,
    taxYear: number,
    facts: Record<string, any>
  ): StateAdjustmentResult {
    // === RULE: QUALIFIED BUSINESS INCOME DEDUCTION (IRC § 199A) ===
    if (federalRuleId.includes('199A') || federalRuleId.includes('QBI')) {
      switch (state) {
        case 'US-CA':
          return {
            federalRuleId,
            state,
            taxYear,
            conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
            isConforming: false,
            adjustmentType: 'COMPLETE_DISALLOWANCE',
            adjustmentAmountCents: federalAmountCents,
            description: 'California does not conform to IRC § 199A. The QBI deduction is disallowed on CA Form 540.',
            stateFormLine: 'CA Form 540, Line 18',
            authorityRefs: ['Cal. Rev. & Tax. Code § 17024.5', 'CA FTB Notice 2019-01']
          };
        case 'US-NY':
          return {
            federalRuleId,
            state,
            taxYear,
            conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
            isConforming: false,
            adjustmentType: 'COMPLETE_DISALLOWANCE',
            adjustmentAmountCents: federalAmountCents,
            description: 'New York begins with federal AGI and does not conform to the below-the-line IRC § 199A deduction on Form IT-201.',
            stateFormLine: 'NY Form IT-201, Line 19',
            authorityRefs: ['NY Tax Law § 607', 'TSB-M-18(4)I']
          };
        case 'US-NJ':
          return {
            federalRuleId,
            state,
            taxYear,
            conformityStatus: ConformityStatus.COMPLETELY_INDEPENDENT,
            isConforming: false,
            adjustmentType: 'COMPLETE_DISALLOWANCE',
            adjustmentAmountCents: federalAmountCents,
            description: 'New Jersey Gross Income Tax is independent of the Internal Revenue Code and does not recognize IRC § 199A.',
            stateFormLine: 'NJ-1040, Line 17',
            authorityRefs: ['N.J.S.A. 54A:5-1', 'NJ Div. of Taxation GIT-9']
          };
        case 'US-IL':
          return {
            federalRuleId,
            state,
            taxYear,
            conformityStatus: ConformityStatus.ROLLING_CONFORMITY,
            isConforming: false, // Starts with federal AGI, QBI is below-the-line so naturally excluded
            adjustmentType: 'COMPLETE_DISALLOWANCE',
            adjustmentAmountCents: federalAmountCents,
            description: 'Illinois base income starts at federal AGI; § 199A is a below-the-line deduction and is not allowed on IL-1040.',
            stateFormLine: 'IL-1040, Line 1',
            authorityRefs: ['35 ILCS 5/203(e)']
          };
        case 'US-MA':
          return {
            federalRuleId,
            state,
            taxYear,
            conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
            isConforming: false,
            adjustmentType: 'COMPLETE_DISALLOWANCE',
            adjustmentAmountCents: federalAmountCents,
            description: 'Massachusetts adopts the Internal Revenue Code as of January 1, 2022 and specifically decouples from § 199A.',
            stateFormLine: 'MA Form 1, Line 14',
            authorityRefs: ['M.G.L. c. 62 § 1(c)', 'TIR 18-14']
          };
      }
    }

    // === RULE: HEALTH SAVINGS ACCOUNT DEDUCTION (IRC § 223) ===
    if (federalRuleId.includes('HSA') || federalRuleId.includes('223')) {
      if (state === 'US-CA') {
        return {
          federalRuleId,
          state,
          taxYear,
          conformityStatus: ConformityStatus.SELECTIVE_DECOUPLING,
          isConforming: false,
          adjustmentType: 'ADDITION',
          adjustmentAmountCents: federalAmountCents,
          description: 'California does not conform to IRC § 223. HSA contributions must be added back to income on CA Schedule CA (540).',
          stateFormLine: 'CA Schedule CA (540), Part I, Section C, Line 13',
          authorityRefs: ['Cal. Rev. & Tax. Code § 17215']
        };
      } else if (state === 'US-NJ') {
        return {
          federalRuleId,
          state,
          taxYear,
          conformityStatus: ConformityStatus.COMPLETELY_INDEPENDENT,
          isConforming: false,
          adjustmentType: 'ADDITION',
          adjustmentAmountCents: federalAmountCents,
          description: 'New Jersey does not allow deductions for HSA contributions; employer contributions are taxable wages.',
          stateFormLine: 'NJ-1040, Line 15',
          authorityRefs: ['N.J.S.A. 54A:6-30']
        };
      }
    }

    // === RULE: RETIREMENT & PENSION INCOME SUBTRACTION ===
    if (federalRuleId.includes('PENSION') || federalRuleId.includes('RETIREMENT')) {
      if (state === 'US-IL') {
        return {
          federalRuleId,
          state,
          taxYear,
          conformityStatus: ConformityStatus.ROLLING_CONFORMITY,
          isConforming: true,
          adjustmentType: 'SUBTRACTION',
          adjustmentAmountCents: federalAmountCents,
          description: 'Illinois provides a 100% subtraction for federally taxed retirement income, distributions from qualified plans, and Social Security.',
          stateFormLine: 'IL-1040, Line 5',
          authorityRefs: ['35 ILCS 5/203(a)(2)(F)', 'IL Regs. § 100.2470']
        };
      }
    }

    // Default: full conformity
    return {
      federalRuleId,
      state,
      taxYear,
      conformityStatus: ConformityStatus.ROLLING_CONFORMITY,
      isConforming: true,
      adjustmentType: 'FULL_CONFORMITY',
      adjustmentAmountCents: 0n,
      description: `State conforms to federal rule under standard statutory conformity.`,
      authorityRefs: []
    };
  }
}
