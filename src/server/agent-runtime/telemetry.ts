/**
 * Autonomous Tax OS — Agent Telemetry, Cost Guardrails & Activity Feeds
 * 
 * Manages cost guardrails ($5 max per tax case workflow run), token telemetry,
 * execution latency, and role-scoped activity feeds:
 * - Taxpayer Feed (clean, non-technical updates)
 * - Professional Feed (detailed statutory rationale and adversarial challenge traces)
 * - Admin Cockpit (cost, tokens, error rates, model class distribution)
 */

import { prisma } from '../db';
import { AgentType } from './types';

export interface TelemetrySummary {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalCostUsd: number;
  averageLatencyMs: number;
  budgetCapUsd: number;
  budgetExceeded: boolean;
  modelBreakdown: Record<string, number>;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  agentType: string;
  userMessage: string;
  professionalMessage: string;
  status: string;
}

export class AgentTelemetryService {
  public static readonly CASE_BUDGET_CAP_USD = 5.00;

  /**
   * Retrieves overall telemetry metrics.
   */
  public static async getTelemetrySummary(taxCaseId?: string): Promise<TelemetrySummary> {
    const runs = await prisma.agentRun.findMany({
      where: taxCaseId ? { taxCaseId } : undefined,
      take: 1000,
      orderBy: { startedAt: 'desc' }
    });

    let totalCost = 0;
    let totalLatency = 0;
    let successCount = 0;
    let failedCount = 0;
    const modelBreakdown: Record<string, number> = {};

    for (const run of runs) {
      if (run.status === 'SUCCESS') successCount++;
      if (run.status === 'FAILED' || run.status === 'CIRCUIT_BROKEN') failedCount++;

      const cost = run.costMetadata ? (run.costMetadata as any).costUsd || 0 : 0;
      totalCost += cost;

      const duration = run.completedAt
        ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
        : 0;
      totalLatency += duration;

      const model = run.modelName || 'fast-classifier';
      modelBreakdown[model] = (modelBreakdown[model] || 0) + 1;
    }

    const avgLatency = runs.length > 0 ? Math.round(totalLatency / runs.length) : 0;

    return {
      totalRuns: runs.length,
      successfulRuns: successCount,
      failedRuns: failedCount,
      totalCostUsd: Math.round(totalCost * 10000) / 10000,
      averageLatencyMs: avgLatency,
      budgetCapUsd: this.CASE_BUDGET_CAP_USD,
      budgetExceeded: totalCost > this.CASE_BUDGET_CAP_USD,
      modelBreakdown
    };
  }

  /**
   * Generates tailored activity feeds for taxpayers and professionals.
   */
  public static async getActivityFeed(taxCaseId: string): Promise<ActivityFeedItem[]> {
    const runs = await prisma.agentRun.findMany({
      where: { taxCaseId },
      orderBy: { startedAt: 'asc' }
    });

    return runs.map(run => {
      let userMsg = 'Tax intelligence agent processed case facts.';
      let proMsg = `Agent ${run.agentType} executed with model ${run.modelName}.`;

      switch (run.agentType as AgentType) {
        case AgentType.INTAKE_AGENT:
          userMsg = 'Tax profile initialized and required information checked.';
          proMsg = 'Intake Agent evaluated taxpayer profile against filing requirements.';
          break;
        case AgentType.DEDUCTION_HUNTER:
          userMsg = 'Potential business deductions identified from your records.';
          proMsg = 'Deduction Hunter identified candidate Schedule C deductions under IRC § 162.';
          break;
        case AgentType.IRS_CHALLENGER_AGENT:
          userMsg = 'Adversarial audit review performed to verify your records protect you against penalties.';
          proMsg = 'IRS Challenger Agent stress-tested deductions against IRC § 274(d) substantiation standards.';
          break;
        case AgentType.FEDERAL_TAX_AGENT:
          userMsg = 'Deterministic federal calculation verified against IRS formulas.';
          proMsg = 'Federal Tax Engine executed 100% deterministic calculation of Form 1040 and schedules.';
          break;
      }

      return {
        id: run.id,
        timestamp: run.startedAt.toISOString(),
        agentType: run.agentType,
        userMessage: userMsg,
        professionalMessage: proMsg,
        status: run.status
      };
    });
  }
}
