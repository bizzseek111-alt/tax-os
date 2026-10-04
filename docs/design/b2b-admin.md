# Autonomous Tax OS — B2B Organization Admin UX Specification
**Persona:** Managing Partner, Firm Administrator, IT Director at Accounting & Tax Firms  
**Scope:** Multi-User Provisioning, Preparer Licensing (PTIN/EFIN), Custom Firm Templates, Client Document Retention Policies

---

## 1. Firm Administration Workspace Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ FIRM CONTROL HUB: APEX TAX PARTNERS LLP (EFIN #648291)                 │
├────────────────────────────────────────────────────────────────────────┤
│ SECTIONS:                                                              │
│ • Firm Profile & Credentials (EFIN, State Licenses, Insurance)        │
│ • Team Members & Role Privileges (12 CPAs, 6 EAs, 4 Reviewers)        │
│ • Client Portals & White-Label Branding (Domain, Firm Logo, Colors)   │
│ • Billing & License Quotas (Tier: Enterprise / 2,500 Returns Allocated)│
│ • Custom Review Rule Sets (e.g. "Require Partner Sign-off for >$500k") │
│ • API Integrations & Webhooks (Intuit ProConnect, Thomson Reuters)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Key Administrative Capabilities

1. **EFIN / PTIN Verification**: Verifies and binds firm credentials to e-file staging configurations with encrypted keystore storage.
2. **Review Policy Builder**: Configures deterministic rules for mandatory human review (e.g., auto-escalate any return with Schedule C revenue exceeding $250,000 or multi-state allocation >3 states).
3. **Firm White-Labeling**: Allows customizing the taxpayer onboarding experience with firm branding, custom engagement letters, and automated retainer collection.
