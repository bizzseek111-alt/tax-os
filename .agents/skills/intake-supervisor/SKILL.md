---
name: intake-supervisor
description: Ingestion and document intelligence supervisor, orchestrating file ingestion, document splitting, OCR extraction, identity resolution, and duplicate detection.
---

# Intake Supervisor Skill

## 1. Trigger
Invoked during `DATA_COLLECTION` and `DATA_PROCESSING` states, or immediately upon a `document.uploaded` event.

## 2. Purpose
Coordinates the end-to-end ingestion pipeline: validates incoming files, detects viruses/tampering, splits multi-page packets, executes multimodal OCR, extracts key-value pairs, eliminates duplicate uploads, and reconstructs taxpayer identity.

## 3. Responsibilities
* Orchestrates worker agents: `DocumentRouter`, `DocumentSplitter`, `DocumentExtractionAgent`, `DuplicateDocumentAgent`, `IdentityResolutionAgent`.
* Computes SHA-256 fingerprints and stores files in Content Addressable Storage (CAS).
* Resolves taxpayer, spouse, and dependent identities.
* Parses prior-year tax returns to seed carryover losses and depreciation schedules.
* Flags unsupported tax forms (e.g. Form 2555, Form 8621) for automated intake deflection.

## 4. Non-Responsibilities
* Does NOT categorize expenses or investigate business purposes (delegates to Financial Intelligence).
* Does NOT formulate legal tax deductions or credits (delegates to Tax Intelligence).

## 5. Required Context
* Uploaded document byte streams or S3 presigned references.
* Case identity baseline (taxpayer legal name, tax year).

## 6. Allowed Inputs
* `documentBatch`: Array of uploaded file references.
* `taxCaseId`: Target case identifier.

## 7. Allowed Tools
* `file_hash_sha256`: Computes cryptographic document hash.
* `document_split_pages`: Segregates PDF packets into discrete documents.
* `document_ai_extract`: Multimodal key-value and table OCR extraction.
* `identity_resolve`: Matches names across W-2, 1099, and driver's licenses.

## 8. Allowed Reads
* Raw document storage buckets and OCR cache.
* `TaxCase.documents` and `TaxCase.household`.

## 9. Allowed Writes
* `TaxCase.documents`
* `TaxCase.household` (taxpayer, spouse, dependents)
* `TaxCase.residencyPeriods`

## 10. Output Schema
Conforms to standard `AgentResult<IntakeSummary>`:
```typescript
{
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED',
  result: {
    documentsProcessed: 14,
    duplicatesRemoved: 2,
    extractedForms: [
      { type: 'W2', employer: 'Acme Corp', wagesCents: 12500000 },
      { type: '1099_NEC', payer: 'Google LLC', compensationCents: 4500000 }
    ],
    deflectedForms: []
  },
  confidence: 0.99,
  evidenceRefs: ['doc_99182', 'doc_99183'],
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
High-confidence extraction requires OCR field confidence $> 0.95$. Any blurry scan or ambiguous number with confidence $< 0.85$ trips a manual verification issue.

## 12. Audit Requirements
Emits `document.extracted` with page-level bounding boxes and SHA-256 hashes for every ingested file.

## 13. Security Restrictions
* Strict malware scanning required before extraction.
* Raw unmasked SSNs are tokenized immediately; plaintext SSNs are never written to unencrypted logs.

## 14. Tax Safeguards
* Verifies that the tax year on the document matches the active case tax year.
* Rejects documents where EIN is malformed or invalid.

## 15. Failure States
* Unreadable file: Prompts user via Tax Inbox to upload a clearer photo.
* Password-protected PDF: Solicits password from user or requests decrypted copy.

## 16. Escalation Target
Tax Case Supervisor (for workflow blockages) or Customer Support (for corrupted files).

## 17. Evaluation Cases
* Successfully splits a 40-page combined scan into 1 W-2, 3 1099s, and 24 receipts.
* Accurately rejects duplicate 1099-NEC uploaded twice under different file names.
* Gracefully deflects unsupported Form 2555 (Foreign Earned Income).

## 18. Definition of Done
All uploaded files are cryptographically hashed, classified, split, extracted, verified, and mapped to structured `TaxDocument` entities in the Tax Graph.
