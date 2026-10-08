/**
 * Autonomous Tax OS — State Withholding Agent
 * 
 * Computes deterministic multi-state personal income tax withholding
 * across CA, NY, NJ, IL, and MA.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { StatePayrollRegistry } from '../../services/payroll/state/statePayrollModule';
import {
  PayFrequency,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../../services/payroll/types';

export interface StateWithholdingOutput {
  withholdings: EmployeeWithholdingResult[];
  employerTaxes: EmployerTaxResult[];
  totalStateEmployeeCents: bigint;
  totalStateEmployerCents: bigint;
}

export class StateWithholdingAgent extends BaseAgent<any, StateWithholdingOutput> {
  public readonly agentType = AgentType.STATE_WITHHOLDING_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      stateCode: string;
      employeeId: string;
      sitTaxableWageCents: bigint;
      suiTaxableWageCents: bigint;
      grossWageCents: bigint;
      frequency: PayFrequency;
      config?: StateWithholdingConfig;
      isNycResident?: boolean;
      employerSuiRate?: number;
    }
  ): Promise<AgentResult<StateWithholdingOutput>> {
    const result = await this.invokeTool(ctx, 'calculateStatePitWithholding', input, async () => {
      return StatePayrollRegistry.calculateStatePayroll(input);
    });

    return this.createSuccessResult(ctx, result, {
      confidence: 1.0,
      recommendedNextAction: 'RECORD_STATE_WITHHOLDING'
    });
  }
}
