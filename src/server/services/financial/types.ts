export interface FinancialInstitution {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface NormalizedAccount {
  providerAccountId: string;
  name: string;
  type: string; // depository, credit, loan, investment
  subtype?: string; // checking, savings, credit card
  mask?: string;
  currency: string;
  currentBalanceCents?: bigint;
  availableBalanceCents?: bigint;
}

export interface NormalizedTransaction {
  providerTransactionId: string;
  providerAccountId: string;
  date: string;
  authorizedDate?: string;
  rawMerchant?: string;
  normalizedMerchant?: string;
  description: string;
  amountCents: bigint;
  currency: string;
  direction: 'DEBIT' | 'CREDIT';
  rawCategory: string[];
  normalizedCategory?: string;
  isPending: boolean;
}

export interface SyncTransactionsResult {
  added: NormalizedTransaction[];
  modified: NormalizedTransaction[];
  removed: string[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface FinancialDataProvider {
  name: string;
  isSandbox: boolean;

  createLinkSession(userId: string, organizationId: string): Promise<{ linkToken: string; expiration: string }>;
  exchangeToken(publicToken: string): Promise<{ accessToken: string; itemId: string; institutionName: string }>;
  listInstitutions(): Promise<FinancialInstitution[]>;
  listAccounts(accessToken: string): Promise<NormalizedAccount[]>;
  syncTransactions(accessToken: string, cursor?: string): Promise<SyncTransactionsResult>;
  refreshConnection(connectionId: string): Promise<boolean>;
  disconnect(connectionId: string): Promise<boolean>;
  getConnectionHealth(connectionId: string): Promise<{ status: string; lastSyncSuccess: boolean }>;
}
