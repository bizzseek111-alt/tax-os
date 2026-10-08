# Phase 7 — Deterministic Sales Tax Return Preparation & District Schedules

## 1. Supported State Return Types
The `ReturnEngine` (`src/server/services/salesTax/returns/returnEngine.ts`) prepares deterministic state returns across all initial launch states:

| State Code | Return Form Code | Regulatory Agency | Schedules / Special Nuances |
| :--- | :--- | :--- | :--- |
| **California (US-CA)** | **CDTFA-401-A** | California Department of Tax and Fee Administration | **Schedule A**: District taxes allocated across California's ~300 local transit and municipal taxing districts. |
| **New York (US-NY)** | **ST-100** | New York State Department of Taxation and Finance | **Step 7 Vendor Collection Credit**: Up to $200 discount for timely filing. **Schedule B**: NYC & county allocations. |
| **New Jersey (US-NJ)** | **ST-50** | New Jersey Division of Taxation | Urban Enterprise Zone (UEZ) 50% rate reductions and quarterly reconciliation. |
| **Illinois (US-IL)** | **ST-1** | Illinois Department of Revenue | **Line 8 Retailer's Discount**: 1.75% timely filing credit. Schedule A origin vs. destination split. |
| **Massachusetts (US-MA)** | **ST-9** | Massachusetts Department of Revenue | Form ST-9 sales and use tax return with meals and telecommunications exemptions. |

---

## 2. Calculation Lineage & Provenance
Every line on a prepared state return contains:
- `grossSalesCents`
- `exemptSalesCents`
- `marketplaceSalesCents`
- `taxableSalesCents`
- `taxDueCents`
- `vendorDiscountCents`
- `netTaxDueCents`
- `inputFingerprintHash`: Cryptographic SHA-256 hash of all underlying transactions.
- `calculationLineage`: Exact mathematical provenance tracing every dollar back to individual transaction IDs.

---

## 3. Strict Two-Party Governance Gate
Before any return can transition to `READY_FOR_FILE` or be transmitted to a state agency:
1. **Party 1: Credentialed CPA Review Approval**: A verified Sales Tax Reviewer or CPA approves all schedules, exemptions, and district allocations.
2. **Party 2: Taxpayer Electronic Signature Authorization**: The authorized corporate officer provides e-signature authorization (Form 8879 or state equivalent).
