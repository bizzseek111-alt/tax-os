/**
 * Autonomous Tax OS — W-3 Agent
 * 
 * Aggregates all W-2 records into Form W-3 Transmittal and verifies parity with quarterly Form 941s.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { W2W3Engine } from '../../services/payroll/forms/w2w3Engine';
import { W2CalculationResult, W3CalculationResult } from '../../services/payroll/types';

export interface W3AgentOutput {
  w3: W3CalculationResult;
}

export class W3Agent extends BaseAgent<any, W3AgentOutput> {
  public readonly agentType = AgentType.W3_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      taxYear: number;
      w2Records: W2CalculationResult[];
      quarterly941Totals?: {
        q1toQ4Line2WagesCents: bigint;
        q1toQ4Line3FitCents: bigint;
        q1toQ4Line5aTaxableSsWagesCents: bigint;
        q1toQ4Line5aTaxCents: bigint;
        q1toQ4Line5cTaxableMedWagesCents: bigint;
        q1toQ4Line5cTaxCents: bigint;
      };
    }
  ): Promise<AgentResult<W3AgentOutput>> {
    const result = await this.invokeTool(ctx, 'aggregateW3Totals', input, async () => {
      return W2W3Engine.compileW3(input);
    });

    return this.createSuccessResult(ctx, { w3: result }, {
      confidence: result.reconciliationStatus === 'BALANCED' ? 1.0 : 0.85,
      warnings: result.discrepancies,
      recommendedNextAction: result.reconciliationStatus === 'BALANCED' ? 'APPROVE_ANNUAL_W2_BATCH' : 'INVESTIGATE_W3_MISMATCH'
    });
  }
}
