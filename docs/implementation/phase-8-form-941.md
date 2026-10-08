# Autonomous Tax OS — Phase 8: Form 941 Quarterly Return Engine

## 1. Statutory Line-by-Line Form Mapping (IRS Form 941)

| Form 941 Line | Description | Mathematical Derivation |
| :--- | :--- | :--- |
| **Line 1** | Number of employees who received wages | Count of active employees paid in pay period including March 12, June 12, Sept 12, Dec 12 |
| **Line 2** | Wages, tips, and other compensation | Sum of FIT taxable wages paid during the calendar quarter |
| **Line 3** | Federal income tax withheld from wages | Sum of employee FIT withheld across all payroll runs |
| **Line 5a** | Taxable social security wages | Taxable OASDI wages $\times 12.4\%$ (6.2% EE + 6.2% ER) |
| **Line 5b** | Taxable social security tips | Taxable OASDI tips $\times 12.4\%$ |
| **Line 5c** | Taxable Medicare wages & tips | Taxable Medicare wages $\times 2.9\%$ (1.45% EE + 1.45% ER) |
| **Line 5d** | Taxable wages subject to Add'l Medicare | Wages exceeding $\$200\text{k} \times 0.9\%$ (EE only) |
| **Line 5e** | Total social security and Medicare taxes | $\text{Line 5a} + \text{Line 5b} + \text{Line 5c} + \text{Line 5d}$ |
| **Line 6** | Total taxes before adjustments | $\text{Line 3} + \text{Line 5e}$ |
| **Line 10** | Total taxes after adjustments | Line 6 plus statutory fractions-of-cents / sick pay adjustments |
| **Line 11** | Total deposits for this quarter | Sum of cleared EFTPS employment tax deposits |
| **Line 12** | Balance due | $\max(0, \text{Line 10} - \text{Line 11})$ |
| **Line 15** | Overpayment | $\max(0, \text{Line 11} - \text{Line 10})$ |

---

## 2. Schedule B (Form 941) Allocation
For **Semi-Weekly depositors**, the IRS requires Form 941 Schedule B (*Report of Tax Liability for Semiweekly Schedule Depositors*).
- **Tax Liability Allocation**: Liabilities are allocated strictly by **pay date** (the date wages were paid), **not** the pay period accrual end date.
- **Parity Check**:
  $$\sum \text{Schedule B Daily Liabilities} \equiv \text{Line 10 Total Taxes}$$
  If the sum differs by even $\$0.01$, the return fails validation and cannot proceed to submission.

---

## 3. Form 941 Engine Architecture
```typescript
export class Form941Engine {
  public static calculateForm941(params: {
    taxYear: number;
    quarter: number;
    numEmployees: number;
    grossWagesCents: bigint;
    fitWithheldCents: bigint;
    taxableSsWagesCents: bigint;
    taxableMedWagesCents: bigint;
    taxableAddlMedWagesCents: bigint;
    totalDepositsCents: bigint;
    depositFrequency: DepositFrequency;
    dailyTaxLiabilities?: { date: string; amountCents: bigint }[];
  }): Form941CalculationResult {
    // Computes lines 1 through 15 and validates Schedule B balance
  }
}
```
All Form 941 line items are persisted to the `Form941Record` relation linked to `PayrollReturn`.
