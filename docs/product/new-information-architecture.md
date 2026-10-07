# TaxOS — New Information Architecture Specification

> **Document Status**: Production Product Standard  
> **Authors**: Chief Product Officer, Principal UX Architect, CTO  
> **Target Audience**: Product Engineering, UX/UI Designers, Tax Operations  

---

## 1. The Four-Layer Operating Model

TaxOS structures the user experience into four customer-facing layers with one shared operational backbone:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: PUBLIC WEBSITE                         │
│   Marketing • Solutions • Authority Packs • Pricing • Resources       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ "Start My Taxes" / "Sign In"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    LAYER 2: SMART ONBOARDING / INTAKE                  │
│   Who filing for? • Year • States • Situation Cards • TaxDrop • Link  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Authenticated Role Resolution
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYER 3: PRIVATE TAX WORKSPACES                      │
│   Taxpayer Workspace (B2C) • Business Compliance Workspace (B2B)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exception Escalation & Triage
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 4: PROFESSIONAL & OPERATIONAL WORKSPACES             │
│   CPA/EA Review • Tax Attorney • Operations Manager • Firm Admin       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             LAYER 5: AI + HUMAN TAX OPERATING SYSTEM (CORE)            │
│   Deterministic Calculation Engine • Canonical TaxTask Router          │
│   Tax Graph • Evidence Graph • Tax Rule Graph • Audit Ledger (WORM)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Information Architecture Principles

1. **Hide Internal Architecture from Consumers**: Consumers see outcomes, financial impact, and clear actionable cards. They never see raw graph nodes, agent consensus logs, or internal state machine codes.
2. **Deterministic Role Resolution**: Production routing is 100% automatic based on verified login credentials, assigned firm organization, and professional credentials.
3. **Progressive Disclosure**: Plain English explanations first; technical statutory citations (`26 U.S.C. § 162`, `Cal. RTC § 17215.4`) are available on demand behind "View Tax Rule" or inside professional views.
4. **Single Source of Truth**: AI agents and human specialists act upon the **exact same TaxCase aggregate**. Case state is never duplicated into separate "AI" and "human" databases.

---

## 3. Structural Hierarchy & Database Routing Standard

```
Organization (Firm, Platform Partner, or Direct Consumer Tenant)
    │
    ▼
Person / Business Entity (Taxpayer Profile, EIN, FEIN, SSN Token Vault)
    │
    ▼
TaxCase (Canonical Engagement Aggregate: Year, Entity, Master Lifecycle)
    │
    ├── IncomeTaxCase (Annual Federal Form 1040/1120-S & Multi-State Returns)
    ├── SalesTaxObligations[] (Monthly/Quarterly Jurisdictional Returns & Nexus)
    ├── PayrollTaxObligations[] (Deposit Schedules, Form 941, Form 940, W-2/W-3)
    │
    ▼
Jurisdictions (Federal, Sovereign States, Counties, Cities, Special Districts)
    │
    ▼
Tasks, Evidence & Decision DAGs (Canonical TaxTasks, Hashes, Form Lines, Audit Log)
```

Jurisdiction serves strictly as **routing and authorization metadata**, never as the physical parent of a taxpayer.
