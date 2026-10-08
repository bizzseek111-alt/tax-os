# Phase 7 — State Return Preparation & Lineage Engine

## 1. Supported Return Form Architecture
The `ReturnEngine` generates signature-ready, line-by-line tax returns across the five launch states:

### 1.1. California CDTFA-401-A (State, Local & District Sales and Use Tax Return)
- **Line 1**: Total Gross Sales
- **Line 2**: Nontaxable Sales (Marketplace facilitated sales, interstate commerce, resale)
- **Line 3**: Taxable Sales = Line 1 - Line 2
- **Line 4**: State (6.00%) & Local (1.25%) Sales Tax
- **Line 5 / Schedule A**: District Taxes allocated by jurisdiction (San Francisco, Los Angeles, San Jose)
- **Line 6 / Schedule T**: Purchases Subject to Consumer Use Tax
- **Line 10**: Total Tax Due = Line 4 + Line 5 + Line 6
- **Line 12**: Net Tax Payable.

### 1.2. New York ST-100 (Quarterly Sales and Use Tax Return)
- **Step 1**: Gross Sales and Services & Marketplace Facilitator Deductions
- **Step 2**: Taxable Sales and Services
- **Step 3**: Purchases Subject to Use Tax
- **Step 4 / Schedule B**: Local Tax Allocation (New York City 4.5% + MCTD 0.375% = 4.875% local; Nassau, Westchester)
- **Step 5**: Total Tax Due
- **Step 7**: Vendor Collection Credit (5% discount up to max $200 for timely filing)
- **Step 8**: Net Amount Due.

### 1.3. Illinois ST-1 (Sales and Use Tax and E911 Surcharge Return)
- **Line 1**: Total Gross Receipts
- **Line 2**: Total Deductions (Marketplace sales, resale, interstate)
- **Line 3**: Taxable Receipts
- **Line 4**: State Tax (6.25% general merchandise)
- **Line 5 / Schedule A**: Municipal & County Retailers' Occupation Tax (Chicago Cook County composite)
- **Line 6**: Sourcing distinction (Intrastate origin vs Interstate remote destination)
- **Line 8**: Retailer's Discount (1.75% discount for timely filing)
- **Line 10**: Total Tax Payable.

### 1.4. New Jersey ST-50 (Quarterly State Sales and Use Tax Return)
- **Line 1**: Gross Receipts
- **Line 2**: Exempt Receipts (Marketplace sales, clothing, groceries)
- **Line 3**: Taxable Receipts
- **Line 4**: Sales Tax Due (6.625%)
- **Line 5**: Use Tax Due
- **Line 7**: Net Tax Due.

### 1.5. Massachusetts ST-9 (Sales and Use Tax Return)
- **Line 1**: Gross Sales
- **Line 2**: Exempt Sales (Marketplace, clothing < $175, services)
- **Line 3**: Taxable Sales
- **Line 4**: Tax Due (6.25%)
- **Line 5**: Use Tax Due
- **Line 6**: Total Amount Due.

## 2. Calculation Lineage & Audit Trail
Every prepared `SalesTaxReturn` includes an immutable `calculationLineage` JSON payload recording transaction counts, direct sales volume, marketplace deductions, use tax positions, and versioned formula IDs.
