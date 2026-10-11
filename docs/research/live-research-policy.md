# Live Research Policy & Gating Triggers

## 1. Research Gating Rationale

Live official authority portal queries and statutory lookups are computationally and network intensive. Running live research indiscriminately slows down calculations and introduces network brittleness.

The `LiveResearchDecisionEngine` enforces an explicit policy governing when Level 1/2 fast resolution is sufficient and when live Level 3/4 research is mandatory.

---

## 2. Gating Decision Matrix

### When Live Research is Bypassed (Level 1 Fast Resolution):
- Approved `TaxRule` exists in database (`reviewStatus: 'APPROVED'`).
- Rule confidence is high ($\ge 0.85$).
- Source document hash matches verified hash in `OfficialSourceFreshness`.
- Within the statutory TTL window (`status === 'CURRENT'`).
- Tax year is current and verified.
- Confirmed facts cleanly map to all statutory conditions.
- Financial materiality is within low-to-moderate thresholds ($\le \$5,000$).

### Triggers Mandating Live Research (Level 3/4):
1. **Missing or Draft Rule**: TaxRule does not exist or has status `DRAFT` / `AI_EXTRACTED`.
2. **Low Confidence**: Rule confidence $< 0.85$.
3. **Expired TTL**: `OfficialSourceFreshness` status is `CHECK_REQUIRED` (exceeded 365 days for statutes, 180 days for regs, 90 days for notices).
4. **Altered Source Hash**: Agency portal change detection indicates statutory text modification (`status: 'CHANGED'`).
5. **High Materiality**: Potential tax impact exceeds **$5,000**.
6. **Multi-State Interaction**: Cross-border transactions, multi-state nexus, or dual residency.
7. **Explicit Professional Request**: CPA or Tax Reviewer sets `forceLiveResearch: true`.
8. **New Tax Year**: Returns for new tax years where rule versioning has not been locked.
