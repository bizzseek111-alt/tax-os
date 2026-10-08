# Phase 2 — Queue & Background Worker Architecture Specification

**Queue Engine:** BullMQ 6.3.11 + Redis 7  
**Isolated Redis Port:** `127.0.0.1:54322`  
**Persistence:** PostgreSQL `IngestionJob` Table  
**Module:** `src/server/queue/queue.ts`  

---

## 1. Port & Network Isolation

Because local developer machines or shared hosts may run other Redis workloads (e.g. ERP on 6379), TaxOS binds exclusively to port **54322**:
- Environment variable: `REDIS_URL="redis://127.0.0.1:54322"`
- Docker container: `taxos-redis` running on `127.0.0.1:54322->6379/tcp`

---

## 2. Ingestion Job Lifecycle

```
[ POST /api/taxdrop/upload ]
              │
              ▼
[ IngestionJob: PENDING ] (PostgreSQL row created)
              │
              ▼
    [ BullMQ: Add Job ]
              │
              ▼
     [ Worker: Pickup ] ─────────► [ IngestionJob: PROCESSING ]
              │
              ├── Step 1: SCANNING
              ├── Step 2: CLASSIFYING & OCR
              ├── Step 3: EXTRACTING FIELDS
              └── Step 4: VALIDATING & LINKING
              │
              ├── SUCCESS ───────► [ IngestionJob: COMPLETED ]
              │
              └── FAILURE ───────► Exponential Backoff (3 attempts)
                                         │
                                         ▼ (Max Retries Exceeded)
                                   [ IngestionJob: DEAD_LETTER ]
```

---

## 3. Resilience & Fallback

If Redis becomes temporarily unreachable:
1. `IngestionQueueService` detects connection failure gracefully.
2. The queue coordinator falls back to an asynchronous in-memory `setImmediate` event loop execution.
3. Every job is permanently recorded in PostgreSQL `IngestionJob`, ensuring no user uploads are ever lost during network partitions.
