/**
 * Autonomous Tax OS — Form 941 Agent
 * 
 * Compiles quarterly Form 941 returns and generates Schedule B allocations.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { Form941Engine } from '../../services/payroll/forms/form941Engine';
import { Form941CalculationResult, DepositFrequency } from '../../services/payroll/types';

export interface Form941AgentOutput {
  form941: Form941CalculationResult;
}

export class Form941Agent extends BaseAgent<any, Form941AgentOutput> {
  public readonly agentType = AgentType.FORM_941_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      taxYear: number;
      quarter: number;
      numEmployees: number;
      grossWagesCents: bigint;
      fitWithheldCents: bigint;
      taxableSsWagesCents: bigint;
      taxableMedWagesCents: bigint;
      taxableAddlMedWagesCents: bigint;
      totalDepositsCents: bigint;
      depositFrequency: DepositFrequency;
      dailyLiabilities?: { date: string; amountCents: bigint }[];
    }
  ): Promise<AgentResult<Form941AgentOutput>> {
    const result = await this.invokeTool(ctx, 'prepareForm941', input, async () => {
      return Form941Engine.calculateForm941(input);
    });

    return this.createSuccessResult(ctx, { form941: result }, {
      confidence: 1.0,
      recommendedNextAction: 'ROUTE_TO_CPA_APPROVAL'
    });
  }
}
