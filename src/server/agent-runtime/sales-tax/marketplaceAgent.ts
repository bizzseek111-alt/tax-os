/**
 * Autonomous Tax OS — Marketplace Facilitator Agent
 * 
 * Segregates direct storefront transactions from marketplace facilitator sales (Amazon, Etsy, Walmart)
 * to prevent double-remittance while ensuring full gross reporting on returns.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { MarketplaceService, MarketplaceSegregationResult } from '../../services/salesTax/marketplace/marketplaceService';

export interface MarketplaceAgentOutput {
  segregation: {
    totalGrossSalesCents: string;
    directSalesCents: string;
    marketplaceSalesCents: string;
    sellerRemittanceLiabilityCents: string;
    marketplaceRemittedCents: string;
  };
  facilitatorCount: number;
}

export class MarketplaceAgent extends BaseAgent<any, MarketplaceAgentOutput> {
  public readonly agentType = AgentType.MARKETPLACE_AGENT;
  private marketplaceService = new MarketplaceService();

  protected async run(
    ctx: AgentExecutionContext,
    input: { stateCode?: string }
  ): Promise<AgentResult<MarketplaceAgentOutput>> {
    const res: MarketplaceSegregationResult = await this.invokeTool(ctx, 'segregateMarketplaceSales', {}, async () => {
      return await this.marketplaceService.segregateSales({
        taxCaseId: ctx.taxCaseId,
        stateCode: input?.stateCode
      });
    });

    const facilitatorKeys = Object.keys(res.facilitatorBreakdown);

    return this.createSuccessResult(
      ctx,
      {
        segregation: {
          totalGrossSalesCents: res.totalGrossSalesCents.toString(),
          directSalesCents: res.directSalesCents.toString(),
          marketplaceSalesCents: res.marketplaceSalesCents.toString(),
          sellerRemittanceLiabilityCents: res.sellerRemittanceLiabilityCents.toString(),
          marketplaceRemittedCents: res.marketplaceRemittanceLiabilityCents.toString()
        },
        facilitatorCount: facilitatorKeys.length
      },
      {
        confidence: 0.99,
        recommendedNextAction: 'PREVENT_DOUBLE_REMITTANCE_ON_RETURN'
      }
    );
  }
}
