/**
 * Autonomous Tax OS — Deterministic Tax Rule Condition Evaluator
 * 
 * Evaluates formal AST condition trees against facts extracted from TaxCases and evidence.
 * 
 * Critical Design Invariant:
 * LLMs do NOT evaluate or guess whether a taxpayer qualifies for a deduction or credit.
 * Qualification is deterministically proven by evaluating the statutory boolean AST against facts.
 */

import {
  ASTCompoundCondition,
  ASTLeafCondition,
  NormalizedRulePayload,
  RuleConditionAST
} from '../types';

export interface RuleEvaluationResult {
  ruleId: string;
  isEligible: boolean;
  missingFacts: string[];
  satisfiedConditions: string[];
  violatedConditions: string[];
  calculationReference?: string;
  formMappings: string[];
  authorityRefs: string[];
}

export class TaxRuleEvaluator {
  /**
   * Evaluates a rule against a dictionary of facts.
   * Facts can contain numbers, strings, booleans, or cents (as number or bigint).
   */
  public static evaluate(
    rule: NormalizedRulePayload,
    facts: Record<string, any>
  ): RuleEvaluationResult {
    const missingFacts: string[] = [];
    const satisfiedConditions: string[] = [];
    const violatedConditions: string[] = [];

    // 1. Check required facts presence
    for (const reqKey of rule.requiredFacts) {
      if (facts[reqKey] === undefined || facts[reqKey] === null) {
        missingFacts.push(reqKey);
      }
    }

    // 2. Evaluate AST
    const isEligible = this.evaluateAST(
      rule.conditions,
      facts,
      satisfiedConditions,
      violatedConditions
    );

    return {
      ruleId: rule.ruleId,
      isEligible: isEligible && missingFacts.length === 0,
      missingFacts,
      satisfiedConditions,
      violatedConditions,
      calculationReference: rule.calculationReference,
      formMappings: rule.formMappings,
      authorityRefs: rule.authorityRefs
    };
  }

  private static evaluateAST(
    node: RuleConditionAST,
    facts: Record<string, any>,
    satisfied: string[],
    violated: string[]
  ): boolean {
    if (node.type === 'LEAF') {
      return this.evaluateLeaf(node, facts, satisfied, violated);
    } else if (node.type === 'COMPOUND') {
      return this.evaluateCompound(node, facts, satisfied, violated);
    }
    return false;
  }

  private static evaluateLeaf(
    leaf: ASTLeafCondition,
    facts: Record<string, any>,
    satisfied: string[],
    violated: string[]
  ): boolean {
    const actualVal = facts[leaf.factKey];
    const targetVal = leaf.value;
    const label = leaf.description || `${leaf.factKey} ${leaf.operator} ${targetVal ?? ''}`;

    if (actualVal === undefined || actualVal === null) {
      if (leaf.operator === 'EXISTS') {
        violated.push(label);
        return false;
      }
      // Missing fact
      violated.push(`${label} (Missing Fact: ${leaf.factKey})`);
      return false;
    }

    let result = false;

    // Convert potential BigInt values for comparisons
    const compActual = typeof actualVal === 'bigint' ? Number(actualVal) : actualVal;
    const compTarget = typeof targetVal === 'bigint' ? Number(targetVal) : targetVal;

    switch (leaf.operator) {
      case 'EQUALS':
        result = compActual === compTarget;
        break;
      case 'NOT_EQUALS':
        result = compActual !== compTarget;
        break;
      case 'GREATER_THAN':
        result = Number(compActual) > Number(compTarget);
        break;
      case 'GREATER_THAN_OR_EQUAL':
        result = Number(compActual) >= Number(compTarget);
        break;
      case 'LESS_THAN':
        result = Number(compActual) < Number(compTarget);
        break;
      case 'LESS_THAN_OR_EQUAL':
        result = Number(compActual) <= Number(compTarget);
        break;
      case 'IN':
        result = Array.isArray(targetVal) && targetVal.includes(actualVal);
        break;
      case 'NOT_IN':
        result = Array.isArray(targetVal) && !targetVal.includes(actualVal);
        break;
      case 'CONTAINS':
        result = String(actualVal).toLowerCase().includes(String(targetVal).toLowerCase());
        break;
      case 'EXISTS':
        result = actualVal !== undefined && actualVal !== null;
        break;
      case 'IS_TRUE':
        result = actualVal === true;
        break;
      case 'IS_FALSE':
        result = actualVal === false;
        break;
      default:
        result = false;
    }

    if (result) {
      satisfied.push(label);
    } else {
      violated.push(label);
    }

    return result;
  }

  private static evaluateCompound(
    compound: ASTCompoundCondition,
    facts: Record<string, any>,
    satisfied: string[],
    violated: string[]
  ): boolean {
    if (compound.logicalOp === 'AND') {
      for (const child of compound.conditions) {
        if (!this.evaluateAST(child, facts, satisfied, violated)) {
          return false;
        }
      }
      return true;
    } else if (compound.logicalOp === 'OR') {
      let anyPassed = false;
      for (const child of compound.conditions) {
        if (this.evaluateAST(child, facts, satisfied, violated)) {
          anyPassed = true;
          break;
        }
      }
      return anyPassed;
    } else if (compound.logicalOp === 'NOT') {
      const childResult = this.evaluateAST(compound.conditions[0], facts, satisfied, violated);
      return !childResult;
    }

    return false;
  }
}
