/**
 * Autonomous Tax OS — Sales Tax Return Preparation Agent
 * 
 * Prepares deterministic state returns (CDTFA-401-A, NY ST-100, IL ST-1, NJ ST-50, MA ST-9)
 * with complete line item breakdowns, county/district schedules, and calculation lineage.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { ReturnEngine, GenerateReturnParams } from '../../services/salesTax/returns/returnEngine';
import { prisma } from '../../db';

export interface ReturnAgentOutput {
  returnId: string;
  stateCode: string;
  formName: string;
  grossSalesCents: string;
  taxableSalesCents: string;
  totalTaxDueCents: string;
  netTaxPayableCents: string;
  vendorCreditCents: string;
}

export class SalesTaxReturnAgent extends BaseAgent<any, ReturnAgentOutput> {
  public readonly agentType = AgentType.SALES_TAX_RETURN_AGENT;
  private returnEngine = new ReturnEngine();

  protected async run(
    ctx: AgentExecutionContext,
    input: { stateCode: string; periodYear?: number; periodQuarter?: number }
  ): Promise<AgentResult<ReturnAgentOutput>> {
    const taxCase = await prisma.taxCase.findUnique({ where: { id: ctx.taxCaseId } });
    if (!taxCase) throw new Error(`TaxCase '${ctx.taxCaseId}' not found`);

    const state = input.stateCode.toUpperCase();
    const year = input.periodYear || 2026;
    const quarter = input.periodQuarter || 1;

    const taxReturn = await this.invokeTool(ctx, 'generateReturn', { state, year, quarter }, async () => {
      return await this.returnEngine.generateReturn({
        organizationId: taxCase.organizationId,
        taxCaseId: ctx.taxCaseId,
        stateCode: state,
        periodYear: year,
        periodQuarter: quarter,
        startDate: new Date(`${year}-01-01T00:00:00.000Z`),
        endDate: new Date(`${year}-03-31T23:59:59.999Z`),
        dueDate: new Date(`${year}-04-30T23:59:59.999Z`)
      });
    });

    return this.createSuccessResult(
      ctx,
      {
        returnId: taxReturn.id,
        stateCode: taxReturn.stateCode,
        formName: taxReturn.returnFormName,
        grossSalesCents: taxReturn.grossSalesCents.toString(),
        taxableSalesCents: taxReturn.taxableSalesCents.toString(),
        totalTaxDueCents: taxReturn.totalTaxDueCents.toString(),
        netTaxPayableCents: taxReturn.netTaxPayableCents.toString(),
        vendorCreditCents: taxReturn.vendorCollectionCreditCents.toString()
      },
      {
        confidence: 0.99,
        requiresProfessionalReview: true,
        recommendedNextAction: 'ROUTE_TO_CPA_FOR_APPROVAL'
      }
    );
  }
}
