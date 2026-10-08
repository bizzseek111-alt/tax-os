# TaxOS Statutory & Regulatory Compliance Gap Analysis
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** Private Beta Sandbox to Production  
**Statutory Frameworks:** IRS Publication 1345, IRS Publication 4164, IRC § 7216, IRC § 6694, AICPA Standards, SOC 2 Type II  

---

## 1. Compliance Baseline & Scope

TaxOS serves as a tax software platform assisting credentialed tax return preparers (CPAs, Enrolled Agents, Tax Attorneys). Under federal and state administrative law, tax preparation software is subject to strict regulatory compliance governing accuracy, electronic signatures, disclosure consent, preparer penalties, and transmission security.

---

## 2. Regulatory Framework Analysis

### 2.1. IRS Publication 1345 (Handbook for Authorized IRS e-file Providers)
* **Requirements:**
  - Mandatory electronic signature identity verification (Form 8879).
  - Software security and physical facility safeguards.
  - Verification of Electronic Return Originator (ERO) and Transmitter credentials.
* **Current Status:**
  - Technical requirements for signature metadata (IP, timestamp, signature digest) are 100% implemented.
  - E-file state machine enforces signature completion before transmission.
* **Gap for General Availability:**
  - Official Transmitter testing through the IRS Assurance Testing System (ATS) must be formally submitted and certified by the IRS e-Help Desk using production EFIN/ETIN credentials.

### 2.2. Internal Revenue Code § 7216 (Disclosure or Use of Tax Return Information)
* **Requirements:**
  - Prohibits tax return preparers from disclosing or using tax return information without formal, informed written consent from the taxpayer.
  - Separate consents required for tax preparation vs. commercial software features.
* **Current Status:**
  - `Consent` persistence model tracks consent text, IP address, user agent, agreement timestamp, and revocation timestamp.
  - Third-party AI model dispatches execute under enterprise business associate agreements prohibiting model training on taxpayer prompts.
* **Gap for General Availability:**
  - Annual compliance training verification for customer firm employees.

### 2.3. Internal Revenue Code § 6694 (Understatement of Taxpayer Liability by Tax Return Preparer)
* **Requirements:**
  - Imposes statutory financial penalties on preparers who take positions lacking "substantial authority" or a "reasonable basis" without adequate disclosure.
* **Current Status:**
  - Deterministic calculations enforce statutory IRC standards.
  - Tax Authority Engine verifies binding legal citations for all tax positions. Positions lacking substantial authority trigger mandatory human review escalation.
* **Gap for General Availability:**
  - Continued expansion of state-specific administrative rule databases beyond the initial 5 states (CA, NY, NJ, IL, MA).

### 2.4. SOC 2 Type II Readiness
* **Requirements:**
  - Independent audit verification of Security, Confidentiality, and Processing Integrity across a minimum 6-month observation window.
* **Current Status:**
  - Immutable audit logging, RBAC/ABAC access controls, automated BCDR drills, and zero-float calculation integrity satisfy SOC 2 Type II control requirements.
* **Gap for General Availability:**
  - Formal 6-month observation period and third-party AICPA SOC 2 Type II audit report completion.

---

## 3. Compliance Readiness Matrix

| Statutory Mandate | Private Beta Status | General Availability Requirement | Blocking Status |
| :--- | :--- | :--- | :--- |
| IRS Form 8879 E-Signature | Compliant | Continuous audit logging | Ready for Beta |
| IRS Publication 4164 (XML) | Compliant (2026v1.0 schema) | Ongoing schema maintenance | Ready for Beta |
| IRS ATS Transmitter Certification | Mock / Sandbox Validated | Official ATS Developer Test Pack Approval | **GA BLOCKER** |
| Production EFIN / ETIN Credentials | Pending Application | Production Credential Secret Deployment | **GA BLOCKER** |
| SOC 2 Type II Certification | Architecture Ready | Final External Auditor Report | **GA BLOCKER** |
| IRC § 6501 Record Retention | Fully Enforced in DB | Continuous policy verification | Ready for Beta |
| 26 CFR § 31.6001-1 Payroll Records | Fully Enforced in DB | Continuous policy verification | Ready for Beta |

---

## 4. Compliance Conclusion

TaxOS has established all internal technical controls necessary to support credentialed CPAs in the Private Beta cohort. Progression to General Availability is strictly gated by external regulatory milestones (IRS ATS transmitter certification and SOC 2 Type II external audit).
