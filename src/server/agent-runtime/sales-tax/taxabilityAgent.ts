/**
 * Autonomous Tax OS — Taxability Agent
 * 
 * Classifies product and service taxability across CA, NY, NJ, IL, MA.
 * Respects customer resale exemptions and human CPA reviewer overrides.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { TaxabilityEngine, TaxabilityDeterminationResult } from '../../services/salesTax/catalog/taxabilityEngine';

export interface TaxabilityAgentOutput {
  determinations: Array<{
    category: string;
    stateCode: string;
    decision: string;
    isTaxable: boolean;
    citation: string;
    isOverride: boolean;
  }>;
}

export class TaxabilityAgent extends BaseAgent<any, TaxabilityAgentOutput> {
  public readonly agentType = AgentType.TAXABILITY_AGENT;
  private taxabilityEngine = new TaxabilityEngine();

  protected async run(
    ctx: AgentExecutionContext,
    input: { items: Array<{ category: string; stateCode: string; isCustomerExempt?: boolean }> }
  ): Promise<AgentResult<TaxabilityAgentOutput>> {
    const items = input?.items || [
      { category: 'SAAS', stateCode: 'CA' },
      { category: 'SAAS', stateCode: 'NY' },
      { category: 'TPP', stateCode: 'CA' },
      { category: 'PROFESSIONAL_SERVICES', stateCode: 'NY' }
    ];

    const determinations: TaxabilityAgentOutput['determinations'] = [];

    for (const item of items) {
      const res: TaxabilityDeterminationResult = await this.invokeTool(
        ctx,
        'classifyTaxability',
        { category: item.category, state: item.stateCode },
        async () => {
          return await this.taxabilityEngine.determineTaxability({
            taxCaseId: ctx.taxCaseId,
            organizationId: 'org-default',
            productCategoryCode: item.category,
            stateCode: item.stateCode,
            isCustomerExempt: item.isCustomerExempt
          });
        }
      );

      determinations.push({
        category: item.category,
        stateCode: item.stateCode,
        decision: res.decision,
        isTaxable: res.isTaxable,
        citation: res.statutoryCitation,
        isOverride: res.isReviewerOverride
      });
    }

    return this.createSuccessResult(
      ctx,
      { determinations },
      {
        confidence: 0.99,
        recommendedNextAction: 'PROCEED_TO_SOURCING'
      }
    );
  }
}
