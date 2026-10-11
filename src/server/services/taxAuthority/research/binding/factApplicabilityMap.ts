/**
 * Autonomous Tax OS — Fact Applicability Map & Missing Fact Resolution
 * 
 * Binds taxpayer facts to statutory rule conditions.
 * Enforces that no condition is assumed or guessed:
 * Evaluates: SATISFIED | UNSATISFIED | UNKNOWN (MISSING_FACT).
 * Generates minimal, precise questions when facts are missing.
 */

import { ConfirmedFact, FactApplicabilityMap, FactConditionBinding, MinimalFactQuestion } from '../types';

export interface ConditionRuleRequirement {
  ruleId: string;
  conditionDescription: string;
  requiredFactKey: string;
  expectedType: 'boolean' | 'number' | 'string';
  evaluator: (factValue: any) => boolean;
  questionIfMissing: {
    questionText: string;
    options?: string[];
    whyNeeded: string;
  };
}

export class FactApplicabilityService {
  private static instance: FactApplicabilityService;

  private constructor() {}

  public static getInstance(): FactApplicabilityService {
    if (!FactApplicabilityService.instance) {
      FactApplicabilityService.instance = new FactApplicabilityService();
    }
    return FactApplicabilityService.instance;
  }

  /**
   * Binds case facts against statutory conditions for a given rule.
   */
  public evaluateApplicability(
    caseId: string,
    ruleId: string,
    requirements: ConditionRuleRequirement[],
    confirmedFacts: ConfirmedFact[] = []
  ): FactApplicabilityMap {
    const bindings: FactConditionBinding[] = [];
    const missingFacts: MinimalFactQuestion[] = [];
    const missingFactKeys: string[] = [];

    const factMap = new Map<string, any>();
    for (const f of confirmedFacts) {
      factMap.set(f.key.toLowerCase(), f.value);
    }

    let allSatisfied = true;

    for (const req of requirements) {
      const factVal = factMap.get(req.requiredFactKey.toLowerCase());

      if (factVal === undefined || factVal === null) {
        bindings.push({
          ruleId,
          conditionDescription: req.conditionDescription,
          requiredFactKey: req.requiredFactKey,
          status: 'UNKNOWN'
        });
        allSatisfied = false;
        missingFactKeys.push(req.requiredFactKey);
        missingFacts.push({
          factKey: req.requiredFactKey,
          questionText: req.questionIfMissing.questionText,
          options: req.questionIfMissing.options,
          whyNeeded: req.questionIfMissing.whyNeeded,
          statutoryReason: req.questionIfMissing.whyNeeded,
          ruleId
        });
      } else {
        const isSatisfied = req.evaluator(factVal);
        bindings.push({
          ruleId,
          conditionDescription: req.conditionDescription,
          requiredFactKey: req.requiredFactKey,
          matchedFactValue: factVal,
          status: isSatisfied ? 'SATISFIED' : 'UNSATISFIED'
        });
        if (!isSatisfied) {
          allSatisfied = false;
        }
      }
    }

    return {
      caseId,
      ruleId,
      bindings,
      allConditionsSatisfied: allSatisfied,
      hasMissingFacts: missingFacts.length > 0,
      missingFactKeys,
      missingFacts
    };
  }
}
