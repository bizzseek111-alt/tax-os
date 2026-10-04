# Autonomous Tax OS — Tax Authority Hierarchy & Source Precedence

> **Status**: Approved Tax Technology Specification  
> **Document Version**: 1.0.0  
> **Jurisprudential Baseline**: United States Federal + Initial 5 Sovereign States (CA, NY, NJ, IL, MA)  
> **Core Mandate**: Primary Sources First — Secondary Sources Never Silently Override Primary Authority  

---

## 1. The Five-Level Legal Precedence Hierarchy

Autonomous Tax OS rejects naive "PDF RAG." In legal and tax compliance, information cannot be treated as a flat bag of text embeddings. Sources carry strict statutory weight, precedential value, and jurisdictional boundaries.

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PRIMARY STATUTORY LAW (Supreme Legal Authority)               │
│ • Federal: Internal Revenue Code (Title 26 of the United States Code)  │
│ • States: Sovereign Revenue & Taxation Codes (Cal. RTC, NY Tax Law)    │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 2: ADMINISTRATIVE REGULATIONS (Promulgated Rule of Law)          │
│ • Federal: Treasury Regulations (Title 26 of the Code of Fed. Regs)   │
│ • States: State Administrative Codes (18 CCR for CA, 20 NYCRR for NY)  │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 3: OFFICIAL TAX AGENCY GUIDANCE & ADMINISTRATIVE RULINGS         │
│ • Federal: IRS Revenue Rulings, Revenue Procedures, Notices, Forms     │
│ • States: FTB Legal Rulings/Notices, NY TSB-Ms, NJ Technical Bulletins │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 4: JUDICIAL DECISIONS & CASE LAW PRECEDENTS                      │
│ • Precedential: Supreme Court, Federal Circuit Courts, Tax Court Reg.  │
│ • Non-Precedential: Tax Court Summary/Memo, District Court Decisions   │
├────────────────────────────────────────────────────────────────────────┤
│ LEVEL 5: SECONDARY RESEARCH & COMMENTARY (Informational Only)          │
│ • BNA Tax Management Portfolios, RIA Checkpoint, CCH Standard Federal  │
│ • RULE: Secondary sources CANNOT be cited as primary audit authority.  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Authority Metadata Schema

Every legal document, regulation, ruling, or form ingested into the Tax Authority Engine must be indexed with complete structured metadata:

```typescript
export interface TaxAuthoritySource {
  authorityId: string;                 // Unique URN: e.g. "urn:tax:us:fed:statute:irc:162"
  jurisdiction: 'US-FED' | 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';
  taxYear: number;                     // Applicable tax year (e.g. 2026)
  authorityType: 
    | 'STATUTE'
    | 'REGULATION'
    | 'REVENUE_RULING'
    | 'REVENUE_PROCEDURE'
    | 'OFFICIAL_FORM_INSTRUCTION'
    | 'ADMINISTRATIVE_NOTICE'
    | 'COURT_DECISION'
    | 'SECONDARY_COMMENTARY';
  authorityLevel: 1 | 2 | 3 | 4 | 5;   // 1 (Highest) to 5 (Lowest)
  publisher: string;                   // "Internal Revenue Service", "California FTB"
  title: string;                       // "IRC § 162 - Trade or Business Expenses"
  citationString: string;              // "26 U.S.C. § 162(a)"
  sourceUrl: string;                   // Permanent government or archival URL
  publicationDate: string;             // ISO 8601
  effectiveFrom: string;               // ISO 8601
  effectiveTo?: string;                // ISO 8601 or undefined if active
  precedentialStatus: 'BINDING' | 'PERSUASIVE' | 'NON_PRECEDENTIAL';
  supersededBy?: string;               // Authority ID of superseding document
  supersedes?: string[];               // Prior authority IDs superseded
  affectedForms: string[];             // e.g. ["1040-SCH-C", "1120-S"]
  affectedSchedules: string[];         // e.g. ["Schedule C", "Schedule 1"]
  topicTags: string[];                 // ["ordinary_necessary", "business_travel"]
  contentHash: string;                 // SHA-256 of raw text
  sourceVersion: string;               // e.g. "2026.Q1"
  reviewStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'DEPRECATED';
}
```

---

## 3. Strict Precedence Resolution Rules

When resolving tax research questions, the engine evaluates propositions using four strict precedence rules:
1. **The Hierarchy Rule**: A Level 1 statute always trumps an administrative publication (Level 3) or secondary commentary (Level 5).
2. **The Temporal Rule**: If an IRS Revenue Procedure is superseded (e.g., standard mileage rate updated annually), the superseded document is marked `precedentialStatus: 'NON_PRECEDENTIAL'` for the active tax year and cannot support a new deduction.
3. **The Jurisdiction Rule**: Federal authority cannot establish state tax deductibility where a sovereign state statute has explicitly non-conformed.
4. **The Secondary Barrier**: Secondary commentary can be used by agents to discover arguments, but the final citation emitted must point to the underlying primary Level 1–4 authority.
