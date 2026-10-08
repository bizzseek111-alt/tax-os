# Phase 4 — "Prove This Rule" Grounded Explainability Architecture

## 1. Overview

In Phase 3, TaxOS established "Prove This Number"—a mathematical lineage Directed Acyclic Graph (DAG) connecting return lines to source facts, intermediate sums, and statutory formulas.

Phase 4 completes the explainability loop with **"Prove This Rule"** (`src/server/services/taxAuthority/explanation/explainRule.ts`), connecting mathematical formulas directly to binding legal texts and court opinions.

```mermaid
graph LR
    Line[Form 1040 Line 13: $12,000 QBI] -->|Prove This Number| MathDAG[Lineage DAG: 20% x $60,000 Net Profit]
    MathDAG -->|Prove This Rule| RuleNode[TaxRule: FED-SEC-199A-QBI-DEDUCTION]
    RuleNode --> ChunkNode[TaxAuthorityChunk: 26 U.S.C. § 199A(a)(1)]
    ChunkNode --> SourceDoc[TaxAuthoritySource: Internal Revenue Code]
```

## 2. Dual-Presentation Model

A single explanation format cannot serve both a consumer taxpayer and an IRS audit examiner. TaxOS generates two synchronized views from the identical grounding data:

### View A: Plain-English Taxpayer Summary
- Designed for clarity, transparency, and calm confidence.
- Strips dense legal cross-references while retaining statutory integrity.
- Explains *why* the taxpayer qualifies based on their uploaded documents.

*Example:*
> "This deduction is governed by **26 U.S.C. § 199A**. Because you operate an active sole proprietorship and your taxable income is within statutory limits, you received a 20% deduction on your qualified business income ($12,000 deduction on $60,000 profit)."

### View B: CPA / Attorney Technical Brief
- Full citation: `26 U.S.C. § 199A(b)(2)`, `Treas. Reg. § 1.199A-1(b)(2)`
- Authority Rank: `1` (Statute, Binding)
- Exact statutory excerpts and section paths
- State conformity audit notes across 5 states (e.g. California Form 540 disallowance note)
- 100% audit-readiness confidence score with cryptographic proof hash.
