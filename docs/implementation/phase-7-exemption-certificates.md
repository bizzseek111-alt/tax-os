# Phase 7 — Exemption & Resale Certificate Engine

## 1. Customer Tax Classifications
The Exemption Service classifies customer accounts into distinct statutory tax personas:
- `RESELLER`: Wholesalers and retailers purchasing inventory for resale (requires state resale certificate).
- `GOVERNMENT`: Federal, state, or municipal agencies exempt by statutory law.
- `NON_PROFIT`: 501(c)(3) entities exempt from sales tax for qualifying purchases.
- `B2B`: General commercial business accounts (taxable unless certificate on file).
- `B2C`: Standard consumer accounts (always subject to retail sales tax).

## 2. Certificate Lifecycle & Verification
The `ExemptionCertificate` entity enforces a multi-state validation lifecycle:
1. **Ingestion**: Certificate number, customer reference, state code, certificate type, issue date, expiration date, and digital document attachment in Object Storage Vault.
2. **Initial State**: `PENDING_VERIFICATION` status.
3. **Professional CPA Verification**: A CPA or sales tax specialist reviews the certificate number and document against state databases and marks it `VALID`.
4. **Expiration Monitoring**: Blanket certificates (1 to 3 years) are monitored. Expired certificates transition to `EXPIRED`.
5. **Transaction Validation**: When rating an invoice or transaction, if the customer does not have a `VALID` certificate matching the destination state and effective date, the transaction is rated as taxable, or flagged as `MISSING_EXEMPTION`.
