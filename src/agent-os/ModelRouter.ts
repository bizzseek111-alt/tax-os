/**
 * Autonomous Tax OS — Model Router & Token Cost Controller
 * Routes tasks to optimal model tiers with budget enforcement and fallback chains.
 */

import { ModelClass } from './types';

export interface RouteResolution {
  modelClass: ModelClass;
  providerAdapter: string;
  maxTokens: number;
  temperature: number;
  supportsPromptCaching: boolean;
  estimatedCostPer1kTokensUsd: number;
}

export class ModelRouter {
  private static cumulativeCostUsd = 0;
  private static readonly CASE_BUDGET_CAP_USD = 4.50;

  /**
   * Resolves optimal model configuration based on task requirements.
   */
  public static resolveRoute(taskType: string, isAdversarial: boolean = false): RouteResolution {
    // Math tasks are deterministically routed with zero LLM costs
    if (taskType.includes('calc') || taskType.includes('math') || taskType.includes('bracket')) {
      return {
        modelClass: 'DETERMINISTIC_MATH',
        providerAdapter: 'InternalTypeScriptMathEngine',
        maxTokens: 0,
        temperature: 0.0,
        supportsPromptCaching: false,
        estimatedCostPer1kTokensUsd: 0.00
      };
    }

    // High complexity tasks: IRS Challenger, statutory conflicts, multi-state
    if (isAdversarial || taskType.includes('challenge') || taskType.includes('conflict') || taskType.includes('controversy')) {
      return {
        modelClass: 'DEEP_REASONER',
        providerAdapter: 'AnthropicClaude37SonnetAdapter',
        maxTokens: 4096,
        temperature: 0.1,
        supportsPromptCaching: true,
        estimatedCostPer1kTokensUsd: 0.015
      };
    }

    // Document image OCR and extraction
    if (taskType.includes('ocr') || taskType.includes('extract_doc') || taskType.includes('receipt')) {
      return {
        modelClass: 'DOCUMENT_EXTRACTOR',
        providerAdapter: 'GoogleDocumentAiVisionAdapter',
        maxTokens: 2048,
        temperature: 0.0,
        supportsPromptCaching: false,
        estimatedCostPer1kTokensUsd: 0.005
      };
    }

    // Fast, lightweight categorization (merchants, transaction cleaning, routing)
    return {
      modelClass: 'FAST_CLASSIFIER',
      providerAdapter: 'GoogleGemini25FlashAdapter',
      maxTokens: 1024,
      temperature: 0.0,
      supportsPromptCaching: true,
      estimatedCostPer1kTokensUsd: 0.0003
    };
  }

  /**
   * Records token spend and enforces budget limits.
   */
  public static recordUsage(tokens: number, costPer1k: number): void {
    const cost = (tokens / 1000) * costPer1k;
    this.cumulativeCostUsd += cost;

    if (this.cumulativeCostUsd > this.CASE_BUDGET_CAP_USD) {
      console.warn(`[COST OPTIMIZER ALERT]: Case spend ($${this.cumulativeCostUsd.toFixed(2)}) exceeded budget cap ($${this.CASE_BUDGET_CAP_USD.toFixed(2)}). Downgrading non-critical queries to FAST_CLASSIFIER.`);
    }
  }

  public static getCurrentSpend(): number {
    return this.cumulativeCostUsd;
  }

  public static resetSpend(): void {
    this.cumulativeCostUsd = 0;
  }
}
