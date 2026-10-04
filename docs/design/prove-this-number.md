# Autonomous Tax OS — "Prove This Number" Lineage Specification
**Status:** Canonical Explainability & Provenance Architecture  
**Guarantee:** 100% Deterministic Traceability from Tax Return Line Item to Primary Source Receipt and Governing Statute.

---

## 1. Lineage DAG Architecture

Whenever a user or CPA clicks any number on the dashboard or tax summary (e.g. `$18,490` on Schedule C Other Expenses), the **Prove This Number** drawer opens, revealing the exact Directed Acyclic Graph (DAG) of the figure:

```mermaid
graph TD
    LineItem["Final Tax Line Item:<br>Schedule C (Form 1040) Line 27a: $18,490"]
    Rule["Governing Statutory Authority:<br>26 U.S.C. § 162(a) Ordinary & Necessary"]
    Agg["Sub-Category Breakdown:<br>Cloud Hosting & SaaS Subscriptions: $18,490"]
    Tx1["Tx #1092: AWS Cloud Infrastructure: $14,200"]
    Tx2["Tx #1093: GitHub Enterprise & Vercel: $4,290"]
    Receipt1["Source Artifact:<br>AWS Invoice #INV-8491 (SHA-256: e3b0c4...)"]
    Receipt2["Source Artifact:<br>Stripe Card Receipt #STR-9021 (SHA-256: 4f82a1...)"]

    LineItem --> Rule
    LineItem --> Agg
    Agg --> Tx1
    Agg --> Tx2
    Tx1 --> Receipt1
    Tx2 --> Receipt2
```

---

## 2. Drawer Interaction Details

1. **Step-by-Step Mathematical Provenance**:
   - Shows the exact formula applied: $\sum \text{Transactions} - \text{Disallowed Personal} = \text{Deductible Net}$.
2. **Statutory Justification in Plain English**:
   - Explains *why* the expense is legally deductible under current IRS regulations.
   - Highlights any state-level non-conformity (e.g. "Deductible 100% on Federal return; California conforms under Cal. RTC § 17201").
3. **Receipt Preview & Verification Hash**:
   - In-app thumbnail preview of the parsed invoice or receipt with OCR bounding boxes over vendor name, date, and line items.
   - Cryptographic SHA-256 document fingerprint linking to the Evidence Graph.
