# Authority Hierarchy, Weighting & Conflict Resolution

## 1. Statutory Authority Hierarchy (Ranks 1 to 15)

In United States tax jurisprudence, legal authority is strictly hierarchical. TaxOS implements this hierarchy through the `AuthorityHierarchyEngine`:

| Rank | Authority Type | Binding / Precedential Status | Weight |
| :---: | :--- | :--- | :---: |
| **1** | U.S. Constitution / Federal Statutes (IRC) / State Constitutions / Enacted State Tax Statutes | BINDING on all courts and agencies | **1.00** |
| **2** | Treasury Regulations (26 CFR) / State Administrative Regulations | BINDING unless held invalid by court | **0.95** |
| **3** | Judicial Precedents (SCOTUS, Circuit Courts, Tax Court Regular) | BINDING within jurisdiction | **0.90** |
| **4** | Published Revenue Rulings, State Official Legal Rulings | BINDING on revenue agency, persuasive | **0.80** |
| **5** | Revenue Procedures | PROCEDURAL & BINDING on agency | **0.70** |
| **6** | IRS Notices & Formal Announcements | SUB-REGULATORY — cannot contradict statute | **0.60** |
| **7** | State Technical Memoranda (TSB-M, TIR) | ADMINISTRATIVE GUIDANCE | **0.50** |
| **8** | Internal Revenue Manual (IRM) | INTERNAL PROCEDURES ONLY | **0.45** |
| **9** | Official Tax Forms & Return Schedules | OPERATIONAL IMPLEMENTATION | **0.30** |
| **10** | Official Form Instructions | PERSUASIVE on agency intent, NOT binding law | **0.25** |
| **11** | Administrative Guidance & Fact Sheets | INFORMATIONAL | **0.20** |
| **12** | E-File Business Rules | TECHNICAL VALIDATION | **0.18** |
| **13** | Agency Publications (Pub 15, Pub 17, Pub 535) | INFORMATIONAL — taxpayer cannot rely against statute | **0.15** |
| **14** | Agency FAQs | NON-BINDING — subject to change without notice | **0.10** |
| **15** | Commercial SEO Articles, Blogs, Marketing Sites | STRICTLY PROHIBITED — REJECTED | **0.00** |

---

## 2. Fundamental Invariants

1. **Sub-Regulatory Conflict Invariant:**
   - An IRS Publication, FAQ, or Form Instruction **NEVER overrides an enacted statute or Treasury regulation**.
   - Example: If an IRS FAQ contradicts IRC § 162 or Treas. Reg. § 1.162-1, the statute/regulation wins decisively.

2. **Superseded Law Invariant:**
   - A statute, regulation, or ruling marked `SUPERSEDED` receives weight **0.00** regardless of its original authority rank.

3. **State Decoupling Invariant:**
   - When a state statute decouples from an Internal Revenue Code provision (e.g. California RTC § 17072 disallowing IRC § 199A), the **state statute governs for all state tax calculations**.
