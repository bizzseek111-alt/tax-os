# TaxOS Master Production Blockers (P0 – P3)

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** CTO, Principal Backend Engineer & Compliance Lead  
**Classification System:**
- **P0:** Cannot file a tax return without it (Absolute Hard Blocker)
- **P1:** Cannot launch commercial product without it (Compliance & Product Blocker)
- **P2:** Needed soon post-launch (Scalability & Automation)
- **P3:** Future roadmap (Advanced Enterprise Capabilities)

---

## 1. P0 Blockers — Cannot File Without It

| Blocker ID | Blocker Description | Why It Blocks Filing | Remediation Effort |
| :--- | :--- | :--- | :--- |
| **BLK-P0-01** | **No Persistent Database** | Without a persistent database (PostgreSQL), tax returns, client profiles, and filing records evaporate whenever the server restarts. | 3–4 weeks |
| **BLK-P0-02** | **No IRS MeF Transmitter Credentials (EFIN/ETIN)** | The IRS legally and technically rejects any electronic submission that lacks an authorized EFIN, ETIN, and digital certificate verified through IRS ATS testing. | 6–10 weeks (IRS process dependent) |
| **BLK-P0-03** | **Missing Upper Tax Brackets & Real Withholding** | The tax engine truncates brackets at 24% and calculates an artificial 15% refund (`totalTax * 1.15`). Filing this creates severe underreporting penalties. | 2–3 weeks |
| **BLK-P0-04** | **No Document Storage (File Bytes Discarded)** | Uploaded tax documents are discarded in memory; no bytes are saved to S3. IRS regulations mandate 3–7 year workpaper retention. | 1–2 weeks |
| **BLK-P0-05** | **Zero API Authentication** | The backend API has no authentication middleware. Any internet user can read or overwrite client tax returns. | 2 weeks |

---

## 2. P1 Blockers — Cannot Launch Without It

| Blocker ID | Blocker Description | Why It Blocks Launch | Remediation Effort |
| :--- | :--- | :--- | :--- |
| **BLK-P1-01** | **No Real OCR Pipeline** | The current upload flow inspects filename strings (e.g. `w2`). Real PDFs with generic names (e.g., `scan_001.pdf`) cannot be processed. | 3 weeks |
| **BLK-P1-02** | **Missing `ProfessionalUser` and `ReviewTask` Models** | Human review workflows and `review_mode` are purely transient React state; CPA assignments cannot be tracked or routed by state license. | 2 weeks |
| **BLK-P1-03** | **Sales Tax Limited to 4 Cities** | The sales tax engine only has rate tables for 4 cities. It cannot calculate indirect tax for 99.9% of U.S. addresses. | 3 weeks |
| **BLK-P1-04** | **Payroll FIT Withholding Uses Heuristic** | The payroll engine uses a 3-rate estimate (12%/22%/24%) instead of IRS Pub 15-T, generating illegal paystub withholdings. | 2 weeks |
| **BLK-P1-05** | **No Live Financial Aggregation (Plaid / Stripe)** | Bank feeds and Stripe connections return hardcoded arrays; real bank accounts cannot be connected. | 2 weeks |
| **BLK-P1-06** | **Simulated Audit Ledger Hashing** | The audit ledger uses a custom 32-bit bitshift loop padded to 64 characters instead of true SHA-256; fails SOC 2 compliance. | 1 week |
| **BLK-P1-07** | **Hardcoded Supervisor PIN (`2026`)** | Exposing taxpayer SSNs via a client-side hardcoded PIN violates IRS Pub 1075 data safeguard mandates. | 1 week |

---

## 3. P2 Blockers — Needed Soon Post-Launch

| Blocker ID | Blocker Description | Impact on Platform | Remediation Effort |
| :--- | :--- | :--- | :--- |
| **BLK-P2-01** | **No Vectorized Legal RAG Engine** | Tax research uses naive `Array.filter` on 12 static rules; cannot answer complex statutory inquiries semantically. | 3 weeks |
| **BLK-P2-02** | **No Executable AI Agent Runtime** | The 40+ agents exist only as skill markdown docs; autonomous multi-agent consensus cannot execute. | 4 weeks |
| **BLK-P2-03** | **No Automated Email / SMS Dispatch** | Customer nudges and sign-off requests trigger local browser toasts instead of real SendGrid/Twilio messages. | 1 week |
| **BLK-P2-04** | **Missing SUI Experience Rate Tables** | Employers cannot input their state SUI tax rate notice; employer unemployment tax is unmodeled. | 2 weeks |
| **BLK-P2-05** | **No E-File Status Polling Worker** | The system cannot asynchronously poll IRS MeF ACK/NACK status queues. | 2 weeks |

---

## 4. P3 Blockers — Future Roadmap

| Blocker ID | Blocker Description | Long-Term Strategic Value |
| :--- | :--- | :--- |
| **BLK-P3-01** | **Full Form 1120-S / Form 1065 Engine** | Complex multi-tier pass-through entity allocations and Schedule M-3 book-to-tax reconciliations. |
| **BLK-P3-02** | **Automated Brokerage Feeds (SnapTrade)** | Direct API ingestion of stock trades and Form 1099-B wash sale reconciliations. |
| **BLK-P3-03** | **Automated State Sales Tax Remittances** | Direct ACH credit/debit transmissions to state revenue portals. |
| **BLK-P3-04** | **Multi-Entity M&A Restructuring Engine** | Corporate reorganization tax modeling under IRC § 368. |
