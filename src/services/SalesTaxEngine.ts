import { 
  SalesTaxRateVersion, 
  SalesTaxNexus, 
  SalesTaxTransaction, 
  SalesTaxReturn, 
  SalesTaxReconciliationSummary,
  SalesTaxEngineProvider,
  SourcingRule,
  TaxabilityStatus
} from '../types/salesTax';

// Sample multi-tier jurisdictions proving sales tax is NEVER a single state percentage
export const SAMPLE_MULTI_TIER_RATES: Record<string, SalesTaxRateVersion> = {
  'CA_LOS_ANGELES': {
    id: 'rate-ca-la-2027',
    versionNumber: '2027.1',
    effectiveFrom: '2027-01-01',
    stateRate: 0.0600,            // CA State Base: 6.00%
    countyRate: 0.0025,           // LA County: 0.25%
    cityRate: 0.0125,             // LA City Uniform Local: 1.25%
    specialDistrictRate: 0.0200,  // LA County MTA & Transit District: 2.00%
    compositeRate: 0.0950,        // Composite: 9.50%
    statuteCitation: 'Cal. Rev. & Tax. Code §§ 6051, 7202, 7251'
  },
  'NY_NEW_YORK_CITY': {
    id: 'rate-ny-nyc-2027',
    versionNumber: '2027.1',
    effectiveFrom: '2027-01-01',
    stateRate: 0.0400,            // NY State: 4.00%
    countyRate: 0.0000,
    cityRate: 0.0450,             // NYC City Tax: 4.50%
    specialDistrictRate: 0.00375, // Metropolitan Commuter Transportation District (MCTD): 0.375%
    compositeRate: 0.08875,       // Composite: 8.875%
    statuteCitation: 'NY Tax Law §§ 1105, 1107, 1109'
  },
  'TX_AUSTIN': {
    id: 'rate-tx-austin-2027',
    versionNumber: '2027.1',
    effectiveFrom: '2027-01-01',
    stateRate: 0.0625,            // TX State: 6.25%
    countyRate: 0.0000,
    cityRate: 0.0100,             // Austin City: 1.00%
    specialDistrictRate: 0.0100,  // Capital Metro MTA: 1.00%
    compositeRate: 0.0825,        // Composite: 8.25%
    statuteCitation: 'Tex. Tax Code §§ 151.051, 321.101, 322.101'
  },
  'WA_SEATTLE': {
    id: 'rate-wa-seattle-2027',
    versionNumber: '2027.1',
    effectiveFrom: '2027-01-01',
    stateRate: 0.0650,            // WA State: 6.50%
    countyRate: 0.0000,
    cityRate: 0.0100,             // Seattle City: 1.00%
    specialDistrictRate: 0.0285,  // Sound Transit / Regional Transit Authority: 2.85%
    compositeRate: 0.1035,        // Composite: 10.35%
    statuteCitation: 'RCW §§ 82.08.020, 82.14.030, 81.104.170'
  }
};

// SaaS Taxability rules across states
export const SAAS_TAXABILITY_RULES: Record<string, { status: TaxabilityStatus; citation: string; taxablePercent: number }> = {
  'NY': { status: 'TAXABLE', citation: 'NY TSB-M-08(7)S (SaaS is prewritten software)', taxablePercent: 1.0 },
  'TX': { status: 'PARTIALLY_TAXABLE', citation: 'Tex. Tax Code § 151.011 (Data processing 80% taxable)', taxablePercent: 0.80 },
  'WA': { status: 'TAXABLE', citation: 'RCW 82.04.192 (Digital automated services)', taxablePercent: 1.0 },
  'CA': { status: 'EXEMPT', citation: 'Cal. Reg. 1502 (SaaS not tangible personal property)', taxablePercent: 0.0 }
};

export class SalesTaxEngine {
  /**
   * Determine transaction taxability based on product type and jurisdiction
   */
  static determineTaxability(productCategory: string, stateCode: string): { status: TaxabilityStatus; rateFactor: number; citation: string } {
    if (productCategory === 'SW_SAAS') {
      const saasRule = SAAS_TAXABILITY_RULES[stateCode];
      if (saasRule) {
        return {
          status: saasRule.status,
          rateFactor: saasRule.taxablePercent,
          citation: saasRule.citation
        };
      }
    }
    // Default tangible goods rule
    return {
      status: 'TAXABLE',
      rateFactor: 1.0,
      citation: `State ${stateCode} General Sales Tax Act`
    };
  }

  /**
   * Calculates tax on a multi-line transaction using destination sourcing and composite rates
   */
  static calculateTransaction(params: {
    transactionNumber: string;
    amount: number;
    destinationKey: 'CA_LOS_ANGELES' | 'NY_NEW_YORK_CITY' | 'TX_AUSTIN' | 'WA_SEATTLE';
    stateCode: string;
    productCategory: string;
    isMarketplace: boolean;
    customerExempt?: boolean;
  }): Partial<SalesTaxTransaction> {
    const rateVersion = SAMPLE_MULTI_TIER_RATES[params.destinationKey] || SAMPLE_MULTI_TIER_RATES['CA_LOS_ANGELES'];
    const taxability = this.determineTaxability(params.productCategory, params.stateCode);

    if (params.customerExempt || taxability.status === 'EXEMPT') {
      return {
        transactionNumber: params.transactionNumber,
        grossAmount: params.amount,
        exemptAmount: params.amount,
        taxableAmount: 0,
        rateApplied: rateVersion,
        taxCalculated: 0,
        taxCollected: 0,
        marketplaceCollectedAmount: 0,
        directlyCollectedAmount: 0,
        provenance: {
          engineVersion: 'SalesTaxEngine-v2.4.0',
          ruleSetVersion: '2027.Q1',
          ruleIds: ['RULE-EXEMPTION-CERT'],
          inputHash: `tx-${params.transactionNumber}-exempt`,
          calculatedAt: new Date().toISOString(),
          citations: [taxability.citation]
        }
      };
    }

    const taxableAmount = params.amount * taxability.rateFactor;
    const exemptAmount = params.amount - taxableAmount;
    const taxCalculated = Math.round(taxableAmount * rateVersion.compositeRate * 100) / 100;

    const marketplaceCollected = params.isMarketplace ? taxCalculated : 0;
    const directlyCollected = params.isMarketplace ? 0 : taxCalculated;

    return {
      transactionNumber: params.transactionNumber,
      grossAmount: params.amount,
      exemptAmount,
      taxableAmount,
      rateApplied: rateVersion,
      taxCalculated,
      taxCollected: taxCalculated,
      marketplaceCollectedAmount: marketplaceCollected,
      directlyCollectedAmount: directlyCollected,
      provenance: {
        engineVersion: 'SalesTaxEngine-v2.4.0',
        ruleSetVersion: '2027.Q1',
        ruleIds: [rateVersion.id, `TAXABILITY-${params.stateCode}`],
        inputHash: `tx-${params.transactionNumber}-calc`,
        calculatedAt: new Date().toISOString(),
        citations: [rateVersion.statuteCitation, taxability.citation],
        traceLog: [
          `Destination jurisdiction resolved: ${rateVersion.id}`,
          `State Rate: ${(rateVersion.stateRate * 100).toFixed(2)}%`,
          `County Rate: ${(rateVersion.countyRate * 100).toFixed(2)}%`,
          `City Rate: ${(rateVersion.cityRate * 100).toFixed(2)}%`,
          `Special District Rate: ${(rateVersion.specialDistrictRate * 100).toFixed(2)}%`,
          `Composite Rate Applied: ${(rateVersion.compositeRate * 100).toFixed(3)}%`,
          params.isMarketplace ? 'Marketplace facilitator law applied: Marketplace remits directly' : 'Merchant collects and remits directly'
        ]
      }
    };
  }

  /**
   * Evaluate economic nexus status based on sales threshold and transaction counts
   */
  static evaluateNexus(nexus: SalesTaxNexus): {
    hasNexus: boolean;
    percentage: number;
    actionRequired: boolean;
    message: string;
  } {
    const salesProgress = (nexus.currentTrailingSales / nexus.thresholdAmount) * 100;
    let txProgress = 0;
    if (nexus.thresholdTransactionCount) {
      txProgress = (nexus.currentTrailingTransactions / nexus.thresholdTransactionCount) * 100;
    }

    const maxProgress = Math.max(salesProgress, txProgress);
    const hasBreached = nexus.currentTrailingSales >= nexus.thresholdAmount || 
      (nexus.thresholdTransactionCount ? nexus.currentTrailingTransactions >= nexus.thresholdTransactionCount : false);

    let actionRequired = false;
    let message = '';

    if (hasBreached) {
      if (nexus.registrationStatus === 'REGISTERED') {
        message = 'Nexus active. Filing obligations in effect.';
      } else {
        actionRequired = true;
        message = `CRITICAL: Economic nexus threshold breached on ${nexus.nexusTriggerDate || 'recent transactions'}. Registration required by ${nexus.registrationDeadline || 'immediately'}!`;
      }
    } else if (maxProgress >= 80) {
      actionRequired = true;
      message = `WARNING: Approaching threshold (${maxProgress.toFixed(1)}%). Prepare state sales tax permit application.`;
    } else {
      message = `Sub-threshold (${maxProgress.toFixed(1)}%). No registration required.`;
    }

    return {
      hasNexus: hasBreached,
      percentage: Math.min(maxProgress, 100),
      actionRequired,
      message
    };
  }
}
