# Autonomous Tax OS — Core UX & Product Design Principles
**Status:** Canonical Product Design Specification  
**Target Compliance:** WCAG 2.2 AA / Human-in-the-Loop Fintech Ergonomics

---

## 1. The Fundamental Product Philosophy

> **THE APPLICATION WORKS FIRST. THE HUMAN RESPONDS SECOND.**

Traditional tax software forces users into linear interrogations ("Wizards") spanning 50 to 100 sequential questionnaire pages. This creates severe tax anxiety, high drop-off rates, and user fatigue that leads to self-reporting errors.

In **Autonomous Tax OS**, the software performs the heavy lifting prior to human involvement:
1. Connects financial institutions, payroll gateways, and document sources.
2. Ingests, reads, normalizes, and reconciles transactions and tax documents.
3. Maps deductions, credits, and state non-conformities deterministically.
4. Synthesizes unresolved tax facts into discrete, high-leverage micro-actions.

---

## 2. Core Metric: "Questions to File" (QtF)

Every interaction is evaluated against a single North Star UX metric:
$$\text{Questions to File (QtF)} \le 5 \quad \text{for standard W-2 + 1099 freelancers}$$

- If an agent can safely retrieve a fact through institutional APIs, prior-year returns, or matching document hashes, **the user is never asked**.
- A question exists **only** when an unresolved tax fact carries statutory ambiguity (e.g., business percentage of a shared cell phone, square footage of a dedicated home office, or foreign asset reporting threshold).
- Questions are never presented as bureaucratic tax forms; they are surfaced as action-oriented cards in the **Tax Inbox**.

---

## 3. Financial Trust Architecture & Brand Demeanor

Taxes are one of the most financially vulnerable and legally high-stakes interactions a citizen has each year. The interface must inspire calm, authority, and meticulous competence.

### Demeanor Guidelines
- **Calm Authority**: Avoid artificial AI hype, flashing neon gradients, or "magic robot" metaphors. The system should feel like a premier wealth-management and private-client advisory firm operating at lightning speed.
- **Visible Provenance**: No number appears on screen without an explanatory trail. Clicking any dollar figure opens the **Prove This Number** lineage inspector.
- **Radical Candor & Transparency**: If the AI detects ambiguity or an adversarial audit risk (e.g., NY Convenience of Employer rule), it does not bury or conceal it. It clearly flags the position and notes whether CPA review has verified the approach.
- **Zero Dark Patterns**: No hidden filing fees, no predatory upsells to "Deluxe" or "Max", and no deceptive refund anticipations.

---

## 4. Role Separation & Contextual Cockpits

A single underlying Tax Case powers multiple distinct professional and personal viewpoints. The UI cleanly separates experiences based on user privileges and cognitive needs:

1. **B2C Taxpayer**: Outcome-driven, progressive disclosure, minimal questions, TaxDrop document ingestion, and clear filing status.
2. **Tax Professional (EA / CPA)**: Exception-first workflow, AI Review Brief, audit trail validation, and direct workpaper sign-off.
3. **Tax Attorney**: Escalated controversy hub, statutory conflict analysis, IRS/state notice defense, and privileged memo workspace.
4. **Operations Manager**: Firm-wide throughput monitoring, SLA breach alerts, case assignment balance, and masked-PII dashboards.
5. **Super Admin**: Infrastructure health, deterministic rule engine versioning, model cost attribution, and kill-switch consoles.
