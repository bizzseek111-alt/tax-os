# Live Tax Authority Runtime & Real-Time Research Architecture

## 1. Executive Summary

Autonomous TaxOS Phase 11A establishes a **Live Tax Authority Runtime** that replaces static LLM pre-trained memory with a real-time, 5-tier authoritative knowledge hierarchy. The fundamental hard invariant of TaxOS is:

> **An LLM's pre-trained memory is NEVER authoritative tax law.**
> Every tax conclusion, position, and parameter must trace directly to an official government primary authority, verified statutory citation, content hash, effective date range, and precedential ranking.

---

## 2. Five-Tier Knowledge Hierarchy

```
Level 1: Approved Structured TaxRule Graph (Fast In-Memory / Indexed Lookup)
   │
   ▼ (if missing, unverified, draft, or expired)
Level 2: Ingested & Verified Tax Authority Library (Hybrid RAG Vector + Keyword)
   │
   ▼ (if ambiguous, confidence < 0.85, high materiality, or changed hash)
Level 3: Live Official-Source Research (Agency Portals & Statutory Repositories)
   │
   ▼ (if multi-state residency, nexus conflict, or cross-border interaction)
Level 4: Deep Multi-Authority Coordinator (MultiStateCoordinator)
   │
   ▼ (if irreconcilable conflict, circuit split, or exposure > $25,000)
Level 5: Human Tax Professional / Legal Escalation (CPA / Attorney Research Brief)
```

### Knowledge Tiers Detailed

1. **Level 1 — Approved TaxRule Graph (`FAST` Tier):**
   - Pre-computed, CPA/Attorney signed-off rule nodes.
   - Sub-millisecond execution. Evaluates taxpayer facts against codified conditions.
   - Gated by source freshness: bypassed to Level 3 if source TTL has expired or content hash changed.

2. **Level 2 — Tax Authority Library (`NORMAL` Tier):**
   - Hybrid dense vector embedding + BM25 statutory citation indexing.
   - Searches authoritative statutes, Treasury Regulations, IRS revenue rulings, and state tax codes previously ingested and verified.

3. **Level 3 — Live Official-Source Research (`DEEP` Tier):**
   - Connectors query live official agency portals (`irs.gov`, `ftb.ca.gov`, `tax.ny.gov`, `tax.illinois.gov`, `mass.gov`).
   - Cryptographic verification via SHA-256 hashes against authorized government domain whitelists.
   - Triggers TaxRuleCandidate generation when novel rules are discovered.

4. **Level 4 — Multi-State Coordinator (`DEEP` Tier):**
   - Resolves cross-border tax conflicts: domicile vs statutory residency (183-day rule), convenience of employer rules (NY 20 NYCRR § 132.18 vs NJ resident credits N.J.S.A. § 54A:4-1), and state decoupling modifications.

5. **Level 5 — Legal Escalation & Professional Review (`EXPERT` Tier):**
   - Assembles automated formal **AI Research Briefs**.
   - Evaluates substantial authority (IRC § 6662 penalty relief, 40%+ likelihood) and reasonable basis standards.
   - Persists `AuthorityConflict` records for human CPA/Attorney resolution.

---

## 3. Strict Context Enforcement & Anti-Hallucination Invariants

1. **Mandatory Research Context:**
   - If `taxYear` or `jurisdictions` are missing, the runtime **strictly refuses to guess or speculate**.
   - Returns a structured `MissingResearchContext` object specifying required inputs.

2. **Official Domain Whitelist:**
   - Commercial blogs, SEO marketing sites (`turbotax.intuit.com`, `medium.com`, `reddit.com`) are banned.
   - Citations not found in registered government corpora trigger `HALLUCINATION_DETECTED`.

3. **Separation of Calculation & Research:**
   - The research runtime identifies **applicable rules, thresholds, and statutory parameters**.
   - **Deterministic Engines** (Federal, State, Sales, Payroll) compute actual tax liabilities. AI never calculates tax dollars.
