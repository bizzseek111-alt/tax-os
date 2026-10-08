# TaxOS Sales & Use Tax Engine Reality & Gap Analysis

**Document Version:** 1.0.0  
**Audit Date:** October 8, 2026  
**Auditor:** Principal Tax Technology Architect & Indirect Tax Lead  
**Scope:** Multi-State Economic Nexus, Rate Determination, SaaS Taxability, Return Prep, and E-Filing

---

## 1. Sales Tax Engine Audit Summary

| Sales Tax Capability | Production Standard | Current Codebase Implementation | Reality Level |
| :--- | :--- | :--- | :--- |
| **Jurisdiction Coverage** | 13,000+ state, county, city, transit, and special district jurisdictions | **4 cities only** (`CA_LOS_ANGELES`, `NY_NEW_YORK_CITY`, `TX_AUSTIN`, `WA_SEATTLE`) in `SAMPLE_MULTI_TIER_RATES`. | **BACKEND_PROTOTYPE** |
| **SaaS & Digital Goods Rules**| Full 45-state indirect taxability matrix | **4 states only** (`NY`, `TX`, `WA`, `CA`) in `SAAS_TAXABILITY_RULES`. Remaining 41 states unmodeled. | **BACKEND_PROTOTYPE** |
| **Economic Nexus Monitoring** | Ingests real-time transaction streams across all 45 sales tax states | Evaluates hardcoded mock records in `MOCK_SALES_NEXUS_STATES` (4 states). | **UI_PROTOTYPE** |
| **Address Normalization** | CASS-certified USPS ZIP+4 geocoding to determine precise tax district | **None.** Requires pre-selected city keys (`destinationKey: 'CA_LOS_ANGELES'`). | **CONCEPT** |
| **Sourcing Logic (Origin vs. Dest)**| Handles mixed sourcing rules (e.g., Texas intrastate origin sourcing vs interstate destination) | Hardcoded string `DESTINATION` across all transactions. | **UI_PROTOTYPE** |
| **Marketplace Facilitator Split** | Deducts Amazon, Shopify Markets, and Etsy facilitator sales | Multiplies mock volume by percentage; no live marketplace API ingestion. | **BACKEND_PROTOTYPE** |
| **Exemption & Resale Certificates**| Digital collection, OCR validation, state tax registry verification | Mock string ID (`issue-resale-cert-missing-01`) rendered in UI. | **UI_PROTOTYPE** |
| **Sales Tax Return Generation** | Generates official state forms (e.g., CA CDTFA-401, NY ST-100, TX 01-114) | Static data displayed in React component (`MOCK_SALES_TAX_CASE`). | **UI_PROTOTYPE** |
| **State E-Filing & Remittance**| Direct API or EDI transmission to state departments of revenue | **None.** No state tax department integrations. | **CONCEPT** |

---

## 2. In-Depth Code Inspection

### 2.1 The 4-City Jurisdiction Limitation
In [`src/services/SalesTaxEngine.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/SalesTaxEngine.ts#L13-L58), the rate table contains exactly four hardcoded city records:
```typescript
export const SAMPLE_MULTI_TIER_RATES: Record<string, SalesTaxRateVersion> = {
  'CA_LOS_ANGELES': { ... compositeRate: 0.0950 },
  'NY_NEW_YORK_CITY': { ... compositeRate: 0.08875 },
  'TX_AUSTIN': { ... compositeRate: 0.0825 },
  'WA_SEATTLE': { ... compositeRate: 0.1035 }
};
```
**Impact:** If a transaction originates in or ships to Chicago (IL), Miami (FL), San Francisco (CA), or any of the thousands of U.S. zip codes outside these four cities, the engine has no rate data.

### 2.2 Sourcing Rule Simplification
In [`src/services/SalesTaxEngine.ts`](file:///Users/macbookpro/.gemini/antigravity/scratch/tax-ai/src/services/SalesTaxEngine.ts#L107), sourcing is marked as `sourcingRule: 'DESTINATION'`.
**Regulatory Reality:** 
- Several major states (including Texas, Ohio, Pennsylvania, and Virginia) enforce **origin-based sourcing** for intrastate sales.
- Under Texas Tax Code § 321.203, a sale shipped from Austin to Dallas is sourced to Austin's city rate, not Dallas. The engine does not account for this.

---

## 3. Production Remediation Roadmap

1. **Integrate Certified Indirect Tax Provider (Avalara / Anrok / Stripe Tax):**
   - Maintaining 13,000+ local tax district boundaries and boundary shifts requires full-time GIS surveying.
   - Recommended approach: Integrate an established indirect tax engine via vendor-neutral adapter (`SalesTaxEngineProvider`).
2. **Build CASS Address Validation Pipeline:** Implement SmartyStreets or USPS Address API to convert customer raw street addresses into 9-digit ZIP+4 geocodes.
3. **Automate Resale Certificate Storage:** Store customer resale certificates in encrypted S3 storage and validate FEIN/permit numbers against state API registries.
