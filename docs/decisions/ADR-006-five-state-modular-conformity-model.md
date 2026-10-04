# ADR-006: Five-State Modular Conformity & Sovereign Rule Isolation

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
State tax codes in the United States do not uniformly conform to the Internal Revenue Code. For instance:
* California does not conform to federal Health Savings Account (HSA) deductions, Section 199A QBI deductions, or federal bonus depreciation.
* New York enforces the strict "Convenience of the Employer" rule for telecommuters and imposes local New York City resident income taxes.
* New Jersey uses a Gross Income Tax system that does not use federal Adjusted Gross Income (AGI) as a starting point and strictly prohibits netting losses across income categories.

In legacy software, state rules are often hardcoded as conditional spaghetti code (`if state == 'CA' ...`) directly inside federal calculation routines. This causes catastrophic regressions where updating a California rule inadvertently breaks a New York or federal calculation.

## 2. Decision
**We mandate that state tax modules operate as sovereign, decoupled rule packs in the Tax Rule Graph:**
1. **Federal Core Independence**: The federal tax calculation engine outputs a clean, state-agnostic Federal AGI and taxable income object.
2. **Sovereign State Plugins**: Each of the initial launch states (**CA, NY, NJ, IL, MA**) is implemented as an independent plugin with its own:
   * Residency and domicile tests
   * Federal addition and subtraction modifications (Conformity Matrix)
   * Sourcing and part-year allocation engine
   * State credit calculations and e-file validation schemas.
3. **Strict Boundary Enforcement**: State logic is prohibited from modifying federal variables. Cross-state interactions (e.g., credit for taxes paid to other states) are mediated strictly through standardized state tax liability outputs.

## 3. Alternatives Considered
* *Alternative A: Shared Monolithic Calculation Script with Inline State Switches* — Rejected. Fatal anti-pattern; guaranteed to cause regressions during state legislative updates.
* *Alternative B: Separate Standalone Databases per State* — Rejected. Overly complex operational overhead; prevents cross-state resident credit optimization.

## 4. Trade-Offs & Consequences
* **Positive**: 100% modular state updates; zero cross-state regression risk; ability to add new states (e.g., Texas, Florida, Pennsylvania) without touching existing states.
* **Negative**: Requires maintaining explicit state conformity mapping tables for every federal line item.

## 5. Security & PII Implications
State data partitions ensure state tax agency transmission credentials (e.g., California FTB EFIN vs. New York DTF credentials) remain strictly segregated.

## 6. Tax & Legal Implications
Guarantees accurate compliance with non-conforming state tax codes and prevents underpayment penalties caused by improper federal carryover assumptions.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review recent post-pandemic state court challenges regarding the extraterritorial application of New York's "Convenience of the Employer" rule (e.g., *Zelinsky v. Tax Appeals Tribunal*) to ensure sourcing rules reflect current administrative enforcement standards.

## 8. Future Migration Considerations
The modular state architecture forms the exact template for scaling from the initial 5 launch states to all 50 states and the District of Columbia.
