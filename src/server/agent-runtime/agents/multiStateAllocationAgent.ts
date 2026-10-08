/**
 * Autonomous Tax OS — Multi-State Allocation Agent
 * 
 * Allocates wage, business, and pass-through income across multiple taxing jurisdictions.
 * Determines source state taxation and calculates preliminary Other State Tax Credit (OSTC)
 * to prevent double-taxation across resident and nonresident filings.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface StateIncomeItem {
  state: string;
  sourceWages: number;
  sourceBusinessIncome: number;
  taxWithheld: number;
}

export interface MultiStateAllocationInput {
  taxYear: number;
  residentState: string;
  totalFederalAgi: number;
  stateIncomes: StateIncomeItem[];
}

export interface StateAllocationSummary {
  state: string;
  isResident: boolean;
  allocatedIncome: number;
  allocationPercentage: number;
  withholdingReported: number;
  qualifiesForOtherStateCredit: boolean;
}

export interface MultiStateAllocationResult {
  residentState: string;
  allocations: StateAllocationSummary[];
  totalAllocatedIncome: number;
  allocationDiscrepancy: number;
  requiresReview: boolean;
}

export class MultiStateAllocationAgent extends BaseAgent<MultiStateAllocationInput, MultiStateAllocationResult> {
  public readonly agentType = AgentType.MULTI_STATE_ALLOCATION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: MultiStateAllocationInput
  ): Promise<AgentResult<MultiStateAllocationResult>> {
    let totalAllocated = 0;
    const allocations: StateAllocationSummary[] = [];

    for (const item of input.stateIncomes) {
      const stateTotal = item.sourceWages + item.sourceBusinessIncome;
      totalAllocated += stateTotal;
      const pct = input.totalFederalAgi > 0 ? (stateTotal / input.totalFederalAgi) * 100 : 0;
      const isResident = item.state === input.residentState;

      allocations.push({
        state: item.state,
        isResident,
        allocatedIncome: stateTotal,
        allocationPercentage: Math.round(pct * 100) / 100,
        withholdingReported: item.taxWithheld,
        qualifiesForOtherStateCredit: !isResident && stateTotal > 0
      });
    }

    const discrepancy = Math.abs(input.totalFederalAgi - totalAllocated);
    const requiresReview = discrepancy > 1.0;

    // Persist tax fact
    await this.invokeTool(
      ctx,
      'createTaxFact',
      { allocations, discrepancy },
      async () => {
        if (ctx.taxCaseId) {
          return await AgentDbHelper.createTaxFact({
            taxCaseId: ctx.taxCaseId,
            category: 'INCOME',
            factType: 'MULTI_STATE_ALLOCATION',
            confidence: requiresReview ? 0.80 : 0.98,
            normalizedValue: { allocations, discrepancy }
          });
        }
        return null;
      }
    );

    if (requiresReview) {
      await this.invokeTool(
        ctx,
        'createReviewTask',
        { title: `Multi-State Income Discrepancy: $${discrepancy.toFixed(2)}` },
        async () => {
          if (ctx.taxCaseId) {
            return await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: 'Multi-State Income Allocation Variance',
              reason: `Allocated state incomes ($${totalAllocated}) differ from Federal AGI ($${input.totalFederalAgi}).`,
              priority: 'MEDIUM',
              materialityUsd: discrepancy
            });
          }
          return null;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        residentState: input.residentState,
        allocations,
        totalAllocatedIncome: totalAllocated,
        allocationDiscrepancy: discrepancy,
        requiresReview
      },
      {
        confidence: requiresReview ? 0.85 : 0.98,
        contradictions: requiresReview ? [`Allocated income differs from Federal AGI by $${discrepancy}`] : [],
        requiresProfessionalReview: requiresReview
      }
    );
  }
}
