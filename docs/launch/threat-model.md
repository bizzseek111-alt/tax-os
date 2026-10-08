# TaxOS Security Threat Model & STRIDE Analysis
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** Private Beta Sandbox & Controlled Deployment  
**Status:** Approved for Private Beta  

---

## 1. Executive Summary & Architecture Scope

TaxOS is an enterprise-grade autonomous tax preparation, advisory, calculation, and compliance platform. The architecture integrates multi-tenant PostgreSQL persistence, a deterministic calculation core, hybrid RAG legal authority retrieval, multi-agent AI runtime, human-in-the-loop professional review routing, and secure electronic filing transmission pipelines.

Because TaxOS processes sensitive Taxpayer Personally Identifiable Information (PII), Federal Tax Information (FTI), banking credentials, and business payroll ledgers, the platform operates under an assumed-breach, zero-trust security paradigm.

---

## 2. Trust Boundaries & Data Flow Diagrams

```
[ UNTRUSTED ZONE: External Internet / Taxpayer Browser ]
       |  HTTPS / TLS 1.3 (HSTS, WAF, Rate Limiting)
       v
[ INGRESS & AUTHENTICATION BOUNDARY ]
   - Reverse Proxy / Edge Termination
   - JWT Verification & Refresh Token Rotation
   - MFA Enforcer (TOTP RFC 6238)
       |
       v
[ API APPLICATION BOUNDARY (Express / Node.js Engine) ]
   - Tenant Context Resolution (X-Tenant-ID validation)
   - Role-Based Access Control (RBAC) & Attribute-Based Access Control (ABAC)
   - Input Sanitization & Parameter Validation (Zod)
   - PII Masking / Tokenization Gateway
       |
       +---> [ AI / AGENT RUNTIME BOUNDARY ] (Sandboxed Agent Execution)
       |       - Prompt Injection Neutralizer
       |       - Deterministic Tool Gating
       |       - LLM Context Sanitizer (Stripped of raw SSN/EIN)
       |
       +---> [ DETERMINISTIC TAX ENGINE BOUNDARY ] (Zero-Float Cent Math)
       |       - Pure Functions
       |       - Calculation Lineage Graph
       |
       +---> [ PERSISTENCE & STORAGE BOUNDARY ]
               - PostgreSQL (Row-Level Multi-Tenant Isolation)
               - Cryptographic Blockchain Audit Ledger (SHA-256 Chained)
               - S3 Encrypted Document Vault (AES-256 KMS)
```

---

## 3. Comprehensive STRIDE Threat Analysis

### 3.1. Spoofing Identity
* **Threat Vectors:**
  - Impersonation of CPA professionals to approve fraudulent returns.
  - Session hijacking via stolen JWT or refresh tokens.
  - Taxpayer identity spoofing during onboarding.
* **Architecture Mitigations:**
  - Mandatory Multi-Factor Authentication (MFA) via RFC 6238 TOTP for all Professional (`CPA_REVIEWER`, `TAX_ATTORNEY`, `COMPLIANCE_OFFICER`, `ADMIN`) accounts.
  - Cryptographically signed JWT tokens with strict 15-minute expiration; refresh tokens stored in HTTP-only, SameSite=Strict cookies with one-time rotation.
  - IRS MeF Electronic Signature Standards: IP address, timestamp, device fingerprint, and taxpayer e-signature affidavit cryptographically hashed and bound to `ReturnVersion`.

### 3.2. Tampering with Data
* **Threat Vectors:**
  - Modification of confirmed tax facts, income amounts, or withholding figures.
  - Manipulation of immutable audit event records to conceal malicious actions.
  - In-transit tampering of MeF XML packages or transmission payloads.
* **Architecture Mitigations:**
  - Immutability of calculation inputs: Every calculation produces a discrete `TaxCalculationRun` snapshot containing bit-for-bit SHA-256 `inputSnapshotHash` and `outputHash`.
  - Cryptographic Blockchain Audit Ledger: Each `AuditEvent` contains `previousBlockHash`, `blockHash`, monotonic `sequence`, and canonical JSON payload hash. Any tampering breaks the chain and is detected by `AuditEventService.verifyChainIntegrity()`.
  - Transmission Payload Integrity: Filing XML packages are signed with SHA-256 digests and transmission state transitions require exact hash reconciliation before gateway dispatch.

### 3.3. Repudiation
* **Threat Vectors:**
  - Taxpayer denies authorizing return transmission.
  - Professional denies approving aggressive deduction positions.
  - Support staff denies viewing taxpayer SSN or bank details.
* **Architecture Mitigations:**
  - Form 8879 / Taxpayer Authorization: Persistent records in `ReturnVersion` and `FilingSubmission` with explicit timestamp, legal affidavit text, verified IP, and signed digest.
  - ReviewTask Sign-Offs: Every professional decision logs an immutable `AuditEvent` recording actor ID, credential, decision reason, and timestamp.
  - Privileged Access Management (PAM): Every PII decryption is recorded with JIT justification, time-limited token, and audit record.

### 3.4. Information Disclosure
* **Threat Vectors:**
  - Multi-tenant data leakage (IDOR: Insecure Direct Object References).
  - Exposure of raw SSNs, EINs, or bank account numbers in server logs or telemetry.
  - Leakage of taxpayer PII into third-party LLM inference prompts.
* **Architecture Mitigations:**
  - Multi-Tenant Isolation: Every database query enforces strict `organizationId` matching. Verified by automated IDOR attack suites.
  - PII Masking Pipeline: `PiiRedactionService` automatically masks SSN (`***-**-6789`), EIN (`**-***6789`), Routing (`XXXX0358`), and Account (`XXXXX4321`) before logging or displaying in non-privileged UI.
  - Prompt Sanitization: Raw taxpayer identifiers are tokenized before agent ingestion; AI prompts operate strictly on tokenized handles (`ssn_token_***`).

### 3.5. Denial of Service (DoS)
* **Threat Vectors:**
  - Resource exhaustion via massive file uploads (ZIP bombs, 10,000-page PDFs).
  - Infinite loops or recursive agent dispatch exhausting compute budget.
  - Replay of webhook callbacks overwhelming filing queues.
* **Architecture Mitigations:**
  - Strict upload limits: 50MB maximum file size, magic byte verification, decompression ratio caps, and CSV formula neutralization.
  - Hard agent budget caps: Maximum $5.00 LLM spend per case run, bounded agent retry loops (max 3), and Supervisor timeout limits.
  - Filing queue idempotency: Deterministic SHA-256 idempotency keys prevent duplicate transmission processing, and webhook replay protection rejects timestamps older than 300 seconds.

### 3.6. Elevation of Privilege
* **Threat Vectors:**
  - Taxpayer customer escalating to CPA reviewer role to self-approve returns.
  - Standard CPA escalating to Compliance Officer to modify platform tax rules.
  - Prompt injection tricking AI supervisor into granting administrative bypasses.
* **Architecture Mitigations:**
  - Strict RBAC matrix enforced at API middleware and domain services.
  - Deterministic state machine enforcement: State transitions (`READY_FOR_FILING`, `SUBMITTED`, etc.) are hard-coded in TypeScript and cannot be initiated by AI agents.
  - JIT PAM grants: Elevated PII decryption expires automatically after 15 minutes and requires active MFA re-authentication.

---

## 4. Residual Risks & Private Beta Posture

| Risk Area | Risk Level | Mitigation Status | Private Beta Scope |
| :--- | :--- | :--- | :--- |
| Multi-tenant boundary breach | Very Low | Enforced via tenant middleware & DB foreign keys | Full isolation tested |
| PII exposure in logs | Low | Automated regex redaction in all log sinks | Continuous CI verification |
| Agent prompt injection | Low | Header neutralization & untrusted document tags | Sandboxed LLM calls |
| External IRS gateway spoofing | Medium | Sandbox mock gateway in use | Production ATS tests pending |

**Conclusion:** The platform security architecture fulfills all foundational criteria for Private Beta deployment with approved customer cohorts.
