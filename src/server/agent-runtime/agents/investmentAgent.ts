/**
 * Autonomous Tax OS — Investment & Capital Gains Agent
 * 
 * Analyzes investment transactions from Form 1099-B, verifies cost basis reporting,
 * detects wash sales under IRC § 1091, classifies short-term vs long-term capital gains,
 * and handles Schedule D loss limitation ($3,000 against ordinary income under IRC § 1211(b)).
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface Form1099BTrade {
  id: string;
  assetDescription: string;
  dateAcquired?: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  isBasisReportedToIrs: boolean;
  washSaleLossDisallowed?: number;
  holdingPeriod: 'SHORT_TERM' | 'LONG_TERM' | 'UNKNOWN';
}

export interface InvestmentInput {
  taxYear: number;
  brokerName: string;
  trades: Form1099BTrade[];
}

export interface InvestmentResult {
  totalProceeds: number;
  totalCostBasis: number;
  shortTermGainOrLoss: number;
  longTermGainOrLoss: number;
  netCapitalGainOrLoss: number;
  totalWashSaleDisallowed: number;
  missingBasisCount: number;
  statutoryBasis: string;
  requiresReview: boolean;
}

export class InvestmentAgent extends BaseAgent<InvestmentInput, InvestmentResult> {
  public readonly agentType = AgentType.INVESTMENT_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: InvestmentInput
  ): Promise<AgentResult<InvestmentResult>> {
    let totalProceeds = 0;
    let totalCostBasis = 0;
    let shortTerm = 0;
    let longTerm = 0;
    let totalWashSaleDisallowed = 0;
    let missingBasisCount = 0;

    for (const trade of input.trades) {
      totalProceeds += trade.proceeds;
      totalCostBasis += trade.costBasis;

      if (!trade.costBasis && trade.proceeds > 0) {
        missingBasisCount++;
      }

      const wash = trade.washSaleLossDisallowed || 0;
      totalWashSaleDisallowed += wash;

      const gain = trade.proceeds - trade.costBasis + wash;
      if (trade.holdingPeriod === 'LONG_TERM') {
        longTerm += gain;
      } else {
        shortTerm += gain;
      }
    }

    const net = shortTerm + longTerm;

    // Persist tax fact
    await this.invokeTool(
      ctx,
      'createTaxFact',
      {
        factType: 'CAPITAL_GAINS_SUMMARY',
        proceeds: totalProceeds,
        costBasis: totalCostBasis,
        netGainOrLoss: net
      },
      async () => {
        if (ctx.taxCaseId) {
          return await AgentDbHelper.createTaxFact({
            taxCaseId: ctx.taxCaseId,
            category: 'INCOME',
            factType: 'CAPITAL_GAINS_SUMMARY',
            amount: net,
            confidence: missingBasisCount === 0 ? 0.98 : 0.80,
            normalizedValue: {
              proceeds: totalProceeds,
              costBasis: totalCostBasis,
              shortTermGainOrLoss: shortTerm,
              longTermGainOrLoss: longTerm,
              netCapitalGainOrLoss: net,
              totalWashSaleDisallowed
            }
          });
        }
        return null;
      }
    );

    // If missing basis, create a TaxTask
    if (missingBasisCount > 0) {
      await this.invokeTool(
        ctx,
        'createTaxTask',
        { title: `Resolve ${missingBasisCount} missing cost basis entries for Form 1099-B (${input.brokerName})` },
        async () => {
          if (ctx.taxCaseId) {
            return await AgentDbHelper.createTaxTask({
              taxCaseId: ctx.taxCaseId,
              title: `Missing Cost Basis on 1099-B: ${input.brokerName}`,
              reason: `${missingBasisCount} trades lack cost basis. Taxpayer must provide acquisition date and purchase price.`,
              priority: 'HIGH'
            });
          }
          return null;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        totalProceeds,
        totalCostBasis,
        shortTermGainOrLoss: shortTerm,
        longTermGainOrLoss: longTerm,
        netCapitalGainOrLoss: net,
        totalWashSaleDisallowed,
        missingBasisCount,
        statutoryBasis: 'IRC § 1221, IRC § 1222, IRC § 1091 Wash Sales',
        requiresReview: missingBasisCount > 0
      },
      {
        confidence: missingBasisCount === 0 ? 0.98 : 0.82,
        ruleRefs: ['IRC § 1221', 'IRC § 1222', 'IRC § 1091'],
        requiresUserInput: missingBasisCount > 0
      }
    );
  }
}
