# Case-Specific Fact Binding & Rule Resolution

## 1. Concrete Fact Binding vs Abstract Law

Tax rules do not apply in a vacuum — they apply to specific confirmed facts of a taxpayer's case. TaxOS implements this via `FactApplicabilityService` and `CaseRuleResolver`.

Every statutory condition is evaluated as one of three states:
- `SATISFIED`: Confirmed taxpayer evidence meets statutory condition criteria.
- `UNSATISFIED`: Confirmed taxpayer evidence fails condition criteria (e.g., personal use present).
- `UNKNOWN` (`MISSING_FACT`): Case does not currently contain verified facts to evaluate condition.

---

## 2. Prohibition of Hallucinated Assumptions

> **Hard Invariant:** If any statutory condition is `UNKNOWN`, TaxOS **DOES NOT GUESS**. It flags `MISSING_FACT` and blocks the rule status as `BLOCKED_BY_MISSING_FACTS`.

### Home Office Deduction (IRC § 280A) Example

Statutory Requirements:
1. Space must be used strictly and **exclusively** for trade or business purposes (IRC § 280A(c)(1)).
2. Space must be used on a **regular and continuous basis** as the principal place of business.

Evaluation Flow:
```
Case Facts: [] (Empty)
  ├── Exclusive Use: UNKNOWN ────► Generates Minimal Fact Question #1
  └── Regular Basis: UNKNOWN ────► Generates Minimal Fact Question #2
Result: BLOCKED_BY_MISSING_FACTS (Confidence: 0.50, Action: REQUEST_FACT)

Case Facts: [exclusive_business_use: true, regular_business_basis: true]
  ├── Exclusive Use: SATISFIED
  └── Regular Basis: SATISFIED
Result: FULLY_APPLICABLE (Confidence: 1.00, Action: PROCEED)
```

---

## 3. TaxRuleCandidate Generation for Novel Findings

When live research identifies an authoritative rule not currently codified in the approved TaxRule graph:
1. `CaseRuleResolver.createRuleCandidate()` generates a `TaxRuleCandidate` in PostgreSQL with status `CANDIDATE`.
2. Includes proposed conditions AST, authority references, confidence score, and discovery metadata.
3. The rule candidate is **quarantined from automated production calculation** until explicitly signed off by a credentialed CPA or Tax Attorney.
