/**
 * Autonomous Tax OS — Form 940 Agent
 * 
 * Compiles annual Form 940 returns and verifies SUTA credit offsets.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { Form940Engine } from '../../services/payroll/forms/form940Engine';
import { Form940CalculationResult } from '../../services/payroll/types';

export interface Form940AgentOutput {
  form940: Form940CalculationResult;
}

export class Form940Agent extends BaseAgent<any, Form940AgentOutput> {
  public readonly agentType = AgentType.FORM_940_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      taxYear: number;
      totalPaymentsCents: bigint;
      exemptPaymentsCents: bigint;
      taxableFutaWagesCents: bigint;
      totalDepositsCents: bigint;
      creditReductionRate?: number;
    }
  ): Promise<AgentResult<Form940AgentOutput>> {
    const result = await this.invokeTool(ctx, 'prepareForm940', input, async () => {
      return Form940Engine.calculateForm940(input);
    });

    return this.createSuccessResult(ctx, { form940: result }, {
      confidence: 1.0,
      recommendedNextAction: 'ROUTE_TO_CPA_APPROVAL'
    });
  }
}
