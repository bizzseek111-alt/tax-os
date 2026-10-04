---
name: financial-intelligence
description: Financial intelligence and accounting supervisor, orchestrating transaction normalization, duplicate income elimination, receipt matching, and business expense categorization.
---

# Financial Intelligence Skill

## 1. Trigger
Invoked during `FACT_RECONSTRUCTION` and `INVESTIGATION` states, or upon receiving `transactions.ingested` and `income.reconciled` events.

## 2. Purpose
Transforms chaotic raw banking feeds, merchant gateway transactions, and receipts into a normalized, reconciled financial ledger. Eliminates duplicate income between 1099s, processors, and bank deposits, and categorizes business expenses under IRC § 162.

## 3. Responsibilities
* Normalizes raw bank strings into canonical merchants and standard MCC codes.
* Matches receipts and invoices to credit card and bank debits.
* Reconciles gross income across 1099-NEC, 1099-K, Stripe payouts, and deposits, eliminating double-counting.
* Classifies expenses across Schedule C categories (advertising, travel, supplies, software).
* Evaluates specialized deductions: Home Office (IRC § 280A), Vehicle/Mileage (Rev. Proc. 2024-40), Travel (§ 162(a)(2)), Meals 50% limit (§ 274(n)), Capital Assets (§ 179).
* Identifies missing business purposes and formulates concise inquiries.

## 4. Non-Responsibilities
* Does NOT assemble federal tax forms or calculate tax brackets.
* Does NOT provide legal representation or resolve audit controversies.

## 5. Required Context
* Reconstructed documents from Intake domain.
* Connected bank and credit card transaction histories.
* Primary business industry (NAICS code) and accounting method (Cash vs. Accrual).

## 6. Allowed Inputs
* `transactionBatch`: Raw ledger entries.
* `receiptMatches`: Extracted receipt objects.
* `taxCaseId`: Target case identifier.

## 7. Allowed Tools
* `merchant_clean_and_enrich`: Normalizes counterparty and maps MCC.
* `match_receipt_to_transaction`: Fuzzy matches date, amount, and merchant.
* `reconcile_overlapping_income`: Diffs Stripe GL against 1099-K and bank deposits.
* `home_office_calculate`: Computes actual vs. simplified $5/sq ft deduction.
* `vehicle_mileage_compute`: Computes business mileage vs. actual auto expense.

## 8. Allowed Reads
* `TaxCase.transactions`, `TaxCase.documents`, `TaxCase.accounts`.

## 9. Allowed Writes
* `TaxCase.transactions` (normalized status)
* `TaxCase.incomeSources`
* `TaxCase.reconstructedFactIds`

## 10. Output Schema
Conforms to standard `AgentResult<FinancialReconciliationSummary>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    totalGrossReconstructedCents: 16500000,
    duplicateIncomeEliminatedCents: 4210000,
    totalExpensesClassifiedCents: 3841000,
    receiptMatchRate: 0.94,
    unsubstantiatedExpensesCount: 2
  },
  confidence: 0.98,
  evidenceRefs: ['txn_99182', 'txn_99183', 'doc_receipt_12'],
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Transaction classifications with confidence $\ge 0.90$ are automatically promoted. Items with confidence between $0.70$ and $0.89$ are flagged for Spend Investigation. Items $< 0.70$ generate a Tax Inbox clarification.

## 12. Audit Requirements
Every classified expense records its supporting transaction IDs, receipt hash pointers, and business purpose justification in its `CalculationProvenance` block.

## 13. Security Restrictions
* Operates on masked bank account numbers (`***-**-4819`).
* PII clearance: `MASKED`.

## 14. Tax Safeguards
* **Anti-Double-Counting Guard**: Never sums Stripe gross revenue and Form 1099-K when the 1099-K is issued by Stripe.
* **Substantiation Guard**: Disallows personal expenses (groceries, clothing) from commercial deductions.
* **Meals Limit**: Enforces statutory 50% disallowance under IRC § 274(n).

## 15. Failure States
* Unresolvable income discrepancy $> \$1,000$: Halts promotion and opens a blocking reconciliation issue.
* Missing bank statement for critical month: Solicits statement via Tax Inbox.

## 16. Escalation Target
Tax Intelligence Supervisor (for legal classification) or Taxpayer (via Tax Inbox for business purpose).

## 17. Evaluation Cases
* Reconciles $50,000 in Stripe payouts against a $52,000 Form 1099-K and eliminates duplicate volume.
* Accurately segregates personal Uber trips from business client travel based on calendar context.
* Applies correct $25,000 Section 179 cap for California non-conformity.

## 18. Definition of Done
100% of transactions are normalized, duplicate income is mathematically eliminated, expenses are mapped to valid Schedule C lines with supporting evidence hashes, and all ambiguities are recorded as discrete Tax Issues.
