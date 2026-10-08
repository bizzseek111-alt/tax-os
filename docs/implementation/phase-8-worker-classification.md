# Autonomous Tax OS — Phase 8: Worker Classification Risk Engine

## 1. Statutory Context & Legal Standards
Misclassification of employees as independent contractors (1099-NEC) exposes employers to severe federal and state liabilities, including back employment taxes, penalties under IRC § 3509, interest, and state labor code sanctions.

### The IRS Three-Pillar Common Law Test
1. **Behavioral Control**:
   - Right to direct and control how the worker does the task.
   - Instructions on when, where, and how to work.
   - Provision of training or mandatory procedures.
2. **Financial Control**:
   - Extent of unreimbursed business expenses.
   - Investment in facilities, tools, and equipment.
   - Opportunity for profit or loss.
   - Payment method (hourly/salary vs flat project fee).
3. **Type of Relationship**:
   - Written contracts detailing relationship.
   - Employee-type benefits (health insurance, pension, paid leave).
   - Permanency of the relationship.
   - Whether services performed are a key aspect of regular business.

### State "ABC" Tests (California AB 5 / Massachusetts / New Jersey)
In California (Labor Code § 2775), Massachusetts (M.G.L. c. 149, § 148B), and New Jersey, a worker is presumed to be an employee unless the employer satisfies **all three prongs**:
- **Prong A**: The worker is free from control and direction in performing the work, both under contract and in fact.
- **Prong B**: The worker performs work that is **outside the usual course of the hiring entity's business**.
- **Prong C**: The worker is customarily engaged in an independently established trade, occupation, or business.

---

## 2. Invariant: No Unauthorized Legal Advice
The Worker Classification Engine is explicitly designed with professional governance guardrails:
- The engine computes **risk metrics** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- It identifies statutory warning flags (e.g., `FAILS_ABC_PRONG_B`, `CORE_BUSINESS_INTEGRATION`).
- It outputs **`POTENTIAL_RISK`** findings and **strictly routes to human CPA / legal counsel review**.
- It **never** issues a binding legal determination or provides unauthorized legal advice.

---

## 3. Implementation in `WorkerClassificationEngine`

```typescript
export class WorkerClassificationEngine {
  public static evaluateWorker(params: WorkerEvaluationInput): WorkerClassificationRiskResult {
    // Evaluates IRS 3-Pillar and State ABC tests
    // Calculates risk scores and statutory failure flags
    // Always emits recommendations for human professional review
  }
}
```
If an engagement is flagged as high risk, the system automatically provisions a `ReviewTask` with `reviewType: 'WORKER_CLASSIFICATION_REVIEW'` and `riskLevel: 'HIGH'` assigned to senior payroll reviewers.
