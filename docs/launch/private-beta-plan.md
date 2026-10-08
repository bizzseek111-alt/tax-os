# TaxOS Private Beta Launch Plan & Operational Governance
**Document Version:** 1.0.0  
**Phase:** 10 Launch Hardening  
**Target Window:** Controlled Customer Deployment  
**Governance Status:** Approved for Private Beta  

---

## 1. Private Beta Objectives & Guardrails

The TaxOS Private Beta is designed to validate real-world usability, professional workflow efficiency, and edge-case handling with licensed accounting professionals and business taxpayers under controlled conditions.

**Core Beta Guardrails:**
- **Controlled Cohorts:** Strictly limited to pre-approved CPA firms and corporate tax departments.
- **Strict Scope Gating:** Enforced via `FeatureFlagService.evaluateBetaSupportEligibility()`. Only supported filing scenarios (Form 1040 individual returns, standard Schedule C, and 5 supported states: CA, NY, NJ, IL, MA) may be processed.
- **Human-in-the-Loop Review:** 100% of prepared returns mandate credentialed professional sign-off (`CPA_REVIEWER` or `EA`) before taxpayer authorization.
- **Simulated / ATS E-File Mode:** Direct IRS transmissions execute in ATS / sandbox mode until external transmitter certifications are granted.

---

## 2. Cohort Selection & Onboarding Strategy

### Cohort 1: Partner CPA Beta (Weeks 1–4)
- **Size:** 5 certified public accounting firms.
- **Profile:** Small-to-midsize firms handling standard individual (Form 1040) and sole proprietorship (Schedule C) tax clients.
- **Objective:** Evaluate TaxDrop document OCR accuracy, ReviewTask queue ergonomics, and Calculation Lineage explainability.

### Cohort 2: Commercial Business Beta (Weeks 5–8)
- **Size:** 10 e-commerce and multi-state SaaS businesses.
- **Profile:** Businesses subject to multi-state sales tax nexus and payroll withholding across CA, NY, NJ, IL, and MA.
- **Objective:** Evaluate SalesTaxNexusAgent and PayrollReconciliationAgent against real general ledger imports.

---

## 3. Scope Gating via Feature Flags

TaxOS uses fine-grained feature flags (`FeatureFlag` table) to restrict access and enforce beta guardrails:

```json
{
  "key": "PRIVATE_BETA_ACCESS",
  "isEnabled": true,
  "targetOrganizations": ["org_cpa_partner_1", "org_cpa_partner_2"],
  "isBetaOnly": true
}
```

**Automated Scenario Rejection:**  
Any return containing unsupported forms or jurisdictions is automatically flagged and prevented from proceeding:
- Form 2555 (Foreign Earned Income) -> **REJECTED FROM BETA** (Provides explanation: `Form FORM_2555 is not supported during Private Beta`).
- Multi-tier corporate apportionment (Form 1120 Consolidated) -> **REJECTED FROM BETA**.
- Non-resident alien returns (Form 1040-NR) -> **REJECTED FROM BETA**.

---

## 4. Telemetry, Monitoring & Support Protocols

1. **Daily Operational Reviews:** Risk & Compliance Committee reviews daily telemetry covering:
   - Total returns processed
   - Average review turnaround time
   - Discrepancy / rejection rate
   - LLM token expenditure per case (capped at $5.00)
2. **Dedicated Beta Slack Channel & PagerDuty:** Direct real-time escalation bridge between partner CPA reviewers and TaxOS engineering leads.
3. **Weekly Feedback Synthesis:** User feedback ingested and prioritized for iterative refinement.

---

## 5. Beta Exit Criteria (Gateways to General Availability)

Progression from Private Beta to General Availability requires satisfying all of the following:
1. **0 Unresolved Critical/High Tax Calculation Defects.**
2. **IRS ATS Transmitter Certification Approval:** Official Developer Test Pack clearance from the IRS e-Help Desk.
3. **Production EFIN/ETIN Deployment:** Production transmitter secrets loaded into cloud key management.
4. **Third-Party SOC 2 Type II Final Audit Report Issued.**
5. **Minimum 1,000 Returns Successfully Processed in Beta with Zero Regulatory Compliance Exceptions.**

---

## 6. Conclusion

The Private Beta plan strikes an optimal balance between empirical operational learning and conservative risk containment, ensuring safe, compliant validation.
