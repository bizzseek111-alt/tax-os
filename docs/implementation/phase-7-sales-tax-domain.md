# Phase 7 — Sales & Use Tax Domain Architecture

## 1. Domain Overview
Sales & Use Tax is a first-class, sovereign tax domain within Autonomous Tax OS. Rather than treating sales tax as a simplistic scalar multiplier (`state tax rate × revenue`), TaxOS models indirect taxation as a comprehensive multi-jurisdictional system incorporating:
- Multi-state physical and economic nexus rules
- State agency permits and statutory filing frequencies
- Product and service taxability catalog matrix
- Customer exemption and resale certificates
- Destination, origin, and mixed sourcing engines
- Marketplace facilitator isolation to prevent double remittance
- Hierarchical composite jurisdiction rates (State, County, City, Special Districts)
- Consumer use tax self-assessment
- Multi-source four-way reconciliation (Commerce, Processors, GL, Returns)
- Deterministic state return form generation (CDTFA-401-A, ST-100, ST-1, ST-50, ST-9)
- Two-party human review and taxpayer electronic authorization governance.

## 2. Entity Model Architecture
The sales tax domain is tightly coupled with the canonical `Organization`, `TaxCase`, and `TaxObligation` aggregates without creating disconnected data silos:

```
 Organization (1) ───< (N) SalesTaxRegistration
     │
     └───< (N) ProductTaxCategory
     │
     └───< (N) SalesTaxCustomer ───< (N) ExemptionCertificate
     │
     └───< (N) TaxCase (caseType: SALES_TAX | MULTI_DOMAIN_BUSINESS)
                 │
                 ├───< (N) EconomicNexusMeasurement
                 ├───< (N) PhysicalNexusFact
                 ├───< (N) NexusEvent
                 ├───< (N) SalesTransaction ───< (N) SalesTaxLine
                 ├───< (N) TaxabilityDecision (Reviewer Overrides)
                 ├───< (N) UseTaxPosition
                 └───< (N) SalesTaxReturnPeriod ───< (N) SalesTaxReturn ───< (N) SalesTaxPayment
```

## 3. Data Integrity Invariants
1. **No Negative Gross Sales for Returns**: Credit memos and refunds must be explicitly linked via `originalTransactionId` to avoid distorting gross receipts.
2. **Immutable Audit Lineage**: All taxability overrides, nexus breaches, and return submissions generate cryptographically linked `AuditEvent` records.
3. **No Autonomous Filing**: Returns are calculated and prepared autonomously, but submitting returns to state gateways strictly requires CPA reviewer approval and taxpayer electronic authorization.
