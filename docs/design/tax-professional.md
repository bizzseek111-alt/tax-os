# Autonomous Tax OS — Tax Professional (CPA / EA) UX Specification
**Persona:** Enrolled Agent (EA), Certified Public Accountant (CPA), Authorized Paid Tax Preparer (PTIN)  
**Philosophy:** Review Exceptions, Never Repeat AI Mechanical Computations.

---

## 1. Professional Cockpit Layout

The Tax Professional dashboard serves as a high-density, multi-client triage center:

```
┌────────────────────────────────────────────────────────────────────────┐
│ WORKSPACE QUEUE: 42 Assigned | 14 Ready for Review | 3 Blocked | 5 Due │
├────────────────────────────────────────────────────────────────────────┤
│ TRIAGE TABLE: Filter by Jurisdiction (FED, CA, NY, NJ, IL, MA)         │
│ • Client: Alex Rivera | 1040 + CA 540 | Comp: 92% | Risk: Low  | 1 Flag │
│ • Client: Elena Rostova| 1040 + NY/NJ | Comp: 88% | Risk: Med  | 2 Flags│
│ • Client: Marcus Vance | 1040 + MA    | Comp: 98% | Risk: Low  | 0 Flags│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The AI Review Brief

When a CPA clicks into a case, they are not presented with raw blank tax forms. Instead, the **AI Review Brief** aggregates all reconciliation checks, deterministic calculations, and potential audit risks into four concise panels:

1. **Income Reconciliation & Double-Count Audit**:
   - Status: `PASSED`
   - Automated cross-match between 1099-NEC, 1099-K, and bank deposits. Identifies and documents $12,400 of non-taxable account transfers removed to prevent double-counting.
2. **Evidence & Substantiation Health**:
   - Status: `PASSED (98.4% Documented)`
   - 142 of 144 Schedule C expenses matched to verified receipts or bank statement hashes.
3. **Federal Tax Positions & Disallowed Deductions**:
   - Status: `1 EXCEPTION FLAGGED`
   - Item: $1,420 Business Meals. Flagged for 50% statutory disallowance under IRC § 274(n). AI correctly allocated $710 deductible and $710 disallowed.
4. **Multi-State Non-Conformity & Allocation**:
   - Status: `REVIEW REQUIRED`
   - Item: NY vs NJ remote telecommuting allocation. 42 days worked from home in NJ for an NYC employer. Convenience of Employer rule (20 NYCRR § 131.18) evaluated.

---

## 3. Preparer Actions & Audit Trail Sign-off

- **Approve Position**: One-click confirmation of an AI deduction with optional CPA notes.
- **Override Line Item**: Allows manual adjustment with mandatory justification note (e.g., "Client provided contemporary mileage log showing 4,200 business miles").
- **Escalate to Legal Controversy**: Instantly packages statutory issue for Tax Attorney review.
- **Sign & Authorize E-File**: Digital PTIN signature binding the verified return to the e-file staging pipeline.
