# TaxOS Product Dashboards & Application Shells Map

**Document Version:** 3.0.0  
**Operating Standard:** Multi-Product Shell Architecture Sharing Unified API & Ledger  
**Core Isolation Principle:** Distinct experiences for Taxpayers, CPAs, Attorneys, Operations Managers, Knowledge Admins, and Super Admins.

---

## 1. Product Shell Architecture Overview

TaxOS is structured into 7 distinct product domains:

| Experience Domain | Target Domain / Subdomain | Shell Theme & Tone | Primary User Personas |
| :--- | :--- | :--- | :--- |
| **Public Experience** | `taxos.com` | Warm, calm, light sage & pine | Prospective clients, public visitors |
| **Customer Experience** | `app.taxos.com` | Trustworthy, minimalist, light surface | Individual taxpayers, small business owners |
| **Professional Experience**| `pro.taxos.com` | Dense, exception-focused, high-contrast | CPAs, Enrolled Agents, Staff Preparers |
| **Legal Experience** | `legal.taxos.com` | Formal, privileged, purple accents | Tax Attorneys, Legal Counsel |
| **Operations Experience** | `ops.taxos.com` | Cockpit, telemetry-rich, amber alerts | Tax Ops Managers, Review QA Managers |
| **Firm Admin** | `firm.taxos.com` | Enterprise SaaS, clean gray/slate | Accounting firm managing partners |
| **Platform Control** | `admin.taxos.com` | Deep dark slate, security-enforced | Platform Super Admins, Security Admins |

---

## 2. Customer Workspace Shell (`app.taxos.com`)

### Primary Navigation Tabs:
1. **Overview:** Return progress indicator (e.g., 94%), estimated federal refund/due, state balance, quick action buttons.
2. **Needs You:** Exception-driven question queue. Interactive clarification cards requiring customer input (e.g., "Confirm business travel purpose").
3. **Documents & TaxDrop:** Universal drag-and-drop vault, OCR status badges, SHA-256 verification hashes, and parsed tax forms.
4. **Tax Return (Draft):** Dynamic form preview (Form 1040, Schedule C, State Form 540) with inline "Prove This Number" drill-downs.
5. **Year-Round Planning (Tax Twin):** Interactive forward sliders, estimated quarterly tax tracker, and entity restructuring simulator.
6. **Filing Review Mode Selector:** Explicit user selection between:
   - `AI_AUTOPILOT`
   - `HUMAN_VERIFIED`
   - `FULL_SERVICE`

---

## 3. Professional Reviewer Workspace Shell (`pro.taxos.com`)

### 3.1 Case Queue Status Tabs:
- `Assigned to Me`
- `Ready for Review`
- `In Review`
- `Waiting for Customer`
- `Waiting for AI Re-run`
- `Needs Senior Review`
- `Needs Legal Counsel`
- `Approved & Signed`
- `E-Filed`
- `Deadlines Imminent`

### 3.2 Dynamic Specialist Dashboards:
1. **Federal Income Tax Reviewer:**
   - W-2/1099 wage reconciliation, Schedule C expenses, QBI deductions (§ 199A), Section 179 depreciation.
2. **State Income Tax Reviewer (Jurisdiction-Aware):**
   - Reviewer views only states where licensed (e.g., CA + NY).
   - California: Cal. RTC conformity, HSA add-back (§ 17215.4), Sec 179 $25k cap (§ 17255).
   - New York: Convenience of the employer rule (20 NYCRR § 131.18), NYC resident tax, 183-day statutory residency.
   - New Jersey: N.J.S.A. § 54A:5-2 strict loss netting prohibition, property tax credits.
   - Illinois: 35 ILCS 5/203 flat tax (4.95%), 100% pension subtraction.
   - Massachusetts: 5% flat income, 8.5% ST capital gains, 4% Fair Share surtax.
3. **Sales & Use Tax Reviewer:**
   - Wayfair economic nexus thresholds, product taxability codes, state/local rate verification, marketplace facilitator exclusions, sales tax return prep.
4. **Payroll & Employment Tax Reviewer:**
   - Quarterly Form 941 reconciliation, Form 940 FUTA, state unemployment (SUI) experience rates, deposit schedules, worker classification compliance.

---

## 4. Legal Escalation Workspace (`legal.taxos.com`)

### Core Features:
- **IRC § 7525 Confidentiality Shield:** Automatic tagging of legal opinions, workpapers, and controversy communications.
- **Worker Classification Litigation Cockpit:** In-depth AB 5 statutory defense analysis, IRS 20-factor test evaluation, independent contractor agreements.
- **Audit Penalty Defense:** Evaluation of reasonable cause defenses under IRC § 6664 to abate accuracy-related penalties (§ 6662).
- **Formal Legal Sign-Off:** Digital cryptographic seal indicating attorney concurrence.

---

## 5. Operations Cockpits (`ops.taxos.com`)

### 5.1 Tax Operations Manager Cockpit
- *Primary Question Answered:* **"Where is work stuck?"**
- **Key Telemetry Metrics:**
  - Total Active TaxCases
  - Ready for Review Backlog
  - Cases Waiting on Customer ("Needs You" queue age)
  - Cases Waiting on Reviewer
  - Imminent Deadlines (Due Today / Due This Week)
  - Agent Failure & Retry Rate
  - Questions to File Ratio (QtF = 1.1)
  - Average Turnaround Time (Intake to Transmission)
- **Manager Actions:** Reassign case queue, elevate priority, re-trigger agent pipeline.

### 5.2 Review Operations Manager (Quality & QA Cockpit)
- Reviewer team capacity and daily utilization.
- Cases reviewed by tax domain and sovereign state.
- Human override rate (how often CPAs adjust AI numbers).
- QA error sampling and accuracy scoring.
- Missed SLA alerts and reviewer accreditation tracking.

---

## 6. Administrative Portals

### 6.1 Tax Knowledge Administrator (`knowledge.taxos.com`)
- Codified statutory rule library and version history.
- Authority sources (IRC, Treasury Regulations, State Codes, Revenue Rulings).
- Citation validation test results and rule regression status.
- Strict PII barrier: Zero access to taxpayer personal identities.

### 6.2 Security Administrator (`security.taxos.com`)
- Real-time audit ledger inspection (SHA-256 chain verification).
- Active user sessions, MFA compliance rates, IP anomalies.
- Privilege escalation monitoring and PII access logs.
- Strict boundary: Cannot modify statutory tax calculation logic.

### 6.3 Platform Control Center (Super Admin — `admin.taxos.com`)
- **Primary 15-Module Navigation:**
  1. `Overview` (System health, active TaxCases, filing health, security alerts)
  2. `Platform` (Server clusters, compute latency, database shards)
  3. `Organizations` (Tenant accounts, enterprise subscriptions)
  4. `Users & RBAC` (Role allocations, permissions matrix)
  5. `Agents & Models` (Model router, agent runtime metrics, consensus engine)
  6. `Tax Rules` (Rule engine versions, statutory updates)
  7. `Filing & MeF` (IRS and state electronic filing transmission pipelines)
  8. `Integrations` (Plaid, Gusto, Stripe, IRS e-file gateways)
  9. `Models` (LLM latency, token spend, fallback routing)
  10. `Security` (MFA enforcement, encryption keys, vulnerability status)
  11. `Billing` (Stripe subscription revenue, usage metering)
  12. `Feature Flags` (Dynamic toggle controls with gradual rollouts)
  13. `Releases` (Platform deploy history, semantic versions)
  14. `Incidents` (Active alerts, post-mortems, resolution tracking)
  15. `Audit Logs` (Cryptographic ledger blocks, tamper checks)
- **Step-Up MFA Authorization:**
  - Emergency actions (e.g., `FREEZE_JURISDICTION_US_NY`, `GLOBAL_AGENT_RUNTIME_HALT`) require explicit reason logging, re-authentication, and instant audit notification.
