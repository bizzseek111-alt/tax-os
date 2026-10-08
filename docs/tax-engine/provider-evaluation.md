# Tax Engine Provider Evaluation Spike & Integration Strategy

**TaxOS Architecture RFC: Phase 3 Calculation Engines**  
**Classification:** Enterprise Fintech / Regulated Tax Technology  
**Status:** Approved & Implemented  
**Rule Set Version:** 2026.1  

---

## 1. Executive Summary

Autonomous TaxOS enforces a foundational principle: **LLMs are NEVER authoritative tax calculators.** Authoritative calculation must originate exclusively from deterministic code or an approved external calculation engine.

This document evaluates whether TaxOS should rely exclusively on an internal deterministic calculation engine, integrate third-party commercial calculation APIs (e.g., Corvee, Avalara, Vertex, TaxBit, Thomson Reuters / CCH Axcess), or deploy a hybrid dual-run architecture.

---

## 2. Commercial Tax Engine Provider Evaluation

| Provider | Target Domain | Strengths | Critical Drawbacks for TaxOS | Integration Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **TaxOS Native Deterministic Engine** | Individual (Form 1040), Schedule C, Multi-State (CA, NY, NJ, IL, MA) | • Sub-millisecond latency (<5ms)<br>• Zero external API cost<br>• 100% explainable lineage DAG ("Prove This Number")<br>• Strict BigInt cent arithmetic (IRC § 6102)<br>• Offline testability with SHA-256 reproducibility | Engineering maintenance required for annual statutory updates | **PRIMARY AUTHORITATIVE ENGINE** |
| **Corvee Tax Planning** | High Net Worth & Small Business Tax Planning | Strong optimization heuristics for multi-entity structures | • Proprietary closed-source formulas<br>• Black-box calculations lacking line-by-line lineage DAG<br>• High enterprise SaaS cost per seat | **SECONDARY COMPARISON SPIKE** (Future Phase 4) |
| **Thomson Reuters UltraTax / CCH Axcess APIs** | Institutional CPA Preparation & E-Filing | Comprehensive 50-state coverage, form rendering | • Legacy SOAP/REST latency (800ms - 3,500ms)<br>• Extremely restrictive developer access & licensing<br>• Tight coupling to proprietary legacy workpapers | **BENCHMARK AUDIT SOURCE** |
| **Avalara / Vertex** | Indirect Tax (Sales & Use Tax, Telecom, VAT) | Dominant enterprise indirect tax engine with address geocoding | Primarily indirect tax; weak individual Form 1040 income tax support | **RESERVED FOR SALES TAX WORKSTREAM** |
| **TaxBit** | Digital Asset Accounting & IRS Information Reporting | IRS 1099-DA compliance, FIFO/HIFO digital asset lot relief | Specialized solely for crypto basis tracking; not a Form 1040 engine | **UPSTREAM EVIDENCE SOURCE** |

---

## 3. Dual-Run Architecture & Shadow Mode Verification

TaxOS adopts a **Dual-Run Provider Architecture** specified in `src/server/services/taxCalculation/provider.ts`:

```
               ┌──────────────────────────────────────────────┐
               │         TaxCase Confirmed Fact Graph         │
               └──────────────────────┬───────────────────────┘
                                      │
                         Normalized FederalTaxInput
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
        ┌──────────────────────┐              ┌──────────────────────┐
        │  TaxOS Deterministic │              │ Commercial Provider  │
        │     Native Engine    │              │ (Shadow Mode API)    │
        └──────────┬───────────┘              └──────────┬───────────┘
                   │                                     │
                   │ <5ms latency                        │ ~1,200ms latency
                   ▼                                     ▼
        ┌──────────────────────┐              ┌──────────────────────┐
        │ Internal Result +    │              │ Vendor Result Hash   │
        │ Lineage DAG          │              │ & Form Snapshot      │
        └──────────┬───────────┘              └──────────┬───────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │ Discrepancy Detector      │
                        │ |Delta| > $1.00 Alert     │
                        └───────────────────────────┘
```

### Key Principles of Dual-Run Strategy:
1. **Zero-Latency Path:** The TaxOS Native Deterministic Engine runs synchronously on the primary API request path to power instant UI reactivity and interactive Tax Twin simulations.
2. **Asynchronous Verification Worker:** For high-complexity returns, a background BullMQ queue worker dispatches the normalized snapshot to external benchmark engines.
3. **Discrepancy Threshold:** Any variance between internal calculations and external benchmarks exceeding **\$1.00 (100 cents)** triggers a high-priority exception for CPA/EA inspection with automated lineage comparisons.

---

## 4. Latency & Unit Economics Comparison

| Metric | TaxOS Native Engine | External Commercial API | Advantage |
| :--- | :--- | :--- | :--- |
| **Execution Latency** | **1.8 ms** (in-memory CPU) | 850 ms – 3,200 ms (HTTP payload) | **>400x faster** |
| **Cost Per Calculation Run** | **$0.00** | $0.25 – $1.50 per API call | **100% cost reduction** |
| **Tax Twin What-If Real-Time Slider** | Supported (instant reactive feedback) | Prohibitive (rate limits and latency) | **Essential for UX** |
| **Auditability & Provenance** | Bit-for-bit SHA-256 reproducibility + node DAG | Vendor opacity | **Regulatory compliance** |
| **Data Privacy & SOC 2** | PII never leaves internal tenant perimeter | Third-party PII transmission exposure | **Zero external exposure** |

---

## 5. Conclusion & Recommendation

1. **Phase 3 Authoritative Core:** The TaxOS Native Deterministic Engine is established as the primary, authoritative calculation engine for individual federal income tax and the 5 launch states (CA, NY, NJ, IL, MA).
2. **Provider Interface Extensibility:** All calculations execute behind the `TaxEngineProvider` interface, allowing pluggable external providers to be enabled per-tenant or per-organization without refactoring application services.
