# Autonomous Tax OS — Typography Specification
**Font Families:** `Inter` (Primary Interface & Narrative), `JetBrains Mono` / `Roboto Mono` (Tabular Numbers & Legal Statutory Citations)

---

## 1. Type Scale Hierarchy

| Level | Size (rem / px) | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | 2.5rem / 40px | SemiBold (600) | 1.15 | -0.025em | Main dashboard completion header ("Your taxes are 92% ready") |
| **Financial Primary** | 2.0rem / 32px | Bold (700) | 1.20 | -0.02em | Key refund and liability summary figures ($4,120) |
| **Section Header (H1)** | 1.5rem / 24px | SemiBold (600) | 1.25 | -0.015em | Major view headers, Review Brief tab titles |
| **Card Header (H2)** | 1.125rem / 18px | Medium (500) | 1.30 | -0.01em | Tax Inbox cards, reconciliation category headers |
| **Body Large** | 1.0rem / 16px | Regular (400) | 1.50 | 0.00em | Standard narrative explanations, client messaging |
| **Body Small** | 0.875rem / 14px | Regular (400) | 1.45 | 0.00em | Supporting details, metadata descriptions |
| **Tabular Monospace** | 0.875rem / 14px | Medium (500) | 1.40 | 0.00em | Transaction amounts, tax form line numbers, calculation steps |
| **Legal Citation Micro** | 0.75rem / 12px | Medium (500) | 1.35 | +0.02em | Statutory references (e.g. `26 U.S.C. § 162(a)`, `20 NYCRR § 131.18`) |

---

## 2. Numeric Alignment & Financial Legibility

- **Tabular Figures (`tabular-nums`)**: Applied by default to all financial ledgers, ensuring numbers of identical length have identical character widths.
- **Micro-Copy Clarity**: Legal notices and disclaimers are set in high-contrast slate (`#5E6B78`), never dropped below 12px to guarantee readability across all viewport zoom states.
