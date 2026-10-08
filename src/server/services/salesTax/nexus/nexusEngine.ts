/**
 * Autonomous Tax OS — Deterministic Sales Tax Nexus Engine
 * 
 * Evaluates both Physical Nexus and Economic Nexus (South Dakota v. Wayfair)
 * against versioned statutory thresholds across launch states (CA, NY, NJ, IL, MA).
 * Provides warning band monitoring (75%, 90%, 100%) and automated task triggering.
 */

import { prisma } from '../../../db';
import { NexusStatus, RegistrationStatus } from '@prisma/client';

export interface StateNexusRule {
  stateCode: string;
  stateName: string;
  statutorySalesThresholdCents: bigint; // e.g. $500,000 = 50,000,000 cents
  statutoryTransactionThreshold: number | null; // e.g. 100, 200, or null
  thresholdOperator: 'SALES_ONLY' | 'SALES_AND_TRANSACTIONS' | 'SALES_OR_TRANSACTIONS';
  measurementPeriodType: 'CALENDAR_YEAR' | 'PRIOR_OR_CURRENT_CALENDAR' | 'TRAILING_12_MONTHS' | 'PRECEDING_4_QUARTERS';
  includesMarketplaceSalesInThreshold: boolean;
  statutoryCitation: string;
}

export const LAUNCH_STATE_NEXUS_RULES: Record<string, StateNexusRule> = {
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    statutorySalesThresholdCents: BigInt(50000000), // $500,000
    statutoryTransactionThreshold: null, // No transaction threshold in CA
    thresholdOperator: 'SALES_ONLY',
    measurementPeriodType: 'PRIOR_OR_CURRENT_CALENDAR',
    includesMarketplaceSalesInThreshold: true,
    statutoryCitation: 'Cal. Rev. & Tax. Code § 6203(c)(4)'
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    statutorySalesThresholdCents: BigInt(50000000), // $500,000
    statutoryTransactionThreshold: 100, // 100 transactions AND $500k
    thresholdOperator: 'SALES_AND_TRANSACTIONS',
    measurementPeriodType: 'PRECEDING_4_QUARTERS',
    includesMarketplaceSalesInThreshold: true,
    statutoryCitation: 'N.Y. Tax Law § 1101(b)(8)(iv)'
  },
  NJ: {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    statutorySalesThresholdCents: BigInt(10000000), // $100,000
    statutoryTransactionThreshold: 200, // OR 200 transactions
    thresholdOperator: 'SALES_OR_TRANSACTIONS',
    measurementPeriodType: 'PRIOR_OR_CURRENT_CALENDAR',
    includesMarketplaceSalesInThreshold: true,
    statutoryCitation: 'N.J. Stat. Ann. § 54:32B-3'
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    statutorySalesThresholdCents: BigInt(10000000), // $100,000
    statutoryTransactionThreshold: 200, // OR 200 transactions
    thresholdOperator: 'SALES_OR_TRANSACTIONS',
    measurementPeriodType: 'TRAILING_12_MONTHS',
    includesMarketplaceSalesInThreshold: true,
    statutoryCitation: '35 ILCS 120/2(b); 86 Ill. Adm. Code 150.803'
  },
  MA: {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    statutorySalesThresholdCents: BigInt(10000000), // $100,000
    statutoryTransactionThreshold: null, // Mass eliminated transaction threshold
    thresholdOperator: 'SALES_ONLY',
    measurementPeriodType: 'PRIOR_OR_CURRENT_CALENDAR',
    includesMarketplaceSalesInThreshold: true,
    statutoryCitation: 'Mass. Gen. Laws ch. 64H, § 1; 830 CMR 64H.1.7'
  }
};

export interface NexusEvaluationResult {
  stateCode: string;
  hasNexus: boolean;
  nexusReason: 'PHYSICAL_NEXUS' | 'ECONOMIC_NEXUS' | 'BOTH' | 'NONE';
  economicStatus: NexusStatus;
  percentageOfSalesThreshold: number;
  percentageOfTxnThreshold: number | null;
  grossSalesCents: bigint;
  transactionCount: number;
  statutorySalesThresholdCents: bigint;
  statutoryTransactionThreshold: number | null;
  warningTriggered?: 'THRESHOLD_WARNING_75' | 'THRESHOLD_WARNING_90' | 'NEXUS_BREACHED';
  citation: string;
}

export class NexusEngine {
  /**
   * Evaluates economic nexus for a given TaxCase and state deterministically
   */
  public async evaluateEconomicNexus(
    taxCaseId: string,
    stateCode: string,
    ruleVersion: string = '2026.1'
  ): Promise<NexusEvaluationResult> {
    const state = stateCode.toUpperCase();
    const rule = LAUNCH_STATE_NEXUS_RULES[state];
    if (!rule) {
      throw new Error(`Unsupported state for sales tax nexus evaluation: ${stateCode}`);
    }

    // Retrieve all sales transactions destined for this state
    const transactions = await prisma.salesTransaction.findMany({
      where: {
        taxCaseId,
        destinationState: state
      }
    });

    let grossSalesCents = BigInt(0);
    let retailSalesCents = BigInt(0);
    let taxableSalesCents = BigInt(0);
    const transactionCount = transactions.length;

    for (const txn of transactions) {
      grossSalesCents += txn.grossAmountCents;
      taxableSalesCents += txn.taxableAmountCents;
      retailSalesCents += (txn.grossAmountCents - txn.nonTaxableAmountCents);
    }

    const salesRatio = Number(grossSalesCents) / Number(rule.statutorySalesThresholdCents);
    const txnRatio = rule.statutoryTransactionThreshold
      ? transactionCount / rule.statutoryTransactionThreshold
      : null;

    let hasEconomicNexus = false;
    if (rule.thresholdOperator === 'SALES_ONLY') {
      hasEconomicNexus = salesRatio >= 1.0;
    } else if (rule.thresholdOperator === 'SALES_AND_TRANSACTIONS') {
      hasEconomicNexus = salesRatio >= 1.0 && (txnRatio !== null && txnRatio >= 1.0);
    } else if (rule.thresholdOperator === 'SALES_OR_TRANSACTIONS') {
      hasEconomicNexus = salesRatio >= 1.0 || (txnRatio !== null && txnRatio >= 1.0);
    }

    // Determine status & warning band
    let status: NexusStatus = NexusStatus.NO_NEXUS;
    let warning: 'THRESHOLD_WARNING_75' | 'THRESHOLD_WARNING_90' | 'NEXUS_BREACHED' | undefined;

    const maxRatio = txnRatio !== null ? Math.max(salesRatio, txnRatio) : salesRatio;

    if (hasEconomicNexus) {
      status = NexusStatus.NEXUS_ESTABLISHED;
      warning = 'NEXUS_BREACHED';
    } else if (maxRatio >= 0.90) {
      status = NexusStatus.APPROACHING_THRESHOLD;
      warning = 'THRESHOLD_WARNING_90';
    } else if (maxRatio >= 0.75) {
      status = NexusStatus.APPROACHING_THRESHOLD;
      warning = 'THRESHOLD_WARNING_75';
    }

    // Persist measurement record
    const measurement = await prisma.economicNexusMeasurement.create({
      data: {
        taxCaseId,
        stateCode: state,
        measurementPeriod: '2026-CALENDAR',
        grossSalesCents,
        retailSalesCents,
        taxableSalesCents,
        transactionCount,
        statutorySalesThresholdCents: rule.statutorySalesThresholdCents,
        statutoryTransactionThreshold: rule.statutoryTransactionThreshold,
        percentageOfSalesThreshold: Math.round(salesRatio * 10000) / 100, // e.g. 78.50%
        percentageOfTxnThreshold: txnRatio !== null ? Math.round(txnRatio * 10000) / 100 : null,
        status,
        breachedAt: hasEconomicNexus ? new Date() : null,
        ruleVersion,
        details: {
          citation: rule.statutoryCitation,
          thresholdOperator: rule.thresholdOperator
        }
      }
    });

    // Record NexusEvent if warning or breach triggered
    if (warning) {
      await prisma.nexusEvent.create({
        data: {
          taxCaseId,
          stateCode: state,
          eventType: warning,
          payload: {
            salesRatio,
            txnRatio,
            grossSalesCents: grossSalesCents.toString(),
            transactionCount,
            measurementId: measurement.id
          }
        }
      });

      // If breached, ensure a Registration task is created for human CPA review
      if (warning === 'NEXUS_BREACHED') {
        const existingTask = await prisma.taxTask.findFirst({
          where: {
            taxCaseId,
            taskType: `SALES_TAX_REGISTRATION_${state}`
          }
        });

        if (!existingTask) {
          await prisma.taxTask.create({
            data: {
              taxCaseId,
              taskType: `SALES_TAX_REGISTRATION_${state}`,
              status: 'PENDING_TAXPAYER',
              priority: 'CRITICAL',
              reason: `Economic nexus breached in ${rule.stateName} ($${(Number(grossSalesCents) / 100).toFixed(2)} sales / ${transactionCount} txns). Sales tax registration required under ${rule.statutoryCitation}.`,
              auditRecordHash: `nexus-${state}-${Date.now()}`
            }
          });
        }
      }
    }

    // Check physical nexus facts
    const physicalFacts = await prisma.physicalNexusFact.findMany({
      where: {
        taxCaseId,
        stateCode: state,
        status: 'NEXUS_ESTABLISHED'
      }
    });

    const hasPhysicalNexus = physicalFacts.length > 0;
    const finalHasNexus = hasEconomicNexus || hasPhysicalNexus;

    let nexusReason: 'PHYSICAL_NEXUS' | 'ECONOMIC_NEXUS' | 'BOTH' | 'NONE' = 'NONE';
    if (hasEconomicNexus && hasPhysicalNexus) nexusReason = 'BOTH';
    else if (hasEconomicNexus) nexusReason = 'ECONOMIC_NEXUS';
    else if (hasPhysicalNexus) nexusReason = 'PHYSICAL_NEXUS';

    return {
      stateCode: state,
      hasNexus: finalHasNexus,
      nexusReason,
      economicStatus: status,
      percentageOfSalesThreshold: Math.round(salesRatio * 10000) / 100,
      percentageOfTxnThreshold: txnRatio !== null ? Math.round(txnRatio * 10000) / 100 : null,
      grossSalesCents,
      transactionCount,
      statutorySalesThresholdCents: rule.statutorySalesThresholdCents,
      statutoryTransactionThreshold: rule.statutoryTransactionThreshold,
      warningTriggered: warning,
      citation: rule.statutoryCitation
    };
  }

  /**
   * Adds and verifies a physical nexus fact (e.g. 3PL inventory, remote employee)
   */
  public async recordPhysicalNexusFact(params: {
    taxCaseId: string;
    stateCode: string;
    factType: 'INVENTORY_3PL' | 'REMOTE_EMPLOYEE' | 'PHYSICAL_OFFICE' | 'WAREHOUSE' | 'TRADE_SHOW' | 'AFFILIATE';
    description: string;
    locationAddress: { street1: string; city: string; state: string; postalCode: string };
    activeFrom: Date;
    activeTo?: Date;
    payrollCount?: number;
    propertyValueCents?: bigint;
    evidenceId?: string;
  }) {
    const fact = await prisma.physicalNexusFact.create({
      data: {
        taxCaseId: params.taxCaseId,
        stateCode: params.stateCode.toUpperCase(),
        factType: params.factType,
        description: params.description,
        locationAddress: params.locationAddress,
        activeFrom: params.activeFrom,
        activeTo: params.activeTo,
        payrollCount: params.payrollCount,
        propertyValueCents: params.propertyValueCents,
        status: NexusStatus.NEXUS_ESTABLISHED,
        evidenceId: params.evidenceId
      }
    });

    await prisma.nexusEvent.create({
      data: {
        taxCaseId: params.taxCaseId,
        stateCode: params.stateCode.toUpperCase(),
        eventType: 'PHYSICAL_NEXUS_DETECTED',
        payload: {
          factId: fact.id,
          factType: params.factType,
          description: params.description
        }
      }
    });

    return fact;
  }
}
