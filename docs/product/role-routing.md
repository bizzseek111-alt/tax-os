# TaxOS — Role Resolution & Production Routing Specification

> **Document Status**: Production Routing Baseline  
> **Rule #1 Enforcement**: Developer role switchers are strictly forbidden in production.  
> **Pattern**: Authenticated Session Claims $\rightarrow$ Role Resolution Engine $\rightarrow$ Automatic Workspace Route  

---

## 1. The Production Role Resolution Engine

When a user accesses TaxOS or authenticates via `/signin` or `/start`, the client evaluates their cryptographically signed JWT session claims to determine their destination workspace:

```
PUBLIC WEBSITE (/) or DIRECT LOGIN (/signin)
    │
    ▼
SIGN UP / LOGIN (WebAuthn / Passkey / Magic Link)
    │
    ▼
ROLE RESOLUTION ENGINE (Evaluates identity, credentials, tenant entitlements)
    │
    ├── TAXPAYER / CLIENT OWNER
    │      ↓
    │   Taxpayer Workspace (/app/taxpayer)
    │      ├── Overview
    │      ├── Needs You
    │      ├── Documents & TaxDrop
    │      ├── Tax Return (Lines & "Prove This Number")
    │      └── Planning (Tax Twin)
    │
    ├── CPA / ENROLLED AGENT (EA)
    │      ↓
    │   Professional Workspace (/app/pro)
    │      ├── Case Queue (Ready, Blocked, Due Soon)
    │      ├── AI Review Brief (11 Exception Categories)
    │      ├── Exception Overrides & Workpapers
    │      ├── Client Requests
    │      └── PTIN E-File Sign-off
    │
    ├── TAX ATTORNEY
    │      ↓
    │   Legal Escalation Workspace (/app/attorney)
    │      ├── Authority Clashes & Convenience Rules
    │      ├── Worker Classification Defense
    │      ├── Form 8275 Disclosures
    │      └── Privileged Case Files
    │
    ├── OPERATIONS MANAGER / LEAD
    │      ↓
    │   Operations Dashboard (/app/ops)
    │      ├── Workload & Stuck Cases
    │      ├── Questions to File (QtF) Telemetry
    │      ├── Pod Balancing
    │      └── Supervisor PIN Unmasking
    │
    ├── FIRM ADMIN
    │      ↓
    │   Firm Administrator Workspace (/app/firm)
    │      ├── Team Roster & Credentials
    │      ├── Client Portfolio
    │      └── Review Policies & Billing
    │
    └── SUPER ADMIN
           ↓
        Platform Control Center (/admin)
           ├── Platform Telemetry & Agent Budgets
           ├── Tax Knowledge Graph Rule Releases
           └── Emergency Kill Switches
```

---

## 2. Role Resolution Logic Matrix

```typescript
export function resolveUserDestination(user: UserContext, organization?: OrganizationContext): string {
  // 1. Internal Super Admin
  if (user.role === 'SUPER_ADMIN' || user.permissions.has('platform:super_admin')) {
    return '/admin';
  }

  // 2. Firm Management
  if (user.role === 'FIRM_ADMIN' || user.permissions.has('firm:manage')) {
    return '/app/firm';
  }

  // 3. Operations & Support Management
  if (user.role === 'OPERATIONS_MANAGER' || user.role === 'CFO_FINANCE_DIRECTOR') {
    return '/app/ops';
  }

  // 4. Legal Controversy Counsel
  if (user.role === 'ATTORNEY_LEGAL_COUNSEL') {
    return '/app/attorney';
  }

  // 5. Professional Reviewers (CPA / EA / Preparer)
  if (user.role === 'EXTERNAL_CPA_REVIEWER' || user.role === 'INCOME_TAX_PREPARER') {
    return '/app/pro';
  }

  // 6. Specialist Roles (Sales Tax / Payroll)
  if (user.role === 'SALES_TAX_SPECIALIST') {
    return '/app/business?tab=SALES_TAX';
  }
  if (user.role === 'PAYROLL_ADMIN') {
    return '/app/business?tab=PAYROLL_TAX';
  }

  // 7. Business Entities (S-Corp, Multi-Member LLC)
  if (user.entityType === 'BUSINESS_ENTITY' || user.activeBusinessId) {
    return '/app/business';
  }

  // 8. Default Consumer / Freelancer Taxpayer
  return '/app/taxpayer';
}
```

---

## 3. Strict Development / Staging Isolation (Rule #1)

* In **Production**:
  * The top role switcher bar is **completely omitted** from the DOM.
  * All navigation occurs automatically via authenticated routing.
* In **Development / Staging / Internal Testing**:
  * A discreet, collapsible **"Dev Switcher"** badge is anchored at the bottom-left of the viewport.
  * Clicking the badge toggles a simulation panel allowing engineers to test different personas and roles without logging in and out.
