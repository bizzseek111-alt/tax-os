# Phase 3 Federal Rules Specification: Form 1040, Schedule C, Schedule SE & Credits

**Autonomous TaxOS Specification**  
**Workstream:** Phase 3 — Federal Tax Rules Engine  
**Tax Year:** 2026 (Rule Set Version 2026.1)  
**Status:** COMPLETE & VERIFIED  

---

## 1. Income Aggregation (IRC § 61)

The federal engine aggregates gross income across all confirmed `TaxFact` records:
1. **Form W-2 Box 1 Wages:** Aggregated across multiple employers (Form 1040 Line 1z).
2. **Schedule C Gross Profit:** Gross receipts minus returns and Cost of Goods Sold (Schedule C Line 7).
3. **Investment Income:** Taxable interest (Form 1099-INT) and ordinary dividends (Form 1099-DIV) (Lines 2b and 3b).
4. **Total Income:** Form 1040 Line 9. Net Schedule C business losses offset other earned income under IRC § 62(a)(1).

---

## 2. Schedule C & Schedule SE (Self-Employment Tax)

### Schedule C Net Profit:
$$\text{Net Profit} = \text{Gross Receipts} - \text{Returns} - \text{COGS} - \sum \text{Ordinary \& Necessary Expenses}$$
(Statutory authority: IRC § 162(a))

### Schedule SE Calculation (IRC §§ 1401, 1402):
1. **Net Earnings from Self-Employment:** $92.35\%$ of net business profit under IRC § 1402(a)(12).
2. **De Minimis Exception:** If net earnings are under **\$400.00**, zero SE tax is assessed under IRC § 1402(b)(2).
3. **OASDI (Social Security) Tax:**
   - 2026 Wage Base Cap: **\$176,100**.
   - Taxpayer's W-2 Box 3 wages are credited first.
   - Remaining wage cap is taxed at **12.4%**.
4. **Medicare (HI) Tax:**
   - Uncapped; taxed at **2.9%** on all net earnings.
5. **Additional Medicare Tax:**
   - **0.9%** on combined compensation exceeding threshold (\$200,000 Single / \$250,000 MFJ) under IRC § 3101(b)(2).
6. **Deductible SE Tax (Above-the-Line):**
   - **50%** of OASDI and Medicare tax is deducted on Schedule 1 Line 15 under IRC § 164(f).

---

## 3. Qualified Business Income (QBI) Deduction (IRC § 199A / Form 8995)

For sole proprietorships claiming the simplified deduction:
1. **Qualified Business Income Base:**
   $$\text{QBI} = \text{Net Profit} - \text{Deductible SE Tax}$$
   *(Treas. Reg. § 1.199A-3(b)(1)(vi))*
2. **Tentative Deduction:** $20\%$ of net QBI.
3. **Overall Limitation:** Lesser of tentative QBI or $20\%$ of $(\text{Taxable Income before QBI} - \text{Net Capital Gains})$.
4. **Thresholds (2026):**
   - Single / HOH: \$201,750 (Phaseout span: \$50,000)
   - MFJ: \$403,500 (Phaseout span: \$100,000)

---

## 4. Progressive Brackets & Rate Schedule (IRC § 1(j))

Taxable Income (Line 15) is processed through 7 progressive statutory tiers:

### 2026 Single Brackets:
- Tier 1 (10%): \$0 to \$12,400
- Tier 2 (12%): \$12,400 to \$50,400
- Tier 3 (22%): \$50,400 to \$105,700
- Tier 4 (24%): \$105,700 to \$201,750
- Tier 5 (32%): \$201,750 to \$256,200
- Tier 6 (35%): \$256,200 to \$640,600
- Tier 7 (37%): Over \$640,600

### 2026 Married Filing Jointly Brackets:
- Tier 1 (10%): \$0 to \$24,800
- Tier 2 (12%): \$24,800 to \$100,800
- Tier 3 (22%): \$100,800 to \$211,400
- Tier 4 (24%): \$211,400 to \$403,500
- Tier 5 (32%): \$403,500 to \$512,400
- Tier 6 (35%): \$512,400 to \$768,700
- Tier 7 (37%): Over \$768,700

---

## 5. Child Tax Credit & Payments Reconciliation

1. **Child Tax Credit (IRC § 24):**
   - \$2,000 per qualifying child under 17 with valid SSN.
   - \$500 per other dependent.
   - Nonrefundable portion reduces income tax to zero.
   - Refundable portion (Additional Child Tax Credit - Schedule 8812) up to \$1,700 per child based on 15% earned income exceeding \$2,500.
2. **Payments & Settlement (Form 1040 Lines 33, 34, 37):**
   - $\text{Total Payments} = \text{W-2 Withholding} + \text{Estimated Payments} + \text{Refundable Credits}$
   - If $\text{Total Payments} \ge \text{Total Federal Tax}$, true refund is issued on Line 34.
   - If $\text{Total Payments} < \text{Total Federal Tax}$, exact balance due is assessed on Line 37.
