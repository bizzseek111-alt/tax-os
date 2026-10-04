# ADR-007: Four-Tier Professional Review Architecture & Mode Segregation

> **Status**: Accepted  
> **Date**: 2026-10-04  
> **Author**: Founding Principal Architecture Team  

---

## 1. Context & Problem Statement
Consumer tax platforms are typically polarized into two extremes:
* 100% self-preparation (taxpayers are left completely alone with complex forms).
* Full-service manual CPA preparation (expensive, slow, requiring 6–8 weeks during tax season).

Furthermore, platforms that attempt to integrate professional review often deploy expensive legal talent (tax attorneys) to review routine W-2 and Schedule C returns, or fail to establish clear legal lines of preparer responsibility under Treasury Department Circular 230.

## 2. Decision
**We establish a Four-Tier Professional Review Architecture with strict role-based routing:**
* **MODE 1: AI AUTOPILOT** (Direct self-preparation with automated adversarial clearing; no professional fee).
* **MODE 2: EA / CPA VERIFIED** (AI prepares; credentialed Enrolled Agent or CPA audits flagged exceptions via the AI Review Brief and signs as verifying professional).
* **MODE 3: PROFESSIONAL PREPARATION** (Firm-led concierge preparation where practitioners manage the return directly using agent co-pilots).
* **MODE 4: TAX ATTORNEY ESCALATION** (Privileged legal controversy workspace reserved exclusively for IRS audit notices, administrative disputes, and statutory conflicts).
* **Anti-Pattern Guardrail**: Tax attorneys are **explicitly prohibited** from serving as default return reviewers.

## 3. Alternatives Considered
* *Alternative A: Single Mandatory CPA Review for All Returns* — Rejected. Destroys unit economics for simple freelancer returns and creates an unnecessary professional bottleneck.
* *Alternative B: Pure AI Self-Prep with No Professional Escalation Option* — Rejected. Leaves taxpayers stranded when IRS audit notices (CP2000) or complex multi-state ambiguities arise.

## 4. Trade-Offs & Consequences
* **Positive**: 10x capacity expansion for reviewing CPAs; clear legal boundaries under Circular 230; rapid path to resolution for complex legal controversies.
* **Negative**: Requires maintaining role-specific UI dashboards and specialized escalation routing logic.

## 5. Security & PII Implications
Mode 4 cases operate within a cryptographically isolated Legal Workspace with attorney-client confidentiality markings and restricted platform access.

## 6. Tax & Legal Implications
Establishes clear Circular 230 accountability: Paid preparers sign Form 8879 with their registered PTIN and EFIN credentials, accompanied by immutable audit logs of all reviewed exceptions.

## 7. Uncertain Assumptions & Legal Review
* `[REQUIRES TAX/LEGAL REVIEW]`: Review state accountancy board rules (e.g., California Board of Accountancy, New York State Board for Public Accountancy) regarding AI-assisted tax preparation workpapers and supervisory requirements for signing partners.

## 8. Future Migration Considerations
The review framework easily extends to multi-disciplinary teams including financial planners (CFP), enrolled actuaries (EA), and wealth advisors for holistic family office management.
