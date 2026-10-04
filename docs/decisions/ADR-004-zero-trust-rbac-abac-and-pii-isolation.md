# ADR-004: Zero-Trust RBAC/ABAC and Field-Level PII Tokenization

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
In tax compliance platforms, granting blanket administrative access to internal staff or paid tax preparers creates catastrophic data leakage exposure. Specifically, in mixed business/individual environments, an income tax preparer reviewing a corporate pass-through return (Form 1120-S) requires verified total salary deductions (Line 8), but has **zero legitimate need to view individual employee salaries or unmasked Social Security Numbers**.

## 2. Decision
**We mandate a Zero-Trust RBAC and ABAC architecture paired with a dedicated SSN Tokenization Vault:**
1. **Field-Level Tokenization**: Raw SSNs and bank account numbers are stored exclusively in an isolated, encrypted token vault. Application services operate on surrogate tokens (`tok_ssn_...`).
2. **Domain Segregation**: An income tax preparer receives only aggregate wage totals (`payroll:read_aggregates`) for Line 8 corporate return deductions. They are strictly denied `payroll:read_compensation` and `payroll:read_pii`.
3. **Automated PII Scrubbing**: All logging and observability pipelines automatically scrub 9-digit SSNs, credit card numbers, and banking credentials.
4. **Production Isolation**: Production taxpayer data is cryptographically prohibited from ever being cloned into development, staging, or testing environments.

## 3. Alternatives Considered
* *Alternative A: Role-Based Access at the Database Table Level Only* — Rejected. Too coarse-grained; exposes sensitive employee SSNs to preparers querying the general ledger.
* *Alternative B: Client-Side Masking Only* — Rejected. Insecure; raw unmasked PII still traverses the API wire and browser memory.

## 4. Trade-Offs & Consequences
* **Positive**: Minimizes breach blast radius; prevents insider threat leakage; exceeds FTC Safeguards Rule and IRS Pub 1075 mandates.
* **Negative**: Requires detokenization round-trips during final IRS MeF transmission packaging.

## 5. Security & PII Implications
Core security foundational pillar. Plaintext SSNs exist in memory only during final XML transmission payload creation inside the secure MeF gateway.

## 6. Tax & Legal Implications
Full compliance with IRC § 7216 (Criminal penalties for unauthorized disclosure or use of tax return information by preparers).

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review IRC § 7216 written consent disclosure requirements for electronic tax preparation software to ensure platform consent capture modals comply with Treasury Regulation § 301.7216-3.

## 8. Future Migration Considerations
The tokenization vault supports Hardware Security Module (HSM) key rotation and external identity provider federation (Okta, Azure AD) for enterprise B2B accounting firms.
