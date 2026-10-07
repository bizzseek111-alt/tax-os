# TaxOS Page-by-Page Section Specification Map

**Document Version:** 3.0.0  
**Design Standard:** Minimum 8 to 15 meaningful, non-duplicated sections per core public route.  
**Compliance Mandate:** Every section must serve a distinct narrative, statutory, educational, or conversion objective.

---

## 1. Homepage (`/`) — 12 Dedicated Sections

1. **Section 1: Hero**
   - *Headline:* "Tax filing without doing taxes." (Alternative: "Your taxes. Almost done before you start.")
   - *Subheadline:* "Upload your documents and connect your accounts. TaxOS reconstructs your tax picture, finds legitimate deductions and credits, checks supporting evidence, prepares federal and state filings, and asks you only what it cannot safely determine."
   - *CTA:* Primary: `Start My Taxes` | Secondary: `Watch How It Works`
2. **Section 2: Trust & Coverage**
   - Supported jurisdictions: Federal (IRS), California (FTB), New York (DTF), New Jersey (NJ Division of Taxation), Illinois (IDOR), Massachusetts (DOR).
   - Core trust badges: AI Autonomous Preparation, Optional Licensed Human Verification, Evidence-Backed Substantiation, 256-bit Encrypted Financial Feeds.
3. **Section 3: Live Autonomous Demonstration**
   - Step-by-step interactive visual simulation showing synthetic taxpayer return completion:
     - 1099-NEC & W-2 matched $\rightarrow$ 2,842 transactions parsed $\rightarrow$ 84 receipts matched $\rightarrow$ 3 items flagged for human clarification $\rightarrow$ Return 94% complete.
4. **Section 4: TaxDrop (Universal Document Ingestion)**
   - *Headline:* "Give us everything."
   - *Subheadline:* "Don't organize it. Don't rename it. TaxOS does the sorting."
   - Supported formats: PDF, JPEG/PNG photos, W-2, 1099s, bank/card CSVs, prior year returns, ZIP archives.
5. **Section 5: Connect Your Financial World**
   - Direct secure read-only financial connections: Banks, Credit Cards, Brokerages, Stripe/Square/PayPal, Gusto/ADP, Shopify/Amazon.
   - Clear affirmative consent and privacy protocol explanation.
6. **Section 6: Find What You May Have Missed**
   - Highlighting legitimate statutory deductions: Business expenses (§ 162), Home office deduction (§ 280A), Vehicle/Mileage, Equipment depreciation (§ 179), Retirement plans (SEP/Solo 401k), Education credits, State-specific subtractions.
7. **Section 7: TaxOS Checks Its Own Work**
   - Consumer explanation of internal self-verification: AI Preparation $\rightarrow$ Evidence Checking $\rightarrow$ Independent Statutory Review $\rightarrow$ Calculation Validation $\rightarrow$ Exception Detection.
8. **Section 8: Prove This Number (Line-by-Line Lineage)**
   - Interactive breakdown component showing total business expenses ($18,490) expanding into Software, Travel, Equipment, Professional fees, with transaction receipts, statutory citations, and IRS form line mapping.
9. **Section 9: Choose How You File (The Three Review Modes)**
   - **Option A: AI Autopilot** (Self-directed, fully automated, customer authorizes).
   - **Option B: Human Verified** (AI prepares, licensed CPA/EA reviews exceptions and signs off).
   - **Option C: Full Professional Service** (Human tax professional leads preparation with AI assistance).
   - *Escalation:* Tax Attorney available for complex statutory controversies and litigation protection.
10. **Section 10: Who TaxOS Is For (Audience Profiles)**
    - Employees (W-2), Freelancers & 1099 Consultants, Creators, Gig Workers, Small Business Owners (LLCs, S-Corps), and Multi-State Earners.
11. **Section 11: Tax Twin (Year-Round Real-Time Guidance)**
    - Forward-looking simulation preview: Estimated quarterly payments, what-if planning, income change projections, and major asset purchases.
12. **Section 12: Security Architecture & Final Call-to-Action**
    - Bank-grade encryption, zero AI training on personal data, SOC 2 alignment.
    - Final conversion CTA: `Start My Taxes`.

---

## 2. Individuals Page (`/individuals`) — 14 Dedicated Sections

1. **Hero:** Tailored value proposition for employees and individual taxpayers.
2. **Who It Supports:** W-2 workers, dual-income households, renters, homeowners, and multi-state movers.
3. **W-2 & Job Income:** Multi-job handling, Box 12 codes, deferred compensation, and RSUs.
4. **Family & Dependents:** Child Tax Credit (§ 24), Earned Income Tax Credit (§ 32), Dependent Care credits.
5. **Investments & Crypto:** Form 1099-B, wash sale detection, crypto transactions, dividend income (§ 1(h)).
6. **Home, Education & Retirement:** Form 1098 mortgage interest, property taxes, 529 distributions, IRA deductions.
7. **Deductions & Credits:** Standard deduction vs. itemized Schedule A optimization.
8. **Multi-State Living:** Part-year resident apportionment, state tax credits for taxes paid to other states.
9. **TaxDrop for Individuals:** Snap phone pictures of tax slips or upload PDFs effortlessly.
10. **Automated AI Review:** Verification of math, form rules, and tax law conformance.
11. **Optional Human CPA/EA Sign-off:** Peace of mind before submitting to the IRS.
12. **Consumer Data Security:** Complete PII isolation and encrypted vault storage.
13. **Comprehensive Individual FAQ:** 6 in-depth answers regarding audits, accuracy guarantees, and filing timelines.
14. **Conversion CTA:** Direct onboarding link to start individual return.

---

## 3. Self-Employed Page (`/self-employed`) — 15 Dedicated Sections

1. **Hero:** "The tax system built for how you actually work."
2. **Audience Personas:** Freelancers, independent contractors, digital creators, consultants, and gig economy workers.
3. **1099 Income Intelligence:** Automatic matching of 1099-NEC, 1099-MISC, and 1099-K forms without double counting.
4. **Financial Account Connections:** Integration with business checking, cards, and payment processors.
5. **Income Reconstruction:** Automated deduplication of internal transfers between accounts.
6. **Expense Intelligence:** Machine classification of Schedule C expenses under 26 U.S.C. § 162(a).
7. **Receipt Matching:** Automatic OCR linking between credit card transactions and uploaded receipts.
8. **Home Office Deduction (§ 280A):** Simplified method ($5/sq ft) vs. actual expense method calculator.
9. **Vehicle & Mileage Tracking:** Standard mileage rate vs. actual operational expense optimization.
10. **Travel & Business Meals:** Proper 50% statutory disallowance under 26 U.S.C. § 274(n).
11. **Equipment, Hardware & Software:** Section 179 expensing and bonus depreciation evaluation.
12. **Quarterly Estimated Tax Engine:** Form 1040-ES calculation with annualized income installment methods.
13. **Tax Twin Forward Modeling:** Real-time tax liability updates as you send client invoices.
14. **Expert Verification:** Dedicated review by small-business CPA specialists.
15. **Conversion CTA:** Direct onboarding link for self-employed filers.

---

## 4. Business Page (`/business`) — 14 Dedicated Sections

1. **Hero:** "An end-to-end tax operating system for growing companies."
2. **Business Tax Command Center:** Unified cockpit for LLCs, S-Corporations, Partnerships, and C-Corporations.
3. **Corporate Income Tax (1120 / 1120-S / 1065):** Book-to-tax adjustments (Schedule M-1/M-3) and Schedule K-1 distribution.
4. **Multi-Jurisdiction Sales Tax:** Nexus tracking, taxability determination, and automated filings.
5. **Payroll & Employment Taxes:** Withholding calculations, Form 941 deposits, and worker classification.
6. **Tax Registrations & Permits:** Automated foreign qualification and state revenue department registrations.
7. **Statutory Deadline Engine:** Dynamic calendar tracking annual, quarterly, and monthly compliance deadlines.
8. **ERP & Accounting Integrations:** QuickBooks, Xero, NetSuite, Stripe, Gusto, and Shopify synchronization.
9. **Multi-State Apportionment:** Property, payroll, and sales factor weighting across sovereign states.
10. **Autonomous AI Validation:** Pre-filing cross-checks against federal and state statutory tables.
11. **Dedicated Human Tax Directors:** Certified business tax professionals overseeing complex corporate positions.
12. **Enterprise Privacy & RBAC:** Multi-user permission boundaries protecting sensitive employee payroll data.
13. **Year-Round Corporate Tax Planning:** Entity restructuring simulations and R&D tax credit evaluations.
14. **Conversion CTA:** Business intake and enterprise consultation request.

---

## 5. Business Income Tax (`/business/income-tax`) — 10 Dedicated Sections

1. **Hero:** Entity-specific corporate tax return automation.
2. **Supported Entity Classes:** S-Corp (Form 1120-S), Partnership (Form 1065), C-Corp (Form 1120), and Single-Member LLC.
3. **Book-to-Tax Reconciliations:** Automatic computation of Schedule M-1 and M-3 temporary/permanent book differences.
4. **Qualified Business Income (§ 199A):** W-2 wage limits, unadjusted basis of qualified property, and SSTB analysis.
5. **Depreciation Schedules:** Section 179 expensing, MACRS tables, and federal/state bonus depreciation conformity.
6. **State Corporate Conformity & Add-backs:** State-specific adjustments (e.g., CA $800 franchise tax, NY MTA surcharges).
7. **Partner & Shareholder K-1 Generation:** Automated distribution of ordinary business income, deductions, and credits.
8. **Cryptographic Workpapers:** Audit-ready digital workpaper packets with SHA-256 evidence links.
9. **CPA Review & E-File Signoff:** Preparer Tax Identification Number (PTIN) signoff and electronic filing.
10. **Conversion CTA:** Launch corporate tax filing.

---

## 6. Sales Tax Page (`/sales-tax`) — 14 Dedicated Sections

1. **Hero:** "Autonomous multi-state sales tax compliance without the manual headaches."
2. **What TaxOS Automates:** Continuous transaction evaluation, tax rate determination, and filing execution.
3. **Economic & Physical Nexus Detection:** Real-time monitoring of South Dakota v. Wayfair thresholds ($100k / 200 transactions).
4. **Automated State Registration:** Guidance and preparation of state sales tax permit applications.
5. **Product & Service Taxability:** Granular classification of SaaS, digital goods, professional services, and physical items.
6. **Transaction Sourcing Rules:** Origin-based vs. destination-based sourcing logic across 12,000+ U.S. jurisdictions.
7. **State, County, City & District Rates:** Exact rooftop geographic boundary rate calculation.
8. **Marketplace Facilitator Laws:** Automatic reconciliation of sales made via Amazon, Etsy, and Shopify marketplaces.
9. **Sales Channel Integrations:** Real-time ingestion via APIs and automated webhook triggers.
10. **Sales Tax Reconciliation Engine:** Identifying discrepancies between collected tax and reported revenue.
11. **Filing Calendar & Return Preparation:** Timely preparation of state returns (e.g., CA CDTFA-401, NY ST-100).
12. **Human Sales Tax Reviewers:** Specialized sales tax professionals reviewing high-materiality filings.
13. **State Tax Notice Resolution:** Automated OCR analysis and human escalation for jurisdictional assessment notices.
14. **Conversion CTA:** Connect e-commerce store and evaluate nexus.

---

## 7. Payroll Tax Page (`/payroll-tax`) — 15 Dedicated Sections

1. **Hero:** "Autonomous payroll tax and employer compliance."
2. **Payroll Provider Integrations:** Direct connection to Gusto, ADP, Rippling, Paychex, and custom payroll CSVs.
3. **Federal Payroll Taxes:** Social Security (FICA 6.2%), Medicare (1.45% + 0.9% additional), and Federal Withholding.
4. **State Income Tax Withholding:** Resident and non-resident withholding tables across all 50 states.
5. **State Unemployment Insurance (SUI):** Experience rate tracking and quarterly wage base caps.
6. **Deposit Schedules & Remittances:** Semi-weekly vs. monthly EFTPS tax deposit tracking and reminders.
7. **Form 941 Quarterly Filings:** Automated generation and electronic transmission of Employer's Quarterly Federal Tax Return.
8. **Form 940 Annual FUTA Filings:** Federal Unemployment Tax Act return preparation with state credit reductions.
9. **Year-End W-2 & W-3 Processing:** Electronic wage statement creation and Social Security Administration (SSA) e-filing.
10. **Payroll Reconciliation Engine:** Cross-checking general ledger wages against Form 941 quarterly totals.
11. **Worker Classification Guard:** Proprietary algorithms testing worker status under IRS 20-factor and California AB 5 tests.
12. **Employee PII & Wage Segregation:** Strict role-based access control preventing income tax preparers from viewing salaries.
13. **Human Payroll Reviewers:** Certified payroll professionals validating quarterly filings and tax deposits.
14. **Tax Notice Management:** Ingesting and resolving payroll adjustment notices and rate change notifications.
15. **Conversion CTA:** Audit payroll compliance and connect accounts.

---

## 8. Tax Professionals Page (`/tax-professionals`) — 15 Dedicated Sections

1. **Hero:** "Let AI prepare the work. Your team reviews what matters."
2. **AI Pre-Accounting & Intake:** Autonomous client data collection, document OCR, and transaction classification.
3. **Document Vault & Extraction:** Instant extraction of W-2s, 1099s, K-1s, and bank statements with 99.4%+ accuracy.
4. **Transaction Reconciliation:** Automatic transfer netting and Schedule C expense grouping.
5. **Standardized Digital Workpapers:** Audit-ready digital workpaper packets linked to underlying source transactions.
6. **Exception-Driven Review Queue:** Filter cases by risk, complexity, jurisdiction, and open taxpayer questions.
7. **The AI Review Brief:** A concise 1-page executive summary detailing positions taken, citations, and changed items.
8. **Evidence Lineage & Provenance:** One-click drill down from any return line to the underlying receipt and bank hash.
9. **Exception Workflow & Overrides:** Seamless CPA/EA manual adjustment tools with automatic recalculation.
10. **Direct Client Clarification Queue:** Automated requests for missing receipts without endless email threads.
11. **Firm Administration & Multi-Preparer Management:** Assign cases to junior preparers and senior reviewers with ease.
12. **Granular Team Permissions:** Zero-trust RBAC isolating client PII and restricting cross-domain access.
13. **Software Integrations:** Export to Drake, UltraTax, ProConnect, Lacerte, or direct IRS MeF e-filing.
14. **Enterprise Security & Compliance:** SOC 2 Type II, IRS Pub 1075, and Gramm-Leach-Bliley Act (GLBA) compliance.
15. **Conversion CTA:** Schedule a firm demonstration or start professional partner trial.

---

## 9. Expert Review Page (`/expert-review`) — 10 Dedicated Sections

1. **Hero:** "The perfect balance of artificial intelligence and licensed human expertise."
2. **Why Human Review Matters:** Handling nuanced statutory ambiguities, high-materiality positions, and audit strategy.
3. **The Three Filing Modes:** Deep comparison between AI Autopilot, Human Verified, and Full Professional Service.
4. **CPA & EA Credentials:** All reviewers are verified CPAs or IRS Enrolled Agents with active PTINs and state licenses.
5. **Tax Attorney Legal Escalation:** Complex worker classification controversies and IRC § 7525 privileged reviews.
6. **The Review Protocol:** How our specialists verify receipts, inspect calculations, and validate state conformity.
7. **Evidence Lineage Inspection:** How human reviewers verify math against cryptographic data hashes.
8. **Interactive Client Messaging:** In-app secure communication when clarification is required.
9. **Accuracy & Satisfaction Guarantee:** Full indemnification against calculation errors and penalties.
10. **Conversion CTA:** Select your preferred review level and start filing.

---

## 10. How It Works Page (`/how-it-works`) — 12 Dedicated Sections

1. **Hero:** "From raw documents to IRS e-file acknowledgment in five transparent stages."
2. **The 5-Stage Operating Pipeline:** High-level architectural flowchart.
3. **Stage 1: Frictionless Intake & Ingestion:** TaxDrop and bank API connections.
4. **Stage 2: OCR & Fact Extraction:** High-fidelity data extraction with automated deduplication.
5. **Stage 3: Deterministic Rule Execution:** Zero-hallucination math grounded in codified statutes.
6. **Stage 4: Adversarial Self-Challenge:** AI challenger agents verifying evidence sufficiency.
7. **Stage 5: Prove This Number:** Full line-by-line lineage for every figure on federal and state returns.
8. **Stage 6: Multi-Tier Human Review:** Domain specialists validating flagged exceptions.
9. **Stage 7: Taxpayer Review & Digital Signature:** Plain-English summary and Form 8879 e-signature.
10. **Stage 8: Electronic Filing & IRS Transmission:** MeF XML packaging and direct state/federal submission.
11. **Stage 9: Real-Time Acceptance Tracking:** Instant confirmation numbers and refund status monitoring.
12. **Conversion CTA:** Experience the autonomous pipeline today.

---

## 11. Tax Twin Page (`/tax-twin`) — 10 Dedicated Sections

1. **Hero:** "Your personal tax simulation engine, running 365 days a year."
2. **What Is the Tax Twin?:** A digital twin of your tax profile that updates continuously with your financial reality.
3. **Real-Time Tax Liability Projections:** Know your exact federal and state liability at any point in the year.
4. **Entity Restructuring Simulator:** Calculate exact tax differences between Sole Prop, S-Corp, and LLC.
5. **Major Transaction & Asset Modeling:** Simulate the tax impact of buying equipment, selling stock, or buying real estate.
6. **Quarterly Safe Harbor Tracker:** Avoid IRS underpayment penalties (Form 2210) through exact safe harbor modeling.
7. **Multi-State Tax Impact Analyzer:** Project your tax burden before moving homes or accepting remote job offers.
8. **Deduction Maximizer:** Proactive end-of-year recommendations for retirement funding and expense acceleration.
9. **Audit Trail Readiness:** Continuous maintenance of receipt archives so tax season requires zero catch-up work.
10. **Conversion CTA:** Activate your Tax Twin today.

---

## 12. Pricing Page (`/pricing`) — 8 Dedicated Sections

1. **Hero:** "Transparent pricing. No surprises. No upsells."
2. **Core Filing Tiers:**
   - **AI Autopilot ($0 Basic / $89 Self-Employed / $249 Business):** Full autonomous preparation.
   - **Human Verified (+$99 / +$149 / +$299):** Complete CPA/EA exception review and signoff.
   - **Full Professional Service ($399 / $799 / $1,499):** Dedicated CPA-led preparation.
3. **State Return Pricing:** First state included in Pro/Business; $39 per additional state return.
4. **Sales & Payroll Tax Add-Ons:** Modular monthly pricing for business compliance automation.
5. **Price Transparency Guarantee:** We never bait-and-switch or lock features behind surprise fees.
6. **Comprehensive Plan Feature Matrix:** Detailed table comparing all features across tiers.
7. **Pricing FAQ:** Answers regarding payment methods, refunds, state fees, and audit protection.
8. **Conversion CTA:** Choose your plan and get started.

---

## 13. Security Page (`/security`) — 12 Dedicated Sections

1. **Hero:** "Enterprise security engineered for the nation's most sensitive financial data."
2. **Security Principles:** Zero-trust architecture, minimal privilege access, and strict data isolation.
3. **SOC 2 Type II Certification:** Independent third-party audit verifying security, availability, and confidentiality.
4. **IRS Publication 1075 Standards:** Safeguarding federal tax information (FTI) with federal-grade controls.
5. **End-to-End Encryption:** AES-256 at rest, TLS 1.3 in transit, and hardware security module (HSM) key management.
6. **Zero LLM Training Charter:** We never use customer tax data, documents, or financial records to train public AI models.
7. **Cryptographic SHA-256 Audit DAG:** Immutable tamper-evident logging of every calculation and data alteration.
8. **Financial Account Security:** Tokenized read-only connections via Plaid and Finicity; zero credential storage.
9. **Role-Based Access Control (RBAC):** Strict boundaries segregating employee salaries from income tax preparers.
10. **Vulnerability Management & Bug Bounty:** Continuous third-party penetration testing and monitored bug bounty program.
11. **Regulatory & Privacy Compliance:** Full compliance with GLBA, CCPA, and GDPR data protection frameworks.
12. **Conversion CTA:** Start your secure filing experience.

---

## 14–18. Sovereign State Pages (CA, NY, NJ, IL, MA) — 11–12 Unique Sections Each

### California (`/states/california`) — 12 Unique Sections
1. **Hero:** "California State Tax Intelligence (FTB Form 540)."
2. **Overview:** Understanding California's complex multi-tier tax structure and the Franchise Tax Board.
3. **Resident Filing (Form 540):** Full-year resident tax brackets ranging from 1% to 12.3% plus 1% Mental Health Tax.
4. **Part-Year & Nonresident (Form 540NR):** California income sourcing and nonresident apportionment.
5. **Federal Conformity Differences:** Key areas where California Revenue & Taxation Code (RTC) decouples from federal law.
6. **HSA Deduction Add-Back (Cal. RTC § 17215.4):** Mandatory addition of federal HSA contributions to California income.
7. **Section 179 Depreciation Cap (Cal. RTC § 17255):** California's strict $25,000 limitation vs. the federal $1.2M+ limit.
8. **AB 5 Worker Classification Test:** The strict ABC test for independent contractors vs. employees in California.
9. **California Credits & Deductions:** California Earned Income Tax Credit (CalEITC), Young Child Tax Credit, and Renters' Credit.
10. **TaxOS Automated California Workflow:** How our rule engine calculates Form 540 and Schedule CA adjustments automatically.
11. **Licensed California Reviewers:** Specialized FTB-experienced CPAs and Enrolled Agents.
12. **California FAQ & CTA:** Specific answers regarding FTB audits, LLC $800 fees, and filing deadlines.

### New York (`/states/new-york`) — 12 Unique Sections
1. **Hero:** "New York State & City Tax Intelligence (DTF IT-201 / IT-203)."
2. **Overview:** New York State Department of Taxation and Finance statutory requirements and high tax rates.
3. **Resident Filing (Form IT-201):** New York State income tax calculations and standard deduction schedules.
4. **Nonresident & Part-Year (Form IT-203):** Apportioning New York source income for commuters and remote workers.
5. **The Convenience of the Employer Rule (20 NYCRR § 131.18):** Navigating the controversial telecommuting sourcing rule.
6. **Statutory Residency & The 183-Day Rule:** NY Tax Law § 605(b)(1)(B) audit defenses and domicile analysis.
7. **New York City Resident Tax:** Dedicated municipal income tax calculations for NYC residents.
8. **Pass-Through Entity Tax (PTET):** New York's elective entity-level tax providing federal SALT deduction workarounds.
9. **New York State Add-Backs & Subtractions:** Public employee pensions, 529 deductions, and college tuition credits.
10. **TaxOS New York Rule Pipeline:** Automated multi-jurisdiction calculation engine for NY filers.
11. **New York CPA/EA Review Network:** Deep expertise in DTF audit triggers and residency disputes.
12. **New York FAQ & CTA:** Specific answers regarding telecommuting, NYC taxes, and residency audits.

### New Jersey (`/states/new-jersey`) — 11 Unique Sections
1. **Hero:** "New Jersey State Tax Compliance (Form NJ-1040)."
2. **Overview:** Understanding the Garden State's Gross Income Tax Act (N.J.S.A. § 54A).
3. **Resident Filing (NJ-1040):** Graduated tax rates up to 10.75% and gross income reporting.
4. **Nonresident Filing (NJ-1040-NR):** Sourcing income earned within New Jersey borders.
5. **Strict No-Loss Netting Ban (N.J.S.A. § 54A:5-2):** Why business losses cannot offset wage income in New Jersey.
6. **Retirement & Pension Exclusions:** Generous exclusion thresholds for seniors and retirees.
7. **Property Tax Deductions & Credits:** Municipal property tax relief on principal residences.
8. **NY/NJ Commuter Tax Credits:** Credit for income taxes paid to other jurisdictions (Schedule NJ-COJ).
9. **TaxOS NJ Calculation Engine:** Codified rules preventing disallowed cross-category loss netting.
10. **New Jersey Licensed Tax Review:** CPAs specializing in New Jersey gross income tax peculiarities.
11. **New Jersey FAQ & CTA:** Clear guidance on commuter tax credits, property relief, and filing deadlines.

### Illinois (`/states/illinois`) — 11 Unique Sections
1. **Hero:** "Illinois State Tax Intelligence (IDOR Form IL-1040)."
2. **Overview:** Illinois Department of Revenue statutory compliance and the constitutionally mandated flat tax.
3. **Resident Filing (IL-1040):** Flat 4.95% individual income tax calculation and standard exemption allowances.
4. **Part-Year & Nonresident (Schedule NR):** Sourcing Illinois wages, business income, and lottery winnings.
5. **100% Retirement & Pension Subtraction (35 ILCS 5/203):** Complete tax exemption for IRA, 401(k), and pension distributions.
6. **Illinois Property Tax Credit (Schedule ICR):** 5% state tax credit for residential property taxes paid.
7. **Illinois K-1 Pass-Through Withholding:** Navigating pass-through entity tax credits and partnership withholdings.
8. **Education Expense Credits:** Qualified K-12 education expense credits for families.
9. **TaxOS Illinois Statutory Engine:** Automated application of the flat tax and generous retirement subtractions.
10. **Illinois Professional Review:** Enrolled Agents and CPAs authorized before the IDOR.
11. **Illinois FAQ & CTA:** Specific answers regarding pension subtractions, property tax credits, and filing dates.

### Massachusetts (`/states/massachusetts`) — 11 Unique Sections
1. **Hero:** "Massachusetts State Tax Intelligence (DOR Form 1)."
2. **Overview:** Massachusetts Department of Revenue statutory structure, categorized income, and recent surtaxes.
3. **Resident Filing (Form 1):** Part B standard income taxed at 5.0% and personal exemption schedules.
4. **Part-Year & Nonresident (Form 1-NR/PY):** Nonresident apportionment and telecommuting sourcing rules.
5. **Short-Term Capital Gains (8.5%):** Higher statutory rate on short-term capital gains vs. long-term gains.
6. **The 4% "Millionaires Tax" Surtax:** Massachusetts Fair Share Amendment surtax on taxable income exceeding $1,000,000.
7. **Paid Family & Medical Leave (PFML):** Handling employee contributions and state benefit taxability.
8. **Health Care Mandate (Schedule HC):** Mandatory health insurance coverage verification and penalty calculations.
9. **TaxOS Massachusetts Rule Pipeline:** Multi-category income allocation and surtax threshold monitoring.
10. **Massachusetts CPA Review:** Specialized Commonwealth tax experts reviewing complex returns.
11. **Massachusetts FAQ & CTA:** Detailed answers on the 4% surtax, health care penalties, and capital gains.

---

## 19. About Page (`/about`) — 8 Dedicated Sections

1. **Hero:** "Building the autonomous operating system for American taxation."
2. **The Problem:** The $400B annual friction of American tax compliance, manual error rates, and predatory software.
3. **Our Operating Principles:** Deterministic calculation, complete line-by-line lineage, and human-in-the-loop dignity.
4. **Human + AI Synergy:** Why AI should handle pre-accounting and math, while humans handle judgment and strategy.
5. **Leadership & Architecture Group:** Experienced technologists, former IRS counsel, and senior CPA leaders.
6. **Regulatory Advisory Board:** Independent oversight ensuring adherence to statutory tax authority.
7. **Ethical AI Charter:** Explicit guarantees regarding algorithmic transparency and customer data privacy.
8. **Careers & Contact:** Join our team in reimagining American tax infrastructure.
