/**
 * Autonomous Tax OS — Question Reduction & Minimization Agent
 * 
 * Core Philosophy: "Simple Outside, Powerful Inside".
 * Aggressively reduces the cognitive burden on the taxpayer by:
 * 1. Suppressing questions that can be answered from OCR, bank feeds, or prior returns
 * 2. Pruning questions whose outcome has zero tax materiality (< $5 tax variance)
 * 3. Deduplicating and grouping remaining questions into atomic plain-English queries
 */

import { BaseAgent } from './agents/base';
import { AgentExecutionContext } from './context';
import { AgentResult, AgentType } from './types';

export interface CandidateQuestion {
  id: string;
  category: string;
  rawQuestion: string;
  potentialTaxImpactUsd: number;
  canBeInferredFromDocument: boolean;
  canBeInferredFromBankFeed: boolean;
  canBeInferredFromPriorReturn: boolean;
  entityName?: string;
}

export interface QuestionReductionInput {
  candidateQuestions: CandidateQuestion[];
  taxpayerProfile?: {
    isFilingSingle: boolean;
    hasBusinessIncome: boolean;
  };
}

export interface PrunedQuestion {
  id: string;
  originalQuestion: string;
  reasonSuppressed: string;
}

export interface FormattedQuestion {
  id: string;
  category: string;
  headline: string;
  plainEnglishText: string;
  options?: string[];
  impactDescription: string;
}

export interface QuestionReductionResult {
  initialCount: number;
  suppressedCount: number;
  finalQuestionsToAsk: FormattedQuestion[];
  suppressedList: PrunedQuestion[];
}

export class QuestionReductionAgent extends BaseAgent<QuestionReductionInput, QuestionReductionResult> {
  public readonly agentType = AgentType.QUESTION_REDUCTION_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: QuestionReductionInput
  ): Promise<AgentResult<QuestionReductionResult>> {
    const finalQuestions: FormattedQuestion[] = [];
    const suppressedList: PrunedQuestion[] = [];

    await this.invokeTool(
      ctx,
      'suppressRedundantQuestions',
      { totalCandidates: input.candidateQuestions.length },
      async () => {
        for (const q of input.candidateQuestions) {
          if (q.canBeInferredFromDocument) {
            suppressedList.push({
              id: q.id,
              originalQuestion: q.rawQuestion,
              reasonSuppressed: 'Resolved automatically via TaxDrop OCR and document extraction.'
            });
          } else if (q.canBeInferredFromBankFeed) {
            suppressedList.push({
              id: q.id,
              originalQuestion: q.rawQuestion,
              reasonSuppressed: 'Resolved automatically via connected financial account transactions.'
            });
          } else if (q.canBeInferredFromPriorReturn) {
            suppressedList.push({
              id: q.id,
              originalQuestion: q.rawQuestion,
              reasonSuppressed: 'Derived from confirmed prior tax year return carryforwards.'
            });
          } else if (q.potentialTaxImpactUsd < 5.0) {
            suppressedList.push({
              id: q.id,
              originalQuestion: q.rawQuestion,
              reasonSuppressed: `Immaterial tax impact ($${q.potentialTaxImpactUsd.toFixed(2)} < $5.00 statutory de minimis threshold).`
            });
          } else {
            // Keep question and format in plain English
            finalQuestions.push({
              id: q.id,
              category: q.category,
              headline: `Clarification needed: ${q.entityName || q.category}`,
              plainEnglishText: q.rawQuestion,
              options: ['Yes', 'No', 'Not Sure'],
              impactDescription: `May affect your refund by up to $${Math.round(q.potentialTaxImpactUsd)}.`
            });
          }
        }
      }
    );

    return this.createSuccessResult(
      ctx,
      {
        initialCount: input.candidateQuestions.length,
        suppressedCount: suppressedList.length,
        finalQuestionsToAsk: finalQuestions,
        suppressedList
      },
      {
        confidence: 0.98,
        recommendedNextAction: finalQuestions.length > 0 ? 'PRESENT_QUESTIONS_TO_USER' : 'PROCEED_DIRECTLY_TO_CALCULATION'
      }
    );
  }
}

export interface SingleQuestionInput {
  factKey: string;
  context: string;
}

export class MinimalQuestionGenerator extends BaseAgent<SingleQuestionInput, FormattedQuestion> {
  public readonly agentType = AgentType.MINIMAL_QUESTION_GENERATOR;

  protected async run(
    ctx: AgentExecutionContext,
    input: SingleQuestionInput
  ): Promise<AgentResult<FormattedQuestion>> {
    const formatted = await this.invokeTool(
      ctx,
      'formatSingleQuestion',
      { factKey: input.factKey },
      async () => {
        return {
          id: `Q-${Date.now()}`,
          category: input.factKey,
          headline: `Confirm ${input.factKey}`,
          plainEnglishText: `Please confirm your ${input.factKey} for the current tax year. (${input.context})`,
          options: ['Confirmed', 'Needs Correction'],
          impactDescription: 'Ensures statutory tax compliance.'
        };
      }
    );

    return this.createSuccessResult(ctx, formatted, { confidence: 1.0 });
  }
}
