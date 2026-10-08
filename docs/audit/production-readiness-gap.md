# TaxOS Production Readiness & Architecture Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Production Readiness Auditor & CTO  
**Target Milestone:** Commercial Regulated FinTech Launch

---

## 1. Production Readiness Scorecard

| Production Dimension | Minimum Production Requirement | Current Codebase Status | Readiness Score |
| :--- | :--- | :--- | :--- |
| **1. Cloud Infrastructure** | Multi-AZ Kubernetes / ECS cluster with autoscale | Client-side Vite SPA deployed to Vercel. Node server runs only locally. | **20%** |
| **2. Data Persistence** | Multi-tenant PostgreSQL with automated PITR backups | In-memory global variables. Zero database. | **0%** |
| **3. Authentication & IAM** | OAuth 2.0 / OIDC with WebAuthn MFA & RBAC guards | No auth on API server. Local UI role switcher dock. | **10%** |
| **4. Calculation Engine** | 100% complete Form 1040/540 integer-cents math | 4 brackets up to 24%, basic Schedule C/SE. Hardcoded withholding. | **35%** |
| **5. Document Pipeline** | AWS S3 + Textract / Document AI OCR | File bytes discarded. Filename keyword simulation. | **5%** |
| **6. Third-Party Integrations** | Live Plaid, Stripe, Gusto, SendGrid APIs | Mock adapter classes returning hardcoded arrays. | **5%** |
| **7. E-Filing & IRS Gateway** | IRS ATS certified MeF A2A transmitter with EFIN/ETIN | Faked immediate `ACCEPTED` string response. | **0%** |
| **8. Observability & SRE** | Sentry, OpenTelemetry, Datadog APM, structured JSON | `console.log()` statements only. Zero telemetry pipeline. | **10%** |
| **9. Security & Compliance** | SOC 2 Type II, IRS Pub 1075, AES-256 KMS encryption | Non-cryptographic bitshift hash. Hardcoded PIN `2026`. | **15%** |
| **10. Autonomous Agents** | Containerized LangGraph / Temporal runtime with LLM SDKs | 27 skill markdown docs. Zero executable agent classes. | **10%** |

### **Overall Composite Production Readiness Score: 11.0%**

---

## 2. The Deployment Disconnect: Vercel vs Node Backend

### 2.1 Static Frontend Deployed, Backend Server Disconnected
- **Current Live Vercel Deployment:** `https://tax-ai-wine.vercel.app`
- **Architecture on Vercel:**
  - Vercel is serving the static compiled SPA (`dist/index.html` and `dist/assets/*`).
  - The Node.js server [`src/server/index.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/server/index.ts) is **not running on Vercel**.
  - `package.json` has `build: "tsc && vite build"` and `dev: "vite"`. It does not define Vercel Serverless Functions (`api/*.ts`).
- **Consequence:** In production on Vercel, any frontend `fetch('/api/...')` call (such as task resolution, document upload, or AI queries) either 404s or falls back to the frontend's local optimistic component state!

---

## 3. Production Failure Scenarios (If Launched Today)

1. **Catastrophic Data Loss on Process Restart:**
   - A customer spends 2 hours onboarding, uploading documents, and resolving questions.
   - The backend server process is restarted or updated.
   - All customer state, uploaded document metadata, and return calculations evaporate instantly.
2. **Severe Tax Calculation Liability:**
   - A high-earning freelancer earning $250,000 files using the engine.
   - The engine taxes them at 24% instead of 32% or 35%, and generates an automatic 15% refund due to the hardcoded `totalFederalTaxCents * 1.15` formula.
   - The taxpayer owes thousands in underpayment penalties to the IRS and California FTB.
3. **Total Inability to E-File:**
   - The taxpayer clicks "Authorize & E-File Form 8879".
   - The system displays a green badge: `ACCEPTED_BY_IRS_GATEWAY`.
   - In reality, zero bytes were transmitted to the IRS. The taxpayer remains unfiled, triggering failure-to-file penalties under IRC § 6651(a)(1).
4. **Data Breach & IDOR Exploitation:**
   - Because `/api/taxcase` and other endpoints lack authentication headers and tenant IDs, anyone on the internet who discovers the backend URL can read or overwrite the active case data.
