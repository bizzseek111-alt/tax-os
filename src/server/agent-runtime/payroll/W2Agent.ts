/**
 * Autonomous Tax OS — W-2 Agent
 * 
 * Generates employee Form W-2 records and validates statutory box mappings.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { W2W3Engine } from '../../services/payroll/forms/w2w3Engine';
import { W2CalculationResult } from '../../services/payroll/types';

export interface W2AgentOutput {
  w2: W2CalculationResult;
}

export class W2Agent extends BaseAgent<any, W2AgentOutput> {
  public readonly agentType = AgentType.W2_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      employeeId: string;
      taxYear: number;
      annualGrossWagesCents: bigint;
      annualFitTaxableWagesCents: bigint;
      annualFitWithheldCents: bigint;
      annualSsWagesCents: bigint;
      annualSsTaxWithheldCents: bigint;
      annualMedWagesCents: bigint;
      annualMedTaxWithheldCents: bigint;
      annual401kCents: bigint;
      annualHsaCents: bigint;
      stateWithholdings: { state: string; stateWagesCents: bigint; stateTaxCents: bigint }[];
      localWithholdings?: { locality: string; localWagesCents: bigint; localTaxCents: bigint }[];
      box14Items?: { label: string; amountCents: bigint }[];
    }
  ): Promise<AgentResult<W2AgentOutput>> {
    const result = await this.invokeTool(ctx, 'generateW2Record', input, async () => {
      return W2W3Engine.generateW2(input);
    });

    return this.createSuccessResult(ctx, { w2: result }, {
      confidence: 1.0,
      recommendedNextAction: 'AGGREGATE_INTO_W3'
    });
  }
}
