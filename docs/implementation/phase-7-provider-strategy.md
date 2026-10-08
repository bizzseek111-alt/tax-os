# Phase 7 — Indirect Tax Provider Strategy & Architecture

## 1. Hybrid Provider Strategy
Following the comparative evaluation of Avalara, Stripe Tax, TaxJar, Anrok, and Vertex O Series (documented in `/docs/sales-tax/provider-evaluation.md`), TaxOS implements a **Native Deterministic Hybrid Architecture**:

```
                       ┌───────────────────────────────────────────────┐
                       │          TaxOS Sales Tax Domain               │
                       │  (Nexus Engine, Catalog, Sourcing, Returns)   │
                       └───────────────────────┬───────────────────────┘
                                               │
                                               ▼
                       ┌───────────────────────────────────────────────┐
                       │           Address & Jurisdiction              │
                       │             Composite Provider                │
                       └───────┬───────────────────────────────┬───────┘
                               │                               │
                               ▼                               ▼
               ┌───────────────────────────────┐ ┌───────────────────────────────┐
               │  TaxOS Native Engine (Local)  │ │   External Provider Adapter   │
               │  - Sub-15ms cached lookups    │ │   - Avalara / Stripe / Anrok  │
               │  - Deterministic CA/NY/NJ/IL  │ │   - Multi-country / Exotics   │
               │  - Zero per-calc vendor fee   │ │   - Secondary reconciliation  │
               └───────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Pluggable Filing Provider Interface (`SalesTaxFilingProvider`)
The filing interface abstracts state submission channels:
```typescript
export interface SalesTaxFilingProvider {
  prepareReturn(returnId: string): Promise<PreparedReturnPayload>;
  validateReturn(payload: PreparedReturnPayload): Promise<ValidationResult>;
  submitReturn(returnId: string, credentials: EncryptedCredentials): Promise<FilingReceipt>;
  getStatus(filingReceiptId: string): Promise<FilingStatus>;
  submitPayment(paymentId: string, auth: PaymentAuthorization): Promise<PaymentReceipt>;
  amendReturn(originalReturnId: string, modifications: ReturnDiff): Promise<PreparedReturnPayload>;
}
```

---

## 3. Core Architectural Guarantees
1. **Zero External Latency Dependency**: Core launch states (CA, NY, NJ, IL, MA) calculate in-process with sub-15ms latencies.
2. **Deterministic Reproducibility**: Exact rates, citations, and rules are locked into versioned state tables (`2026.1`), preventing vendor rate drift.
3. **Audit Defense**: Every calculation line preserves component rates (state, county, city, special district) for granular schedule reporting.
