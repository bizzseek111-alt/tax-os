# Phase 7 — State Registrations & Filing Frequency Service

## 1. State Agency Integration
The Registration Service manages official permits, seller account IDs, and agency interactions across the launch states:
- **California**: California Department of Tax and Fee Administration (CDTFA) — Seller's Permit (Permit Account #)
- **New York**: New York State Department of Taxation and Finance — Certificate of Authority (Sales Tax ID)
- **New Jersey**: New Jersey Division of Taxation — Business Registration & Sales Tax Authority
- **Illinois**: Illinois Department of Revenue (IDOR) — Illinois Business Tax (IBT) Certificate
- **Massachusetts**: Massachusetts Department of Revenue (Mass DOR) — MassTaxConnect Sales Tax Registration.

## 2. Dynamic Filing Frequency Determination
Filing frequency is governed by statutory thresholds based on annual tax liability or quarterly taxable sales:

```typescript
if (annualTaxLiabilityCents >= monthlyThresholdAnnualLiabilityCents) {
  return FilingFrequency.MONTHLY;
} else if (annualTaxLiabilityCents < 100000) { // < $1,000/yr
  return FilingFrequency.ANNUALLY;
} else {
  return FilingFrequency.QUARTERLY;
}
```

- **CA**: Standard is Quarterly; Monthly if tax liability exceeds $17,000/month ($204,000/year).
- **NY**: Standard is Quarterly; Monthly if taxable sales exceed $300,000 in any quarter.
- **NJ**: Standard is Quarterly; Monthly if annual liability exceeds $30,000.
- **IL**: Standard is Quarterly; Monthly if annual liability exceeds $2,400 ($200/month).
- **MA**: Standard is Quarterly; Monthly if annual liability exceeds $1,200.
