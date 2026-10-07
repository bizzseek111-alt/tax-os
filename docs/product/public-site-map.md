# TaxOS — Public Website Site Map & Route Specification

> **Document Status**: Production Routing Baseline  
> **Target Audience**: Product Marketing, Engineering, SEO & Content Strategy  

---

## 1. Global Navigation Bar Architecture

```
[TaxOS Logo]  Individuals  Self-Employed  Businesses  Tax Professionals  How It Works  Pricing  Resources  |  [Sign In]  [Start My Taxes]
```

---

## 2. Comprehensive Route Directory

| Route Path | Page Title | Primary Audience | Core Value Proposition & Primary Content | Primary CTA |
| :--- | :--- | :--- | :--- | :--- |
| `/` | **Homepage** | All Audiences | Headline: *“Tax filing without doing taxes.”*<br/>Subhead: *“Upload your documents and connect your accounts. Your AI tax team organizes everything, finds legitimate deductions and credits, prepares your federal and state returns, and asks you only what it cannot safely determine.”*<br/>Interactive demo, trust badges, state badges. | `Start My Taxes` |
| `/how-it-works` | **How It Works** | Prospective filers | 4-step walkthrough: 1. Drop documents / link accounts $\rightarrow$ 2. Autonomous fact reconstruction & deduction search $\rightarrow$ 3. Answer a few Needs You cards $\rightarrow$ 4. Review & e-file with optional CPA review. | `Start My Taxes` |
| `/individuals` | **For Individuals & Families** | W-2 earners, families, mixed earners | Fast, automated 1040 filing. Maximum child tax credit, education credits, HSA deductions, and state tax optimizations. | `File My Personal Return` |
| `/self-employed` | **For Freelancers & Contractors** | 1099-NEC, gig workers, creators, solo consultants | Automated Schedule C deduction hunting (mileage, home office, software, equipment). Form 8995 20% QBI deduction optimization. | `Start Self-Employed Filing` |
| `/business` | **For Small Businesses** | Single-member LLCs, S-Corps (1120-S), Partnerships (1065) | Unified multi-domain compliance: Income tax + Sales tax + Payroll tax. Section 179 equipment expensing & cross-domain wage deduplication. | `Get Business TaxOS` |
| `/tax-professionals` | **For CPAs & EAs** | Accounting firms, independent tax practitioners | AI Review Briefs, exception-based triage, 10x preparer capacity, 1-click workpapers, PTIN e-file sign-off. | `Explore Firm Cockpit` |
| `/pricing` | **Transparent Pricing** | All customers | Clear tier breakdown: Free preview, Self-Employed ($99), Business S-Corp ($349), CPA review add-on ($150), B2B Firm SaaS seat tiers. | `Select Plan` |
| `/security` | **Zero-Trust Security & PII Isolation** | High-trust consumers & enterprise clients | AES-256 envelope encryption, field-level SSN tokenization, SOC 2 Type II compliance, IRS Pub 1075 & 1345 standards, WORM audit trails. | `Read Security Whitepaper` |
| `/states` | **Supported State Tax Directory** | Multi-state filers | Overview of sovereign state coverage: Federal + California, New York, New Jersey, Illinois, Massachusetts, plus national expansion roadmap. | `Check Your State` |
| `/states/california` | **California State Tax (FTB)** | California residents & multi-state earners | Complete Form 540 support: Cal. RTC § 17215.4 HSA add-back, Cal. RTC § 17255 $25k Section 179 limit, SDI deduction, and California Earned Income Tax Credit. | `File California Return` |
| `/states/new-york` | **New York State Tax (DTF)** | NY residents & non-residents | Form IT-201 and IT-203. Sourcing rules under 20 NYCRR § 131.18 convenience of employer test, NYC resident tax, and MCTD payroll tax. | `File New York Return` |
| `/states/new-jersey` | **New Jersey State Tax (Div of Tax)** | NJ residents & telecommuters | Form NJ-1040. N.J.S.A. § 54A:4-1 resident tax credits for taxes paid to other jurisdictions, retaliatory convenience rule credits, and gross income tax brackets. | `File New Jersey Return` |
| `/states/illinois` | **Illinois State Tax (IDOR)** | Illinois residents & businesses | Form IL-1040. Flat 4.95% rate, Illinois property tax credit, retirement income exemption, and pass-through entity (PTE) tax. | `File Illinois Return` |
| `/states/massachusetts` | **Massachusetts State Tax (DOR)** | MA residents & founders | Form 1. Chapter 62 tiered personal income tax, 4% surtax (Fair Share Amendment), commuter deductions, and MassHealth health insurance compliance. | `File Massachusetts Return` |
| `/sales-tax` | **Autonomous Sales & Use Tax** | E-commerce, SaaS, retail businesses | Multi-tier composite rates (State/County/City/District), economic & physical nexus monitors, SaaS taxability matrix, marketplace facilitator rules. | `Automate Sales Tax` |
| `/payroll-tax` | **Autonomous Payroll Compliance** | Employers with workers | Worker classification safeguards (ABC test), gross-to-net integer-cents math, FICA/FUTA/SUTA, deposit schedules, Form 941/940/W-2 filings. | `Automate Payroll Tax` |
| `/resources` | **Tax Intelligence Knowledge Hub** | Tax researchers, founders | IRS statutory guide, IRC code search, tax deadline calendar, state conformity tables, tax saving calculator tools. | `Browse Knowledge Hub` |
| `/about` | **About TaxOS** | Visitors, press, partners | Mission: "Taxes that largely do themselves." Team of former tax attorneys, CPAs, and AI systems architects. | `Meet the Team` |
| `/contact` | **Contact & Enterprise Sales** | B2B firms, platform partners | Direct sales inquiry, API partnerships, customer support, enterprise onboarding consultations. | `Contact Our Team` |
| `/signin` | **Secure Sign In** | Returning users & professionals | Clean WebAuthn / Passkey / Magic Link / Email login. Automatically evaluates identity and routes to role-specific workspace. | `Sign In` |
| `/start` | **Smart Start Intake Flow** | New filers | Progressive 8-step intake flow with situation cards, instant TaxDrop ingestion, account connection, and live TaxCase builder. | `Continue` |

---

## 3. Footer Navigation Architecture

* **Product**: Individuals • Self-Employed • Businesses • Tax Professionals • Pricing • Security
* **Tax Domains**: Income Tax • Sales & Use Tax • Payroll & Employment Tax • State Packs (CA, NY, NJ, IL, MA)
* **Resources**: Knowledge Hub • IRC Code Reference • Tax Calendar • IRS Citation Directory
* **Company**: About Us • Careers • Contact • Terms of Service • Privacy Policy • Security Whitepaper
