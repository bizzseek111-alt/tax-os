---
name: tax-intelligence
description: Federal and statutory tax intelligence supervisor, discovering deductions, evaluating credits, resolving tax rules, and verifying statutory authorities.
---

# Tax Intelligence Skill

## 1. Trigger
Invoked during `RULE_APPLICATION` and `POSITION_PROPOSAL` states, or when new financial facts are established.

## 2. Purpose
Interrogates the Tax Rule Graph and authoritative legal corpora to formulate valid, legally supported tax positions. Discovers overlooked deductions and credits, applies Qualified Business Income (QBI) rules, and validates primary statutory citations.

## 3. Responsibilities
* Orchestrates worker agents: `FederalTaxAgent`, `DeductionHunter`, `CreditHunter`, `TaxRuleResolver`, `TaxCitationValidator`, `QualifiedBusinessIncomeAgent`, `SelfEmploymentAgent`.
* Queries the Tax Rule Graph for applicable code sections (IRC § 162, § 199A, § 179, § 280A, § 1401).
* Evaluates AGI thresholds and computes statutory phase-outs (e.g. child tax credit, QBI wage caps).
* Formulates formal tax elections (de minimis safe harbor under Treas. Reg. § 1.263(a)-1(f), Section 179 expensing).
* Binds primary statutory citations to every proposed tax position.

## 4. Non-Responsibilities
* Does NOT execute floating-point math for final tax returns (delegates to Deterministic Engine).
* Does NOT alter authoritative rule definitions in the Tax Rule Graph.

## 5. Required Context
* Normalized financial facts from Financial Intelligence.
* Active tax year and jurisdiction (`US-FED`).
* Versioned Tax Rule Graph snapshot.

## 6. Allowed Inputs
* `reconstructedFacts`: Verified income, expenses, and asset purchases.
* `taxCaseId`: Target case identifier.

## 7. Allowed Tools
* `rule_graph_query`: Searches machine-readable tax rules by topic and tax year.
* `primary_authority_fetch`: Retrieves official statute text from Title 26 USC / 26 CFR.
* `validate_citation_authority`: Confirms citation is valid, un-superseded, and precedential.
* `qbi_evaluate_eligibility`: Computes 20% Section 199A deduction and SSTB status.

## 8. Allowed Reads
* `TaxCase.reconstructedFactIds`
* `TaxCase.household`
* Entire versioned `TaxRuleGraph`.

## 9. Allowed Writes
* `TaxCase.taxPositions` (proposing candidates)
* `TaxCase.appliedRuleSetVersions`

## 10. Output Schema
Conforms to standard `AgentResult<ProposedPositionsSummary>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    proposedPositions: [
      {
        positionId: 'pos_qbi_deduction',
        topic: 'QUALIFIED_BUSINESS_INCOME',
        formLine: 'Form 1040, Line 13',
        amountCents: 2480000,
        statutoryCitation: 'IRC § 199A(a); Treas. Reg. § 1.199A-1',
        confidenceScore: 0.99
      }
    ]
  },
  confidence: 0.99,
  ruleRefs: ['RULE-FED-2026-IRC-199A'],
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Every proposed position must carry a confidence score $\ge 0.95$. If statutory authority is ambiguous or subject to split circuit precedent, the position is flagged as `STATUTORY_AMBIGUITY` and routed to Professional Review.

## 12. Audit Requirements
Every proposed position must include the full citation string, publisher, tax year, rule version, and specific facts satisfying the legal conditions.

## 13. Security Restrictions
* Operates on de-identified financial facts; zero access to raw SSNs.
* PII clearance: `ANONYMIZED`.

## 14. Tax Safeguards
* **Zero Citation Fabrication**: Every citation is verified against the primary authority index. Fabricated citations trigger a build breaker.
* **Temporal Isolation**: Must query rules matching the exact tax year of the case. Applying 2024 thresholds to a 2026 return is blocked.

## 15. Failure States
* Unresolvable statutory conflict: Emits `AuthorityConflictEvent` and escalates to Tax Attorney (Mode 4).
* Insufficient facts for election: Emits inquiry to Minimal Question Generator.

## 16. Escalation Target
Verification Supervisor (for adversarial challenge) or Professional Review Supervisor (for CPA sign-off).

## 17. Evaluation Cases
* Identifies 20% Section 199A QBI deduction for independent software consultant.
* Applies de minimis safe harbor election under Treas. Reg. § 1.263(a)-1(f) for $1,800 laptop purchase.
* Successfully disallows SSTB QBI deduction for medical doctor above taxable income phase-out ceiling.

## 18. Definition of Done
All eligible deductions, credits, and elections are discovered, tested against rule conditions, substantiated with primary statutory citations, and assembled as candidate `TaxPosition` objects ready for adversarial audit.
