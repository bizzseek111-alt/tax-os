# Strict Citation Validation & Anti-Hallucination Guard

## 1. The Legal Hallucination Vulnerability

LLMs routinely hallucinate non-existent statutory sections, fabricate IRS revenue rulings, or cite repealed laws with high verbal confidence. In a tax compliance system, citing a fabricated law on a return or audit defense statement constitutes severe professional malpractice and can trigger IRC § 6694 tax preparer penalties.

---

## 2. Real-Time Citation Validation Workflow

TaxOS implements zero-tolerance citation validation through `CitationValidator`:

```
Claimed Legal Citation (e.g., "26 U.S.C. § 280A")
  │
  ├── 1. Format & Code Extraction (Standardized Statutory Syntax)
  │
  ├── 2. Jurisdiction Connector Resolution (Official IRS / State Corpus)
  │
  ├── 3. Existence Verification in Official Source
  │      ├── NOT FOUND ──────────► REJECT: "HALLUCINATION_DETECTED"
  │      └── FOUND ──────────────► Proceed to Authenticity Checks
  │
  ├── 4. Official Domain Whitelist Check
  │      ├── Non-gov URL ────────► REJECT: "INVALID_CITATION"
  │      └── Official Gov URL ───► Proceed to Precedential Checks
  │
  ├── 5. Precedential & Supersession Check
  │      ├── Status SUPERSEDED ──► REJECT: "SUPERSEDED" (Weight 0.0)
  │      └── Status BINDING ─────► Pass to Proposition Linkage
  │
  └── 6. Proposition Semantic Alignment
         ├── Contradicts Text ───► REJECT: "INVALID_CITATION"
         └── Supports Claim ─────► STATUS: "VERIFIED"
```

---

## 3. Fine-Grained Proposition Graph

Rather than citing an entire 500-page Title 26 code block, TaxOS links claims at the pinpoint proposition level via `PropositionGraphService`:
- Links each claim directly to:
  - Exact statutory section/paragraph.
  - Pinpoint URL in authorized repository.
  - Raw authoritative source chunk.
  - 64-character SHA-256 content hash.
  - Authority rank and precedential weight.
