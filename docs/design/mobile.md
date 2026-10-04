# Autonomous Tax OS — Mobile Experience Specification
**Platforms:** Responsive Mobile Web (iOS Safari, Android Chrome) & Native Progressive Web App (PWA)  
**Ergonomic Invariant:** Streamline Actions; Never Force Microscopic 1040 Form Grids onto Small Displays

---

## 1. Mobile First-Class Use Cases

Mobile is optimized for fast, capture-and-confirm interactions:
1. **Camera Document Ingestion (TaxDrop Mobile)**: Instant camera scanning with auto-edge detection, glare suppression, and automatic OCR classification.
2. **Tax Inbox Quick Decisions**: Tinder/Card-style fast resolution of binary tax questions (e.g., "Was this Uber trip business or personal?").
3. **Filing Milestones & Refund Tracker**: Real-time push notifications for "Return Accepted by IRS", "California FTB Approved", and "Refund Deposited".
4. **Tax Twin Year-Round Monitoring**: Quarterly estimated tax alerts and mileage auto-tracking.

---

## 2. Progressive Disclosure & Viewport Guardrails

```
┌────────────────────────────────────────┐
│ 9:41                             5G 🔋 │
├────────────────────────────────────────┤
│ AUTONOMOUS TAX OS            (Profile) │
├────────────────────────────────────────┤
│ 2026 TAX CASE                          │
│ Your return is 92% Ready               │
│ +$4,120 Refund (Fed) | -$1,840 Due(CA) │
├────────────────────────────────────────┤
│ TAX INBOX (3 items need you)           │
│ ┌────────────────────────────────────┐ │
│ │ ✈️ Business Trip Confirmation      │ │
│ │ Delta Flight to Chicago ($412.50)  │ │
│ │ Was this for Acme Consulting?      │ │
│ │ [ Yes, Business ]  [ No, Personal] │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ SNAP OR UPLOAD RECEIPTS                │
│ [ 📷 Scan Document ]  [ 📁 Choose File]│
├────────────────────────────────────────┤
│ 💡 Complex tax forms (Form 1040 / Sch C│
│ are best reviewed on tablet or desktop.│
│ [Send Link to Laptop]                  │
└────────────────────────────────────────┘
```
