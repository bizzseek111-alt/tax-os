# Autonomous Tax OS — Tax Inbox UX Specification
**Status:** The Definitive Replacement for the Traditional Tax Questionnaire  
**Design Mandate:** High-leverage, action-oriented micro-cards; zero redundant interrogation.

---

## 1. Inbox Architecture

Instead of asking 80 hypothetical questions ("Did you sell livestock? Did you adopt a child?"), the system analyzes ingested data and creates a **Tax Inbox Card** only when an unresolved tax fact blocks filing or leaves money on the table.

```
┌────────────────────────────────────────────────────────────────────────┐
│ TAX INBOX: 3 ITEMS REQUIRE YOUR ATTENTION                              │
├────────────────────────────────────────────────────────────────────────┤
│ CARD 1: Business Travel Expense ($412.50)                              │
│ "We identified a Delta Airlines flight to Chicago in October.         │
│ Was this exclusively for Acme Client consulting work?"                 │
│ [ Yes, 100% Business ]     [ No, Personal Trip ]     [ Mixed Purpose ] │
├────────────────────────────────────────────────────────────────────────┤
│ CARD 2: Dedicated Home Office Deduction                                │
│ "Based on your remote consulting revenue, you qualify for IRC § 280A. │
│ What is the square footage of your dedicated workspace?"              │
│ Input: [ 220 ] sq ft (Total home: 1,400 sq ft)                         │
│ Method: (•) Simplified ($1,100)   ( ) Actual Expense Allocation        │
│ [ Confirm Deduction ]                                                  │
├────────────────────────────────────────────────────────────────────────┤
│ CARD 3: Missing Brokerage 1099-B Basis                                 │
│ "We detected a $2,400 transfer from Coinbase, but no 1099-DA/B is on   │
│ file. Upload your statement or link Coinbase directly."                │
│ [ Connect Coinbase ]   [ Upload CSV/PDF ]   [ Report Zero Gain ]       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Card Resolution Ergonomics

- Resolving a card immediately decrements the "Questions to File" counter and re-evaluates the Tax Graph in real time.
- The refund/liability widget at the top of the viewport animates to reflect the updated position (e.g. adding the $1,100 home office deduction immediately updates the refund by +$326).
- If the user is unsure, they can click "Ask Tax AI" or "Request CPA Assistance" directly inside the card.
