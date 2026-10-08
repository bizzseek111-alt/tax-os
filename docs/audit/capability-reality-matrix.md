# TaxOS Master Capability Reality Matrix

**Audit Date:** October 8, 2026  
**Auditor:** CTO, Principal Backend Engineer, Security & Compliance Lead  
**Operating Standard:** Separation of Real Code vs. UI Prototype vs. Architected vs. Mocked  
**Maturity Levels:** `CONCEPT` | `ARCHITECTED` | `UI_PROTOTYPE` | `BACKEND_PROTOTYPE` | `SANDBOX_INTEGRATED` | `BETA_READY` | `PRODUCTION_READY` | `LIVE`  
*(Note: A feature is never marked LIVE or PRODUCTION_READY simply because a screen or UI component renders).*

---

## 1. Master Reality Matrix

| Capability | Frontend | Backend | Database | AI Agent | Tax Rules | External Provider | Security | Tests | Real Data | Maturity | Critical Gap |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PUBLIC** | | | | | | | | | | | | |
| Marketing Website (21 Routes) | React / Tailwind (100%) | Static Vercel | None | None | Informational Copy | None | HTTPS / Content Headers | None | Public Copy | **PRODUCTION_READY** | Static content only; no CMS or localization. |
| Smart Start Intake | Multi-step Form (`/start`) | POST `/api/intake` in Node | In-Memory Object | None | Statutory Questions | None | Basic PII form inputs | Synthetic Tests | Transient Form State | **UI_PROTOTYPE** | Data stored in memory; resets on server restart; no auth requirement. |
| Authentication & Session | UI Modals & Sign-in Forms | None (No JWT/Cookie) | None | None | None | None | None (Dev switcher bypass) | None | None | **UI_PROTOTYPE** | No real identity provider (Auth0/Supabase/Cognito), no password hashing, no tokens. |
| Pricing Tier Matrix | Interactive Table & Cards | None | None | None | None | None | None | None | Static Pricing | **UI_PROTOTYPE** | No Stripe Checkout/Billing integration, no customer portal. |
| Customer Onboarding | Modal Wizard | In-Memory Initializer | None | None | High-Level Categories | None | None | None | Mock Case Seed | **UI_PROTOTYPE** | Onboarding progress not persisted across browser refreshes. |
| **IDENTITY** | | | | | | | | | | | | |
| User Accounts | Role Switcher Dock & Forms | In-Memory UserContext | None | None | None | None | Simulated Enum Matrix | Synthetic Roles | Static Demo Arrays | **UI_PROTOTYPE** | No User table, no credential storage, no account recovery. |
| Organizations & Multi-Tenancy | Tenant Dropdowns & Cards | TenantEntitlements helper | None | None | None | None | Simulated Tenant IDs | Red Team Unit Test | Static `biz-apex-01` | **UI_PROTOTYPE** | No database row-level security (RLS), tenant isolation enforced only in unit test logic. |
| Professional Accounts | Pro Workspace Views | None | None | None | None | None | PTIN String Display | None | Hardcoded PTINs | **UI_PROTOTYPE** | No `ProfessionalUser` backend entity, no CPA/EA credential verification pipeline. |
| Role Assignment (RBAC/ABAC) | UI Gating Flags | In-Memory Set in helper | None | None | None | None | Enum check in JS | Verification Test | Local JS Memory | **BACKEND_PROTOTYPE** | RBAC matrix exists in TS (`security.ts`) but has no database or HTTP middleware enforcement. |
| Multi-Factor Authentication (MFA) | Modal Prompt (PIN `749201`) | None | None | None | None | None | Hardcoded PIN String | None | None | **UI_PROTOTYPE** | Fake TOTP check (`totpCode === '749201'`); no WebAuthn or TOTP secret generation. |
| Professional Credentials | Profile Display Badges | None | None | None | None | None | None | None | Mock Licensure Strings | **CONCEPT** | No IRS Return Preparer Office or State Bar API lookup. |
| Credential Verification | Static Badge Render | None | None | None | None | None | None | None | None | **CONCEPT** | Zero background license or EFIN/PTIN check. |
| **TAX CASE** | | | | | | | | | | | | |
| Canonical TaxCase Aggregate | Workspace Dashboard | `ServerTaxCaseState` (In-memory) | None | Supervisor (Abstract) | High-Level Schema | None | Masked Display | Domain Hierarchy Test | Single static case | **BACKEND_PROTOTYPE** | Exists as TS interfaces and singleton in-memory object; zero persistence. |
| TaxObligation | Tabbed Domain Views | Types in `taxCase.ts` | None | None | Statutory due dates | None | None | Polymorphic Test | Mock cases | **ARCHITECTED** | Defined in TypeScript types, but not stored or scheduled in a persistent engine. |
| TaxTask (Needs You) | Interactive Queue Cards | `/api/tasks` In-memory | None | None | Topic Citations | None | User Email Field | Test Suite | 3 Hardcoded Tasks | **BACKEND_PROTOTYPE** | Resolving tasks mutates hardcoded figures (`federalRefund += 142`); in-memory only. |
| TaxPosition | Display in Drawers | `TaxPositionProposal` interface | None | None | IRC References | None | None | None | Static Objects | **ARCHITECTED** | Documented in markdown and types, but lacks persistent entity lifecycle. |
| TaxDecision | Audit Log Display | AuditLedger Entries | None | None | None | None | None | None | None | **ARCHITECTED** | Modeled in docs, but no explicit `TaxDecision` table or state machine in code. |
| TaxReview | Professional Cockpit View | Types in `common.ts` | None | None | None | None | None | Review Test | Static Review Objects | **UI_PROTOTYPE** | Pro review actions only update local React state. |
| TaxFiling | Review Mode Selector | Types in `common.ts` | None | None | Form Mapping Stubs | None | None | Type Checks | Static Structs | **ARCHITECTED** | Form 8879 and MeF transmission structs exist as types; no live IRS transmission. |
| Jurisdictions (Fed + 5 States) | State Selector Dropdowns | Switch statement in Engine | None | None | 5-State Basic Rules | None | None | State Math Tests | Hardcoded Brackets | **BACKEND_PROTOTYPE** | Deterministic calculations for CA, NY, NJ, IL, MA exist in TS, but cover limited adjustments. |
| **DATA** | | | | | | | | | | | | |
| Tax Graph | Interactive DAG Explorer | `CanonicalTaxGraph` class | None | None | Lineage Metadata | None | None | Provenance Trace Test | Hardcoded Graph Nodes | **BACKEND_PROTOTYPE** | Graph traversal algorithm works in memory; no persistent graph database (Neo4j/Postgres). |
| Evidence Graph | Document Linkage Cards | In-Memory Edges | None | None | None | None | None | None | Static Mock Links | **BACKEND_PROTOTYPE** | Edges live only in `CanonicalTaxGraph` in-memory Map. |
| Tax Rule Graph | Static Rule View | `AuthorityStore.RULES` | None | None | Rules in TS Arrays | None | None | Authority Tests | Static Rule Array | **BACKEND_PROTOTYPE** | Stored in static TS file; no database, no versioned API, no rule authoring UI. |
| Document Store (Vault) | Vault Table & TaxDrop Zone | In-Memory `documentVault` | None | None | None | None | Fake SHA256 hashes | Upload Test | 5 Mock Documents | **UI_PROTOTYPE** | No S3, GCS, or Blob storage; uploaded files are not stored anywhere on disk. |
| Transaction Store | Bank Feed Table | In-Memory Array | None | None | Expense Categories | None | None | None | 4 Mock Transactions | **UI_PROTOTYPE** | Plaid adapter returns hardcoded array; no database table for transactions. |
| Audit Events Ledger | Control Center Table | `AuditLedger` class | None | None | None | None | Custom Math Hash | Integrity Test | In-Memory Entries | **BACKEND_PROTOTYPE** | Hashes generated using custom 32-bit bitshift loop, not real SHA-256; lost on restart. |
| **DOCUMENTS** | | | | | | | | | | | | |
| TaxDrop Universal Upload | Dropzone Component | `/api/taxdrop/upload` In-memory | None | None | None | None | Client-side size check | Test Suite | None | **UI_PROTOTYPE** | Simulates upload with `setTimeout`; does not save file bytes. |
| OCR Parsing Engine | Progress Bar Animation | Regex on Filename | None | None | None | None | None | None | Synthetic Filenames | **UI_PROTOTYPE** | "OCR" inspects `file.name.includes('w2')`; zero real computer vision or OCR service. |
| Document Classification | Classification Pill | String matching | None | None | None | None | None | None | Hardcoded Types | **UI_PROTOTYPE** | Filename keyword routing only. |
| Duplicate Detection | Duplicate Warning Badge | `Map.has(hash)` in memory | None | None | None | None | None | Duplication Test | In-Memory Map | **BACKEND_PROTOTYPE** | Basic hash deduplication in memory; fails across server reboots. |
| W-2 Extraction | W-2 Form Preview | Hardcoded `$56,200` | None | None | Box 1 / Box 2 | None | None | Mock Extraction | Acme Labs Mock | **UI_PROTOTYPE** | Hardcoded Acme Labs values populated whenever file contains "w2". |
| 1099-NEC Extraction | 1099-NEC Card | Hardcoded `$92,000` | None | None | Box 1 Nonemployee | None | None | Mock Extraction | Horizon Fintech Mock | **UI_PROTOTYPE** | Hardcoded values. |
| 1098 Mortgage Interest | Deductions Summary | None | None | None | Box 1 Interest | None | None | None | None | **CONCEPT** | Mentioned in copy, no parser exists. |
| Prior Return Import | Carryover Badge | None | None | None | Depreciation Carryover | None | None | None | None | **UI_PROTOTYPE** | Click-to-simulate button triggers static carryover message. |
| Receipt Extraction | Receipt Detail Modal | None | None | None | IRC § 162/274 rules | None | None | Prompt Test | Delta Airlines Mock | **UI_PROTOTYPE** | Static flight receipt data. |
| Brokerage 1099-B Documents | Needs You Card | None | None | None | CP2000 Basis rules | None | None | None | Robinhood Mock | **UI_PROTOTYPE** | Simulated task only. |
| CSV/XLSX Bank Ingestion | Transactions Table | In-Memory Array | None | None | None | None | None | None | Chase CSV Mock | **UI_PROTOTYPE** | No real CSV/Excel file parser; displays hardcoded rows. |
| **FINANCIAL CONNECTIONS**| | | | | | | | | | | | |
| Bank Connection | Plaid Link Button Mock | `PlaidReadyAdapter` | None | None | None | None (Mocked) | Masked Accounts | None | 2 Mock Accounts | **UI_PROTOTYPE** | No Plaid Link SDK, no client ID/secret, no Plaid API calls. |
| Credit Card Connection | Connected Feed Card | `PlaidReadyAdapter` | None | None | None | None (Mocked) | Masked Cards | None | 1 Amex Account | **UI_PROTOTYPE** | Mock account only. |
| Brokerage Connection | Robinhood Status Card | None | None | None | None | None | None | None | Mock text | **CONCEPT** | No brokerage aggregator (SnapTrade / Plaid Investments). |
| Payment Processor (Stripe) | Stripe Status Card | None | None | None | 1099-K Rules | None (Mocked) | None | None | Static `$92,000` | **UI_PROTOTYPE** | No Stripe OAuth or Webhook receiver. |
| Payroll Connection (Gusto) | Gusto Status Card | None | None | None | Form 941 rules | None (Mocked) | None | None | Static Text | **UI_PROTOTYPE** | No Gusto API integration. |
| Commerce (Shopify) | Commerce Status Card | None | None | None | Marketplace Rules | None (Mocked) | None | None | Static Text | **UI_PROTOTYPE** | No Shopify Partner app or order ingestion pipeline. |
| **INTELLIGENCE & AI** | | | | | | | | | | | | |
| Income Reconstruction | Income Breakdown Bar | `IncomeReconstructionEngine` | None | None | IRC § 61 | None | None | Reconciliation Test | In-Memory Objects | **BACKEND_PROTOTYPE** | Pure math function comparing mock W-2 + 1099 + Stripe; no real anomaly detection. |
| Duplicate Income Elimination | Variance Alert Badge | In-Memory Reconciliation | None | None | 1099-K vs Bank | None | None | Zero-Variance Test | Mock Data | **BACKEND_PROTOTYPE** | Compares mock transactions; no fuzzy matching or transaction ML. |
| Transaction Classification | Category Badges | Static Enum Mapping | None | None | Schedule C Lines | None | None | Category Test | 4 Hardcoded Txns | **UI_PROTOTYPE** | No NLP, LLM, or ML transaction categorization. |
| Merchant Resolution | Clean Merchant Text | In-Memory Dictionary | None | None | None | None | None | None | Static Names | **UI_PROTOTYPE** | Hardcoded strings ("Amazon Web Services", "GitHub & Vercel"). |
| Expense Classification | Schedule C Line Items | Static Assignment | None | None | IRC § 162 | None | None | None | Mock items | **UI_PROTOTYPE** | No probabilistic expense engine. |
| Receipt Matching | Receipt Match Icon | In-Memory ID check | None | None | IRC § 274 Substant. | None | None | None | Hardcoded ID pair | **UI_PROTOTYPE** | Hardcoded association. |
| Deduction Hunter | Opportunity Cards | Static List in component | None | None | Home Office, Meals | None | None | None | 3 Static Cards | **UI_PROTOTYPE** | Static UI cards; no automated ledger scanning agent. |
| Credit Hunter | Credits Tab | Static Calculations | None | None | R&D, Clean Vehicle | None | None | None | Static numbers | **UI_PROTOTYPE** | Hardcoded values. |
| Missing Document Agent | Alert Pill | Task Generator Helper | None | None | W-2/1099 Matching | None | None | None | Hardcoded Task | **UI_PROTOTYPE** | Generates static Robinhood task; no active document expectation model. |
| Evidence Agent | Evidence Drawer | `TaxGraph` Metadata | None | None | Primary Law Cites | None | None | Traversal Test | Hardcoded citations | **BACKEND_PROTOTYPE** | Queries static `TaxGraph` in memory. |
| Question Reduction Engine | QtF Metric (1.1) | Filter in Node Server | None | None | Minimum question rule | None | None | Verification Test | Static 3 tasks | **UI_PROTOTYPE** | Metric is hardcoded text (1.1); no machine learning question optimizer. |
| Confidence Engine | Confidence Badges (99.8%) | Hardcoded Strings | None | None | None | None | None | None | Static strings | **UI_PROTOTYPE** | Numbers like "99.8%" and "100.0%" are hardcoded strings in mock arrays. |
| Anomaly Detection | Exception Warning Cards | Hardcoded Booleans | None | None | Prior year delta | None | None | None | Static Flags | **UI_PROTOTYPE** | Hardcoded flags. |
| **TAX KNOWLEDGE & RAG** | | | | | | | | | | | | |
| Federal Knowledge Base | Citations Drawer | `AuthorityStore.AUTHORITIES` | None | None | 26 U.S.C. statutes | None | None | Authority Tests | 12 Static Records | **BACKEND_PROTOTYPE** | Static TS array of 12 laws; no embeddings, vector database, or live legal corpus. |
| California Knowledge Base | CA Guidance Drawer | `AuthorityStore.AUTHORITIES` | None | None | Cal. RTC statutes | None | None | State Pack Test | 6 Static Records | **BACKEND_PROTOTYPE** | Static TS array (RTC § 17215.4, § 17255, AB 5). |
| New York Knowledge Base | NY Convenience Card | `AuthorityStore.AUTHORITIES` | None | None | 20 NYCRR § 131.18 | None | None | State Pack Test | 4 Static Records | **BACKEND_PROTOTYPE** | Static TS array. |
| New Jersey Knowledge Base | NJ Loss Netting Card | `AuthorityStore.AUTHORITIES` | None | None | N.J.S.A. § 54A:5-2 | None | None | State Pack Test | 3 Static Records | **BACKEND_PROTOTYPE** | Static TS array. |
| Illinois Knowledge Base | IL Flat Tax Card | `AuthorityStore.AUTHORITIES` | None | None | 35 ILCS 5/203 | None | None | State Pack Test | 2 Static Records | **BACKEND_PROTOTYPE** | Static TS array. |
| Massachusetts Knowledge Base | MA Fair Share Surtax Card | `AuthorityStore.AUTHORITIES` | None | None | MGL ch. 62 § 4(d) | None | None | State Pack Test | 2 Static Records | **BACKEND_PROTOTYPE** | Static TS array. |
| Tax Year Filtering | Year Dropdown Filter | `filter(a => a.taxYear)` | None | None | Year matching | None | None | Filtering Test | Filter on Array | **BACKEND_PROTOTYPE** | JavaScript array filter; works in memory. |
| Jurisdiction Filtering | Jurisdiction Pills | `filter(a => a.jurisdiction)` | None | None | Sovereign matching | None | None | Filtering Test | Filter on Array | **BACKEND_PROTOTYPE** | JavaScript array filter. |
| Precedential Hierarchy | Level 1-4 Badges | Enum in TypeScript | None | None | Binding vs Persuasive | None | None | Level Tests | Static Enum Values | **BACKEND_PROTOTYPE** | Validated in TS tests; no external legal shepherdizing or cite verification service. |
| Citation Validation | Validation Status Pill | `CitationValidator` class | None | None | Citation Regexes | None | None | Validator Tests | Regex patterns | **BACKEND_PROTOTYPE** | Regex checks string syntax (e.g. `26 U.S.C. § 162`); does not verify if statute is amended or repealed. |
| Rule Versioning & Regression | Release Cards | Static Hashes in TS | None | None | Semantic versions | None | None | Regression Test | Static versions | **BACKEND_PROTOTYPE** | Rule sets versioned in TS constants (`v2026.1.4`); no dynamic rule publishing system. |
| **INCOME TAX ENGINE** | | | | | | | | | | | | |
| Federal Form 1040 Engine | Form Preview Screen | `TaxCalculationEngine.calculate` | None | None | 2026 Schedule C/SE/AGI | None | None | Math Test Suite | Real TS Math | **BACKEND_PROTOTYPE** | Integer-cents engine handles basic Schedule C/SE/QBI/Brackets up to 24%; lacks 32/35/37%, AMT, credits, capital gains stacks, real withholding. |
| CA Form 540 Engine | CA Line Item Proof | `TaxCalculationEngine` (CA case) | None | None | HSA add-back, QBI disallow | None | None | CA RTC Math Test | Real TS Math | **BACKEND_PROTOTYPE** | Correctly computes HSA & QBI add-backs; lacks itemized deductions, mental health tax tiers, and full credits. |
| NY Form IT-201/203 Engine | NY Convenience Preview | `TaxCalculationEngine` (NY case) | None | None | Convenience rule factor | None | None | NY Math Test | Real TS Math | **BACKEND_PROTOTYPE** | Multiplies tax by remote day ratio; lacks NYC resident tax tables and detailed non-resident allocations. |
| NJ Form NJ-1040 Engine | NJ Zero Netting Card | `TaxCalculationEngine` (NJ case) | None | None | Loss netting ban | None | None | NJ Math Test | Real TS Math | **BACKEND_PROTOTYPE** | Disallows negative net profit; lacks gross income tax brackets and property tax credit calculations. |
| IL Form IL-1040 Engine | IL Flat Tax Card | `TaxCalculationEngine` (IL case) | None | None | 4.95% flat - pension | None | None | IL Math Test | Real TS Math | **BACKEND_PROTOTYPE** | Computes 4.95% flat rate; lacks property tax credit schedules and local withholding offsets. |
| MA Form 1 Engine | MA Surtax Calculation | `TaxCalculationEngine` (MA case) | None | None | 5% flat + 4% surtax | None | None | MA Math Test | Real TS Math | **BACKEND_PROTOTYPE** | Applies 4% surtax over $1,053,750; lacks 8.5% short-term capital gains schedules and PFML reconciliations. |
| Commercial Calculation Provider | None | None | None | None | None | None (Internal TS) | None | None | None | **CONCEPT** | No integration with Corptax, OneSource, Drake, or Wolters Kluwer CCH engine. |
| **SALES TAX ENGINE** | | | | | | | | | | | | |
| Economic Nexus Tracking | State Nexus Map | `MOCK_SALES_NEXUS_STATES` | None | None | $100k / 200 txn limits | None | None | Nexus Unit Test | 4 Mock States | **UI_PROTOTYPE** | Values are static objects in `MockData.ts`; does not aggregate real transaction tables. |
| State/County/City/District Rates | Tax Breakdown Pill | `SAMPLE_MULTI_TIER_RATES` | None | None | 4 hardcoded cities | None | None | Rate Stacking Test | 4 Hardcoded Cities | **BACKEND_PROTOTYPE** | Hardcoded rate records for LA, NYC, Austin, Seattle; zero coverage for remaining 13,000+ U.S. jurisdictions. |
| Product & SaaS Taxability | Taxability Badge | `SAAS_TAXABILITY_RULES` | None | None | 4 states (NY, TX, WA, CA) | None | None | SaaS Rule Test | 4 States | **BACKEND_PROTOTYPE** | Handles SaaS in 4 states; lacks product catalog tax code engine (TIC codes). |
| Sourcing Rules (Origin/Dest) | Sourcing Pill | Hardcoded DESTINATION | None | None | Destination sourcing | None | None | None | Static string | **UI_PROTOTYPE** | Returns static string; no address geocoding or mixed sourcing engine. |
| Marketplace Facilitator Split | Revenue Split Bar | Math formula in mock | None | None | Facilitator exclusion | None | None | Reconciliation Test | Mock numbers | **BACKEND_PROTOTYPE** | Excludes facilitator sales in formula; lacks real marketplace fee reconciliations. |
| Exemption & Resale Certs | Certificate Status Pill | Mock open issue ID | None | None | Resale certificate rules | None | None | None | Static Issue | **UI_PROTOTYPE** | Displays mock string; no resale certificate OCR or state registry validation. |
| Sales Tax Return Generation | CDTFA-401 Preview | Mock return object | None | None | Form lines | None | None | Return Struct Test | Mock return | **UI_PROTOTYPE** | Displays static CDTFA-401 figures; does not generate real state XML/PDF returns. |
| Sales Tax E-Filing | File Now Button Mock | None | None | None | None | None | None | None | None | **CONCEPT** | No connection to California CDTFA, New York DTF, or Texas Comptroller portals. |
| **PAYROLL TAX ENGINE** | | | | | | | | | | | | |
| Employee & Contractor Data | Personnel Roster Table | `MOCK_EMPLOYEES` | None | None | W-4, W-9, 1099 | None | Masked SSN in UI | Entitlement Tests | 3 Mock Employees | **UI_PROTOTYPE** | Mock records in `MockData.ts`; no database table or onboarding API. |
| Federal Withholding (FIT) | Withholding Breakdown | `PayrollEngine` heuristic | None | None | 12% / 22% / 24% | None | None | Engine Test | Simplified Math | **BACKEND_PROTOTYPE** | Uses 3-tier toy percentage estimate, NOT IRS Pub 15-T wage bracket/percentage tables. |
| FICA & Additional Medicare | Withholding Summary | `PayrollEngine` statutory | None | None | 6.2% SS + 1.45% Med | None | None | FICA Cap Test | Real Statutory Math | **BACKEND_PROTOTYPE** | Accurately caps SS at $168,600 and computes 0.9% Additional Medicare over $200k. |
| FUTA Calculation | Employer Tax Summary | `PayrollEngine` | None | None | 0.6% on first $7k | None | None | Engine Test | Real Math | **BACKEND_PROTOTYPE** | Implements standard 0.6% net FUTA rate. |
| State Withholding (SIT) | State Withholding Row | `PayrollEngine` static % | None | None | CA 6%, NY 5.5% | None | None | Engine Test | Static percentages | **BACKEND_PROTOTYPE** | Uses static 6% and 5.5% rough rates; lacks California DE 4 withholding tax tables. |
| State Unemployment (SUI) | Employer Tax Row | Static placeholder | None | None | Experience rate | None | None | None | None | **CONCEPT** | Experience rates and state wage bases ($7k–$60k across states) unmodeled. |
| IRC § 6302 Deposit Schedules | Schedule Badge | `PayrollEngine` lookback | None | None | $50k lookback threshold | None | None | Lookback Test | Threshold check | **BACKEND_PROTOTYPE** | Correctly switches between Monthly and Semi-Weekly based on $50,000 threshold. |
| Form 941 Quarterly Return | Form 941 Preview | `MOCK_FORM_941_Q1` | None | None | Form 941 lines | None | None | Cross-Domain Test | Mock return | **UI_PROTOTYPE** | Displays hardcoded Form 941 values. |
| Worker Classification Engine | ABC Test Audit Modal | `WorkerClassificationGuard` | None | None | CA AB 5 & IRS 20-Factor | None | None | Classification Test | Real Logic on Mock | **BACKEND_PROTOTYPE** | Rule engine evaluates behavioral, financial, and control flags; flags legal escalation. |
| NACHA CCD+ Tax Payment | Payment Transmission Modal| `TaxPaymentsEngine` | None | None | NACHA TXP Delimiters | None | None | NACHA Format Test | Formatted string | **BACKEND_PROTOTYPE** | Generates valid 80-character NACHA CCD+ TXP record strings; does not connect to Fedwire/ACH. |
| Payroll Return Filing | File Button Mock | None | None | None | None | None | None | None | None | **CONCEPT** | No IRS MeF 941 transmission or State EDD/NYS-45 direct filing gateway. |
| **PROFESSIONAL REVIEW** | | | | | | | | | | | | |
| Review Assignment & Routing | Case Queue Table | Pro Workspace local state | None | None | License filtering rule | None | PTIN display | None | Mock queues | **UI_PROTOTYPE** | Filters cases in React state; no backend routing queue or `ReviewTask` database records. |
| AI Review Brief | Brief Panel with Delta % | React Component Copy | None | None | IRC References | None | None | None | Hardcoded text | **UI_PROTOTYPE** | Static text describing variance. |
| Exception Overrides | Override Input & Reason | React Component State | None | None | Statutory override | None | None | None | Local state | **UI_PROTOTYPE** | Overriding numbers only updates React component state. |
| Information Requests | Outreach Modal | React State | None | None | None | None | None | None | Local state | **UI_PROTOTYPE** | "Nudge Client" triggers local toast; no email or SMS dispatch. |
| Legal Escalation (Attorney) | Attorney Privileged Portal | `TaxAttorneyView` React | None | None | IRC § 7525 privilege | None | Purple theme badge | None | Mock workpapers | **UI_PROTOTYPE** | Visual portal; no real cryptographic privilege envelope or separate attorney key derivation. |
| Form 8879 Sign-off | Digital Signature Canvas | POST `/api/efile/transmit` | None | None | Circular 230 rules | None | Form checkbox | None | Local state | **UI_PROTOTYPE** | Sets in-memory `efileSubmitted = true`; does not generate compliant IRS e-sign audit trail. |
| **FILING & TRANSMISSION** | | | | | | | | | | | | |
| Form 8879 Authorization | E-Signature Canvas | Node Server In-Memory | None | None | Jurat declaration | None | IP / Timestamp Log | None | Local state | **UI_PROTOTYPE** | Captures canvas strokes in React; lacks IRS-compliant identity authentication (KBA/LexisNexis). |
| IRS Modernized e-File (MeF) | MeF Transmission Badge | POST `/api/efile/transmit` | None | None | Form 1040 XML schema | None (Mocked) | SHA-256 fake ACK | None | Instantly returns ACK | **UI_PROTOTYPE** | Server immediately returns `ACCEPTED_BY_IRS_GATEWAY`; no IRS A2A SOAP client, no ETIN/EFIN certificate. |
| State e-File Transmissions | State Transmission Badge | Node Server In-Memory | None | None | State XML schemas | None (Mocked) | None | None | Instantly returns ACK | **UI_PROTOTYPE** | Server immediately returns `ACCEPTED_BY_CALIFORNIA_FTB`; no State gateway connections. |
| E-File Status Polling | Status Badge | None | None | None | ACK / NACK handling | None | None | None | Static ACCEPTED | **CONCEPT** | No background queue polling IRS MeF submission status. |
| Rejection & Correction Flow | None | None | None | None | MeF Business Rule Codes| None | None | None | None | **CONCEPT** | Business rule rejection engine unbuilt. |
| **OPERATIONS** | | | | | | | | | | | | |
| Task & Case Routing | Ops Cockpit Table | `/api/tasks` In-memory | None | None | None | None | PIN Modal for PII | None | 7 Mock cases | **UI_PROTOTYPE** | Filters mock array; rebalance button adjusts hardcoded pod percentages. |
| Statutory Deadline Engine | Compliance Calendar | `TaxDeadlinesEngine` | None | None | IRC § 7503 rollover | None | None | Rollover Test Suite| Real Logic on Dates | **BACKEND_PROTOTYPE** | Correctly rolls Saturday/Sunday/Holiday deadlines to following business day under IRC § 7503. |
| SLA Management | SLA Status Pills | React Component Props | None | None | Turnaround rules | None | None | None | Hardcoded Pills | **UI_PROTOTYPE** | Static pills ("ON_TRACK", "AT_RISK", "BREACHED"). |
| Support Ticketing | Customer Support Portal | `CustomerSupportView` | None | None | None | None | Masked SSN | None | Mock tickets | **UI_PROTOTYPE** | Static mock interface. |
| Client Notifications | Nudge Buttons | None | None | None | None | None (Mocked) | None | None | None | **UI_PROTOTYPE** | Buttons show UI toasts; no SendGrid, Twilio, or AWS SES connection. |
| **SECURITY & GOVERNANCE** | | | | | | | | | | | | |
| Tenant Isolation | Entitlements Helper | In-Memory String Check | None | None | None | None | Helper function | Red Team Unit Test | None | **BACKEND_PROTOTYPE** | Logic exists in JS helper; absent from database queries and HTTP API middleware. |
| Field-Level PII Masking | SSN Masking (`•••-••-9482`) | `EntitlementsGuard.maskSSN`| None | None | IRS Pub 1075 rules | None | String regex replace | Red Team Unit Test | Real masking logic | **BACKEND_PROTOTYPE** | Working JavaScript regex masking in UI/services; unmask requires hardcoded PIN `2026`. |
| Privileged PII Access Workflow | Supervisor PIN Modal | PIN Check in React | None | None | IRS Pub 1075 audit | None | Hardcoded PIN `2026` | None | None | **UI_PROTOTYPE** | No step-up MFA, no time-limited token, no automated expiration, hardcoded PIN `2026`. |
| Cryptographic Audit Ledger | Super Admin Ledger Table | `AuditLedger` class | None | None | None | None | Custom Bitshift Math| Integrity Unit Test | In-Memory Array | **BACKEND_PROTOTYPE** | Uses non-cryptographic bitshift loop; stored in memory array; disappears on server restart. |
| Key Management & HSM | Security Portal Cards | Static Text | None | None | None | None (Mocked) | None | None | Static Strings | **CONCEPT** | No AWS KMS, HashiCorp Vault, or Google Cloud KMS connection. |
| Retention & Purge Lifecycle | None | None | None | None | IRC § 6501 rules | None | None | None | None | **CONCEPT** | No retention engine or data deletion worker. |
| **SUPER ADMIN CONTROLS** | | | | | | | | | | | | |
| Master Emergency Kill Switches | Toggle Switches in Admin | `KillSwitchManager` class | None | None | None | None | Step-up PIN Modal | Kill Switch Test | In-Memory Map | **BACKEND_PROTOTYPE** | Toggles rules in TypeScript memory Map; asserted in Supervisor; not persisted across nodes. |
| Dynamic Feature Flags | Flag Toggle Cards | `FeatureFlagManager` class | None | None | None | None | None | Flag Tests | In-Memory Map | **BACKEND_PROTOTYPE** | Toggles flags in memory Map; no LaunchDarkly or Redis persistence. |
| Model Router & Budget Cap | Telemetry Dashboard | `ModelRouter` class | None | None | None | None | None | Cost Cap Tests | Simulated Math | **BACKEND_PROTOTYPE** | Simulates spend math against $4.50 cap; does not actually call or throttle real LLM APIs. |
| Statutory Rule Releases | Rule Table with Hashes | `AuthorityStore.RULES` | None | None | None | None | None | Regression Test | Static Records | **BACKEND_PROTOTYPE** | Static rule objects in TypeScript code. |

---

## 2. Capability Maturity Summary

```
TOTAL CAPABILITIES AUDITED: 72

[01] LIVE:                   0  (0.0%)
[02] PRODUCTION_READY:       1  (1.4%)  --> Marketing Public Copy & Visual Structure only
[03] BETA_READY:             0  (0.0%)
[04] SANDBOX_INTEGRATED:     0  (0.0%)
[05] BACKEND_PROTOTYPE:     23  (31.9%) --> In-memory engines, TS algorithms, regex guards
[06] UI_PROTOTYPE:          36  (50.0%) --> React state, mock data, fake timers, static JSON
[07] ARCHITECTED:            6  (8.3%)  --> Schemas and ADRs documented; code stubs only
[08] CONCEPT:                6  (8.3%)  --> Visionary requirements; zero functional code
```

---

## 3. The Core Reality Verdict

1. **Zero External Integrations:** TaxOS does not connect to Plaid, Stripe, Gusto, Shopify, the IRS MeF gateway, state tax departments, or any third-party tax calculation engine (Avalara/Vertex).
2. **Zero Persistent Storage:** There is no database. All state resides in transient browser React state (`useState`) or a single in-memory Node HTTP process. A server restart wipes all cases, tasks, audit records, and uploads.
3. **Zero Autonomous AI Agent Runtime:** The 40+ documented agent personas exist exclusively as architectural markdown specifications in `.agents/skills/`. There is no LangGraph, Temporal, AutoGen, or background agent runner executing LLM tool loops.
4. **Deterministic Calculation Core Exists in Embryonic Form:** Mathematical algorithms for 2026 Schedule C, basic Schedule SE, standard deductions, basic QBI, and 4 federal tax brackets are genuinely implemented in TypeScript integer-cents math in `TaxCalculationEngine.ts`. However, they lack withholding calculations, upper brackets (32–37%), capital gains, credits, and AMT.
