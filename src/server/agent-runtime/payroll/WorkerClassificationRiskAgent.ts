/**
 * Autonomous Tax OS — Worker Classification Risk Agent
 * 
 * Analyzes independent contractor facts against IRS common law and state ABC rules,
 * emitting structured POTENTIAL_RISK findings and routing to CPA review.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { WorkerClassificationEngine } from '../../services/payroll/classification/workerClassificationEngine';
import {
  WorkerClassificationFactSet,
  WorkerClassificationEvaluation
} from '../../services/payroll/types';

export interface WorkerClassificationRiskOutput {
  evaluation: WorkerClassificationEvaluation;
}

export class WorkerClassificationRiskAgent extends BaseAgent<any, WorkerClassificationRiskOutput> {
  public readonly agentType = AgentType.WORKER_CLASSIFICATION_RISK_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: WorkerClassificationFactSet
  ): Promise<AgentResult<WorkerClassificationRiskOutput>> {
    const evalResult = await this.invokeTool(ctx, 'evaluateAbcTest', input, async () => {
      return WorkerClassificationEngine.evaluateWorker(input);
    });

    const isHighRisk = ['HIGH', 'CRITICAL'].includes(evalResult.riskLevel);

    return this.createSuccessResult(
      ctx,
      { evaluation: evalResult },
      {
        confidence: 0.95,
        warnings: isHighRisk ? evalResult.primaryRiskFactors : undefined,
        recommendedNextAction: isHighRisk ? 'ROUTE_TO_LEGAL_OR_CPA_REVIEW' : 'NO_ACTION_REQUIRED'
      }
    );
  }
}
