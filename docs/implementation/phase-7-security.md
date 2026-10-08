# Phase 7 — Sales Tax Security, RBAC & Isolation Boundaries

## 1. Domain-Scoped Access Control (RBAC & ABAC)
TaxOS enforces strict principle-of-least-privilege boundaries across all sales tax operations:

- **Sales Tax Reviewer Role**:
  - May read and review business transactions, customer exemption certificates, taxability decisions, and sales tax returns.
  - **Strictly Barred** from viewing individual employee SSNs, payroll records, Form W-2s, or owner individual tax returns.
- **Support Representative Role**:
  - Views high-level filing status, due dates, and open registration tasks.
  - Barred from viewing raw transaction customer details, tax calculation workpapers, and state filing login credentials.
- **Tenant Isolation**:
  - All queries are bounded by `organizationId`. Cross-tenant data leakage is prohibited at the database query level.

---

## 2. Credential Encryption at Rest
State filing portal credentials and bank routing/account numbers are encrypted at rest using AES-256-GCM with envelope encryption via secure key management.

---

## 3. Cryptographic Blockchain Audit Ledger
All sales tax actions append an immutable block to the `AuditEvent` ledger:
- `SALES_TAX_REGISTRATION_CREATED`
- `NEXUS_THRESHOLD_MET`
- `TAXABILITY_OVERRIDDEN`
- `EXEMPTION_CERTIFICATE_VERIFIED`
- `SALES_TAX_RETURN_PREPARED`
- `SALES_TAX_RETURN_APPROVED_BY_CPA`
- `SALES_TAX_RETURN_AUTHORIZED_BY_TAXPAYER`
- `SALES_TAX_PAYMENT_SCHEDULED`
- `SALES_TAX_NOTICE_INGESTED`
