# Phase 6: Review Operations, SLA Monitoring & Support Boundaries

## 1. Review Operations Dashboard
`ReviewOperationsDashboardService.getOperationsDashboard` aggregates real-time operational telemetry for firm leadership, managing partners, and operations directors:

- **Active Queue Counters**: Total active, unassigned, in-review, waiting on customer, and waiting on attorney.
- **Jurisdiction Breakdown**: Real-time volume across federal and 5 supported states (`US-FED`, `US-CA`, `US-NY`, `US-NJ`, `US-IL`, `US-MA`).
- **Priority Distribution**: Volume split across `URGENT`, `HIGH`, `MEDIUM`, `LOW`.
- **Reviewer Capacity & Utilization**: Active case counts, max capacity, utilization percentages, and historical quality scores per professional.
- **SLA Health**: Total cases currently at-risk or in breach.

---

## 2. Service Level Agreement (SLA) Engine

`ServiceLevelAgreementEngine` enforces turnaround targets configured via `ServiceLevelPolicy`:

| Metric | Threshold | Automated System Action |
| :--- | :--- | :--- |
| **Normal Turnaround** | Within 24 Hours | Queue prioritized by priority and creation time |
| **At-Risk Warning** | 18+ Hours Elapsed | Flagged in operations dashboard with yellow indicator |
| **SLA Breach** | 24+ Hours Elapsed | Flagged in operations dashboard with red indicator |
| **Auto-Escalation Daemon** | Post-Breach | Automatically elevates task priority to `URGENT` and logs audit event |

---

## 3. Customer Support Privacy Boundaries

Customer support representatives assist taxpayers with account access, billing, and progress updates. To comply with IRC § 7216 and privacy policies, TaxOS strictly partitions support queries:

### Scoped Case Summary (`getCustomerSupportCaseSummary`):
```typescript
{
  caseId: "...",
  taxYear: 2026,
  caseType: "INDIVIDUAL_INCOME",
  caseStatus: "IN_REVIEW",
  completionPercent: 85,
  openCustomerRequestsCount: 1,
  unresolvedQuestions: ["Confirm Q4 estimated tax payment"],
  isLocked: false,
  assignedReviewerName: "Elena Vance, CPA",
  sanitizedNotice: "SUPPORT_SCOPED_VIEW: Raw PII, tax return math schedules, and privileged attorney notes are masked per security policy."
}
```

### Strict Restrictions for Support Personnel:
1. **Raw SSNs / PII**: Fully masked (only last 4 digits visible).
2. **Detailed Calculation Workpapers**: Hidden from support role.
3. **Privileged Legal Notes**: Inaccessible.
4. **Access Auditing**: Every access by support creates a `SUPPORT_CASE_STATUS_INSPECTED` block in the cryptographic ledger.
