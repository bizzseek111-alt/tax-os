# Phase 2 — Secure Ingestion Architecture Specification

**Status:** APPROVED & VERIFIED (2026.Q1 Production Standard)  
**Security Level:** HIGH / RESTRICTED (IRC § 7216 & Treasury Circular 230 Compliant)  
**Authors:** CTO, Principal Backend Engineer, Security Architect  

---

## 1. Executive Summary

Phase 2 transitions Autonomous TaxOS from persistent multi-tenant identity into an asynchronous, cryptographically verified ingestion engine. It enables taxpayers and enterprises to upload real tax documents, stream transaction ledgers, connect financial institutions via Plaid, and extract structured statutory tax facts with zero filename heuristics.

```
       [ Client Upload / Plaid Sandbox / Bank CSV ]
                           │
                           ▼
          ┌──────────────────────────────────┐
          │     FileSecurityService          │
          │  - Magic Byte Detection          │
          │  - Exploit / Macro Inspection    │
          │  - CSV Formula Sanitization      │
          └─────────────────┬────────────────┘
                            │
                            ▼
          ┌──────────────────────────────────┐
          │      ObjectStorageProvider       │
          │  - SHA-256 Vault Immutability    │
          │  - Tenant-Isolated Storage Paths │
          └─────────────────┬────────────────┘
                            │
                            ▼
          ┌──────────────────────────────────┐
          │     BullMQ Ingestion Queue       │
          │  - Redis Port 54322 Worker Pool  │
          │  - Exponential Retry & DLQ       │
          └─────────────────┬────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌──────────────────────────────┐     ┌──────────────────────────────┐
│     InternalTaxParser        │     │       FinancialService       │
│  - 25 Form Types Classified  │     │  - AES-256 Plaid Integration │
│  - Boxes & Lines Normalized  │     │  - SHA-256 Tx Fingerprinting │
│  - Exact Lineage Retained    │     │  - Deduplicated Ledger Sync  │
└──────────────┬───────────────┘     └──────────────┬───────────────┘
               │                                    │
               └─────────────────┬──────────────────┘
                                 │
                                 ▼
               ┌──────────────────────────────────┐
               │       EvidenceGraphService       │
               │  - Deterministic Fact Validation │
               │  - Cross-Doc Conflict Detection  │
               │  - Prove This Number DAG Edges   │
               │  - Audited Fact Corrections      │
               └──────────────────────────────────┘
```

---

## 2. Ingestion Lifecycle & State Machine

Every document ingested follows a non-blocking asynchronous state machine tracked in PostgreSQL:

| State | Transition Trigger | Actions Performed | Failure Action |
|---|---|---|---|
| `QUEUED` | `POST /api/taxdrop/upload` | File validated, stored in vault, job pushed to BullMQ | Rejection (HTTP 400) |
| `SCANNING` | BullMQ worker pickup | Magic byte verification, active PDF scan, size audit | Mark `FAILED`, log security alert |
| `CLASSIFYING` | Security scan passed | Text extracted, classified against 25 statutory forms | Mark `UNKNOWN`, route to `NEEDS_REVIEW` |
| `EXTRACTING` | Classification complete | Box & line normalization, value parsing to BigInt cents | Set `ExtractionStatus.FAILED` |
| `VALIDATING` | Fields extracted | Deterministic statutory rules checked, duplicate scan | Set `FactValidationStatus.CONFLICTED` |
| `READY` | Validation clean | Evidence edges linked, TaxCase state refreshed | Final state |
| `NEEDS_REVIEW` | Conflict / Probable Dup | TaxTask generated with priority `HIGH` | Requires human sign-off |
| `DUPLICATE` | Exact SHA-256 match | Document points to canonical master, facts bypassed | Retained for audit lineage |

---

## 3. Storage Hierarchy & Vault Isolation

Documents are stored with cryptographic SHA-256 keys partitioned by tenant:
```
storage/vault/{organizationId}/{documentId}_{sanitizedFilename}
```

- **Encryption at Rest:** AES-256-GCM.
- **Path Traversal Protection:** Relative traversal sequences (`..`) and leading slashes are stripped.
- **Signed URL Access:** Ephemeral URLs generated with HMAC-SHA256 signatures expiring in 900 seconds.

---

## 4. Multi-Tenant Defense-in-Depth

1. All database queries for documents, financial connections, and transactions require explicit `organizationId` scoping.
2. Cross-tenant access attempts immediately trigger `403 Forbidden` / `404 Not Found` with automated security audit logs.
3. Redis key isolation separates tenant queues without key contamination.
