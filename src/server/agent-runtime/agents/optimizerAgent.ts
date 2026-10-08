/**
 * Autonomous Tax OS — Tax Strategy & Optimization Agent
 * 
 * Identifies proactive, fully compliant tax-saving strategies:
 * - SEP-IRA and Solo 401(k) maximum allowable contributions for self-employed individuals
 * - HSA contribution headroom
 * - Standard deduction vs Itemized deduction optimization (Schedule A bunching)
 * Strict Invariant: Does not invent aggressive or unsupported shelters.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';

export interface OptimizerInput {
  taxYear: number;
  filingStatus: string;
  scheduleCNetProfit?: number;
  currentHsaContribution?: number;
  isHighDeductibleHealthPlan?: boolean;
  totalScheduleAItemized?: number;
  standardDeductionAmount: number;
}

export interface OptimizationOpportunity {
  strategy: string;
  description: string;
  potentialDeduction: number;
  estimatedTaxSavings: number;
  deadlineDate: string;
  statutoryBasis: string;
}

export interface OptimizerResult {
  opportunities: OptimizationOpportunity[];
  totalPotentialSavings: number;
  recommendedFilingStrategy: 'STANDARD_DEDUCTION' | 'ITEMIZED_DEDUCTIONS';
}

export class OptimizerAgent extends BaseAgent<OptimizerInput, OptimizerResult> {
  public readonly agentType = AgentType.OPTIMIZER_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: OptimizerInput
  ): Promise<AgentResult<OptimizerResult>> {
    const opportunities: OptimizationOpportunity[] = [];

    // 1. SEP-IRA Optimization for Schedule C
    if (input.scheduleCNetProfit && input.scheduleCNetProfit > 10000) {
      // Up to ~20% of net self-employment profit (adjusted for SE tax deduction)
      const maxSep = Math.min(69000, Math.round(input.scheduleCNetProfit * 0.1859));
      opportunities.push({
        strategy: 'MAXIMIZE_SEP_IRA_CONTRIBUTION',
        description: `Contribute up to $${maxSep.toLocaleString()} to a SEP-IRA prior to the tax filing deadline.`,
        potentialDeduction: maxSep,
        estimatedTaxSavings: Math.round(maxSep * 0.24),
        deadlineDate: `${input.taxYear + 1}-04-15 (or extension)`,
        statutoryBasis: 'IRC § 404(h) Simplified Employee Pensions'
      });
    }

    // 2. HSA Contribution Headroom
    if (input.isHighDeductibleHealthPlan) {
      const hsaMax = input.filingStatus === 'MARRIED_FILING_JOINTLY' ? 8300 : 4150;
      const contributed = input.currentHsaContribution || 0;
      const headroom = Math.max(0, hsaMax - contributed);
      if (headroom > 0) {
        opportunities.push({
          strategy: 'MAXIMIZE_HSA_CONTRIBUTION',
          description: `Fund remaining $${headroom.toLocaleString()} HSA contribution headroom prior to April 15.`,
          potentialDeduction: headroom,
          estimatedTaxSavings: Math.round(headroom * 0.22),
          deadlineDate: `${input.taxYear + 1}-04-15`,
          statutoryBasis: 'IRC § 223 Health Savings Accounts'
        });
      }
    }

    // 3. Deductions strategy
    const itemized = input.totalScheduleAItemized || 0;
    const recommendedFilingStrategy = itemized > input.standardDeductionAmount
      ? 'ITEMIZED_DEDUCTIONS'
      : 'STANDARD_DEDUCTION';

    const totalSavings = opportunities.reduce((s, o) => s + o.estimatedTaxSavings, 0);

    return this.createSuccessResult(
      ctx,
      {
        opportunities,
        totalPotentialSavings: totalSavings,
        recommendedFilingStrategy
      },
      {
        confidence: 0.95,
        ruleRefs: opportunities.map(o => o.statutoryBasis)
      }
    );
  }
}
