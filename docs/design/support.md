# Autonomous Tax OS — Customer Support UX Specification
**Persona:** Level 1 / Level 2 Customer Support Representative  
**Constraint:** Strict Least-Privilege Data Masking; Zero Unsupervised Access to Taxpayer SSNs or Financial Numbers

---

## 1. Support Workspace Layout & Triage Categories

Customer issues are cleanly segregated by functional boundary:
1. **Technical & Ingestion Issues**: Document upload failures, corrupted PDF files, bank connection disconnects.
2. **Billing & Subscription Issues**: Receipt requests, license renewals, enterprise seat management.
3. **Tax & Filing Exceptions**: Automatically transferred to licensed EA/CPA triage; support staff do not give tax advice.
4. **Security & Account Recovery**: Password resets, 2FA recovery, token revocation.

---

## 2. Privacy & PII Masking Controls

```
┌────────────────────────────────────────────────────────────────────────┐
│ CUSTOMER SUPPORT TICKET #8491 — USER: alex.rivera@example.com          │
├────────────────────────────────────────────────────────────────────────┤
│ TAXPAYER PII STATUS: MASKED                                            │
│ SSN: •••-••-9482 | Bank Routing: ••••••••2341 | Address: San Fran•••   │
├────────────────────────────────────────────────────────────────────────┤
│ SESSION DIAGNOSTICS:                                                   │
│ • Client Device: macOS Safari 18.2 (Desktop)                           │
│ • Last Event: Document OCR Processing (W-2 Vanguard PDF)               │
│ • Status: Processing Success (Hash: sha256:7f4c...)                    │
│ • Open Blockers: 1 Unresolved Item in Tax Inbox (Awaiting User Action) │
├────────────────────────────────────────────────────────────────────────┤
│ ESCALATION ACTIONS:                                                    │
│ [Request Document Re-upload] [Reset Bank Link] [Escalate to Tax Pro]   │
└────────────────────────────────────────────────────────────────────────┘
```
