# Autonomous Tax OS — Federal Tax Knowledge Package (Form 1040 Ecosystem)

> **Status**: Approved Tax Technology Specification  
> **Jurisdiction**: United States Federal (`US-FED`)  
> **Target Forms**: Form 1040, Schedules 1–3, A, B, C, D, E, SE, Form 8829, 4562, 8995/8995-A, 8863, 2441  

---

## 1. Statutory Foundations & Code Index

The Federal Tax Knowledge Package codifies primary statutes of the Internal Revenue Code (Title 26 USC) and corresponding Treasury Regulations (26 CFR):

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPIC                    PRIMARY STATUTE        TREASURY REGULATION    │
├────────────────────────────────────────────────────────────────────────┤
│ Gross Income             IRC § 61(a)            Treas. Reg. § 1.61-1   │
│ Trade/Business Expense   IRC § 162(a)           Treas. Reg. § 1.162-1  │
│ Substantiation Mandate   IRC § 274(d)           Treas. Reg. § 1.274-5T │
│ Business Meals 50%       IRC § 274(n)           Treas. Reg. § 1.274-12 │
│ Home Office Space        IRC § 280A(c)(1)       Prop. Reg. § 1.280A-2  │
│ De Minimis Safe Harbor   Treas. Reg. § 1.263(a)-1(f) (Expensing <$2,500)│
│ Section 179 Expensing    IRC § 179              Treas. Reg. § 1.179-1  │
│ Modified ACRS Deprec.    IRC § 168              Treas. Reg. § 1.168    │
│ Self-Employment Tax      IRC § 1401, § 1402     Treas. Reg. § 1.1401-1 │
│ Half SE Tax Deduction    IRC § 164(f)           Treas. Reg. § 1.164-4  │
│ SE Health Insurance      IRC § 162(l)           IRS Notice 2008-1      │
│ QBI 20% Deduction        IRC § 199A             Treas. Reg. § 1.199A-1 │
│ Capital Gains & Losses   IRC § 1221, § 1222     Treas. Reg. § 1.1221-1 │
│ Wash Sales Disallowance  IRC § 1091             Treas. Reg. § 1.1091-1 │
│ Dependent Definition     IRC § 152              Treas. Reg. § 1.152-1  │
│ Estimated Tax Penalty    IRC § 6654             Treas. Reg. § 1.6654-1 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Topic Architecture & Declarative Implementations

### 2.1 Trade or Business Expenses (Schedule C)
* **Ordinary & Necessary Standard (IRC § 162)**: Expenses incurred in connection with a trade or business that are customary and appropriate for the taxpayer's specific industry (NAICS classification).
* **Advertising & Marketing**: 100% deductible for customer acquisition, digital PPC campaigns (Google, Meta), website hosting, and brand promotion.
* **Contract Labor**: Payments to unincorporated independent contractors; triggers Form 1099-NEC filing cross-check if annual payments to a US person exceed $600.
* **Supplies & Materials**: Tangible personal property consumed within the tax year or costing under the $2,500 de minimis safe harbor limit per invoice.

### 2.2 Vehicle & Travel Logistics
* **Standard Mileage Rate vs. Actual Expenses**:
  * Option A: Standard mileage rate (e.g., $0.67/mile for 2024, $0.70/mile for 2026 under annual Revenue Procedure) based on contemporaneous mileage log.
  * Option B: Actual vehicle expenses (gas, insurance, repairs, depreciation subject to IRC § 280F luxury auto caps) multiplied by verified business use percentage.
* **Overnight Travel (IRC § 162(a)(2))**: Travel away from the taxpayer's tax home requiring sleep or rest. Airfare, trains, and lodging are 100% deductible; personal side-trips are partitioned out.
* **Meals (IRC § 274(n))**: Meals with a clear business purpose (client meal, travel meal) are subject to the mandatory 50% disallowance rule.

### 2.3 Home Office Deduction (Form 8829)
* **Statutory Test (IRC § 280A)**: Requires that a specific area of the home is used **regularly and exclusively** as the principal place of business or to meet clients.
* **Method A (Simplified Method)**: $5.00 per square foot up to a statutory maximum of 300 square feet (maximum deduction: $1,500; zero depreciation recapture on sale).
* **Method B (Actual Expense Method)**: Deducts the business percentage (studio sq ft / total home sq ft) of rent, mortgage interest, utilities, repairs, insurance, and depreciation.

### 2.4 Capital Asset Expensing & Depreciation (Form 4562)
* **De Minimis Safe Harbor Election**: Expensing items up to $2,500 per invoice without capitalization under Treas. Reg. § 1.263(a)-1(f). Requires formal written election statement attached to return.
* **Section 179 Expensing**: Immediate expensing of qualifying tangible equipment (computers, cameras, office furniture) up to federal dollar ceiling ($1,220,000 for 2024, inflation indexed for 2026), subject to the trade or business taxable income limitation.
* **Special Depreciation Allowance (IRC § 168(k))**: Bonus depreciation phased down (60% in 2024, 40% in 2025, 20% in 2026, 0% in 2027 under TCJA rules).

### 2.5 Qualified Business Income (QBI) Deduction (IRC § 199A / Form 8995)
* **General Rule**: Allows an eligible non-corporate taxpayer a deduction equal to 20% of Qualified Business Income from a qualified trade or business.
* **Specified Service Trade or Business (SSTB)**: Health, law, accounting, actuarial science, performing arts, consulting, athletics, financial services, or any business where the principal asset is the reputation or skill of employees.
* **Phase-Out Mechanics**: Full 20% deduction below taxable income thresholds ($191,950 Single / $383,900 MFJ for 2024, inflation indexed). Phased out completely for SSTBs over the $50,000 / $100,000 phase-out band. Non-SSTBs above the threshold are limited by W-2 wages and unadjusted basis of qualified property.
