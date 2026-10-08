/**
 * Autonomous Tax OS — Deposit Schedule Agent
 * 
 * Determines statutory deposit schedules (Monthly, Semi-Weekly, Next-Day)
 * and monitors EFTPS / State payment deadlines.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { DepositScheduleEngine } from '../../services/payroll/deposits/depositScheduleEngine';
import { DepositFrequency } from '../../services/payroll/types';

export interface DepositScheduleOutput {
  appliedFrequency: DepositFrequency;
  dueDate: Date;
  isNextDayRuleTriggered: boolean;
}

export class DepositScheduleAgent extends BaseAgent<any, DepositScheduleOutput> {
  public readonly agentType = AgentType.DEPOSIT_SCHEDULE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      payDate: Date;
      accumulatedLiabilityCents: bigint;
      frequency: DepositFrequency;
    }
  ): Promise<AgentResult<DepositScheduleOutput>> {
    const result = await this.invokeTool(ctx, 'calculateDepositSchedule', input, async () => {
      return DepositScheduleEngine.calculateFederalDepositDueDate(input);
    });

    return this.createSuccessResult(ctx, result, {
      confidence: 1.0,
      warnings: result.isNextDayRuleTriggered
        ? ['NEXT_DAY_RULE_TRIGGERED: Federal tax liability exceeds $100,000. Immediate next-day EFTPS deposit required.']
        : undefined,
      recommendedNextAction: 'SCHEDULE_PAYMENT_REMITTANCE'
    });
  }
}
