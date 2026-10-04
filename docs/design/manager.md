# Autonomous Tax OS — Operations Manager UX Specification
**Persona:** Tax Practice Operations Manager, Workflow Director  
**Scope:** Firm-Wide Throughput, SLA Monitoring, Exception Velocity, Workload Balancing, Quality Assurance

---

## 1. Executive Operations Cockpit

The Operations Manager dashboard focuses on practice-level operational velocity and quality control metrics without exposing unnecessary taxpayer PII:

```
┌────────────────────────────────────────────────────────────────────────┐
│ OPERATIONS COCKPIT: TAX SEASON 2026 THROUGHPUT                         │
├────────────────────────────────────────────────────────────────────────┤
│ KEY VELOCITY METRICS:                                                  │
│ • Total Active Filings: 1,420     • Questions to File (Avg): 2.4       │
│ • AI Exception Rate: 7.8%         • Human Override Rate: 2.1%          │
│ • Professional SLA Breaches: 0    • E-File Rejection Rate: 0.12%       │
├────────────────────────────────────────────────────────────────────────┤
│ WORKLOAD REBALANCING:                                                  │
│ • Enrolled Agent Pod A: 84% Capacity (92 cases in queue)               │
│ • Enrolled Agent Pod B: 62% Capacity (68 cases in queue)               │
│ • Senior CPA Pod (Multi-State): 94% Capacity (Action: Reassign 12)     │
├────────────────────────────────────────────────────────────────────────┤
│ RISK & BOTTLENECK RADAR:                                               │
│ • 14 cases awaiting 1099-B crypto cost basis verification              │
│ • 4 cases flagged for NY nonresident convenience rule review           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Privacy & Permission Guardrails

- **Default PII Masking**: Taxpayer names, SSNs, and banking account numbers are automatically masked (`A*** R****`, `XXX-XX-1234`).
- **Audit Logging**: Any unmasking action by a manager triggers an audit event recording timestamp, IP address, and operational justification.
- **Dynamic Reassignment**: Allows managers to drag-and-drop cases across professional pods based on jurisdictional specialization (e.g., routing California returns to FTB-licensed specialists).
