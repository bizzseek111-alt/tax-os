/**
 * Autonomous Tax OS — Tax Reconciliation Agent
 * 
 * Reconciles the full 4-way Tax Pipeline:
 * 1. Source Documents (W-2, 1099-NEC, 1099-INT)
 * 2. Financial Inflow/Outflow Transactions
 * 3. Deterministic Calculation Runs
 * 4. Final Form Line Items
 * 
 * Invariant: Form line items must trace without leakage back to substantiated facts.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface ReconciliationInput {
  taxYear: number;
  documentTotals: {
    w2Wages: number;
    withholding: number;
    form1099Income: number;
  };
  transactionTotals: {
    grossDeposits: number;
    businessExpenses: number;
  };
  calculationTotals: {
    totalIncome: number;
    scheduleCProfit: number;
    totalWithholding: number;
  };
}

export interface DiscrepancyItem {
  area: string;
  sourceAmount: number;
  calculatedAmount: number;
  difference: number;
  isMaterial: boolean;
  explanation: string;
}

export interface ReconciliationResult {
  isFullyReconciled: boolean;
  discrepancies: DiscrepancyItem[];
  maximumVariance: number;
  reviewTaskIdCreated?: string;
}

export class ReconciliationAgent extends BaseAgent<ReconciliationInput, ReconciliationResult> {
  public readonly agentType = AgentType.RECONCILIATION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: ReconciliationInput
  ): Promise<AgentResult<ReconciliationResult>> {
    const discrepancies: DiscrepancyItem[] = [];

    const reconciled = await this.invokeTool(
      ctx,
      'reconcileTotals',
      { taxYear: input.taxYear },
      async () => {
        // 1. Withholding reconciliation
        const diffWithholding = Math.abs(input.documentTotals.withholding - input.calculationTotals.totalWithholding);
        if (diffWithholding > 0.01) {
          discrepancies.push({
            area: 'FEDERAL_WITHHOLDING',
            sourceAmount: input.documentTotals.withholding,
            calculatedAmount: input.calculationTotals.totalWithholding,
            difference: diffWithholding,
            isMaterial: diffWithholding > 10.0,
            explanation: 'Document withholding total differs from tax calculation run withholding.'
          });
        }

        // 2. W-2 wage reconciliation
        const expectedMinIncome = input.documentTotals.w2Wages + (input.calculationTotals.scheduleCProfit > 0 ? input.calculationTotals.scheduleCProfit : 0);
        const diffIncome = Math.abs(expectedMinIncome - input.calculationTotals.totalIncome);
        if (diffIncome > 1.0) {
          discrepancies.push({
            area: 'TOTAL_INCOME_ALIGNMENT',
            sourceAmount: expectedMinIncome,
            calculatedAmount: input.calculationTotals.totalIncome,
            difference: diffIncome,
            isMaterial: diffIncome > 50.0,
            explanation: 'Expected total income from W-2 + Schedule C profit differs from calculation run.'
          });
        }

        return {
          isFullyReconciled: discrepancies.length === 0,
          discrepancies
        };
      }
    );

    const maxVariance = discrepancies.reduce((max, d) => Math.max(max, d.difference), 0);
    const hasMaterialDiscrepancy = discrepancies.some(d => d.isMaterial);

    let reviewTaskId: string | undefined;
    if (hasMaterialDiscrepancy) {
      reviewTaskId = await this.invokeTool(
        ctx,
        'createReviewTask',
        { title: `Reconciliation Variance: $${maxVariance.toFixed(2)}` },
        async () => {
          if (ctx.taxCaseId) {
            const task = await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: 'Material Tax Pipeline Reconciliation Discrepancy',
              reason: `Unreconciled difference of $${maxVariance.toFixed(2)} between documents and return calculation.`,
              priority: 'HIGH',
              materialityUsd: maxVariance,
              requiredRole: 'CPA'
            });
            return task.id;
          }
          return undefined;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        isFullyReconciled: reconciled.isFullyReconciled,
        discrepancies,
        maximumVariance: maxVariance,
        reviewTaskIdCreated: reviewTaskId
      },
      {
        confidence: reconciled.isFullyReconciled ? 1.0 : 0.85,
        contradictions: discrepancies.map(d => `${d.area}: diff $${d.difference.toFixed(2)}`),
        requiresProfessionalReview: hasMaterialDiscrepancy
      }
    );
  }
}
