/**
 * Autonomous Tax OS — Tax Credit Hunter Agent
 * 
 * Identifies potential nonrefundable and refundable tax credits across individual
 * and small business profiles. Links candidate credits to statutory IRC authorities.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface CreditHunterInput {
  taxYear: number;
  filingStatus: string;
  dependents?: Array<{
    name: string;
    relationship: string;
    age: number;
    ssnValid: boolean;
  }>;
  educationExpenses?: number;
  cleanEnergyExpenses?: number;
  w2Wages?: number;
}

export interface ProposedCredit {
  positionId?: string;
  category: string;
  title: string;
  amount: number;
  statutoryBasis: string;
  confidence: number;
  isRefundable: boolean;
  status: TaxPositionStatus;
  ruleRefs: string[];
}

export interface CreditHunterResult {
  proposedCredits: ProposedCredit[];
  totalCreditsIdentified: number;
  totalCreditAmount: number;
}

export class CreditHunterAgent extends BaseAgent<CreditHunterInput, CreditHunterResult> {
  public readonly agentType = AgentType.CREDIT_HUNTER;

  protected async run(
    ctx: AgentExecutionContext,
    input: CreditHunterInput
  ): Promise<AgentResult<CreditHunterResult>> {
    const proposedCredits: ProposedCredit[] = [];

    // 1. Child Tax Credit (IRC § 24)
    if (input.dependents && input.dependents.length > 0) {
      const qualifyingChildren = input.dependents.filter(d => d.age < 17 && d.ssnValid);
      if (qualifyingChildren.length > 0) {
        const ctcAmount = qualifyingChildren.length * 2000;
        const candidate = await this.invokeTool(
          ctx,
          'createTaxPositionCandidate',
          { title: 'Child Tax Credit (CTC)', amount: ctcAmount, rule: 'IRC § 24' },
          async () => {
            let createdId: string | undefined;
            if (ctx.taxCaseId) {
              const pos = await AgentDbHelper.createTaxPosition({
                taxCaseId: ctx.taxCaseId,
                positionType: 'CREDIT',
                category: 'TAX_CREDIT',
                title: `Child Tax Credit (${qualifyingChildren.length} qualifying children)`,
                amount: ctcAmount,
                statutoryCitation: 'IRC § 24',
                confidence: 0.98,
                status: TaxPositionStatus.PROPOSED,
                sourceAgent: this.agentType,
                ruleRefs: ['IRC § 24', 'Treas. Reg. § 1.24-1'],
                evidenceRefs: []
              });
              createdId = pos.id;
            }
            return {
              positionId: createdId,
              category: 'TAX_CREDIT',
              title: `Child Tax Credit (${qualifyingChildren.length} qualifying children)`,
              amount: ctcAmount,
              statutoryBasis: 'IRC § 24 Child Tax Credit',
              confidence: 0.98,
              isRefundable: true,
              status: TaxPositionStatus.PROPOSED,
              ruleRefs: ['IRC § 24']
            };
          }
        );
        proposedCredits.push(candidate);
      }
    }

    // 2. Education Credits (IRC § 25A)
    if (input.educationExpenses && input.educationExpenses > 0) {
      const aotcAmount = Math.min(2500, input.educationExpenses * 0.8);
      const candidate = await this.invokeTool(
        ctx,
        'createTaxPositionCandidate',
        { title: 'American Opportunity Tax Credit (AOTC)', amount: aotcAmount, rule: 'IRC § 25A' },
        async () => {
          return {
            category: 'TAX_CREDIT',
            title: 'American Opportunity Tax Credit (AOTC)',
            amount: aotcAmount,
            statutoryBasis: 'IRC § 25A American Opportunity and Lifetime Learning Credits',
            confidence: 0.88,
            isRefundable: true,
            status: TaxPositionStatus.PROPOSED,
            ruleRefs: ['IRC § 25A']
          };
        }
      );
      proposedCredits.push(candidate);
    }

    // 3. Residential Clean Energy Credit (IRC § 25D)
    if (input.cleanEnergyExpenses && input.cleanEnergyExpenses > 0) {
      const solarAmount = input.cleanEnergyExpenses * 0.30;
      const candidate = await this.invokeTool(
        ctx,
        'createTaxPositionCandidate',
        { title: 'Residential Clean Energy Credit', amount: solarAmount, rule: 'IRC § 25D' },
        async () => {
          return {
            category: 'TAX_CREDIT',
            title: 'Residential Clean Energy Credit (30% solar/battery)',
            amount: solarAmount,
            statutoryBasis: 'IRC § 25D Residential Clean Energy Credit',
            confidence: 0.90,
            isRefundable: false,
            status: TaxPositionStatus.PROPOSED,
            ruleRefs: ['IRC § 25D']
          };
        }
      );
      proposedCredits.push(candidate);
    }

    const totalAmount = proposedCredits.reduce((s, c) => s + c.amount, 0);

    return this.createSuccessResult(
      ctx,
      {
        proposedCredits,
        totalCreditsIdentified: proposedCredits.length,
        totalCreditAmount: totalAmount
      },
      {
        confidence: 0.95,
        ruleRefs: ['IRC § 24', 'IRC § 25A', 'IRC § 25D']
      }
    );
  }
}
