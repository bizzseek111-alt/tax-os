# Autonomous Tax OS — The Canonical TaxCase Architecture

> **Status**: Approved System Architecture  
> **Document Version**: 1.0.0  
> **Entity Type**: Root Aggregate Entity (`TaxCase`)  
> **State Machine Paradigm**: Deterministic Finite State Automaton with Event Sourcing  

---

## 1. The Core Philosophy of TaxCase

In Autonomous Tax OS, **the TaxCase is the single source of truth for an entire filing lifecycle**. 

Agents do not chat loosely with one another. Agents read from the structured state of a `TaxCase`, execute bounded tools, and write structured mutations back to the `TaxCase` through audited event streams.

```
┌────────────────────────────────────────────────────────────────────────┐
│                               TAX CASE                                 │
│  The Stateful Container for Financial Reality, Law & Evidence         │
├────────────────────────────────────────────────────────────────────────┤
│  • Identity & Household: Taxpayer, Spouse, Dependents, Residency       │
│  • Financial Accounts: Connected Banks, Brokerages, Processors         │
│  • Ingested Documents: W-2s, 1099s, Receipts, Invoices, Prior Returns   │
│  • Reconstructed Facts: Reconciled Incomes, Categorized Expenses       │
│  • Evidence Graph Pointers: Hashes, Lineage DAGs, Source Feeds         │
│  • Tax Positions: Legal Hypotheses, Code Sections, Challenges          │
│  • Open Issues: Active Inquiries (Tax Inbox Cards)                     │
│  • Calculations: Deterministic Line-by-Line Math Results               │
│  • Review & Filing: Mode Sign-offs, Form 8879, MeF Submission State    │
│  • Audit Trail: Cryptographic Event Sequence of Every AI Mutation      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Formal Entity Schema References

A `TaxCase` maintains strict foreign key references and normalized sub-collections across 26 canonical domains:

```typescript
export interface TaxCase {
  id: string;                          // UUID v4
  tenantId: string;                    // Organization / Firm Partition
  businessId?: string;                 // Associated Business / LLC if applicable
  taxYear: number;                     // e.g. 2026
  lifecycleState: TaxCaseState;        // Current State Machine Position
  
  // 1. Identity & Household
  taxpayerId: string;
  spouseId?: string;
  dependentIds: string[];
  residencyPeriods: ResidencyPeriod[];
  activeJurisdictions: string[];       // ['US-FED', 'US-CA', 'US-NY']
  
  // 2. Financial & Business Graph
  businessEntityIds: string[];
  connectedAccountIds: string[];
  documentIds: string[];
  transactionIds: string[];
  incomeSourceIds: string[];
  assetIds: string[];
  
  // 3. Tax Intelligence & Positions
  reconstructedFactIds: string[];
  evidenceIds: string[];
  appliedRuleSetVersions: Record<string, string>; // { 'US-FED': '2026.1', 'US-CA': '2026.1' }
  taxPositions: TaxPosition[];
  
  // 4. Orchestration & Resolution
  openIssues: TaxIssue[];
  pendingQuestions: TaxQuestion[];
  activeTasks: AgentTask[];
  agentRuns: AgentRunRecord[];
  
  // 5. Calculation, Review & Filing
  deterministicCalculations: CalculationResult[];
  professionalReviews: ProfessionalReviewRecord[];
  filingSubmission?: FilingSubmission;
  noticeIds: string[];
  
  // 6. Audit & Provenance
  auditTrail: AuditEvent[];
  createdAt: string;                   // ISO 8601
  updatedAt: string;                   // ISO 8601
  lockVersion: number;                 // Optimistic Concurrency Control
}
```

---

## 3. The 20-State Deterministic State Machine

A `TaxCase` transitions through strict, deterministic workflow states. No stage may be skipped.

```mermaid
stateDiagram-v2
    [*] --> NEW: Case Created
    NEW --> DATA_COLLECTION: Plaid/Stripe Connected or TaxDrop Initiated
    DATA_COLLECTION --> DATA_PROCESSING: Raw Uploads Complete
    DATA_PROCESSING --> FACT_RECONSTRUCTION: Documents Extracted & Hashed
    FACT_RECONSTRUCTION --> INVESTIGATION: Transactions Normalized & Reconciled
    INVESTIGATION --> RULE_APPLICATION: Expenses & Deductions Classified
    RULE_APPLICATION --> POSITION_PROPOSAL: Applicable Code Sections Mapped
    POSITION_PROPOSAL --> POSITION_CHALLENGE: Tax Positions Formulated
    POSITION_CHALLENGE --> EVIDENCE_VALIDATION: IRS Challenger Validates Positions
    EVIDENCE_VALIDATION --> CALCULATION: Evidence DAG Verified
    CALCULATION --> RECONCILIATION: Deterministic Engine Computes Return
    RECONCILIATION --> USER_REVIEW: Line 8 / Schedule C / 1040 Balanced
    USER_REVIEW --> PROFESSIONAL_REVIEW: Taxpayer Confirms Tax Inbox Cards
    PROFESSIONAL_REVIEW --> READY_TO_FILE: EA/CPA/Attorney Signs Workpapers
    READY_TO_FILE --> SIGNED: Form 8879 e-Signed
    SIGNED --> SUBMITTED: Transmitted to IRS/State MeF
    SUBMITTED --> ACCEPTED: IRS/State Acknowledgement Received
    SUBMITTED --> REJECTED: MeF Error Code Returned
    REJECTED --> INVESTIGATION: Exception Remediation
    ACCEPTED --> CLOSED: Filing Archived & Tax Twin Activated
    CLOSED --> AMENDMENT: Post-Filing 1040-X Adjustment
    AMENDMENT --> INVESTIGATION
```

### State Definitions:
1. `NEW`: Case initialized for taxpayer and tax year.
2. `DATA_COLLECTION`: Active gathering of financial connections and document drops.
3. `DATA_PROCESSING`: OCR extraction, format validation, document splitting, duplicate detection.
4. `FACT_RECONSTRUCTION`: Income sources, transaction normalization, bank vs. processor reconciliation.
5. `INVESTIGATION`: Categorizing spend, investigating business purpose under IRC § 162.
6. `RULE_APPLICATION`: Resolving federal and state tax rules against reconstructed facts.
7. `POSITION_PROPOSAL`: Deduction Hunter and Credit Hunter formulate candidate positions.
8. `POSITION_CHALLENGE`: IRS Challenger agent stress-tests proposed positions against audit standards.
9. `EVIDENCE_VALIDATION`: Evidence Examiner confirms documentary proof meets IRC § 274 substantiation.
10. `CALCULATION`: Deterministic calculation engine compiles numbers onto official tax forms.
11. `RECONCILIATION`: Triple-checking return math against general ledger, bank balances, and W-2/1099s.
12. `USER_REVIEW`: Taxpayer reviews high-level summary and answers minimal Tax Inbox cards.
13. `PROFESSIONAL_REVIEW`: Credentialed EA or CPA reviews AI Review Brief and approves positions.
14. `READY_TO_FILE`: Forms 1040 and state returns compiled into compliant MeF XML payloads.
15. `SIGNED`: Taxpayer and paid preparer execute electronic signatures (Form 8879).
16. `SUBMITTED`: Cryptographically secured MeF package transmitted to IRS and state gateways.
17. `ACCEPTED`: Official IRS/State XML acknowledgment received with submission tracking number.
18. `REJECTED`: MeF business rule validation error received; routes directly to rejection triage.
19. `AMENDMENT`: Superseding or amended return (Form 1040-X) initiated due to subsequent 1099-C/K.
20. `CLOSED`: Case finalized, archived in immutable storage, and continuously monitored by Tax Twin.

---

## 4. The Tax Issue Lifecycle

Independent of the top-level case state, individual tax questions, missing documents, and discrepancies are tracked as discrete **Tax Issues**:

```mermaid
stateDiagram-v2
    [*] --> DISCOVERED: Discrepancy or Missing Fact Detected
    DISCOVERED --> INVESTIGATING: Agent Analyzes Surrounding Context
    INVESTIGATING --> AWAITING_EVIDENCE: Supporting Receipt or Statement Missing
    INVESTIGATING --> AWAITING_USER: User Clarification Required (Tax Inbox)
    INVESTIGATING --> AWAITING_PROFESSIONAL: Statutory Ambiguity Escalated to CPA
    AWAITING_EVIDENCE --> RESOLVED: Document Uploaded & Matched
    AWAITING_USER --> RESOLVED: Taxpayer Answers Card
    AWAITING_PROFESSIONAL --> RESOLVED: Professional Signs Off on Treatment
    INVESTIGATING --> REJECTED: Deduction Disallowed under Tax Code
    AWAITING_PROFESSIONAL --> ESCALATED: Legal Conflict Escalated to Tax Attorney
    ESCALATED --> RESOLVED: Attorney Legal Assessment Recorded
```
