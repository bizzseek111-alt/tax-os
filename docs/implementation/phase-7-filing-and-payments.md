# Phase 7 — Filing Submission & Payment Governance

## 1. Two-Party Verification Gate
In adherence with professional compliance regulations (Circular 230 and state accounting boards), an autonomous AI agent is strictly prohibited from submitting a tax return directly to a government agency without human verification.

TaxOS enforces a sequential two-party verification gate:
1. **Pre-Filing Validation**: Checks mathematical consistency (gross ≥ taxable), non-negative balances, and reconciliation sign-off.
2. **Professional CPA Approval**: A credentialed CPA or licensed sales tax professional reviews schedules, deductions, and allocations, calling `POST /api/v1/sales-tax/returns/:returnId/approve`.
3. **Taxpayer Authorization**: The taxpayer reviews the prepared return and executes an electronic signature with timestamp and IP address via `POST /api/v1/sales-tax/returns/:returnId/authorize`.
4. **Filing Submission**: Only after both signatures are recorded can the return be submitted via `POST /api/v1/sales-tax/returns/:returnId/submit`.

## 2. Remittance Payment Scheduling
Once filed, the return transitions to `FILED` status and issues an official confirmation number. Taxpayers can schedule ACH Debit or electronic funds transfer (EFT) remittance payments via `POST /api/v1/sales-tax/returns/:returnId/payments`, tracking confirmation receipts in `SalesTaxPayment`.
