# TaxOS Privacy Gap Analysis & Data Protection Assessment
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** Private Beta Sandbox & Production Baseline  
**Governing Standards:** IRC § 7216, GLBA, CCPA/CPRA, IRS Publication 4557  

---

## 1. Privacy Architecture & PII Flow

TaxOS processes confidential taxpayer identifiers, financial accounts, and return filings. Protecting taxpayer privacy requires deterministic technical barriers rather than operational promises.

```
Incoming Data (SSN, EIN, Account #)
          |
          v
[ PiiRedactionService / Tokenization Gateway ]
    |---> Encrypted Storage Vault (AES-256 GCM)
    |---> Display / Standard Logging (Masked: ***-**-6789)
    |---> AI Agent Inference (Tokenized: ssn_token_abc)
```

---

## 2. Privacy Capabilities Implemented

### 2.1. PII Masking & Tokenization
- **Social Security Numbers (SSN):** Regex-detected (`\b\d{3}-\d{2}-\d{4}\b`) and masked as `***-**-6789`.
- **Employer Identification Numbers (EIN):** Masked as `**-***6789`.
- **Banking Credentials:** Routing numbers masked as `XXXX0358`; account numbers masked as `XXXXX4321`.
- **Log Sanitization:** Recursive object sanitization (`PiiRedactionService.sanitizeObject()`) strips passwords, JWT tokens, private keys, and raw identifiers before any object is serialized to stdout or telemetry.

### 2.2. Privileged Access Management (PAM) & JIT Decryption
- Viewing unmasked SSNs or bank details requires explicit Just-In-Time (JIT) access requests.
- Each grant requires:
  1. Professional role verification (`CPA_REVIEWER`, `TAX_ATTORNEY`, `COMPLIANCE_OFFICER`).
  2. Mandatory business justification reason (e.g. "Identity verification on IRS Form 8879").
  3. Re-authentication factor (TOTP / password).
  4. Automatic hard expiration after exactly 15 minutes.
- Immutable logging: Every JIT access grant is recorded in `PrivilegedPiiAccessGrant` and chained into the tenant `AuditEvent` ledger.

### 2.3. Statutory Retention & Deletion Workflow
- TaxOS implements statutory retention rules enforcing:
  - **IRC § 6501(a):** Mandatory 3-year (36-month) assessment retention for income tax records.
  - **26 CFR § 31.6001-1:** Mandatory 4-year (48-month) retention for employment and payroll tax records.
  - **Audit Trails:** 7-year (84-month) retention for immutable cryptographic ledgers.
- **Controlled Deletion Requests (`DataDeletionRequest`):**
  - CCPA/CPRA "Right to be Forgotten" requests are cross-referenced against active statutory windows and open legal holds.
  - Deletions are strictly rejected if statutory assessment periods remain open, citing the controlling federal statute.

---

## 3. Privacy Gap Analysis & Punchlist for GA

| Privacy Domain | Current Implementation | Gap / Action Item for General Availability | Target Milestone |
| :--- | :--- | :--- | :--- |
| PII Masking | 100% regex masking for SSN, EIN, bank info | Add optical PII blurring on raw document thumbnails | Private Beta v1.1 |
| PAM Access | 15-minute JIT grants with audit trail | Enforce hardware security keys (FIDO2/WebAuthn) for PAM | GA Prerequisite |
| IRC § 7216 Consent | Mandatory consent tracking for third-party tools | Client-facing consent revocation portal for accounting firms | Private Beta Launch |
| Third-Party AI Data Isolation | Zero-retention agreements on API contracts | Complete SOC 2 Type II external validation of LLM vendor BAA | GA Prerequisite |
| Data Residency | US-East / US-West isolated database clusters | Multi-region tenant pinning for strict state agency compliance | Post-GA Roadmap |

---

## 4. Privacy Conclusion

The technical controls implemented in Phase 10 satisfy all legal requirements for processing taxpayer data during Private Beta under controlled professional supervision.
