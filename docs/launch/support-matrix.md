# TaxOS Official Support Matrix (Private Beta vs. General Availability)
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Window:** Private Beta 2026  
**Status:** Canonical Support Specification  

---

## 1. Overview & Principle of Transparency

TaxOS strictly communicates supported tax domains, jurisdictions, and forms. Unsupported scenarios are explicitly defined and programmatically blocked by the application layer to prevent improper filings.

---

## 2. Comprehensive Support Matrix

### 2.1. Individual Income Tax (Federal & State)

| Jurisdiction | Form / Schedule | Tax Year 2026 Private Beta Status | General Availability Status |
| :--- | :--- | :--- | :--- |
| **US-FED** | Form 1040 (U.S. Individual Income Tax Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule 1 (Additional Income & Adjustments) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule 2 (Additional Taxes & SE Tax) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule 3 (Additional Credits & Payments) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule A (Itemized Deductions) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule B (Interest & Ordinary Dividends) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule C (Profit/Loss from Business - Sole Prop) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule D (Capital Gains & Losses) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Schedule SE (Self-Employment Tax) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 8995 (Qualified Business Income Deduction) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 8879 (IRS e-file Signature Authorization) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 4868 (Application for Automatic Extension) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 1040-X (Amended Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 1040-NR (Nonresident Alien Return) | **UNSUPPORTED (Blocked)** | GA Planned |
| **US-FED** | Form 2555 (Foreign Earned Income) | **UNSUPPORTED (Blocked)** | Post-GA Roadmap |
| **US-CA** | Form 540 (California Resident Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-NY** | Form IT-201 (New York State Resident Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-NJ** | Form NJ-1040 (New Jersey Resident Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-IL** | Form IL-1040 (Illinois Individual Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-MA** | Form 1 (Massachusetts Resident Return) | **FULL SUPPORT** | FULL SUPPORT |
| Other 45 States | State Income Tax Returns | **UNSUPPORTED (Blocked)** | Phased GA Rollout |

---

### 2.2. Sales & Use Tax

| Jurisdiction | Form / Return | Private Beta Status | GA Status |
| :--- | :--- | :--- | :--- |
| **California** | CDTFA-401-A (State, Local & District Sales Tax) | **FULL SUPPORT** | FULL SUPPORT |
| **New York** | ST-100 (Quarterly Sales and Use Tax Return) | **FULL SUPPORT** | FULL SUPPORT |
| **Multi-State** | Economic Nexus Threshold Monitoring (All 50 states) | **FULL SUPPORT** | FULL SUPPORT |
| **Multi-State** | Destination vs. Origin Sourcing Engine | **FULL SUPPORT** | FULL SUPPORT |
| **Multi-State** | Marketplace Facilitator Carve-Outs | **FULL SUPPORT** | FULL SUPPORT |

---

### 2.3. Payroll & Employment Tax

| Jurisdiction | Form / Return | Private Beta Status | GA Status |
| :--- | :--- | :--- | :--- |
| **US-FED** | Form 941 (Employer's Quarterly Federal Return) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 940 (Employer's Annual Federal Unemployment) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form W-2 / W-3 (Wage and Tax Statement Summary) | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Monthly & Semi-Weekly Deposit Schedule Engine | **FULL SUPPORT** | FULL SUPPORT |
| **Multi-State** | Multi-State SUTA Wage Base Capping | **FULL SUPPORT** | FULL SUPPORT |
| **US-FED** | Form 1099-NEC / 1099-MISC Information Returns | **FULL SUPPORT** | FULL SUPPORT |

---

## 3. Explicitly Unsupported Scenarios (Programmatically Blocked)

The following scenarios are rejected at intake by `FeatureFlagService.evaluateBetaSupportEligibility()`:
1. **Foreign Earned Income (Form 2555) & Foreign Tax Credit (Form 1116 complex baskets):** Requires specialized cross-border treaty modeling.
2. **Consolidated Corporate Returns (Form 1120 Consolidated):** Multi-tier corporate ownership structures.
3. **Partnerships with > 100 Partners (Form 1065 complex BBA regimes):** High-tier partnership allocations.
4. **Excise & Alcohol/Tobacco/Firearms Taxes (TTB Form 5000.24).**
5. **Nonresident State Income Taxes Outside CA, NY, NJ, IL, MA.**

When an unsupported scenario is identified, the platform presents an explanatory modal to the taxpayer and recommends professional consultation.
