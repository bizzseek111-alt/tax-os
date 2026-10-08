/**
 * Autonomous Tax OS — Sales Tax Reconciliation Agent
 * 
 * Performs 4-way reconciliation across e-commerce channels, payment processors,
 * GL Sales Tax Payable, and prepared returns. Identifies tax under/over-collections.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { ReconciliationEngine, ReconciliationReport } from '../../services/salesTax/reconciliation/reconciliationEngine';

export interface ReconciliationAgentOutput {
  report: {
    totalTransactions: number;
    totalGrossSalesCents: string;
    totalTaxCollectedCents: string;
    totalCalculatedTaxCents: string;
    netVarianceCents: string;
    discrepancyCount: number;
    isReconciled: boolean;
  };
  discrepancySummary: Array<{ type: string; severity: string; message: string }>;
}

export class SalesTaxReconciliationAgent extends BaseAgent<any, ReconciliationAgentOutput> {
  public readonly agentType = AgentType.SALES_TAX_RECONCILIATION_AGENT;
  private reconciliationEngine = new ReconciliationEngine();

  protected async run(
    ctx: AgentExecutionContext,
    input: { stateCode?: string; glSalesTaxPayableCents?: bigint }
  ): Promise<AgentResult<ReconciliationAgentOutput>> {
    const report: ReconciliationReport = await this.invokeTool(ctx, 'auditReconciliation', {}, async () => {
      return await this.reconciliationEngine.reconcile({
        taxCaseId: ctx.taxCaseId,
        stateCode: input?.stateCode,
        glSalesTaxPayableCents: input?.glSalesTaxPayableCents
      });
    });

    return this.createSuccessResult(
      ctx,
      {
        report: {
          totalTransactions: report.totalTransactionsEvaluated,
          totalGrossSalesCents: report.totalGrossAmountCents.toString(),
          totalTaxCollectedCents: report.totalTaxCollectedCents.toString(),
          totalCalculatedTaxCents: report.totalCalculatedTaxCents.toString(),
          netVarianceCents: report.netTaxDiscrepancyCents.toString(),
          discrepancyCount: report.discrepancies.length,
          isReconciled: report.isReconciled
        },
        discrepancySummary: report.discrepancies.map(d => ({
          type: d.type,
          severity: d.severity,
          message: d.message
        }))
      },
      {
        confidence: report.isReconciled ? 0.99 : 0.85,
        warnings: report.discrepancies.map(d => `[${d.severity}] ${d.message}`),
        requiresProfessionalReview: !report.isReconciled,
        recommendedNextAction: report.isReconciled ? 'PROCEED_TO_RETURN_FILING' : 'ESCALATE_DISCREPANCIES_TO_CPA'
      }
    );
  }
}
