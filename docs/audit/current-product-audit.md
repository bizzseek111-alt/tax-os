# Comprehensive Current Product & Architecture Audit

> **Document Status**: Complete Baseline Audit  
> **Auditors**: CTO, Chief Product Officer, Principal UX Architect, U.S. Tax Technology Architect  
> **Target System**: TaxOS AI-Native Operating System  
> **Audit Date**: 2026-10-07  

---

## 1. Executive Summary

TaxOS possesses an extraordinarily capable deterministic calculation engine, multi-state tax packs (CA, NY, NJ, IL, MA), a triple-graph architecture (Tax Graph, Evidence Graph, Tax Rule Graph), cryptographic DAG provenance, and comprehensive domain services for Income Tax, Sales Tax, and Payroll Tax.

However, **its current presentation resembles an internal developer testing harness and demonstration control panel rather than a coherent commercial tax operating system**. 

A single monolithic page (`App.tsx`) exposes internal role pickers, simulation buttons, and disconnected multi-domain tabs directly to users. A production product must cleanly partition the user experience into four distinct layers:
1. **Public Marketing Website** (Visitor conversion, trust, pricing, educational authority)
2. **Smart Onboarding & Intake** (Progressive factual elicitation, TaxDrop, instant TaxCase construction)
3. **Private Taxpayer Workspaces** (Clean, outcome-oriented, exception-based)
4. **Professional & Operational Workspaces** (CPA/EA Review Briefs, Attorney Controversy, Operations, Firm Admin, Platform Super Admin)

Behind these layers sits the unified **AI + Human Tax Operating System**.

---

## 2. Route & Dashboard Inventory

### Current State
Currently, the application runs on a single URL (`/`) with an in-memory string enum switcher (`ExperienceMode` and `multiDomainTab`) managed inside `src/App.tsx`. There is no persistent browser routing, no URL history, and no deep linking for cases or public pages.

```
Current Switcher Modes in App.tsx:
├── B2C_TAXPAYER              -> src/components/ux/B2CTaxpayerView.tsx
├── YEAR_ROUND_PLANNING       -> src/components/ux/YearRoundPlanningView.tsx
├── TAX_PRO_CPA               -> src/components/ux/TaxProfessionalView.tsx
├── TAX_ATTORNEY              -> src/components/ux/TaxAttorneyView.tsx
├── OPS_MANAGER               -> src/components/ux/OperationsManagerView.tsx
├── CUSTOMER_SUPPORT          -> src/components/ux/CustomerSupportView.tsx
├── B2B_FIRM_ADMIN            -> src/components/ux/B2BAdminView.tsx
├── PARTNER_EMBEDDED          -> src/components/ux/PartnerEmbeddedView.tsx
├── SUPER_ADMIN               -> src/components/ux/SuperAdminView.tsx
├── MARKETING_LANDING         -> src/components/ux/MarketingLandingView.tsx
└── MULTI_DOMAIN_ENGINE       -> Subtabs: OVERVIEW, INCOME_TAX, SALES_TAX, PAYROLL_TAX, COMPLIANCE_OPS, GRAPH, SECURITY
```

---

## 3. Component & UI Architecture Audit

| Component | Current Location | Key Capabilities | Audit Classification | Architectural Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `MarketingLandingView.tsx` | `src/components/ux/` | Headline carousel, B2C/B2B toggle, comparison matrix table. | **REBUILD / EXPAND** | Expand into full multi-page public website (`/`, `/how-it-works`, `/individuals`, `/self-employed`, `/business`, `/tax-professionals`, `/pricing`, `/security`, `/states/*`, `/sales-tax`, `/payroll-tax`). |
| `OnboardingModal.tsx` | `src/components/ux/` | 4-step modal asking for name, states, profile, prior year PDF. | **REBUILD / MOVE** | Replace popup modal with dedicated Smart Start Flow (`/start`) featuring situation cards, progressive disclosure, and live TaxCase builder. |
| `B2CTaxpayerView.tsx` | `src/components/ux/` | Hero readiness banner (92%), refund/due figures, lineage summaries, AI assistant prompt. | **MERGE / IMPROVE** | Transform into the unified Taxpayer Private Workspace with standard navigation: Overview, Needs You, Documents, Tax Return, Planning. |
| `TaxInboxCardQueue.tsx` | `src/components/ux/` | Interactive exception question cards (Delta flight, home office, missing 1099-B). | **KEEP / MERGE** | Core of the **Needs You** tab in Taxpayer Workspace. Connect to canonical `TaxTask` system. |
| `TaxDropZone.tsx` | `src/components/ux/` | Drag-and-drop document intake, live OCR stages, deduplication log, hash verification. | **KEEP / IMPROVE** | Redesign copy around "Give us everything. Don't organize it." Embed into Onboarding and Documents tab. |
| `ProveThisNumberModal.tsx` | `src/components/ux/` | DAG provenance modal, statutory citations, transaction receipt breakdown. | **KEEP / FLAGSHIP** | Elevate to flagship interaction accessible anywhere a calculated tax number appears. Plain English first with toggle for statutory details. |
| `YearRoundPlanningView.tsx` | `src/components/ux/` | Tax Twin scenario simulations, Section 179 sliders, quarterly vouchers. | **MERGE / MOVE** | Move into Taxpayer Workspace under **Planning** tab and embed into Business Workspace. |
| `TaxProfessionalView.tsx` | `src/components/ux/` | CPA triage queue, AI Review Brief, exception overrides, PTIN sign-off. | **IMPROVE / MOVE** | Anchor of `/pro/cpa` workspace. Connect to unified `TaxTask` queue and real TaxCase state. |
| `TaxAttorneyView.tsx` | `src/components/ux/` | Statutory clash workbench (NY convenience vs NJ credit), Form 8275 generator. | **IMPROVE / MOVE** | Anchor of `/pro/attorney` workspace for legal escalations only. |
| `OperationsManagerView.tsx`| `src/components/ux/` | Pod capacity, Questions to File (QtF) tracking, SLA risk, supervisor PIN unmasking. | **IMPROVE / MOVE** | Anchor of `/ops` workspace. Shift focus to "Where is work stuck?". |
| `CustomerSupportView.tsx`  | `src/components/ux/` | Support ticket queue, PII masked view, escalation actions. | **MERGE / MOVE** | Merge with Operations / Support workspace. |
| `B2BAdminView.tsx`         | `src/components/ux/` | Firm profile, team permissions, review policies, billing. | **IMPROVE / MOVE** | Anchor of `/firm` workspace. |
| `PartnerEmbeddedView.tsx`  | `src/components/ux/` | API credentials, webhooks, white-label configs. | **MERGE / MOVE** | Move into Firm Admin / Developer integrations section. |
| `SuperAdminView.tsx`       | `src/components/ux/` | Telemetry, emergency kill switches, five-state rule releases. | **REBUILD / MOVE** | Move to dedicated internal route `/admin` with industrial control-center styling. |
| `Header.tsx`               | `src/components/` | Contains global role dropdown, tier dropdown, tenant switchers. | **REMOVE (PROD) / MOVE (DEV)** | Remove from production screens. Demote to a subtle, floating Dev/Test Tools bar visible only when dev mode is toggled. |

---

## 4. Data Architecture & TaxCase Model Audit

### Strengths
1. `src/types/taxCase.ts` and `src/models/TaxGraph.ts` establish formal types for Income, Sales, and Payroll cases.
2. Cross-domain wage linking (`line8WageDeductionLink`) ensures payroll wages feed Schedule C / 1120-S line 8 without exposing individual employee compensation to income tax preparers.
3. Cryptographic evidence graph linking ensures every fact has a content-addressed storage (CAS) SHA-256 hash.

### Deficiencies to Rectify
1. **Physical Hierarchy Anti-Pattern**: Do not organize database/object models by `State -> Tax -> Person`. Multi-state earners have one person with multiple state obligations.
   - **Corrected Standard**:
     $$\text{Organization} \longrightarrow \text{Person / Business} \longrightarrow \text{TaxCase} \longrightarrow \text{TaxObligations} \longrightarrow \text{Jurisdictions} \longrightarrow \text{Tasks / Evidence / Decisions / Filing}$$
2. **Missing Canonical Task Routing Unit**: While `openIssueIds` exists, there is no canonical `TaxTask` entity connecting AI agents to human specialists (Taxpayer, CPA, EA, Attorney, Operations).
3. **Internal vs. External Language Confusion**: User-facing copy currently displays engineering terminology ("Zero-Hallucination Provenance", "Live CAS Pipeline", "Continuous Digital Twin Shadow").

---

## 5. Authorization & Permissions Audit

### Current Strengths
`src/services/EntitlementsGuard.ts` and `src/types/security.ts` contain strict field masking (`maskSSN`, `maskCompensation`), permission matrices (`payroll:read_pii`, `payroll:read_compensation`), and tenant entitlements.

### Security Deficiencies
1. Role selection in `Header.tsx` allows any user in the browser to switch from `CLIENT_OWNER` to `ATTORNEY_LEGAL_COUNSEL` or `SUPER_ADMIN` with an unauthenticated `<select>` dropdown.
2. Production users must be routed **automatically** based on authenticated session claims, organization membership, and professional credentials.
3. Developer/tester simulation mode must be isolated behind an explicit dev-environment toggle.

---

## 6. Actionable Master Reorganization Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│ MASTER AUDIT CLASSIFICATION SUMMARY                                    │
├────────────────────────────────────────────────────────────────────────┤
│ [KEEP]     Deterministic Math Engines, Tri-Graph models, Prove Lineage │
│ [IMPROVE]  TaxDrop (drag-and-drop live states), Tax Inbox, AI Brief    │
│ [MOVE]     All specialized cockpits behind role-resolved URLs          │
│ [MERGE]    B2C Taxpayer View + Planning into unified Taxpayer Space    │
│ [REMOVE]   Production exposure of role/tier switcher in Header         │
│ [REBUILD]  Full Public Website (20+ routes) + Smart Start Intake Flow  │
│ [ADD]      Canonical TaxTask routing engine & Auth-based auto-router   │
└────────────────────────────────────────────────────────────────────────┘
```
