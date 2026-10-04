---
name: year-round-twin
description: Year-round planning and digital twin supervisor, maintaining a continuous simulation of taxpayer liability, calculating quarterly estimated payments, and responding to tax notices.
---

# Year-Round Tax Twin Skill

## 1. Trigger
Invoked following case acceptance (`ACCEPTED`), upon new ongoing banking sync transactions, quarterly tax deadlines, or when an IRS/state notice is uploaded.

## 2. Purpose
Extends tax intelligence beyond April 15. Maintains the **Tax Twin**—a live, reactive digital twin of the taxpayer’s ongoing financial trajectory. Simulates tax impacts of real-world business decisions, calculates quarterly estimated tax obligations under IRC § 6654, and parses IRS correspondence.

## 3. Responsibilities
* Orchestrates worker agents: `TaxPlanningAgent`, `TaxTwin`, `ScenarioAgent`, `TaxImpactAgent`, `EstimatedTaxAgent`, `QuarterlyPaymentAgent`, `IncomeProjectionAgent`, `YearEndPlanningAgent`, `LifeEventAgent`, `TaxDeadlineAgent`, `TaxNoticeAgent`, `NoticeResponsePreparationAgent`.
* Continuously computes estimated tax liability as new invoices are collected.
* Evaluates safe-harbor payment requirements under IRC § 6654(d) (100% or 110% of prior-year tax vs. 90% of current-year tax) to prevent underpayment penalties.
* Generates Form 1040-ES payment vouchers and state estimated vouchers.
* Ingests and parses IRS mail notices (CP2000, CP504, math error notices) and computes strict statutory response deadlines.
* Simulates capital expenditure timing (Section 179 vs. bonus depreciation) and S-Corp salary vs. distribution optimization.

## 4. Non-Responsibilities
* Does NOT modify previously filed, accepted tax returns (delegates to Amendment Agent).
* Does NOT execute legal representation in U.S. Tax Court (delegates to Tax Attorney).

## 5. Required Context
* Current tax year financial connections (Plaid/Stripe).
* Prior-year Form 1040 filed return baseline and tax liability.
* Statutory tax deadlines calendar.

## 6. Allowed Inputs
* `ongoingTransactions`: Continuous banking stream.
* `noticeDocument`: Scanned IRS notice PDF if received.
* `scenarioRequest`: What-if simulation parameters (e.g. buying a $60,000 truck).

## 7. Allowed Tools
* `tax_twin_simulate`: Runs deterministic shadow calculation on projected trajectory.
* `safe_harbor_evaluate`: Computes minimum quarterly payments required under IRC § 6654.
* `notice_ocr_parse`: Extracts proposed assessment, penalty amounts, and response date.
* `scenario_diff_compute`: Compares tax liability between baseline and proposed scenario.

## 8. Allowed Reads
* Historical accepted returns, ongoing financial feeds, and Tax Rule Graph for the projection year.

## 9. Allowed Writes
* `TaxCase.scenarios`
* `TaxCase.estimatedTaxPayments`
* `TaxCase.notices`

## 10. Output Schema
Conforms to standard `AgentResult<TaxTwinStatus>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    projectedFullYearRevenueCents: 18500000,
    projectedFederalTaxCents: 2450000,
    nextQuarterlyDueCents: 612500,
    nextDeadline: '2027-06-15',
    safeHarborSatisfied: true,
    recommendations: [
      'Contribute $6,500 to SEP-IRA before Dec 31 to save an estimated $1,950 in tax.'
    ]
  },
  confidence: 0.96,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Projections carry explicitly labeled confidence bands (e.g., $\pm 10\%$ variance depending on income volatility).

## 12. Audit Requirements
All simulated scenarios are isolated in shadow case branches and never pollute official filed return data.

## 13. Security Restrictions
* PII clearance: `MASKED`. Operates on financial run-rates and account balances.

## 14. Tax Safeguards
* **Safe-Harbor Protection**: Always prioritizes IRC § 6654 prior-year safe harbor to eliminate underpayment penalty exposure.
* **Notice Deadline Rigor**: Notices with strict 30-day or 90-day statutory response windows trigger high-urgency notifications.

## 15. Failure States
* Missed quarterly deadline: Calculates annualized income installment method (Form 2210) to minimize penalties.

## 16. Escalation Target
Tax Attorney (for IRS CP504 intent-to-levy notices) or Reviewing CPA (for mid-year entity restructuring).

## 17. Evaluation Cases
* Accurately calculates Q2 estimated tax voucher using 110% prior-year safe harbor for high-income earner.
* Simulates Section 179 vehicle deduction and warns of $30,500 luxury auto depreciation cap under IRC § 280F.
* Successfully extracts $4,200 proposed deficiency and 30-day deadline from IRS CP2000 notice.

## 18. Definition of Done
The Tax Twin reflects current financial reality, upcoming quarterly safe-harbor vouchers are scheduled, proactive tax savings opportunities are surfaced, and any incoming IRS notices are triaged with response deadlines established.
