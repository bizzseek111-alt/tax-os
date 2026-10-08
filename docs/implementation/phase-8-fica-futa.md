# Autonomous Tax OS — Phase 8: FICA (OASDI/Medicare) & FUTA Engines

## 1. Statutory FICA Rates & Caps (2026 Tax Year)

| Tax Component | IRC Section | Employee Rate | Employer Rate | 2026 Wage Base Limit |
| :--- | :--- | :---: | :---: | :---: |
| **Social Security (OASDI)** | IRC § 3101(a), § 3111(a) | 6.20% | 6.20% | **$176,100** (Strict annual cap) |
| **Medicare (HI)** | IRC § 3101(b)(1), § 3111(b) | 1.45% | 1.45% | **Uncapped** (No limit) |
| **Additional Medicare** | IRC § 3101(b)(2) | 0.90% | **0.00%** (ER does not match) | Threshold: **$200,000** (regardless of filing status) |

### Key FICA Calculation Invariants:
1. **OASDI Cap Management**:
   The engine tracks Year-to-Date (YTD) Social Security taxable wages per employee. Once YTD reaches $\$176,100$, OASDI withholding and employer matching immediately cease ($\$0$).
2. **Additional Medicare Asymmetry**:
   Per IRC § 3101(b)(2), employers must withhold 0.9% Additional Medicare Tax on wages paid in excess of $\$200,000$ in a calendar year. Employers **never** match this tax (employer rate remains 1.45%).

---

## 2. Federal Unemployment Tax Act (FUTA)
- **IRC Section**: IRC § 3301 through § 3306.
- **Gross FUTA Rate**: 6.00%
- **Maximum State Unemployment (SUTA) Credit**: 5.40% (IRC § 3302)
- **Net Effective FUTA Rate**: **0.60%**
- **Annual Wage Cap**: **$7,000** per employee per calendar year.
- **Employer Obligation**: 100% employer-paid (never withheld from employee compensation).
- **FUTA Credit Reduction States**: When an employer operates in a state with outstanding Title XII federal unemployment advances, the 5.4% credit is reduced, increasing net FUTA by 0.3% increments.

---

## 3. Mathematical Verification Example
- **Gross Pay**: $\$4,000.00$
- **YTD Wages Prior to Run**: $\$195,000.00$
- **YTD Wages After Run**: $\$199,000.00$ (below Additional Medicare threshold)
- **OASDI Tax**: $\$0.00$ (since $\$195,000 > \$176,100$ cap)
- **Medicare Tax (EE)**: $\$4,000 \times 1.45\% = \$58.00$
- **Medicare Tax (ER)**: $\$4,000 \times 1.45\% = \$58.00$
- **Additional Medicare (EE)**: $\$0.00$
- **FUTA Tax (ER)**: $\$0.00$ (since $\$195,000 > \$7,000$ cap)
