# ADR-003: Tri-Graph Topology: Tax Graph, Evidence Graph & Tax Rule Graph

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
Tax compliance requires harmonizing three fundamentally distinct domains:
1. What economically happened in the taxpayer's life (facts).
2. What physical or cryptographic proof substantiates those events (evidence).
3. What statutory legal framework governs those events for a given tax year and jurisdiction (rules).

Conflating these three domains into a monolithic data store creates intractable bugs (e.g., modifying a tax rule alters raw bank records, or updating an OCR transcript breaks legal citations).

## 2. Decision
**We implement a Tri-Graph Topology connecting through the canonical `TaxCase`:**
1. **The Tax Graph**: Structured model of the taxpayer's objective financial reality (people, entities, accounts, transactions, assets).
2. **The Evidence Graph**: Directed acyclic graph tracing numbers to cryptographic SHA-256 document proofs and OAuth feeds.
3. **The Tax Rule Graph**: Declarative, versioned graph of primary statutory authorities (IRC, Treasury Regs, state codes).

## 3. Alternatives Considered
* *Alternative A: Monolithic Relational Database Modeling IRS Form Lines Directly* — Rejected. Tightly couples the software to IRS tax form layouts; fails when form numbers change or when modeling multi-state returns.
* *Alternative B: Pure Document Store (No Structured Knowledge Graph)* — Rejected. Fails cross-document reconciliation and duplicate detection between 1099s and bank deposits.

## 4. Trade-Offs & Consequences
* **Positive**: Absolute modularity; clean separation between objective facts, evidence proof, and legal statutes; enables instantaneous "Prove This Number" reverse lineage.
* **Negative**: Requires maintaining graph relationship tables and synchronizing graph projections into relational query stores.

## 5. Security & PII Implications
PII is concentrated in the Tax Graph and isolated behind encryption vaults; the Tax Rule Graph is completely public and contains zero taxpayer data.

## 6. Tax & Legal Implications
Ensures complete compliance with the statutory burden of proof (IRC § 6001, IRC § 274). The system can produce instant substantiation dossiers organized by statutory code section.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review state-specific digital receipt retention standards (e.g., NY DTF electronic record-keeping guidance) to ensure Evidence Graph SHA-256 CAS storage meets state audit admissibility requirements.

## 8. Future Migration Considerations
The Tax Rule Graph can be scaled to support all 50 states and international tax treaties without modifying the Tax Graph or Evidence Graph schemas.
