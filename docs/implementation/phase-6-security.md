# Phase 6: Review Security Architecture, Access Boundaries & Audit Ledger

## 1. Multi-Tiered Access Security Architecture

TaxOS implements zero-trust role-based access control (RBAC) across all human review operations:

```
[ Super Admin / Firm Admin ] ──► System configuration, break-lock, disaster recovery
             │
[ Partner / Legal Counsel ]  ──► Privileged legal memoranda, unlimited review signoff
             │
[ Senior Reviewer (Level 2) ]──► Final return approvals (up to $500k), QA sampling
             │
[ Staff Preparer (Level 1) ] ──► Standard positions (up to $50k), customer question creation
             │
[ Customer Support ]         ──► Milestone tracking, sanitized notice view (NO PII / Return Math)
             │
[ Taxpayer (Customer) ]      ──► Own TaxCases, "Needs You" queue, customer-reviewer messages
```

---

## 2. PII & Privacy Masking Invariants

In compliance with IRC § 7216 and Gramm-Leach-Bliley Act (GLBA):

1. **SSN Protection**: Raw SSNs are encrypted at rest with AES-256-GCM. Customer support personnel only view masked versions (e.g. `***-**-1234`).
2. **Workpaper Segregation**: Calculation lineage, intermediate adjustments, and internal staff annotations are excluded from customer-facing API responses.
3. **Privileged Memorandum Protection**: Legal work product is isolated at the database query level via `isPrivilegedLegal` and `recipientScope: REVIEWER_ATTORNEY` filters.

---

## 3. Cryptographic Blockchain Audit Ledger Integration

Every operational review action writes an immutable block to the `AuditEvent` ledger:

- **Block Hash Formula**:
  ```math
  \text{BlockHash} = \text{SHA256}(\text{Sequence} \parallel \text{PrevHash} \parallel \text{ActorId} \parallel \text{ActorRole} \parallel \text{Action} \parallel \text{ObjectType} \parallel \text{ObjectId} \parallel \text{PrevValue} \parallel \text{NewValue} \parallel \text{Reason} \parallel \text{Timestamp})
  ```
- **Audited Review Actions**:
  - `CASE_LOCK_BROKEN`
  - `REVIEW_TASK_STATUS_CHANGED`
  - `REVIEW_TASK_ASSIGNED`
  - `REVIEW_TASK_UNASSIGNED`
  - `POSITION_APPROVED`
  - `POSITION_MODIFIED_BY_REVIEWER`
  - `POSITION_REJECTED_BY_REVIEWER`
  - `CUSTOMER_REQUEST_CREATED`
  - `CUSTOMER_REQUEST_RESOLVED`
  - `CUSTOMER_REQUEST_CANCELLED`
  - `CASE_MESSAGE_SENT`
  - `CASE_ESCALATED_TO_ATTORNEY`
  - `ATTORNEY_LEGAL_OPINION_SUBMITTED`
  - `FINAL_RETURN_APPROVED_BY_PROFESSIONAL`
  - `PROFESSIONAL_SIGNOFF_INVALIDATED`
  - `QUALITY_REVIEW_SCHEDULED`
  - `QUALITY_REVIEW_COMPLETED`
  - `SLA_BREACH_ESCALATED`
  - `SUPPORT_CASE_STATUS_INSPECTED`
