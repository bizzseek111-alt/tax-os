/**
 * Autonomous Tax OS — Nexus Agent
 * 
 * Monitors physical presence facts and economic nexus statutory thresholds
 * (South Dakota v. Wayfair) across CA, NY, NJ, IL, MA.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { NexusEngine, NexusEvaluationResult } from '../../services/salesTax/nexus/nexusEngine';

export interface NexusAgentOutput {
  stateEvaluations: NexusEvaluationResult[];
  breachedStates: string[];
  warningStates: string[];
}

export class NexusAgent extends BaseAgent<any, NexusAgentOutput> {
  public readonly agentType = AgentType.NEXUS_AGENT;
  private nexusEngine = new NexusEngine();

  protected async run(
    ctx: AgentExecutionContext,
    input: { states?: string[] }
  ): Promise<AgentResult<NexusAgentOutput>> {
    const states = input?.states || ['CA', 'NY', 'NJ', 'IL', 'MA'];
    const evaluations: NexusEvaluationResult[] = [];
    const breachedStates: string[] = [];
    const warningStates: string[] = [];

    for (const state of states) {
      const res = await this.invokeTool(ctx, 'evaluateNexus', { state }, async () => {
        return await this.nexusEngine.evaluateEconomicNexus(ctx.taxCaseId, state);
      });

      evaluations.push(res);
      if (res.hasNexus) breachedStates.push(state);
      else if (res.warningTriggered) warningStates.push(state);
    }

    return this.createSuccessResult(
      ctx,
      {
        stateEvaluations: evaluations,
        breachedStates,
        warningStates
      },
      {
        confidence: 0.98,
        warnings: warningStates.map(s => `Approaching economic nexus threshold in ${s}`),
        recommendedNextAction: breachedStates.length > 0 ? 'REGISTER_BREACHED_STATES' : 'CONTINUE_MONITORING'
      }
    );
  }
}
