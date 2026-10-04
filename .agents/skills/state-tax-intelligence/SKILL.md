---
name: state-tax-intelligence
description: Sovereign state tax intelligence supervisor for California, New York, New Jersey, Illinois, and Massachusetts, managing state conformity, residency allocation, and multi-state sourcing.
---

# State Tax Intelligence Skill

## 1. Trigger
Invoked during `RULE_APPLICATION` whenever a case involves state tax filings (`US-CA`, `US-NY`, `US-NJ`, `US-IL`, `US-MA`).

## 2. Purpose
Executes sovereign state tax logic for the five launch states. Computes federal addition and subtraction modifications, resolves statutory residency and domicile dates, sources remote and freelance income, and calculates state-specific tax credits.

## 3. Responsibilities
* Orchestrates sovereign state workers:
  * **California**: `CaliforniaTaxAgent`, `CaliforniaResidencyAgent`, `CaliforniaConformityAgent`.
  * **New York**: `NewYorkTaxAgent`, `NewYorkResidencyAgent`, `NewYorkConformityAgent`.
  * **New Jersey**: `NewJerseyTaxAgent`, `NewJerseyResidencyAgent`, `NewJerseyConformityAgent`.
  * **Illinois**: `IllinoisTaxAgent`, `IllinoisResidencyAgent`, `IllinoisConformityAgent`.
  * **Massachusetts**: `MassachusettsTaxAgent`, `MassachusettsResidencyAgent`, `MassachusettsConformityAgent`.
* Enforces sovereign state non-conformity matrices:
  * CA: Disallows HSA deduction (IRC § 223), disallows QBI (§ 199A), caps Section 179 at $25,000.
  * NY: Applies Convenience of the Employer rule, calculates NYC/Yonkers resident surcharges.
  * NJ: Assembles Gross Income Tax schedule (no federal AGI starting point), restricts loss netting.
  * IL: Computes flat 4.95% rate, Schedule M modifications, and 5% property tax credit.
  * MA: Categorizes income into ordinary (5%), short-term capital gains (8.5%), and 4% Fair Share Surtax.
* Computes resident credits for taxes paid to other states to eliminate double taxation.

## 4. Non-Responsibilities
* Does NOT modify federal tax variables or alter federal AGI.
* Does NOT execute final state e-file transmission (delegates to Filing Domain).

## 5. Required Context
* Verified Federal AGI and schedule breakdowns.
* Taxpayer `ResidencyPeriod` timeline and physical work locations.
* State-specific Tax Rule Graph packages.

## 6. Allowed Inputs
* `federalReturnSnapshot`: Clean federal return data.
* `residencyPeriods`: Domicile and physical presence intervals.
* `taxCaseId`: Target case identifier.

## 7. Allowed Tools
* `state_conformity_lookup`: Retrieves statutory state additions/subtractions.
* `residency_allocate_income`: Sources income based on days worked vs. domicile.
* `state_credit_compute`: Calculates resident tax credits for other state taxes paid.

## 8. Allowed Reads
* `TaxCase.activeJurisdictions`
* `TaxCase.residencyPeriods`
* Federal calculation nodes.

## 9. Allowed Writes
* `TaxCase.taxPositions` (state-specific positions)
* `TaxCase.appliedRuleSetVersions` (state version keys)

## 10. Output Schema
Conforms to standard `AgentResult<StateTaxSummary>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    stateReturns: [
      {
        stateCode: 'CA',
        formType: '540_RESIDENT',
        stateAgiCents: 13240000,
        additionsCents: 415000,       // HSA + Depreciation non-conformity
        subtractionsCents: 0,
        stateTaxCents: 842000,
        otherStateCreditCents: 0
      }
    ]
  },
  confidence: 0.99,
  ruleRefs: ['RULE-CA-2026-HSA-NONCONFORMITY', 'RULE-CA-2026-SEC179-CAP'],
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Requires 100% certainty on residency allocation dates. If moving dates or physical presence intervals are missing, generates a high-priority Tax Inbox card.

## 12. Audit Requirements
Every state modification must cite the sovereign state revenue and taxation code (e.g., Cal. Rev. & Tax. Code § 17201, NY Tax Law § 612, NJ Rev. Stat. § 54A:5-1).

## 13. Security Restrictions
* Strict state partition isolation: California agent cannot read or alter New York data structures.
* PII clearance: `ANONYMIZED`.

## 14. Tax Safeguards
* **Non-Leakage Invariant**: State non-conformity rules must NEVER alter federal AGI or touch other state returns.
* **Double-Taxation Safeguard**: Ensures total allocated income across states does not exceed 100% of federal gross income.

## 15. Failure States
* Unresolvable statutory dual-residency conflict: Flags case to Professional Review Supervisor (Mode 2/3).

## 16. Escalation Target
Verification Supervisor (for reconciliation) or Reviewing CPA (for state allocation sign-off).

## 17. Evaluation Cases
* Accurately adds back $4,150 federal HSA deduction on California Schedule CA (540).
* Applies New York Convenience of the Employer rule to telecommuter working from New Jersey.
* Calculates New Jersey Gross Income Tax without carrying forward federal Schedule C losses across categories.

## 18. Definition of Done
Sovereign state returns for all active launch states are compiled, conformity adjustments are documented with statutory citations, multi-state allocations reconcile exactly to federal AGI, and all state positions are validated.
