import crypto from 'crypto';
import {
  FinancialDataProvider,
  FinancialInstitution,
  NormalizedAccount,
  SyncTransactionsResult,
  NormalizedTransaction,
} from './types';

export class PlaidSandboxProvider implements FinancialDataProvider {
  name = 'Plaid (Sandbox)';
  isSandbox = true;

  private encryptionKey: string;

  constructor() {
    this.encryptionKey =
      process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  }

  /**
   * Encrypts provider access tokens with AES-256-CBC.
   */
  encryptToken(plainToken: string): string {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.encryptionKey.slice(0, 32), 'utf-8');
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainToken, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return `enc:aes256:${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts provider access tokens.
   */
  decryptToken(encryptedToken: string): string {
    const raw = encryptedToken.startsWith('enc:aes256:')
      ? encryptedToken.slice('enc:aes256:'.length)
      : encryptedToken;
    const [ivHex, ciphertext] = raw.split(':');
    if (!ivHex || !ciphertext) return encryptedToken;
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(this.encryptionKey.slice(0, 32), 'utf-8');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  async createLinkSession(userId: string, organizationId: string): Promise<{ linkToken: string; expiration: string }> {
    const token = `link-sandbox-${userId.slice(0, 8)}-${crypto.randomBytes(8).toString('hex')}`;
    const expiration = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
    return { linkToken: token, expiration };
  }

  async exchangeToken(publicToken: string): Promise<{ accessToken: string; itemId: string; institutionName: string }> {
    const rawAccessToken = `access-sandbox-${crypto.randomBytes(16).toString('hex')}`;
    const encrypted = this.encryptToken(rawAccessToken);
    return {
      accessToken: encrypted,
      itemId: `item-sandbox-${crypto.randomBytes(8).toString('hex')}`,
      institutionName: 'Chase Bank (Business & Commercial)',
    };
  }

  async listInstitutions(): Promise<FinancialInstitution[]> {
    return [
      { id: 'ins_chase', name: 'JPMorgan Chase Bank', primaryColor: '#117ACA' },
      { id: 'ins_bofa', name: 'Bank of America', primaryColor: '#E31837' },
      { id: 'ins_wells', name: 'Wells Fargo', primaryColor: '#D71E28' },
      { id: 'ins_svb', name: 'Silicon Valley Bank (SVB)', primaryColor: '#00529B' },
      { id: 'ins_stripe', name: 'Stripe Treasury', primaryColor: '#635BFF' },
    ];
  }

  async listAccounts(_accessToken: string): Promise<NormalizedAccount[]> {
    return [
      {
        providerAccountId: 'acc_chase_biz_checking_01',
        name: 'Chase Business Premier Checking',
        type: 'depository',
        subtype: 'checking',
        mask: '6789',
        currency: 'USD',
        currentBalanceCents: 4892015n, // $48,920.15
        availableBalanceCents: 4892015n,
      },
      {
        providerAccountId: 'acc_chase_biz_savings_02',
        name: 'Chase Business Money Market Savings',
        type: 'depository',
        subtype: 'savings',
        mask: '1240',
        currency: 'USD',
        currentBalanceCents: 12050000n, // $120,500.00
        availableBalanceCents: 12050000n,
      },
      {
        providerAccountId: 'acc_chase_ink_card_03',
        name: 'Ink Business Preferred Card',
        type: 'credit',
        subtype: 'credit card',
        mask: '4019',
        currency: 'USD',
        currentBalanceCents: 412500n, // -$4,125.00
        availableBalanceCents: 4587500n,
      },
    ];
  }

  async syncTransactions(_accessToken: string, _cursor?: string): Promise<SyncTransactionsResult> {
    const transactions: NormalizedTransaction[] = [
      {
        providerTransactionId: 'tx_plaid_aws_2026_01',
        providerAccountId: 'acc_chase_biz_checking_01',
        date: '2026-03-15',
        authorizedDate: '2026-03-14',
        rawMerchant: 'Amazon Web Services AWS.Amazon.com WA',
        normalizedMerchant: 'Amazon Web Services',
        description: 'AWS Cloud Compute & Storage Infrastructure',
        amountCents: 1420000n, // $14,200.00
        currency: 'USD',
        direction: 'DEBIT',
        rawCategory: ['Service', 'Computers and Technology'],
        normalizedCategory: 'Software & Cloud Infrastructure',
        isPending: false,
      },
      {
        providerTransactionId: 'tx_plaid_github_2026_02',
        providerAccountId: 'acc_chase_biz_checking_01',
        date: '2026-03-18',
        authorizedDate: '2026-03-18',
        rawMerchant: 'GitHub Inc San Francisco CA',
        normalizedMerchant: 'GitHub',
        description: 'GitHub Enterprise Team Plan',
        amountCents: 429000n, // $4,290.00
        currency: 'USD',
        direction: 'DEBIT',
        rawCategory: ['Service', 'Computers and Technology'],
        normalizedCategory: 'Developer Subscriptions',
        isPending: false,
      },
      {
        providerTransactionId: 'tx_plaid_stripe_deposit_03',
        providerAccountId: 'acc_chase_biz_checking_01',
        date: '2026-03-20',
        authorizedDate: '2026-03-20',
        rawMerchant: 'STRIPE PAYMENTS PAYOUT',
        normalizedMerchant: 'Stripe Payments',
        description: 'Client Invoicing Gross Settlement Deposit',
        amountCents: 3820000n, // $38,200.00
        currency: 'USD',
        direction: 'CREDIT',
        rawCategory: ['Transfer', 'Deposit'],
        normalizedCategory: 'Gross Revenue Receipts',
        isPending: false,
      },
      {
        providerTransactionId: 'tx_plaid_delta_air_04',
        providerAccountId: 'acc_chase_ink_card_03',
        date: '2026-03-22',
        authorizedDate: '2026-03-22',
        rawMerchant: 'DELTA AIR LINES ATLANTA GA',
        normalizedMerchant: 'Delta Air Lines',
        description: 'SFO - JFK Client Consultation Travel',
        amountCents: 41250n, // $412.50
        currency: 'USD',
        direction: 'DEBIT',
        rawCategory: ['Travel', 'Airlines and Aviation'],
        normalizedCategory: 'Travel & Transportation',
        isPending: false,
      },
    ];

    return {
      added: transactions,
      modified: [],
      removed: [],
      nextCursor: `cursor_sync_${Date.now()}`,
      hasMore: false,
    };
  }

  async refreshConnection(_connectionId: string): Promise<boolean> {
    return true;
  }

  async disconnect(_connectionId: string): Promise<boolean> {
    return true;
  }

  async getConnectionHealth(_connectionId: string): Promise<{ status: string; lastSyncSuccess: boolean }> {
    return { status: 'HEALTHY', lastSyncSuccess: true };
  }
}

export const financialDataProvider: FinancialDataProvider = new PlaidSandboxProvider();
