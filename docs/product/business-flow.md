# TaxOS — Business, Sales Tax, Payroll & Operations Flows

> **Document Status**: Production Product Standard  
> **Target Experiences**: Business Owners, Sales Tax Specialists, Payroll Admins, Operations Managers, Firm Admins, Super Admins  

---

## 1. Unified Business Tax Compliance Workspace (`/app/business`)

For small businesses, single-member LLCs, S-Corporations, and multi-state enterprises.

### Command Center Navigation:
1. **Overview**: Multi-domain compliance score, upcoming deadlines across all domains, integrated cash liability.
2. **Income Tax (1120-S / 1065 / Schedule C)**: Gross profit, ordinary business deductions, Section 179 asset expensing, K-1 allocations.
3. **Sales & Use Tax**: Multi-tier nexus monitoring, transaction sourcing, resale certificates, state return filings.
4. **Payroll & Employment**: Employee directory, W-2/1099 classification, deposit schedules, Form 941 quarterly status.
5. **Registrations & Corporate Filings**: Secretary of State annual reports, state withholding IDs, FinCEN BOI filings.

---

## 2. Autonomous Sales & Use Tax Workspace

Dedicated specialist interface for multi-jurisdiction sales tax compliance:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SALES TAX DASHBOARD                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ Active Jurisdictions: 14 states (58 local taxing districts)            │
│ Potential Nexus Approaching: 2 states (Washington: 84%, Texas: 91%)    │
│ Next Filing: California CDTFA-401 (Due April 30, 2027)                 │
├────────────────────────────────────────────────────────────────────────┤
│ Gross Sales: $450,000.00          Tax Collected: $26,125.00            │
│ Marketplace Tax (Amazon): $14,250 Net Direct Remittance: $11,875.00    │
├────────────────────────────────────────────────────────────────────────┤
│ [Reconcile Transactions]  [Manage Resale Certs]  [Generate State Return]│
└────────────────────────────────────────────────────────────────────────┘
```

* **Nexus Engine**: Real-time sales and transaction counts tracking rolling 12-month and calendar-year statutory thresholds.
* **Exemption & Resale Vault**: Automated validation of resale certificates (California CDTFA-230, New York ST-120).
* **Marketplace Facilitator Reconciliation**: Automatically deducts marketplace-remitted sales from merchant liabilities.

---

## 3. Autonomous Payroll & Employment Tax Workspace

Dedicated workspace for employer compliance with strict PII access controls:

* **Executive Metrics**:
  * Total Headcount (W-2 Employees vs. 1099 Contractors)
  * Federal Deposit Schedule: **Semi-Weekly** (Lookback period > $50,000)
  * Form 941 Quarterly Status: **Reconciled ($0.00 Variance)**
  * Next Statutory Deposit: **$14,280 due in 3 business days**
* **Worker Classification Guard**:
  * Scans contractor compensation under California AB 5 / ABC Test and DOL common-law standards.
  * Alerts before payment issuance if a worker shows high misclassification risk.
* **PII & Compensation Quarantine**:
  * Employee SSNs and individual pay amounts are quarantined behind the `payroll:read_pii` permission.
  * Only aggregated total wage expense is exposed to the corporate income tax preparation module.

---

## 4. Tax Operations Manager Cockpit (`/app/ops`)

The central nervous system for tax practice leaders and operations managers.

### Core Guiding Question:
> *“Where is work stuck right now?”*

### Real-Time Fleet Telemetry:
* **Total Active Cases**: 142 cases across 3 preparer pods.
* **Where Work is Stuck**:
  * 🟡 Waiting on Taxpayer Needs You Response: 18 cases
  * 🔵 Waiting on CPA Exception Sign-Off: 9 cases
  * 🟣 Waiting on Attorney Conflict Review: 2 cases
  * 🔴 Agent Discrepancy / Anomaly Flagged: 1 case
  * 🟢 Ready for MeF E-File Transmission: 44 cases
* **Key Operational Metrics**:
  * **Questions to File (QtF)**: Current fleet average **1.20 items** (Target: $\le 3.0$ items).
  * **SLA Breach Risk**: **0%** (All cases progressing within 4-hour review window).
  * **CPA Review Latency**: **7.2 minutes per case**.
  * **Agent Override Rate**: **1.8%** of AI deduction proposals adjusted by human preparers.
* **Supervisor PIN Unmasking**:
  * Allows authorized operations supervisors to temporarily unmask client PII with an explicit business justification and mandatory WORM audit logging.

---

## 5. B2B Firm Administrator Workspace (`/app/firm`)

Firm-level practice management:
* **Firm Profile & Multi-Office Locations**
* **Team Roster & Professional Credentials (PTIN, CPA License #, Bar #)**
* **Client Portfolio & Entity Hierarchy**
* **Review Policies & Risk Tolerance Presets** (e.g. require dual CPA sign-off on returns with Schedule C expenses exceeding $100k)
* **Billing, Seat Licenses & Usage Analytics**
* **White-Label Branding & Client Portal Customization**
* **Developer API Keys & Webhook Registrations**

---

## 6. Platform Super Admin Control Center (`/admin`)

Internal platform infrastructure governance (restricted to core system administrators):

### Industrial Sections:
1. **PLATFORM TELEMETRY**: Global QPS, calculation engine response time, PostgreSQL RLS latency.
2. **AGENT SUPERVISOR**: Autonomous agent status, execution budgets, loop detection, and token consumption.
3. **TAX KNOWLEDGE GRAPH**: Active statutory rule packs (Federal + 5 States), pending rule updates, synthetic regression suite passes.
4. **FILING INFRASTRUCTURE**: IRS MeF A2A transmitter status, State DOR gateway queues, ACK/REJ receipt stream.
5. **SECURITY & KMS**: Key rotation schedules, field tokenization vaults, access anomaly alerts.
6. **ORGANIZATIONS & TENANTS**: B2B firm provisioning, tier quotas, and database partitions.
7. **RELEASES & HOTFIXES**: Rule release versioning (v2026.Q1), dry-run testing, canary deployments.
8. **EMERGENCY KILL SWITCHES**:
   * Master Autonomous Filing Kill Switch
   * Form 8995 QBI Auto-Claim Kill Switch
   * State DOR Direct Remittance Kill Switch
   *(Engaging any kill switch requires dual-admin authorization and recorded audit rationale).*
