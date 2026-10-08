# Phase 4 — Tax Law Watcher & Automated Impact Analysis

## 1. Overview

Statutory changes (such as annual inflation adjustments under Rev. Proc. 2025-38, new state legislation, or emergency tax acts) require systematic change management across active taxpayer files.

The `TaxLawWatcher` (`src/server/services/taxAuthority/watcher/taxLawWatcher.ts`) provides:
1. Cryptographic AST diffing between rule versions
2. Classification of changes (threshold, phaseout, rate, condition)
3. Automated impact analysis across persisted `TaxCase` records in PostgreSQL.

## 2. Cryptographic Rule Diffing

The watcher computes SHA-256 hashes of canonical rule representations and compares sub-elements:

```typescript
interface RuleDiffResult {
  ruleId: string;
  isDifferent: boolean;
  hashOld: string;
  hashNew: string;
  changes: string[]; // Specific changed fields and formulas
}
```

Diff categories tracked:
- Condition AST modifications
- Threshold adjustments (e.g. standard deduction inflation increase)
- Phaseout ceiling/floor shifts
- Deterministic engine calculation reference updates

## 3. Automated Case Impact Analysis

When a rule is amended:
```mermaid
sequenceDiagram
    participant Watcher as TaxLawWatcher
    participant DB as PostgreSQL DB
    participant Engine as Tax Twin Simulator
    participant Reviewer as Review Routing Queue

    Watcher->>DB: Query open TaxCases in affected jurisdiction & taxYear
    DB-->>Watcher: Active TaxCase records
    loop For each case with relevant facts
        Watcher->>Engine: Run what-if delta simulation
        Engine-->>Watcher: Estimated difference in cents
        Watcher->>Reviewer: Queue ReviewTask for CPA review
    end
    Watcher-->>Watcher: Generate RuleImpactAnalysis summary report
```

The resulting `RuleImpactAnalysis` details the total count of affected cases and sample dollar deltas, preventing tax surprises and enabling proactive CPA advisory.
