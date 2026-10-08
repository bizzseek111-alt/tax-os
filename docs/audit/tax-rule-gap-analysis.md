# TaxOS Statutory Tax Rule Safety & Codification Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Senior U.S. Tax Technology Architect & Compliance Lead  
**Governing Standard:** No material tax rule may live solely in React components, frontend constants, or LLM system prompts.

---

## 1. Inventory of Current Tax Rule Locations

An exhaustive audit of the codebase reveals that tax rules are fragmented across **four disparate locations**, including front-end UI files:

### 1.1 Location A: Embedded in React Components (CRITICAL SAFETY VIOLATION)
Multiple material statutory thresholds and calculations are hardcoded directly in JSX text and component event handlers:
- **`src/components/public/IndividualsPage.tsx` (Line 177):** Hardcoded medical expense floor (`>7.5% AGI`), SALT deduction cap (`$10,000`), standard deduction (`$15,750 Single / $31,500 Married`).
- **`src/components/ux/TaxpayerWorkspace.tsx` (Lines 198–228, 346–358):**
  - Section 280A home office simplified deduction (`$5/sq ft up to 300 sq ft = $1,500`).
  - Hardcoded refund arithmetic (`federalRefund += 142` for $412.50 airfare; `federalRefund += 326` for home office).
  - Robinhood basis risk calculation (`$1,240 proceeds = $430 erroneous notice`).
- **`src/components/ux/SuperAdminView.tsx` (Lines 63–111):** Hardcoded statutory references in component state array rather than querying a rule API.

### 1.2 Location B: Frontend Mock Constants (`src/services/MockData.ts`)
- Economic nexus thresholds: $100,000 sales / 200 transactions across California, New York, Texas, Washington.
- Hardcoded composite rates: 9.50% Los Angeles County.
- Form 941 liability lines: Fixed $18,490 withholding amounts.

### 1.3 Location C: Procedural Code in Engines
- **`src/services/TaxCalculationEngine.ts`:**
  - Standard deductions: $15,000 Single / $30,000 Married (Lines 67–68).
  - 4 Federal tax brackets (10%, 12%, 22%, 24%) (Lines 78–87).
  - California HSA non-conformity (Cal. RTC § 17215.4) and QBI disallowance (Line 100).
  - New York convenience of the employer telecommuting factor (20 NYCRR § 131.18) (Line 115).
  - New Jersey loss netting prohibition (N.J.S.A. § 54A:5-2) (Line 124).
  - Illinois 4.95% flat tax and pension subtraction (35 ILCS 5/203) (Line 132).
  - Massachusetts 5% flat income and 4% Fair Share surtax over $1,053,750 (MGL ch. 62 § 4(d)) (Line 140).
- **`src/services/SalesTaxEngine.ts`:**
  - 4 static cities in `SAMPLE_MULTI_TIER_RATES`.
  - 4 static SaaS state rules in `SAAS_TAXABILITY_RULES`.
- **`src/services/PayrollEngine.ts`:**
  - `PAYROLL_CONSTANTS_2027`: $168,600 Social Security cap, 6.2% SS, 1.45% Medicare, 0.9% Additional Medicare over $200k, $50,000 lookback threshold (IRC § 6302).

### 1.4 Location D: Authoritative Legal Knowledge Store (`src/tax-authority/AuthorityStore.ts`)
- Contains 420 lines of structured TypeScript objects defining 12 federal and state authorities.
- **Limitation:** Stored as static read-only TypeScript code; cannot be updated without a full application rebuild and redeployment.

---

## 2. Tax Rule Safety Gaps & Regulatory Risks

| Rule Domain | Current Storage | Regulatory Risk / Failure Mode | Target Architecture |
| :--- | :--- | :--- | :--- |
| **Federal Form 1040 Brackets** | Hardcoded in `TaxCalculationEngine.ts` | Inflation adjustments for 2026/2027 require code modification; brackets above 24% (32%, 35%, 37%) are missing. | Versioned JSON Ruleset in Database with effective date range |
| **State Conformity Add-Backs** | Hardcoded switch statement | Only handles 1 adjustment per state; misses hundreds of other state additions/subtractions. | Declarative State Rule Engine (AST/JSON-Logic) |
| **Sales Tax Multi-Tier Rates** | 4 cities in `SalesTaxEngine.ts` | 99.9% of U.S. zip codes will fail calculation or default to an incorrect rate. | CASS-certified Address Normalizer + 13,000+ Jurisdiction Database |
| **SaaS Taxability Matrix** | 4 states in `SalesTaxEngine.ts` | Multi-state B2B transactions in remaining 41 sales tax states cannot be accurately taxed. | Comprehensive 45-State Taxability Matrix (TIC Mappings) |
| **Payroll FIT Withholding** | 3-tier heuristic (12%/22%/24%) | Under/over-withholding violates IRS Pub 15-T; exposes employers to penalties under IRC § 6656. | Exact IRS Pub 15-T Percentage & Wage Bracket Tables |
| **Worker Classification ABC Test** | Procedural helper `WorkerClassificationGuard` | Court precedents (Dynamex, AB 5 exemptions) cannot be dynamically updated as case law evolves. | Vectorized Legal RAG + Rule Decision Tree |

---

## 3. Rule Codification & Safety Action Items

1. **Rule Migration Policy:** Extract all tax thresholds, deductions, and rate tables out of React JSX and procedural TypeScript switch statements.
2. **Deploy Structured Rules Engine:** Implement a declarative, schema-validated rule format (e.g., JSON Schema / JSON-Logic):
   ```json
   {
     "ruleId": "RULE-FED-1040-STD-DED-2026",
     "jurisdiction": "US-FED",
     "taxYear": 2026,
     "effectiveFrom": "2026-01-01",
     "statuteCitation": "26 U.S.C. § 63(c)",
     "parameters": {
       "SINGLE": 1500000,
       "MARRIED_JOINT": 3000000,
       "HEAD_OF_HOUSEHOLD": 2250000
     }
   }
   ```
3. **Automated IRS & State Regression Test Suite:** Create unit test harnesses verifying that engine outputs match official IRS tax tables and state tax department test returns down to the integer cent.
