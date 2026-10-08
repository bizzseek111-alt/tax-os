# Phase 9: Return Versioning & Immutable Snapshot Architecture

## Overview

In **TaxOS Phase 9**, preparing a tax return is strictly decoupled from filing one. The foundation of this decoupling is the immutable `ReturnVersion` aggregate. Once a tax return is assembled or signed, it is frozen into a permanent snapshot identified by a deterministic SHA-256 cryptographic hash.

Under no circumstances is a previously packaged or transmitted return mutated in place. Any change to underlying facts, income positions, or tax rule versions generates a new, sequentially incremented `ReturnVersion` (e.g., v1 $\rightarrow$ v2) and immediately invalidates any prior e-signatures or pending authorization requests.

---

## The `ReturnVersion` Aggregate

The `ReturnVersion` model captures the complete state of a tax filing:

```prisma
model ReturnVersion {
  id                String       @id @default(uuid())
  taxCaseId         String
  taxCase           TaxCase      @relation(fields: [taxCaseId], references: [id], onDelete: Cascade)
  versionNumber     Int          @default(1)
  taxYear           Int
  jurisdictions     String[]     // ["US-FED", "US-CA", ...]
  forms             String[]     // ["FORM_1040", "SCHEDULE_1", "FORM_540"]
  calculationRunIds String[]
  ruleSetVersions   String[]
  factsSnapshot     Json         // Frozen input facts
  positionsSnapshot Json?        // Frozen tax positions
  reviewVersion     String       // e.g. "REV_1.0"
  isSigned          Boolean      @default(false)
  isValidated       Boolean      @default(false)
  validationErrors  Json         @default("[]")
  packagePayload    Json?        // Structured canonical return bundle
  xmlPayload        String?      // Modernized e-File (MeF) XML
  pdfDocumentId     String?      // Rendered human-readable filing copy
  hash              String       // Canonical SHA-256 snapshot hash
  filingStatus      FilingStatus @default(DRAFT)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  signatureRequests SignatureRequest[]
  authorizations    TaxpayerAuthorization[]
  submissions       FilingSubmission[]
  originalAmendments AmendmentCase[] @relation("OriginalReturnVersion")
  amendedAmendments  AmendmentCase[] @relation("AmendedReturnVersion")

  @@unique([taxCaseId, versionNumber])
  @@index([taxCaseId])
  @@index([hash])
  @@index([filingStatus])
}
```

---

## Canonical SHA-256 Snapshot Hashing

To ensure bit-for-bit reproducibility and cryptographic non-repudiation, `ReturnVersionService.computeSnapshotHash` constructs a canonical UTF-8 payload by sorting all jurisdiction arrays, form codes, calculation identifiers, and recursively canonicalizing snapshot JSON dictionaries:

$$\text{Hash} = \text{SHA-256}\Big(\text{taxCaseId} \mid \text{taxYear} \mid \text{jurisdictions} \mid \text{forms} \mid \text{runs} \mid \text{rules} \mid \text{canonicalJson}(\text{facts}) \mid \text{canonicalJson}(\text{positions}) \mid \text{reviewVersion}\Big)$$

### Integrity Verification

At any point in the lifecycle (pre-signature, during transmission, or in post-filing audit), `ReturnVersionService.verifyVersionIntegrity(returnVersion)` recomputes the canonical hash against the stored snapshots and validates equality with `returnVersion.hash`. Any byte alteration in Postgres triggers an integrity failure.

---

## Automatic Signature Invalidation

If an upstream fact changes (e.g., a late-arriving corrected 1099-B, amended W-2 wages, or dependent eligibility dispute) while a `ReturnVersion` is pending signature or already signed:

1. `ReturnVersionService.invalidatePriorSignatures(taxCaseId, reason)` scans all `SignatureRequest` records associated with the case in `PENDING`, `VIEWED`, or `SIGNED` status.
2. Status transitions to `INVALIDATED`.
3. An immutable `SignatureEvent` audit log is appended with the invalidation rationale.
4. `isSigned` is reset to `false` on the active version.
5. The filing state machine moves back to `NEEDS_REVIEW` or `CORRECTION_REQUIRED`.

This prevents the critical tax prep malpractice where an authorization executed against \$80,000 in income is erroneously transmitted for \$95,000 in income.
