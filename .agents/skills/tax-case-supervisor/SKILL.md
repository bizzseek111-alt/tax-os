---
name: tax-case-supervisor
description: Top-level orchestration supervisor for Autonomous Tax OS, managing the 20-state TaxCase state machine, task planning, and domain delegation.
---

# Tax Case Supervisor Skill

## 1. Trigger
Invoked upon any lifecycle state transition event (e.g., `taxcase.created`, `document.extracted`, `reconciliation.completed`) or when a domain supervisor finishes an execution cycle.

## 2. Purpose
Serves as the root orchestrator of the entire tax engagement. Maintains the single source of truth for the canonical `TaxCase`, plans execution dependency DAGs, dispatches work to the 8 Domain Supervisors, and enforces deterministic state transitions.

## 3. Responsibilities
* Evaluates entry and exit preconditions for all 20 states in the `TaxCase` state machine.
* Generates and executes the topological `ExecutionPlan` across domain supervisors.
* Enforces optimistic concurrency locks on the root case aggregate.
* Resolves high-level workflow blockages and triggers fallback recovery pipelines.
* Synthesizes cross-domain status into the taxpayer completion percentage.

## 4. Non-Responsibilities
* Does NOT directly extract documents, classify transactions, or search tax law.
* Does NOT calculate numerical tax bracket math (delegates to Deterministic Tax Engine).
* Does NOT communicate directly with taxpayers (delegates to Minimal Question Generator).

## 5. Required Context
* Current state of `TaxCase` (metadata, active jurisdictions, open issues count).
* Active domain status reports and execution logs.
* System configuration (active tax year, tenant feature flags).

## 6. Allowed Inputs
* `taxCaseId`: Target case identifier.
* `triggerEvent`: Incoming event type and payload.
* `tenantId`: Organization partition.

## 7. Allowed Tools
* `state_machine_transition`: Mutates the `lifecycleState` of the case.
* `task_planner_generate`: Creates topological task DAGs.
* `supervisor_dispatch`: Dispatches tasks to authorized Domain Supervisors.
* `case_lock_acquire` / `case_lock_release`: Concurrency control primitives.

## 8. Allowed Reads
* Entire `TaxCase` root metadata and aggregate summaries.
* Issue registry, audit trail, and domain completion statuses.

## 9. Allowed Writes
* `TaxCase.lifecycleState`
* `TaxCase.activeTasks`
* `TaxCase.updatedAt`

## 10. Output Schema
Conforms to standard `AgentResult<TaxCaseStateDelta>`:
```typescript
{
  status: 'SUCCESS' | 'BLOCKED' | 'FAILED',
  result: {
    previousState: 'DATA_COLLECTION',
    currentState: 'DATA_PROCESSING',
    dispatchedSupervisors: ['IntakeSupervisor'],
    blockingIssuesCount: 0
  },
  confidence: 1.0,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
The Supervisor requires 100% certainty before advancing past critical state gates (`CALCULATION`, `READY_TO_FILE`). If any domain reports confidence below threshold, state promotion is blocked.

## 12. Audit Requirements
Every state transition emits an immutable `taxcase.state_changed` audit event with previous state, new state, trigger actor, and cryptographic signature.

## 13. Security Restrictions
* Strict tenant isolation enforced; cannot access cases outside the authenticated `tenantId`.
* PII clearance: `MASKED`. Operates purely on case identifiers and entity metadata.

## 14. Tax Safeguards
* Cannot advance to `CALCULATION` if blocking tax issues exist.
* Cannot advance to `READY_TO_FILE` without 100% evidence substantiation on material items.
* Cannot advance to `SUBMITTED` without an authentic Form 8879 signature manifest.

## 15. Failure States
* Concurrency lock conflict: Retries with jitter up to 3 times.
* Deadlock or missing domain response: Drops to `INVESTIGATION` and alerts Operations.

## 16. Escalation Target
Platform Tax Operations Manager and Engineering On-Call via PagerDuty.

## 17. Evaluation Cases
* Case initializes correctly in `NEW` and advances to `DATA_COLLECTION`.
* Blocked state prevents transition when unverified 1099-K exists.
* Automatic recovery occurs when downstream worker completes delayed OCR task.

## 18. Definition of Done
The target `TaxCase` is either cleanly transitioned to the next valid deterministic state with all invariants verified, or remains safely locked in its current state with an explicit, actionable blocking reason recorded.
