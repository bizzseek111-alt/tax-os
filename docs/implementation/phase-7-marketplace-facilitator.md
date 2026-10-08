# Phase 7 — Marketplace Facilitator Logic & Double Remittance Prevention

## 1. Statutory Context
Under state marketplace facilitator laws (e.g. California Assembly Bill 147, New York Tax Law § 1101(e)), platforms such as **Amazon, Walmart, Etsy, and eBay** are deemed the retailer for sales tax purposes on third-party sales made through their marketplaces. The facilitator is legally obligated to calculate, collect, and remit the sales tax directly to the state.

## 2. The Seller's Return Dilemma
When an e-commerce merchant prepares their state sales tax returns (such as California CDTFA-401-A or New York ST-100), state statutes mandate:
1. **Gross Sales Reporting**: The seller must include **all sales** (both direct webstore sales and marketplace sales) in **Line 1: Total Gross Sales**.
2. **Statutory Deduction**: The seller must deduct marketplace sales on the deduction schedule (e.g., California CDTFA-401-A Line 2 / Marketplace Deductions; New York ST-100 Step 1 Deductions).
3. **Net Taxable Base**: The remaining taxable base represents only direct sales where the seller collected sales tax.
4. **Zero Double Remittance**: Marketplace-collected tax must **never** be included in the seller's remittance voucher.

## 3. TaxOS Implementation
The `MarketplaceService` segregates transactions during ingestion:
```typescript
const segregation = await marketplaceService.segregateSales({ taxCaseId, stateCode });
// Returns:
// - totalGrossSalesCents (Direct + Marketplace)
// - marketplaceSalesCents (Excluded from seller liability)
// - directSalesCents
// - sellerRemittanceLiabilityCents = directTaxCollectedCents
```
This guarantees mathematical accuracy on state tax filings while eliminating any possibility of double-paying sales tax to state agencies.
