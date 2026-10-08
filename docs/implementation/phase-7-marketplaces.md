# Phase 7 — Marketplace Facilitator Logic & Remittance Isolation

## 1. Statutory Marketplace Facilitator Rules
Under state Marketplace Facilitator laws (e.g. California AB 147, New York Tax Law § 1101(e), Illinois Public Act 101-0009), marketplace facilitators (e.g. Amazon, Walmart, Etsy, eBay) are legally obligated to collect and remit sales tax on behalf of third-party marketplace sellers.

---

## 2. The Double-Remittance Trap
The most pervasive error in automated indirect tax platforms is **double remittance**:
1. Amazon collects \$9.50 tax on a California customer sale and remits it directly to the CDTFA.
2. The seller's accounting software imports the gross sale into sales tax payable.
3. The automated platform reports the sale as taxable direct revenue and remits \$9.50 again.

TaxOS strictly eliminates double remittance through isolated marketplace accounting:
- Marketplace sales are included in **Gross Receipts** on state returns (as required by law).
- Marketplace sales are deducted in full on the statutory **Exempt / Marketplace Facilitator Deductions** line.
- Marketplace sales tax is completely excluded from the seller's final remittance check.

---

## 3. Marketplace Service Implementation (`MarketplaceService`)
The `MarketplaceService` (`src/server/services/salesTax/marketplace/marketplaceService.ts`):
- Detects facilitator channels (`isMarketplace = true`, `channel = 'AMAZON' | 'WALMART' | 'ETSY'`).
- Segregates direct e-commerce sales (Shopify, WooCommerce, custom checkout) from facilitator sales.
- Calculates `marketplaceTaxCollected` and `marketplaceTaxRemitted`.
- Emits structured reconciliation balances for state returns.
