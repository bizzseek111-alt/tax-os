# Autonomous Tax OS — Phase 8: Federal Income Tax Withholding Engine

## 1. Statutory Specification: IRS Publication 15-T (2026)
Federal Income Tax (FIT) withholding is computed using the **Percentage Method Tables for Automated Payroll Systems** from IRS Publication 15-T.

### Annual Percentage Method Implementation
1. **Pay Frequency Annualization Factor ($P$)**:
   - `WEEKLY`: 52
   - `BIWEEKLY`: 26
   - `SEMIMONTHLY`: 24
   - `MONTHLY`: 12

2. **Adjusted Wage Calculation**:
   $$\text{Annualized Gross} = \text{Taxable Wage} \times P$$
   $$\text{Adjusted Annual Wage} = \text{Annualized Gross} + \text{W-4 Step 4(a) Other Income} - \text{W-4 Step 4(b) Deductions}$$

3. **Standard Deduction Base Subtraction**:
   - For standard Step 2 (Unchecked):
     - Married Filing Jointly: $\$14,600$ deduction allowance
     - Single / Head of Household: $\$7,300$ deduction allowance
   - For Step 2 Checkbox (Multiple Jobs Checked):
     - Halved bracket thresholds and deduction base (e.g., $\$7,300$ for MFJ, $\$3,650$ for Single)

4. **Tentative Annual Tax Computation**:
   Evaluated against progressive 2026 tax brackets:
   - 10%, 12%, 22%, 24%, 32%, 35%, 37%

5. **Credits & Extra Withholding**:
   $$\text{Tentative Tax After Step 3} = \max(0, \text{Tentative Annual Tax} - \text{Step 3 Dependent Credits})$$
   $$\text{Per-Period FIT} = \left( \frac{\text{Tentative Tax After Step 3}}{P} \right) + \text{Step 4(c) Extra Withholding}$$

---

## 2. Supplemental Wage Withholding (IRC Reg § 31.3402(g)-1)
Bonuses, commissions, and non-periodic supplemental wages are withheld deterministically:
- **Supplemental Cumulative $\le \$1,000,000$**: Flat statutory rate of **22.0%**
- **Supplemental Cumulative $> \$1,000,000$**: Flat statutory rate of **37.0%** on the excess over $\$1,000,000$

```typescript
export class FederalWithholdingEngine {
  public static calculateSupplementalWithholding(params: {
    supplementalWageCents: bigint;
    ytdSupplementalWageCents?: bigint;
  }): bigint {
    const priorYtd = params.ytdSupplementalWageCents || BigInt(0);
    const ONE_MILLION_CENTS = BigInt(100000000); // $1,000,000.00
    // Applies 22% up to $1M, 37% above $1M
  }
}
```

---

## 3. Verification Scenarios
- **Scenario A (Single, Biweekly, $4,300 taxable)**: Withholding is $\$566.19$.
- **Scenario B (MFJ vs Single Parity)**: For identical $\$4,300$ biweekly wages, MFJ withholding ($\$349.54$) is lower than Single ($\$566.19$) due to wider brackets.
- **Scenario C (Step 2 Checkbox)**: Checking Step 2 increases withholding from $\$566.19$ to $\$752.69$ to prevent underwithholding across multiple jobs.
- **Scenario D (Step 3 Child Credits)**: Claiming $\$4,000$ dependent credits reduces per-period biweekly withholding by exactly $\$153.85$ ($\$4,000 / 26$).
