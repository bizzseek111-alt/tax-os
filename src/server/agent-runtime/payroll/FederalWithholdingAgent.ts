/**
 * Autonomous Tax OS — Federal Withholding Agent
 * 
 * Computes deterministic IRS Pub 15-T percentage method federal income tax withholding.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { FederalWithholdingEngine } from '../../services/payroll/federal/federalWithholdingEngine';
import { PayFrequency, W4Elections } from '../../services/payroll/types';

export interface FederalWithholdingOutput {
  fitWithholdingCents: bigint;
  annualAdjustedWageCents: bigint;
  annualTaxCents: bigint;
}

export class FederalWithholdingAgent extends BaseAgent<any, FederalWithholdingOutput> {
  public readonly agentType = AgentType.FEDERAL_WITHHOLDING_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      taxableWageCents: bigint;
      frequency: PayFrequency;
      w4: W4Elections;
    }
  ): Promise<AgentResult<FederalWithholdingOutput>> {
    const result = await this.invokeTool(ctx, 'calculatePub15T', input, async () => {
      return FederalWithholdingEngine.calculateRegularWithholding(input);
    });

    return this.createSuccessResult(ctx, result, {
      confidence: 1.0,
      recommendedNextAction: 'RECORD_EMPLOYEE_WITHHOLDING'
    });
  }
}
