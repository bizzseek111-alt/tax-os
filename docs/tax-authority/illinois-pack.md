# Autonomous Tax OS — Illinois Tax Knowledge Package (IDOR)

> **Status**: Approved Tax Technology Specification  
> **Jurisdiction**: Illinois (`US-IL`)  
> **Tax Authority**: Illinois Department of Revenue (IDOR)  
> **Target Forms**: Form IL-1040 (Individual Income Tax Return), Schedule M (Additions & Subtractions), Schedule CR (Credit for Tax Paid to Other States), Schedule ICR (Illinois Credits)  

---

## 1. Statutory Foundations & Code Index

The Illinois Tax Package codifies the Illinois Income Tax Act (IITA, 35 ILCS 5) and IDOR Administrative Regulations:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPIC                    ILLINOIS STATUTE       ADMINISTRATIVE RULE    │
├────────────────────────────────────────────────────────────────────────┤
│ Flat Individual Rate     35 ILCS 5/201(b)       4.95% on Net Income    │
│ Base Income Starting Pt  35 ILCS 5/203(a)       Federal AGI Baseline   │
│ Schedule M Additions     35 ILCS 5/203(a)(2)    Out-of-state munis, K-1│
│ Retirement Subtractions  35 ILCS 5/203(a)(2)(F) 100% Pension Exemption │
│ Property Tax Credit 5%   35 ILCS 5/208          Schedule ICR           │
│ Credit for Other States  35 ILCS 5/601(b)(3)    Schedule CR            │
│ Pass-Through Entity Tax  35 ILCS 5/201(p)       IL PTE Credit          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Illinois Statutory Mechanics

### 2.1 The Flat Tax Rate & Federal AGI Starting Point
Illinois imposes a constitutional **flat tax rate of 4.95%** on the net income of individuals, trusts, and estates. The calculation begins with federal Adjusted Gross Income from Form 1040 Line 11:

$$\text{Illinois Base Income} = \text{Federal AGI} + \text{Schedule M Additions} - \text{Schedule M Subtractions}$$

$$\text{Illinois Net Income} = \text{Illinois Base Income} - \text{Standard Personal Exemption}$$

### 2.2 Schedule M Statutory Modifications
* **100% Retirement & Pension Subtraction (35 ILCS 5/203(a)(2)(F))**: Unlike federal law, Illinois does not tax federally taxable retirement income. All qualified pensions, Social Security benefits, 401(k) distributions, and Traditional IRA withdrawals are subtracted 100% from base income.
* **Out-of-State Municipal Bond Interest Addition**: Interest earned from municipal obligations of other states (e.g., California or New York municipal bonds) is added back to Illinois base income.
* **Pass-Through Entity (PTE) Tax Credit**: For owners of S-corporations or partnerships electing the Illinois elective pass-through entity tax under 35 ILCS 5/201(p), Illinois provides a refundable credit on Schedule K-1-P equal to 4.95% of the owner’s distributive share.

### 2.3 Schedule ICR Illinois Tax Credits
* **Property Tax Credit (35 ILCS 5/208)**: A credit equal to **5% of the real estate taxes paid** on the taxpayer's principal Illinois residence during the tax year, provided federal AGI is below statutory thresholds ($250,000 Single / $500,000 MFJ).
* **K-12 Education Expense Credit**: 25% of qualified educational tuition and lab fees in excess of $250 paid for dependent children attending private or religious schools in Illinois.
