# Autonomous Tax OS — Phase 8: Form W-2 / W-3 Wage & Tax Transmittal Engine

## 1. Statutory Form W-2 Box Mappings
Form W-2 reporting is derived directly from the immutable `PayrollRun`, `TaxableWage`, and `EmployeeWithholding` ledgers:

- **Box 1 (Wages, tips, other comp)**: Gross wages minus pre-tax deductions that exempt FIT (e.g., Section 125, traditional 401(k), HSA).
- **Box 2 (Federal income tax withheld)**: Total employee federal income tax withheld.
- **Box 3 (Social security wages)**: Gross wages minus Section 125 (capped at $\$176,100$). **401(k) contributions are included**.
- **Box 4 (Social security tax withheld)**: OASDI withheld ($6.2\%$ of Box 3, capped at $\$10,918.20$).
- **Box 5 (Medicare wages and tips)**: Gross wages minus Section 125 (**uncapped**). 401(k) contributions are included.
- **Box 6 (Medicare tax withheld)**: Total Medicare tax withheld ($1.45\%$ plus $0.9\%$ Additional Medicare if applicable).
- **Box 12 (Statutory Codes)**:
  - `Code D`: Elective deferrals to a 401(k) cash or deferred arrangement.
  - `Code W`: Employer contributions to an employee's Health Savings Account (including Section 125 pre-tax salary reduction).
  - `Code DD`: Cost of employer-sponsored group health coverage (informational).
- **Box 13 (Checkboxes)**: `Retirement plan` checked if active 401(k) participant; `Statutory employee` checked if applicable.
- **Box 14 (Other State / Local Items)**: State-specific items (e.g., CA SDI, NJ FLI, MA PFML).
- **Boxes 15–20 (State & Local Wages / Taxes)**: Per-state and local reporting (e.g., NY State and NYC local wages and taxes).

---

## 2. Form W-3 Transmittal & Parity Reconciliation
Form W-3 (*Transmittal of Wage and Tax Statements*) summarizes all Forms W-2 filed by the employer with the Social Security Administration (SSA).

### Mandatory SSA / IRS Cross-Return Parity Invariants:
1. **W-3 Box 1 Wages Parity**:
   $$\sum \text{W-2 Box 1} \equiv \sum_{Q=1}^{4} \text{Form 941 Line 2 Wages}$$
2. **W-3 Box 2 FIT Parity**:
   $$\sum \text{W-2 Box 2} \equiv \sum_{Q=1}^{4} \text{Form 941 Line 3 FIT Withheld}$$
3. **W-3 Box 3 SS Wages Parity**:
   $$\sum \text{W-2 Box 3} \equiv \sum_{Q=1}^{4} \text{Form 941 Line 5a SS Wages}$$
4. **W-3 Box 5 Medicare Wages Parity**:
   $$\sum \text{W-2 Box 5} \equiv \sum_{Q=1}^{4} \text{Form 941 Line 5c Medicare Wages}$$

If any variance exceeds $\$0.00$, the system flags a parity discrepancy (`W2_W3_PARITY_MISMATCH`) and automatically generates an audit review task for CPA reconciliation prior to transmittal.
