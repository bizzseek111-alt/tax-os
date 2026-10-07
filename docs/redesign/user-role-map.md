# TaxOS User Roles, RBAC/ABAC Permissions & Identity Model

**Document Version:** 3.0.0  
**Security Standard:** Zero-Trust Role-Based & Attribute-Based Access Control (RBAC/ABAC)  
**Regulatory Alignment:** IRS Publication 1075, IRC § 7216 (Disclosure Protections), IRC § 7525 (Confidentiality Privilege)

---

## 1. Executive Identity Architecture

TaxOS completely eliminates monolithic "god-roles" in everyday business operations. Access is strictly partitioned across three core dimensions:
1. **Tax Domain:** Income Tax vs. Sales & Use Tax vs. Payroll & Employment Tax.
2. **Jurisdiction / State:** Sovereign states where the professional is licensed or authorized.
3. **Data Sensitivity Class:** PII & Banking vs. Employee Compensation vs. Anonymized Aggregates vs. Privileged Legal Workpapers.

---

## 2. Complete Inventory of User Roles (26 Distinct Roles)

### Category A: Client & Taxpayer Roles
1. **`TAXPAYER` (Individual)**
   - *Persona:* Single filer, married couple, freelancer.
   - *Scope:* Full access to own personal TaxCase, documents, draft return, and "Prove This Number" breakdown.
   - *Restrictions:* Zero access to other taxpayers or system telemetry.
2. **`BUSINESS_OWNER` (Client Owner)**
   - *Persona:* Founder, LLC managing member, S-Corp shareholder.
   - *Scope:* Access across all subscribed entity tax domains (Income, Sales, Payroll).
   - *Restrictions:* Cannot modify system-level compliance rules or audit hashes.
3. **`CFO_FINANCE_DIRECTOR`**
   - *Persona:* Corporate finance executive.
   - *Scope:* High-level tax provisions, quarterly liabilities, payment authorizations, financial exports.
   - *Restrictions:* Masked individual employee PII (SSNs, home addresses).

### Category B: Tax Professional & Preparer Roles
4. **`CPA` (Certified Public Accountant)**
   - *Persona:* State-licensed CPA with verified PTIN.
   - *Scope:* Cross-domain review, exception override, Form 8879 pre-authorization, workpaper certification.
5. **`EA` (Enrolled Agent)**
   - *Persona:* Federally-authorized tax practitioner empowered by the U.S. Treasury.
   - *Scope:* Federal and multi-state income tax review, taxpayer representation notes, IRS inquiry responses.
6. **`PAID_TAX_PREPARER` (Junior Preparer)**
   - *Persona:* Staff accountant assisting with data verification.
   - *Scope:* Reviewing OCR extractions, matching receipts, assembling workpapers.
   - *Restrictions:* Cannot sign off on final return; requires Senior Reviewer or CPA approval.

### Category C: Domain-Specific Review Specialists
7. **`FEDERAL_TAX_REVIEWER`**
   - *Scope:* Federal individual and business income tax positions (Form 1040, 1120-S, 1065).
   - *Restrictions:* Isolated from sales tax rates and employee payroll runs.
8. **`SENIOR_FEDERAL_REVIEWER`**
   - *Scope:* High-materiality federal positions (tax liabilities >$250k), complex depreciation, QBI limitations.
9. **`CALIFORNIA_TAX_REVIEWER`**
   - *Scope:* California FTB Form 540/540NR, Cal. RTC add-backs, AB 5 compliance, SDI calculations.
   - *Restrictions:* Blocked from accessing New York or Illinois tax records.
10. **`NEW_YORK_TAX_REVIEWER`**
    - *Scope:* NY DTF Form IT-201/203, Convenience of the Employer rule, NYC resident taxes, PTET credits.
11. **`NEW_JERSEY_TAX_REVIEWER`**
    - *Scope:* NJ Form NJ-1040, N.J.S.A. § 54A loss netting prohibition, property tax deductions.
12. **`ILLINOIS_TAX_REVIEWER`**
    - *Scope:* IL Form IL-1040, 4.95% flat tax, 100% retirement subtraction, pass-through withholding.
13. **`MASSACHUSETTS_TAX_REVIEWER`**
    - *Scope:* MA Form 1, 8.5% short-term capital gains, 4% Fair Share surtax, PFML reconciliation.
14. **`SALES_TAX_REVIEWER`**
    - *Scope:* Multi-state economic nexus monitoring, product taxability codes, sales tax reconciliation.
    - *Restrictions:* Zero access to income tax personal schedules or wage PII.
15. **`SENIOR_SALES_TAX_REVIEWER`**
    - *Scope:* Marketplace facilitator dispute resolution, multi-jurisdiction voluntary disclosure agreements (VDAs).
16. **`PAYROLL_TAX_REVIEWER`**
    - *Scope:* Form 941 quarterly reconciliations, Form 940 FUTA, state withholding deposits, SUI rate updates.
    - *Access Guard:* Explicit authorization required to view wage compensation records.
17. **`SENIOR_PAYROLL_REVIEWER`**
    - *Scope:* Cross-entity worker classification audits, IRS 20-factor challenges, executive payroll.
18. **`BUSINESS_TAX_REVIEWER`**
    - *Scope:* Schedule M-1/M-3 book-to-tax reconciliations, corporate tax provisions.
19. **`SENIOR_BUSINESS_REVIEWER`**
    - *Scope:* Multi-tier pass-through entity structures, complex K-1 allocations, merger & acquisition tax treatment.

### Category D: Legal & Operations Roles
20. **`TAX_ATTORNEY`**
    - *Persona:* Licensed attorney admitting to state bar.
    - *Scope:* Privileged legal escalation under IRC § 7525, audit controversy workpapers, worker misclassification defense.
    - *Privilege Guard:* Attorney-client privileged notes are cryptographically shielded from non-attorney staff.
21. **`OPERATIONS_MANAGER` (Tax Operations)**
    - *Scope:* Global case flow monitoring, SLA tracking, queue routing, bottleneck resolution.
    - *Privacy Guard:* Operational metadata only; cannot inspect private financial numbers without explicit escalation.
22. **`REVIEW_OPERATIONS_MANAGER` (Review QA)**
    - *Scope:* Reviewer utilization, QA error sampling, override frequency tracking, reviewer accreditation.
23. **`CASE_MANAGER`**
    - *Scope:* Taxpayer communication, missing document outreach, scheduling intake calls.
24. **`CUSTOMER_SUPPORT`**
    - *Scope:* Account access, subscription inquiries, technical bug intake.
    - *Strict Guard:* Cannot provide tax advice or view uncensored tax schedules.

### Category E: Administrative & Governance Roles
25. **`FIRM_ADMINISTRATOR`**
    - *Scope:* Accounting firm management, preparer seat provisioning, client firm assignments, billing.
26. **`SECURITY_ADMINISTRATOR`**
    - *Scope:* Audit logs, privileged session monitoring, MFA enforcement, IP whitelisting.
    - *Strict Boundary:* Cannot modify statutory tax calculation rules.
27. **`TAX_KNOWLEDGE_ADMINISTRATOR`**
    - *Scope:* Authority store management, statutory rule updates, citation validation, tax rate tables.
    - *Strict Boundary:* Zero customer data access; operates strictly in rule definition domain.
28. **`SUPER_ADMINISTRATOR` (Platform Control)**
    - *Scope:* Global emergency kill switches, model routing, system health, infrastructure releases.
    - *Step-Up Security:* High-impact actions require MFA re-authentication, incident rationale, and ledger audit logging.

---

## 3. Granular RBAC/ABAC Permissions Matrix

| Permission String | Description | Roles Permitted |
| :--- | :--- | :--- |
| `taxcase:read_own` | Read access to own personal TaxCase | `TAXPAYER`, `BUSINESS_OWNER` |
| `taxcase:read_assigned` | Read access to assigned queue TaxCases | Preparers, Domain Reviewers, Attorneys |
| `taxcase:modify_positions`| Modify tax line items and deduction claims | `CPA`, `EA`, Senior Reviewers |
| `taxcase:signoff_return` | Final authorized sign-off on tax returns | `CPA`, `EA`, Senior Reviewers |
| `taxcase:privilege_escalate`| Flag case as IRC § 7525 legally privileged | `TAX_ATTORNEY` |
| `sales_tax:manage_nexus` | Configure economic/physical nexus thresholds | Sales Tax Reviewers, `BUSINESS_OWNER` |
| `payroll:read_compensation`| View employee individual salaries | Payroll Reviewers, `BUSINESS_OWNER` (explicit grant) |
| `payroll:read_pii` | View full SSNs and home addresses | Highly restricted: Senior Payroll Reviewer |
| `ops:route_cases` | Reassign cases and adjust priority queues | `OPERATIONS_MANAGER`, `FIRM_ADMINISTRATOR` |
| `rules:publish_version` | Release new tax rule calculation packages | `TAX_KNOWLEDGE_ADMINISTRATOR` |
| `security:inspect_audit` | View cryptographic SHA-256 audit ledger | `SECURITY_ADMINISTRATOR`, `SUPER_ADMINISTRATOR` |
| `platform:kill_switch` | Engage global emergency agent halt | `SUPER_ADMINISTRATOR` (MFA Step-Up Required) |
