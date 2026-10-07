# TaxOS — Canonical Task Routing & AI-Human Collaboration Specification

> **Document Status**: Production Architecture Baseline  
> **Concept**: The Canonical `TaxTask` Aggregate  
> **Key Invariant**: AI and humans operate upon the **exact same TaxCase** state machine.  

---

## 1. The Canonical TaxTask Aggregate

The `TaxTask` is the universal operating unit routing compliance responsibilities between autonomous AI agents and human specialists.

```typescript
export type TaskOwnerType = 
  | 'AI' 
  | 'TAXPAYER' 
  | 'CPA' 
  | 'EA' 
  | 'PREPARER' 
  | 'ATTORNEY' 
  | 'SALES_TAX_SPECIALIST' 
  | 'PAYROLL_SPECIALIST' 
  | 'OPERATIONS';

export type TaskStatus = 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'AWAITING_INPUT' 
  | 'ESCALATED' 
  | 'RESOLVED' 
  | 'DISMISSED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaxTask {
  id: string;                                    // UUID v4
  taxCaseId: string;                             // Root TaxCase Aggregate Reference
  taxObligationId?: string;                      // Specific Sales/Payroll/Income Obligation
  jurisdiction: string;                          // 'US-FED', 'US-CA', 'US-NY', etc.
  taxDomain: 'INCOME_TAX' | 'SALES_USE_TAX' | 'PAYROLL_TAX' | 'EMPLOYER_COMPLIANCE';
  taskType: 
    | 'FACT_CONFIRMATION'                        // Taxpayer: Needs You Card
    | 'DOCUMENT_REQUEST'                         // Taxpayer: Missing 1099-B, W-2
    | 'ADVERSARIAL_CHALLENGE'                    // AI: IRS Challenger Audit
    | 'EXCEPTION_REVIEW'                         // CPA: AI Review Brief Item
    | 'STATUTORY_CONFLICT'                       // Attorney: Form 8275 Memo
    | 'NEXUS_REGISTRATION'                       // Sales Tax: State Permit Needed
    | 'WORKER_CLASSIFICATION'                    // Payroll: ABC Test Audit
    | 'PAYMENT_AUTHORIZATION'                    // Operations: Remittance Sign-off
    | 'EFILE_TRANSMISSION';                      // Preparer: MeF Submission
  
  ownerType: TaskOwnerType;                      // Who currently owns the action
  ownerId?: string;                              // Specific user UUID or Agent ID
  sourceAgent: string;                           // e.g., 'DeductionHunter', 'IrsChallenger'
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;                             // ISO 8601 statutory or SLA cutoff
  reason: string;                                // Why this task exists
  financialImpactCents?: number;                 // Dollar impact if confirmed
  requiredEvidence: string[];                    // Document types or transaction hashes needed
  resolutionDecision?: string;                  // Recorded human or consensus outcome
  auditRecordHash: string;                       // SHA-256 hash linking to WORM ledger
  createdAt: string;                             // ISO 8601
  resolvedAt?: string;                           // ISO 8601
}
```

---

## 2. End-to-End AI + Human Collaboration Lifecycle

AI agents and human practitioners never maintain separate databases or out-of-sync task trackers. Every action mutates the single shared `TaxPosition` and `TaxTask` records:

```mermaid
sequenceDiagram
    autonumber
    participant DH as Deduction Hunter Agent
    participant EA as Evidence Agent
    participant IC as IRS Challenger Agent
    participant TP as Taxpayer (Needs You)
    participant CE as Consensus Engine
    participant CPA as Reviewing CPA / EA
    participant TC as Canonical TaxCase State

    DH->>TC: Proposes Business Travel Deduction ($412.50 Delta flight)
    EA->>TC: Investigates and attaches Chase bank debit & flight receipt
    IC->>TC: Challenges: "Is trip 100% ordinary & necessary under IRC § 162?"
    IC->>TC: Spawns TaxTask (Owner: TAXPAYER, Type: FACT_CONFIRMATION)
    
    Note over TP: Taxpayer views single card in 'Needs You' queue
    TP->>TC: Taxpayer clicks "[✓ Yes, 100% Business Travel]"
    
    CE->>TC: Consensus Engine evaluates fact + evidence: Approves position
    CE->>TC: Spawns TaxTask (Owner: CPA, Type: EXCEPTION_REVIEW)
    
    Note over CPA: CPA views item in AI Review Brief (7.2 min review)
    CPA->>TC: CPA confirms deduction; locks workpaper
    CPA->>TC: Signs return with PTIN (MeF XML generated)
```

### Invariant: Single Source of Truth
* No separate "human workpapers" or "AI scratchpads" exist outside the audited `TaxCase`.
* Every mutation is signed, timestamped, and immutably appended to the hash-chained `AuditLedger`.
