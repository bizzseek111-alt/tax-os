# Phase 9: Form 1040-X Amendments, Extensions & Statutory Deadlines

## Overview

Tax returns are living statutory filings that often require adjustments post-transmission. TaxOS Phase 9 implements:
1. **Form 1040-X Amended Returns (`AmendmentCase`)**
2. **Form 4868 / 7004 Automatic Filing Extensions (`FilingExtension`)**
3. **Deterministic Statutory Filing Deadline Engine with Holiday Adjustments**

---

## Form 1040-X Amendment Engine

When an original return is amended:
- `AmendmentEngine.createAmendmentCase` binds the original `ReturnVersion` to a newly spawned `AmendmentCase`.
- Retains changed fact keys and explicit reasons (e.g., "Received late-arriving corrected Schedule K-1 with additional partnership income").
- Records exact dollar difference between original tax liability and newly computed liability (`taxDifferenceCents`).
- Links the amended version to the original without destructive in-place mutations.

---

## Automatic Filing Extensions (Form 4868 & Form 7004)

Taxpayers requiring additional preparation time can file Form 4868 (Individual 6-month extension to October 15) or Form 7004 (Corporate/Partnership 6-month extension):
- Records estimated total tax liability, total payments/withholdings made, and payment submitted with the extension.
- Emphasizes the critical tax rule: **An extension of time to file is NOT an extension of time to pay**.
- Computes new extended due dates automatically.

---

## Deterministic Statutory Filing Deadline Engine

Filing deadlines are computed deterministically per IRC § 7503 and state statutes via `AmendmentEngine.calculateStatutoryDeadline`:

1. **Weekend Roll Forward:** If a statutory deadline falls on a Saturday or Sunday, the deadline advances to the next business day (Monday).
2. **Statutory Holiday Adjustments:**
   - **Emancipation Day (Washington, D.C.):** Celebrated on April 16 (or Friday April 15 if April 16 is a Saturday). Under IRC § 7503, a District of Columbia legal holiday applies nationwide to tax return filings. When Emancipation Day falls on April 16, the federal tax filing deadline advances to April 17.
   - **Patriots' Day:** Celebrated on the third Monday in April in Massachusetts and Maine, advancing state filing deadlines to Tuesday.
