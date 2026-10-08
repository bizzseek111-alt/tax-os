/**
 * Autonomous TaxOS — Calculation Lineage Service ("Prove This Number")
 * Workstream 3: Phase 3
 * 
 * Provides an explainable, auditable Directed Acyclic Graph (DAG) for every number
 * computed on a return. Powers the "Prove This Number" UI drawer, CPA review briefs,
 * and IRS exam audit defenses.
 */

import { ComprehensiveTaxResult, CalculationLineageNode } from './types';
import { FormMappingService } from './formMapping';

export interface LineageExplanation {
  field: string;
  formattedValue: string;
  valueCents: string;
  formulaDescription: string;
  statutoryAuthority: string;
  formLineRef: string;
  formDescription?: string;
  ruleParameters: Record<string, any>;
  sourceFactIds: string[];
  dependencies: {
    field: string;
    description: string;
    value: string;
  }[];
}

export class CalculationLineageService {
  /**
   * Resolve complete explanation and provenance for a specific calculated field or form line.
   */
  public static explainNumber(
    result: ComprehensiveTaxResult,
    fieldOrFormLine: string
  ): LineageExplanation | null {
    // 1. Check if the target is a form line code (e.g. "1040:line_11" or "CA_540:line_19")
    let targetField = fieldOrFormLine;
    const formMapping = FormMappingService.getMappingByLineCode(fieldOrFormLine);

    if (formMapping) {
      targetField = formMapping.calculationField;
    }

    // 2. Search Federal lineage nodes
    let node = result.federal.lineage[targetField];

    // 3. Search State lineage nodes if not found in Federal
    if (!node) {
      for (const st of result.states) {
        if (st.lineage[targetField]) {
          node = st.lineage[targetField];
          break;
        }
      }
    }

    // 4. Fallback search by formLineRef match
    if (!node) {
      for (const candidate of Object.values(result.federal.lineage)) {
        if (candidate.formLineRef.toLowerCase().includes(fieldOrFormLine.toLowerCase())) {
          node = candidate;
          break;
        }
      }
    }

    if (!node) {
      for (const st of result.states) {
        for (const candidate of Object.values(st.lineage)) {
          if (candidate.formLineRef.toLowerCase().includes(fieldOrFormLine.toLowerCase())) {
            node = candidate;
            break;
          }
        }
        if (node) break;
      }
    }

    if (!node) {
      // Check if there is a raw value in formLineBreakdown
      const fedVal = result.federal.formLineBreakdown[fieldOrFormLine];
      if (fedVal !== undefined) {
        return {
          field: fieldOrFormLine,
          formattedValue: `$${(Number(fedVal) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          valueCents: fedVal.toString(),
          formulaDescription: formMapping ? formMapping.description : 'Direct Form Line Entry',
          statutoryAuthority: 'Internal Revenue Code / State Revenue Code',
          formLineRef: fieldOrFormLine,
          formDescription: formMapping?.description,
          ruleParameters: {},
          sourceFactIds: [],
          dependencies: [],
        };
      }
      return null;
    }

    const valueNum = Number(node.valueCents) / 100;
    const formattedValue = `$${valueNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    // Build dependencies from rule parameters
    const dependencies: { field: string; description: string; value: string }[] = [];
    for (const [key, val] of Object.entries(node.ruleParameters)) {
      dependencies.push({
        field: key,
        description: `Input parameter ${key}`,
        value: typeof val === 'bigint' ? val.toString() : String(val),
      });
    }

    return {
      field: node.field,
      formattedValue,
      valueCents: node.valueCents.toString(),
      formulaDescription: node.formulaDescription,
      statutoryAuthority: node.statutoryAuthority,
      formLineRef: node.formLineRef,
      formDescription: formMapping?.description,
      ruleParameters: node.ruleParameters,
      sourceFactIds: node.sourceFactIds,
      dependencies,
    };
  }
}
