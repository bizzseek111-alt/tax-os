# Phase 9: Filing Rejection Engine & Correction Workflows

## Overview

IRS and state agency rejections communicate failures through cryptic statutory codes (e.g., `R0000-500-01`, `F1040-068-01`, `IND-031-04`, `SD-001`). Exposing these raw codes directly to taxpayers leads to panic and confusion. Conversely, stripping technical details from tax professionals prevents rapid remediation.

The TaxOS **Rejection Engine** (`RejectionEngine`) provides:
1. **Dual Statutory Explanations** (Customer-friendly vs CPA-grade technical diagnostic)
2. **Intelligent Exception Routing** (TaxTask for taxpayers vs ReviewTask for CPAs)
3. **Immutable Correction Provenance** (Never mutates rejected returns silently; generates incremented versions)

---

## Dual Statutory Dictionary

| Reject Code | Category | Customer Explanation | Professional Diagnostic | Suggested Action |
| :--- | :--- | :--- | :--- | :--- |
| `R0000-500-01` | `NAME_SSN_MISMATCH` | Name or SSN does not match Social Security Administration records. Verify exact spelling on card. | MeF Rule R0000-500-01: Primary SSN and Name Control mismatch against IRS Master File. Check SSA match. | `CUSTOMER_ACTION` |
| `F1040-068-01` | `DEPENDENT_CLAIMED` | A dependent listed has already been claimed on another tax return filed this year. | MeF Rule F1040-068-01: Qualifying child TIN already claimed for CTC/ODC. Check Form 8332 or Tie-Breaker. | `REVIEW` |
| `IND-031-04` | `PRIOR_YEAR_AGI_MISMATCH`| Prior-year Adjusted Gross Income entered does not match IRS records from last year. | MeF Rule IND-031-04: Prior Year AGI / PIN verification failed against IRS e-file authentication database. | `CUSTOMER_ACTION` |
| `F1040-524-02` | `MATH_ERROR` | A calculation variance was detected between tax line items and IRS system computations. | MeF Rule F1040-524-02: Total Tax computation does not match sum of statutory tax lines and schedule items. | `REVIEW` |
| `F1040-034-04` | `IDENTITY_THEFT` | The IRS requires identity verification before processing this return. Contact IRS Identity Protection. | Identity Theft Indicator flagged on IRS Master File. Requires Form 14039 or Identity Verification letter. | `LEGAL` |

---

## Intelligent Exception Routing

Upon ingesting an agency rejection via `RejectionEngine.ingestRejection`:
- If `suggestedAction === 'CUSTOMER_ACTION'`: Creates a customer `TaxTask` requesting SSN spelling verification or prior-year AGI confirmation.
- If `suggestedAction === 'REVIEW'`: Provisions a professional `ReviewTask` assigned to a CPA/EA to investigate tie-breaker rules, Form 8332 custodial release, or schedule math.
- If `suggestedAction === 'LEGAL'`: Escalates to an Attorney or Senior Reviewer for identity theft procedures (`Form 14039`).

---

## Immutable Correction Flow

To correct a rejected return, `RejectionEngine.executeCorrectionFlow`:
1. Marks the original `FilingRejection` as `RESOLVED`.
2. Invalidates prior signature requests (`ReturnVersionService.invalidatePriorSignatures`).
3. Provisions a new, incremented `ReturnVersion` (e.g., v2) containing the corrected facts merged with original inputs.
4. Leaves `ReturnVersion` v1 completely untouched in the database, preserving the historical evidentiary chain of the original rejected transmission.
5. Sets `newVersion.filingStatus = CORRECTION_REQUIRED` and re-enters the readiness gate pipeline.
