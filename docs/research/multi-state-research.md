# Multi-State Tax Research & Cross-Border Coordination

## 1. Multi-Jurisdictional Complexity

State personal and business taxation is heavily fragmented. When a taxpayer operates or resides across state borders, state tax systems frequently conflict.

The `MultiStateCoordinator` resolves these cross-border tensions at Level 4 research latency.

---

## 2. Core Cross-Border Scenarios Handled

### 1. New York "Convenience of the Employer" vs New Jersey Resident Credit
- **New York Rule (20 NYCRR § 132.18(a)):** Out-of-state remote work for an employer whose office is in New York is treated as NY-source wages, unless the out-of-state home office meets the rigorous "bona fide employer office necessity" test.
- **New Jersey Rule (N.J.S.A. § 54A:4-1):** New Jersey residents are entitled to a resident credit (Schedule NJ-COJ) for income tax paid to New York on income sourced therein.
- **TaxOS Coordination:** Generates both NY nonresident Form IT-203 and NJ resident Form NJ-1040, allocating wages to prevent double taxation and alerting the CPA if wage withholding was misallocated.

### 2. Statutory Residency vs Domicile (183-Day Rule)
- Taxpayers maintaining a permanent place of abode in a state and spending $> 183$ days therein are treated as statutory residents, even if domiciled elsewhere.
- TaxOS tracks presence day counts across states, alerting to dual-residency audit exposure.

### 3. State Decoupling from Federal IRC Provisions
- **California:** Disallows IRC § 199A QBI deduction; disallows IRC § 168(k) bonus depreciation (Cal. RTC § 17072).
- **New York:** Disallows IRC § 199A QBI deduction; imposes separate NYC resident tax.
- **New Jersey:** Zero cross-category loss offsetting (N.J.S.A. § 54A:5-1).
- **Illinois:** 100% subtraction for qualified retirement and pension distributions (35 ILCS 5/203).
- **Massachusetts:** 4% Fair Share Surtax on taxable income $> \$1,000,000$ (MGL c. 62 § 4).
