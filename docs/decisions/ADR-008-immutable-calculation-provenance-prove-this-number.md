# ADR-008: Immutable Calculation Provenance & "Prove This Number" Engine

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
In traditional tax software, values are stored as "black box" numbers on form fields (e.g., `Line_31_Net_Profit = 48500`). When taxpayers, reviewing CPAs, or IRS revenue agents ask:
* "Where did this number come from?"
* "Which receipts substantiate this line?"
* "What tax law justifies this deduction?"

The software cannot answer. The taxpayer is forced to manually scramble through folders of paper receipts and bank statements to defend the return.

## 2. Decision
**We mandate that every reported number on a tax return must be a pointer to an immutable Calculation Node in the Evidence Lineage Graph:**
* The platform provides an interactive **"Prove This Number"** reverse-lineage engine.
* Clicking any numerical figure instantly resolves its complete provenance:
  $$\text{Form Line} \longrightarrow \text{Calculation Node} \longrightarrow \text{Expenses} \longrightarrow \text{Transactions} \longrightarrow \text{Hashed Receipts} \longrightarrow \text{Statutory Rule} \longrightarrow \text{CPA Sign-Off}$$
* **Substantiation Guardrail**: Inferred or generated values are explicitly labeled as `INFERRED` and cannot be claimed as documentary proof without user or document substantiation.

## 3. Alternatives Considered
* *Alternative A: Storing Text Explanations in a Database Column* — Rejected. Static text descriptions lack cryptographic links to actual transaction IDs and receipt hashes.
* *Alternative B: Offline Excel Workpapers Generated Post-Hoc* — Rejected. Fragmented, prone to version desynchronization, and vulnerable to post-filing tampering.

## 4. Trade-Offs & Consequences
* **Positive**: Instant audit defense package generation; 100% taxpayer trust and explainability; frictionless CPA exception review; zero audit penalty exposure under IRC § 6662.
* **Negative**: Increases database storage requirements to maintain calculation dependency graphs and evidence hash pointers.

## 5. Security & PII Implications
Lineage traces respect field-level tokenization; viewing the underlying transactions requires appropriate case-level clearance.

## 6. Tax & Legal Implications
Directly satisfies the statutory substantiation requirements of IRC § 6001 and the heightened record-keeping mandates of IRC § 274 for travel, meals, and vehicles.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review IRS Revenue Procedure 97-22 (Electronic record retention requirements) to confirm that our SHA-256 CAS storage and PDF/A archiving format fully qualify as legally admissible books and records under IRS audit rules.

## 8. Future Migration Considerations
The lineage DAG can be serialized directly into emerging digital audit standards (e.g., OECD Standard Audit File for Tax - SAF-T) for international compliance.
