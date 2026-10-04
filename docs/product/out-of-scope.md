# Autonomous Tax OS — Out-of-Scope & Boundary Defense Specification

> **Status**: Approved Architectural Guardrail  
> **Purpose**: Prevent V1 Scope Creep & Protect Core Engine Purity  
> **Enforcement**: Automated Intake Deflection & Pre-Ingestion Boundary Checks  

---

## 1. Architectural Integrity & Boundary Philosophy

To achieve exceptional depth, 100% calculation accuracy, and zero hallucinations in the V1 launch footprint, **Autonomous Tax OS strictly limits its scope to the Form 1040 ecosystem across the federal government and five launch states (CA, NY, NJ, IL, MA)**.

Allowing complex international tax rules or multi-tier corporate structures into the V1 engine risks contaminating the core Tax Graph schemas with unverified edge cases.

---

## 2. Explicit Out-of-Scope Tax Situations (V1 Non-Goals)

The following entities, forms, and transactions are strictly **OUT OF SCOPE** for V1:

### 2.1 Corporate & Fiduciary Entity Returns
* **Form 1120 (Stand-alone C-Corporations)**: Corporate franchise income tax and corporate AMT.
* **Form 1065 (Complex Multi-Tier Partnerships)**: Real estate syndications, special allocations under IRC § 704(b), debt-basis adjustments under IRC § 752. *(Note: Single-member disregarded LLCs filing on Schedule C ARE in scope).*
* **Form 1041 (Estates & Complex Trusts)**: Fiduciary income tax and Distributable Net Income (DNI) calculations.
* **Form 990 (Tax-Exempt Organizations)**: Non-profit informational returns.

### 2.2 International & Expatriate Tax
* **Form 2555 (Foreign Earned Income Exclusion)**: Physical presence and bona fide residence tests outside the U.S.
* **Form 8621 (PFIC)**: Passive Foreign Investment Company mark-to-market and excess distribution calculations under IRC § 1291.
* **Form 5471 / 8865 / 8858**: Controlled Foreign Corporations (CFC), Subpart F income, and Global Intangible Low-Taxed Income (GILTI).
* **FBAR / FinCEN Form 114**: Foreign Bank and Financial Accounts reporting (tracked as an advisory reminder, but unfiled in V1).

### 2.3 Highly Specialized Domestic Transactions
* **Section 1031 Like-Kind Exchanges**: Real estate non-recognition exchanges, qualified intermediary escrows, and boot calculations.
* **Complex Multi-Pool DeFi / Crypto Derivatives**: Margin trading, liquidity pool impermanent loss allocations, and wrapped token arbitrage. *(Simple spot cryptocurrency sales on Form 1099-DA/1099-B ARE in scope).*
* **Form 706 / 709 (Estate & Gift Tax)**: Lifetime unified credit tracking and generation-skipping transfer tax.

### 2.4 Non-Launch States (V1)
* Returns requiring state filings outside California, New York, New Jersey, Illinois, and Massachusetts.

---

## 3. Automated Intake Deflection Rules

Autonomous Tax OS employs a strict **Intake Guardrail Agent** that analyzes uploaded documents during pre-processing. If an unsupported document or fact is detected, the system immediately halts the flow for that unsupported component without corrupting the TaxCase:

```
[Document Uploaded]
       │
       ▼
Intake Guardrail Inspection
       │
       ├── Supported (W-2, 1099-NEC, 1099-K, Schedule C receipts) ──> Tax Graph Ingestion
       │
       └── Unsupported Detected (e.g., Form 2555, Form 8621, Out-of-Scope State)
             │
             ▼
       Graceful Deflection Protocol Triggered:
       1. Flag TaxCase as "OUT_OF_SCOPE_SITUATION"
       2. Present Calm, Informative Modal to Taxpayer
       3. Provide Clean Export of Reconstructed Data & Form 1099 Summary
       4. Offer Warm Referral to Certified Specialist Network
```

### Deflection UX Copy Standard:
> **“We detected foreign earned income exclusion forms (Form 2555). To protect your filing accuracy, Autonomous Tax OS currently specializes exclusively in domestic U.S. individual and independent business returns. We have packaged your verified documents for export so you can easily provide them to an international CPA specialist.”**
