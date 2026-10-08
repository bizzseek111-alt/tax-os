# TaxOS External Provider Reality Matrix

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Principal Backend Engineer & Production Readiness Auditor  
**Primary Standard:** Rigorous inventory of all 15 third-party integrations across Credential, Sandbox, Implementation, and Production status.

---

## 1. Third-Party Provider Reality Table

| Integration Domain | Provider Selected | Credentials Configured? | Sandbox Environment? | Implemented in Code? | Tested in Pipeline? | Production Access? | Fallback Provider |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tax Calculation (Complex)** | Internal Deterministic TS Engine | None needed (Local) | N/A (Local) | **Partial** (`TaxCalculationEngine`) | **Yes** (Unit tests pass) | Active (Local) | Wolters Kluwer CCH Axcess API |
| **IRS Electronic Filing** | IRS MeF A2A Web Services | **No** (No ETIN / EFIN / Digital Cert) | **No** (No IRS ATS environment access) | **No** (`POST /api/efile/transmit` fakes ACK) | **No** | **No** | Commercial Transmitter (Drake / TaxEngine) |
| **State Electronic Filing** | State MeF Gateways (CA, NY, NJ, IL, MA)| **No** (No state transmitter IDs) | **No** | **No** (Faked in mock server) | **No** | **No** | IRS Fed/State E-File Program |
| **Bank Feeds & Transactions** | Plaid (Transactions API) | **No** (`process.env.PLAID_CLIENT_ID` missing) | **No** | **No** (`PlaidReadyAdapter` returns static array) | **No** | **No** | MX / Yodlee / Finicity |
| **Brokerage Feeds** | SnapTrade / Plaid Investments | **No** | **No** | **No** | **No** | **No** | CSV / Form 1099-B Manual Upload |
| **Payment Processor Ingestion**| Stripe (Balance & 1099-K APIs) | **No** (`STRIPE_SECRET_KEY` missing) | **No** | **No** (Mock UI cards only) | **No** | **No** | Square / PayPal CSV Ingest |
| **Commerce Ingestion** | Shopify (Partner Orders API) | **No** | **No** | **No** (Mock UI cards only) | **No** | **No** | WooCommerce / CSV Export |
| **Payroll Ingestion** | Gusto (Embedded Payroll API) | **No** | **No** | **No** (Mock UI cards only) | **No** | **No** | ADP / Paychex CSV Ingest |
| **Sales Tax Determination** | Avalara AvaTax / Anrok / Stripe Tax | **No** | **No** | **No** (4 cities hardcoded in engine) | **No** | **No** | Internal Multi-Tier Rate Engine |
| **Transactional Email** | SendGrid / AWS SES | **No** (`SENDGRID_API_KEY` missing) | **No** | **No** (Toast notifications only) | **No** | **No** | Postmark / Resend |
| **Document OCR & Vision** | Google Cloud Document AI / AWS Textract| **No** (No GCP/AWS Service Account) | **No** | **No** (Filename string regex only) | **No** | **No** | Tesseract.js (Local WASM) |
| **IRS-Compliant E-Sign** | Dropbox Sign (HelloSign) / DocuSign | **No** | **No** | **Partial** (HTML5 Canvas in React, faked submission) | **No** | **No** | Internal PKI Digital Signature |
| **Identity Verification (KBA)** | Persona / Socure / LexisNexis | **No** | **No** | **No** | **No** | **No** | Manual ID & SSN Card Upload |
| **B2B Subscription Payments** | Stripe Billing & Invoicing | **No** | **No** | **No** (Mock UI cards in admin) | **No** | **No** | Wire / ACH Transfer |
| **SMS Notifications** | Twilio Messaging API | **No** (`TWILIO_AUTH_TOKEN` missing) | **No** | **No** (UI toast only) | **No** | **No** | AWS SNS / Transactional Email |

---

## 2. Analysis of Critical Missing Providers

### 2.1 IRS MeF A2A Transmitter Credentials
To submit Form 1040, Form 1120-S, or Form 941 electronically to the IRS, an organization must:
1. Hold an active IRS **Electronic Return Originator (ERO)** and **Software Developer** account.
2. Obtain an **Electronic Filing Identification Number (EFIN)** and **Electronic Transmitter Identification Number (ETIN)**.
3. Pass mandatory **Assurance Testing System (ATS)** certification test packets with the IRS e-Help Desk.
4. Possess an authorized digital certificate issued by an approved certificate authority (IdenTrust, DigiCert).
- **Current Status:** TaxOS possesses none of these credentials. The system cannot transmit returns to the IRS.

### 2.2 Plaid Financial Integration
The file [`src/services/FinancialDataService.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/FinancialDataService.ts#L29-L81) contains a class named `PlaidReadyAdapter`. It implements:
```typescript
public async getAccounts(userId: string) {
  return [
    { id: 'acct-chase-biz-01', name: 'Chase Total Business Checking', mask: '8910', balanceCents: 4892000 },
    { id: 'acct-amex-biz-02', name: 'Amex Business Platinum', mask: '3004', balanceCents: -1849000 }
  ];
}
```
There is no Plaid client instantiation, no `link_token` generation endpoint, and no `item/public_token/exchange` handler. Real bank feeds cannot be connected.

### 2.3 Optical Character Recognition (OCR) Engine
The file [`src/services/TaxDropService.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/TaxDropService.ts#L84-L100) claims "Multimodal Classification Heuristics", but actually executes:
```typescript
if (lowerName.includes('w2') || lowerName.includes('w-2')) {
  classification = 'FORM_W2';
  payerOrVendor = 'Acme Labs Inc.';
  grossAmountCents = 5620000;
}
```
If a user uploads a real W-2 named `my_tax_document.pdf`, the system classifies it as `RECEIPT_EXPENSE` with generic vendor values. Zero image text extraction occurs.
