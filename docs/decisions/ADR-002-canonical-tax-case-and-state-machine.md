# ADR-002: Canonical TaxCase Aggregate Root & Deterministic State Machine

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
Multi-agent systems frequently suffer from orchestration chaos when agents communicate via unconstrained peer-to-peer chat. Agents become trapped in infinite conversational loops, overwrite each other's work without concurrency controls, and lose provenance of why specific conclusions were reached.

## 2. Decision
**We mandate that all filing engagements revolve around a single canonical aggregate root: the `TaxCase`.**
* Autonomous agents do not chat loosely with each other; they read structured state from the `TaxCase` and write structured, audited mutations back to it.
* The `TaxCase` lifecycle is governed by a **strict 20-state deterministic finite automaton (DFA)**. State transitions are linear and guarded by precondition checks.

## 3. Alternatives Considered
* *Alternative A: Autonomous Multi-Agent Swarm with Dynamic Emergence* — Rejected. Completely non-reproducible; impossible to audit; unacceptable regulatory risk for tax compliance.
* *Alternative B: Relational Form Database with Ad-Hoc Worker Updates* — Rejected. Traditional database approach lacks global lifecycle state, event sourcing, and adversarial review phases.

## 4. Trade-Offs & Consequences
* **Positive**: Predictable, linear progress; guaranteed event auditing; ability to snapshot and replay any stage of the tax engagement.
* **Negative**: Requires strict schema definitions and event validation for every mutation.

## 5. Security & PII Implications
The `TaxCase` provides a single security boundary for enforcing tenant isolation, optimistic concurrency locking, and audit logging.

## 6. Tax & Legal Implications
Guarantees that a return cannot transition to `READY_TO_FILE` or `SUBMITTED` without completing prerequisite states such as `EVIDENCE_VALIDATION`, `RECONCILIATION`, and `SIGNED`.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review state-specific retention rules (e.g., California FTB 4-year statute of limitations vs. IRS 3-year under IRC § 6501) to ensure the `CLOSED` state archive retention satisfies all jurisdictions.

## 8. Future Migration Considerations
Future entity returns (S-Corps Form 1120-S, Partnerships Form 1065) will inherit from the base `TaxCase` aggregate root using polymorphic inheritance without disrupting the core state engine.
