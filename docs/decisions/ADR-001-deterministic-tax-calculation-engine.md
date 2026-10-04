# ADR-001: Deterministic Tax Calculation Engine Separation

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
Large Language Models (LLMs) are probabilistic token-prediction engines. While extraordinarily capable at semantic extraction, classification, and conversational synthesis, LLMs exhibit non-zero variance, floating-point rounding errors, and hallucination tendencies when computing multi-tiered tax brackets, phase-out thresholds, and deduction caps.

In U.S. tax compliance, a single dollar of computational discrepancy can trigger an IRS mathematical error notice (CP11/CP12), invalidate an e-file transmission, or subject a taxpayer to accuracy-related penalties under IRC § 6662.

## 2. Decision
**We strictly prohibit LLMs from performing authoritative tax calculations.**
* Authoritative tax calculations, bracket indexing, phase-outs, and form line additions are executed **exclusively by deterministic, unit-tested TypeScript/Python computation engines**.
* LLM agents are restricted to **fact interpretation, document OCR extraction, statutory search, hypothesis proposal, and explanatory narrative generation**.

## 3. Alternatives Considered
* *Alternative A: Prompt-Engineered LLM Calculations with Chain-of-Thought (CoT)* — Rejected. CoT reduces errors but remains non-deterministic and fails bit-exact reproducibility requirements.
* *Alternative B: Python Code Interpreter Sandboxes per Agent Call* — Evaluated. Helpful for exploratory analytics, but too high latency (1.5–3.0s per call) and lacks global form dependency caching.
* *Alternative C: Pure Deterministic Hardcoded Forms without AI* — Rejected. Traditional software approach fails at unstructured document understanding and fact reconstruction.

## 4. Trade-Offs & Consequences
* **Positive**: 100% mathematical consistency; 0% arithmetic hallucination; instant calculation speed ($< 5\text{ms}$); absolute audit reproducibility.
* **Negative**: Requires maintaining comprehensive deterministic formula libraries and test suites for every supported form and schedule.

## 5. Security & PII Implications
Deterministic engines operate locally within memory and do not transmit sensitive financial facts across external LLM API boundaries for basic math.

## 6. Tax & Legal Implications
Direct compliance with Circular 230 standards and IRS e-file accuracy requirements. Returns prepared by deterministic engines are defensible in Tax Court.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Annual validation of IRS inflation adjustment Revenue Procedures (e.g., standard deduction and bracket adjustments under IRC § 1(f)) to ensure deterministic constant tables are updated prior to filing season opening.

## 8. Future Migration Considerations
The deterministic calculation engine is wrapped behind the `TaxEngineProvider` interface, allowing hot-swapping or co-validation against third-party commercial engines (Column Tax, April, Luca IQ) without touching agent logic.
