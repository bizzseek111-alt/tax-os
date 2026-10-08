# TaxOS Security & Tax Defect Incident Response Runbook
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Environment:** Private Beta & Production Operations  
**Classification:** Operational Security & Regulatory Governance  

---

## 1. Incident Classification Framework

TaxOS operates under a dual-track incident classification schema covering both traditional **Security Incidents** (data breach, privilege escalation, credential compromise) and domain-specific **Tax Calculation Defects** (statutory math errors, incorrect bracket thresholds, misapplied phase-outs).

### 1.1. Security Severity Levels
* **CRITICAL (P0):** Active data breach involving unmasked taxpayer PII (SSN, banking info), remote code execution, or multi-tenant boundary compromise.
  - *Response SLA:* 15 minutes.
  - *Escalation:* CEO, CTO, Legal Counsel, Chief Compliance Officer.
* **HIGH (P1):** Privilege escalation vulnerability, operational kill switch failure, or persistent denial-of-service affecting filing transmissions.
  - *Response SLA:* 30 minutes.
* **MEDIUM (P2):** Suspicious authentication anomalies, non-critical PAM expiration bugs, or transient rate limiting failures.
  - *Response SLA:* 2 hours.
* **LOW (P3):** Minor security telemetry warnings, harmless UI display defects, or low-risk dependency notices.
  - *Response SLA:* 24 hours.

### 1.2. Tax Defect Severity Levels
* **CRITICAL (T0):** Calculation error producing systematically incorrect tax liability or refund amounts across filed or pending returns (> $100 per return or affecting > 5% of cases).
  - *Response SLA:* Immediate execution of Emergency Rule Rollback and operational kill switch for affected rule/jurisdiction.
* **HIGH (T1):** Calculation defect affecting a specific edge-case tax credit or deduction phase-out under uncommon filing scenarios.
* **MEDIUM (T2):** Ambiguous lineage description or minor form line code mapping mismatch that does not alter dollar totals.
* **LOW (T3):** Clarification or cosmetic text correction in tax position explanations.

---

## 2. Emergency Operational Kill Switch Procedures

TaxOS features database-backed, zero-downtime operational kill switches (`OperationalKillSwitch`) controllable via API (`/api/v1/security/kill-switches/trip`):

```bash
# Emergency Trip: Disables an AI Agent experiencing quality anomalies
curl -X POST https://api.taxos.internal/api/v1/security/kill-switches/trip \
  -H "Authorization: Bearer $SECURITY_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetType": "AGENT",
    "targetKey": "DeductionAgent",
    "reason": "Suspicious deduction proposal anomaly under investigation"
  }'
```

Supported Kill Switch Targets:
- `AGENT`: Disables specific AI agents (`SupervisorAgent`, `DeductionAgent`, `IRSChallengerAgent`).
- `MODEL`: Disables specific LLM foundation models or fallback endpoints.
- `TAX_RULE`: Freezes specific statutory rule evaluations.
- `JURISDICTION`: Halts calculations or filings for a specific state (e.g. `US-CA`).
- `FILING_PROVIDER`: Halts electronic transmission dispatch.
- `SALES_TAX_ENGINE`: Freezes sales tax calculation modules.
- `PAYROLL_ENGINE`: Freezes payroll withholding modules.

---

## 3. Emergency Tax Rule Rollback Runbook

When a statutory tax rule calculation defect is discovered:

1. **Step 1: Execute Emergency Rollback Endpoint**
   ```bash
   curl -X POST https://api.taxos.internal/api/v1/security/rollback/rule \
     -H "Authorization: Bearer $COMPLIANCE_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "ruleId": "RULE_FED_199A_2026",
       "reason": "Administrative notice clarification received from IRS",
       "targetRuleVersion": "2026.0.9"
     }'
   ```
2. **Step 2: Automated System Response**
   - The defective rule is deactivated in `TaxRule`.
   - An operational kill switch is tripped for `TAX_RULE:RULE_FED_199A_2026`.
   - All active `TaxCase` records referencing the rule are flagged:
     - Case status transitioned to `CALCULATION_ERROR` or flagged for recalculation.
     - Review tasks routed to `CPA_REVIEWER` with high priority.
   - An immutable `AuditEvent` is written to the cryptographic ledger.
3. **Step 3: Root Cause & Hotfix Deployment**
   - Correct formula parameters in `src/server/services/taxCalculation/`.
   - Execute differential regression test suite (`phase3_verification.ts`, `phase10_verification.ts`).
   - Promote hotfix through CI/CD pipeline and release kill switch via `/api/v1/security/kill-switches/recover`.

---

## 4. Statutory Regulatory Notification SLAs

Under federal and state law (including IRS Publication 4557 and state data breach statutes):
- **IRS Incident Reporting:** Incidents involving suspected unauthorized access to Federal Tax Information (FTI) must be reported to the IRS Office of Safeguards and local Treasury Inspector General for Tax Administration (TIGTA) within **24 hours**.
- **State Tax Authorities:** Breaches involving state taxpayer records must be reported to the respective state Department of Revenue within **48 hours**.
- **Affected Taxpayers:** Written notification to affected taxpayers must occur within statutory deadlines (typically 30–60 days, or immediately if risk of identity theft is acute).

---

## 5. Post-Incident Review & Blameless Post-Mortems

Every P0/P1 security incident or T0/T1 tax defect mandates a formal Post-Incident Review within 72 hours:
1. Reconstruction of the complete timeline using immutable `AuditEvent` records.
2. Root Cause Analysis (5 Whys methodology).
3. Creation of permanent automated test cases in `src/tests/` preventing regression.
4. Publication of an executive summary to the Risk & Compliance Committee.
