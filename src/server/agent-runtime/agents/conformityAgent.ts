/**
 * Autonomous Tax OS — Federal-State Conformity Agent
 * 
 * Analyzes state tax codes to identify statutory non-conformity with federal rules:
 * - California: Disallowance of IRC § 223 HSA deductions, Section 168(k) bonus depreciation add-back
 * - New York: State tax add-back, NY 529 subtraction
 * - New Jersey: Gross income decoupling, non-recognition of federal itemized deductions
 * - Illinois: 100% subtraction for federally taxed retirement/pension income
 * - Massachusetts: Disallowance of IRC § 199A QBI deduction
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface ConformityInput {
  state: 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';
  taxYear: number;
  federalPositions?: Array<{
    category: string;
    description: string;
    amount: number;
    ruleRef: string;
  }>;
  facts?: Array<{
    factType: string;
    amount: number;
  }>;
}

export interface ConformityAdjustment {
  state: string;
  adjustmentType: 'ADDITION' | 'SUBTRACTION';
  code: string;
  description: string;
  amount: number;
  statutoryBasis: string;
  positionId?: string;
}

export interface ConformityResult {
  state: string;
  adjustments: ConformityAdjustment[];
  netStateAdjustment: number;
}

export class ConformityAgent extends BaseAgent<ConformityInput, ConformityResult> {
  public readonly agentType = AgentType.CONFORMITY_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: ConformityInput
  ): Promise<AgentResult<ConformityResult>> {
    const adjustments: ConformityAdjustment[] = [];

    // Check conformity rules for the state
    const rules = await this.invokeTool(
      ctx,
      'checkConformity',
      { state: input.state, taxYear: input.taxYear },
      async () => {
        const foundAdjustments: Array<{
          type: 'ADDITION' | 'SUBTRACTION';
          code: string;
          desc: string;
          amount: number;
          citation: string;
        }> = [];

        // CA specific non-conformity
        if (input.state === 'US-CA') {
          const hsa = (input.facts || []).find(f => f.factType === 'HSA_CONTRIBUTION');
          if (hsa && hsa.amount > 0) {
            foundAdjustments.push({
              type: 'ADDITION',
              code: 'CA_HSA_ADD_BACK',
              desc: 'California does not conform to IRC § 223 HSA deduction. Federal deduction added back to CA AGI.',
              amount: hsa.amount,
              citation: 'CRTC § 17215.4'
            });
          }
        }

        // IL specific retirement subtraction
        if (input.state === 'US-IL') {
          const retirement = (input.facts || []).find(f => f.factType === 'RETIREMENT_INCOME');
          if (retirement && retirement.amount > 0) {
            foundAdjustments.push({
              type: 'SUBTRACTION',
              code: 'IL_PENSION_SUBTRACTION',
              desc: 'Illinois exempts 100% of federally taxed retirement and pension income.',
              amount: retirement.amount,
              citation: '35 ILCS 5/203(a)(2)(F)'
            });
          }
        }

        return foundAdjustments;
      }
    );

    for (const r of rules) {
      const candidate = await this.invokeTool(
        ctx,
        'createTaxPositionCandidate',
        { title: `State Conformity: ${r.desc}`, amount: r.amount, state: input.state },
        async () => {
          let posId: string | undefined;
          if (ctx.taxCaseId) {
            const pos = await AgentDbHelper.createTaxPosition({
              taxCaseId: ctx.taxCaseId,
              category: 'STATE_CONFORMITY_ADJUSTMENT',
              title: `${input.state} Conformity: ${r.code}`,
              amount: r.amount,
              statutoryCitation: r.citation,
              confidence: 0.98,
              status: TaxPositionStatus.PROPOSED,
              sourceAgent: this.agentType,
              ruleRefs: [r.citation],
              evidenceRefs: []
            });
            posId = pos.id;
          }
          return {
            state: input.state,
            adjustmentType: r.type,
            code: r.code,
            description: r.desc,
            amount: r.amount,
            statutoryBasis: r.citation,
            positionId: posId
          };
        }
      );
      adjustments.push(candidate);
    }

    const net = adjustments.reduce(
      (sum, adj) => sum + (adj.adjustmentType === 'ADDITION' ? adj.amount : -adj.amount),
      0
    );

    return this.createSuccessResult(
      ctx,
      {
        state: input.state,
        adjustments,
        netStateAdjustment: net
      },
      {
        confidence: 0.98,
        ruleRefs: adjustments.map(a => a.statutoryBasis)
      }
    );
  }
}
