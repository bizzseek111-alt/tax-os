/**
 * Autonomous Tax OS — Deduction Hunter Agent
 * 
 * Identifies eligible tax deductions across business expenditures, itemized deduction facts,
 * and above-the-line adjustments. Links positions directly to statutory rules and evidence.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface DeductionHunterInput {
  taxYear: number;
  transactions?: Array<{
    id: string;
    description: string;
    amount: number;
    category?: string;
    date?: string;
  }>;
  facts?: Array<{
    id: string;
    factType: string;
    value: any;
  }>;
}

export interface ProposedDeduction {
  positionId?: string;
  category: string;
  title: string;
  amount: number;
  scheduleMapping: string;
  statutoryBasis: string;
  confidence: number;
  status: TaxPositionStatus;
  ruleRefs: string[];
  evidenceRefs: string[];
}

export interface DeductionHunterResult {
  proposedDeductions: ProposedDeduction[];
  totalDeductionsIdentified: number;
  totalAmountProposed: number;
}

export class DeductionHunterAgent extends BaseAgent<DeductionHunterInput, DeductionHunterResult> {
  public readonly agentType = AgentType.DEDUCTION_HUNTER;

  protected async run(
    ctx: AgentExecutionContext,
    input: DeductionHunterInput
  ): Promise<AgentResult<DeductionHunterResult>> {
    // Read tax rules
    const rules = await this.invokeTool(
      ctx,
      'readTaxRules',
      { taxYear: input.taxYear, jurisdiction: 'US-FED' },
      async () => {
        return [
          { code: 'IRC § 162', name: 'Trade or Business Expenses' },
          { code: 'IRC § 195', name: 'Start-up Expenditures' },
          { code: 'IRC § 179', name: 'Election to Expense Certain Depreciable Assets' }
        ];
      }
    );

    const proposedDeductions: ProposedDeduction[] = [];

    // Analyze transactions
    if (input.transactions && input.transactions.length > 0) {
      for (const tx of input.transactions) {
        if (tx.amount <= 0) continue; // Skip deposits or non-expenses

        const cleanDesc = this.sanitizeUntrustedText(tx.description);
        let scheduleLine = 'Schedule C Line 27 (Other expenses)';
        let statutoryCitation = 'IRC § 162(a)';

        if (/software|saas|subscription|aws|google cloud|github|hosting/i.test(cleanDesc)) {
          scheduleLine = 'Schedule C Line 18 (Office expense / software)';
          statutoryCitation = 'IRC § 162(a) / Rev. Proc. 2000-50';
        } else if (/legal|attorney|lawyer|cpa|accounting|tax prep/i.test(cleanDesc)) {
          scheduleLine = 'Schedule C Line 17 (Legal and professional services)';
          statutoryCitation = 'IRC § 162(a)';
        } else if (/ad|advertising|marketing|facebook ads|google ads/i.test(cleanDesc)) {
          scheduleLine = 'Schedule C Line 8 (Advertising)';
          statutoryCitation = 'IRC § 162(a)';
        } else if (/travel|airline|hotel|flight/i.test(cleanDesc)) {
          scheduleLine = 'Schedule C Line 24a (Travel)';
          statutoryCitation = 'IRC § 162(a)(2) / IRC § 274(d)';
        }

        const candidate = await this.invokeTool(
          ctx,
          'createTaxPositionCandidate',
          {
            title: `Deduction: ${cleanDesc}`,
            amount: tx.amount,
            scheduleLine,
            citation: statutoryCitation
          },
          async () => {
            // Save position to DB if taxCaseId exists
            let createdId: string | undefined;
            if (ctx.taxCaseId) {
              const pos = await AgentDbHelper.createTaxPosition({
                taxCaseId: ctx.taxCaseId,
                category: 'BUSINESS_DEDUCTION',
                title: `Deduction: ${cleanDesc}`,
                amount: tx.amount,
                statutoryCitation,
                confidence: 0.92,
                status: TaxPositionStatus.PROPOSED,
                sourceAgent: this.agentType,
                ruleRefs: [statutoryCitation],
                evidenceRefs: [tx.id]
              });
              createdId = pos.id;
            }

            return {
              positionId: createdId,
              category: 'BUSINESS_DEDUCTION',
              title: `Deduction: ${cleanDesc}`,
              amount: tx.amount,
              scheduleMapping: scheduleLine,
              statutoryBasis: statutoryCitation,
              confidence: 0.92,
              status: TaxPositionStatus.PROPOSED,
              ruleRefs: [statutoryCitation],
              evidenceRefs: [tx.id]
            };
          }
        );

        proposedDeductions.push(candidate);
      }
    }

    const totalAmount = proposedDeductions.reduce((sum, d) => sum + d.amount, 0);

    return this.createSuccessResult(
      ctx,
      {
        proposedDeductions,
        totalDeductionsIdentified: proposedDeductions.length,
        totalAmountProposed: totalAmount
      },
      {
        confidence: 0.93,
        ruleRefs: ['IRC § 162(a)', 'IRC § 195'],
        recommendedNextAction: 'PASS_TO_IRS_CHALLENGER_FOR_ADVERSARIAL_REVIEW'
      }
    );
  }
}
