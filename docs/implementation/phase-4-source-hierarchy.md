# Phase 4 — Statutory Authority Hierarchy & Precedence Rules

## 1. 15-Tier Statutory Authority Hierarchy

The TaxOS Tax Authority Engine defines a strict legal hierarchy based on standard American tax jurisprudence (Internal Revenue Code, Administrative Procedure Act, and state revenue statutes):

| Tier | Authority Type | Description | Legal Precedence | Base Weight |
| :---: | :--- | :--- | :--- | :---: |
| **1** | `STATUTE` | Internal Revenue Code (26 U.S.C.), California RTC, NY Tax Law, N.J.S.A., ILCS, M.G.L. | Supreme law; binding on all courts and agencies | 1.000 |
| **2** | `REGULATION` | Treasury Regulations (26 CFR), California Code of Regulations (18 CCR), NYCRR, NJAC, etc. | Force of law if within statutory grant | 0.933 |
| **3** | `COURT_DECISION` | Supreme Court, Federal Circuit Courts, U.S. Tax Court (TC Opinions) | Judicial precedent within relevant circuit | 0.867 |
| **4** | `REVENUE_RULING` | IRS Published Revenue Rulings | Official IRS interpretation; binding on IRS | 0.800 |
| **5** | `REVENUE_PROCEDURE`| IRS Published Revenue Procedures (annual inflation adjustments) | Official procedural rules and inflation brackets | 0.733 |
| **6** | `NOTICE` | IRS Official Notices | Substantive guidance with precedential intent | 0.667 |
| **7** | `LEGAL_RULING` | State Agency Legal Rulings (e.g. CA FTB Legal Rulings) | State departmental formal legal positions | 0.600 |
| **8** | `TECHNICAL_MEMO` | State Technical Services Bulletins (NY TSB-M, MA TIR) | Official agency interpretation of legislation | 0.533 |
| **9** | `FORM` | Official IRS & State Tax Forms (Form 1040, CA 540, IT-201) | Regulatory filing return instrument | 0.467 |
| **10** | `FORM_INSTRUCTION` | Official Form Instructions published by taxing authorities | Administrative guidance; non-binding on courts | 0.400 |
| **11** | `ADMIN_GUIDANCE` | News Releases, Fact Sheets, Information Letters | Informational agency announcements | 0.333 |
| **12** | `EFILE_RULE` | MeF Schemas & State Electronic Filing Business Rules | Technical constraints and reject codes | 0.267 |
| **13** | `PUBLICATION` | IRS Official Publications (Pub 17, Pub 334, Pub 535) | General taxpayer guidance; cannot counter statute | 0.200 |
| **14** | `FAQ` | Agency Website Frequently Asked Questions | Non-precedential; government may change position | 0.133 |
| **15** | `SECONDARY_COMMENT`| Tax treatises, law reviews, firm memos | Persuasive commentary only; zero legal force | 0.067 |

## 2. Precedential Multipliers

In addition to base tier ranking, every source chunk carries a `PrecedentialStatus`:

$$\text{AuthorityWeight} = \frac{16 - \text{Rank}}{15} \times \text{StatusMultiplier}$$

| Status | Multiplier | Rationale |
| :--- | :---: | :--- |
| `BINDING` | **1.00** | Active, binding statutory or regulatory law. |
| `ADMINISTRATIVE` | **0.85** | Official guidance binding on agency staff but not judicial tribunals. |
| `PERSUASIVE` | **0.70** | Decisions from outside the taxpayer's jurisdiction. |
| `PROPOSED` | **0.40** | Proposed regulations published in Federal Register pending finalization. |
| `HISTORICAL` | **0.20** | Expired historical provisions retained exclusively for prior-year audits. |
| `SUPERSEDED` | **0.00** | Repealed, amended, or obsoleted law; strictly excluded from calculation. |

## 3. Conflict Resolution Standards

### A. The Supremacy Rule
An enacted statute (Rank 1) ALWAYS supersedes an agency regulation (Rank 2), revenue ruling (Rank 4), form instruction (Rank 10), or FAQ (Rank 14). Where an IRS FAQ or Form Instruction contradicts the Internal Revenue Code, the statute controls.

### B. The Loper Bright Standard
Following the Supreme Court's decision in *Loper Bright Enterprises v. Raimondo* (2024), courts no longer defer to agency interpretations under *Chevron*. Regulatory and sub-regulatory guidance must remain strictly faithful to unambiguous statutory text.

### C. Circuit Splits & Ambiguity Escalation
Where two authorities of identical tier conflict (e.g., 5th Circuit vs. 9th Circuit regarding economic substance or capitalization rules), TaxOS will NOT guess or hallucinate a resolution. The system flags the position as `REQUIRES_REVIEW` and routes it to a credentialed human CPA or Tax Attorney.
