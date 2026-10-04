# Autonomous Tax OS — B2C Taxpayer UX Specification
**Persona:** Freelancer, Independent Contractor, Content Creator, Single-Member LLC, Mixed W-2/1099 Earner  
**Objective:** Deliver "Taxes that largely do themselves" with zero tax anxiety and ultra-low Questions to File (QtF).

---

## 1. Core Viewport Structure

The B2C Taxpayer interface is structured around four primary modular zones:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP STATUS BAR: Tax Year 2026 | Federal: Ready | State: Ready | E-File │
├────────────────────────────────────────────────────────────────────────┤
│ HERO VALUE CARD: "Your 2026 Taxes are 92% Ready"                      │
│ [============================================            ] 92% Ready   │
│ Estimated Refund: +$4,120 (Fed) | State Balance: -$1,840 (CA)          │
├───────────────────────────────────────┬────────────────────────────────┤
│ ZONE A: TAX INBOX (Immediate Actions) │ ZONE B: TAXDROP & KNOWLEDGE    │
│ "3 items need your quick confirmation"│ Drag-and-drop receipts/PDFs    │
│ • Card 1: Delta Flight Business Trip  │ Live OCR & Reconciliation Feed │
│ • Card 2: Dedicated Home Office Sq Ft │ Connect Banking (Plaid/Teller) │
│ • Card 3: 1099-B Crypto Basis Audit   │ 37 Documents Ingested (1 dup)  │
├───────────────────────────────────────┴────────────────────────────────┤
│ ZONE C: PROVE THIS NUMBER (Full Explainability & Lineage)              │
│ Clickable Tax Breakdown:                                               │
│ Total Gross Income: $148,200 | Schedule C Deductions: $28,450          │
│ QBI Deduction: $11,950 | Effective Tax Rate: 16.4%                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Onboarding Flow ("The 90-Second Fast Start")

1. **Step 1: Identity & Tax Year Confirmation**: Simple name, filing status (Single / MFJ), and state residency check.
2. **Step 2: Connect Financial World**:
   - One-click Plaid / Teller bank account linking.
   - Drag prior-year return (Form 1040 PDF) into TaxDrop.
3. **Step 3: Autonomous Workspace Build**:
   - The UI immediately renders a live construction state: "Ingesting 2025 carryovers... Connecting 1099 gateways... Matching Schedule C expense categories."
4. **Step 4: Immediate Value Presentation**:
   - Within 60 seconds, the user sees their preliminary numbers and a clear list of the only 2–3 specific questions needed to complete their filing.

---

## 3. Contextual AI Explanation Assistant

- Never a generic chatbot floating off-screen.
- Context-sensitive "Explain This Figure" chips next to any line item.
- Example prompt: "Why do I owe California $1,840 when I'm getting a Federal refund of $4,120?"
- Grounded explanation provided directly from the Tax Authority Store:
  > *"California does not conform to the Federal HSA tax deduction under Cal. RTC § 17215.4. Your $4,150 HSA contribution is added back to California taxable income, producing an additional $386 in state tax. Furthermore, your California state tax bracket on $119,750 of taxable income is 9.3%."*
- Every statutory number links directly to the legal source text.
