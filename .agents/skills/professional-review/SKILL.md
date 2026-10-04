---
name: professional-review
description: Professional review and tax advisory supervisor, managing EA/CPA review queues, AI Review Brief generation, override auditing, and attorney escalation.
---

# Professional Review Skill

## 1. Trigger
Invoked during `PROFESSIONAL_REVIEW` state, or when a Mode 2 (CPA Verified), Mode 3 (Pro Prep), or Mode 4 (Attorney Escalation) workflow is requested.

## 2. Purpose
Empowers credentialed human professionals (Enrolled Agents, CPAs, Tax Attorneys) to review, audit, and sign returns with 10x capacity expansion. Generates the executive AI Review Brief, manages exception sign-offs, records Circular 230 override rationales, and provisions privileged legal workspaces.

## 3. Responsibilities
* Orchestrates worker agents: `ProfessionalMatchingAgent`, `EAReviewAgent`, `CPAReviewAgent`, `PaidPreparerReviewAgent`, `TaxAttorneyEscalationAgent`, `ProfessionalReviewBriefAgent`, `SecondReviewerAgent`.
* Compiles the **AI Review Brief**: Pre-audited workpapers summarizing income reconciliation, expense substantiation, federal lines, state conformity, and open exceptions.
* Manages reviewer assignment based on state accountancy licensing and active capacity.
* Enforces Circular 230 diligence: Mandates statutory justification whenever a human reviewer overrides an AI classification or position.
* Provisions Mode 4 privileged legal workspaces for tax controversy, IRS audit notices, and formal statutory conflicts.

## 4. Non-Responsibilities
* Does NOT assign tax attorneys to routine return preparation by default.
* Does NOT allow uncredentialed staff to sign returns as paid preparers.

## 5. Required Context
* Complete `TaxCase` state, calculations, and adversarial challenge records.
* Reviewing professional’s credentials (PTIN, state CPA license number, EFIN).
* Active engagement mode (Mode 1, Mode 2, Mode 3, or Mode 4).

## 6. Allowed Inputs
* `taxCaseId`: Target case identifier.
* `reviewerContext`: Active CPA/EA user credentials.
* `overrideActions`: Any modifications submitted by the professional.

## 7. Allowed Tools
* `review_brief_generate`: Compiles the executive AI Review Brief workpapers.
* `pro_signoff_execute`: Cryptographically signs return with PTIN credentials.
* `override_record_log`: Logs human override with mandatory statutory justification.
* `attorney_workspace_provision`: Provisions privileged legal case folder.

## 8. Allowed Reads
* Entire `TaxCase` data, financial ledger, documents, and evidence DAG.

## 9. Allowed Writes
* `TaxCase.professionalReviews`
* `TaxCase.taxPositions` (marking positions as `VERIFIED` or `OVERRIDDEN`)
* `TaxCase.lifecycleState` (advancing to `READY_TO_FILE`)

## 10. Output Schema
Conforms to standard `AgentResult<ProfessionalReviewSignoff>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    reviewerName: 'Sarah Jenkins, CPA',
    licenseState: 'TX',
    licenseNumber: 'CPA-091823',
    ptin: 'P01849201',
    reviewMode: 'MODE_2_CPA_VERIFIED',
    exceptionsReviewedCount: 1,
    overridesRecordedCount: 0,
    signoffTimestamp: '2027-03-14T11:24:00Z',
    readyToFile: true
  },
  confidence: 1.0,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Professional review represents the ultimate human-in-the-loop validation. A valid CPA/EA sign-off provides 100% legal authority for return transmission.

## 12. Audit Requirements
The exact AI Review Brief viewed by the professional, the duration spent in review, and all override justifications are sealed in the immutable audit log.

## 13. Security Restrictions
* Mode 4 legal matters are marked with attorney-client privilege and restricted from general firm staff.
* PII clearance: `MASKED` for standard CPAs; `UNMASKED` only when authorized for formal IRS power of attorney (Form 2848).

## 14. Tax Safeguards
* **Circular 230 Standards**: Reviews must adhere to Treasury Circular 230 § 10.22 (Diligence as to accuracy) and § 10.34 (Standards with respect to tax returns).
* **Mandatory Override Rationale**: System rejects any manual change that does not select or provide a valid tax code justification.

## 15. Failure States
* Reviewer rejects return: Case returns to `INVESTIGATION` with specific feedback notes.
* License expiration: Matching agent blocks assignment if reviewer license has lapsed.

## 16. Escalation Target
Tax Attorney (for Mode 4 legal controversy) or Managing Partner (for second-partner review).

## 17. Evaluation Cases
* CPA completes full review of a multi-1099 Schedule C return in 6 minutes via the AI Review Brief.
* System enforces statutory rationale entry when reviewer modifies travel expense allocation.
* Properly routes IRS CP2000 notice to Tax Attorney workspace instead of routine CPA queue.

## 18. Definition of Done
The AI Review Brief is generated, all exceptions are evaluated, reviewer overrides are justified and recorded, and the return is signed with PTIN credentials and certified as ready to file.
