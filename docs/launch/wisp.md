# TaxOS Written Information Security Program (WISP)
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Governing Authorities:** IRS Publication 4557, FTC Safeguards Rule (16 CFR Part 314), GLBA, AICPA Trust Services Criteria  
**Status:** Approved for Private Beta Operations  

---

## 1. Program Objective & Scope

This Written Information Security Program (WISP) establishes the administrative, technical, and physical safeguards deployed by TaxOS to protect confidential taxpayer data, Federal Tax Information (FTI), Personally Identifiable Information (PII), and proprietary tax-accounting records.

This program applies to all production infrastructure, application services, database environments, employees, contractors, and third-party vendors accessing TaxOS systems.

---

## 2. Information Security Governance & Risk Management

### 2.1. Security Governance Committee
The information security program is overseen by the **Risk & Compliance Committee**, comprising:
- Chief Information Security Officer (CISO)
- Chief Technology Officer (CTO)
- Chief Compliance Officer & Tax Counsel
- Platform Engineering Lead

### 2.2. Risk Assessment Process
- **Annual Comprehensive Risk Assessment:** Identification of internal and external threats to taxpayer data confidentiality, integrity, and availability.
- **Continuous Threat Modeling:** STRIDE threat analysis maintained across all ingestion, calculation, agent inference, and filing pathways.
- **Third-Party Vulnerability Management:** Dependency vulnerability tracking via continuous CI/CD audit scanning and static analysis.

---

## 3. Technical Access Controls & Authentication

### 3.1. Identity & Access Management (IAM)
1. **Multi-Factor Authentication (MFA):** Mandatory RFC 6238 TOTP (with planned FIDO2/WebAuthn migration) for all administrative and professional accounts (`CPA_REVIEWER`, `TAX_ATTORNEY`, `ADMIN`).
2. **Role-Based & Attribute-Based Access Control (RBAC/ABAC):** Strict separation across 15 system roles. Taxpayers cannot access professional queues; reviewers cannot modify platform rules without compliance approval.
3. **Multi-Tenant Boundary Isolation:** Tenant context (`organizationId`) is enforced at database query layers. Direct Object References (IDOR) are strictly rejected.

### 3.2. Privileged Access Management (PAM)
1. **Just-In-Time (JIT) PII Unmasking:** Viewing raw taxpayer SSNs, EINs, or banking details requires explicit justification, re-authentication, and grants that automatically expire after **15 minutes**.
2. **Super Admin Hardening:** No permanent administrative elevation. Super Admin operations require dual-authorization and log immutable audit entries.

---

## 4. Data Protection & Cryptography

### 4.1. Encryption Standards
* **Data in Transit:** TLS 1.3 enforced across all ingress points with HSTS, modern cipher suites, and automated certificate management.
* **Data at Rest:** 
  - PostgreSQL database volumes encrypted using AES-256.
  - S3 Document Vault encrypted via AWS KMS customer-managed keys.
  - Sensitive database columns (SSN tokens, bank accounts) encrypted at the application level.

### 4.2. PII Masking & Logging Sanitization
* All production application logs are filtered through `PiiRedactionService`, which automatically masks:
  - SSNs: `***-**-6789`
  - EINs: `**-***6789`
  - Bank Routing Numbers: `XXXX0358`
  - Bank Account Numbers: `XXXXX4321`
  - Passwords, bearer tokens, and JWT credentials: Completely stripped.

---

## 5. Vendor & Subprocessor Security Management

All third-party vendors and cloud providers handling taxpayer data undergo mandatory vendor risk assessment:

| Subprocessor / Vendor | Service Provided | Data Shared | Security Verification | Subprocessor Agreement |
| :--- | :--- | :--- | :--- | :--- |
| **AWS / Google Cloud** | Cloud Hosting & DB | Encrypted Blobs & DB | SOC 2 Type II, ISO 27001 | Enterprise BAA / DPA Signed |
| **Anthropic / OpenAI** | LLM Inference | Tokenized Summaries (No raw PII) | Zero-Retention BAA | Enterprise Agreement Prohibiting Training |
| **Plaid** | Bank Transaction Ingestion | Encrypted Account Tokens | SOC 2 Type II | Financial Services Agreement |

---

## 6. Business Continuity & Disaster Recovery (BCDR)

* **Recovery Point Objective (RPO):** Maximum 15 minutes (continuous WAL archiving).
* **Recovery Time Objective (RTO):** Maximum 60 minutes.
* **Automated Restore Testing:** Automated restore verification drills executed regularly to confirm that 100% of cryptographic blockchain audit ledgers remain unbroken post-restoration.

---

## 7. Incident Response & Regulatory Notification

* **Incident Classification:** Dual-track classification covering Security Severities (P0–P3) and Tax Defect Severities (T0–T3).
* **IRS Notification Mandate:** Unauthorized access to Federal Tax Information must be reported to the IRS Office of Safeguards and TIGTA within **24 hours**.
* **Operational Kill Switches:** Instantaneous zero-downtime kill switches deployed for agents, models, rules, jurisdictions, and filing pipelines.

---

## 8. Data Retention & Destruction

* **Statutory Minimums:**
  - Income tax returns & workpapers: Retained for a minimum of 3 years (36 months) per IRC § 6501(a).
  - Payroll & employment tax records: Retained for a minimum of 4 years (48 months) per 26 CFR § 31.6001-1.
  - Audit trail ledgers: Retained for 7 years (84 months).
* **Controlled Deletion:** Deletion requests (CCPA/CPRA) verify statutory retention windows and active legal holds before execution.

---

## 9. Employee Training & Administrative Safeguards

1. **Background Checks:** Mandatory criminal background checks for all engineering and operational staff with potential access to production systems.
2. **Annual Security & Privacy Training:** Mandatory training on IRC § 7216, IRS Publication 4557, social engineering, and secure coding practices.
3. **Clean Desk & Remote Work Policy:** Secure, encrypted workstations with endpoint detection and response (EDR), full disk encryption (FileVault/BitLocker), and screen lock timeouts.

---

## 10. Compliance Certification & Review

This WISP is reviewed annually and updated whenever significant architecture or regulatory changes occur.
