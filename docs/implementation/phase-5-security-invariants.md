# Phase 5 — Multi-Agent Security Invariants & Compliance Architecture

## 1. Executive Summary

In a production financial and tax compliance system, autonomous agents represent significant security and regulatory risk if not strictly bounded. Autonomous Tax OS Phase 5 implements six hard non-negotiable **Security Invariants**.

---

## 2. The Six Security Invariants

### Invariant 1: Zero Autonomous Tax Filing
- **Guarantee**: No AI agent possesses the authority, tool, or API token required to electronically transmit a tax return to the IRS or state tax agency.
- **Enforcement**: The `TaxCaseSupervisor` pipeline strictly terminates at status `READY_FOR_USER_REVIEW` or `READY_FOR_PROFESSIONAL_REVIEW`. Attempting to set status to `TRANSMITTED` or `FILED` from agent code throws a fatal exception.

### Invariant 2: Prompt Injection Sanitization
- **Guarantee**: Untrusted text from user uploads, receipt merchant strings, or transaction notes cannot override agent system instructions.
- **Enforcement**: `BaseAgent.sanitizeUntrustedText()` strips prompt injection markers, instruction override tokens (`ignore previous instructions`, `system prompt:`, `[INST]`), and isolates raw input in inert JSON data wrappers.

### Invariant 3: Principle of Least Privilege
- **Guarantee**: An agent can only invoke tools and access database tables explicitly permitted in its capability matrix.
- **Enforcement**: `AgentPermissionController.assertToolAllowed()` and `assertTableAllowed()` evaluate every invocation before execution.

### Invariant 4: Strict State Jurisdiction Isolation
- **Guarantee**: State-specific tax agents cannot access or alter data outside their permitted jurisdiction.
- **Enforcement**: `AgentPermissionController.assertJurisdictionAllowed()` blocks cross-state leakage (e.g. `CALIFORNIA_TAX_AGENT` cannot query NY-DTF records or process New York allocations).

### Invariant 5: Cryptographic Run Signatures
- **Guarantee**: Agent runs cannot be forged, retroactively altered, or silently deleted.
- **Enforcement**: Every completed `AgentRun` computes a SHA-256 `signatureHash` binding `runId`, `agentType`, `status`, and `result`. Tampered records fail cryptographic audit validation.

### Invariant 6: Instant Operational Kill Switches
- **Guarantee**: Any agent, model provider, jurisdiction, or rule can be disabled in real-time without code deployment.
- **Enforcement**: `KillSwitchManager.assertNotKilled()` is evaluated on every agent lifecycle event. Tripped kill switches immediately abort execution and fail safe.
