# Phase 2 — Evidence Graph & "Prove This Number" Specification

**Engine:** Evidence Graph & Provenance DAG  
**Module:** `src/server/services/evidenceGraph.ts`  
**Endpoint:** `GET /api/facts/provenance/:factId` & `POST /api/facts/:id/correct`  
**Status:** PRODUCTION READY  

---

## 1. Overview & Provenance DAG

The Evidence Graph links calculated line items back to granular tax facts, and facts back to source documents, pages, and boxes. Every tax return value is auditable with 100% cryptographic lineage.

```
[ Tax Return Line Item ] (e.g. Total Income Line 9)
           │
           ▼
     [ TaxPosition ]
           │
           ▼
       [ TaxFact ] (e.g. w2_box1_wages, $125,000.00)
           │
           ├── [ Evidence Edge: SUBSTANTIATES ] 
           │         │
           │         ▼
           │   [ Document ] (W2_Alex_Rivera_Acme.pdf, Page 1, Box 1)
           │         │
           │         ▼
           │   [ Object Vault ] (SHA-256: 5a9d8c...91b0)
           │
           └── [ Evidence Edge: OVERRIDE ] (if manual correction performed)
                     │
                     ▼
               [ AuditEvent ] (Immutable Block Hash)
```

---

## 2. API Contract: "Prove This Number"

### `GET /api/facts/provenance/:factId`
- **Response Structure:**
```json
{
  "success": true,
  "provenance": {
    "factId": "fact-2026-w2-box1",
    "category": "INCOME",
    "key": "w2_box1_wages",
    "valueCents": "12500000",
    "confidence": 0.99,
    "validationStatus": "VALIDATED",
    "sourceDocument": {
      "id": "doc_1791453387171_5f790b7b",
      "filename": "W2_Alex_Rivera_Acme_2026.pdf",
      "mimeType": "application/pdf",
      "sha256": "5a9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d...",
      "storageKey": "vault/org-apex/doc_1791...pdf",
      "taxYear": 2026
    },
    "evidenceProvenance": [
      {
        "evidenceId": "ev-88120",
        "evidenceType": "DOCUMENT",
        "relationType": "SUBSTANTIATES",
        "hash": "7b8c9d0e1f2a3b4c...",
        "sourcePage": 1,
        "sourceRegion": { "box": "Box 1", "label": "Wages, tips, other compensation" }
      }
    ]
  }
}
```

---

## 3. Audited Fact Correction

When a taxpayer or professional reviewer updates a fact:
1. `EvidenceGraphService.correctFact` updates the record.
2. `validationStatus` is updated to `USER_CONFIRMED` or `PROFESSIONAL_CONFIRMED`.
3. A new `Evidence` edge is attached with `relationType: 'MANUAL_CORRECTION_OVERRIDE'`.
4. An immutable cryptographic `AuditEvent` is recorded in the blockchain-style ledger.
