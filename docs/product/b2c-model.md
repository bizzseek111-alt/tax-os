# Autonomous Tax OS — B2C Product Model & Customer Journey

> **Status**: Approved Product Baseline  
> **Document Version**: 1.0.0  
> **Target Audience**: B2C Taxpayers, Product Managers, Frontend Engineers, UX Researchers  

---

## 1. The B2C Philosophy: Zero-Friction Autonomous Compliance

The core tenet of the B2C experience is:
> **THE APPLICATION WORKS FIRST. THE HUMAN RESPONDS SECOND.**

Traditional tax software forces taxpayers into the role of a data-entry clerk, requiring them to answer dozens of screens before displaying a single calculation. Autonomous Tax OS inverts this relationship completely:

```
Traditional Tax Software:
User Answers 75 Questions ──> Software Fills Forms ──> User Pays & Files

Autonomous Tax OS:
User Connects & Drops Docs ──> System Reconstructs Reality ──> System Solicits 2–3 Clarifications ──> Ready to File
```

---

## 2. The 5-Stage B2C Customer Journey

### Stage 1: Zero-Friction Onboarding (Under 60 Seconds)
The user is never greeted with a questionnaire. We capture only the minimum statutory baseline:
1. **Identity Essentials**: Name, Email, Phone (SMS MFA enabled).
2. **Tax Year Selection**: Defaults to current active tax year (e.g., 2026).
3. **Jurisdiction Discovery**: Primary residence state and any secondary states lived or worked in.
4. **Instant Financial Connection**: Prompted to connect primary financial institution (via Plaid/MX) and/or payment processors (Stripe, Square, PayPal).

```
Screen: "Let us build your tax workspace."
[Connect Bank Account] [Connect Stripe/Square] [Drop Documents Directly]
```

### Stage 2: TaxDrop Ingestion & Real-Time Processing
Taxpayers do not categorize their documents. They simply drag-and-drop their entire financial folder into **TaxDrop**:
* **Accepted Formats**: PDF, PNG, JPG, HEIC, CSV, XLSX, ZIP.
* **Intelligent Progress Telemetry**: As files are uploaded, real-time agent telemetry displays live processing:
  * *“Reading 32 documents...”*
  * *“Reconstructing 4 income sources (Google, Stripe, Upwork)...”*
  * *“Matched 26 receipts to bank transactions...”*
  * *“Removed 1 duplicate 1099-K (already accounted for via Stripe GL)...”*
  * *“Identified 2 deductible vehicle trips under IRC § 162...”*

### Stage 3: The Tax Command Center Dashboard
Instead of a "Next Step" button, the taxpayer arrives at a calm, high-trust dashboard:

```
┌────────────────────────────────────────────────────────────────────────┐
│  YOUR TAXES ARE 91% READY                               Tax Year 2026  │
│  Estimated Federal Refund: $2,840  •  State Tax Due (NY): $412         │
├────────────────────────────────────────────────────────────────────────┤
│  ⚡ 3 THINGS NEED YOU                                                  │
│                                                                        │
│  [Card 1: Business Travel to San Francisco]                            │
│  We matched a $412 United Airlines charge. Was this for client work?   │
│  ( ) Yes, 100% Client Meeting    ( ) Personal / Vacation               │
│                                                                        │
│  [Card 2: Home Studio Space]                                           │
│  You paid rent of $2,400/mo. What square footage is dedicated solely   │
│  to your creator studio?                                               │
│  [ 220 ] sq ft out of [ 950 ] total sq ft                              │
│                                                                        │
│  [Card 3: Health Insurance Premium]                                    │
│  We detected $450/mo ACA marketplace payments. Confirm this was not    │
│  subsidized by an employer plan to unlock IRC § 162(l) deduction.     │
│  [Confirm Self-Employed Coverage]                                      │
└────────────────────────────────────────────────────────────────────────┘
```

### Stage 4: Prove This Number (Lineage & Explainability)
Whenever a taxpayer reviews a deduction or tax liability, they can click any number to inspect its complete lineage:

```
Click on: "Advertising & Marketing: $7,482"
  │
  ├── Statutory Basis: IRC § 162(a) Ordinary and Necessary Business Expense
  ├── Form Mapping: Schedule C, Line 8
  ├── Contributing Records:
  │     ├── Google Ads ($4,210) ──> 12 monthly invoices verified
  │     ├── Meta Ads ($2,120) ───> 12 monthly invoices verified
  │     └── Mailchimp ($1,152) ──> Connected credit card transactions
  └── Evidence Quality: 100% Documentary Proof (Zero Inferred Assumptions)
```

### Stage 5: Review, Signature & E-Filing
1. **Mode Selection**:
   * **Mode 1: AI Autopilot** — Ready to file directly with IRS MeF.
   * **Mode 2: EA/CPA Verified** — One-click upgrade for an Enrolled Agent or CPA to review workpapers and sign return.
2. **Statutory Form 8879 Generation**: IRS e-file signature authorization generated with Form 8879 and state equivalents.
3. **Cryptographic e-Signature**: Compliant with ESIGN and UETA acts.
4. **Live Submission Telemetry**: Real-time tracking from `SUBMITTED` $\rightarrow$ `IRS_TRANSMITTED` $\rightarrow$ `ACCEPTED`.

---

## 3. The Year-Round Tax Twin

Tax compliance does not end on April 15. The taxpayer’s **Tax Twin** runs continuously in the background:
* **Real-Time Tax Liability Tracking**: Computes marginal tax obligation for every new invoice or client payment.
* **Quarterly Safe-Harbor Monitor**: Warns before underpayment penalty thresholds under IRC § 6654 are breached.
* **Proactive Purchase Timing**: Simulates Section 179 expensing if capital equipment (e.g., computers, cameras) is purchased before Dec 31.
* **Entity Restructuring Alerts**: Automatically alerts the taxpayer when net Schedule C earnings exceed $80,000, signaling that an S-Corporation election (Form 2553) could save substantial self-employment tax.
