# Phase 7 — Four-Way Sales Tax Reconciliation & Exception Engine

## 1. Multi-Source Reconciliation Architecture
TaxOS performs four-way reconciliation across independent financial systems:
1. **Order Management Feeds**: Shopify, WooCommerce, Amazon Seller Central, custom ERP orders.
2. **Payment Processors**: Stripe payouts, PayPal settlements, bank deposits.
3. **Deterministic Tax Engine**: TaxOS rooftop calculated tax liabilities.
4. **General Ledger**: Balance sheet account `2100 - Sales Tax Payable`.

## 2. Exception & Discrepancy Detection
The `ReconciliationEngine` analyzes every transaction and flags discrepancies into five severity tiers:

1. **`TAX_COLLECTED_MISMATCH`**: Cart checkout tax collected deviates from the statutory rooftop composite rate. Surfaces checkout under-collection risk before state auditors discover it.
2. **`MISSING_EXEMPTION`**: An invoice or transaction was marked tax-exempt for a customer who does not possess a valid verified exemption certificate in that state.
3. **`UNLINKED_REFUND`**: A refund transaction or credit memo lacks an `originalTransactionId`, threatening gross receipts integrity.
4. **`REFUND_EXCEEDS_SALE`**: Refund dollar value exceeds the original sale basis.
5. **`MARKETPLACE_DOUBLE_COUNT`**: Marketplace-facilitated sales incorrectly categorized as direct seller remittance liability.

## 3. General Ledger Variance Analysis
When the user connects their accounting GL, TaxOS verifies that `Sales Tax Payable` in QuickBooks/Xero matches the sum of calculated direct tax liabilities within a configurable tolerance threshold.
