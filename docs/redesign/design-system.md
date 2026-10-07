# TaxOS Design System & Component Guidelines

**Document Version:** 3.0.0  
**Design Standard:** Enterprise Financial UX / WCAG 2.1 Level AAA Contrast  
**Core Tone:** Trustworthy, Calm, Crisp, Professional

---

## 1. Design Principles by Audience

### 1.1 Customer UI (Taxpayer & Small Business)
- **Palette:** Light, warm sage, crisp white surfaces, forest green primary actions.
- **Tone:** Calm, clear, empathetic. Never intimidating or overwhelming.
- **Copy:** Plain English. No internal technical jargon (no "DAGs", "deterministic rule nodes", or "agent consensus").
- **Visuals:** Generous whitespace, clean card surfaces, clear step-by-step progress.

### 1.2 Professional UI (CPAs, EAs, Review Specialists)
- **Palette:** Neutral slate surfaces, crisp borders, semantic color badges.
- **Tone:** High-information density, efficient, audit-focused.
- **Features:** Keyboard shortcuts, sticky table headers, collapsible workpapers, instant inline notes.

### 1.3 Operations & Legal UI (Ops Managers & Attorneys)
- **Palette:** Operations uses warm amber accents for SLA alerts; Legal uses deep purple accents for IRC § 7525 privilege.
- **Tone:** Authoritative, procedural, time-sensitive.

### 1.4 Platform Admin UI (Super Admin)
- **Palette:** Technical dark slate (`#0B0F19` / `#111827`) with crisp high-contrast emerald and cobalt indicators.
- **Tone:** Mission-critical, controlled, defensive engineering.

---

## 2. Canonical Color Token System

```css
:root {
  /* Brand Primary: Forest Green */
  --color-forest-950: #08211C;
  --color-forest-900: #123B33;
  --color-forest-700: #165A4A;
  --color-forest-500: #1E826C;
  --color-emerald-500: #22A06B;

  /* Accent Lime (Buttons & High-Value Focus) */
  --color-lime-400: #C2E8A2;
  --color-lime-500: #A8DE80;

  /* Neutrals */
  --color-neutral-950: #101828;
  --color-neutral-900: #1D2939;
  --color-neutral-700: #344054;
  --color-neutral-500: #667085;
  --color-neutral-400: #98A2B3;
  --color-neutral-300: #D0D5DD;
  --color-neutral-200: #EAECF0;
  --color-neutral-100: #F2F4F7;
  --color-neutral-50:  #F9FAFB;

  /* Backgrounds & Surfaces */
  --color-bg-app:     #F8FAF9;
  --color-surface:    #FFFFFF;
  --color-border:     #E4E7EC;

  /* Strict Semantic Tokens */
  --color-success:    #16845B; /* Verified, calculation passed, filed */
  --color-info:       #2563EB; /* Data update, in progress, informational */
  --color-warning:    #DC8B17; /* Review required, Needs You, pending exception */
  --color-critical:   #D92D20; /* Blocker, disallowed expense, error */
  --color-legal:      #6B21A8; /* IRC § 7525 privilege, attorney workpaper */
}
```

### Strict Contrast Rules
- **NEVER** place white text on pale green or pale lime badges. White text on `#C2E8A2` has a contrast ratio of 1.4:1 (FAIL). Badges with pale lime backgrounds must use `#08211C` or `#123B33` text (contrast ratio > 9:1).
- **NEVER** use low-contrast muted text (`#98A2B3`) on light backgrounds for critical legal disclosures. All statutory citations and body text must have a minimum contrast ratio of 7:1 against their background.

---

## 3. Typography Scale & Hierarchy

We employ **Plus Jakarta Sans** (with fallback to **Inter**) as our single primary sans-serif typeface across all customer and professional products. Monospace font (**JetBrains Mono**) is strictly restricted to hashes, transaction IDs, and technical terminal logs.

| Token | Font Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 3.5rem (56px) | 1.15 | 800 (Extrabold)| Landing page hero headlines |
| **H1** | 2.5rem (40px) | 1.2 | 800 (Extrabold)| Primary page titles |
| **H2** | 1.875rem (30px)| 1.25 | 700 (Bold) | Major section headings |
| **H3** | 1.375rem (22px)| 1.3 | 600 (Semibold)| Card & modal titles |
| **H4** | 1.125rem (18px)| 1.35 | 600 (Semibold)| Subsections & table headers |
| **Body Large** | 1.125rem (18px)| 1.5 | 400 (Regular) | Hero subheadlines, lead paragraphs |
| **Body** | 0.9375rem (15px)| 1.5 | 400 (Regular) | Primary content, descriptions |
| **Small** | 0.8125rem (13px)| 1.4 | 500 (Medium) | Meta info, helper labels, table cells|
| **Caption** | 0.75rem (12px) | 1.3 | 600 (Semibold)| Badges, uppercase timestamps |
| **Mono Token** | 0.8125rem (13px)| 1.4 | 500 (Mono) | SHA-256 hashes, PTIN numbers |

---

## 4. Spacing System (8px Grid)

All layout paddings, margins, and gaps adhere strictly to the 8px spatial grid:
- `4px` (0.25rem): Micro gaps, badge inner padding (`px-2 py-0.5`).
- `8px` (0.5rem): Button icon spacing, small input padding.
- `16px` (1rem): Standard card internal padding, list item gaps.
- `24px` (1.5rem): Modal padding, desktop card padding, grid gap.
- `32px` (2rem): Section spacing within dashboards.
- `48px` (3rem): Major layout separation on marketing pages.
- `64px` (4rem): Desktop section top/bottom padding (`py-16`).
- `96px` (6rem): Hero section padding (`py-24`).

---

## 5. Cards & Surfaces (Anti-Nesting Rule)

To prevent visual clutter, nested cards are forbidden:
- **Level 1 (Section):** The containing page section (light sage or neutral background).
- **Level 2 (Surface):** The primary white surface (`bg-white rounded-2xl border border-neutral-200 shadow-xs`).
- **Level 3 (Item / Row):** Clean horizontal row dividers or subtle inset panels (`bg-neutral-50 rounded-xl p-3`), **not** another bordered card with shadows.

---

## 6. Pills & Badges (Reduction Mandate)

Badge usage is reduced by 40% across the platform. Badges must be reserved strictly for actionable state or verified status:
- **Verified / Ready:** Emerald fill with dark pine text (`bg-emerald-100 text-emerald-900 border border-emerald-300`).
- **Needs Attention:** Amber fill with dark amber text (`bg-amber-100 text-amber-950 border border-amber-300`).
- **Critical / Blocker:** Rose fill with dark red text (`bg-rose-100 text-rose-950 border border-rose-300`).
- **Informational:** Slate fill with dark slate text (`bg-slate-100 text-slate-800 border border-slate-300`).
- **Legal Privilege:** Purple fill with dark purple text (`bg-purple-100 text-purple-950 border border-purple-300`).

---

## 7. Tables & Data Display

- **Horizontal Overflow:** Tables must be enclosed in `overflow-x-auto` wrappers with custom slim scrollbars.
- **Sticky Headers:** Review queues feature sticky top headers (`sticky top-0 bg-neutral-50 z-10`).
- **Row Hover:** Interactive rows highlight on hover (`hover:bg-neutral-50/80 transition-colors`).
- **Empty States:** Every table has a dedicated zero-state illustration, explanation, and clear CTA.
