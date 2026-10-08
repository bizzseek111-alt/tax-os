/**
 * Autonomous Tax OS — Business Purpose Evaluation Agent
 * 
 * Evaluates whether an expenditure meets the statutory requirement of IRC § 162
 * as an ordinary and necessary trade or business expense, versus a non-deductible
 * personal living expense under IRC § 262.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, EvidenceClassification } from '../types';

export interface BusinessPurposeInput {
  transactionId: string;
  merchantName: string;
  amount: number;
  category: string;
  description: string;
  businessContext?: {
    entityType: string;
    industry: string;
    businessActivities: string[];
  };
}

export interface BusinessPurposeResult {
  transactionId: string;
  isOrdinaryAndNecessary: boolean;
  businessUsePercentage: number;
  statutoryBasis: string;
  rationale: string;
  substantiationLevel: string;
  personalRiskFlags: string[];
}

export class BusinessPurposeAgent extends BaseAgent<BusinessPurposeInput, BusinessPurposeResult> {
  public readonly agentType = AgentType.BUSINESS_PURPOSE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: BusinessPurposeInput
  ): Promise<AgentResult<BusinessPurposeResult>> {
    const cleanDesc = this.sanitizeUntrustedText(input.description || '');
    const cleanMerchant = this.sanitizeUntrustedText(input.merchantName || '');

    const evaluated = await this.invokeTool(
      ctx,
      'evaluateBusinessPurpose',
      { transactionId: input.transactionId, amount: input.amount },
      async () => {
        const personalRiskFlags: string[] = [];
        let businessUsePercentage = 100;
        let isOrdinaryAndNecessary = true;
        let rationale = 'Expense directly supports ordinary trade or business activities.';
        let statutoryBasis = 'IRC § 162(a) Ordinary and necessary expenses';

        const descLower = (cleanDesc + ' ' + cleanMerchant).toLowerCase();

        // Check for personal flags
        if (/grocery|cinema|entertainment|spa|vacation|jewelry|disney|netflix/i.test(descLower)) {
          isOrdinaryAndNecessary = false;
          businessUsePercentage = 0;
          personalRiskFlags.push('IRC § 262 personal, living, or family expense exclusion');
          personalRiskFlags.push('Entertainment expense non-deductible under IRC § 274(a)(1)');
          rationale = 'Identified as presumptive personal or disallowable entertainment expenditure.';
          statutoryBasis = 'IRC § 262(a)';
        } else if (/phone|cell|internet|utilities|home/i.test(descLower)) {
          // Mixed use
          businessUsePercentage = 50;
          personalRiskFlags.push('Mixed personal and business utility usage requires substantiation');
          rationale = 'Dual-purpose utility expenditure; requires allocation between personal and business use.';
          statutoryBasis = 'IRC § 162(a) / Treas. Reg. § 1.162-1(a)';
        }

        return {
          transactionId: input.transactionId,
          isOrdinaryAndNecessary,
          businessUsePercentage,
          statutoryBasis,
          rationale,
          substantiationLevel: businessUsePercentage > 0 ? 'ADEQUATE' : 'DISALLOWED',
          personalRiskFlags
        };
      }
    );

    // Link evidence
    if (evaluated.isOrdinaryAndNecessary) {
      await this.invokeTool(
        ctx,
        'linkEvidence',
        { transactionId: input.transactionId, basis: evaluated.statutoryBasis },
        async () => {
          return { linked: true, tier: EvidenceClassification.CONNECTED_SOURCE };
        }
      );
    }

    return this.createSuccessResult(ctx, evaluated, {
      confidence: evaluated.isOrdinaryAndNecessary ? 0.95 : 0.90,
      ruleRefs: [evaluated.statutoryBasis],
      contradictions: evaluated.personalRiskFlags,
      requiresProfessionalReview: evaluated.personalRiskFlags.length > 0 && evaluated.isOrdinaryAndNecessary
    });
  }
}
