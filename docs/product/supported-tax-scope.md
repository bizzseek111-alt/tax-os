# Autonomous Tax OS — Supported Tax Scope (V1 Launch Baseline)

> **Status**: Approved Product Baseline  
> **Tax Years Supported**: 2025, 2026, 2027 (Active Development)  
> **Jurisdictions**: Federal (IRS) + 5 Launch States (CA, NY, NJ, IL, MA)  

---

## 1. Federal Tax Scope (IRS Form 1040 Ecosystem)

Autonomous Tax OS V1 fully supports the U.S. Individual Income Tax return architecture with an intense focus on independent professionals, creators, consultants, and mixed earners:

### 1.1 Core Form 1040 & Schedules
* **Form 1040**: U.S. Individual Income Tax Return (Single, Married Filing Jointly, Married Filing Separately, Head of Household, Qualifying Surviving Spouse).
* **Schedule 1**: Additional Income and Adjustments to Income:
  * Part I: Additional Income (Business income line 3, other gains line 4, taxable refunds line 1).
  * Part II: Adjustments to Income (Deductible half of self-employment tax line 15, self-employed SEP/SIMPLE/qualified plans line 16, self-employed health insurance deduction line 17, student loan interest line 21, educator expenses line 11).
* **Schedule 2**: Additional Taxes (Self-employment tax line 4, alternative minimum tax line 1, additional Medicare tax line 8).
* **Schedule 3**: Additional Credits and Payments (Foreign tax credit line 1, child and dependent care credit line 2, education credits line 3, general business credit line 6, estimated tax payments line 10).
* **Schedule A**: Itemized Deductions (Medical & dental $>7.5\%$ AGI, state & local taxes capped at $10,000, mortgage interest, gifts to charity).
* **Schedule B**: Interest and Ordinary Dividends (Form 1099-INT, 1099-DIV, foreign bank account disclosure Part III).
* **Schedule C**: Profit or Loss From Business (Sole Proprietorship / Single-Member LLC):
  * Gross receipts & sales, statutory returns & allowances.
  * Advertising, car & truck expenses, commissions & fees, contract labor, depreciation, insurance, legal & professional services, office expense, rent/lease, supplies, travel, deductible meals (50%), utilities, other expenses.
* **Schedule D**: Capital Gains and Losses (Form 1099-B sales of stocks, bonds, crypto capital assets; capital loss carryover up to $3,000 limit).
* **Schedule E (Basic)**: Supplemental Income and Loss (Royalties, simple single-property non-commercial rental activity; multi-partner syndications deferred).
* **Schedule SE**: Self-Employment Tax (Short and long schedule calculations under IRC § 1401/1402).

### 1.2 Specialized Federal Tax Forms
* **Form 8829**: Expenses for Business Use of Your Home (Regular simplified $5/sq ft vs. actual expense method with square-footage allocation).
* **Form 4562**: Depreciation and Amortization (Section 179 expensing election, MACRS 5-year/7-year recovery periods, Special Depreciation Allowance under IRC § 168(k)).
* **Form 8995 / 8995-A**: Qualified Business Income (QBI) Deduction (IRC § 199A 20% pass-through deduction, taxable income threshold tests, SSTB classification).
* **Form 8863**: Education Credits (American Opportunity Credit and Lifetime Learning Credit).
* **Form 2441**: Child and Dependent Care Expenses.
* **Form 8889**: Health Savings Accounts (HSA contributions and distributions).
* **Form 8959**: Additional Medicare Tax (0.9% on compensation over $200k single / $250k MFJ).
* **Form 8960**: Net Investment Income Tax (3.8% on lesser of net investment income or modified AGI excess).

---

## 2. Five Launch States Architectural Scope

Each state module operates with strict sovereign independence in the Tax Rule Graph:

```
┌────────────────────────────────────────────────────────────────────────┐
│ STATE       AUTHORITY & RETURN FORMS    KEY CONFORMITY CHARACTERISTICS │
├────────────────────────────────────────────────────────────────────────┤
│ California  FTB Form 540 / 540NR        • Strict HSA non-conformity    │
│             Schedule CA (540/540NR)     • No QBI deduction (§ 199A)    │
│                                         • Strict § 179 cap ($25,000)   │
│                                         • Independent CA depreciation  │
├────────────────────────────────────────────────────────────────────────┤
│ New York    DTF Form IT-201 / IT-203    • Convenience of Employer Rule │
│             Form IT-196 (Itemized)      • NYC Resident Tax & MCTD      │
│             Yonkers Nonresident Surch.  • Part-year wage allocation    │
├────────────────────────────────────────────────────────────────────────┤
│ New Jersey  Div. of Taxation NJ-1040    • Gross Income Tax system      │
│             Schedule NJ-COJ (Credit)    • No federal AGI starting line │
│             Schedule NJ-BUS-1           • Strict category loss netting │
├────────────────────────────────────────────────────────────────────────┤
│ Illinois    IDOR Form IL-1040           • Flat 4.95% individual rate   │
│             Schedule M (Modifications)  • Property tax credit (5%)     │
│             Schedule CR (Credit Out)    • K-1 pass-through addition    │
├────────────────────────────────────────────────────────────────────────┤
│ Mass.       DOR Form 1 / Form 1-NR/PY   • Multi-tier income categories │
│             Schedule B (12% Gains)      • 4% Fair Share Surtax (> $1M) │
│             Schedule D (Long-Term)      • Rental deduction allowance   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Multi-State Allocation & Income Sourcing

Autonomous Tax OS natively solves the multi-state income dilemma for remote and gig workers:
1. **Residency Period Tracking**: Date-bounded residency intervals (`ResidencyPeriod`) tracking domicile shifts.
2. **Physical Presence vs. Economic Sourcing**: Sourcing wage income to the state of physical performance; applying destination rules for service receipts where required by state law.
3. **Credit for Taxes Paid to Other Jurisdictions**: Automatic calculation of resident credits (e.g., NY Form IT-112-R, NJ Schedule NJ-COJ, CA Schedule S) to prevent unconstitutional double taxation.
