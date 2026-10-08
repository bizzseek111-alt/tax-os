# Phase 4 — Federal & Five-State Conformity Graph Engine

## 1. Overview

Each of the 50 U.S. states exercises independent sovereignty regarding income taxation. No federal tax calculation can be directly transferred to a state return without evaluating the state's specific statutory conformity model.

TaxOS models federal-state relationships via `FederalStateConformity` records and `StateConformityService` (`src/server/services/taxAuthority/rules/conformityService.ts`).

## 2. The Four Conformity Models

| Conformity Model | Description | Supported States |
| :--- | :--- | :--- |
| **Rolling Conformity** | Automatically incorporates the Internal Revenue Code as currently amended by Congress. | `US-NY`, `US-IL` |
| **Fixed-Date Conformity** | Adopts the Internal Revenue Code as enacted on a specific static date (requires legislative updates). | `US-CA` (as of 2015), `US-MA` (as of 2022) |
| **Selective Decoupling** | Conforms to general code structure but explicitly decouples from specific provisions (e.g. QBI, bonus depreciation). | `US-CA`, `US-NY`, `US-MA` |
| **Completely Independent** | Rejects federal adjusted gross income entirely; defines gross income and deductions through sovereign state statute. | `US-NJ` (Gross Income Tax) |

## 3. Five-State Statutory Conformity Profile

### California (`US-CA`)
- **Authority:** Cal. Rev. & Tax. Code § 17024.5 (Fixed date: Jan 1, 2015)
- **QBI Deduction (IRC § 199A):** Complete disallowance on CA Form 540 Line 18.
- **HSA Deduction (IRC § 223):** Disallowed under Cal. RTC § 17215. Full addition add-back on Schedule CA (540).
- **Depreciation:** Decoupled from IRC § 168(k) bonus depreciation; requires CA Form 3885A.

### New York (`US-NY`)
- **Authority:** NY Tax Law § 607 (Rolling conformity to Federal AGI)
- **QBI Deduction:** Not permitted below federal AGI on Form IT-201.
- **Benefit Recapture:** NY Tax Law § 601(d) recaptures lower tax bracket benefits for NY AGI exceeding $107,650.
- **SALT Cap:** Form IT-201 itemized deduction modifications.

### New Jersey (`US-NJ`)
- **Authority:** N.J.S.A. 54A (New Jersey Gross Income Tax Act)
- **Autonomous Starting Point:** Does NOT start with federal AGI. Calculates categorical gross income independently.
- **No Cross-Netting:** N.J.S.A. 54A:5-2 strictly prohibits netting losses from one category (e.g. business) against another (e.g. wages).
- **HSA Deduction:** Disallowed under N.J.S.A. 54A:6-30.

### Illinois (`US-IL`)
- **Authority:** 35 ILCS 5/201 & 5/203 (Rolling conformity to Federal AGI)
- **Rate:** Flat tax rate of 4.95%.
- **Retirement Exemption:** 35 ILCS 5/203(a)(2)(F) provides a 100% subtraction for federally taxable pension, 401(k), IRA distributions, and Social Security on IL-1040 Line 5.

### Massachusetts (`US-MA`)
- **Authority:** M.G.L. c. 62 § 1 (Fixed date: Jan 1, 2022)
- **4% Fair Share Surtax:** Mass. Const. Amend. Art. XLIV applies an additional 4.0% surtax on Massachusetts taxable income exceeding $1,000,000 (indexed for inflation).
- **QBI Deduction:** Decoupled under TIR 18-14; disallowed on MA Form 1.
