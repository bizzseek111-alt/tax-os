# Phase 7 — Product Taxability Catalog & Determination Engine

## 1. Multi-State Product Taxability Matrix
Product and service taxability varies widely across jurisdictions. The `TaxabilityEngine` (`src/server/services/salesTax/catalog/taxabilityEngine.ts`) implements state-specific statutory rules for software, digital products, services, and physical goods:

| Product Category | CA (California) | NY (New York) | NJ (New Jersey) | IL (Illinois) | MA (Massachusetts) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SaaS (Cloud Software)** | **EXEMPT** (Cal. RTC § 6016) | **TAXABLE** (TB-ST-515) | **EXEMPT** (N.J.S.A. 54:32B-2) | **EXEMPT** (State) / **TAXABLE** (Chicago Lease Tax 9%) | **TAXABLE** (830 CMR 64H.1.3(14)) |
| **Digital Goods (E-books, Media)** | **EXEMPT** (No physical medium) | **TAXABLE** (Prewritten computer soft) | **TAXABLE** (N.J.S.A. 54:32B-3) | **EXEMPT** (Rot 86 ILCS 130) | **TAXABLE** (Digital media) |
| **Tangible Personal Property (TPP)** | **TAXABLE** (RTC § 6051) | **TAXABLE** (Tax Law § 1105) | **TAXABLE** (N.J.S.A. 54:32B-3) | **TAXABLE** (35 ILCS 120/2) | **TAXABLE** (ch. 64H, § 2) |
| **Professional Services** | **EXEMPT** (True object test) | **EXEMPT** (Unless enumerated) | **EXEMPT** (Unless enumerated) | **EXEMPT** (Service tax exempt) | **EXEMPT** (Services exempt) |
| **Custom Software / Dev Services** | **EXEMPT** (RTC § 6010.9) | **EXEMPT** (TB-ST-128) | **EXEMPT** (N.J.S.A. 54:32B-2) | **EXEMPT** (Non-prewritten) | **EXEMPT** (Professional service) |
| **Freight / Shipping (Separately Stated)** | **EXEMPT** (USPS/common carrier) | **TAXABLE** (Follows item taxability) | **TAXABLE** (Follows item taxability) | **TAXABLE** (If not separable) | **EXEMPT** (If separately stated) |

---

## 2. Taxability Determination Outputs
For every transaction line item, the engine yields one of five discrete taxability outcomes:
- `TAXABLE`: Subject to standard state and local sales tax rates.
- `EXEMPT`: Statutory exemption applies (e.g., standard SaaS in CA, verified wholesale resale).
- `NON_TAXABLE`: Item falls outside the statutory definition of taxable sales (e.g., pure consulting services).
- `PARTIALLY_TAXABLE`: Bundled transactions where only a distinct component is taxable.
- `UNKNOWN_REVIEW_REQUIRED`: Uncategorized SKU or custom contract requiring human review.

> **Zero-Hallucination Invariant**: The engine **never guesses** the taxability of unknown or novel products. Unrecognized items are flagged as `UNKNOWN_REVIEW_REQUIRED` and immediately routed to a credentialed CPA.

---

## 3. Reviewer Overrides & Provenance
Credentialed reviewers can override automated catalog classifications via `overrideTaxability`:
- Creates a versioned `TaxabilityDecision` record in PostgreSQL.
- Preserves the reviewer ID, timestamp, statutory citation, and explanation.
- Does not delete or overwrite prior determinations.
- Triggers deterministic recalculation of all affected transactions in open filing periods.
