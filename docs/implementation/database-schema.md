# Autonomous TaxOS — Database Schema & Data Dictionary

**Engine:** PostgreSQL 16.15  
**Port:** `54321` (Docker Container: `taxos-postgres`)  
**ORM:** Prisma 6.19.3  
**Migration Path:** `prisma/schema.prisma`  

---

## 1. Schema Design Principles

1. **Strict Relational Integrity:** Enforced foreign keys with explicit cascade behavior (`Cascade` on child dependencies, `SetNull` on optional relationships).
2. **Deterministic Financial Calculation:** All monetary values are represented as 64-bit integer cents (`BigInt`, e.g. `14820000n` = `$148,200.00`). Floating-point types are strictly forbidden in accounting ledger tables.
3. **Canonical Multi-Tenancy:** Every organization-bound entity references `Organization` with indexed foreign keys.
4. **State Machine Enums:** Enums represent bounded state spaces (`UserRole`, `CaseStatus`, `ReviewMode`, `TaxDomain`, `ObligationStatus`).
5. **Cryptographic Blockchain Ledger:** Sequential `AuditEvent` table contains SHA-256 block hashes linking sequential records.

---

## 2. Enumerations

| Enum Name | Values | Description |
|:---|:---|:---|
| `UserRole` | `TAXPAYER`, `BUSINESS_OWNER`, `CFO`, `CPA`, `EA`, `PAID_PREPARER`, `FEDERAL_REVIEWER`, `STATE_REVIEWER`, `SALES_TAX_REVIEWER`, `PAYROLL_REVIEWER`, `BUSINESS_TAX_REVIEWER`, `SENIOR_REVIEWER`, `ATTORNEY`, `OPERATIONS_MANAGER`, `CASE_MANAGER`, `CUSTOMER_SUPPORT`, `FIRM_ADMIN`, `ORG_ADMIN`, `TAX_KNOWLEDGE_ADMIN`, `SECURITY_ADMIN`, `SUPER_ADMIN` | Comprehensive platform access roles |
| `SubscriptionTier` | `PERSONAL_FREE`, `PERSONAL_PRO`, `BUSINESS_CORE`, `FULL_TAX_OS`, `ENTERPRISE_FIRM` | Billing and feature entitlements |
| `CaseType` | `INDIVIDUAL_INCOME`, `BUSINESS_INCOME`, `SALES_TAX`, `PAYROLL_TAX`, `MULTI_DOMAIN_BUSINESS` | High-level categorization of the tax filing aggregate |
| `ReviewMode` | `AI_AUTOPILOT`, `HUMAN_VERIFIED`, `FULL_SERVICE` | Persisted review service level |
| `CaseStatus` | `DRAFT`, `DISCOVERY`, `DOCUMENT_INTAKE`, `NEEDS_YOU`, `CALCULATING`, `READY_FOR_REVIEW`, `IN_REVIEW`, `APPROVED`, `FILED`, `TRANSMITTED`, `ACCEPTED`, `REJECTED`, `ARCHIVED` | Valid states in the filing lifecycle |
| `RiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Audit and controversy risk rating |
| `TaxDomain` | `INCOME_TAX`, `SALES_TAX`, `PAYROLL_TAX`, `EMPLOYER_COMPLIANCE` | Primary platform tax regimes |
| `ObligationStatus` | `NOT_STARTED`, `IN_PROGRESS`, `READY_FOR_CALCULATION`, `CALCULATED`, `REVIEW_PENDING`, `REVIEW_APPROVED`, `TRANSMITTED`, `ACCEPTED`, `REJECTED` | Status of a specific statutory filing obligation |
| `CredentialType` | `CPA`, `ENROLLED_AGENT`, `TAX_ATTORNEY`, `CTEC_PREPARER`, `ANNUAL_FILING_SEASON_PROGRAM`, `STAFF_PREPARER` | Professional licensing designations |
| `CredentialStatus` | `ACTIVE`, `SUSPENDED`, `EXPIRED`, `PENDING_VERIFICATION` | Validity state of a credential |
| `AvailabilityStatus` | `AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE` | Professional capacity flag |
| `TaskOwnerType` | `AI`, `TAXPAYER`, `CPA`, `EA`, `PREPARER`, `ATTORNEY`, `SALES_TAX_SPECIALIST`, `PAYROLL_SPECIALIST`, `OPERATIONS` | Assignment category for a TaxTask |
| `TaskStatus` | `OPEN`, `IN_PROGRESS`, `AWAITING_INPUT`, `PENDING_TAXPAYER`, `ESCALATED`, `RESOLVED`, `DISMISSED` | Lifecycle of a canonical question or action |
| `TaskPriority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Queue priority ordering |
| `DocumentType` | `FORM_W2`, `FORM_1099_NEC`, `FORM_1099_MISC`, `FORM_1099_K`, `FORM_1099_B`, `FORM_1099_DIV`, `FORM_1099_INT`, `FORM_1098_MORTGAGE`, `FORM_1040_PRIOR_YEAR`, `RECEIPT_EXPENSE`, `INVOICE_SALES`, `PAYROLL_REPORT`, `BANK_FEED_CSV`, `RESALE_CERTIFICATE`, `LEGAL_CONTRACT`, `UNKNOWN` | Source document classification |
| `DocumentStatus` | `UPLOADED`, `VIRUS_SCANNED`, `PROCESSING`, `PROCESSED`, `VERIFIED`, `DUPLICATE_REMOVED`, `ERROR` | Ingestion pipeline state |
| `ExtractionStatus` | `NOT_STARTED`, `EXTRACTING`, `EXTRACTED`, `FAILED` | OCR/AI parsing status |

---

## 3. Relational Model Dictionary

### 3.1 Organization & Identity

#### `Organization`
The tenant boundary entity. All tenant data isolates against `organizationId`.
- `id` (UUID, PK)
- `name` (String)
- `slug` (String, Unique)
- `fein` (String, Optional)
- `tier` (SubscriptionTier)
- `settings` (JSON)
- `createdAt`, `updatedAt` (Timestamp)

#### `User`
Platform identity entity with salted password hash and optional MFA configuration.
- `id` (UUID, PK)
- `email` (String, Unique)
- `passwordHash` (String, bcrypt 10 rounds)
- `fullName` (String)
- `role` (UserRole)
- `isMfaEnabled` (Boolean)
- `mfaSecret` (String, Optional)
- `emailVerifiedAt` (Timestamp, Optional)

#### `OrganizationMembership`
Maps users to organizations with tenant-specific roles.
- `id` (UUID, PK)
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `userId` (UUID, FK -> User, `onDelete: Cascade`)
- `role` (UserRole)
- **Constraint:** Unique(`organizationId`, `userId`)

#### `UserProfile`
Personal address and contact details.
- `userId` (UUID, FK -> User, Unique, `onDelete: Cascade`)
- `phone`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `taxResidentState`

#### `ProfessionalProfile`
Professional qualifications, license numbers, PTIN, and jurisdiction permissions.
- `userId` (UUID, FK -> User, Unique, `onDelete: Cascade`)
- `credentialType` (CredentialType)
- `credentialNumber` (String)
- `credentialStatus` (CredentialStatus)
- `ptin` (String, Optional)
- `stateBarOrBoard` (String, Optional)
- `authorizedJurisdictions` (String[], e.g. `["US-FED", "US-CA"]`)
- `authorizedTaxDomains` (String[], e.g. `["INCOME_TAX", "SALES_TAX"]`)
- `maxActiveCaseCapacity` (Int, Default 25)
- `currentActiveCases` (Int, Default 0)

#### `Credential`
Individual verifiable license or certification records.
- `userId` (UUID, FK -> User, `onDelete: Cascade`)
- `type` (CredentialType)
- `identifier` (String)
- `issuingBody` (String)
- `status` (CredentialStatus)
- `expiresAt`, `verifiedAt` (Timestamp)

#### `TaxpayerProfile`
Individual taxpayer specifics including encrypted SSN and last 4 digits.
- `userId` (UUID, FK -> User, Unique, `onDelete: Cascade`)
- `filingStatus` (String, e.g. `SINGLE`, `MARRIED_JOINT`)
- `ssnEncrypted` (String, Optional)
- `ssnLast4` (String, Optional)
- `occupation` (String, Optional)
- `dependentsCount` (Int, Default 0)

#### `BusinessProfile`
Entity information for corporate or pass-through business filers.
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `legalName`, `dba`, `entityType`, `fein`, `naicsCode`, `incorporationState`, `headquartersState`

---

### 3.2 TaxCase & Obligations Aggregate

#### `TaxCase`
The canonical aggregate root for a tax filing cycle.
- `id` (UUID, PK)
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `ownerId` (UUID, FK -> User)
- `taxYear` (Int, Default 2026)
- `caseType` (CaseType)
- `reviewMode` (ReviewMode, Persisted)
- `status` (CaseStatus)
- `riskLevel` (RiskLevel)
- `grossIncomeCents` (BigInt)
- `deductionsCents` (BigInt)
- `taxableIncomeCents` (BigInt)
- `federalRefundOrDueCents` (BigInt)
- `stateDueCents` (BigInt)
- `completionPercent` (Int)
- `auditHash` (String, SHA-256 state fingerprint)
- **Indexes:** `[organizationId, taxYear]`, `[ownerId]`, `[status]`

#### `TaxObligation`
Specific statutory obligations spanning Income, Sales, and Payroll taxes.
- `id` (UUID, PK)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `taxDomain` (TaxDomain)
- `jurisdictionCode` (String, e.g. `US-FED`, `CA-CDTFA`)
- `period` (String, e.g. `2026-ANNUAL`, `2026-Q1`)
- `status` (ObligationStatus)
- `ruleSetVersion` (String)
- `dueDate` (Timestamp)
- **Constraint:** Unique(`taxCaseId`, `jurisdictionCode`, `period`)

#### `TaxJurisdiction`
Master dictionary of tax taxing authorities.
- `code` (String, PK, e.g. `US-FED`, `US-CA`, `CA-CDTFA`, `US-NY`)
- `name` (String)
- `level` (FEDERAL, STATE, LOCAL)
- `authorityName` (String)
- `portalUrl` (String, Optional)

---

### 3.3 Tasks, Facts, Positions & Reviews

#### `TaxTask`
Actionable questions, deductions verifications, and compliance tasks.
- `id` (UUID, PK)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `taxObligationId` (UUID, Optional, FK -> TaxObligation, `onDelete: SetNull`)
- `taskType` (String)
- `ownerType` (TaskOwnerType)
- `ownerId` (UUID, Optional, FK -> User)
- `status` (TaskStatus)
- `priority` (TaskPriority)
- `reason` (String)
- `financialImpactCents` (BigInt, Optional)
- `requiredEvidence` (JSON)
- `resolutionChoice` (String, Optional)
- `auditRecordHash` (String)

#### `TaxFact`
Atomic verified financial or demographic facts extracted from source documents.
- `id` (UUID, PK)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `category` (INCOME, EXPENSE, DEDUCTION, ASSET)
- `key` (String, e.g. `w2_box1_wages`)
- `valueCents` (BigInt, Optional)
- `confidence` (Float)
- `isVerified` (Boolean)

#### `TaxPosition`
Statutory legal positions claimed on the return.
- `id` (UUID, PK)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `taxObligationId` (UUID, Optional, FK -> TaxObligation, `onDelete: SetNull`)
- `positionType` (DEDUCTION, DEPRECIATION, EXEMPTION)
- `statutoryCitation` (String, e.g. `26 U.S.C. § 162(a)`)
- `amountCents` (BigInt)
- `rationale` (String)
- `riskScore` (Float)
- `status` (String, e.g. `PROPOSED`, `CONFIRMED`)

#### `ReviewTask`
Jurisdiction and domain gated review work orders for CPAs and EAs.
- `id` (UUID, PK)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `jurisdiction` (String, e.g. `US-CA`)
- `taxDomain` (TaxDomain)
- `requiredRole` (UserRole)
- `assignedUserId` (UUID, Optional, FK -> User)
- `riskLevel` (RiskLevel)
- `materialityCents` (BigInt)
- `status` (String, e.g. `PENDING_ROUTING`, `IN_REVIEW`, `APPROVED`)
- `deadline` (Timestamp)
- `decision` (JSON, Optional)
- **Indexes:** `[taxCaseId, status]`, `[assignedUserId]`, `[jurisdiction, taxDomain]`

#### `ProfessionalReview`
Permanent record of professional signoff.
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `reviewerId` (UUID, FK -> User)
- `ptin` (String)
- `jurisdiction` (String)
- `domain` (TaxDomain)
- `signoffHash` (String, SHA-256)
- `signedAt` (Timestamp)

---

### 3.4 Storage, Evidence, Audit & PAM

#### `Document`
Uploaded source tax documents with cryptographic checksums.
- `id` (UUID, PK)
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `taxCaseId` (UUID, Optional, FK -> TaxCase, `onDelete: SetNull`)
- `ownerId` (UUID, FK -> User)
- `filename`, `mimeType`, `sizeBytes` (BigInt)
- `storageKey` (String, Path in vault)
- `sha256` (String, Cryptographic hash)
- `documentType` (DocumentType)
- `status` (DocumentStatus)

#### `Evidence`
Bi-directional provenance link binding TaxFacts or TaxPositions to Documents.
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `documentId` (UUID, Optional, FK -> Document, `onDelete: SetNull`)
- `factId` (UUID, Optional, FK -> TaxFact, `onDelete: SetNull`)
- `positionId` (UUID, Optional, FK -> TaxPosition, `onDelete: SetNull`)
- `relationType` (SUBSTANTIATES, PROVES_LINE, ATTRIBUTES_INCOME)
- `hash` (String)

#### `AuditEvent`
Cryptographic blockchain ledger of all platform mutations.
- `sequence` (BigInt, Autoincrement)
- `timestamp` (Timestamp, Default now)
- `actorId` (UUID, FK -> User)
- `actorRole` (UserRole)
- `actorType` (USER, AGENT, SYSTEM)
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `taxCaseId` (UUID, Optional, FK -> TaxCase, `onDelete: SetNull`)
- `action` (String)
- `objectType`, `objectId` (String)
- `previousValue`, `newValue` (JSON, Optional)
- `reason` (String, Optional)
- `blockHash` (String, SHA-256)
- `previousBlockHash` (String, SHA-256 of preceding sequence)
- **Indexes:** `[organizationId]`, `[taxCaseId]`, `[sequence]`

#### `PrivilegedPiiAccessGrant`
Time-bounded PAM authorization record for sensitive taxpayer PII.
- `id` (UUID, PK)
- `userId` (UUID, FK -> User, `onDelete: Cascade`)
- `organizationId` (UUID, FK -> Organization, `onDelete: Cascade`)
- `taxCaseId` (UUID, FK -> TaxCase, `onDelete: Cascade`)
- `targetRecordId` (String, Taxpayer ID)
- `reason` (String, Mandatory min 10 chars)
- `authFactorUsed` (String, e.g. `PASSWORD_REAUTH`)
- `grantedAt` (Timestamp)
- `expiresAt` (Timestamp, Strictly `grantedAt + 15m`)
- `revokedAt` (Timestamp, Optional)
