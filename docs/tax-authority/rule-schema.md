# Autonomous Tax OS — Machine-Readable Tax Rule Schema

> **Status**: Approved Tax Technology Specification  
> **Document Version**: 1.0.0  
> **Schema Standard**: JSON-Logic with Typed Predicate Trees & Deterministic Code Bindings  
> **Target Engine**: `TaxRuleGraph`  

---

## 1. Declarative Rule Architecture

Autonomous Tax OS formalizes tax law as structured, machine-readable specifications. Rules are decoupled from LLMs: an agent interprets facts, tests them against declarative conditions, and resolves deterministic calculation functions.

```typescript
export interface TaxRule {
  ruleId: string;                      // Globally unique ID (e.g. "RULE-FED-2026-IRC-162-MEALS")
  jurisdiction: 'US-FED' | 'US-CA' | 'US-NY' | 'US-NJ' | 'US-IL' | 'US-MA';
  taxYear: number;                     // 2024, 2025, 2026
  topic: string;                       // "BUSINESS_MEALS_50_PERCENT"
  description: string;                 // Plain English statutory summary
  
  // 1. Declarative Predicate Tree (JSON-Logic format)
  conditions: {
    and?: any[];
    or?: any[];
    not?: any;
    [key: string]: any;
  };
  
  // 2. Factual Prerequisites
  requiredFacts: string[];             // Required keys in TaxGraph
  exceptions: Array<{
    exceptionCode: string;
    condition: any;
    effect: 'DISALLOW' | 'PHASE_OUT' | 'ESCALATE_CPA';
    statutoryBasis: string;
  }>;
  
  // 3. Mathematical Parameters
  thresholds?: Record<string, number>; // e.g. { standardRateCents: 70 }
  phaseOuts?: Array<{
    metric: string;                    // e.g. "taxableIncomeCents"
    floorCents: number;
    ceilingCents: number;
    reductionFormula: string;
  }>;
  elections?: Array<{
    electionCode: string;              // e.g. "ELECTION_SEC_179"
    statementTemplate: string;
  }>;
  
  // 4. Deterministic Code & Form Mappings
  calculationReference: string;        // Name of deterministic TS function
  formMappings: Array<{
    targetForm: string;                // "1040-SCH-C"
    targetLine: string;                // "Line 24b"
    lineDescription: string;           // "Deductible meals"
  }>;
  
  // 5. State Conformity Adjustments
  stateAdjustments?: {
    isConforming: boolean;
    additionModificationLine?: string; // e.g. "CA-SCH-CA-Part-I-Line-3"
    subtractionModificationLine?: string;
    stateCodeSection?: string;
  };
  
  // 6. Authority Citations & Provenance
  authorityRefs: Array<{
    citationString: string;            // "IRC § 274(n)(1)"
    authorityType: 'STATUTE' | 'REGULATION' | 'REVENUE_RULING';
    publisher: string;                 // "Internal Revenue Service"
    url: string;
    precedentialStatus: 'BINDING' | 'PERSUASIVE';
  }>;
  
  effectivePeriod: {
    startDate: string;                 // ISO 8601
    endDate?: string;                  // Sunset date if expiring
  };
  ruleVersion: string;                 // Semantic version: "2026.1.0"
  reviewStatus: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'DEPRECATED';
  approvedByCpaId?: string;
}
```

---

## 2. Concrete Example 1: Federal Business Meals (IRC § 274(n))

```json
{
  "ruleId": "RULE-FED-2026-IRC-274-MEALS",
  "jurisdiction": "US-FED",
  "taxYear": 2026,
  "topic": "BUSINESS_MEALS_50_PERCENT",
  "description": "Business meals are 50% deductible if ordinary, necessary, and not lavish or extravagant.",
  "conditions": {
    "and": [
      { "==": [{ "var": "expense.type" }, "MEAL"] },
      { "==": [{ "var": "expense.businessPurposeVerified" }, true] },
      { "!=": [{ "var": "expense.isLavishOrExtravagant" }, true] }
    ]
  },
  "requiredFacts": ["expense.amountCents", "expense.businessPurposeVerified"],
  "exceptions": [
    {
      "exceptionCode": "PERSONAL_ENTERTAINMENT",
      "condition": { "==": [{ "var": "expense.isEntertainment" }, true] },
      "effect": "DISALLOW",
      "statutoryBasis": "IRC § 274(a)(1) Disallowance of entertainment activities"
    }
  ],
  "thresholds": {
    "deductiblePercentage": 0.50
  },
  "calculationReference": "calculateMealsFiftyPercent",
  "formMappings": [
    {
      "targetForm": "1040-SCH-C",
      "targetLine": "Line 24b",
      "lineDescription": "Deductible meals (subject to 50% limitation)"
    }
  ],
  "authorityRefs": [
    {
      "citationString": "IRC § 274(n)(1)",
      "authorityType": "STATUTE",
      "publisher": "Internal Revenue Service",
      "url": "https://www.law.cornell.edu/uscode/text/26/274",
      "precedentialStatus": "BINDING"
    }
  ],
  "effectivePeriod": { "startDate": "2026-01-01" },
  "ruleVersion": "2026.1.0",
  "reviewStatus": "ACTIVE",
  "approvedByCpaId": "cpa_sarah_jenkins_01"
}
```

---

## 3. Concrete Example 2: California Section 179 Cap (Cal. RTC § 17255)

```json
{
  "ruleId": "RULE-CA-2026-RTC-17255-SEC179",
  "jurisdiction": "US-CA",
  "taxYear": 2026,
  "topic": "CALIFORNIA_SEC_179_EXPENSING_CAP",
  "description": "California caps Section 179 expensing at $25,000, creating an addition modification on Schedule CA.",
  "conditions": {
    "and": [
      { ">": [{ "var": "federal.section179ClaimedCents" }, 2500000] }
    ]
  },
  "requiredFacts": ["federal.section179ClaimedCents"],
  "thresholds": {
    "caSection179MaxDeductionCents": 2500000,
    "caPhaseOutThresholdCents": 20000000
  },
  "calculationReference": "calculateCaliforniaSection179Addition",
  "formMappings": [
    {
      "targetForm": "CA-540-SCH-CA",
      "targetLine": "Part I, Line 3, Column B (Additions)",
      "lineDescription": "Section 179 expense difference between federal and California"
    }
  ],
  "stateAdjustments": {
    "isConforming": false,
    "additionModificationLine": "Part I, Line 3, Column B",
    "stateCodeSection": "Cal. Rev. & Tax. Code § 17255"
  },
  "authorityRefs": [
    {
      "citationString": "Cal. Rev. & Tax. Code § 17255",
      "authorityType": "STATUTE",
      "publisher": "California Franchise Tax Board",
      "url": "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=17255.&lawCode=RTC",
      "precedentialStatus": "BINDING"
    }
  ],
  "effectivePeriod": { "startDate": "2026-01-01" },
  "ruleVersion": "2026.1.0",
  "reviewStatus": "ACTIVE",
  "approvedByCpaId": "cpa_sarah_jenkins_01"
}
```
