/**
 * Autonomous Tax OS — Home Office Deduction Agent
 * 
 * Evaluates qualification under IRC § 280A(c)(1):
 * 1. Exclusive and regular use
 * 2. Principal place of business test
 * Calculates simplified method ($5/sq ft up to 300 sq ft) vs actual expense method.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface HomeOfficeInput {
  hasExclusiveSpace: boolean;
  isPrincipalPlaceOfBusiness: boolean;
  squareFootage: number;
  totalHomeSquareFootage: number;
  useSimplifiedMethod?: boolean;
  actualExpenses?: {
    rentOrMortgageInterest: number;
    realEstateTaxes: number;
    utilities: number;
    repairs: number;
    insurance: number;
  };
}

export interface HomeOfficeResult {
  qualifies: boolean;
  method: 'SIMPLIFIED' | 'ACTUAL' | 'DISALLOWED';
  calculatedDeduction: number;
  businessPercentage: number;
  statutoryBasis: string;
  disqualificationReason?: string;
  recommendedPositionId?: string;
}

export class HomeOfficeAgent extends BaseAgent<HomeOfficeInput, HomeOfficeResult> {
  public readonly agentType = AgentType.HOME_OFFICE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: HomeOfficeInput
  ): Promise<AgentResult<HomeOfficeResult>> {
    // 1. Validate statutory requirements under IRC § 280A
    if (!input.hasExclusiveSpace || !input.isPrincipalPlaceOfBusiness) {
      return this.createSuccessResult(
        ctx,
        {
          qualifies: false,
          method: 'DISALLOWED',
          calculatedDeduction: 0,
          businessPercentage: 0,
          statutoryBasis: 'IRC § 280A(a) Disallowance of certain expenses in connection with business use of home',
          disqualificationReason: !input.hasExclusiveSpace
            ? 'Fails IRC § 280A(c)(1) exclusive use requirement (space is used for personal purposes)'
            : 'Fails IRC § 280A(c)(1)(A) principal place of business requirement'
        },
        {
          confidence: 0.99,
          ruleRefs: ['IRC § 280A(a)', 'IRC § 280A(c)(1)']
        }
      );
    }

    const sqFt = Math.max(0, input.squareFootage);
    const totalSqFt = Math.max(sqFt, input.totalHomeSquareFootage || 1000);
    const businessPercentage = (sqFt / totalSqFt) * 100;

    // Calculate simplified method: $5 / sq ft up to max 300 sq ft ($1,500)
    const simplifiedAmount = Math.min(300, sqFt) * 5;

    let deduction = simplifiedAmount;
    let chosenMethod: 'SIMPLIFIED' | 'ACTUAL' = 'SIMPLIFIED';

    if (!input.useSimplifiedMethod && input.actualExpenses) {
      const totalActual =
        (input.actualExpenses.rentOrMortgageInterest || 0) +
        (input.actualExpenses.realEstateTaxes || 0) +
        (input.actualExpenses.utilities || 0) +
        (input.actualExpenses.repairs || 0) +
        (input.actualExpenses.insurance || 0);

      const actualDeduction = totalActual * (sqFt / totalSqFt);
      if (actualDeduction > simplifiedAmount) {
        deduction = actualDeduction;
        chosenMethod = 'ACTUAL';
      }
    }

    // Persist tax fact
    await this.invokeTool(
      ctx,
      'createTaxFact',
      { type: 'HOME_OFFICE_DEDUCTION', amount: deduction, method: chosenMethod },
      async () => {
        if (ctx.taxCaseId) {
          return await AgentDbHelper.createTaxFact({
            taxCaseId: ctx.taxCaseId,
            category: 'DEDUCTION',
            factType: 'HOME_OFFICE_DEDUCTION',
            amount: deduction,
            confidence: 0.95,
            normalizedValue: {
              method: chosenMethod,
              amount: deduction,
              squareFootage: sqFt,
              businessPercentage
            }
          });
        }
        return null;
      }
    );

    // Create candidate TaxPosition
    const position = await this.invokeTool(
      ctx,
      'createTaxPositionCandidate',
      {
        title: `Home Office Deduction (${chosenMethod})`,
        amount: deduction,
        rule: 'IRC § 280A(c)(1)'
      },
      async () => {
        let posId: string | undefined;
        if (ctx.taxCaseId) {
          const rec = await AgentDbHelper.createTaxPosition({
            taxCaseId: ctx.taxCaseId,
            category: 'BUSINESS_DEDUCTION',
            title: `Home Office Deduction (${chosenMethod}: ${sqFt} sq ft)`,
            amount: deduction,
            statutoryCitation: 'IRC § 280A(c)(1)',
            confidence: 0.95,
            status: TaxPositionStatus.PROPOSED,
            sourceAgent: this.agentType,
            ruleRefs: ['IRC § 280A(c)(1)', 'Rev. Proc. 2013-13'],
            evidenceRefs: []
          });
          posId = rec.id;
        }
        return { posId };
      }
    );

    return this.createSuccessResult(
      ctx,
      {
        qualifies: true,
        method: chosenMethod,
        calculatedDeduction: deduction,
        businessPercentage,
        statutoryBasis: chosenMethod === 'SIMPLIFIED' ? 'Rev. Proc. 2013-13 / IRC § 280A' : 'IRC § 280A(c)(1)',
        recommendedPositionId: position.posId
      },
      {
        confidence: 0.95,
        ruleRefs: ['IRC § 280A(c)(1)', 'Rev. Proc. 2013-13']
      }
    );
  }
}
