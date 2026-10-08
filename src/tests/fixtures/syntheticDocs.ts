/**
 * Autonomous TaxOS — Synthetic Document Fixtures (Phase 2 Verification)
 * 
 * Provides deterministic, cryptographically valid test documents:
 * 1. Form W-2 (PDF & Text)
 * 2. Form 1099-NEC (PDF & Text)
 * 3. Form 1099-K (PDF)
 * 4. Form 1098 Mortgage Interest (PDF)
 * 5. Prior Year Form 1040 (PDF)
 * 6. Receipt / Commercial Expense (Text)
 * 7. Bank Ledger Feed (CSV with formula injection test vector)
 * 8. Conflicting Form W-2 (Same EIN, mismatched Box 1 wages)
 * 9. Active Content Exploit PDF (/JavaScript)
 * 10. Malicious Binary Executable (Windows PE / ELF)
 */

export function createSyntheticPdf(lines: string[]): Buffer {
  const streamContent = lines.map(l => `(${l.replace(/[\(\)\\]/g, '\\$&')}) Tj T*`).join('\n');
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${streamContent.length + 50} >>
stream
BT
/F1 12 Tf
72 720 Td
14 TL
${streamContent}
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
380
%%EOF
`;
  return Buffer.from(pdfString, 'utf-8');
}

/**
 * 1. Canonical Form W-2 (PDF)
 * Alex Rivera - Acme Technologies Inc ($125,000.00 Wages, $24,500 Fed Withholding)
 */
export const SYNTHETIC_W2_PDF = createSyntheticPdf([
  'Form W-2: Wage and Tax Statement 2026',
  'Employer Name: Acme Technologies Inc',
  'Employer Identification Number: 12-3456789',
  'Employee Name: Alex Rivera',
  'Social Security Number: 000-11-2345',
  'Box 1 Wages, tips, other compensation: 125,000.00',
  'Box 2 Federal income tax withheld: 24,500.00',
  'Box 3 Social Security wages: 125,000.00',
  'Box 4 Social Security tax withheld: 7,750.00',
  'Box 15 State: CA',
  'Box 16 State wages: 125,000.00',
  'Box 17 State income tax: 8,200.00',
]);

/**
 * 2. Conflicting Form W-2 (PDF)
 * Same Employer EIN (12-3456789) but Box 1 is $140,000.00 -> Triggers cross-document conflict
 */
export const SYNTHETIC_CONFLICTING_W2_PDF = createSyntheticPdf([
  'Form W-2: Wage and Tax Statement 2026',
  'Employer Name: Acme Technologies Inc',
  'Employer Identification Number: 12-3456789',
  'Employee Name: Alex Rivera',
  'Social Security Number: 000-11-2345',
  'Box 1 Wages, tips, other compensation: 140,000.00',
  'Box 2 Federal income tax withheld: 27,800.00',
  'Box 15 State: CA',
  'Box 16 State wages: 140,000.00',
  'Box 17 State income tax: 9,100.00',
]);

/**
 * 3. Form 1099-NEC (PDF)
 * Global Design Partners LLC ($45,000.00 Nonemployee Compensation)
 */
export const SYNTHETIC_1099NEC_PDF = createSyntheticPdf([
  'Form 1099-NEC: Nonemployee Compensation 2026',
  "Payer's Name: Global Design Partners LLC",
  "Payer's TIN: 98-7654321",
  'Recipient Name: Alex Rivera',
  'Box 1 Nonemployee compensation: 45,000.00',
  'Box 4 Federal income tax withheld: 0.00',
]);

/**
 * 4. Form 1099-K (PDF)
 * Stripe Payments ($88,450.00 Gross Volume)
 */
export const SYNTHETIC_1099K_PDF = createSyntheticPdf([
  'Form 1099-K: Payment Card and Third Party Network Transactions 2026',
  'Payment Settlement Entity: Stripe Payments Inc',
  'Box 1a Gross amount of payment: 88,450.00',
  'Box 1b Card Not Present: 88,450.00',
]);

/**
 * 5. Form 1098 Mortgage Interest (PDF)
 * First Horizon Bank ($18,400.00 Interest, $450,000 Principal)
 */
export const SYNTHETIC_1098_PDF = createSyntheticPdf([
  'Form 1098 Mortgage Interest Statement 2026',
  'Recipient / Lender: First Horizon Bank',
  'Box 1 Mortgage interest received: 18,400.00',
  'Box 2 Outstanding mortgage principal: 450,000.00',
]);

/**
 * 6. Prior Year Form 1040 (PDF)
 * 2025 Return ($165,000.00 AGI, $32,100.00 Total Tax)
 */
export const SYNTHETIC_PRIOR_1040_PDF = createSyntheticPdf([
  'Form 1040: U.S. Individual Income Tax Return 2025',
  'Taxpayer: Alex Rivera',
  'Adjusted Gross Income Line 11: 165,000.00',
  'Total Tax Line 24: 32,100.00',
  'Schedule C Profit or Loss From Business included',
]);

/**
 * 7. Commercial Expense Receipt (Plain Text)
 */
export const SYNTHETIC_RECEIPT_TXT = Buffer.from(
  `The Home Depot Pro Desk
Store #0482 - San Francisco, CA
Date: 03/15/2026 14:22
Receipt: REC-8839210
Subtotal: $230.00
Sales Tax: $18.50
Total Amount Due: $248.50
Payment Method: Visa ending in 4242
Auth: 092813
Thank you for your business!`,
  'utf-8'
);

/**
 * 8. Bank Feed CSV (with formula injection attack string)
 */
export const SYNTHETIC_BANK_FEED_CSV = Buffer.from(
  `Date,Description,Amount,Merchant
2026-02-01,Client Retainer Deposit,5000.00,Acme Client
2026-02-05,Office Rent,-2200.00,WeWork Management
2026-02-12,AWS Cloud Hosting,-340.50,Amazon Web Services
2026-02-15,=cmd|'/C calc'!A0,-99.99,Malicious Vendor
2026-02-20,Software Subscription,-150.00,GitHub
`,
  'utf-8'
);

/**
 * 9. Malicious Active Content PDF (/JavaScript)
 */
export const SYNTHETIC_MALICIOUS_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R /OpenAction << /S /JavaScript /JS (app.alert("PWNED");) >> >>
endobj
2 0 obj
<< /Type /Pages /Kids [] /Count 0 >>
endobj
xref
0 3
0000000000 65535 f 
0000000009 00000 n 
0000000108 00000 n 
trailer
<< /Size 3 /Root 1 0 R >>
startxref
158
%%EOF`,
  'utf-8'
);

/**
 * 10. Executable Windows PE binary (Should be rejected immediately)
 */
export const SYNTHETIC_MALICIOUS_EXE = Buffer.from(
  'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00\xB8\x00\x00\x00',
  'binary'
);
