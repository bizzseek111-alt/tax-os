# TaxOS Database & Data Persistence Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Principal Backend Engineer & Production Readiness Auditor  
**Primary Finding:** There is **zero persistent database storage** in the current TaxOS repository. All entities, audit trails, and financial records exist solely in volatile Node.js runtime memory or static TypeScript files.

---

## 1. Database Audit Summary

| Component | Target Architecture | Current Codebase Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Relational Database** | PostgreSQL 16 (Multi-tenant with RLS) | **None.** No database connection, driver, or container. | **P0 (Critical Blocker)** |
| **ORM / Query Builder** | Prisma, Drizzle, or Kysely | **None.** No ORM package in `package.json`. | **P0 (Critical Blocker)** |
| **Schema Migrations** | Versioned SQL migration files | **None.** No schema files or migration tooling. | **P0 (Critical Blocker)** |
| **Document Storage (BLOB)** | AWS S3 / Google Cloud Storage (AES-256) | In-memory array (`documentVault`). Discards file bytes. | **P0 (Critical Blocker)** |
| **Graph Database / DAG** | Relational adjacency tables or pgvector | In-memory `Map<string, TaxGraphNode>` in `TaxGraph.ts`. | **P1 (High)** |
| **Cache & Queue Store** | Redis 7 Cluster (Cluster caching + BullMQ) | None. In-memory maps in single Node process. | **P1 (High)** |
| **Audit Ledger Store** | Append-only database (QLDB / immudb / PG) | In-memory `AuditEntry[]` array with non-cryptographic hash. | **P0 (Critical Blocker)** |

---

## 2. Inventory of Current Transient State

Every purported data entity in the application currently lives in volatile memory:

1. **`src/services/MockData.ts` (589 lines):**
   - Hardcoded constants: `MOCK_BUSINESS`, `MOCK_INCOME_TAX_CASE`, `MOCK_SALES_TAX_CASE`, `MOCK_PAYROLL_TAX_CASE`, `MOCK_NEXUS_STATES`, `MOCK_EMPLOYEES`, `MOCK_CONTRACTORS`, `MOCK_PAYROLL_RUNS`, `MOCK_FORM_941_Q1`.
2. **`src/server/index.ts` (Global Variables):**
   - `let activeTaxCase`: Single global object storing Alex Rivera's return.
   - `let tasksQueue`: Array of 3 static tasks.
   - `let documentVault`: Array of 5 static metadata objects.
3. **`src/platform/AuditLedger.ts`:**
   - `private static chain: AuditEntry[] = []`: Erased whenever the Node server restarts.
4. **`src/models/TaxGraph.ts`:**
   - `private nodes: Map<string, TaxGraphNode> = new Map()`: Ephemeral graph instantiated per request or session.
5. **`src/services/TaxDropService.ts`:**
   - `private static knownHashes: Map<string, string> = new Map()`: Deduplication memory map lost on server restart.

---

## 3. Required Production Schema Specification (PostgreSQL 16)

To support production operation, the following relational schema must be deployed with PostgreSQL Row-Level Security (RLS) enabled on all tenant tables:

### 3.1 Tenancy & Identity Tables
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    fein VARCHAR(10),
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'FULL_TAX_OS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ptin VARCHAR(20),
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_tenant_isolation ON users
    USING (organization_id = current_setting('app.current_tenant_id')::UUID);
```

### 3.2 Canonical Tax Case & Obligation Tables
```sql
CREATE TYPE tax_domain_enum AS ENUM ('INCOME_TAX', 'SALES_USE_TAX', 'PAYROLL_TAX');
CREATE TYPE review_mode_enum AS ENUM ('AI_AUTOPILOT', 'HUMAN_VERIFIED', 'FULL_SERVICE');
CREATE TYPE case_status_enum AS ENUM ('DRAFT', 'NEEDS_YOU', 'READY_FOR_REVIEW', 'APPROVED', 'TRANSMITTED', 'ACCEPTED', 'REJECTED');

CREATE TABLE tax_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tax_year INT NOT NULL,
    domain tax_domain_enum NOT NULL,
    status case_status_enum NOT NULL DEFAULT 'DRAFT',
    review_mode review_mode_enum NOT NULL DEFAULT 'HUMAN_VERIFIED',
    gross_income_cents BIGINT NOT NULL DEFAULT 0,
    deductions_cents BIGINT NOT NULL DEFAULT 0,
    taxable_income_cents BIGINT NOT NULL DEFAULT 0,
    federal_refund_or_due_cents BIGINT NOT NULL DEFAULT 0,
    state_due_cents BIGINT NOT NULL DEFAULT 0,
    completion_percent INT NOT NULL DEFAULT 0,
    assigned_reviewer_id UUID REFERENCES users(id),
    audit_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tax_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_case_id UUID NOT NULL REFERENCES tax_cases(id) ON DELETE CASCADE,
    jurisdiction_code VARCHAR(20) NOT NULL, -- e.g. 'US-FED', 'US-CA', 'CA-CDTFA'
    form_identifier VARCHAR(50) NOT NULL,  -- e.g. 'Form 1040', 'Form 540', 'CDTFA-401'
    filing_due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);
```

### 3.3 Tax Tasks (Needs You) & Clarifications
```sql
CREATE TABLE tax_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_case_id UUID NOT NULL REFERENCES tax_cases(id) ON DELETE CASCADE,
    task_type VARCHAR(50) NOT NULL,
    owner_type VARCHAR(50) NOT NULL, -- 'TAXPAYER', 'CPA', 'ATTORNEY'
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_TAXPAYER',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    reason TEXT NOT NULL,
    financial_impact_cents BIGINT,
    required_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    resolution_choice TEXT,
    resolved_at TIMESTAMPTZ,
    audit_record_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.4 Documents & Encrypted Vault
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    tax_case_id UUID REFERENCES tax_cases(id),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    s3_storage_key VARCHAR(500) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL UNIQUE,
    classification VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    confidence_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    ocr_raw_text TEXT,
    extracted_facts JSONB,
    is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.5 Cryptographic Audit Ledger Table
```sql
CREATE TABLE audit_ledger (
    sequence BIGSERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID NOT NULL REFERENCES users(id),
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_id UUID NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    details JSONB NOT NULL,
    previous_block_hash VARCHAR(64) NOT NULL,
    current_block_hash VARCHAR(64) NOT NULL,
    CONSTRAINT unique_block_hash UNIQUE(current_block_hash)
);
```

---

## 4. Migration & Implementation Action Items

1. **Deploy Managed Database:** Provision AWS Aurora Serverless v2 PostgreSQL (Multi-AZ) or Supabase Enterprise cluster.
2. **Implement Drizzle ORM / Prisma:** Codify the above schema with strict TypeScript type generation and automated migration tooling.
3. **Configure Object Storage:** Provision an encrypted S3 bucket with KMS customer-managed keys (`aws:kms`) and presigned URL upload flows for document ingestion.
4. **Implement Tenant Context Middleware:** Set `SET LOCAL app.current_tenant_id = '...'` at the beginning of every database transaction to enforce hardware-grade multi-tenant isolation.
