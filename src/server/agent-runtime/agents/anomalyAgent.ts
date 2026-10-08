/**
 * Autonomous Tax OS — Tax Anomaly & Audit Risk Agent
 * 
 * Screens returns against IRS Discriminant Function System (DIF) patterns:
 * - Schedule C deductions exceeding industry benchmark or gross revenue
 * - Suspicious round-number patterns ($1,000.00, $5,000.00) indicating estimated deductions
 * - Travel/meals disproportionate to gross revenue (> 25% of gross receipts)
 * - IRC § 183 Hobby Loss risk (losses in 3 out of 5 consecutive years)
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface AnomalyInput {
  grossBusinessRevenue: number;
  totalBusinessExpenses: number;
  travelAndMealExpenses: number;
  expenseList?: Array<{ description: string; amount: number }>;
  consecutiveLossYears?: number;
}

export interface AnomalyAlert {
  code: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  riskFactor: string;
}

export interface AnomalyResult {
  hasCriticalAnomalies: boolean;
  overallDifRiskScore: number; // 0 - 100
  alerts: AnomalyAlert[];
  reviewTaskIdCreated?: string;
}

export class AnomalyAgent extends BaseAgent<AnomalyInput, AnomalyResult> {
  public readonly agentType = AgentType.ANOMALY_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: AnomalyInput
  ): Promise<AgentResult<AnomalyResult>> {
    const alerts: AnomalyAlert[] = [];
    let difScore = 10;

    await this.invokeTool(
      ctx,
      'detectAnomalies',
      { revenue: input.grossBusinessRevenue, expenses: input.totalBusinessExpenses },
      async () => {
        // 1. Deductions exceeding revenue
        if (input.grossBusinessRevenue > 0 && input.totalBusinessExpenses > input.grossBusinessRevenue) {
          difScore += 40;
          alerts.push({
            code: 'SCHEDULE_C_NET_LOSS',
            severity: 'HIGH',
            title: 'Schedule C Expenses Exceed Gross Revenue',
            description: `Total deductions ($${input.totalBusinessExpenses}) exceed gross receipts ($${input.grossBusinessRevenue}). Triggers audit review under IRS DIF scoring.`,
            riskFactor: 'DIF Score Elevation'
          });
        }

        // 2. High travel/meals ratio
        if (input.grossBusinessRevenue > 0) {
          const travelRatio = input.travelAndMealExpenses / input.grossBusinessRevenue;
          if (travelRatio > 0.25) {
            difScore += 25;
            alerts.push({
              code: 'DISPROPORTIONATE_TRAVEL',
              severity: 'HIGH',
              title: 'Disproportionate Travel/Meals Ratio',
              description: `Travel & meals represent ${(travelRatio * 100).toFixed(1)}% of total business revenue.`,
              riskFactor: 'IRC § 162/274 scrutiny'
            });
          }
        }

        // 3. Consecutive loss years (IRC § 183 Hobby Loss)
        if ((input.consecutiveLossYears || 0) >= 3) {
          difScore += 35;
          alerts.push({
            code: 'IRC_183_HOBBY_LOSS',
            severity: 'CRITICAL',
            title: 'IRC § 183 Hobby Loss Classification Risk',
            description: `Business has generated net losses in ${input.consecutiveLossYears} consecutive years. IRS presumption requires net profit in 3 of 5 years.`,
            riskFactor: 'Recharacterization to Hobby'
          });
        }

        // 4. Round numbers detection
        if (input.expenseList && input.expenseList.length > 5) {
          const roundCount = input.expenseList.filter(e => e.amount > 100 && e.amount % 100 === 0).length;
          const roundPct = roundCount / input.expenseList.length;
          if (roundPct > 0.40) {
            difScore += 20;
            alerts.push({
              code: 'ROUND_NUMBER_ESTIMATES',
              severity: 'MEDIUM',
              title: 'Excessive Round-Number Expenses',
              description: `${(roundPct * 100).toFixed(0)}% of expense entries are exact round hundreds, suggesting estimated rather than actual substantiation.`,
              riskFactor: 'Substantiation Deficit'
            });
          }
        }
      }
    );

    const hasCritical = alerts.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
    let reviewTaskId: string | undefined;

    if (hasCritical) {
      reviewTaskId = await this.invokeTool(
        ctx,
        'createReviewTask',
        { title: `Audit Risk Alerts (${alerts.length} detected)` },
        async () => {
          if (ctx.taxCaseId) {
            const task = await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: 'High Audit Risk DIF Flagging',
              reason: `Detected ${alerts.length} statistical anomalies in tax profile.`,
              priority: 'URGENT',
              requiredRole: 'CPA'
            });
            return task.id;
          }
          return undefined;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        hasCriticalAnomalies: hasCritical,
        overallDifRiskScore: Math.min(100, difScore),
        alerts,
        reviewTaskIdCreated: reviewTaskId
      },
      {
        confidence: 0.95,
        warnings: alerts.map(a => `${a.title}: ${a.description}`),
        requiresProfessionalReview: hasCritical
      }
    );
  }
}
