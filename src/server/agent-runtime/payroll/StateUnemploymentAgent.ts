/**
 * Autonomous Tax OS — State Unemployment Agent
 * 
 * Computes deterministic State Unemployment Insurance (SUI) employer taxes
 * based on state wage caps and employer experience rates.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { WageBaseService } from '../../services/payroll/taxableWages/wageBaseService';

export interface StateUnemploymentOutput {
  stateCode: string;
  suiWageBaseCents: bigint;
  taxableWagesCents: bigint;
  employerSuiRate: number;
  suiTaxAmountCents: bigint;
}

export class StateUnemploymentAgent extends BaseAgent<any, StateUnemploymentOutput> {
  public readonly agentType = AgentType.STATE_UNEMPLOYMENT_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      stateCode: string;
      taxableWagesCents: bigint;
      employerExperienceRate?: number;
    }
  ): Promise<AgentResult<StateUnemploymentOutput>> {
    const rate = input.employerExperienceRate || 0.034;
    const wageBase = WageBaseService.STATE_SUI_WAGE_BASES_2026[input.stateCode] || BigInt(700000);
    const taxable = input.taxableWagesCents > wageBase ? wageBase : input.taxableWagesCents;
    const taxCents = BigInt(Math.round(Number(taxable) * rate));

    return this.createSuccessResult(
      ctx,
      {
        stateCode: input.stateCode,
        suiWageBaseCents: wageBase,
        taxableWagesCents: taxable,
        employerSuiRate: rate,
        suiTaxAmountCents: taxCents
      },
      { confidence: 1.0, recommendedNextAction: 'ACCRUE_SUI_LIABILITY' }
    );
  }
}
