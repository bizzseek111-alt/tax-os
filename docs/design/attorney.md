# Autonomous Tax OS — Tax Controversy Attorney UX Specification
**Persona:** Tax Attorney, Legal Counsel, Audit Defense Litigator  
**Scope:** Legal Controversies, IRS / State Notices, Multi-Jurisdiction Statutory Clashes, Attorney-Client Privileged Workpapers

---

## 1. Controversy Workspace Layout

The Attorney workspace is isolated from routine preparation queues and displays only escalated legal matters:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEGAL CONTROVERSY WORKSPACE (Privilege-Aware Vault)                   │
├────────────────────────────────────────────────────────────────────────┤
│ MATTERS IN PROGRESS:                                                   │
│ 1. Matter #LEG-2026-042: NY Convenience vs NJ Telecommuter Conflict    │
│    • Client: Elena Rostova                                            │
│    • Statutory Clash: 20 NYCRR § 131.18 vs N.J.S.A. § 54A:4-1        │
│    • Potential Double Taxation Exposure: $3,450                       │
│    • Precedential Risk Rating: Moderate                               │
│ 2. Matter #LEG-2026-088: FTB Independent Contractor Classification    │
│    • California AB 5 / Dynamex 3-Part Prong Analysis                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Attorney Cockpit Capabilities

1. **Privileged Workpaper Segregation**: Notes and strategic litigation memoranda created in this workspace are flagged as `PRIVILEGED_WORK_PRODUCT` and excluded from standard preparer export packets.
2. **Statutory Clash Comparison**: Side-by-side legal viewer showing conflicting state regulations, recent administrative rulings, and judicial precedents.
3. **Formal Position Memo Generator**: Generates an audit-ready Form 8275 / 8275-R Disclosure Statement or state protest petition with verified statutory citations.
4. **Resolution Routing**: Attorney can approve the tax position, instruct the CPA to amend sourcing percentages, or prepare a formal petition.
