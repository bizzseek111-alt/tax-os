# Phase 2 — Normalized Document Schemas Specification

**Topic:** Statutory Form Field Mappings & BigInt Precision  
**Module:** `src/server/services/ocr/InternalTaxParser.ts`  
**Standard:** 2026.Q1 IRS Statutory Norms  

---

## 1. Monetary Normalization Standard

All extracted financial amounts are normalized to positive 64-bit integers representing **cents** (`BigInt`) to prevent IEEE 754 floating-point inaccuracies.

$$\text{Cents} = \text{round}(\text{Amount} \times 100)$$

---

## 2. Form W-2 Normalized Schema

```typescript
export interface NormalizedW2 {
  employerEin: string;               // XX-XXXXXXX format
  employerName: string;              // Normalized legal name
  employeeName: string;
  employeeSsnToken: string;          // Tokenized reference (token:ssn:XXXX)
  wagesBox1: number;                 // Box 1 taxable compensation
  federalWithholdingBox2: number;    // Box 2 federal income tax withheld
  socialSecurityWagesBox3: number;   // Box 3 OASDI wage base
  socialSecurityTaxBox4: number;     // Box 4 OASDI tax withheld
  medicareWagesBox5: number;         // Box 5 Medicare wages
  medicareTaxBox6: number;           // Box 6 Medicare tax withheld
  stateCode: string;                 // Box 15 two-letter postal jurisdiction
  stateWagesBox16: number;           // Box 16 state taxable wages
  stateWithholdingBox17: number;     // Box 17 state income tax withheld
}
```

### Fact Key Mappings
- `w2_box1_wages` $\rightarrow$ `INCOME` / `W2_WAGES`
- `w2_box2_federal_withholding` $\rightarrow$ `WITHHOLDING` / `FEDERAL_WITHHOLDING`
- `w2_box16_state_wages` $\rightarrow$ `INCOME` / `STATE_WAGES`
- `w2_box17_state_withholding` $\rightarrow$ `WITHHOLDING` / `STATE_WITHHOLDING`

---

## 3. Form 1099-NEC Normalized Schema

```typescript
export interface Normalized1099Nec {
  payerName: string;
  payerTin: string;
  recipientName: string;
  recipientTinToken: string;
  box1NonemployeeCompensation: number;
  box4FederalWithholding: number;
  box5StateTaxWithheld?: number;
  box7StateIncome?: number;
}
```

### Fact Key Mappings
- `form_1099nec_box1` $\rightarrow$ `INCOME` / `SCHEDULE_C_GROSS_RECEIPTS`

---

## 4. Form 1099-K Normalized Schema

```typescript
export interface Normalized1099K {
  paymentSettlementEntity: string;
  merchantCategoryCode?: string;
  grossPaymentVolume: number;        // Box 1a gross volume
  cardNotPresentVolume: number;      // Box 1b CNP volume
  numberOfTransactions?: number;     // Box 2
}
```

### Fact Key Mappings
- `form_1099k_box1a_gross` $\rightarrow$ `INCOME` / `PAYMENT_PROCESSOR_GROSS`

---

## 5. Form 1098 Mortgage Interest Schema

```typescript
export interface Normalized1098 {
  lenderName: string;
  mortgageInterestBox1: number;      // Box 1 deductible interest
  outstandingPrincipalBox2: number;  // Box 2 principal balance
  originationDateBox3?: string;
  refundOfOverpaidInterestBox4?: number;
  mortgageInsurancePremiumsBox5?: number;
}
```

### Fact Key Mappings
- `form_1098_box1_interest` $\rightarrow$ `DEDUCTION` / `MORTGAGE_INTEREST_DEDUCTION`
