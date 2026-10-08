# Autonomous Tax OS — Phase 8: Form 940 Annual Return Engine

## 1. Statutory Line-by-Line Form Mapping (IRS Form 940)

| Form 940 Line | Description | Formula / Statutory Basis |
| :--- | :--- | :--- |
| **Line 3** | Total payments to all employees | Total annual gross payments made across all employees |
| **Line 4** | Payments exempt from FUTA tax | Statutory pre-tax exemptions (Section 125, statutory exclusions) |
| **Line 5** | Total payments in excess of $7,000 | Wages paid to each employee exceeding the annual $7,000 cap |
| **Line 7** | Total taxable FUTA wages | $\text{Line 3} - \text{Line 4} - \text{Line 5}$ |
| **Line 8** | FUTA tax before adjustments | $\text{Line 7} \times 6.00\%$ |
| **Line 9** | Maximum allowable state unemployment credit | $\text{Line 7} \times 5.40\%$ |
| **Line 10** | Credit reduction | Sum of credit reduction percentages in affected states |
| **Line 12** | Total FUTA tax after adjustments | $\text{Line 7} \times (0.60\% + \text{Credit Reduction Rate})$ |
| **Line 13** | FUTA tax deposited for the year | Sum of quarterly FUTA deposits made through EFTPS |
| **Line 14** | Balance due | $\max(0, \text{Line 12} - \text{Line 13})$ |
| **Line 15** | Overpayment | $\max(0, \text{Line 13} - \text{Line 12})$ |

---

## 2. Multi-State Credit Reduction Handling
When an employer has employees working in states designated by the Department of Labor as FUTA credit reduction states (states with unpaid Title XII loan balances):
- The credit reduction increases the effective net FUTA tax above 0.60%.
- Form 940 Schedule A (*Multi-State Employer and Credit Reduction Information*) is dynamically attached.

---

## 3. Form 940 Engine Implementation
```typescript
export class Form940Engine {
  public static readonly STATUTORY_FUTA_RATE = 0.060;
  public static readonly SUTA_CREDIT_RATE = 0.054;
  public static readonly NET_FUTA_RATE = 0.006;

  public static calculateForm940(params: {
    taxYear: number;
    totalPaymentsCents: bigint;
    exemptPaymentsCents: bigint;
    taxableFutaWagesCents: bigint;
    totalDepositsCents: bigint;
    creditReductionRate?: number;
  }): Form940CalculationResult {
    // Calculates Form 940 lines 3-15 deterministically
  }
}
```
All outputs are verified against general ledger and quarterly Form 941 runs before CPA approval.
