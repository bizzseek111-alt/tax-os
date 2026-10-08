# Phase 9: Electronic Funds Withdrawal (EFW), Payments & Refund Tracking

## Overview

Handling taxpayer money and banking details demands extreme security and transparency:
1. **Bank coordinates must never be logged or exposed in plaintext.**
2. **Funds debits require affirmative taxpayer consent.**
3. **Refund delivery timelines must not make false or fabricated promises.**

---

## Electronic Funds Withdrawal (EFW) & Bank Masking

Under IRS e-file regulations, taxpayers with balance-due returns can authorize Electronic Funds Withdrawal (direct debit) from a checking or savings account.

### Strict Bank Masking Invariant

In accordance with strict PII security rules, routing transit numbers and account numbers are masked immediately at the boundary:
- Routing Number: `XXXX` + last 4 digits (e.g., `XXXX0358`)
- Account Number: `XXXXX` + last 4 digits (e.g., `XXXXX4321`)

```typescript
public static maskRoutingNumber(routing: string): string {
  const clean = routing.replace(/\D/g, '');
  const last4 = clean.slice(-4).padStart(4, '0');
  return `XXXX${last4}`;
}

public static maskAccountNumber(account: string): string {
  const clean = account.replace(/\D/g, '');
  const last4 = clean.slice(-4).padStart(4, '0');
  return `XXXXX${last4}`;
}
```

### Affirmative Consent Required

`FilingPaymentService.authorizePayment` enforces that no fund withdrawal can be recorded without explicit consent:

```typescript
if (!params.explicitTaxpayerConsent) {
  throw new Error(`PAYMENT_AUTHORIZATION_REQUIRED: Explicit taxpayer consent is mandatory before initiating Electronic Funds Withdrawal (EFW).`);
}
```

The authorized payment is written to the `FilingPayment` table and audited via `AuditEventService.recordEvent`.

---

## Transparent Refund Tracking (Zero Fabricated Promises)

AI tax systems frequently mislead taxpayers by promising exact refund deposit dates. In reality, the IRS explicitly states that 9 out of 10 refunds are issued in under 21 calendar days, but specific delivery is entirely subject to IRS fraud filters, PATH Act holds, and Treasury offsets.

`FilingPaymentService.getRefundTrackingDetails` provides complete transparency:
- Presents the calculated overpayment/refund amount without fabricated deposit predictions.
- Directs users to the official IRS portal: [IRS Where's My Refund](https://www.irs.gov/refunds).
- Directs users to state department of revenue portals (e.g., California FTB *Check Your Refund Status*, New York DTF *Check Refund Status*).
- Explains common statutory hold windows (e.g., Earned Income Tax Credit and Additional Child Tax Credit refunds held until mid-February under the PATH Act).
