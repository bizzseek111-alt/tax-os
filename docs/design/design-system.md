# Autonomous Tax OS — Design System Specification
**Status:** Living Design System  
**Framework:** React 18 / Tailwind CSS / Lucide Icons / KaTeX Math Rendering  
**Theme:** Financial Trust & High-Information Ergonomics

---

## 1. Design Tokens & Component Hierarchy

The design system is constructed from high-density, accessible components designed for financial data integrity and progressive disclosure.

```
Design System Architecture
├── Foundations
│   ├── Color Palette (Midnight Trust, Clear Blue, Emerald Growth, Neutral Slate)
│   ├── Typography Scale (Inter / Roboto Mono for Financial Tabular Figures)
│   ├── Elevation & Shadows (Subtle, Layered Card Architecture)
│   └── Spacing & Density Tokens (8pt Grid with 4pt Micro-Alignments)
├── Micro-Components
│   ├── FinancialBadge (Confidence rating, Jurisdiction badge, Form Line indicator)
│   ├── ProvenancePill (Clickable link connecting number to authority / receipt)
│   ├── AuditStatusTag (PASSED, WARN, BLOCKED, REVIEW_REQUIRED)
│   ├── MaskedField (PII masked SSN/EIN with timed reveal authorization)
│   └── MoneyCounter (Tabular numeric display with animated transition)
├── Composite Patterns
│   ├── TaxDrop (Multi-format drag-and-drop ingestion with live stage progress)
│   ├── TaxInboxCard (Single-question resolution card with affirmative action buttons)
│   ├── ProveThisNumberModal (Interactive DAG lineage inspector)
│   ├── AIReviewBrief (Collapsible verification accordion for CPAs)
│   └── ControversyMemo (Rich markdown and legal statute quoting pane)
```

---

## 2. Elevation, Borders & Surface Philosophy

Tax data demands clean structure rather than heavy drop shadows:
- **Surfaces**: Primary application background is a clean cool neutral (`#F7F9FC` / `bg-slate-50`), providing crisp separation from pure white cards (`#FFFFFF`).
- **Borders**: Subtle 1px structural borders (`border-slate-200 / #DDE3EA`) delineate cards and tables, maintaining spatial clarity without visual clutter.
- **Elevation**:
  - `shadow-sm`: Used on resting data cards and form tiles.
  - `shadow-md`: Used on interactive hover states and active inbox cards.
  - `shadow-xl`: Reserved for focused inspection modals (`Prove This Number`, PII reveal drawers).

---

## 3. Data Representation Standards

1. **Tabular Numerics**: All financial figures must use `font-mono tabular-nums` to guarantee aligned decimal columns across ledgers, Schedule C categories, and tax return forms.
2. **Explicit Currency Signatures**: Negative values (liabilities, taxes owed) are indicated via minus signs or paren notation with appropriate semantic coloring (`text-rose-600`), while refunds and tax savings use positive signatures (`text-emerald-700`).
3. **No Decorative Ambiguity**: Every icon and indicator serves an operational purpose. Lucide icons are strictly paired with text labels or explicit ARIA descriptions.
