# Phase 3 Sovereign State Rules Specification: CA, NY, NJ, IL, MA & Multi-State

**Autonomous TaxOS Specification**  
**Workstream:** Phase 3 — Sovereign State Calculation Modules  
**Tax Year:** 2026 (Rule Set Version 2026.1)  
**Status:** COMPLETE & VERIFIED  

---

## 1. Overview & Common Interface

Every sovereign state module implements the standard `StateTaxModule` interface:

```typescript
export interface StateTaxModule {
  jurisdiction: string;
  stateName: string;
  formName: string;
  calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult;
}
```

---

## 2. California (Form 540)

- **Statutory Authority:** California Revenue and Taxation Code (CRTC) § 17041, § 17043, § 17072, § 17215.4
- **Starting Base:** Federal AGI (Form 540 Line 13)
- **Non-Conformity Additions:**
  - CRTC § 17215.4: California does NOT conform to federal HSA deductions (IRC § 223); federal HSA deduction is added back to CA income.
  - California does NOT conform to IRC § 199A (20% QBI deduction).
- **Standard Deduction:** \$5,540 Single / \$11,080 MFJ
- **Personal Exemption Credit:** \$149 Single / \$298 MFJ (reduces tax directly)
- **Mental Health Services Surtax (Proposition 63):**
  - **1.0% surtax** on CA taxable income exceeding **\$1,000,000** (CRTC § 17043).
  - Effective top marginal tax rate: **13.3%**.

---

## 3. New York (Form IT-201)

- **Statutory Authority:** New York Tax Law § 601, § 612, § 614, § 620
- **Starting Base:** Federal AGI (Form IT-201 Line 19)
- **Standard Deduction:** \$8,000 Single / \$16,050 MFJ / \$11,200 HOH
- **Rate Schedule:** 9 progressive brackets ranging from **4.0% to 10.9%**
- **Other-State Tax Credit (Form IT-112-R):** Allowed for income taxes paid to other states on doubly-taxed income.

---

## 4. New Jersey (Form NJ-1040)

- **Statutory Authority:** New Jersey Gross Income Tax Act (N.J. Stat. Ann. § 54A:1-1 et seq.)
- **CRITICAL NON-CONFORMITY:**
  - New Jersey does **NOT** use Federal AGI as starting point.
  - NJ Gross Income is calculated independently from specific statutory income categories (W-2 Box 16 wages + NJ business net profit + interest/dividends).
  - New Jersey allows **NO standard deduction** and **NO federal itemized deductions**.
- **Personal Exemptions:** \$1,000 Single / \$2,000 MFJ (N.J. Stat. Ann. § 54A:3-1)
- **Rate Schedule:** Progressive brackets from **1.4% to 10.75%**

---

## 5. Illinois (Form IL-1040)

- **Statutory Authority:** Illinois Constitution Art. IX § 3; 35 ILCS 5/201, 5/203, 5/204
- **Constitutional Flat Tax:** Individual rate is fixed at **4.95%** (35 ILCS 5/201(b)(14))
- **Retirement & Pension Subtraction:**
  - **100% subtraction** for federally taxed qualified retirement, pension, and IRA income under **35 ILCS 5/203(a)(2)(F)**.
- **Standard Exemption:** **\$2,775 per person** (taxpayer, spouse, dependents) under 35 ILCS 5/204(b).

---

## 6. Massachusetts (Form 1)

- **Statutory Authority:** M.G.L. c. 62, § 4; Mass. Const. amend. art. XLIV
- **Part B Rate:** Flat **5.0%**
- **Personal Exemption:** \$4,400 Single / \$8,800 MFJ / \$6,800 HOH (M.G.L. c. 62, § 3(B)(b))
- **Fair Share Amendment ("Millionaire's Tax"):**
  - **4.0% surtax** on Massachusetts taxable income exceeding **\$1,000,000** (effective top rate: **9.0%**).

---

## 7. Multi-State Allocation & Resident Credit

The `MultiStateEngine` handles multi-state scenarios:
1. **Wage Allocation:** Extracts Box 15/16 state wages from multiple W-2s and calculates exact apportionment ratios.
2. **Resident Credit for Taxes Paid to Other States:**
   - Evaluated under CA Schedule S, NY IT-112-R, NJ Schedule NJ-COJ, IL Schedule CR, MA Schedule OJC.
   - Credit is capped at the **LESSER** of:
     a) Actual tax paid to the nonresident state on the doubly-taxed income.
     b) Resident state tax $\times \frac{\text{Doubly-Taxed Income}}{\text{Total Resident Income}}$.
