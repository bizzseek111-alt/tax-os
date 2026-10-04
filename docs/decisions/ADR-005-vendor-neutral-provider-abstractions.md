# ADR-005: Vendor-Neutral Provider Abstractions (Hexagonal Ports & Adapters)

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
Early-stage fintech and tax startups frequently bind their business logic directly to third-party commercial SDKs (e.g., Plaid, Column Tax, OpenAI, Persona). When a vendor changes pricing, experiences service outages, or deprecates API endpoints, the startup faces catastrophic operational disruption and costly refactoring.

## 2. Decision
**We mandate a strict Hexagonal Architecture (Ports and Adapters) for all external integrations:**
* Core business logic and agent workflows interact **only** with strongly typed TypeScript interfaces:
  * `TaxEngineProvider`
  * `FinancialDataProvider`
  * `DocumentIntelligenceProvider`
  * `IdentityVerificationProvider`
  * `ModelProvider`
  * `ESignProvider`
  * `ObjectStorageProvider`
  * `VectorSearchProvider`
* Vendor-specific code is isolated in discrete adapter classes (e.g., `PlaidAdapter`, `AnthropicClaudeAdapter`, `InternalDeterministicEngineAdapter`).
* High-coverage mock adapters must exist for every port to enable 100% offline unit and integration testing.

## 3. Alternatives Considered
* *Alternative A: Direct Vendor SDK Integration in Services* — Rejected. Creates fatal vendor lock-in and makes automated CI/CD testing dependent on live third-party network connections.
* *Alternative B: Monolithic Third-Party BaaS (Banking-as-a-Service / Tax-as-a-Service)* — Rejected. Surrenders control over core calculation provenance and user experience.

## 4. Trade-Offs & Consequences
* **Positive**: Absolute vendor neutrality; zero vendor lock-in; ability to hot-swap LLM models or calculation providers in minutes; zero-cost local automated testing via mock adapters.
* **Negative**: Requires maintaining translation layer interfaces between vendor-specific payloads and internal canonical data models.

## 5. Security & PII Implications
Enables centralized PII sanitization at the adapter boundary before payloads are transmitted to external providers.

## 6. Tax & Legal Implications
Allows parallel cross-validation: the same `TaxCase` can be evaluated simultaneously by our internal deterministic engine and an external commercial provider (e.g., Column Tax or Luca IQ) to flag any discrepancy before filing.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Verify third-party tax engine vendor SLA commitments and liability allocation regarding IRS mathematical calculation errors.

## 8. Future Migration Considerations
Enables effortless migration from cloud-hosted proprietary LLMs to self-hosted open-weights models (e.g., vLLM) as open-source reasoning capabilities advance.
