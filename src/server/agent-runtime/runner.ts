/**
 * Autonomous Tax OS — Typed Agent Workflow Runner
 * 
 * Orchestrates agent invocations with:
 * - Bounded retries with exponential backoff (no infinite loops)
 * - Strict timeout guards per model tier
 * - Automatic circuit breaking and kill switch validation
 * - Full PostgreSQL AgentRun lifecycle persistence
 * - Zero silent failures
 */

import { AgentExecutionContext, ExecutionContextOptions } from './context';
import { AgentCircuitBreaker } from './circuitBreaker';
import { AgentPermissionController } from './permissions';
import { ModelRouter } from './modelRouter';
import { AgentResult, AgentType, ExecutionStatus, ModelClass } from './types';

export class AgentWorkflowRunner {
  private static readonly MAX_RETRIES = 2;

  /**
   * Executes an agent task safely within permission, timeout, and circuit breaker bounds.
   */
  public static async execute<TInput, TOutput>(params: {
    agentType: AgentType;
    contextOptions: ExecutionContextOptions;
    input: TInput;
    executor: (ctx: AgentExecutionContext, input: TInput) => Promise<AgentResult<TOutput>>;
  }): Promise<AgentResult<TOutput>> {
    const allowedJurisdictions = AgentPermissionController.getPermissions(params.agentType).allowedJurisdictions;
    const effectiveJurisdiction =
      params.contextOptions.jurisdiction ||
      (params.input as any)?.jurisdiction ||
      (params.input as any)?.state ||
      (allowedJurisdictions.includes('US-FED') ? 'US-FED' : allowedJurisdictions[0]);

    const ctx = new AgentExecutionContext({
      ...params.contextOptions,
      jurisdiction: effectiveJurisdiction
    });

    // 1. Verify Jurisdiction Permissions
    AgentPermissionController.assertJurisdictionAllowed(
      params.agentType,
      ctx.jurisdiction
    );

    // 2. Verify Kill Switch and Circuit Breaker
    AgentCircuitBreaker.assertAllowed({
      agentType: params.agentType,
      jurisdiction: ctx.jurisdiction
    });

    const route = ModelRouter.routeAgent(params.agentType);
    await ctx.startRun('1.0.0');

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.MAX_RETRIES) {
      try {
        attempt++;

        // Execute with timeout race
        const resultPromise = params.executor(ctx, params.input);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`AGENT_TIMEOUT: Agent '${params.agentType}' timed out after ${route.maxTimeoutMs}ms`)),
            route.maxTimeoutMs
          )
        );

        const result = await Promise.race([resultPromise, timeoutPromise]);

        // Complete database run
        await ctx.completeRun(result);
        AgentCircuitBreaker.recordSuccess(params.agentType);

        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Agent Runner Attempt ${attempt} Failed]: ${params.agentType} - ${err.message}`);

        if (attempt <= this.MAX_RETRIES) {
          // Bounded exponential backoff: 50ms, 100ms
          await new Promise((r) => setTimeout(r, attempt * 50));
        }
      }
    }

    // Record failure in circuit breaker and database
    const finalErrorMessage = lastError ? lastError.message : 'Unknown agent failure';
    AgentCircuitBreaker.recordFailure(params.agentType, finalErrorMessage);
    await ctx.failRun(lastError || new Error(finalErrorMessage));

    // Return structured failure contract (never prose, never silent)
    return {
      status: ExecutionStatus.PERMANENT_FAILURE,
      result: null as any,
      confidence: 0.0,
      evidenceRefs: [],
      ruleRefs: [],
      sourceRefs: [],
      taxCaseRefs: [ctx.taxCaseId],
      contradictions: [finalErrorMessage],
      unresolvedFacts: [],
      warnings: [`Agent execution failed after ${attempt} attempts: ${finalErrorMessage}`],
      requiresUserInput: false,
      requiresProfessionalReview: true,
      recommendedNextAction: 'ESCALATE_TO_CPA_TECHNICAL_SUPPORT',
      auditMetadata: {
        agentType: params.agentType,
        agentVersion: '1.0.0',
        modelClass: route.modelClass,
        executionTimeMs: Date.now() - ctx.startTime,
        costUsd: 0.0,
        timestamp: new Date().toISOString()
      }
    };
  }
}
