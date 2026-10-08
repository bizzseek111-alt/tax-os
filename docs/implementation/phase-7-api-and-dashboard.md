# Phase 7 — REST API Specification & Reviewer Dashboard

## 1. REST API Endpoints
All endpoints are mounted under `/api/v1/sales-tax` and enforce authentication and tenant isolation:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/sales-tax/cases/:taxCaseId/nexus` | Returns nexus measurements, physical facts, and warning history. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/nexus/evaluate` | Evaluates economic and physical nexus on-demand across states. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/nexus/physical-fact` | Records verified physical nexus fact (warehouse, remote employee). |
| `GET` | `/api/v1/sales-tax/organizations/:orgId/registrations` | Lists state sales tax registrations and filing frequencies. |
| `POST` | `/api/v1/sales-tax/organizations/:orgId/registrations` | Registers or updates a state permit number. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/transactions` | Ingests sales transaction with line items and deterministic rating. |
| `GET` | `/api/v1/sales-tax/cases/:taxCaseId/transactions` | Retrieves transactions with filtering. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/taxability/override` | CPA reviewer overrides product/service taxability determination. |
| `POST` | `/api/v1/sales-tax/organizations/:orgId/exemptions` | Registers customer resale or exemption certificate. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/use-tax` | Self-assesses consumer use tax position on untaxed purchase. |
| `GET` | `/api/v1/sales-tax/cases/:taxCaseId/reconciliation` | Runs 4-way sales tax audit and returns discrepancies report. |
| `POST` | `/api/v1/sales-tax/cases/:taxCaseId/returns/generate` | Generates state return (CDTFA-401-A, ST-100, ST-1, ST-50, ST-9). |
| `GET` | `/api/v1/sales-tax/cases/:taxCaseId/returns` | Lists prepared returns with status. |
| `POST` | `/api/v1/sales-tax/returns/:returnId/approve` | Professional CPA reviewer approves return. |
| `POST` | `/api/v1/sales-tax/returns/:returnId/authorize` | Taxpayer electronically authorizes and signs return. |
| `POST` | `/api/v1/sales-tax/returns/:returnId/submit` | Submits validated return to state filing gateway. |
| `POST` | `/api/v1/sales-tax/returns/:returnId/payments` | Schedules ACH remittance payment. |
| `POST` | `/api/v1/sales-tax/organizations/:orgId/notices` | Ingests sales tax notice and provisions review task. |
| `GET` | `/api/v1/sales-tax/cases/:taxCaseId/dashboard` | Aggregates executive summary of nexus, returns, and reconciliation. |

## 2. Reviewer Operations Dashboard
The dashboard endpoint (`GET /api/v1/sales-tax/cases/:taxCaseId/dashboard`) compiles:
- Active state nexus tracking gauges (CA $500k, NY $500k+100txns, NJ $100k/200txns, IL $100k, MA $100k).
- Status of permits across states (Registered, Pending, Approaching Threshold).
- Total gross receipts, direct webstore sales, and marketplace facilitator deductions.
- Four-way reconciliation health (clean vs discrepancies detected).
- Status pipeline of prepared state returns awaiting CPA review or taxpayer authorization.
