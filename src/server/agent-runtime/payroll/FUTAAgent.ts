/**
 * Autonomous Tax OS — FUTA Agent
 * 
 * Computes deterministic Federal Unemployment Tax (FUTA) liabilities.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { FicaFutaEngine } from '../../services/payroll/federal/ficaFutaEngine';
import { EmployerTaxResult } from '../../services/payroll/types';

export interface FutaOutput {
  futaTax: EmployerTaxResult;
}

export class FUTAAgent extends BaseAgent<any, FutaOutput> {
  public readonly agentType = AgentType.FUTA_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      employeeId: string;
      taxableFutaWagesCents: bigint;
      creditReductionRate?: number;
    }
  ): Promise<AgentResult<FutaOutput>> {
    const result = await this.invokeTool(ctx, 'calculateFuta', input, async () => {
      return FicaFutaEngine.calculateFuta(input);
    });

    return this.createSuccessResult(ctx, { futaTax: result }, {
      confidence: 1.0,
      recommendedNextAction: 'RECORD_FUTA_LIABILITY'
    });
  }
}
