# Autonomous Tax OS — Product Vision & Core Philosophy

> **Status**: Approved Product Baseline  
> **Document Version**: 1.0.0  
> **Target Jurisdiction**: United States Federal + Initial 5 Launch States (CA, NY, NJ, IL, MA)  
> **Primary Audience**: Engineering, Product, Design, Tax Advisory, Compliance, Legal  

---

## 1. Vision Statement

> **“Taxes that largely do themselves.”**

The traditional tax preparation model is broken. For four decades, consumer tax software has subjected taxpayers to an interrogational paradigm: an agonizing, 80-screen questionnaire disguised as an "interview." Users are forced to act as manual data-entry clerks, deciphering cryptic box numbers on paper forms, guessing at legal terminology, and translating their economic lives into IRS tax jargon.

**Autonomous Tax OS** replaces this legacy paradigm with an **autonomous, evidence-grounded agentic operating system**. 

The customer simply connects their financial accounts, payment gateways, and commerce platforms, and drops whatever documents they possess (W-2s, 1099s, bank statements, receipts, invoices, prior returns). 

From that single action, the system autonomously:
1. **Collects & Ingests** documents across disparate formats (PDF, images, CSV, spreadsheets, scans).
2. **Reads & Understands** source data using multimodal document intelligence with cryptographic hashing.
3. **Classifies & Reconciles** transactions, eliminating duplicates between 1099s, payment processors, and bank deposits.
4. **Investigates** deductions, business expenses, and credits through contextual reasoning.
5. **Retrieves Statutory Tax Law** across federal statutes (IRC), Treasury Regulations, IRS Revenue Rulings, and state tax codes.
6. **Constructs Formal Tax Positions** with complete provenance, confidence scores, and authority citations.
7. **Adversarially Challenges** its own conclusions through an internal "IRS Challenger" agent to eliminate audit risk.
8. **Collects Supporting Evidence** linking every number to real-world documentary proof.
9. **Calculates authoritatively** through deterministic, verified computation engines (never via LLMs).
10. **Prepares Federal & State Returns** with seamless multi-state allocation.
11. **Offers Optional Professional Review** (Enrolled Agent, CPA, or Tax Attorney sign-off).
12. **Files Electronically & Monitors Status** through MeF (Modernized e-File) state machines.
13. **Maintains Year-Round Tax Planning** via an active "Tax Twin" that simulates tax impacts of business decisions in real-time.

---

## 2. What Autonomous Tax OS Is NOT

To protect engineering focus and architectural purity, we explicitly declare what this platform is **NOT**:

* **NOT another tax calculator**: Calculations are deterministic and secondary to the primary challenge: financial fact reconstruction, evidence extraction, and statutory legal reasoning.
* **NOT a chatbot**: We reject the "conversational tax assistant" pattern where taxpayers must know the right questions to ask. The system operates proactively. The UI is a command center, not a chat bubble.
* **NOT an 80-question interview wizard**: We do not force users through linear questionnaires. Every question asked is an absolute last resort, triggered only by an unresolved tax fact.
* **NOT a TurboTax clone**: We do not digitize paper forms onto web screens. We build a unified financial reality graph that outputs statutory returns as an artifact.
* **NOT merely an OCR / Document Extractor**: Simple OCR extracts text strings; Autonomous Tax OS constructs verified semantic entities and links them to legal tax positions.
* **NOT simple bookkeeping software**: Bookkeeping categorizes historical spend for P&L; Tax OS evaluates statutory deductibility under IRC § 162, enforces substantiate rules under IRC § 274, applies § 179 depreciation elections, and maximizes Qualified Business Income deductions under IRC § 199A.

---

## 3. The 20 Permanent Product Commandments

These 20 principles are inviolable architectural laws. Any design, agent prompt, or code pull request that violates them will be rejected.

1. **NEVER ask users for information the system can safely retrieve itself with permission.**
2. **Every user question must exist solely because an unresolved tax fact requires it.**
3. **Minimize “Questions to File” (QTF)**: The ultimate North Star UX metric. Zero questions is the ideal.
4. **LLMs MUST NEVER perform authoritative tax calculations.** Deterministic code/APIs calculate authoritative values.
5. **Deterministic code/APIs calculate authoritative tax values.** LLMs interpret, investigate, explain, classify, and orchestrate.
6. **Every material tax number must be mathematically and evidentially provable.**
7. **Every material tax position must have**:
   * Concrete reconstructed facts
   * Supporting documentary/connected evidence
   * Explicit tax year
   * Specific jurisdiction
   * Primary statutory/administrative authority citation
   * Rule version
   * Deterministic calculation reference
   * Complete decision and challenge history
   * Confidence score
   * Professional review status.
8. **Never silently resolve contradictory documents.** Surface contradictions explicitly.
9. **Never double-count overlapping economic activity** (e.g., Stripe processor gross + 1099-K + bank deposit).
10. **Never treat generated, derived, or inferred evidence as documentary evidence.**
11. **Every material AI action must be auditable, immutable, and reproducible.**
12. **Federal and state tax logic must remain strictly modular.** State rules must never leak into federal logic.
13. **Tax-year rules must remain versioned.** A 2026 return must be 100% reproducible in 2030 using 2026 rules.
14. **Tax rules cannot exist solely inside LLM prompts.** Rules live in the versioned Tax Rule Graph.
15. **AI agents cannot modify authoritative tax rules directly.** Rule changes require human EA/CPA validation and regression testing.
16. **Tax law updates require validation and regression testing against synthetic gold suites.**
17. **Human reviewers review exceptions, not repeat AI work.** Reviewers inspect anomalies, high-risk positions, and escalated issues.
18. **Professional roles must remain strictly segregated**:
    * Taxpayer
    * Paid Tax Preparer
    * Enrolled Agent (EA)
    * Certified Public Accountant (CPA)
    * Tax Attorney
    * Operations Staff
    * Platform Administrator.
19. **Design everything as if regulators, IRS auditors, state taxing authorities, and security penetration teams will inspect it.**
20. **Tax Correctness Beats AI Impressiveness.** A mathematically and legally flawless return is our only acceptable standard.

---

## 4. Market & Initial Customer Segments

### 4.1 Geographic Scope
* **Federal**: United States Internal Revenue Code (Title 26 USC) Form 1040 ecosystem.
* **Initial Five Launch States**:
  * **California (CA)**: Franchise Tax Board (FTB Form 540) — Non-conformity on HSA (§ 223), QBI (§ 199A), depreciation (§ 179/168k).
  * **New York (NY)**: Department of Taxation and Finance (Form IT-201 / IT-203) — Convenience of the employer rule, NYC/Yonkers local taxes.
  * **New Jersey (NJ)**: Division of Taxation (Form NJ-1040) — Gross Income Tax (no federal AGI starting point), strict loss netting rules.
  * **Illinois (IL)**: Department of Revenue (Form IL-1040) — Flat tax rate, property tax credits, retirement subtraction modifications.
  * **Massachusetts (MA)**: Department of Revenue (Form 1 / 1-NR) — Tiered income (5% ordinary, 8.5% short-term capital gains, 4% surtax on >$1M).

### 4.2 Target Customer Profiles (V1)
* **B2C Segments**:
  * Independent Professionals, Freelancers, and 1099 Contractors
  * Content Creators, Influencers, and Digital Media Producers
  * Solo Consultants and Agency Founders
  * Single-Member LLC Owners (disregarded entities filing Schedule C)
  * Mixed W-2 + 1099 Earners (e.g., full-time employee with side consulting/creator business)
* **B2B Segments**:
  * Independent Solo EAs and CPAs seeking 10x capacity expansion
  * Boutique Tax and Accounting Firms (2–15 practitioners)
  * Creator Platforms and Gig Marketplaces embedding automated compliance
  * Fintechs and Business Neobanks offering integrated tax planning

---

## 5. Architectural Success Metrics

| Metric | Target (V1) | Industry Benchmark |
| :--- | :--- | :--- |
| **Questions to File (QTF)** | $\le 4$ average for 1099/Schedule C | 45–80 questions (TurboTax / H&R Block) |
| **Document Processing Speed** | $< 30$ seconds for 50-page packet | 24–48 hours manual offshore review |
| **Calculation Reproducibility** | 100% bit-exact across re-runs | Inconsistent across software updates |
| **Citation Correctness** | 100% verified against primary authority | 0% (Legacy tools don't cite authorities) |
| **Audit Exception Rate** | $< 0.1\%$ returns flagged for re-assessment | 1.8% IRS Schedule C audit rate |
| **CPA Review Time per Case** | $< 8$ minutes per standard review | 45–90 minutes manual review |
