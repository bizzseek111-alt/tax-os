# Phase 4 — Statutory Structural Chunking vs. Naive Token Slicing

## 1. Problem: Why Naive Chunking Fails in Tax Law

Generic RAG systems use fixed token-size chunking (e.g. 500 tokens with 50-token overlap). In legal and tax corpora, naive token slicing causes critical failures:
1. **Clause Severance:** Slices statutory conditions away from their required exceptions (e.g., separating IRC § 199A(a) allowance from the § 199A(d) SSTB disqualification).
2. **Lost Hierarchy:** Slices subsection `(2)(A)` without retaining the context of subsection `(b)` and Section `§ 199A`.
3. **Table Destruction:** Cuts tax rate bracket tables or phaseout thresholds in half, creating hallucinated tax rates.

## 2. Solution: The TaxOS Statutory Structural Chunker

The `StatutoryChunker` (`src/server/services/taxAuthority/chunker.ts`) parses legal text into semantic statutory units:

```mermaid
graph TD
    A[Raw Code: 26 U.S.C. § 199A] --> B[Section Parser: § 199A]
    B --> C[Subsection Parser: (a), (b), (c)...]
    C --> D[Paragraph Parser: (1), (2), (3)...]
    D --> E[Subparagraph Parser: (A), (B)...]
    E --> F[Structural Chunk Output]
    F --> G[Section Path: 26 U.S.C. § 199A > b > 2 > A]
    F --> H[Rank 1 Statutory Context Preserved]
```

## 3. Structural Granularity Levels

| Level | Syntax Pattern | Example Path |
| :--- | :--- | :--- |
| **Title / Code** | `26 U.S.C.` / `Cal. RTC` | `26 U.S.C.` |
| **Section** | `§ [0-9]+[A-Z]?` | `§ 199A` |
| **Subsection** | `\([a-z]\)` | `§ 199A > (b)` |
| **Paragraph** | `\([0-9]+\)` | `§ 199A > (b) > (2)` |
| **Subparagraph** | `\([A-Z]\)` | `§ 199A > (b) > (2) > (A)` |
| **Clause** | `\([i|v|x]+\)` | `§ 199A > (b) > (2) > (A) > (i)` |

## 4. Form Instruction & Line Chunking

For administrative form instructions, the chunker identifies:
- Line designations (e.g., `Line 1z. Wages, salaries, tips`)
- Schedule boundaries (e.g., `Schedule C, Part II, Line 31`)
- Special worksheets (e.g., `Qualified Dividends and Capital Gain Tax Worksheet`)

Every chunk produced carries its complete hierarchical path, line numbers, authority rank, and precedential status directly into PostgreSQL (`TaxAuthorityChunk`).
