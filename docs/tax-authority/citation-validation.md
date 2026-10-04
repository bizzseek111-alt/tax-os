# Autonomous Tax OS — Tax Citation Verification Architecture

> **Status**: Approved Tax Technology Specification  
> **Document Version**: 1.0.0  
> **Engine**: `CitationValidator`  
> **Core Mandate**: 0.00% Fabricated Citations — Every Legal Citation Must Be Grounded and Verifiable  

---

## 1. The Six-Point Citation Validation Algorithm

To prevent LLM hallucination and ensure audit defensibility, every authority citation emitted by an agent or bound to a tax position must pass the **Six-Point Citation Validation Algorithm**:

```mermaid
flowchart TD
    Citation["Incoming Legal Citation<br/>(e.g., 'IRC § 162(a); Treas. Reg. § 1.162-1')"]
    
    C1{1. Authority Exists in Official Corpus?}
    C2{2. Matches Exact Tax Year?}
    C3{3. Matches Target Jurisdiction?}
    C4{4. Is Authority Active (Not Superseded)?}
    C5{5. Is Precedential Status Binding?}
    C6{6. Does Text Directly Support Proposition?}

    Citation --> C1
    C1 -->|Yes| C2
    C1 -->|No| Fail1["REJECT: Hallucinated / Non-Existent Citation"]
    
    C2 -->|Yes| C3
    C2 -->|No| Fail2["REJECT: Wrong-Year Authority"]
    
    C3 -->|Yes| C4
    C3 -->|No| Fail3["REJECT: Wrong Jurisdiction Authority"]
    
    C4 -->|Yes| C5
    C4 -->|No| Fail4["REJECT: Superseded Guidance"]
    
    C5 -->|Yes: Binding| C6
    C5 -->|No: Non-Precedential| Warn5["FLAG: Non-Precedential (Cannot be sole basis)"]
    
    C6 -->|Yes| Pass["VERIFIED: 100% Valid Legal Citation"]
    C6 -->|No| Fail6["REJECT: Text Does Not Support Proposition"]
```

---

## 2. Validation Checks in Detail

1. **Existence Verification**: Queries the indexed primary corpus (Title 26 USC, 26 CFR, State Revenue Codes). If the section number does not exist (e.g., hallucinated "IRC § 280Z"), it is instantly rejected.
2. **Tax Year Verification**: Validates that the cited authority was legally in effect during the active tax year of the `TaxCase`. Expired temporary provisions (e.g., 100% restaurant meal deductions under the 2021-2022 COVID relief acts) cannot be cited for 2026.
3. **Jurisdictional Boundary Verification**: Verifies that state positions cite sovereign state codes (e.g., Cal. Rev. & Tax. Code § 17201), not federal statutes unless the state incorporates the federal section by explicit rolling conformity.
4. **Active Status Verification**: Verifies that the cited Revenue Procedure or Notice has not been revoked or superseded by subsequent agency actions.
5. **Precedential Status Verification**: Ensures IRS Private Letter Rulings (PLRs) or Tax Court Summary Opinions (which are statutorily non-precedential under IRC § 6110(k)(3)) are not cited as binding authority on an IRS return.
6. **Substantive Entailment**: Verifies via semantic cross-entropy scoring that the retrieved statutory text logically entails the factual deduction claimed.
