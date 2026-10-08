/**
 * Autonomous Tax OS — Abstract Base Tax Agent
 * 
 * Base class for all 30+ executable tax intelligence agents.
 * Guarantees every agent implements the typed AgentResult<T> output contract,
 * enforces tool permissions, and provides prompt injection defenses.
 */

import { AgentExecutionContext, ExecutionContextOptions } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentWorkflowRunner } from '../runner';
import { AgentResult, AgentType, ExecutionStatus, ModelClass, ToolCallInvocation } from '../types';
import { ModelRouter } from '../modelRouter';

export abstract class BaseAgent<TInput = any, TOutput = any> {
  public abstract readonly agentType: AgentType;
  public readonly agentVersion: string = '1.0.0';

  /**
   * Main entry point to execute the agent.
   */
  public async execute(
    contextOptions: ExecutionContextOptions,
    input: TInput
  ): Promise<AgentResult<TOutput>> {
    return await AgentWorkflowRunner.execute<TInput, TOutput>({
      agentType: this.agentType,
      contextOptions,
      input,
      executor: (ctx, inp) => this.run(ctx, inp)
    });
  }

  /**
   * Abstract implementation executed inside protected runner.
   */
  protected abstract run(
    ctx: AgentExecutionContext,
    input: TInput
  ): Promise<AgentResult<TOutput>>;

  /**
   * Invokes an authorized tool safely, recording metrics in the execution context.
   */
  protected async invokeTool<T = any>(
    ctx: AgentExecutionContext,
    toolName: string,
    parameters: Record<string, any>,
    fn: () => Promise<T>
  ): Promise<T> {
    // Assert tool permission
    AgentPermissionController.assertToolAllowed(this.agentType, toolName);

    const start = Date.now();
    try {
      const res = await fn();
      ctx.recordToolCall({
        toolName,
        parameters,
        result: res,
        durationMs: Date.now() - start,
        success: true
      });
      return res;
    } catch (err: any) {
      ctx.recordToolCall({
        toolName,
        parameters,
        durationMs: Date.now() - start,
        success: false,
        error: err.message
      });
      throw err;
    }
  }

  /**
   * Prompt Injection Defense:
   * Strips adversarial system instruction overrides, markdown delimiters, or prompt escaping
   * from raw OCR, receipts, and emails before cognitive reasoning.
   */
  protected sanitizeUntrustedText(text: string): string {
    if (!text) return '';
    return text
      .replace(/ignore\s+previous\s+instructions/gi, '[REDACTED_ADVERSARIAL_INSTRUCTION]')
      .replace(/system:\s*/gi, '[USER_DATA_FIELD]: ')
      .replace(/<\|im_start\|>|<\|im_end\|>/gi, '')
      .trim();
  }

  /**
   * Helper to format a standard successful AgentResult.
   */
  protected createSuccessResult(
    ctx: AgentExecutionContext,
    result: TOutput,
    options: {
      confidence?: number;
      evidenceRefs?: string[];
      ruleRefs?: string[];
      sourceRefs?: string[];
      warnings?: string[];
      unresolvedFacts?: string[];
      contradictions?: string[];
      requiresUserInput?: boolean;
      requiresProfessionalReview?: boolean;
      recommendedNextAction?: string;
    } = {}
  ): AgentResult<TOutput> {
    const route = ModelRouter.routeAgent(this.agentType);
    return {
      status: ExecutionStatus.SUCCESS,
      result,
      confidence: options.confidence ?? 1.0,
      evidenceRefs: options.evidenceRefs ?? [],
      ruleRefs: options.ruleRefs ?? [],
      sourceRefs: options.sourceRefs ?? [],
      taxCaseRefs: [ctx.taxCaseId],
      contradictions: options.contradictions ?? [],
      unresolvedFacts: options.unresolvedFacts ?? [],
      warnings: options.warnings ?? [],
      requiresUserInput: options.requiresUserInput ?? false,
      requiresProfessionalReview: options.requiresProfessionalReview ?? false,
      recommendedNextAction: options.recommendedNextAction ?? 'PROCEED_TO_NEXT_WORKFLOW_TASK',
      auditMetadata: {
        agentType: this.agentType,
        agentVersion: this.agentVersion,
        modelClass: route.modelClass,
        executionTimeMs: Date.now() - ctx.startTime,
        costUsd: 0.0,
        timestamp: new Date().toISOString()
      }
    };
  }
}
