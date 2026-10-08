/**
 * Autonomous Tax OS — Sourcing Agent
 * 
 * Determines whether transactions follow Destination, Origin, or Mixed sourcing rules
 * and calculates accurate composite tax rates based on location breakdown.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { SourcingEngine, SourcingDetermination } from '../../services/salesTax/sourcing/sourcingEngine';
import { RateService, CompositeRateQuote } from '../../services/salesTax/rates/rateService';
import { DefaultAddressProvider, RawAddress } from '../../services/salesTax/address/addressProvider';

export interface SourcingAgentOutput {
  determination: SourcingDetermination;
  rateQuote: CompositeRateQuote;
}

export class SourcingAgent extends BaseAgent<any, SourcingAgentOutput> {
  public readonly agentType = AgentType.SOURCING_AGENT;
  private sourcingEngine = new SourcingEngine();
  private addressProvider = new DefaultAddressProvider();
  private rateService = new RateService(this.addressProvider);

  protected async run(
    ctx: AgentExecutionContext,
    input: { origin: RawAddress; destination: RawAddress; productCategory?: string }
  ): Promise<AgentResult<SourcingAgentOutput>> {
    const normOrigin = await this.addressProvider.normalizeAddress(input.origin);
    const normDest = await this.addressProvider.normalizeAddress(input.destination);

    const determination = await this.invokeTool(ctx, 'resolveSourcing', {}, async () => {
      return this.sourcingEngine.resolveSourcing(normOrigin, normDest, input.productCategory);
    });

    const targetAddress = determination.sourcingLocation === 'ORIGIN' ? normOrigin : normDest;
    const rateQuote = await this.invokeTool(ctx, 'calculateCompositeRate', {}, async () => {
      return await this.rateService.getRateForAddress(targetAddress);
    });

    return this.createSuccessResult(
      ctx,
      {
        determination,
        rateQuote
      },
      {
        confidence: 0.98,
        recommendedNextAction: 'APPLY_RATES_TO_TRANSACTIONS'
      }
    );
  }
}
