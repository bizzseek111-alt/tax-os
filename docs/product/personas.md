# Autonomous Tax OS — Comprehensive Persona Directory

> **Status**: Approved Product Baseline  
> **Document Version**: 1.0.0  
> **Coverage**: B2C Taxpayers, B2B Professionals, Internal Operations, Legal & Administration  

---

## 1. B2C Taxpayer Personas

### Persona 1: Maya Lin — The Digital Creator & Multi-Platform Freelancer
* **Demographics**: 29 years old, Brooklyn, NY. Single.
* **Economic Reality**:
  * Income sources: YouTube ad revenue via Google AdSense (1099-NEC), Brand sponsorships via Stripe invoicing, Affiliate income via Impact Radius / Amazon Associates, Patreon subscriptions (1099-K).
  * Annual Gross: $165,000 across 4 platforms.
  * Expenses: Camera gear, software subscriptions (Adobe, Epidemic Sound, Notion), home studio space, travel to conferences (VidCon in CA), contractor editor on Upwork.
* **Pain Points & Anxieties**:
  * Terrified of double-counting Stripe deposits and 1099-K statements.
  * Uncertain how to legally deduct home studio under IRC § 280A vs. NY state strict requirements.
  * Constantly misses estimated quarterly payments and pays IRS § 6654 penalties.
  * Hates traditional tax software that asks 60 irrelevant questions about child care and farming.
* **TaxOS Value Proposition**:
  * Connects Stripe and bank accounts once.
  * TaxOS detects overlapping 1099-K and bank deposit records, reconciling them automatically with zero manual entry.
  * Solicits only 2 clarifying facts via Tax Inbox to unlock $14,200 in valid business deductions.

---

### Persona 2: Marcus Vance — The Mixed W-2 Software Engineer & Solo Consultant
* **Demographics**: 36 years old, Austin, TX (previously San Francisco, CA during tax year). Married, filing jointly.
* **Economic Reality**:
  * Primary: $195,000 W-2 salary as senior software engineer at tech firm.
  * Secondary: $65,000 1099-NEC consulting for AI startups.
  * Multi-State Complexity: Relocated from San Francisco to Austin on August 15.
* **Pain Points & Anxieties**:
  * Part-year residency allocation between California FTB and Texas (no state income tax).
  * California Franchise Tax Board aggressively claims tax on out-of-state consulting income earned after moving.
  * Fear of underwithholding due to high W-2 salary pushing 1099 income into the 35% federal bracket + self-employment tax (IRC § 1401).
* **TaxOS Value Proposition**:
  * Automated residency period reconstruction using transaction geo-timestamps.
  * Strict statutory allocation between CA Schedule CA (540NR) and federal return.
  * Safe-harbor estimated tax payment planning calculated for upcoming year.

---

### Persona 3: Elena Rodriguez — Single-Member LLC Agency Owner
* **Demographics**: 42 years old, Chicago, IL. Single mother, 1 dependent child (age 10).
* **Economic Reality**:
  * Entity: Disregarded Single-Member LLC registered in Illinois.
  * Gross Billings: $240,000.
  * Expenses: Subcontractor developers ($85,000 reported on 1099-NECs issued), office co-working space, health insurance premiums, business travel.
* **Pain Points & Anxieties**:
  * Needs to optimize Qualified Business Income (QBI) deduction under IRC § 199A.
  * Self-employed health insurance deduction coordination under IRC § 162(l).
  * Child Tax Credit phase-out tracking under IRC § 24.
  * Demands professional reassurance that her return is audit-proof.
* **TaxOS Value Proposition**:
  * Auto-reconciliation of contractor 1099-NEC filings against general ledger payouts.
  * One-click CPA verification review (Mode 2) provides EA/CPA signed workpapers without leaving the platform.

---

## 2. B2B Professional Personas

### Persona 4: Sarah Jenkins, CPA — Solo Practice Owner
* **Firm**: Jenkins Tax Advisory (Dallas, TX).
* **Workload**: 220 individual and Schedule C returns during filing season. Working 75-hour weeks from Feb 1 to Apr 15.
* **Pain Points & Anxieties**:
  * 60% of her billable time is wasted on client document chasing, manual data entry, and basic receipt categorization.
  * Cannot take on new clients without hiring full-time staff, which is unaffordable.
  * Client document disorganization leads to filing extensions and frantic last-minute revisions.
* **TaxOS Value Proposition**:
  * AI Review Brief surfaces pre-audited workpapers and exceptions in 5 minutes.
  * She reviews flagged anomalies, verifies statutory citations, and signs off on 3x more returns with zero manual data entry.

---

### Persona 5: David Chen — Managing Partner, Mid-Market Accounting Firm
* **Firm**: Apex Tax Partners (Chicago, IL; 12 CPAs, 4 EAs, 6 Junior Preparers).
* **Workload**: 1,800 returns annually across individual, high-net-worth, and small business clients.
* **Pain Points & Anxieties**:
  * Inconsistent work quality among junior preparers.
  * Lack of real-time visibility into filing season backlog, SLA bottlenecks, and rejection rates.
  * High risk of junior staff applying outdated state rules or hallucinated citations.
* **TaxOS Value Proposition**:
  * Centralized Operations Manager Cockpit with real-time SLA and exception tracking.
  * Role-based access control preventing junior staff from modifying authoritative rules or filing unreviewed returns.
  * Automated peer-review and second-signoff workflows for high-risk positions.

---

## 3. Internal Operational & Regulatory Personas

### Persona 6: Raymond Cross — Platform Tax Operations Manager
* **Role**: Internal Tax Operations Lead at Autonomous Tax OS.
* **Responsibilities**:
  * Monitors the national filing pipeline, MeF transmission queues, and state agency gateway health.
  * Balances review workloads across on-demand network of credentialed CPAs and EAs.
  * Investigates e-file transmission rejections (e.g., IRS MeF reject code `IND-031-04` for prior-year AGI mismatch).
* **Access & Permissions**:
  * Sees aggregate operational queues, latency metrics, SLA warnings, and anonymized case statuses.
  * **Zero PII Access**: SSNs, bank account numbers, and addresses are masked by default unless an explicit elevated diagnostic session is approved with audit logging.

---

### Persona 7: Katherine Ross, Esq. — Senior Tax Controversy Attorney
* **Role**: Senior Legal & Regulatory Counsel.
* **Responsibilities**:
  * Handles Mode 4 escalations: IRS audit notices (CP2000, CP504), formal statutory conflicts, and tax fraud alerts.
  * Validates new tax law interpretation packages for ambiguous state conformity statutes.
* **Access & Permissions**:
  * Privileged Legal Workspace with attorney-client confidentiality markings.
  * Full access to factual timeline, primary authority citations, evidence hashes, and auditor correspondence logs.

---

### Persona 8: Platform Super Administrator
* **Role**: Infrastructure & Security Lead.
* **Responsibilities**:
  * Tenant provisioning, API key management, model endpoint configuration, feature flags, and emergency kill switches.
  * Security incident response and audit log forensics.
* **Access & Permissions**:
  * Strict MFA, short-lived session tokens, hardware security key (FIDO2) requirement.
  * Cannot view unmasked taxpayer PII without dual-authorization ("two-person rule") and cryptographic audit recording.
