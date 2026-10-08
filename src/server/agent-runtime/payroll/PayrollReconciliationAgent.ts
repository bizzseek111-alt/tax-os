/**
 * Autonomous Tax OS — Payroll Reconciliation Agent
 * 
 * Conducts multi-way audit of payroll runs against Form 941, W-2/W-3, and GL accounts.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { PayrollReconciliationEngine } from '../../services/payroll/reconciliation/payrollReconciliationEngine';
import { ReconciliationAnomaly } from '../../services/payroll/types';

export interface PayrollReconciliationOutput {
  isBalanced: boolean;
  anomalies: ReconciliationAnomaly[];
  status: 'BALANCED' | 'DISCREPANCY_DETECTED';
}

export class PayrollReconciliationAgent extends BaseAgent<any, PayrollReconciliationOutput> {
  public readonly agentType = AgentType.PAYROLL_RECONCILIATION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      runTotalGrossWagesCents: bigint;
      runTotalFitWithheldCents: bigint;
      runTotalFicaTaxesCents: bigint;
      form941Line2WagesCents: bigint;
      form941Line3FitCents: bigint;
      form941Line5eFicaCents: bigint;
    }
  ): Promise<AgentResult<PayrollReconciliationOutput>> {
    const result = await this.invokeTool(ctx, 'reconcile941ToPayroll', input, async () => {
      return PayrollReconciliationEngine.reconcilePayrollRunsTo941(input);
    });

    const status = result.isBalanced ? 'BALANCED' : 'DISCREPANCY_DETECTED';

    return this.createSuccessResult(
      ctx,
      {
        isBalanced: result.isBalanced,
        anomalies: result.anomalies,
        status
      },
      {
        confidence: 0.99,
        warnings: result.anomalies.map(a => `${a.code}: ${a.description}`),
        recommendedNextAction: result.isBalanced ? 'PROCEED_TO_FILING' : 'FLAG_FOR_REVIEW'
      }
    );
  }
}
