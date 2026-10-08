# TaxOS General Availability Production Blockers
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Milestone:** Progression from Private Beta to General Availability (GA)  
**Classification:** Definitive Blocker Punchlist  

---

## 1. Executive Summary

A successful software build and 100% test pass rate are **necessary but not sufficient** for commercial production approval of a financial compliance platform.

TaxOS strictly refuses to claim General Availability until all external statutory, regulatory, and audit milestones are formally completed. This document enumerates the **exact blocking items** preventing General Availability.

---

## 2. Hard Blocking Items for General Availability

```
+----------------------------------------------------------------------------------+
|                   TAXOS GENERAL AVAILABILITY GATEWAY CHECKLIST                   |
+----------------------------------------------------------------------------------+
| [ ] BLOCKER 1: IRS Assurance Testing System (ATS) Transmitter Certification       |
| [ ] BLOCKER 2: Production EFIN / ETIN Credentials Deployment                     |
| [ ] BLOCKER 3: Third-Party AICPA SOC 2 Type II Final Audit Report                |
| [ ] BLOCKER 4: State Department of Revenue Transmitter Approvals (5 States)      |
| [ ] BLOCKER 5: Comprehensive FIDO2 / WebAuthn Hardware Key Enforcement for PAM   |
+----------------------------------------------------------------------------------+
```

---

## 3. Detailed Blocker Analysis & Action Plans

### Blocker 1: IRS Assurance Testing System (ATS) Transmitter Certification
* **Description:**  
  The IRS e-file program mandates that any electronic return transmitter must pass the annual Assurance Testing System (ATS) developer test pack. This requires submitting synthetic test return packages matching exact scenario criteria specified in IRS Publication 5078 / Publication 4164 and obtaining a formal passing acknowledgment from the IRS e-Help Desk.
* **Current Status:**  
  Internal MeF XML generation and schema validation (2026v1.0 schema) are 100% validated against IRS sample schemas in sandbox mode. However, the official test pack has not yet been submitted to the live IRS ATS gateway.
* **Action Required for GA:**  
  Submit developer test packs for Form 1040, Form 941, and Form 940; receive official ATS acceptance letter from IRS e-Help Desk.
* **Owner:** E-File Systems Engineering Lead & Compliance Officer.

---

### Blocker 2: Production EFIN / ETIN Credentials Deployment
* **Description:**  
  Live transmission of taxpayer returns requires an active Electronic Filing Identification Number (EFIN) and Electronic Transmitter Identification Number (ETIN) issued to TaxOS by the Internal Revenue Service under IRS Publication 1345.
* **Current Status:**  
  The system runs in `SANDBOX` environment using simulated transmitter credentials (`TEST_ETIN_001`). Production credentials cannot be deployed into cloud Key Management Services (KMS) until ATS testing (Blocker 1) is formally completed.
* **Action Required for GA:**  
  Deploy production EFIN and ETIN credentials into AWS KMS / Google Cloud KMS secret manager with hardware security module (HSM) protection.
* **Owner:** Chief Information Security Officer (CISO).

---

### Blocker 3: Third-Party AICPA SOC 2 Type II Final Audit Report
* **Description:**  
  Enterprise accounting firms and corporate tax departments mandate an independent SOC 2 Type II audit report covering Security, Confidentiality, and Processing Integrity across an unbroken observation window of at least 6 months.
* **Current Status:**  
  All technical security controls (immutable audit logging, RBAC/ABAC, PAM, disaster recovery drills, PII masking) are fully implemented and passing. However, the external observation period with an accredited CPA auditing firm is in progress.
* **Action Required for GA:**  
  Complete the 6-month observation period and receive the finalized, unqualified SOC 2 Type II audit report.
* **Owner:** VP of Risk & Compliance.

---

### Blocker 4: State Department of Revenue Transmitter Approvals
* **Description:**  
  Each state taxing authority (e.g., California Franchise Tax Board, California CDTFA, New York Department of Taxation and Finance) requires separate state e-file transmitter testing and approval.
* **Current Status:**  
  State return formats (CA Form 540, NY IT-201, CDTFA-401-A) are fully implemented in sandbox format.
* **Action Required for GA:**  
  Execute official state ATS developer testing with the 5 supported state revenue departments and obtain formal state transmitter authorization numbers.
* **Owner:** State Tax Compliance Team.

---

### Blocker 5: FIDO2 / WebAuthn Hardware Security Keys for PAM
* **Description:**  
  Privileged Access Management (PAM) grants for unmasked PII viewing currently require TOTP MFA re-authentication. To achieve enterprise General Availability, hardware security keys (YubiKey / WebAuthn) must be strictly enforced for all administrative and unmasked PII access.
* **Current Status:**  
  TOTP RFC 6238 is enforced. WebAuthn endpoint integration is scheduled for Private Beta v1.2.
* **Action Required for GA:**  
  Mandate FIDO2 hardware token authentication for all JIT unmasked PII requests.
* **Owner:** Platform Security Team.

---

## 4. Conclusion

These 5 blocking items are strictly non-negotiable. Until each item is resolved and verified, TaxOS will remain in **`PRIVATE BETA READY`** or **`LIMITED PRODUCTION READY`** status, ensuring the absolute safety of real taxpayer data.
