# TaxOS Enterprise Typography System

**Document Version:** 3.0.0  
**Primary Sans-Serif:** Plus Jakarta Sans (with fallback to Inter, -apple-system, system-ui)  
**Specialized Monospace:** JetBrains Mono (restricted to cryptographic hashes, system telemetry, and IDs)

---

## 1. Typeface Governance & Hierarchy Doctrine

### 1.1 The Primary Font: Plus Jakarta Sans
Plus Jakarta Sans is chosen for its geometric legibility, warm modern humanist proportions, and exceptional clarity at both micro-scale (table data) and macro-scale (marketing display headlines).

### 1.2 The Strict Monospace Boundary
In previous prototype iterations, monospace was inadvertently applied to legal statutes, section descriptions, and tax return form lines, creating visual noise and reader fatigue.
- **PROHIBITED:** Monospace on statutory citations (e.g., `26 U.S.C. § 162`), explanatory paragraphs, table labels, or button copy.
- **PERMITTED ONLY ON:**
  1. Cryptographic SHA-256 hashes (`sha256:7b1e8d91...`)
  2. Transaction and document UUIDs (`doc-17912401`)
  3. IRS MeF submission IDs (`MEF-2026-981024`)
  4. PTIN / State Bar numbers in technical headers (`#P01948291`)
  5. Terminal logs in platform admin telemetry.

---

## 2. Complete Typographic Token Matrix

| Token Name | Font Size | Line Height | Tracking (Letter Spacing) | Weight | Tailwind Class Equivalent | Canonical Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`type-display`** | 3.5rem (56px) | 1.15 | `-0.025em` | 800 (Extrabold) | `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight` | Marketing hero headlines |
| **`type-h1`** | 2.5rem (40px) | 1.2 | `-0.02em` | 800 (Extrabold) | `text-3xl sm:text-4xl font-extrabold tracking-tight` | Page titles, primary dashboard headings |
| **`type-h2`** | 1.875rem (30px)| 1.25 | `-0.015em` | 700 (Bold) | `text-2xl sm:text-3xl font-bold tracking-tight` | Major section titles, modal headers |
| **`type-h3`** | 1.375rem (22px)| 1.3 | `-0.01em` | 600 (Semibold) | `text-xl sm:text-2xl font-bold` | Card headlines, feature titles |
| **`type-h4`** | 1.125rem (18px)| 1.35 | `normal` | 600 (Semibold) | `text-lg font-semibold` | Subsections, card group titles |
| **`type-body-lg`** | 1.125rem (18px)| 1.55 | `normal` | 400 (Regular) | `text-lg text-neutral-600 leading-relaxed` | Hero subheadings, lead summaries |
| **`type-body`** | 0.9375rem (15px)| 1.5 | `normal` | 400 (Regular) | `text-sm sm:text-base text-neutral-800 leading-normal` | Primary reading paragraphs, form fields |
| **`type-small`** | 0.8125rem (13px)| 1.45 | `normal` | 500 (Medium) | `text-xs sm:text-sm text-neutral-600` | Secondary descriptions, table cells |
| **`type-caption`** | 0.75rem (12px) | 1.3 | `+0.02em` | 700 (Bold) | `text-xs font-bold uppercase tracking-wider` | Status pills, table column headers |
| **`type-mono`** | 0.8125rem (13px)| 1.4 | `normal` | 500 (Medium) | `font-mono text-xs text-neutral-700` | Cryptographic hashes, technical IDs |

---

## 3. Typographic Spacing & Readability Rules

1. **Optimal Measure (Line Length):** Paragraph blocks on marketing and content pages are constrained to a maximum width of 65 characters (`max-w-2xl` or `max-w-3xl`) to maintain comfortable reading cadence.
2. **Tabular Figures:** All numeric displays in financial tables, tax summaries, and balance sheets utilize OpenType tabular numbers (`tabular-nums`) to ensure vertical alignment of digits across comparison columns.
3. **Leading (Line-Height) Proportions:** Tight line-heights are strictly reserved for large display titles (where loose leading creates disjointed sentences). Narrative text enforces minimum `leading-relaxed` (1.55 to 1.6) to prevent crowded text blocks.
