# Phase 7 — Consumer Use Tax Self-Assessment Engine

## 1. Legal & Operational Foundation
Consumer Use Tax is the complementary liability to sales tax. When a business purchases taxable equipment, furniture, laptops, or cloud subscriptions from an out-of-state vendor that did not collect sales tax, and the property or service is used or consumed within the business's home state, the purchaser is legally required to self-assess and remit use tax directly to the state.

## 2. Calculation & Credit Mechanism
Under the Commerce Clause of the US Constitution, taxpayers are entitled to a credit for sales tax legally paid to another state to prevent double taxation:
```
Gross Use Tax = Purchase Amount × Destination Composite Tax Rate
Net Use Tax Due = max(0, Gross Use Tax - Sales Tax Paid to Other State)
```

## 3. Return Line Integration
The `UseTaxService` tracks all self-assessed positions in the `UseTaxPosition` entity and automatically populates the appropriate use tax lines on state sales & use tax returns:
- **California**: CDTFA-401-A Line 6 / Schedule T (Purchases subject to state & local use tax).
- **New York**: ST-100 Step 3 (Purchases subject to use tax).
- **Illinois**: ST-1 Line 6 (Use tax on purchases).
- **New Jersey**: ST-50 Line 5 (Use tax due).
- **Massachusetts**: ST-9 Line 5 (Use tax due).
