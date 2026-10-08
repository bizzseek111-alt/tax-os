/**
 * Autonomous Tax OS — Marketplace Facilitator Logic & Liability Separation
 * 
 * Enforces marketplace facilitator rules (Amazon, Etsy, Walmart) to ensure
 * marketplace-collected taxes are never double-remitted, while accurately reporting
 * gross sales and statutory deductions on state returns.
 */

import { prisma } from '../../../db';

export interface MarketplaceSegregationResult {
  totalGrossSalesCents: bigint;
  directSalesCents: bigint;
  marketplaceSalesCents: bigint;
  directTaxCollectedCents: bigint;
  marketplaceTaxCollectedCents: bigint;
  sellerRemittanceLiabilityCents: bigint;
  marketplaceRemittanceLiabilityCents: bigint;
  facilitatorBreakdown: Record<string, { grossSalesCents: bigint; taxCollectedCents: bigint }>;
}

export const KNOWN_MARKETPLACE_FACILITATORS = [
  'AMAZON',
  'ETSY',
  'WALMART',
  'EBAY',
  'TIKTOK SHOP',
  'TARGET PLUS',
  'SHOPIFY MARKETPLACE'
];

export class MarketplaceService {
  /**
   * Evaluates if a given source channel or marketplace name is a recognized marketplace facilitator
   */
  public isMarketplaceFacilitator(channelOrName: string): boolean {
    const upper = (channelOrName || '').toUpperCase();
    return KNOWN_MARKETPLACE_FACILITATORS.some(f => upper.includes(f));
  }

  /**
   * Segregates sales transactions for a taxCase and period into direct sales vs facilitator sales
   */
  public async segregateSales(params: {
    taxCaseId: string;
    stateCode?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MarketplaceSegregationResult> {
    const whereClause: any = {
      taxCaseId: params.taxCaseId
    };

    if (params.stateCode) {
      whereClause.destinationState = params.stateCode.toUpperCase();
    }
    if (params.startDate || params.endDate) {
      whereClause.transactionDate = {};
      if (params.startDate) whereClause.transactionDate.gte = params.startDate;
      if (params.endDate) whereClause.transactionDate.lte = params.endDate;
    }

    const transactions = await prisma.salesTransaction.findMany({
      where: whereClause
    });

    let totalGrossSalesCents = BigInt(0);
    let directSalesCents = BigInt(0);
    let marketplaceSalesCents = BigInt(0);
    let directTaxCollectedCents = BigInt(0);
    let marketplaceTaxCollectedCents = BigInt(0);

    const facilitatorBreakdown: Record<string, { grossSalesCents: bigint; taxCollectedCents: bigint }> = {};

    for (const txn of transactions) {
      totalGrossSalesCents += txn.grossAmountCents;

      const isFacilitated = txn.isMarketplaceFacilitated || this.isMarketplaceFacilitator(txn.sourceChannel);

      if (isFacilitated) {
        marketplaceSalesCents += txn.grossAmountCents;
        marketplaceTaxCollectedCents += txn.taxCollectedCents;

        const facilitatorKey = txn.marketplaceName || txn.sourceChannel || 'Marketplace Facilitator';
        if (!facilitatorBreakdown[facilitatorKey]) {
          facilitatorBreakdown[facilitatorKey] = {
            grossSalesCents: BigInt(0),
            taxCollectedCents: BigInt(0)
          };
        }
        facilitatorBreakdown[facilitatorKey].grossSalesCents += txn.grossAmountCents;
        facilitatorBreakdown[facilitatorKey].taxCollectedCents += txn.taxCollectedCents;
      } else {
        directSalesCents += txn.grossAmountCents;
        directTaxCollectedCents += txn.taxCollectedCents;
      }
    }

    return {
      totalGrossSalesCents,
      directSalesCents,
      marketplaceSalesCents,
      directTaxCollectedCents,
      marketplaceTaxCollectedCents,
      sellerRemittanceLiabilityCents: directTaxCollectedCents, // ONLY direct sales are seller liability!
      marketplaceRemittanceLiabilityCents: marketplaceTaxCollectedCents, // Remitted directly by Amazon/Walmart
      facilitatorBreakdown
    };
  }
}
