# Autonomous Tax OS — Accessibility & Universal Design Specification
**Standard:** WCAG 2.2 Level AA Mandate (Section 508 / Americans with Disabilities Act Compliance)

---

## 1. Compliance Checklist & Implementations

### Keyboard Traversal & Focus Management
- **Logical Tab Order**: All interactive items (Tax Inbox answer buttons, document upload drops, modal close triggers) maintain a strict DOM order matching visual layout.
- **Visible Focus Rings**: High-contrast, 2px solid blue focus rings (`outline-2 outline-blue-600 outline-offset-2`) are enforced on all interactive components. Focus is never suppressed with `outline: none` without a clear ring replacement.
- **Trap Focus**: Modal dialogues (such as **Prove This Number** and the PII authorization drawer) trap keyboard focus within the dialog until dismissed via `Escape` or the close button.

### Screen Reader Support & ARIA Semantics
- **Live Regions (`aria-live="polite"`)**: Used in TaxDrop upload progress bars so screen reader users hear milestone updates ("Document 14 of 37 processed; Schedule C expense reconciled") without UI interruption.
- **Accessible Table Markup**: All tax reconciliation tables use proper `<caption>`, `<th scope="col">`, and `<th scope="row">` tags.
- **Descriptive Action Buttons**: Rather than ambiguous "Click here" or "Resolve", buttons provide unambiguous screen reader text (e.g., `aria-label="Confirm Delta flight was 100% business travel for Acme Corp"`).

### Reduced Motion & Cognitive Ergonomics
- **`prefers-reduced-motion` Respect**: CSS transitions and animated graph layouts are automatically disabled or switched to subtle fades when the user has enabled reduced motion in their OS.
- **No Timed Expirations Without Warning**: Users are not kicked out of sessions during complex tax review. Auto-save triggers every 3 seconds to eliminate data loss anxiety.
- **Zoom Up to 200%**: Layout flexes gracefully without horizontal clipping or broken controls when browser zoom is set to 200%.
