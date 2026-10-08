# Phase 4 — Tax Authority Engine REST API Reference

The Tax Authority Engine exposes production REST API endpoints under `/api/authority/*` on port `3001`.

---

### 1. Hybrid Tax-Law Research Search
- **Endpoint:** `POST /api/authority/research`
- **Description:** Executes hybrid search (lexical + dense vector + authority hierarchy ranking) over authoritative tax material.
- **Request Body:**
```json
{
  "query": "Section 199A qualified business income deduction",
  "jurisdiction": "US-FED",
  "taxYear": 2026,
  "topic": "QUALIFIED_BUSINESS_INCOME",
  "limit": 10
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "query": "Section 199A qualified business income deduction",
  "jurisdiction": "US-FED",
  "taxYear": 2026,
  "count": 3,
  "results": [
    {
      "chunkId": "5e406969-c2e9-48fb-bf9e-b0cf60c7e9e2",
      "citationCode": "26 U.S.C. § 199A",
      "authorityType": "STATUTE",
      "authorityLevel": 1,
      "precedentialStatus": "BINDING",
      "sectionPath": "§ 199A > (a) > (1)",
      "content": "In the case of a taxpayer other than a corporation...",
      "finalScore": 0.892,
      "matchedKeywords": ["199a", "qualified", "business", "income"]
    }
  ]
}
```

---

### 2. Get Rules / Active Rule Lookup
- **Endpoint:** `GET /api/authority/rules`
- **Query Parameters:**
  - `ruleId` (optional): Exact rule ID (e.g. `FED-SEC-199A-QBI-DEDUCTION`)
  - `jurisdiction`: `US-FED`, `US-CA`, `US-NY`, `US-NJ`, `US-IL`, `US-MA`
  - `taxYear`: `2026`
  - `topic` (optional): `QUALIFIED_BUSINESS_INCOME`, `SELF_EMPLOYMENT_TAX`, etc.
- **Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "rules": [...]
}
```

---

### 3. Review & Approve Rule (CPA/EA/Attorney Only)
- **Endpoint:** `POST /api/authority/rules/review`
- **Headers:** `Authorization: Bearer <JWT>` (Must possess CPA, EA, ATTORNEY, or ADMIN role)
- **Request Body:**
```json
{
  "ruleId": "FED-SEC-199A-QBI-DEDUCTION",
  "taxYear": 2026,
  "ruleVersion": "2026.1",
  "newStatus": "ACTIVE",
  "notes": "Verified against 2026 statutory inflation thresholds"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Rule FED-SEC-199A-QBI-DEDUCTION transitioned to ACTIVE by CPA",
  "rule": { ... }
}
```

---

### 4. Statutory Citation Validation
- **Endpoint:** `GET /api/authority/citations/validate`
- **Query Parameters:**
  - `citationCode`: `26 U.S.C. § 199A`
  - `jurisdiction`: `US-FED`
  - `taxYear`: `2026`
  - `propositionText` (optional): `Allows a 20 percent deduction on qualified business income`
- **Response (200 OK):**
```json
{
  "success": true,
  "result": {
    "citationCode": "26 U.S.C. § 199A",
    "jurisdiction": "US-FED",
    "taxYear": 2026,
    "isVerified": true,
    "verificationStatus": "VERIFIED",
    "authorityType": "STATUTE",
    "authorityLevel": 1,
    "reasons": ["Citation verified and legally binding for requested jurisdiction and tax year."],
    "groundingConfidence": 1.0
  }
}
```

---

### 5. Check State Conformity
- **Endpoint:** `GET /api/authority/conformity`
- **Query Parameters:**
  - `federalRuleId`: `FED-SEC-199A-QBI-DEDUCTION`
  - `state`: `US-CA`
  - `taxYear`: `2026`
  - `amountCents`: `500000` ($5,000.00)
- **Response (200 OK):**
```json
{
  "success": true,
  "result": {
    "federalRuleId": "FED-SEC-199A-QBI-DEDUCTION",
    "state": "US-CA",
    "taxYear": 2026,
    "conformityStatus": "SELECTIVE_DECOUPLING",
    "isConforming": false,
    "adjustmentType": "COMPLETE_DISALLOWANCE",
    "adjustmentAmountCents": "500000",
    "description": "California does not conform to IRC § 199A. The QBI deduction is disallowed on CA Form 540.",
    "stateFormLine": "CA Form 540, Line 18",
    "authorityRefs": ["Cal. Rev. & Tax. Code § 17024.5", "CA FTB Notice 2019-01"]
  }
}
```

---

### 6. Prove This Rule
- **Endpoint:** `GET /api/authority/prove-rule`
- **Query Parameters:**
  - `ruleId`: `FED-SEC-199A-QBI-DEDUCTION`
  - `jurisdiction`: `US-FED`
  - `taxYear`: `2026`
- **Response (200 OK):**
```json
{
  "success": true,
  "explanation": {
    "ruleId": "FED-SEC-199A-QBI-DEDUCTION",
    "title": "Section 199A Qualified Business Income Deduction",
    "statutoryCitation": "26 U.S.C. § 199A",
    "taxpayerExplanation": "This tax position is governed by 26 U.S.C. § 199A...",
    "professionalBrief": {
      "controllingCitation": "26 U.S.C. § 199A",
      "authorityRank": 1,
      "precedentialStatus": "BINDING",
      "stateConformityNotes": [ ... ]
    }
  }
}
```

---

### 7. Rule Change Impact Analysis
- **Endpoint:** `POST /api/authority/impact-analysis`
- **Request Body:**
```json
{
  "ruleId": "FED-SEC-199A-QBI-DEDUCTION",
  "jurisdiction": "US-FED",
  "taxYear": 2026,
  "changeType": "THRESHOLD_CHANGED"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "analysis": {
    "ruleId": "FED-SEC-199A-QBI-DEDUCTION",
    "changeType": "THRESHOLD_CHANGED",
    "affectedCasesCount": 1,
    "sampleImpactedCases": [ ... ]
  }
}
```
