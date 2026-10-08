/**
 * Autonomous Tax OS — Deterministic Sales Tax Return Engine
 * 
 * Generates line-by-line sales tax returns across 5 launch states:
 * - California: CDTFA-401-A (with Schedule A District Taxes)
 * - New York: ST-100 (with Schedule B NYC & Vendor Collection Credit)
 * - Illinois: ST-1 (with ROT/UT sourcing schedules & Retailer's Discount)
 * - New Jersey: ST-50 (with clothing & marketplace deductions)
 * - Massachusetts: ST-9 (with clothing exemption & use tax)
 */

import { prisma } from '../../../db';
import { FilingFrequency, SalesTaxReturnStatus } from '@prisma/client';
import { MarketplaceService } from '../marketplace/marketplaceService';

export interface GenerateReturnParams {
  organizationId: string;
  taxCaseId: string;
  stateCode: string;
  periodYear: number;
  periodQuarter?: number;
  periodMonth?: number;
  filingFrequency?: FilingFrequency;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  isTimelyFiling?: boolean;
}

export class ReturnEngine {
  private marketplaceService: MarketplaceService;

  constructor() {
    this.marketplaceService = new MarketplaceService();
  }

  /**
   * Generates or recalculates a deterministic state sales tax return
   */
  public async generateReturn(params: GenerateReturnParams) {
    const state = params.stateCode.toUpperCase();
    const frequency = params.filingFrequency || FilingFrequency.QUARTERLY;

    let periodKey = `${params.periodYear}-Q${params.periodQuarter || 1}`;
    if (frequency === FilingFrequency.MONTHLY && params.periodMonth) {
      periodKey = `${params.periodYear}-M${String(params.periodMonth).padStart(2, '0')}`;
    } else if (frequency === FilingFrequency.ANNUALLY) {
      periodKey = `${params.periodYear}-ANNUAL`;
    }

    // Upsert SalesTaxReturnPeriod
    const returnPeriod = await prisma.salesTaxReturnPeriod.upsert({
      where: {
        taxCaseId_stateCode_periodKey: {
          taxCaseId: params.taxCaseId,
          stateCode: state,
          periodKey
        }
      },
      update: {
        startDate: params.startDate,
        endDate: params.endDate,
        dueDate: params.dueDate,
        filingFrequency: frequency
      },
      create: {
        taxCaseId: params.taxCaseId,
        stateCode: state,
        jurisdictionCode: `US-${state}`,
        periodKey,
        filingFrequency: frequency,
        periodYear: params.periodYear,
        periodQuarter: params.periodQuarter,
        periodMonth: params.periodMonth,
        startDate: params.startDate,
        endDate: params.endDate,
        dueDate: params.dueDate,
        status: 'CALCULATING'
      }
    });

    // Ingest all transactions for this period & state
    const transactions = await prisma.salesTransaction.findMany({
      where: {
        taxCaseId: params.taxCaseId,
        destinationState: state,
        transactionDate: {
          gte: params.startDate,
          lte: params.endDate
        }
      },
      include: {
        lines: true
      }
    });

    // Fetch consumer use tax positions
    const useTaxPositions = await prisma.useTaxPosition.findMany({
      where: {
        taxCaseId: params.taxCaseId,
        stateCode: state,
        purchaseDate: {
          gte: params.startDate,
          lte: params.endDate
        }
      }
    });

    let totalUseTaxCents = BigInt(0);
    for (const u of useTaxPositions) {
      totalUseTaxCents += u.calculatedUseTaxCents;
    }

    // Segregate direct vs marketplace sales
    const segregation = await this.marketplaceService.segregateSales({
      taxCaseId: params.taxCaseId,
      stateCode: state,
      startDate: params.startDate,
      endDate: params.endDate
    });

    let grossSalesCents = BigInt(0);
    let exemptSalesCents = BigInt(0);
    let taxableSalesCents = BigInt(0);
    let totalTaxCollectedCents = BigInt(0);

    const districtAllocations: Record<string, { taxableSalesCents: bigint; taxCents: bigint }> = {};

    for (const txn of transactions) {
      grossSalesCents += txn.grossAmountCents;
      if (txn.isMarketplaceFacilitated) {
        // Marketplace sales are included in gross sales, but deducted as exempt on seller's return
        exemptSalesCents += txn.grossAmountCents;
      } else {
        exemptSalesCents += txn.nonTaxableAmountCents;
        taxableSalesCents += txn.taxableAmountCents;
        totalTaxCollectedCents += txn.taxCollectedCents;

        const distKey = txn.destinationZip ? `ZIP-${txn.destinationZip.slice(0, 5)}` : `${state}-GENERAL`;
        if (!districtAllocations[distKey]) {
          districtAllocations[distKey] = { taxableSalesCents: BigInt(0), taxCents: BigInt(0) };
        }
        districtAllocations[distKey].taxableSalesCents += txn.taxableAmountCents;
        districtAllocations[distKey].taxCents += txn.taxCollectedCents;
      }
    }

    // State form specific calculation
    let returnFormName = 'STATE_RETURN';
    let stateTaxCents = BigInt(0);
    let localTaxCents = BigInt(0);
    let specialDistrictTaxCents = BigInt(0);
    let totalTaxDueCents = BigInt(0);
    let vendorCollectionCreditCents = BigInt(0);
    let netTaxPayableCents = BigInt(0);
    let lineItems: Record<string, any> = {};
    let schedules: Record<string, any> = {};

    const timely = params.isTimelyFiling !== false;

    switch (state) {
      case 'CA': {
        returnFormName = 'CDTFA_401_A';
        // CA base: 6.00% state + 1.25% county/local Bradley-Burns
        const baseTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0725));
        const districtTaxTotal = totalTaxCollectedCents > baseTaxCents ? totalTaxCollectedCents - baseTaxCents : BigInt(0);

        stateTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0600));
        localTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0125));
        specialDistrictTaxCents = districtTaxTotal;
        totalTaxDueCents = stateTaxCents + localTaxCents + specialDistrictTaxCents + totalUseTaxCents;
        netTaxPayableCents = totalTaxDueCents;

        lineItems = {
          line1_grossSales: grossSalesCents.toString(),
          line2_marketplaceDeductions: segregation.marketplaceSalesCents.toString(),
          line2b_otherExemptDeductions: (exemptSalesCents - segregation.marketplaceSalesCents).toString(),
          line3_taxableSales: taxableSalesCents.toString(),
          line4_stateAndLocalTax: (stateTaxCents + localTaxCents).toString(),
          line5_districtTaxes: specialDistrictTaxCents.toString(),
          line6_consumerUseTax: totalUseTaxCents.toString(),
          line10_totalTax: totalTaxDueCents.toString(),
          line12_netAmountDue: netTaxPayableCents.toString()
        };

        schedules = {
          scheduleA_districtAllocations: districtAllocations,
          scheduleT_useTaxBreakdown: useTaxPositions.map(u => ({
            vendor: u.vendorName,
            amountCents: u.purchaseAmountCents.toString(),
            taxCents: u.calculatedUseTaxCents.toString()
          }))
        };
        break;
      }

      case 'NY': {
        returnFormName = 'NY_ST_100';
        // NY base: 4.00% state + local/MCTD (e.g. NYC 4.5% + 0.375% = 8.875%)
        stateTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0400));
        localTaxCents = totalTaxCollectedCents > stateTaxCents ? totalTaxCollectedCents - stateTaxCents : BigInt(0);
        totalTaxDueCents = stateTaxCents + localTaxCents + totalUseTaxCents;

        // Vendor collection credit: 5% of tax due up to max $200 ($20,000 cents) if timely
        if (timely && totalTaxDueCents > BigInt(0)) {
          const discountCents = BigInt(Math.round(Number(totalTaxDueCents) * 0.05));
          vendorCollectionCreditCents = discountCents > BigInt(20000) ? BigInt(20000) : discountCents;
        }

        netTaxPayableCents = totalTaxDueCents - vendorCollectionCreditCents;

        lineItems = {
          step1_grossSalesAndServices: grossSalesCents.toString(),
          step1_marketplaceDeductions: segregation.marketplaceSalesCents.toString(),
          step2_taxableSalesAndServices: taxableSalesCents.toString(),
          step3_purchasesSubjectToUseTax: totalUseTaxCents.toString(),
          step4_stateTaxDue: stateTaxCents.toString(),
          step4_localTaxDue: localTaxCents.toString(),
          step5_totalTaxDue: totalTaxDueCents.toString(),
          step7_vendorCollectionCredit: vendorCollectionCreditCents.toString(),
          step8_netAmountDue: netTaxPayableCents.toString()
        };

        schedules = {
          scheduleB_localTaxes: districtAllocations
        };
        break;
      }

      case 'IL': {
        returnFormName = 'IL_ST_1';
        // Illinois base: 6.25% state general merchandise + municipal/county
        stateTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0625));
        localTaxCents = totalTaxCollectedCents > stateTaxCents ? totalTaxCollectedCents - stateTaxCents : BigInt(0);
        totalTaxDueCents = stateTaxCents + localTaxCents + totalUseTaxCents;

        // Retailer's discount: 1.75% of tax collected for timely filing
        if (timely && totalTaxDueCents > BigInt(0)) {
          vendorCollectionCreditCents = BigInt(Math.round(Number(totalTaxDueCents) * 0.0175));
        }

        netTaxPayableCents = totalTaxDueCents - vendorCollectionCreditCents;

        lineItems = {
          line1_totalGrossReceipts: grossSalesCents.toString(),
          line2_deductionsMarketplace: segregation.marketplaceSalesCents.toString(),
          line2b_deductionsOther: (exemptSalesCents - segregation.marketplaceSalesCents).toString(),
          line3_taxableReceipts: taxableSalesCents.toString(),
          line4_stateTax: stateTaxCents.toString(),
          line5_municipalAndCountyRot: localTaxCents.toString(),
          line6_useTax: totalUseTaxCents.toString(),
          line7_totalTaxDue: totalTaxDueCents.toString(),
          line8_retailersDiscount: vendorCollectionCreditCents.toString(),
          line10_netTaxDue: netTaxPayableCents.toString()
        };

        schedules = {
          scheduleA_countyAndMunicipalAllocations: districtAllocations
        };
        break;
      }

      case 'NJ': {
        returnFormName = 'NJ_ST_50';
        // NJ state flat: 6.625%
        stateTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.06625));
        totalTaxDueCents = stateTaxCents + totalUseTaxCents;
        netTaxPayableCents = totalTaxDueCents;

        lineItems = {
          line1_grossReceipts: grossSalesCents.toString(),
          line2_exemptReceiptsMarketplace: segregation.marketplaceSalesCents.toString(),
          line2b_exemptReceiptsOther: (exemptSalesCents - segregation.marketplaceSalesCents).toString(),
          line3_taxableReceipts: taxableSalesCents.toString(),
          line4_salesTaxDue: stateTaxCents.toString(),
          line5_useTaxDue: totalUseTaxCents.toString(),
          line6_totalTaxDue: totalTaxDueCents.toString(),
          line7_netTaxDue: netTaxPayableCents.toString()
        };
        break;
      }

      case 'MA': {
        returnFormName = 'MA_ST_9';
        // Massachusetts flat: 6.25%
        stateTaxCents = BigInt(Math.round(Number(taxableSalesCents) * 0.0625));
        totalTaxDueCents = stateTaxCents + totalUseTaxCents;
        netTaxPayableCents = totalTaxDueCents;

        lineItems = {
          line1_grossSales: grossSalesCents.toString(),
          line2_exemptSalesMarketplace: segregation.marketplaceSalesCents.toString(),
          line2b_exemptSalesOther: (exemptSalesCents - segregation.marketplaceSalesCents).toString(),
          line3_taxableSales: taxableSalesCents.toString(),
          line4_taxDue: stateTaxCents.toString(),
          line5_useTaxDue: totalUseTaxCents.toString(),
          line6_totalAmountDue: netTaxPayableCents.toString()
        };
        break;
      }

      default: {
        returnFormName = `GENERIC_${state}_RETURN`;
        stateTaxCents = totalTaxCollectedCents;
        totalTaxDueCents = stateTaxCents + totalUseTaxCents;
        netTaxPayableCents = totalTaxDueCents;
        lineItems = {
          grossSales: grossSalesCents.toString(),
          taxableSales: taxableSalesCents.toString(),
          taxDue: totalTaxDueCents.toString()
        };
        break;
      }
    }

    // Persist SalesTaxReturn
    const taxReturn = await prisma.salesTaxReturn.create({
      data: {
        organizationId: params.organizationId,
        taxCaseId: params.taxCaseId,
        returnPeriodId: returnPeriod.id,
        stateCode: state,
        returnFormName,
        status: SalesTaxReturnStatus.READY_FOR_REVIEW,
        grossSalesCents,
        marketplaceSalesCents: segregation.marketplaceSalesCents,
        exemptSalesCents,
        taxableSalesCents,
        stateTaxCents,
        localTaxCents,
        specialDistrictTaxCents,
        totalTaxDueCents,
        vendorCollectionCreditCents,
        netTaxPayableCents,
        lineItems,
        schedules,
        calculationLineage: {
          transactionCount: transactions.length,
          directSalesCents: segregation.directSalesCents.toString(),
          marketplaceSalesCents: segregation.marketplaceSalesCents.toString(),
          useTaxPositionsCount: useTaxPositions.length,
          generatedAt: new Date().toISOString(),
          version: '2026.1'
        }
      }
    });

    // Update return period status and rollups
    await prisma.salesTaxReturnPeriod.update({
      where: { id: returnPeriod.id },
      data: {
        status: 'READY_FOR_REVIEW',
        grossSalesCents,
        taxableSalesCents,
        taxCollectedCents: totalTaxCollectedCents,
        totalTaxDueCents
      }
    });

    return taxReturn;
  }
}
