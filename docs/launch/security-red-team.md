# TaxOS Security Red Team & Penetration Testing Report
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** Private Beta Sandbox & Test Clusters  
**Classification:** Internal Confidential / Beta Governance  

---

## 1. Red Team Scope & Objectives

The Red Team assessment evaluated TaxOS against adversarial attack vectors targeting:
1. Multi-tenant isolation and Insecure Direct Object References (IDOR).
2. Authentication bypasses, token forgery, and session fixation.
3. Cross-role privilege escalation (Taxpayer -> Preparer -> Admin).
4. Dependency supply chain vulnerabilities (`pnpm audit`).
5. Malicious file uploads, CSV formula injection, and directory traversal.
6. Webhook replay attacks and signature forgery.

---

## 2. Adversarial Exercises & Results

### Exercise 1: Multi-Tenant Cross-Tenant IDOR Attack
* **Scenario:** Attacker authenticated in Tenant B (`Org Beta`) attempts to read, mutate, or delete TaxCases, Documents, and Financial Connections belonging to Tenant A (`Org Alpha`).
* **Execution:**
  - Automated test forged requests using Org B bearer tokens targeting `/api/v1/cases/:orgA_caseId` and direct Prisma service queries without tenant scoping.
* **Findings:**
  - Direct object retrieval strictly verifies `organizationId`. Cross-tenant queries return HTTP 403 Forbidden or empty datasets.
* **Outcome:** **DEFENDED / PASSED**. Zero cross-tenant data leakage observed.

### Exercise 2: Privilege Escalation via Role Modification
* **Scenario:** Standard Taxpayer user (`TAXPAYER`) crafts requests attempting to approve their own `ReviewTask`, change their own role to `ADMIN`, or alter statutory parameters in `TaxRule`.
* **Execution:**
  - Injected role update payload `{ "role": "ADMIN" }` into user profile update endpoints.
  - Attempted to call `/api/v1/review/decision` with taxpayer session token.
* **Findings:**
  - User role assignment is protected by administrative middleware; attempts rejected with HTTP 403.
  - Review decision engine strictly checks `requiredRole` (`CPA_REVIEWER`, `TAX_ATTORNEY`, `EA`) and rejects non-credentialed sign-offs.
* **Outcome:** **DEFENDED / PASSED**.

### Exercise 3: Malicious File Upload & CSV Formula Injection
* **Scenario:** Malicious taxpayer uploads OCR receipts containing directory traversal filenames (`../../../../etc/passwd`) or CSV bank statements containing DDE execution formulas (`=cmd|' /C calc'!A0`).
* **Execution:**
  - Filename sanitized via `FileSecurityService.sanitizeFilename()`. Result: `passwd`.
  - CSV cells containing `=`, `+`, `-`, `@` processed via `FileSecurityService.sanitizeCsvField()`.
* **Findings:**
  - Traversal components stripped. Dangerous formula cells prefixed with a single quote (`'`), rendering them inert text in spreadsheet software (Excel, Numbers, Google Sheets).
* **Outcome:** **DEFENDED / PASSED**.

### Exercise 4: Webhook Replay & Signature Forgery
* **Scenario:** Attacker captures an e-file state transition webhook callback and replays it 10 minutes later, or tampers with the JSON payload without updating the HMAC signature.
* **Execution:**
  - Replayed valid webhook payload with timestamp older than 300 seconds.
  - Sent modified payload with original HMAC-SHA256 signature header.
* **Findings:**
  - Stale timestamp rejected with `TIMESTAMP_STALE`.
  - Signature mismatch rejected with `INVALID_SIGNATURE`.
* **Outcome:** **DEFENDED / PASSED**.

---

## 3. Dependency Supply Chain Audit (`pnpm audit`)

An audit of the Node.js package tree identified 3 transitive vulnerabilities in dev/build tools:

| Package | Severity | Path | Impact on Production Runtime | Remediation Plan |
| :--- | :--- | :--- | :--- | :--- |
| `deepmerge-ts` (<8.0.0) | Moderate | `@prisma/config -> deepmerge-ts` | None. Prisma CLI build configuration tool only; not imported at runtime. | Upstream Prisma upgrade in next release. |
| `braces` (<=3.0.3) | High | `tailwindcss -> braces` | None. Build-time CSS compiler tool; zero exposure in live HTTP server. | Upgrade tailwindcss build dependencies prior to GA. |
| `postcss-selector-parser` (<7.1.6) | Moderate | `tailwindcss -> postcss-selector-parser` | None. Build-time CSS parser; no production execution. | Track upstream Tailwind patch. |

**Audit Conclusion:** Zero high or critical vulnerabilities exist in direct production runtime services.

---

## 4. Remediation Verification

All security red-team test cases are compiled into the continuous verification harness (`src/tests/phase10_verification.ts`) and verified with 100% automated pass rates.
