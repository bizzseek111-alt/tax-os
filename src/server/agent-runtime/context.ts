/**
 * Autonomous Tax OS — Agent Execution Context & Run Persistence
 * 
 * Manages runtime execution state, database logging, and immutable audit trails
 * for every agent invocation.
 */

import crypto from 'crypto';
import { prisma } from '../db';
import { AgentResult, AgentType, CostMetadata, ExecutionStatus, ToolCallInvocation } from './types';
import { ModelRouter } from './modelRouter';

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

export function sanitizeBigInts<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return (obj as bigint).toString() as any;
  if (Array.isArray(obj)) return obj.map(sanitizeBigInts) as any;
  if (typeof obj === 'object') {
    const res: any = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeBigInts(v);
    }
    return res;
  }
  return obj;
}

export interface ExecutionContextOptions {
  taxCaseId: string;
  organizationId: string;
  taxYear: number;
  jurisdiction?: string;
  taxObligationId?: string;
  reviewMode?: string;
  agentType?: AgentType;
  actorUserId?: string;
  userId?: string;
  prisma?: any;
}

export class AgentExecutionContext {
  public readonly taxCaseId: string;
  public readonly organizationId: string;
  public readonly taxYear: number;
  public readonly jurisdiction: string;
  public readonly taxObligationId?: string;
  public readonly reviewMode: string;
  public readonly agentType: AgentType;
  public readonly actorUserId?: string;
  public readonly prisma = prisma;

  public readonly startTime: number;
  public readonly toolCalls: ToolCallInvocation[] = [];
  public runId?: string;

  constructor(options: ExecutionContextOptions) {
    this.taxCaseId = options.taxCaseId;
    this.organizationId = options.organizationId;
    this.taxYear = options.taxYear;
    this.jurisdiction = options.jurisdiction || 'US-FED';
    this.taxObligationId = options.taxObligationId;
    this.reviewMode = options.reviewMode || 'HUMAN_VERIFIED';
    this.agentType = options.agentType || AgentType.TAXCASE_SUPERVISOR;
    this.actorUserId = options.actorUserId || options.userId;
    this.startTime = Date.now();
  }

  /**
   * Initializes and persists the starting AgentRun in PostgreSQL.
   */
  public async startRun(agentVersion: string = '1.0.0'): Promise<string> {
    const route = ModelRouter.routeAgent(this.agentType);

    const record = await prisma.agentRun.create({
      data: {
        agentType: this.agentType,
        agentVersion,
        taxCaseId: this.taxCaseId,
        taxObligationId: this.taxObligationId,
        status: 'RUNNING',
        modelProvider: route.provider,
        modelName: route.modelName,
        inputRefs: [],
        outputRefs: [],
        toolCalls: [],
        confidence: 1.0,
        startedAt: new Date(),
        ruleSetVersion: `${this.taxYear}.1`,
        agentName: this.agentType,
        modelVersion: route.modelName
      }
    });

    this.runId = record.id;
    return record.id;
  }

  /**
   * Records a tool call during agent execution.
   */
  public recordToolCall(call: ToolCallInvocation): void {
    this.toolCalls.push(call);
  }

  /**
   * Completes and finalizes the AgentRun in PostgreSQL.
   */
  public async completeRun(result: AgentResult): Promise<void> {
    if (!this.runId) return;

    const latencyMs = Date.now() - this.startTime;
    const route = ModelRouter.routeAgent(this.agentType);
    const cost = ModelRouter.calculateCost(
      route.modelClass,
      result.auditMetadata.executionTimeMs || 150,
      100,
      latencyMs
    );

    const safeResult = sanitizeBigInts(result);
    const signatureHash = crypto
      .createHash('sha256')
      .update(`${this.runId}:${this.agentType}:${result.status}:${JSON.stringify(safeResult.result)}`)
      .digest('hex');

    await prisma.agentRun.update({
      where: { id: this.runId },
      data: {
        status: result.status,
        confidence: result.confidence,
        completedAt: new Date(),
        toolCalls: this.toolCalls as any,
        costMetadata: cost as any,
        finalVerdict: safeResult as any,
        signatureHash,
        promptTokens: cost.promptTokens,
        completionTokens: cost.completionTokens,
        costUsd: cost.costUsd,
        latencyMs
      }
    });
  }

  /**
   * Records an error failure on the AgentRun.
   */
  public async failRun(error: Error): Promise<void> {
    if (!this.runId) return;

    const latencyMs = Date.now() - this.startTime;

    await prisma.agentRun.update({
      where: { id: this.runId },
      data: {
        status: ExecutionStatus.PERMANENT_FAILURE,
        error: error.message,
        completedAt: new Date(),
        latencyMs
      }
    });
  }
}
