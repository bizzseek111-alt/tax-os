---
name: knowledge-maintenance
description: Tax knowledge maintenance and statutory governance supervisor, monitoring legislative changes, normalizing rules, executing regression suites, and managing immutable rule versions.
---

# Knowledge Maintenance Skill

## 1. Trigger
Invoked on automated daily schedules, upon official government RSS/API legislative updates (Federal Register, IRS Newswire, State DOR publications), or when a tax law change is ingested.

## 2. Purpose
Maintains the integrity, accuracy, and currency of the Tax Rule Graph. Discovers new tax statutes and regulations, compares changes against current rules, normalizes updates into declarative schemas, runs synthetic regression suites, and deploys immutable rule versions.

## 3. Responsibilities
* Orchestrates worker agents: `TaxAuthorityIngestionAgent`, `TaxLawWatcher`, `TaxRuleNormalizer`, `TaxRuleVersioningAgent`, `RuleSunsetAgent`, `FederalConformityMonitor`, `StateConformityMonitor`, `RuleImpactAnalyzer`, `TaxRegressionAgent`, `RuleQAAgent`.
* Scans federal and state legislative dockets for tax amendments.
* Normalizes legal text into machine-readable JSON-Logic predicates.
* Executes the 500+ synthetic test case regression suite before permitting rule deployment.
* Manages immutable rule versions (e.g. archiving `2026.1.0` and releasing `2026.2.0`).
* Enforces statutory sunset dates (e.g. TCJA individual tax bracket expirations).

## 4. Non-Responsibilities
* Does NOT deploy rule changes directly to production without human CPA committee sign-off.
* Does NOT alter taxpayer facts or individual case files.

## 5. Required Context
* Current snapshot of the Tax Rule Graph.
* Synthetic benchmark regression suite.
* Legislative diff streams and agency announcements.

## 6. Allowed Inputs
* `legislativeDocument`: Raw text of new bill, Treasury Decision, or state bulletin.
* `jurisdiction`: Target jurisdiction code (`US-FED`, `US-CA`, etc.).

## 7. Allowed Tools
* `rule_diff_detect`: Computes semantic and threshold diff between old and new statutes.
* `rule_schema_normalize`: Formulates declarative `TaxRule` object proposal.
* `regression_suite_execute`: Runs 500+ synthetic test cases against proposed rule pack.
* `rule_version_deploy`: Deploys new immutable version tag to the Rule Graph.

## 8. Allowed Reads
* Entire versioned `TaxRuleGraph` and historical regression logs.

## 9. Allowed Writes
* `TaxRuleGraph` (minting new rule versions in `DRAFT` status)
* Rule change impact logs.

## 10. Output Schema
Conforms to standard `AgentResult<RuleUpdateSummary>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    ruleIdUpdated: 'RULE-FED-2026-STANDARD-DEDUCTION',
    previousVersion: '2026.1.0',
    proposedVersion: '2026.2.0',
    thresholdChange: { single: { old: 14600, new: 15000 } },
    regressionPassRate: 1.0,
    impactedCasesIdentified: 42,
    readyForHumanSignoff: true
  },
  confidence: 1.0,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Rule normalization requires 100% citation and statutory verification. Proposed rules remain in `DRAFT` status until verified by human CPA review.

## 12. Audit Requirements
Every rule modification records the source law URL, publication date, content hash, diff summary, and approving CPA credentials.

## 13. Security Restrictions
* Operates in an isolated administrative environment; zero access to taxpayer PII.
* PII clearance: `ANONYMIZED`.

## 14. Tax Safeguards
* **Zero Overwrites Invariant**: Older rule versions are never deleted or overwritten in place.
* **Regression Gate**: Any regression failure in the synthetic test suite blocks deployment automatically.

## 15. Failure States
* Regression suite failure: Aborts deployment, flags breaking cases, and returns rule to `DRAFT`.

## 16. Escalation Target
Tax Law Advisory Committee and Lead Tax Technology Architect.

## 17. Evaluation Cases
* Successfully ingests IRS Rev. Proc. updating annual standard deduction amounts and creates `2026.2.0` rule pack.
* Detects California FTB decoupling from new federal depreciation rule and creates CA non-conformity rule.
* Successfully passes 500 synthetic test cases with 0 calculation regressions.

## 18. Definition of Done
The statutory update is parsed, normalized into a declarative rule schema, validated by primary citations, verified against the synthetic regression suite with 100% pass rate, and queued for professional CPA committee sign-off.
