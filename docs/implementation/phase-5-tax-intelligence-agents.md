# Phase 5 — Tax Intelligence Agents: Technical Specifications

## 1. Overview

Autonomous Tax OS deploys domain-specific intelligence agents that analyze raw documents, bank transactions, and taxpayer profiles to generate structured tax facts and candidates without performing authoritative tax math.

---

## 2. Agent Technical Specifications

### 2.1 IntakeAgent (`INTAKE_AGENT`)
- **Purpose**: Validates taxpayer filing identity under IRC § 1 and § 2.
- **Input**:
  ```typescript
  export interface IntakeAgentInput {
    rawQuestionnaire: Record<string, any>;
    documentIds: string[];
    taxYear: number;
  }
  ```
- **Output**:
  ```typescript
  export interface IntakeAgentResult {
    taxpayerName: string;
    filingStatus: string;
    hasDependents: boolean;
    dependentsCount: number;
    validatedFacts: string[];
    missingProfileFields: string[];
  }
  ```
- **Invariants**: Cannot guess SSN or filing status; creates `TaxFact` only from verified inputs.

---

### 2.2 IncomeReconstructionAgent (`INCOME_RECONSTRUCTION_AGENT`)
- **Purpose**: Establishes economic income relationships under IRC § 61 and reconciles overlapping 1099, 1099-K, and bank deposits.
- **Input**:
  ```typescript
  export interface IncomeReconstructionInput {
    taxCaseId: string;
    taxYear: number;
    requireBankDepositReconciliation: boolean;
  }
  ```
- **Output**:
  ```typescript
  export interface IncomeReconstructionResult {
    grossReceiptsTotalCents: bigint;
    reconstructedStreams: Array<{
      source: string;
      payerName: string;
      grossAmountCents: bigint;
      isDuplicateCandidate: boolean;
    }>;
    unresolvedDuplicatesCount: number;
  }
  ```
- **Invariants**: Never merges uncertain income streams automatically above $600 threshold without professional sign-off.

---

### 2.3 TransactionClassificationAgent (`TRANSACTION_CLASSIFICATION_AGENT`)
- **Purpose**: Classifies debit lines into expense categories (e.g. Software, Office Supplies, Advertising) and distinguishes business vs personal candidate status.
- **Input**:
  ```typescript
  export interface TransactionClassificationInput {
    transactions?: Array<{
      id: string;
      description: string;
      rawMerchant?: string;
      amount: number;
      direction: 'DEBIT' | 'CREDIT';
    }>;
  }
  ```
- **Output**:
  ```typescript
  export interface TransactionClassificationOutput {
    classifiedCount: number;
    classifications: ClassifiedTransactionCandidate[];
    businessCandidates: ClassifiedTransactionCandidate[];
    personalCandidates: ClassifiedTransactionCandidate[];
    totalBusinessExpenseCents: bigint;
  }
  ```
- **Invariants**: Does NOT declare tax deductibility alone. Merely determines business candidate vs personal.

---

### 2.4 DeductionHunter (`DEDUCTION_HUNTER`)
- **Purpose**: Scans business expenses and creates structured `TaxPosition` proposals citing statutory authority.
- **Input**:
  ```typescript
  export interface DeductionHunterInput {
    businessCategory?: string;
    candidateTransactions?: Array<{
      id: string;
      merchant: string;
      amount: number;
      category: string;
    }>;
  }
  ```
- **Output**:
  ```typescript
  export interface DeductionHunterResult {
    positionsCreated: number;
    positions: Array<{
      title: string;
      amount: number;
      citation: string;
      confidence: number;
    }>;
    totalDeductionsProposed: number;
  }
  ```
- **Invariants**: Cites valid IRC sections (e.g. IRC § 162). Links proposed deductions to the Evidence Graph. Precision is prioritized over maximization.

---

### 2.5 HomeOfficeAgent (`HOME_OFFICE_AGENT`)
- **Purpose**: Evaluates IRC § 280A exclusive and regular use rules and calculates deduction under Simplified vs Actual methods.
- **Input**:
  ```typescript
  export interface HomeOfficeInput {
    squareFootageOffice: number;
    squareFootageTotalHome: number;
    isExclusiveUse: boolean;
    isRegularUse: boolean;
    actualHomeExpenses?: {
      mortgageInterestOrRent: number;
      utilities: number;
      insurance: number;
      repairs: number;
    };
  }
  ```
- **Output**:
  ```typescript
  export interface HomeOfficeResult {
    isQualified: boolean;
    recommendedMethod: 'SIMPLIFIED' | 'ACTUAL';
    allowableDeductionAmount: number;
    statutoryCitation: 'IRC § 280A(c)(1)';
    disqualificationReason?: string;
  }
  ```
- **Invariants**: Disallows deduction immediately if `isExclusiveUse` is false. Caps simplified method at 300 sq ft ($1,500).

---

### 2.6 VehicleMileageAgent (`VEHICLE_MILEAGE_AGENT`)
- **Purpose**: Evaluates IRC § 274(d) strict substantiation requirements and Rev. Proc. standard mileage rates.
- **Input**:
  ```typescript
  export interface VehicleMileageInput {
    taxYear: number;
    businessMiles: number;
    totalMiles: number;
    vehicleDescription: string;
    hasContemporaneousLog: boolean;
    actualExpenses?: { gas: number; insurance: number; repairs: number; depreciationOrLease: number };
  }
  ```
- **Output**:
  ```typescript
  export interface VehicleMileageResult {
    isSubstantiated: boolean;
    standardMileageRate: number; // e.g. $0.70/mi
    allowableDeduction: number;
    chosenMethod: 'STANDARD_MILEAGE' | 'ACTUAL_EXPENSE';
    evidenceWarning?: string;
  }
  ```
- **Invariants**: Rejects oral claims without contemporaneous records under IRC § 274(d).

---

### 2.7 AssetAgent (`ASSET_AGENT`)
- **Purpose**: Evaluates equipment purchases under IRC § 179 expensing, Bonus Depreciation, and De Minimis Safe Harbor.
- **Input**:
  ```typescript
  export interface AssetAgentInput {
    itemName: string;
    cost: number;
    acquisitionDate: string;
    businessUsePercentage: number;
    hasApplicableFinancialStatement: boolean;
  }
  ```
- **Output**:
  ```typescript
  export interface AssetAgentResult {
    treatment: 'DE_MINIMIS_SAFE_HARBOR_EXPENSE' | 'SECTION_179_EXPENSE' | 'CAPITALIZE_AND_DEPRECIATE';
    deductibleAmountCurrentYear: number;
    statutoryCitation: string;
    electionRequired: string;
  }
  ```
- **Invariants**: Applies $2,500 book safe harbor under Treas. Reg. § 1.263(a)-1(f) for items under $2,500 without capitalizing.

---

### 2.8 TaxResearchAgent (`TAX_RESEARCH_AGENT`)
- **Purpose**: Queries the Phase 4 Tax Authority Engine for authoritative guidance and validates citations against the live legal corpus.
- **Input**:
  ```typescript
  export interface TaxResearchInput {
    query: string;
    jurisdiction: SupportedJurisdiction;
    taxYear: number;
    assertedCitation?: string;
    topic?: string;
  }
  ```
- **Output**:
  ```typescript
  export interface TaxResearchResult {
    query: string;
    jurisdiction: string;
    taxYear: number;
    citationValid?: boolean;
    topAuthorities: Array<{
      citation: string;
      title: string;
      authorityType: string;
      precedentialStatus: string;
      snippet: string;
      score: number;
    }>;
    legalConclusion: string;
  }
  ```
- **Invariants**: Only returns verified sources from the database. Rejects model-pretraining hallucinations.
