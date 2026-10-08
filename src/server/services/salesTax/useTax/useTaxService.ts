/**
 * Autonomous Tax OS — Consumer Use Tax Engine
 * 
 * Accurately tracks, self-assesses, and rolls untaxed out-of-state purchases
 * into state sales & use tax returns across CA, NY, NJ, IL, MA.
 */

import { prisma } from '../../../db';
import { RateService } from '../rates/rateService';
import { DefaultAddressProvider } from '../address/addressProvider';

export interface UseTaxAssessmentParams {
  taxCaseId: string;
  vendorName: string;
  description: string;
  purchaseAmountCents: bigint;
  taxPaidToOtherStateCents?: bigint;
  deliveryAddress: {
    street1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  purchaseDate?: Date;
  sourceTransactionId?: string;
}

export class UseTaxService {
  private rateService: RateService;
  private addressProvider: DefaultAddressProvider;

  constructor() {
    this.addressProvider = new DefaultAddressProvider();
    this.rateService = new RateService(this.addressProvider);
  }

  /**
   * Assesses and persists consumer use tax on an untaxed purchase
   */
  public async assessUseTax(params: UseTaxAssessmentParams) {
    const normalized = await this.addressProvider.normalizeAddress({
      street1: params.deliveryAddress.street1,
      city: params.deliveryAddress.city,
      state: params.deliveryAddress.state,
      postalCode: params.deliveryAddress.postalCode
    });

    const rateQuote = await this.rateService.getRateForAddress(normalized);

    // Calculate gross use tax
    const grossUseTaxCents = BigInt(Math.round(Number(params.purchaseAmountCents) * rateQuote.compositeRate));

    // Credit for sales tax legally paid to another state (prevents double taxation under Commerce Clause)
    const otherStateCreditCents = params.taxPaidToOtherStateCents || BigInt(0);
    const netUseTaxCents = grossUseTaxCents > otherStateCreditCents
      ? grossUseTaxCents - otherStateCreditCents
      : BigInt(0);

    const position = await prisma.useTaxPosition.create({
      data: {
        taxCaseId: params.taxCaseId,
        purchaseDate: params.purchaseDate || new Date(),
        vendorName: params.vendorName,
        description: params.description,
        purchaseAmountCents: params.purchaseAmountCents,
        untaxedAmountCents: params.purchaseAmountCents,
        stateCode: normalized.state.toUpperCase(),
        jurisdictionCode: rateQuote.jurisdictionCode,
        applicableRate: rateQuote.compositeRate,
        calculatedUseTaxCents: netUseTaxCents,
        isSelfAssessed: true,
        status: 'CALCULATED',
        sourceTransactionId: params.sourceTransactionId
      }
    });

    return {
      position,
      rateQuote,
      grossUseTaxCents,
      otherStateCreditCents,
      netUseTaxCents
    };
  }

  /**
   * Summarizes all use tax positions for a TaxCase and state
   */
  public async getUseTaxSummary(taxCaseId: string, stateCode: string) {
    const positions = await prisma.useTaxPosition.findMany({
      where: {
        taxCaseId,
        stateCode: stateCode.toUpperCase()
      }
    });

    let totalUntaxedPurchasesCents = BigInt(0);
    let totalUseTaxDueCents = BigInt(0);

    for (const pos of positions) {
      totalUntaxedPurchasesCents += pos.purchaseAmountCents;
      totalUseTaxDueCents += pos.calculatedUseTaxCents;
    }

    return {
      stateCode: stateCode.toUpperCase(),
      itemCount: positions.length,
      totalUntaxedPurchasesCents,
      totalUseTaxDueCents,
      positions
    };
  }
}
