/**
 * Autonomous TaxOS — Financial Connectivity & Transaction Ingestion Service (Phase 2)
 * 
 * Manages:
 * - Provider Link sessions and token exchanges
 * - FinancialAccount persistence with real balances
 * - Transaction sync, normalization, and fingerprinting
 * - Cross-source deduplication (Plaid vs CSV upload matching)
 * - User Consent tracking under Circular 230 / IRC § 7216
 * - Graceful disconnection and revocation
 */

import { prisma } from '../../db';
import { financialDataProvider, PlaidSandboxProvider } from './PlaidSandboxProvider';
import { AuditEventService } from '../audit';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

export class FinancialService {
  /**
   * Creates a Link session for the taxpayer.
   */
  static async createLinkSession(userId: string, organizationId: string) {
    return financialDataProvider.createLinkSession(userId, organizationId);
  }

  /**
   * Exchanges public token, saves connection, accounts, and records user consent.
   */
  static async exchangeTokenAndConnect(
    publicToken: string,
    userId: string,
    organizationId: string,
    consentTermsVersion = '2026.1-PLAID-CONNECT'
  ) {
    const exchange = await financialDataProvider.exchangeToken(publicToken);

    // 1. Persist User Consent
    await prisma.consent.create({
      data: {
        userId,
        organizationId,
        consentType: 'PLAID_CONNECTION',
        consentText: `Authorized read-only bank feed data aggregation via ${financialDataProvider.name} for tax year 2026`,
        agreedAt: new Date(),
      },
    });

    // 2. Create FinancialConnection
    const connection = await prisma.financialConnection.create({
      data: {
        organizationId,
        userId,
        provider: 'PLAID',
        providerConnectionId: exchange.itemId,
        institutionName: exchange.institutionName,
        encryptedAccessToken: exchange.accessToken,
        consentVersion: consentTermsVersion,
        consentedAt: new Date(),
        status: 'CONNECTED',
      },
    });

    // 3. Fetch and persist accounts
    const accounts = await financialDataProvider.listAccounts(exchange.accessToken);
    const createdAccounts = [];

    for (const acc of accounts) {
      const dbAcc = await prisma.financialAccount.create({
        data: {
          connectionId: connection.id,
          organizationId,
          providerAccountId: acc.providerAccountId,
          accountName: acc.name,
          accountType: acc.type,
          accountSubtype: acc.subtype,
          mask: acc.mask,
          currency: acc.currency,
          currentBalanceCents: acc.currentBalanceCents,
          availableBalanceCents: acc.availableBalanceCents,
          status: 'ACTIVE',
        },
      });
      createdAccounts.push(dbAcc);
    }

    // 4. Initial transaction sync
    const syncResult = await this.syncTransactionsForConnection(connection.id, organizationId, userId);

    return {
      connection,
      accounts: createdAccounts,
      syncedTransactionsCount: syncResult.syncedCount,
    };
  }

  /**
   * Syncs transactions from provider and avoids duplicate imports.
   */
  static async syncTransactionsForConnection(
    connectionId: string,
    organizationId: string,
    userId: string
  ) {
    const conn = await prisma.financialConnection.findUnique({
      where: { id: connectionId },
      include: { accounts: true },
    });

    if (!conn || !conn.encryptedAccessToken) {
      throw new Error('CONNECTION_NOT_FOUND_OR_INVALID');
    }

    const syncResult = await financialDataProvider.syncTransactions(conn.encryptedAccessToken);
    const accountMap = new Map(conn.accounts.map((a) => [a.providerAccountId, a.id]));

    let syncedCount = 0;
    let duplicateSkippedCount = 0;

    for (const tx of syncResult.added) {
      const accountId = accountMap.get(tx.providerAccountId) || conn.accounts[0]?.id;
      if (!accountId) continue;

      // Compute deterministic content fingerprint
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${accountId}|${tx.date}|${tx.amountCents.toString()}|${tx.normalizedMerchant || tx.rawMerchant || ''}`)
        .digest('hex');

      // 1. Check for existing transaction with same fingerprint
      const existingTx = await prisma.transaction.findFirst({
        where: {
          organizationId,
          OR: [
            { providerTransactionId: tx.providerTransactionId },
            { fingerprint },
          ],
        },
      });

      if (existingTx) {
        duplicateSkippedCount++;
        continue; // Idempotent re-sync: Do not duplicate
      }

      // 2. Check for CSV + Plaid probable match
      const probableMatch = await prisma.transaction.findFirst({
        where: {
          organizationId,
          source: 'CSV_IMPORT',
          amountCents: tx.amountCents,
          date: new Date(tx.date),
        },
      });

      const isDuplicate = !!probableMatch;
      const duplicateOfId = probableMatch ? probableMatch.id : undefined;

      // 3. Persist new transaction
      await prisma.transaction.create({
        data: {
          accountId,
          organizationId,
          providerTransactionId: tx.providerTransactionId,
          date: new Date(tx.date),
          authorizedDate: tx.authorizedDate ? new Date(tx.authorizedDate) : null,
          rawMerchant: tx.rawMerchant,
          normalizedMerchant: tx.normalizedMerchant,
          description: tx.description,
          amountCents: tx.amountCents,
          currency: tx.currency,
          direction: tx.direction,
          rawCategory: tx.rawCategory,
          normalizedCategory: tx.normalizedCategory,
          isPending: tx.isPending,
          source: 'PLAID',
          fingerprint,
          isDuplicate,
          duplicateOfId,
          duplicateConfidence: isDuplicate ? 0.92 : undefined,
          duplicateReason: isDuplicate ? 'Matched CSV uploaded transaction with identical date and amount' : undefined,
        },
      });

      syncedCount++;
    }

    // Update connection lastSyncedAt
    await prisma.financialConnection.update({
      where: { id: connectionId },
      data: { lastSyncedAt: new Date() },
    });

    await AuditEventService.recordEvent({
      organizationId,
      actorId: userId,
      actorRole: UserRole.TAXPAYER,
      action: 'SYNC_FINANCIAL_TRANSACTIONS',
      objectType: 'FinancialConnection',
      objectId: connectionId,
      reason: `Synced ${syncedCount} new transactions from ${conn.institutionName} (${duplicateSkippedCount} duplicates skipped)`,
    });

    return {
      syncedCount,
      duplicateSkippedCount,
    };
  }

  /**
   * Ingests CSV bank transactions safely.
   */
  static async importCsvTransactions(
    organizationId: string,
    accountId: string,
    rows: { date: string; description: string; amount: number; merchant?: string }[]
  ) {
    let importedCount = 0;
    let duplicatesCount = 0;

    for (const r of rows) {
      const cents = BigInt(Math.round(Math.abs(r.amount) * 100));
      const direction = r.amount < 0 ? 'DEBIT' : 'CREDIT';
      const fingerprint = crypto
        .createHash('sha256')
        .update(`${accountId}|${r.date}|${cents.toString()}|${r.merchant || r.description}`)
        .digest('hex');

      const existing = await prisma.transaction.findFirst({
        where: { organizationId, fingerprint },
      });

      if (existing) {
        duplicatesCount++;
        continue;
      }

      await prisma.transaction.create({
        data: {
          accountId,
          organizationId,
          date: new Date(r.date),
          description: r.description,
          rawMerchant: r.merchant || r.description,
          normalizedMerchant: r.merchant || r.description,
          amountCents: cents,
          direction,
          source: 'CSV_IMPORT',
          fingerprint,
        },
      });

      importedCount++;
    }

    return { importedCount, duplicatesCount };
  }

  /**
   * Disconnects a financial connection and marks consent revoked.
   */
  static async disconnectConnection(connectionId: string, organizationId: string, userId: string) {
    const conn = await prisma.financialConnection.findFirst({
      where: { id: connectionId, organizationId },
    });

    if (!conn) {
      throw new Error('CONNECTION_NOT_FOUND_OR_ACCESS_DENIED');
    }

    const updated = await prisma.financialConnection.update({
      where: { id: connectionId },
      data: {
        status: 'DISCONNECTED',
        revokedAt: new Date(),
      },
    });

    // Revoke corresponding consent
    await prisma.consent.updateMany({
      where: {
        organizationId,
        consentType: 'PLAID_CONNECTION',
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await AuditEventService.recordEvent({
      organizationId,
      actorId: userId,
      actorRole: UserRole.TAXPAYER,
      action: 'DISCONNECT_FINANCIAL_CONNECTION',
      objectType: 'FinancialConnection',
      objectId: connectionId,
      reason: `User revoked financial integration connection for ${conn.institutionName}`,
    });

    return updated;
  }
}
