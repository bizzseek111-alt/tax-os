# Phase 7 — Product Taxability Catalog & State Rules Matrix

## 1. Catalog Taxability Matrix
The Taxability Engine evaluates product items and service categories deterministically across launch states:

| Product Category | CA | NY | NJ | IL | MA | Key Statutory Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SaaS (Cloud Software)** | **EXEMPT** | **TAXABLE** | **TAXABLE** | **EXEMPT\*** | **EXEMPT** | CA/MA/IL treat remote unbundled cloud access as non-TPP; NY/NJ deem prewritten software taxable. |
| **Digital Goods** | **EXEMPT** | **TAXABLE** | **TAXABLE** | **TAXABLE** | **TAXABLE** | NY/NJ/IL/MA tax electronically downloaded canned software and audio/video files; CA exempts pure digital downloads. |
| **Tangible Property (TPP)** | **TAXABLE** | **TAXABLE** | **TAXABLE** | **TAXABLE** | **TAXABLE** | General retail merchandise is taxable across all 5 states, subject to statutory clothing exemptions. |
| **Professional Services** | **NON_TAXABLE** | **NON_TAXABLE** | **NON_TAXABLE** | **NON_TAXABLE** | **NON_TAXABLE** | Consulting, legal, accounting, and advisory services are exempt when unbundled from TPP. |
| **Software Maintenance** | **NON_TAXABLE** | **TAXABLE** | **TAXABLE** | **NON_TAXABLE** | **NON_TAXABLE** | Optional software maintenance without physical media is nontaxable in CA/IL/MA; taxable in NY/NJ. |
| **Separately Stated Shipping** | **EXEMPT** | **TAXABLE** | **TAXABLE** | **TAXABLE** | **EXEMPT** | CA & MA exempt separately stated common carrier freight; NY, NJ, and IL tax delivery charges for taxable goods. |

*\* Note on Illinois: Chicago imposes a separate municipal 9.0% Personal Property Lease Transaction Tax on cloud software, whereas Illinois state Retailers' Occupation Tax exempts true SaaS.*

## 2. Professional Reviewer Overrides
If a CPA reviewer determines that a contract represents custom software development rather than prewritten canned SaaS, or that bundled services should be unbundled:
- Reviewer calls `POST /api/v1/sales-tax/cases/:taxCaseId/taxability/override`.
- Persists a `TaxabilityDecision` record with `isReviewerOverride: true`, `ruleCitation`, and `determinationReason`.
- The Taxability Engine prioritizes the reviewer override over default state catalog rules.
