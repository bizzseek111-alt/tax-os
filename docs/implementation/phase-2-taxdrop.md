# Phase 2 — TaxDrop System Specification

**Component:** Intelligent Ingestion Vault (TaxDrop)  
**Module:** `src/server/services/documentPipeline.ts` & `src/components/ux/TaxDropZone.tsx`  
**Status:** PRODUCTION READY  

---

## 1. Overview

TaxDrop is the enterprise intake mechanism for taxpayer documents. It accepts heterogeneous payloads (PDFs, scans, CSV bank feeds, receipts, ZIP archives) and processes them non-blockingly without exposing internal queues to users.

---

## 2. API Contract

### `POST /api/taxdrop/upload`
- **Headers:** `Content-Type: application/json`, `Cookie: taxos_token=...`
- **Payload:**
```json
{
  "fileName": "W2_Acme_Technologies_2026.pdf",
  "fileContentBase64": "JVBERi0xLjQKMSAwIG9iag...",
  "mimeType": "application/pdf",
  "taxYear": 2026,
  "taxCaseId": "case-2026-alex-rivera"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Document securely ingested into object vault and enqueued for async processing.",
  "document": {
    "id": "doc_1791453387171_5f790b7b",
    "name": "W2_Acme_Technologies_2026.pdf",
    "type": "UNKNOWN",
    "size": "145 KB",
    "sourceHash": "5a9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d...",
    "status": "PROCESSING",
    "processingState": "QUEUED",
    "duplicateType": null,
    "uploadedAt": "2026-10-08T10:00:00.000Z"
  }
}
```

### `GET /api/taxdrop/documents`
- Returns all documents scoped to the active tenant organization with live processing status.

### `POST /api/taxdrop/documents/:id/retry`
- Resets a `FAILED` document to `QUEUED` and enqueues a new background BullMQ job.

---

## 3. UI Real-time Binding

The frontend `TaxDropZone` connects directly to these endpoints:
1. On component mount: Loads existing tenant documents from `/api/taxdrop/documents`.
2. On file drop/select: Encodes buffer, calls `/api/taxdrop/upload`, and animates through real ingestion stages.
3. Live badges:
   - `READY`: Reconciled
   - `DUPLICATE`: Duplicate Dropped (Saved Double-Count Hazard)
   - `NEEDS_REVIEW`: Human Review Flagged
   - `PROCESSING`: Processing...
   - `FAILED`: Failed (Retry)
