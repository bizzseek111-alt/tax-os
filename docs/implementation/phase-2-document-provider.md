# Phase 2 — Document Intelligence Provider Specification

**Engine:** `InternalTaxParser`  
**Interface:** `DocumentIntelligenceProvider` (`src/server/services/ocr/provider.ts`)  
**Status:** PRODUCTION READY  

---

## 1. Provider Abstraction

Autonomous TaxOS defines a pluggable provider interface allowing multiple OCR backends (internal parser, AWS Textract, Azure Document Intelligence, Google Cloud Document AI):

```typescript
export interface DocumentIntelligenceProvider {
  name: string;
  version: string;
  extractText(buffer: Buffer, mimeType: string): Promise<string>;
  extractPages(buffer: Buffer, mimeType: string): Promise<OcrPage[]>;
  extractTables(buffer: Buffer, mimeType: string): Promise<TableData[]>;
  extractKeyValuePairs(buffer: Buffer, mimeType: string): Promise<KeyValuePair[]>;
  classifyDocument(buffer: Buffer, mimeType: string, text: string): Promise<ClassificationResult>;
  extractStructuredFields(
    documentType: DocumentType,
    buffer: Buffer,
    mimeType: string,
    text: string
  ): Promise<StructuredExtractionResult>;
  processDocument(buffer: Buffer, mimeType: string): Promise<DocumentPipelineResult>;
}
```

---

## 2. Classification Hierarchy (25 Form Types)

The provider deterministically classifies 25 tax document types without relying on filenames:
1. `FORM_W2` (Wage and Tax Statement)
2. `FORM_1099_NEC` (Nonemployee Compensation)
3. `FORM_1099_K` (Payment Card / Third-Party Network)
4. `FORM_1099_MISC` (Miscellaneous Information)
5. `FORM_1099_INT` (Interest Income)
6. `FORM_1099_DIV` (Dividends & Distributions)
7. `FORM_1099_B` (Brokerage Proceeds)
8. `FORM_1098_MORTGAGE` (Mortgage Interest)
9. `FORM_1098_E` (Student Loan Interest)
10. `FORM_1098_T` (Tuition Statement)
11. `FORM_1040_PRIOR_YEAR` (Historical Individual Return)
12. `SCHEDULE_C` (Profit/Loss from Business)
13. `SCHEDULE_D` (Capital Gains & Losses)
14. `SCHEDULE_E` (Supplemental Income & Rental)
15. `SCHEDULE_K1` (Partner/Shareholder Income)
16. `RECEIPT_EXPENSE` (Commercial Expense Receipt)
17. `INVOICE_SALES` (Sales / Revenue Invoice)
18. `BANK_STATEMENT` (Checking/Savings Account PDF)
19. `CREDIT_CARD_STATEMENT` (Revolving Credit Statement)
20. `BROKERAGE_STATEMENT` (Investment Portfolio Statement)
21. `BANK_FEED_CSV` (Delimited Financial Ledger)
22. `PAYROLL_SUMMARY` (Employer Payroll Ledger)
23. `SALES_TAX_REPORT` (State Sales & Use Tax Return)
24. `TAX_AGENCY_NOTICE` (IRS / FTB Statutory Notice)
25. `UNKNOWN` (Requires Professional Review)
