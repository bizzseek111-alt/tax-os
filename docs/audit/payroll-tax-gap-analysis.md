# TaxOS Payroll & Employment Tax Reality & Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Payroll & Employment Tax Architect & Compliance Engineering Lead  
**Scope:** Form 941, Form 940, FICA, FUTA, State Withholding (SIT), State Unemployment (SUI), Worker Classification, and NACHA Payments

---

## 1. Payroll Engine Audit Summary

| Payroll Capability | Statutory Standard | Current Codebase Implementation | Reality Level |
| :--- | :--- | :--- | :--- |
| **Federal Income Tax Withholding** | IRS Pub 15-T (Percentage or Wage Bracket method with W-4 adjustments) | **Toy Heuristic:** 3 flat rate steps (12% / 22% / 24%) in `PayrollEngine.ts`. | **BACKEND_PROTOTYPE** |
| **Social Security & Medicare (FICA)**| 6.2% SS (capped at $168,600) + 1.45% Med + 0.9% Addl Med (> $200k) | **Accurate Statutory Math:** Fully implemented in `PayrollEngine.ts`. | **BACKEND_PROTOTYPE** |
| **Federal Unemployment (FUTA)** | 0.6% net on first $7,000 per employee (assuming full state credit) | Implemented in `PayrollEngine.ts`. | **BACKEND_PROTOTYPE** |
| **State Income Tax Withholding** | State specific tables (e.g. CA DE 4 method B, NY IT-2104.1) | **Flat Estimate:** CA 6%, NY 5.5%, TX 0% in `PayrollEngine.ts`. | **BACKEND_PROTOTYPE** |
| **State Unemployment (SUI)** | Annual experience rate (e.g., 1.5%–8.2%) applied to state wage base | Uncalculated. Hardcoded zero or static placeholder. | **CONCEPT** |
| **Deposit Schedules (IRC § 6302)** | Evaluates $50,000 lookback liability & 1-day $100k rule | Implemented in `PayrollEngine.ts`. | **BACKEND_PROTOTYPE** |
| **Form 941 Quarterly Preparation** | Box 1–10 reconciliation with Schedule B semi-weekly liabilities | Static mock record (`MOCK_FORM_941_Q1`) in `MockData.ts`. | **UI_PROTOTYPE** |
| **Worker Classification Engine** | CA AB 5 (Dynamex ABC Test) & IRS 20-Factor Test | Rule heuristic in `WorkerClassificationGuard.ts` flags high-risk facts. | **BACKEND_PROTOTYPE** |
| **NACHA CCD+ TXP Tax Payments** | 80-character NACHA banking record format with TXP tax addenda | Generates valid formatted record strings in `TaxPaymentsEngine.ts`. | **BACKEND_PROTOTYPE** |
| **Live Payroll Ingestion** | Gusto, ADP, Rippling, Paychex API sync | Static arrays (`MOCK_EMPLOYEES`, `MOCK_PAYROLL_RUNS`). | **UI_PROTOTYPE** |

---

## 2. In-Depth Code Inspection

### 2.1 The Heuristic Federal Withholding Risk
In [`src/services/PayrollEngine.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/PayrollEngine.ts#L74-L78):
```typescript
// Federal Income Tax (simplified progressive withholding estimate)
let fitRate = 0.12;
if (fitTaxableWages > 4000) fitRate = 0.22;
if (fitTaxableWages > 8000) fitRate = 0.24;
const federalIncomeTax = Math.round(fitTaxableWages * fitRate * 100) / 100 + params.extraWithholding;
```
**Regulatory Risk:**
- This violates IRS Publication 15-T regulations.
- Under IRS rules, withholding must account for the 2020+ Form W-4 redesign: filing status, multiple jobs checkbox (Step 2c), dependent credits (Step 3), other income (Step 4a), and deductions (Step 4b).
- An employee earning $3,500/month would be withheld at 12% across all dollars, ignoring standard deduction exemptions, leading to severe under-withholding and penalties.

### 2.2 Worker Classification Safeguard vs Legal Work Product
In [`src/services/WorkerClassificationGuard.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/WorkerClassificationGuard.ts):
- The class correctly identifies high-risk California AB 5 facts (e.g., worker performing core business functions, employer providing equipment, indefinite term).
- It emits an audit finding citing Cal. Lab. Code § 2775.
- **Attorney Boundary Safeguard:** The engine properly flags that this is an *AI compliance screening finding* requiring formal legal review, and does **not** purport to be an attorney-client privileged legal opinion.

---

## 3. Production Remediation Roadmap

1. **Implement Official IRS Pub 15-T Percentage Method:** Replace the 3-rate heuristic with exact IRS automated withholding tables.
2. **Implement State Unemployment (SUI) Configuration:** Allow employers to input their annual state SUI tax rate notice (Form DE 2088 in CA / NYS-65 in NY) and state-specific taxable wage caps.
3. **Connect to Live Payroll APIs (Gusto / Plaid Payroll):** Ingest real paystubs and quarterly tax filings via OAuth integration.
