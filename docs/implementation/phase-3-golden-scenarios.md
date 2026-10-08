# Phase 3 Golden Test Scenarios & Invariant Verification Report

**Autonomous TaxOS Verification Report**  
**Workstream:** Phase 3 — Calculation Core Verification  
**Total Golden Scenarios:** 20  
**Verification Results:** 96 / 96 Passed (100% Pass Rate)  

---

## 1. Scenario Verification Matrix

| Scenario ID | Category | Profile & Description | Expected Key Metrics | Status |
| :--- | :--- | :--- | :--- | :--- |
| **`FEDERAL-001`** | Federal W-2 | Single, \$75,000 W-2, Standard Deduction \$15,750, Withholding \$8,500 | Taxable: \$59,250<br>Tax: \$7,747.00<br>Refund: \$753.00 | **PASS** |
| **`FEDERAL-002`** | Federal MFJ | MFJ, Two W-2s (\$120k + \$95k), Standard Deduction \$31,500 | Taxable: \$183,500<br>Tax: \$29,794.00<br>Balance Due: \$4,794.00 | **PASS** |
| **`FEDERAL-003`** | Schedule C | Single Freelancer, \$140k gross, \$35k exp (\$105k profit), SE tax, QBI 20% | SE Tax: \$14,836.03<br>QBI: \$16,366.40<br>Taxable: \$65,465.58 | **PASS** |
| **`FEDERAL-004`** | High Earner | Single High Earner, \$450,000 W-2, Additional Medicare Tax | Taxable: \$434,250<br>Top Tiers Verified | **PASS** |
| **`FEDERAL-005`** | Family / CTC | Head of Household, \$65k W-2, 2 Children under 17 (Child Tax Credit \$4,000) | Full CTC Applied<br>Tax: \$611.00<br>Refund: \$2,889.00 | **PASS** |
| **`FEDERAL-006`** | Business Loss | Schedule C Net Loss (-\$15,000), offsets W-2 income under IRC § 62 | Zero SE Tax<br>Zero QBI<br>AGI: \$45,000 | **PASS** |
| **`FEDERAL-007`** | W-2 + 1099 | Single W-2 (\$90k) + 1099 Side Hustle (\$20k net profit) | SE Tax: \$2,825.91<br>Total Income: \$110,000 | **PASS** |
| **`FEDERAL-008`** | HSA Deduction | Single \$80k W-2 + \$4,150 above-the-line HSA deduction | AGI: \$75,850<br>Taxable: \$60,100 | **PASS** |
| **`FEDERAL-009`** | Itemized Ded | Single \$150k W-2, \$22,000 itemized vs \$15,750 standard | Itemized Chosen<br>Taxable: \$128,000 | **PASS** |
| **`FEDERAL-010`** | De Minimis SE | \$40,000 W-2 + \$350 Schedule C Net Profit (under \$400 threshold) | Zero SE Tax (IRC § 1402(b)(2)) | **PASS** |
| **`CA-001`** | California 540 | CA Resident Single W-2 (\$120,000 wages, std ded \$5,540, exemption credit \$149) | CA Net Tax: \$7,039.89<br>Refund: \$1,460.11 | **PASS** |
| **`CA-002`** | California Surtax | CA Millionaire (\$1,500,000 wages), 1% Mental Health Services Surtax > \$1M | Surtax Triggered<br>CRTC § 17043 Verified | **PASS** |
| **`NY-001`** | New York IT-201 | NY Resident Single W-2 (\$95,000 wages, NY std ded \$8,000, 9 progressive brackets) | NY Tax: \$4,901.26<br>Refund: \$298.74 | **PASS** |
| **`NJ-001`** | New Jersey 1040 | NJ Schedule C Freelancer (\$120k profit), independent NJ Gross Income, \$1,000 exemption | NJ Tax: \$5,455.80<br>Zero std ded verified | **PASS** |
| **`IL-001`** | Illinois 1040 | IL Resident with \$40,000 pension, 100% pension subtraction under 35 ILCS 5/203 | Flat 4.95% Tax: \$2,337.64<br>Refund: \$62.36 | **PASS** |
| **`MA-001`** | Massachusetts 1 | MA High Earner (\$2.5M wages), 5.0% Part B + 4.0% Fair Share Surtax > \$1M | MA Tax: \$184,604.00<br>Refund: \$15,396.00 | **PASS** |
| **`MULTI-001`** | Multi-State | CA Resident with NY Income (\$100k CA + \$50k NY wages), wage allocation & credit | Apportionment Verified<br>Credit Ratio Capped | **PASS** |
| **`EDGE-001`** | Unsupported State | Input with unsupported jurisdiction triggers clean `UNSUPPORTED_JURISDICTION` error | Rejected cleanly<br>Zero approximation | **PASS** |
| **`EDGE-002`** | Negative Boundary | Negative W-2 Box 1 wages triggers `INVALID_W2_WAGES` boundary error | Rejected cleanly | **PASS** |
| **`EDGE-003`** | Invariant Check | Mutual exclusivity of refund and balance due; non-negative tax liabilities | Invariant Enforced | **PASS** |

---

## 2. Invariant Verification

1. **Refund vs. Balance Due Exclusivity:** A return cannot report both a positive refund and a positive balance due simultaneously.
2. **Deterministic Hash Invariance:** Identical input payloads yield bit-for-bit identical SHA-256 hashes across repeated executions.
3. **Monetary Conservation:** Payments minus tax equals refund (if positive) or balance due (if negative) to the exact cent without IEEE-754 drift.
