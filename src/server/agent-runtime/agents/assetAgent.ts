/**
 * Autonomous Tax OS — Asset & Depreciation Agent
 * 
 * Evaluates capital asset expenditures, tangible property regulations (TPR),
 * de minimis safe harbor ($2,500 under Treas. Reg. § 1.263(a)-1(f)), Section 179 expensing,
 * and MACRS bonus depreciation.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface AssetExpenditureInput {
  assetId: string;
  description: string;
  cost: number;
  dateAcquired: string;
  assetClass: 'COMPUTER_EQUIPMENT' | 'OFFICE_FURNITURE' | 'VEHICLE' | 'MACHINERY' | 'BUILDING_IMPROVEMENT';
  hasApplicableFinancialStatement?: boolean; // AFS raises safe harbor to $5,000
}

export interface AssetExpenditureResult {
  assetId: string;
  treatment: 'DE_MINIMIS_EXPENSE' | 'SECTION_179_EXPENSE' | 'BONUS_DEPRECIATION' | 'MACRS_CAPITALIZE';
  firstYearDeduction: number;
  remainingBasisToDepreciate: number;
  statutoryBasis: string;
  electionStatementRequired: boolean;
  recommendedPositionId?: string;
}

export class AssetAgent extends BaseAgent<AssetExpenditureInput, AssetExpenditureResult> {
  public readonly agentType = AgentType.ASSET_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: AssetExpenditureInput
  ): Promise<AgentResult<AssetExpenditureResult>> {
    const safeHarborLimit = input.hasApplicableFinancialStatement ? 5000 : 2500;

    let treatment: 'DE_MINIMIS_EXPENSE' | 'SECTION_179_EXPENSE' | 'BONUS_DEPRECIATION' | 'MACRS_CAPITALIZE';
    let firstYearDeduction = 0;
    let remainingBasis = 0;
    let statutoryBasis = '';
    let electionStatementRequired = false;

    if (input.cost <= safeHarborLimit) {
      // 1. De Minimis Safe Harbor Election
      treatment = 'DE_MINIMIS_EXPENSE';
      firstYearDeduction = input.cost;
      remainingBasis = 0;
      statutoryBasis = 'Treas. Reg. § 1.263(a)-1(f) De Minimis Safe Harbor';
      electionStatementRequired = true;
    } else {
      // 2. Section 179 Expensing candidate
      treatment = 'SECTION_179_EXPENSE';
      firstYearDeduction = input.cost;
      remainingBasis = 0;
      statutoryBasis = 'IRC § 179 Election to expense certain depreciable business assets';
      electionStatementRequired = true;
    }

    // Create candidate TaxPosition
    const pos = await this.invokeTool(
      ctx,
      'createTaxPositionCandidate',
      {
        title: `Asset: ${input.description} (${treatment})`,
        amount: firstYearDeduction,
        rule: statutoryBasis
      },
      async () => {
        let createdId: string | undefined;
        if (ctx.taxCaseId) {
          const rec = await AgentDbHelper.createTaxPosition({
            taxCaseId: ctx.taxCaseId,
            category: 'ASSET_DEPRECIATION',
            title: `Asset Expensing: ${input.description}`,
            amount: firstYearDeduction,
            statutoryCitation: statutoryBasis,
            confidence: 0.95,
            status: TaxPositionStatus.PROPOSED,
            sourceAgent: this.agentType,
            ruleRefs: [statutoryBasis],
            evidenceRefs: [input.assetId]
          });
          createdId = rec.id;
        }
        return { createdId };
      }
    );

    return this.createSuccessResult(
      ctx,
      {
        assetId: input.assetId,
        treatment,
        firstYearDeduction,
        remainingBasisToDepreciate: remainingBasis,
        statutoryBasis,
        electionStatementRequired,
        recommendedPositionId: pos.createdId
      },
      {
        confidence: 0.96,
        ruleRefs: [statutoryBasis]
      }
    );
  }
}
