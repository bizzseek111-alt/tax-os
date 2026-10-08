# Phase 7 — Four-Way Sales Tax Reconciliation & Anomaly Detection

## 1. Multi-Source Reconciliation Engine
The `ReconciliationEngine` (`src/server/services/salesTax/reconciliation/reconciliationEngine.ts`) performs automated four-way reconciliation across all financial sources:
1. **Commerce Platform Orders**: Shopify, Amazon, WooCommerce, Stripe Billing.
2. **Payment Processors**: Net captured settlements from Stripe, PayPal, Square.
3. **Deterministic Tax Calculation Ledger**: TaxOS transaction line calculations.
4. **General Ledger (GL)**: Sales tax payable liability account in QuickBooks, Xero, or NetSuite.

---

## 2. Anomaly Classifications
When discrepancies exceed statutory tolerance thresholds ($1.00), the engine flags explicit exceptions:
- `UNMATCHED_SALES`: Orders present in e-commerce database with no corresponding bank or payment settlement.
- `TAX_COLLECTED_MISMATCH`: Checkout engine collected a different tax amount than the deterministic calculation engine computed.
- `MARKETPLACE_MISMATCH`: Marketplace-remitted amounts do not reconcile with 1099-K reportable values.
- `REFUND_MISMATCH`: Unlinked refunds where tax was returned without referencing the original order.
- `GL_MISMATCH`: Sales tax payable account balance diverges from calculated period liability.
- `UNKNOWN_JURISDICTION`: Sourcing failed to resolve to a recognized state or local taxing authority.

---

## 3. Human Review Routing
Material discrepancies automatically trigger a `ReviewTask` (`reviewType = 'CALCULATION_DISCREPANCY' | 'SALES_TAX_REVIEW'`) routed to a credentialed Sales Tax Reviewer, preventing the filing of unbalanced returns.
