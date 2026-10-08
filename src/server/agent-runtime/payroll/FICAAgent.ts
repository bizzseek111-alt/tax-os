/**
 * Autonomous Tax OS — FICA Agent
 * 
 * Computes deterministic Social Security, Medicare, and Additional Medicare taxes.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { FicaFutaEngine } from '../../services/payroll/federal/ficaFutaEngine';
import { EmployeeWithholdingResult, EmployerTaxResult } from '../../services/payroll/types';

export interface FicaOutput {
  withholdings: EmployeeWithholdingResult[];
  employerTaxes: EmployerTaxResult[];
  totalFicaEmployeeCents: bigint;
  totalFicaEmployerCents: bigint;
}

export class FICAAgent extends BaseAgent<any, FicaOutput> {
  public readonly agentType = AgentType.FICA_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      employeeId: string;
      taxableSsWagesCents: bigint;
      taxableMedWagesCents: bigint;
      taxableAddlMedWagesCents: bigint;
    }
  ): Promise<AgentResult<FicaOutput>> {
    const result = await this.invokeTool(ctx, 'calculateOasdi', input, async () => {
      return FicaFutaEngine.calculateFica(input);
    });

    return this.createSuccessResult(ctx, result, {
      confidence: 1.0,
      recommendedNextAction: 'RECORD_FICA_LIABILITY'
    });
  }
}
