# Phase 6: Quality Assurance, Four-Eyes Governance & Reviewer Scoring

## 1. Overview
TaxOS enforces post-review quality governance to maintain zero-defect standards across human and AI tax preparation operations.

---

## 2. Dynamic QA Sampling Policy

`QualityAssuranceService.evaluateSamplingPolicy` inspects completed returns and selects candidates for secondary peer review based on risk triggers:

| Sampling Trigger | Rule Condition | Rationale |
| :--- | :--- | :--- |
| **High Risk** | `riskLevel == HIGH` or `CRITICAL` | 100% of high-risk cases undergo secondary review |
| **New Reviewer** | Total prior signoffs < 10 | 100% probation sampling for new preparers |
| **Large Deduction** | Any deduction > \$25,000 | Substantiation verification on large tax benefits |
| **Large Manual Override** | CPA adjustment > \$5,000 | Auditing human alterations to AI proposals |
| **Random Sample** | 5% uniform probability | Continuous baseline statistical quality control |

---

## 3. Four-Eyes Separation Invariant

> **Strict Regulatory Invariant**: The professional who authored or signed off on a return can **never** perform the QA review on that same return.

```typescript
if (recentSignoff && recentSignoff.approvedByUserId === params.qaReviewerId) {
  throw new Error("FOUR_EYES_VIOLATION: Quality reviewer cannot be the professional who approved the return.");
}
```

---

## 4. Quality Audit Lifecycle & Reviewer Scoring

1. **Scheduling**: Instantiates `QualityReview` in status `PENDING`.
2. **Review Execution**: Senior Reviewer (Level 2+) evaluates workpapers, statutory citations, and forms.
3. **Verdict & Score**: Submits score (0–100) and action:
   - `PASS`: Return approved without deficiency.
   - `CORRECTION_REQUIRED`: Reviewer flagged factual or statutory defect.
   - `ESCALATE`: Flagged for partner or attorney review.
   - `PROCESS_ISSUE`: Procedural or workflow defect identified.
   - `AGENT_ISSUE`: AI agent proposal defect identified (fed to learning loop).
   - `RULE_ISSUE`: Outdated statutory rule interpretation identified.
4. **Cumulative Scoring**: Primary reviewer's `qualityScore` is recalculated as the running average of all audited cases, governing assignment prioritization.
