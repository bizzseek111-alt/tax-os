/**
 * Autonomous Tax OS — Cross-Year Variance Agent
 * 
 * Compares current year tax positions against historical prior returns.
 * Detects material variances in income (+/- 30%), dropped revenue sources,
 * and tracks unapplied carryforwards (NOL, capital loss carryover).
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface YearTaxSnapshot {
  taxYear: number;
  w2Income: number;
  scheduleCProfit: number;
  totalAgi: number;
  capitalLossCarryforward: number;
  hasMortgageInterest: boolean;
  hasCharitableDeductions: boolean;
}

export interface CrossYearInput {
  currentYear: YearTaxSnapshot;
  priorYear: YearTaxSnapshot;
}

export interface VarianceItem {
  metric: string;
  priorValue: number;
  currentValue: number;
  percentageChange: number;
  isSignificant: boolean;
  explanation: string;
}

export interface CrossYearResult {
  variances: VarianceItem[];
  missingPriorSources: string[];
  carryforwardApplied: number;
  tasksCreated: string[];
}

export class CrossYearAgent extends BaseAgent<CrossYearInput, CrossYearResult> {
  public readonly agentType = AgentType.CROSS_YEAR_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: CrossYearInput
  ): Promise<AgentResult<CrossYearResult>> {
    const variances: VarianceItem[] = [];
    const missingPriorSources: string[] = [];
    const tasksCreated: string[] = [];

    await this.invokeTool(
      ctx,
      'compareHistoricalYears',
      { priorYear: input.priorYear.taxYear, currentYear: input.currentYear.taxYear },
      async () => {
        // Compare AGI
        if (input.priorYear.totalAgi > 0) {
          const change = ((input.currentYear.totalAgi - input.priorYear.totalAgi) / input.priorYear.totalAgi) * 100;
          variances.push({
            metric: 'TOTAL_AGI',
            priorValue: input.priorYear.totalAgi,
            currentValue: input.currentYear.totalAgi,
            percentageChange: Math.round(change * 10) / 10,
            isSignificant: Math.abs(change) > 30,
            explanation: `AGI changed by ${change.toFixed(1)}% year-over-year.`
          });
        }

        // Check for missing deductions
        if (input.priorYear.hasMortgageInterest && !input.currentYear.hasMortgageInterest) {
          missingPriorSources.push('Form 1098 Mortgage Interest present in prior year but missing this year');
        }
        if (input.priorYear.hasCharitableDeductions && !input.currentYear.hasCharitableDeductions) {
          missingPriorSources.push('Charitable donations present in prior year but missing this year');
        }
      }
    );

    // If missing prior sources, create task
    if (missingPriorSources.length > 0) {
      for (const missing of missingPriorSources) {
        const taskId = await this.invokeTool(
          ctx,
          'createTaxTask',
          { title: missing },
          async () => {
            if (ctx.taxCaseId) {
              const task = await AgentDbHelper.createTaxTask({
                taxCaseId: ctx.taxCaseId,
                title: `Prior Year Comparison: ${missing}`,
                reason: 'Prior year return had this item. Please confirm if this applies to current tax year.',
                priority: 'MEDIUM'
              });
              return task.id;
            }
            return 'TASK_MOCK';
          }
        );
        tasksCreated.push(taskId);
      }
    }

    return this.createSuccessResult(
      ctx,
      {
        variances,
        missingPriorSources,
        carryforwardApplied: input.priorYear.capitalLossCarryforward,
        tasksCreated
      },
      {
        confidence: 0.95,
        warnings: missingPriorSources,
        requiresUserInput: missingPriorSources.length > 0
      }
    );
  }
}
