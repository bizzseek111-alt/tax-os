/**
 * Autonomous Tax OS — Sales Tax Supervisor Agent
 * 
 * Orchestrates multi-state sales & use tax workflows:
 * nexus monitoring, registration checks, product taxability, sourcing,
 * marketplace segregation, reconciliation, and return preparation.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { prisma } from '../../db';
import { NexusEngine } from '../../services/salesTax/nexus/nexusEngine';
import { ReturnEngine } from '../../services/salesTax/returns/returnEngine';
import { ReconciliationEngine } from '../../services/salesTax/reconciliation/reconciliationEngine';

export interface SalesTaxSupervisorOutput {
  taxCaseId: string;
  activeStatesEvaluated: string[];
  nexusBreachesDetected: string[];
  totalGrossSalesCents: string;
  totalTaxPayableCents: string;
  reconciliationStatus: 'RECONCILED' | 'DISCREPANCIES_DETECTED';
  returnsPreparedCount: number;
}

export class SalesTaxSupervisorAgent extends BaseAgent<any, SalesTaxSupervisorOutput> {
  public readonly agentType = AgentType.SALES_TAX_SUPERVISOR;

  private nexusEngine = new NexusEngine();
  private returnEngine = new ReturnEngine();
  private reconciliationEngine = new ReconciliationEngine();

  protected async run(
    ctx: AgentExecutionContext,
    input: { states?: string[] }
  ): Promise<AgentResult<SalesTaxSupervisorOutput>> {
    const taxCase = await this.invokeTool(ctx, 'readSalesTaxCase', { taxCaseId: ctx.taxCaseId }, async () => {
      return await prisma.taxCase.findUnique({
        where: { id: ctx.taxCaseId },
        include: {
          salesTaxProfiles: true,
          salesTransactions: true
        }
      });
    });

    if (!taxCase) {
      throw new Error(`TaxCase '${ctx.taxCaseId}' not found`);
    }

    const targetStates = input?.states || (taxCase.salesTaxProfiles[0]?.activeStates || ['CA', 'NY', 'NJ', 'IL', 'MA']);
    const nexusBreaches: string[] = [];

    // 1. Evaluate Nexus across active states
    for (const st of targetStates) {
      const res = await this.nexusEngine.evaluateEconomicNexus(ctx.taxCaseId, st);
      if (res.hasNexus) {
        nexusBreaches.push(st);
      }
    }

    // 2. Perform Sales Tax Reconciliation
    const reconReport = await this.reconciliationEngine.reconcile({
      taxCaseId: ctx.taxCaseId
    });

    // 3. Prepare Sales Tax Returns for breached or active states
    let returnsCount = 0;
    let totalTaxPayable = BigInt(0);

    for (const st of nexusBreaches) {
      const ret = await this.returnEngine.generateReturn({
        organizationId: taxCase.organizationId,
        taxCaseId: ctx.taxCaseId,
        stateCode: st,
        periodYear: 2026,
        periodQuarter: 1,
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        endDate: new Date('2026-03-31T23:59:59.999Z'),
        dueDate: new Date('2026-04-30T23:59:59.999Z')
      });
      returnsCount++;
      totalTaxPayable += ret.netTaxPayableCents;
    }

    return this.createSuccessResult(
      ctx,
      {
        taxCaseId: ctx.taxCaseId,
        activeStatesEvaluated: targetStates,
        nexusBreachesDetected: nexusBreaches,
        totalGrossSalesCents: reconReport.totalGrossAmountCents.toString(),
        totalTaxPayableCents: totalTaxPayable.toString(),
        reconciliationStatus: reconReport.isReconciled ? 'RECONCILED' : 'DISCREPANCIES_DETECTED',
        returnsPreparedCount: returnsCount
      },
      {
        confidence: 0.96,
        recommendedNextAction: nexusBreaches.length > 0 ? 'PROCEED_TO_SALES_TAX_HUMAN_REVIEW' : 'MONITOR_NEXUS'
      }
    );
  }
}
