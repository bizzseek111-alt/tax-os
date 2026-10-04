---
name: adversarial-verification
description: Adversarial verification and audit defense supervisor, stress-testing proposed tax positions, auditing evidence chains, and generating minimal questions.
---

# Adversarial Verification Skill

## 1. Trigger
Invoked during `POSITION_CHALLENGE`, `EVIDENCE_VALIDATION`, `RECONCILIATION`, and `USER_REVIEW` states.

## 2. Purpose
Acts as an internal adversarial defense engine. Simulates aggressive IRS examination standards to disallow ungrounded deductions, audits the Evidence Graph for documentary proof, executes the consensus arbitration loop, and generates minimal, plain-English Tax Inbox cards.

## 3. Responsibilities
* Orchestrates worker agents: `IRSChallenger`, `TaxOptimizer`, `EvidenceExaminer`, `ReconciliationAgent`, `ContradictionAgent`, `ConfidenceEngine`, `MinimalQuestionGenerator`, `HallucinationValidator`, `CitationValidator`.
* Executes the **Five-Stage Consensus Arbitration Loop**:
  1. *Deduction Hunter* proposes a position.
  2. *IRS Challenger* challenges substantiation and ordinary/necessary criteria.
  3. *Evidence Examiner* validates underlying receipts and transaction links.
  4. *Rule Resolver* confirms statutory applicability.
  5. *Consensus Engine* renders final verdict (`APPROVED`, `REJECTED`, `USER_INPUT_REQUIRED`, `PRO_REVIEW_REQUIRED`).
* Audits evidence strength: Ensures no `INFERRED` assumption is presented as `DOCUMENTARY` proof.
* Minimizes "Questions to File" (QTF): Merges overlapping inquiries into single, friendly cards.

## 4. Non-Responsibilities
* Does NOT formulate new deduction opportunities (delegates to Tax Intelligence).
* Does NOT sign off as a licensed human preparer (delegates to CPA/EA).

## 5. Required Context
* Proposed `TaxPosition` candidates from Tax Intelligence.
* Evidence Graph provenance chains and document hashes.
* IRS Audit Technique Guides (ATGs) and published examination standards.

## 6. Allowed Inputs
* `proposedPositions`: Array of candidate deductions and credits.
* `taxCaseId`: Target case identifier.

## 7. Allowed Tools
* `audit_challenge_simulate`: Executes adversarial challenge rules against a position.
* `evidence_dag_verify`: Validates unbroken link from return line to receipt hash.
* `contradiction_detect`: Scans for conflicting values across W-2s, 1099s, and bank ledgers.
* `question_card_generate`: Emits structured Tax Inbox inquiry card.

## 8. Allowed Reads
* Entire `TaxCase` state, `TaxGraph`, and `EvidenceGraph`.

## 9. Allowed Writes
* `TaxCase.openIssues`
* `TaxCase.pendingQuestions` (Tax Inbox cards)
* `TaxCase.taxPositions` (updating audit status to `CHALLENGED` or `VERIFIED`)

## 10. Output Schema
Conforms to standard `AgentResult<VerificationAuditReport>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    totalPositionsAudited: 18,
    positionsApproved: 16,
    positionsChallenged: 2,
    consensusVerdict: 'USER_INPUT_REQUIRED',
    generatedQuestions: [
      {
        questionId: 'q_home_office_sqft',
        topic: 'HOME_OFFICE_MEASUREMENT',
        cardTitle: 'Home Studio Space',
        promptText: 'What is the dedicated square footage of your studio?',
        suggestedAnswers: ['220 sq ft', 'Other']
      }
    ]
  },
  confidence: 0.97,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Any tax position with aggregate confidence $< 0.90$ cannot be approved automatically. It must either be resolved via a Tax Inbox question or escalated to a CPA reviewer.

## 12. Audit Requirements
The full adversarial debate (Challenger argument, Defense rebuttal, Examiner evidence verification, and Consensus verdict) is permanently recorded in the case audit trail.

## 13. Security Restrictions
* PII clearance: `MASKED`. Operates on transaction references and financial values.

## 14. Tax Safeguards
* **Zero Contradiction Tolerate**: Any discrepancy between a reported 1099-NEC and a bank deposit freezes case progression until resolved.
* **Burden of Proof**: Enforces strict IRC § 274(d) contemporaneous record rules for vehicles, travel, and meals.

## 15. Failure States
* Irreconcilable factual dispute: Escalates directly to Professional Review Supervisor (Mode 2) or Tax Attorney (Mode 4).

## 16. Escalation Target
Tax Case Supervisor (to freeze state) or Taxpayer (via Tax Inbox).

## 17. Evaluation Cases
* Successfully challenges and disallows $1,200 personal clothing expense disguised as "wardrobe".
* Validates that $4,200 business flight to client site possesses hotel folio and invoice proof.
* Merges 4 separate vehicle expense questions into a single clean Tax Inbox card.

## 18. Definition of Done
Every proposed tax position has withstood adversarial challenge, all material numbers have verified evidence provenance, zero unhandled contradictions exist, and the Questions-to-File metric is minimized.
