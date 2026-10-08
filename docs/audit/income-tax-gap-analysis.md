# TaxOS Income Tax Engine Reality & Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Senior U.S. Tax Technology Architect  
**Scope:** Federal Form 1040, Form 1120-S, Form 1065, and 5 Launch States (CA, NY, NJ, IL, MA)

---

## 1. Income Tax Engine Audit Summary

| Calculation Scope | Target Requirement | Current Codebase Implementation | Reality Level |
| :--- | :--- | :--- | :--- |
| **Federal 1040 AGI & Deductions** | IRC § 62 AGI, § 63 Standard/Itemized, § 199A QBI | Implemented in `TaxCalculationEngine.ts` using integer cents. | **BACKEND_PROTOTYPE** |
| **Federal Tax Brackets** | Full 7 statutory brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%) | **Truncated.** Implements only the bottom 4 brackets up to 24%. High-earner brackets (32%, 35%, 37%) omitted. | **BACKEND_PROTOTYPE** |
| **Federal Withholding & Refund** | Actual W-2 Box 2, 1099 Box 4, estimated 1040-ES | **Hardcoded formula:** `assumedFederalWithholdingCents = Math.round(totalFederalTaxCents * 1.15)`. | **UI_PROTOTYPE** |
| **Capital Gains & Schedule D** | Form 8949 + Schedule D preferential rates (0%, 15%, 20%) | **None.** No capital gains stacking or netting calculation. | **CONCEPT** |
| **Alternative Minimum Tax (AMT)** | Form 6251 exemption phaseouts and 26%/28% rates | **None.** | **CONCEPT** |
| **Nonrefundable / Refundable Credits** | Child Tax Credit (§ 24), EITC (§ 32), Clean Vehicle (§ 30D) | **None.** No credit computation logic in engine. | **CONCEPT** |
| **California Form 540** | Cal. RTC adjustments, 1% Mental Health Tax (> $1M), CA credits | Implements HSA add-back (§ 17215.4) and QBI disallowance. Lacks full brackets and Mental Health tax. | **BACKEND_PROTOTYPE** |
| **New York IT-201 / IT-203** | 20 NYCRR § 131.18 convenience rule, NYC resident tax | Multiplies tax by remote working day ratio. Lacks NYC progressive brackets and statutory residency tests. | **BACKEND_PROTOTYPE** |
| **New Jersey NJ-1040** | N.J.S.A. § 54A:5-2 strict loss netting prohibition | Sets negative net profit to 0. Lacks NJ progressive tax tables (1.4% to 10.75%) and property tax credit. | **BACKEND_PROTOTYPE** |
| **Illinois IL-1040** | 35 ILCS 5/203 4.95% flat tax, pension deduction | Calculates 4.95% on net taxable income minus pension. Lacks pass-through entity tax credit (Schedule K-1-P). | **BACKEND_PROTOTYPE** |
| **Massachusetts Form 1** | 5% flat income, 8.5% ST gains, 4% Fair Share surtax | Applies 5% flat + 4% surtax over $1,053,750. Lacks 8.5% short-term capital gains and PFML deductions. | **BACKEND_PROTOTYPE** |
| **Business Form 1120-S / 1065** | Ordinary business income, Schedule K-1 allocations | Stored as static mock data (`MOCK_INCOME_TAX_CASE`). No corporate tax engine implemented. | **UI_PROTOTYPE** |

---

## 2. In-Depth Code Inspection & Mathematical Flaws

### 2.1 The Hardcoded Withholding Flaw
In [`src/services/TaxCalculationEngine.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/TaxCalculationEngine.ts#L89-L91):
```typescript
const totalFederalTaxCents = federalTaxCents + selfEmploymentTaxCents;
const assumedFederalWithholdingCents = Math.round(totalFederalTaxCents * 1.15); // Refund state
const federalRefundOrDueCents = assumedFederalWithholdingCents - totalFederalTaxCents;
```
**Impact:** Every single user calculation in the engine produces an artificial refund equal to exactly 15% of their total tax liability. Real tax returns compute refund or balance due by subtracting actual W-2 Box 2, 1099 Box 4, and Form 1040-ES quarterly estimated payments.

### 2.2 Missing Upper Brackets
In [`src/services/TaxCalculationEngine.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/TaxCalculationEngine.ts#L78-L87):
```typescript
let federalTaxCents = 0;
if (taxableIncomeCents <= 1192500) {
  federalTaxCents = Math.round(taxableIncomeCents * 0.10);
} else if (taxableIncomeCents <= 4847500) {
  federalTaxCents = 119250 + Math.round((taxableIncomeCents - 1192500) * 0.12);
} else if (taxableIncomeCents <= 10335000) {
  federalTaxCents = 557850 + Math.round((taxableIncomeCents - 4847500) * 0.22);
} else {
  federalTaxCents = 1765100 + Math.round((taxableIncomeCents - 10335000) * 0.24);
}
```
**Impact:** Anyone with taxable income exceeding $103,350 is taxed at a flat 24% on all excess dollars. In reality:
- 32% bracket begins at $197,300 (Single)
- 35% bracket begins at $250,525 (Single)
- 37% bracket begins at $626,350 (Single)
A taxpayer earning $500,000 will be materially undercalculated by tens of thousands of dollars.

---

## 3. Production Remediation Roadmap

1. **Implement Full IRS Form 1040 Tax Tables:** Expand bracket evaluation to all 7 brackets and incorporate statutory inflation adjustments for 2026.
2. **Ingest Real W-2 & 1099 Withholding:** Remove `totalFederalTaxCents * 1.15` and calculate refund strictly from `input.withholdingsCents - totalTaxCents`.
3. **Build Form 8949 / Schedule D Capital Gains Engine:** Implement the Qualified Dividends and Capital Gain Tax Worksheet.
4. **Partner with Verified Tax Engine or Build Complete Line-Item Schema:** For complex pass-through entities (1120-S and 1065), integrate an established computation provider (e.g., Wolters Kluwer CCH or Corptax) or complete full domestic XML line-item mappings.
