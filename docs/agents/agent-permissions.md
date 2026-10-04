# Autonomous Tax OS — Agent Permission Matrix & Capability Guardrails

> **Status**: Approved System Specification  
> **Document Version**: 1.0.0  
> **Security Baseline**: Principle of Least Privilege (PoLP) with Cryptographic Enforcement  
> **Enforcement Engine**: `AgentPermissionController`  

---

## 1. Permission Architecture Overview

In Autonomous Tax OS, **no agent possesses ambient or unrestricted system access**. Every agent execution is encapsulated in an isolated runtime sandbox parameterized by an immutable `AgentPermissionGrant`:

```typescript
export interface AgentPermissionGrant {
  grantId: string;
  agentName: string;
  taxCaseId: string;
  tenantId: string;
  
  // 1. Data Access Limits
  allowedReadPaths: string[];         // e.g. ["case.facts.*", "case.evidence.metadata"]
  allowedWritePaths: string[];        // e.g. ["case.positions.candidates"]
  
  // 2. Tool Whitelist
  allowedTools: string[];             // e.g. ["rule_graph_search", "citation_lookup"]
  
  // 3. Jurisdictional Scope
  allowedJurisdictions: string[];     // e.g. ["US-FED", "US-CA"]
  
  // 4. Privacy & PII Clearance
  piiClearanceLevel: 'ANONYMIZED' | 'MASKED' | 'UNMASKED_PII_CLEARANCE';
  canAccessRawSsn: boolean;           // STRICT: False for 99% of agents
  canAccessRawBankNumbers: boolean;
  
  // 5. Ephemeral Budgets
  maxExecutionTimeMs: number;
  maxTokenBudget: number;
}
```

---

## 2. Exemplary Agent Permission Profiles

```
┌────────────────────────────────────────────────────────────────────────┐
│ DEDUCTION HUNTER PERMISSION PROFILE                                    │
├────────────────────────────────────────────────────────────────────────┤
│ ✅ MAY READ: Reconstructed expenses, merchant categories, bank debits  │
│ ✅ MAY READ: Tax Rule Graph conditions and statutory citations        │
│ ✅ MAY WRITE: Propose candidate tax positions to TaxCase scratchpad   │
│ ✅ MAY CALL TOOLS: rule_graph_query, precedent_search, calculate_cap   │
│ ❌ CANNOT WRITE: Authoritative tax returns, final filed forms          │
│ ❌ CANNOT WRITE: Authoritative tax rules or statutory thresholds       │
│ ❌ CANNOT CALL: MeF transmission tools, e-signature tools             │
│ ❌ PII CLEARANCE: MASKED (Receives masked SSNs and transaction notes)  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ SUBMISSION / FILING AGENT PERMISSION PROFILE                           │
├────────────────────────────────────────────────────────────────────────┤
│ ✅ MAY READ: Final validated tax forms, Form 8879 signature manifests   │
│ ✅ MAY READ: IRS MeF transmission endpoints and ERO credentials        │
│ ✅ MAY CALL TOOLS: mef_soap_transmit, mef_poll_status, archive_ack     │
│ ❌ CANNOT READ: Raw merchant search queries or intermediate scratchpads│
│ ❌ CANNOT WRITE: Modifying numbers or altering form lines              │
│ ❌ CANNOT CALL: LLM completion tools (Zero AI during transmission)     │
│ ⚠️ PII CLEARANCE: UNMASKED_PII (Transmits final encrypted payload)     │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ TAX RULE RESOLVER PERMISSION PROFILE                                   │
├────────────────────────────────────────────────────────────────────────┤
│ ✅ MAY READ: Tax Rule Graph nodes for active tax year and state        │
│ ✅ MAY CALL TOOLS: json_logic_evaluate, conformity_matrix_lookup        │
│ ❌ CANNOT READ: Taxpayer SSNs, banking credentials, or addresses       │
│ ❌ CANNOT WRITE: TaxCase state mutations directly                      │
│ ❌ CANNOT MODIFY: Rule definitions (Read-only access to Rule Graph)    │
│ ❌ PII CLEARANCE: ANONYMIZED (Zero PII access required)                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Comprehensive Domain Permission Matrix

| Supervisory Domain | Read Scope | Write Scope | Authorized Tool Groups | PII Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **0. Orchestration** | Case Metadata, State, Issue Registry | State Machine, Task DAG, Locks | `state_transition`, `scheduler`, `dispatch` | Masked |
| **1. Intake** | Raw Uploads, File Hashes, OCR Buffers | `TaxDocument`, `Household`, `Dependent` | `ocr_extract`, `doc_split`, `id_verify` | Masked |
| **2. Financial Intel** | Bank Ledgers, Invoices, Processor Feeds | `Transaction`, `Expense`, `IncomeSource` | `txn_clean`, `match_receipt`, `eliminate_dupe` | Masked |
| **3. Tax Intel** | Facts, Tax Rule Graph, Primary Law | `TaxPosition` Candidates, Issues | `rule_query`, `citation_lookup`, `qbi_calc` | Anonymized |
| **4. Verification** | Lineage DAG, Evidence Hashes, Return Lines | Audit Flags, Risk Scores, Inbox Cards | `adversarial_audit`, `lineage_verify`, `q_gen` | Masked |
| **5. Calculation & Filing** | Validated Forms, 8879 Manifests | Return Compilation, MeF Submissions | `det_calc`, `xml_compile`, `mef_transmit` | Unmasked (Gateway Only) |
| **6. Professional Review** | Full Case, AI Review Brief, Overrides | CPA Sign-off, PTIN Seal, Legal Memos | `brief_gen`, `pro_sign`, `override_log` | Masked (CPA) / Clear (Atty) |
| **7. Planning** | Historical Returns, Current Trajectory | Scenarios, Estimated 1040-ES Vouchers | `scenario_sim`, `safe_harbor_calc`, `notice_ocr` | Masked |
| **8. Platform Safety** | Telemetry, Audit Logs, Rule Proposals | Security Kill Switches, Versioned Rules | `rule_diff`, `regression_run`, `token_revoke` | Anonymized / Redacted |
