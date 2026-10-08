/**
 * Autonomous Tax OS — Agent Model Router & Cost Governor
 * 
 * Routes agent tasks to optimal model tiers based on computational and cognitive complexity.
 * Prevents runaway spending by strictly barring expensive models from trivial tasks.
 */

import { AgentType, CostMetadata, ModelClass } from './types';

export interface ModelRouteSpec {
  modelClass: ModelClass;
  provider: string;
  modelName: string;
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTimeoutMs: number;
}

export class ModelRouter {
  private static readonly MODEL_SPECS: Record<ModelClass, ModelRouteSpec> = {
    [ModelClass.FAST_CLASSIFIER]: {
      modelClass: ModelClass.FAST_CLASSIFIER,
      provider: 'INTERNAL_DETERMINISTIC',
      modelName: 'taxos-fast-v1',
      costPerInputToken: 0.00000025,
      costPerOutputToken: 0.000001,
      maxTimeoutMs: 3000
    },
    [ModelClass.DOCUMENT_REASONER]: {
      modelClass: ModelClass.DOCUMENT_REASONER,
      provider: 'ANTHROPIC',
      modelName: 'claude-3-5-haiku-20241022',
      costPerInputToken: 0.000001,
      costPerOutputToken: 0.000005,
      maxTimeoutMs: 8000
    },
    [ModelClass.DEEP_REASONER]: {
      modelClass: ModelClass.DEEP_REASONER,
      provider: 'ANTHROPIC',
      modelName: 'claude-3-7-sonnet',
      costPerInputToken: 0.000003,
      costPerOutputToken: 0.000015,
      maxTimeoutMs: 25000
    },
    [ModelClass.TAX_RESEARCH_REASONER]: {
      modelClass: ModelClass.TAX_RESEARCH_REASONER,
      provider: 'INTERNAL_DETERMINISTIC',
      modelName: 'taxos-authority-engine-v1',
      costPerInputToken: 0.000002,
      costPerOutputToken: 0.000008,
      maxTimeoutMs: 15000
    },
    [ModelClass.VISION]: {
      modelClass: ModelClass.VISION,
      provider: 'GOOGLE',
      modelName: 'gemini-1.5-pro',
      costPerInputToken: 0.0000025,
      costPerOutputToken: 0.00001,
      maxTimeoutMs: 20000
    },
    [ModelClass.EMBEDDINGS]: {
      modelClass: ModelClass.EMBEDDINGS,
      provider: 'INTERNAL_DETERMINISTIC',
      modelName: 'taxos-embeddings-64d',
      costPerInputToken: 0.0000001,
      costPerOutputToken: 0.0,
      maxTimeoutMs: 1000
    }
  };

  /**
   * Routes an agent to its approved model class.
   */
  public static routeAgent(agentType: AgentType): ModelRouteSpec {
    switch (agentType) {
      case AgentType.MERCHANT_INTELLIGENCE_AGENT:
      case AgentType.TRANSACTION_CLASSIFICATION_AGENT:
      case AgentType.RECEIPT_MATCHING_AGENT:
        return this.MODEL_SPECS[ModelClass.FAST_CLASSIFIER];

      case AgentType.INTAKE_AGENT:
      case AgentType.PRIOR_RETURN_AGENT:
      case AgentType.MISSING_DOCUMENT_AGENT:
      case AgentType.INCOME_RECONSTRUCTION_AGENT:
      case AgentType.EVIDENCE_EXAMINER:
        return this.MODEL_SPECS[ModelClass.DOCUMENT_REASONER];

      case AgentType.TAX_RESEARCH_AGENT:
      case AgentType.CONFORMITY_AGENT:
        return this.MODEL_SPECS[ModelClass.TAX_RESEARCH_REASONER];

      case AgentType.DEDUCTION_HUNTER:
      case AgentType.CREDIT_HUNTER:
      case AgentType.IRS_CHALLENGER_AGENT:
      case AgentType.CONSENSUS_ENGINE:
      case AgentType.OPTIMIZER_AGENT:
      case AgentType.PROFESSIONAL_REVIEW_BRIEF_AGENT:
        return this.MODEL_SPECS[ModelClass.DEEP_REASONER];

      default:
        return this.MODEL_SPECS[ModelClass.FAST_CLASSIFIER];
    }
  }

  /**
   * Calculates realistic cost metadata in USD.
   */
  public static calculateCost(
    modelClass: ModelClass,
    promptTokens: number,
    completionTokens: number,
    latencyMs: number
  ): CostMetadata {
    const spec = this.MODEL_SPECS[modelClass];
    const costUsd =
      promptTokens * spec.costPerInputToken + completionTokens * spec.costPerOutputToken;

    return {
      promptTokens,
      completionTokens,
      costUsd: parseFloat(costUsd.toFixed(6)),
      latencyMs
    };
  }
}
