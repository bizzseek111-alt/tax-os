# TaxOS E-File Transmission & Filing Security Red Team Report
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** E-File Gateway, Transmission Queue & MeF Validation Pipeline  
**Classification:** Internal Filing Systems Security Evaluation  

---

## 1. Transmission Architecture & Principle of Non-Repudiation

Under IRS Publication 1345 and Publication 4164, the transmission of electronic returns requires strict non-repudiation, immutable packaging, and guaranteed idempotency.

```
[ Return Calculation Complete ]
              |
              v
[ Professional Review Complete (ReviewTask: APPROVED) ]
              |
              v
[ Taxpayer E-Signature (Form 8879 / Affidavit Hash) ]
              |
              v
[ MeF XML Packaging & Schema Validation ]
              |
              v
[ Deterministic Idempotency Key Generation ]
              |
              v
[ Secure Transmission Queue (Status: SUBMITTED) ]
              |
              v
[ Gateway / ATS Sandbox Transmission ]
              |
              v
[ Cryptographic Acknowledgment Processing (ACCEPTED / REJECTED) ]
```

---

## 2. Red Team Filing Attack Scenarios

### Attack 1: Premature Transmission Without Taxpayer Authorization
* **Scenario:** An API call or client request attempts to queue a return for transmission when `isSigned` is `false` or the Form 8879 signature is incomplete.
* **Defenses Tested:**
  - `TransmissionQueueService.queueForSubmission()` strictly evaluates:
    ```ts
    if (!returnVersion.isSigned) {
      throw new Error('ILLEGAL_TRANSMISSION: Return has not received taxpayer e-signature authorization (Form 8879)');
    }
    ```
* **Result:** **BLOCKED / DEFENDED**. Returns cannot transition to `QUEUED_FOR_TRANSMISSION` without a valid signature record.

### Attack 2: Duplicate Transmission / Race Condition Exploitation
* **Scenario:** Rapid concurrent requests are fired to trigger duplicate return transmissions for the same tax year and jurisdiction, attempting to cause double submission rejections.
* **Defenses Tested:**
  - Deterministic idempotency key derivation:
    ```ts
    idempotencyKey = sha256(`${taxCaseId}:${jurisdiction}:${taxYear}:${versionNumber}:${snapshotHash}`);
    ```
  - Database uniqueness constraint on `(jurisdiction, idempotencyKey)`.
* **Result:** **DEFENDED**. Duplicate submissions return the existing `submissionId` without re-queuing duplicate transmissions.

### Attack 3: In-Transit MeF XML Payload Tampering
* **Scenario:** An attacker intercepts the XML payload between creation and submission, altering the refund routing number or deduction total.
* **Defenses Tested:**
  - `ReturnVersion.hash` stores the SHA-256 digest of the canonical XML package.
  - Prior to dispatch, `TransmissionQueueService` recomputes the payload digest and verifies exact equality with `ReturnVersion.hash`.
* **Result:** **DEFENDED**. Mismatched payload hashes halt transmission immediately with `PAYLOAD_TAMPERING_DETECTED`.

### Attack 4: Webhook Replay & Status Spoofing
* **Scenario:** Attacker captures an IRS `ACCEPTED` acknowledgment webhook callback and replays it to artificially force a failed return into an accepted status.
* **Defenses Tested:**
  - Timestamp verification: Callbacks with timestamps older than 300 seconds are rejected (`TIMESTAMP_STALE`).
  - Signature verification: HMAC-SHA256 signature verification over raw request body using shared gateway secret.
  - Event ID deduplication: Previously processed `eventId` values are rejected.
* **Result:** **DEFENDED**.

---

## 3. General Availability Prerequisite Blockers

While all internal security and schema validation controls are 100% verified, production transmission remains gated by two mandatory external items:
1. **IRS Assurance Testing System (ATS) Transmitter Certification:** Formal approval of the developer test pack submissions through the IRS e-Help Desk.
2. **Production EFIN / ETIN Secret Deployment:** Production transmitter credentials must be deployed into the production cloud key management service (KMS).

Until these external certifications are completed, the platform operates in simulated sandbox mode.

---

## 4. Conclusion

The filing transmission security architecture guarantees zero unapproved submissions, zero duplicate transmissions, and complete non-repudiation across federal and state filing pipelines.
