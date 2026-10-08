# Phase 7 — Sales Tax Human Review Workflow & Operations

## 1. Professional Review Triggers
Sales tax cases route to Phase 6 `ReviewTask` workflows upon:
- Economic nexus threshold reaching 100% or physical nexus fact detected.
- Registration requirement identified for a new state.
- Unclassified product SKU flagged as `UNKNOWN_REVIEW_REQUIRED`.
- High-value return exceeding firm review materiality thresholds ($10,000+).
- Four-way reconciliation discrepancy exceeding $1.00 tolerance.
- Manual taxability override submitted by staff.
- State sales tax notice or audit inquiry ingested.

---

## 2. Reviewer Interface & Exception-First Workflows
The Sales Tax Reviewer operates within the unified review workspace:
- **Nexus Review Panel**: Inspects gross sales, transaction volume, statutory rules, and warning percentages. Actions: `CONFIRM`, `REJECT`, `REQUEST_INFO`, `ESCALATE`.
- **Taxability Panel**: Verifies product categories, state SaaS treatment, and exemption certificates. Actions: `APPROVE`, `MODIFY_CATEGORY`, `DISALLOW_EXEMPTION`.
- **Return Audit Panel**: Verifies district allocations (CDTFA-401-A Schedule A), vendor collection credits, and four-way reconciliation balances. Actions: `APPROVE_RETURN`, `REQUEST_ADJUSTMENT`.

---

## 3. Reviewer Role Scoping
Reviewers must possess `SALES_TAX` in their `authorizedTaxDomains` array and matching state authority (e.g. `US-CA`) in `authorizedJurisdictions`. General income tax preparers without sales tax qualifications are barred from approving sales tax returns.
