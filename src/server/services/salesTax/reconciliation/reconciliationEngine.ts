/**
 * Autonomous Tax OS — Sales Tax Reconciliation Engine
 * 
 * Reconciles commerce platforms (Shopify, Amazon), payment processors (Stripe),
 * GL sales tax payable accounts, and returns. Detects under-collections, missing
 * exemptions, unlinked refunds, and marketplace double-counting.
 */

import { prisma } from '../../../db';
import { SalesTransactionType } from '@prisma/client';

export interface ReconciliationDiscrepancy {
  type: 'TAX_COLLECTED_MISMATCH' | 'MISSING_EXEMPTION' | 'UNMATCHED_SALES' | 'UNLINKED_REFUND' | 'REFUND_EXCEEDS_SALE' | 'MARKETPLACE_DOUBLE_COUNT';
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  transactionId: string;
  externalTransactionId: string;
  sourceChannel: string;
  message: string;
  taxVarianceCents: bigint;
  details: Record<string, any>;
}

export interface ReconciliationReport {
  taxCaseId: string;
  stateCode?: string;
  totalTransactionsEvaluated: number;
  totalGrossAmountCents: bigint;
  totalTaxCollectedCents: bigint;
  totalCalculatedTaxCents: bigint;
  netTaxDiscrepancyCents: bigint;
  discrepancies: ReconciliationDiscrepancy[];
  glSalesTaxPayableCents?: bigint;
  glVarianceCents?: bigint;
  isReconciled: boolean;
}

export class ReconciliationEngine {
  /**
   * Performs full deterministic sales tax audit and reconciliation
   */
  public async reconcile(params: {
    taxCaseId: string;
    stateCode?: string;
    glSalesTaxPayableCents?: bigint;
  }): Promise<ReconciliationReport> {
    const whereClause: any = { taxCaseId: params.taxCaseId };
    if (params.stateCode) {
      whereClause.destinationState = params.stateCode.toUpperCase();
    }

    const transactions = await prisma.salesTransaction.findMany({
      where: whereClause,
      include: {
        customer: {
          include: { exemptionCertificates: true }
        },
        lines: true
      }
    });

    let totalGrossAmountCents = BigInt(0);
    let totalTaxCollectedCents = BigInt(0);
    let totalCalculatedTaxCents = BigInt(0);
    const discrepancies: ReconciliationDiscrepancy[] = [];

    // Map for original transaction tracking (for refund validation)
    const transactionMap = new Map<string, typeof transactions[0]>();
    for (const txn of transactions) {
      transactionMap.set(txn.externalTransactionId, txn);
      if (txn.id) transactionMap.set(txn.id, txn);
    }

    for (const txn of transactions) {
      totalGrossAmountCents += txn.grossAmountCents;
      totalTaxCollectedCents += txn.taxCollectedCents;
      totalCalculatedTaxCents += txn.calculatedTaxCents;

      // 1. Tax Collected Mismatch (Checkout under/over collection)
      const variance = txn.calculatedTaxCents - txn.taxCollectedCents;
      if (variance !== BigInt(0) && !txn.isMarketplaceFacilitated) {
        // Discrepancy threshold: > $0.05 (5 cents) to account for roundoff
        if (variance > BigInt(5) || variance < BigInt(-5)) {
          discrepancies.push({
            type: 'TAX_COLLECTED_MISMATCH',
            severity: variance > BigInt(500) ? 'ERROR' : 'WARNING',
            transactionId: txn.id,
            externalTransactionId: txn.externalTransactionId,
            sourceChannel: txn.sourceChannel,
            message: `Checkout collected $${(Number(txn.taxCollectedCents) / 100).toFixed(2)}, but calculated tax was $${(Number(txn.calculatedTaxCents) / 100).toFixed(2)}. Variance: $${(Number(variance) / 100).toFixed(2)}.`,
            taxVarianceCents: variance,
            details: {
              taxCollectedCents: txn.taxCollectedCents.toString(),
              calculatedTaxCents: txn.calculatedTaxCents.toString()
            }
          });
        }
      }

      // 2. Missing Exemption Check
      if (txn.taxableAmountCents === BigInt(0) && txn.taxCollectedCents === BigInt(0) && !txn.isMarketplaceFacilitated) {
        const customer = txn.customer;
        const stateCert = customer?.exemptionCertificates.find(
          c => c.stateCode === txn.destinationState && c.status === 'VALID'
        );

        if (!stateCert && customer?.customerType !== 'GOVERNMENT') {
          discrepancies.push({
            type: 'MISSING_EXEMPTION',
            severity: 'ERROR',
            transactionId: txn.id,
            externalTransactionId: txn.externalTransactionId,
            sourceChannel: txn.sourceChannel,
            message: `Transaction treated as exempt, but customer '${customer?.name || 'Unknown'}' lacks a valid verified exemption certificate in ${txn.destinationState}.`,
            taxVarianceCents: txn.calculatedTaxCents,
            details: {
              customerId: txn.customerId,
              destinationState: txn.destinationState
            }
          });
        }
      }

      // 3. Refund & Credit Memo Linkage
      if (txn.transactionType === SalesTransactionType.REFUND || txn.transactionType === SalesTransactionType.CREDIT_MEMO) {
        if (!txn.originalTransactionId) {
          discrepancies.push({
            type: 'UNLINKED_REFUND',
            severity: 'WARNING',
            transactionId: txn.id,
            externalTransactionId: txn.externalTransactionId,
            sourceChannel: txn.sourceChannel,
            message: `Refund transaction ${txn.externalTransactionId} has no linked originalTransactionId.`,
            taxVarianceCents: BigInt(0),
            details: {
              grossAmountCents: txn.grossAmountCents.toString()
            }
          });
        } else {
          const original = transactionMap.get(txn.originalTransactionId);
          if (original) {
            const refundGrossAbs = txn.grossAmountCents < BigInt(0) ? -txn.grossAmountCents : txn.grossAmountCents;
            const originalGrossAbs = original.grossAmountCents < BigInt(0) ? -original.grossAmountCents : original.grossAmountCents;
            if (refundGrossAbs > originalGrossAbs) {
              discrepancies.push({
                type: 'REFUND_EXCEEDS_SALE',
                severity: 'CRITICAL',
                transactionId: txn.id,
                externalTransactionId: txn.externalTransactionId,
                sourceChannel: txn.sourceChannel,
                message: `Refund amount ($${(Number(refundGrossAbs) / 100).toFixed(2)}) exceeds original sale amount ($${(Number(originalGrossAbs) / 100).toFixed(2)}).`,
                taxVarianceCents: txn.taxCollectedCents,
                details: {
                  originalTransactionId: txn.originalTransactionId
                }
              });
            }
          }
        }
      }

      // 4. Marketplace Double-Counting Check
      if (txn.isMarketplaceFacilitated && txn.reconciledStatus === 'SELLER_LIABILITY') {
        discrepancies.push({
          type: 'MARKETPLACE_DOUBLE_COUNT',
          severity: 'CRITICAL',
          transactionId: txn.id,
          externalTransactionId: txn.externalTransactionId,
          sourceChannel: txn.sourceChannel,
          message: `Marketplace-facilitated transaction was misclassified as direct seller remittance liability.`,
          taxVarianceCents: txn.taxCollectedCents,
          details: {
            marketplaceName: txn.marketplaceName
          }
        });
      }
    }

    const netTaxDiscrepancyCents = totalCalculatedTaxCents - totalTaxCollectedCents;

    let glVarianceCents: bigint | undefined;
    if (params.glSalesTaxPayableCents !== undefined) {
      glVarianceCents = params.glSalesTaxPayableCents - totalTaxCollectedCents;
    }

    return {
      taxCaseId: params.taxCaseId,
      stateCode: params.stateCode,
      totalTransactionsEvaluated: transactions.length,
      totalGrossAmountCents,
      totalTaxCollectedCents,
      totalCalculatedTaxCents,
      netTaxDiscrepancyCents,
      discrepancies,
      glSalesTaxPayableCents: params.glSalesTaxPayableCents,
      glVarianceCents,
      isReconciled: discrepancies.filter(d => d.severity === 'CRITICAL' || d.severity === 'ERROR').length === 0
    };
  }
}
