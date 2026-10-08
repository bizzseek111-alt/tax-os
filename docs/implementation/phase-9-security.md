# Phase 9: Multi-Tenant Boundary Isolation & Role Security

## Overview

Electronic filing is the highest-risk perimeter in the TaxOS architecture. Transmitting returns requires stringent access controls, cross-tenant boundary verification, and immutable cryptographic logging.

---

## Multi-Tenant Authorization Boundaries

`FilingSecurityService.assertCanSubmitFiling` verifies tenant isolation before any return transmission or signature request execution:

1. **Organization Boundary Enforcement:**
   - The executing user must belong to the organization that owns the `TaxCase`.
   - Cross-tenant requests fail immediately with `FORBIDDEN_ORGANIZATION_ACCESS`.

2. **Role-Based Access Control (RBAC):**
   - Direct transmission of an electronic tax package requires elevated authority:
     - `CPA`, `EA`, `FEDERAL_REVIEWER`, `OPERATIONS_MANAGER`, `ORG_ADMIN`, or `SUPER_ADMIN`.
   - Taxpayers may review and sign returns (`TAXPAYER`), but authorized ERO / professional staff oversee agency transmission queues.

---

## Environment Visual Banners & Guardrails

To prevent accidental transmission of test cases to live IRS production systems:
- The system returns environment metadata via `/api/v1/filing/environment`.
- When in `SANDBOX` mode, UI renders prominent indicators:
  > **SANDBOX SIMULATION MODE** — Returns transmitted in this environment are sent to simulated test gateways. No real electronic filings or bank debits occur.
- Production transmission is physically blocked unless valid production EFIN/ETIN credentials are authenticated.
