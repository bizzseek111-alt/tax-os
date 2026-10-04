/**
 * Autonomous Tax OS — Financial Data Provider Abstraction
 * Workstream 4: Plaid-ready adapter, mock provider, transaction normalization.
 */

export interface NormalizedTransaction {
  id: string;
  accountId: string;
  date: string;
  merchantName: string;
  amountCents: number;
  category: 
    | 'SOFTWARE_CLOUD' 
    | 'BUSINESS_TRAVEL' 
    | 'BUSINESS_MEALS' 
    | 'OFFICE_EXPENSE' 
    | 'EQUIPMENT_HARDWARE' 
    | 'INCOME_DEPOSIT' 
    | 'PERSONAL_EXPENSE';
  isTaxDeductibleCandidate: boolean;
  rawPlaidCategory: string[];
}

export interface FinancialDataProvider {
  getAccounts(userId: string): Promise<Array<{ id: string; name: string; mask: string; balanceCents: number }>>;
  getTransactions(accountId: string, startDate: string, endDate: string): Promise<NormalizedTransaction[]>;
}

export class PlaidReadyAdapter implements FinancialDataProvider {
  public async getAccounts(userId: string) {
    return [
      { id: 'acct-chase-biz-01', name: 'Chase Total Business Checking', mask: '8910', balanceCents: 4892000 },
      { id: 'acct-amex-biz-02', name: 'Amex Business Platinum', mask: '3004', balanceCents: -1849000 }
    ];
  }

  public async getTransactions(accountId: string, startDate: string, endDate: string): Promise<NormalizedTransaction[]> {
    return [
      {
        id: 'tx-plaid-01',
        accountId,
        date: '2026-03-15',
        merchantName: 'Amazon Web Services',
        amountCents: 1420000,
        category: 'SOFTWARE_CLOUD',
        isTaxDeductibleCandidate: true,
        rawPlaidCategory: ['Service', 'Computers and Electronics']
      },
      {
        id: 'tx-plaid-02',
        accountId,
        date: '2026-06-20',
        merchantName: 'GitHub & Vercel',
        amountCents: 429000,
        category: 'SOFTWARE_CLOUD',
        isTaxDeductibleCandidate: true,
        rawPlaidCategory: ['Service', 'Software Development']
      },
      {
        id: 'tx-plaid-03',
        accountId,
        date: '2026-08-11',
        merchantName: 'Delta Air Lines',
        amountCents: 41250,
        category: 'BUSINESS_TRAVEL',
        isTaxDeductibleCandidate: true,
        rawPlaidCategory: ['Travel', 'Airlines and Aviation']
      },
      {
        id: 'tx-plaid-04',
        accountId,
        date: '2026-09-04',
        merchantName: 'Stripe Payouts (Deposit)',
        amountCents: 9200000,
        category: 'INCOME_DEPOSIT',
        isTaxDeductibleCandidate: false,
        rawPlaidCategory: ['Transfer', 'Deposit']
      }
    ];
  }
}
