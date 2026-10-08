# Phase 5 — Tax Intelligence Agents Catalogue & Specifications

## 1. Executive Summary

Autonomous Tax OS Phase 5 deploys 36 specialized, executable TypeScript tax agents. Each agent possesses bounded capabilities, strict permission scopes, explicit statutory citations, and validated output schemas.

---

## 2. Agent Catalogue by Domain

### 2.1 Ingestion, Discovery & Intake Agents
1. **IntakeAgent** (`INTAKE_AGENT`):
   - *Statutory Scope*: Taxpayer identification, filing status validation under IRC § 1 and § 2.
   - *Role*: Analyzes uploaded initial questionnaire, prior year returns, and documents to construct the preliminary tax case topology.
2. **PriorReturnAgent** (`PRIOR_RETURN_AGENT`):
   - *Statutory Scope*: Form 1040 prior-year consistency, carryovers (Capital Loss IRC § 1212, NOL IRC § 172).
   - *Role*: Extracts prior-year baseline data, depreciation schedules, and historical state tax filings.
3. **MissingDocumentAgent** (`MISSING_DOCUMENT_AGENT`):
   - *Statutory Scope*: Third-party information reporting (IRC § 6041, § 6050W).
   - *Role*: Compares known income streams (e.g. Schedule C 1099-K indicators, bank accounts) against uploaded forms to pinpoint missing W-2, 1099, or 1098 documents.

### 2.2 Income Intelligence & Reconciliation Agents
4. **IncomeReconstructionAgent** (`INCOME_RECONSTRUCTION_AGENT`):
   - *Statutory Scope*: Gross income definition (IRC § 61).
   - *Role*: Reconstructs self-employment and business gross receipts from bank deposits, 1099s, and invoices.
5. **DuplicateIncomeAgent** (`DUPLICATE_INCOME_AGENT`):
   - *Statutory Scope*: Duplicate reporting prevention.
   - *Role*: Cross-checks 1099-NEC vs 1099-K vs bank deposits to prevent double-counting income from merchant processors.

### 2.3 Transaction & Merchant Intelligence Agents
6. **MerchantIntelligenceAgent** (`MERCHANT_INTELLIGENCE_AGENT`):
   - *Scope*: Entity resolution.
   - *Role*: Maps noisy credit card descriptors (e.g., `AMZN MKTP US*2K34`) to canonical business entities (`Amazon`) and queries organizational memory.
7. **TransactionClassificationAgent** (`TRANSACTION_CLASSIFICATION_AGENT`):
   - *Scope*: Financial categorization.
   - *Role*: Classifies debit transactions into expense candidate categories (Software, Office Supplies, Travel, Personal).
8. **ReceiptMatchingAgent** (`RECEIPT_MATCHING_AGENT`):
   - *Statutory Scope*: Substantiation requirements under IRC § 274(d) and IRC § 6001.
   - *Role*: Pairs raw bank debit lines with uploaded receipt documents and builds Evidence Graph links.
9. **SpendInvestigator** (`SPEND_INVESTIGATOR`):
   - *Scope*: Anomaly & out-of-pattern expense detection.
   - *Role*: Scrutinizes large, irregular transactions requiring business justification.

### 2.4 Deduction & Business Purpose Intelligence Agents
10. **BusinessPurposeAgent** (`BUSINESS_PURPOSE_AGENT`):
    - *Statutory Scope*: IRC § 162 (Ordinary and necessary business expenses) vs IRC § 262 (Personal, living, or family expenses).
    - *Role*: Tests expenses against statutory ordinary/necessary standards and flags dual-use personal items.
11. **DeductionHunter** (`DEDUCTION_HUNTER`):
    - *Statutory Scope*: Schedule C deductions, IRC § 162, § 179, § 195 (Startup costs).
    - *Role*: Proposes valid tax positions for allowable business write-offs with statutory citations.
12. **CreditHunter** (`CREDIT_HUNTER`):
    - *Statutory Scope*: Nonrefundable and refundable tax credits (Child Tax Credit IRC § 24, EITC IRC § 32, Clean Vehicle Credit IRC § 30D).
    - *Role*: Identifies eligible personal and business tax credits based on validated case facts.
13. **HomeOfficeAgent** (`HOME_OFFICE_AGENT`):
    - *Statutory Scope*: IRC § 280A (Disallowance of certain expenses in connection with business use of the home).
    - *Role*: Evaluates the exclusive and regular use test, calculating simplified vs actual square-footage deduction methods.
14. **VehicleMileageAgent** (`VEHICLE_MILEAGE_AGENT`):
    - *Statutory Scope*: IRC § 274(d) strict substantiation requirements and Rev. Proc. standard mileage rates.
    - *Role*: Validates contemporaneous mileage logs and compares standard mileage vs actual expense methods.
15. **TravelAgent** (`TRAVEL_AGENT`):
    - *Statutory Scope*: IRC § 162(a)(2) travel expenses and IRC § 274(n) 50% meal limitation.
    - *Role*: Distinguishes non-deductible commuting from legitimate business travel and enforces statutory meal caps.
16. **AssetAgent** (`ASSET_AGENT`):
    - *Statutory Scope*: IRC § 179 direct expensing, IRC § 168(k) bonus depreciation, and Treas. Reg. § 1.263(a)-1(f) De Minimis Safe Harbor.
    - *Role*: Evaluates capitalization vs expensing thresholds ($2,500 de minimis book safe harbor) and generates asset records.
17. **InvestmentAgent** (`INVESTMENT_AGENT`):
    - *Statutory Scope*: IRC § 1221 (Capital assets), IRC § 1091 (Loss from wash sales).
    - *Role*: Processes 1099-B brokerage statements, adjusts cost basis for disallowed wash sales, and computes capital gains.

### 2.5 Tax Research & Authority
18. **TaxResearchAgent** (`TAX_RESEARCH_AGENT`):
    - *Scope*: Statutory RAG & legal authority retrieval.
    - *Role*: Interrogates the Phase 4 Tax Authority Engine for relevant IRC sections, Treasury Regulations, and judicial rulings.

### 2.6 Deterministic Calculation Agents
19. **FederalTaxAgent** (`FEDERAL_TAX_AGENT`):
    - *Scope*: Deterministic Form 1040 calculation engine execution.
20. **CaliforniaTaxAgent** (`CALIFORNIA_TAX_AGENT`):
    - *Scope*: CA Form 540, CRTC § 17041 tax rates, CRTC § 17043 Mental Health Surtax, CRTC § 17215.4 HSA add-back.
21. **NewYorkTaxAgent** (`NEW_YORK_TAX_AGENT`):
    - *Scope*: NY Form IT-201, NY Tax Law Art. 22 rates, NYC resident tax surcharge, and household credit.
22. **NewJerseyTaxAgent** (`NEW_JERSEY_TAX_AGENT`):
    - *Scope*: NJ Form NJ-1040, Gross Income Tax statutory categories, and NJ property tax deduction.
23. **IllinoisTaxAgent** (`ILLINOIS_TAX_AGENT`):
    - *Scope*: IL Form IL-1040, 4.95% statutory flat rate, retirement exemption, and property tax credit.
24. **MassachusettsTaxAgent** (`MASSACHUSETTS_TAX_AGENT`):
    - *Scope*: MA Form 1, Chapter 62 Part B income, and Fair Share Amendment 4% surtax on income over $1,000,000.

### 2.7 Multi-Jurisdiction & Conformity
25. **ResidencyAgent** (`RESIDENCY_AGENT`):
    - *Scope*: Domicile vs statutory residency (e.g. 183-day physical presence rules).
26. **MultiStateAllocationAgent** (`MULTI_STATE_ALLOCATION_AGENT`):
    - *Scope*: Wage and Schedule C sourcing, other-state tax credit (OSTC) cross-crediting.
27. **ConformityAgent** (`CONFORMITY_AGENT`):
    - *Scope*: State decoupling adjustments (Bonus depreciation add-back, Sec 199A QBI decoupling).
28. **OptimizerAgent** (`OPTIMIZER_AGENT`):
    - *Scope*: Strategic forward-looking tax opportunities (SEP-IRA, Solo 401(k), HSA contribution limits).

### 2.8 Adversarial Verification & Audit Defense
29. **IrsChallengerAgent** (`IRS_CHALLENGER_AGENT`):
    - *Scope*: Adversarial audit scrutiny, IRS Audit Technique Guides (ATG), hobby loss rules (IRC § 183).
30. **EvidenceExaminer** (`EVIDENCE_EXAMINER`):
    - *Scope*: 5-tier evidence grading (T1 Third-Party > T2 Bank Statement > T3 Vendor Invoice > T4 Log > T5 Self-Certification).
31. **ReconciliationAgent** (`RECONCILIATION_AGENT`):
    - *Scope*: Mathematical balance consistency between source facts, Schedule C, and Form 1040 lines.
32. **CrossYearAgent** (`CROSS_YEAR_AGENT`):
    - *Scope*: Year-over-year variances, missed deductions, and tax bracket changes.
33. **AnomalyAgent** (`ANOMALY_AGENT`):
    - *Scope*: Outlier fact detection compared to industry NAICS code averages.

### 2.9 Routing, Briefing & Orchestration
34. **QuestionReductionAgent** (`QUESTION_REDUCTION_AGENT`):
    - *Scope*: Minimizes taxpayer friction by reducing Questions to File from 100+ down to < 5 high-impact questions.
35. **HumanEscalationRouter** (`HUMAN_ESCALATION_ROUTER`):
    - *Scope*: Routes unresolved conflicts to credentialed professionals (CPA, EA, Attorney, Bookkeeper).
36. **ProfessionalReviewBriefAgent** (`PROFESSIONAL_REVIEW_BRIEF_AGENT`):
    - *Scope*: Compiles executive review dossiers for CPAs with key positions, dissenting opinions, and audit trail refs.
