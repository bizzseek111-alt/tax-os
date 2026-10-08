# Phase 2 — Financial Connectivity & Plaid Integration Specification

**Component:** Financial Aggregation, Token Security & Deduplicated Sync  
**Module:** `src/server/services/financial/FinancialService.ts` & `PlaidSandboxProvider.ts`  
**Compliance Standard:** Treasury Circular 230 / IRC § 7216 Consent Framework  

---

## 1. Architectural Highlights

Autonomous TaxOS integrates with financial institutions through a secure token exchange model:

1. **Token Security:** Raw access tokens are **never** stored in plaintext. They are encrypted using AES-256-CBC with an initialization vector (IV) prepended: `enc:aes256:{ivHex}:{cipherHex}`.
2. **User Consent:** Explicit consent is captured in the `Consent` table (`PLAID_CONNECTION`) prior to token exchange.
3. **Transaction Fingerprinting:** Each ingested transaction is fingerprinted using a deterministic SHA-256 hash:
   $$\text{Fingerprint} = \text{sha256}(\text{accountId} + \text{date} + \text{amountCents} + \text{merchant})$$
4. **Idempotent Sync:** Re-running sync checks existing provider transaction IDs and content fingerprints, completely eliminating duplicate transaction imports.
5. **Cross-Source Deduplication:** Transactions uploaded via CSV are matched against Plaid bank feeds and flagged with `duplicateConfidence: 0.92`.

---

## 2. API Contract

### `POST /api/financial/link-token`
- Generates a client link token for Plaid Link modal initialization.

### `POST /api/financial/exchange-token`
- Exchanges public token, encrypts access token with AES-256, creates accounts, records consent, and runs initial transaction sync.

### `GET /api/financial/connections`
- Lists all active and disconnected financial connections for the tenant organization.

### `POST /api/financial/connections/:id/sync`
- Pulls added/modified/removed transactions since the last sync cursor.

### `POST /api/financial/connections/:id/disconnect`
- Marks the connection `DISCONNECTED`, sets `revokedAt` timestamp, revokes consent under IRC § 7216, and records an audit event.

### `POST /api/financial/csv-import`
- Ingests manual CSV bank statements, checking fingerprints to prevent duplicates.
