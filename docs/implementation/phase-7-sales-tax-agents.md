# Phase 7 — Multi-Agent Sales Tax Suite Architecture

## 1. Multi-Agent Organization
The sales tax domain integrates into the Phase 5 executable agent runtime with 12 specialized agents adhering to the typed `AgentResult<T>` output contract and Principle of Least Privilege (PoLP):

```
                               ┌─────────────────────────────┐
                               │     Sales Tax Supervisor    │
                               └──────────────┬──────────────┘
                                              │
      ┌─────────────────┬─────────────────────┼─────────────────────┬─────────────────┐
      │                 │                     │                     │                 │
      ▼                 ▼                     ▼                     ▼                 ▼
┌───────────┐     ┌───────────┐         ┌───────────┐         ┌───────────┐     ┌───────────┐
│Nexus Agent│     │Reg. Agent │         │Taxability │         │Sourcing   │     │Mktplace   │
│(Econ/Phys)│     │(Permits)  │         │Agent      │         │Agent      │     │Agent      │
└───────────┘     └───────────┘         └───────────┘         └───────────┘     └───────────┘
      │                 │                     │                     │                 │
      ▼                 ▼                     ▼                     ▼                 ▼
┌───────────┐     ┌───────────┐         ┌───────────┐         ┌───────────┐     ┌───────────┐
│Exemption  │     │Recon.     │         │Return     │         │Notice     │     │Human CPA  │
│Agent      │     │Agent      │         │Agent      │         │Agent      │     │Escalation │
└───────────┘     └───────────┘         └───────────┘         └───────────┘     └───────────┘
```

## 2. Agent Responsibilities
1. **SalesTaxSupervisorAgent**: Orchestrates multi-state sales tax workflows, executes nexus checks, triggers reconciliation, and generates return periods.
2. **NexusAgent**: Evaluates Wayfair dollar/transaction thresholds across states and tracks 3PL/remote employee presence.
3. **RegistrationAgent**: Assesses permit requirements in breached states and determines monthly vs quarterly filing frequency.
4. **TaxabilityAgent**: Evaluates product/service taxability catalog, verifying software, SaaS, digital goods, and consulting service rules.
5. **SourcingAgent**: Resolves origin vs destination sourcing and computes composite rates.
6. **MarketplaceAgent**: Isolates Amazon, Walmart, and Etsy sales from direct webstore revenue to prevent double-remittance.
7. **ExemptionAgent**: Verifies resale and tax-exemption certificates, alerting reviewers to expired documents.
8. **SalesTaxReconciliationAgent**: Audits checkout collections against actual composite rates, flagging under-collections.
9. **SalesTaxReturnAgent**: Computes line-by-line return forms and county/district schedules.
10. **SalesTaxNoticeAgent**: Ingests state agency assessment letters and provisions review tasks.
