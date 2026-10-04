# Autonomous Tax OS — Complete Agent Catalog

> **Status**: Approved System Specification  
> **Document Version**: 1.0.0  
> **Architecture Level**: Agent Operating System (AOS)  
> **Scope**: 128 Autonomous Agent Specifications across 8 Supervisory Domains  

---

## 1. Overview & Supervisory Hierarchy

Autonomous Tax OS does not deploy an unconstrained swarm of peer-to-peer bots. Every agent operates within a strict tree hierarchy governed by a **Top-Level Tax Case Supervisor** and **8 Domain Supervisors**:

```
                       TAX CASE SUPERVISOR
                                │
   ┌───────────┬───────────┬────┴──────┬───────────┬───────────┐
   │           │           │           │           │           │
Intake     Financial      Tax      Adversarial  Calculation Professional
Supervisor Intelligence Intelligence Supervisor / Filing    Review
           Supervisor   Supervisor              Supervisor  Supervisor
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                      Planning                    Platform
                     Supervisor                    Safety
                                                 Supervisor
```

---

## 2. Directory of Agents by Supervisory Domain

### Domain 0: Global Orchestration & Planning (Top-Level)
1. **Tax Case Supervisor**: Root coordinator of the 20-state TaxCase state machine.
2. **Task Planner**: Decomposes high-level engagement objectives into topological task DAGs.
3. **Execution Planner**: Allocates concurrent agent execution slots based on dependencies.
4. **Agent Scheduler**: Dispatches agent tasks with queue prioritization and rate limiting.
5. **Agent Permission Controller**: Enforces strict read/write/tool/PII permissions per agent.
6. **Consensus Agent**: Resolves proposals and challenges between opposing specialized agents.
7. **Conflict Resolver**: Arbitrates contradictions between data sources or legal interpretations.
8. **Retry/Recovery Agent**: Handles transient tool and provider failures with exponential backoff.
9. **Human Escalation Router**: Directs unresolved issues to Tax Inbox (client) or Review Queue (CPA/Attorney).
10. **Model Router**: Directs prompts to the most cost-effective and capable model class.
11. **Cost Optimizer**: Monitors token burn rates, enforces budget caps, and maintains prompt caches.
12. **Provider Health Agent**: Continuously probes external providers and initiates circuit breakers.
13. **Context Manager**: Prunes, compacts, and structures working context windows.
14. **Agent Memory Manager**: Manages short-term case scratchpads and vector retrieval indexing.
15. **TaxCase State Manager**: Guarantees atomic, event-sourced state mutations on the root case.
16. **Workflow Completion Validator**: Validates that all prerequisites are satisfied before state promotions.

### Domain 1: Intake & Identity Supervision
17. **Intake Supervisor**: Orchestrates ingestion, document splitting, and identity verification.
18. **Intake Agent**: Ingests files and API payloads into the secure processing queue.
19. **Identity Resolution Agent**: Discovers legal name variations and merges duplicate records.
20. **Identity Verification Agent**: Interfaces with Persona/Stripe Identity for KYC/CIP checks.
21. **Household Agent**: Resolves marital status, head-of-household eligibility, and shared domicile.
22. **Dependent Agent**: Evaluates qualifying child and relative criteria under IRC § 152.
23. **Document Router**: Classifies incoming files into tax categories (W-2, 1099, bank, invoice).
24. **Document Splitter**: Segregates multi-page scan packets into individual discrete documents.
25. **Document Extraction Agent**: Extracts structured key-value pairs and tables with bounding boxes.
26. **Document Validation Agent**: Validates checksums, EIN formats, and mathematical internal totals.
27. **Duplicate Document Agent**: Identifies identical or revised document versions using SHA-256.
28. **Prior Return Reconstruction Agent**: Parses prior-year Forms 1040/state returns for carryovers.
29. **Historical Tax Import Agent**: Normalizes multi-year tax attributes (depreciation, NOLs).
30. **Missing Document Agent**: Infers expected missing forms based on financial footprints.
31. **Document Authenticity/Fraud Agent**: Analyzes digital metadata, font anomalies, and image tampering.

### Domain 2: Financial Intelligence Supervision
32. **Financial Intelligence Supervisor**: Orchestrates banking feeds, processor ledgers, and transaction analysis.
33. **Financial Account Agent**: Tracks account balances, routing numbers, and institution types.
34. **Transaction Normalization Agent**: Cleans raw bank descriptions, removes noise, and maps MCCs.
35. **Merchant Intelligence Agent**: Enriches counterparties with industry codes and business types.
36. **Entity Resolution Agent**: Links related merchants, parent companies, and billing entities.
37. **Receipt Matching Agent**: Pairs scanned receipts and invoices with bank ledger transactions.
38. **Invoice Matching Agent**: Associates outgoing customer invoices with incoming bank deposits.
39. **Income Reconstruction Agent**: Establishes total gross revenue across all income channels.
40. **Duplicate Income Agent**: Eliminates duplicate volume between 1099-K, Stripe payouts, and bank deposits.
41. **Payment Processor Agent**: Normalizes platform fees, refunds, chargebacks, and net payouts.
42. **Expense Classification Agent**: Categorizes commercial outflows under Schedule C categories.
43. **Spend Investigator Agent**: Investigates anomalous or ambiguous outflows for business purpose.
44. **Business Purpose Agent**: Establishes ordinary and necessary justification under IRC § 162.
45. **Asset Agent**: Identifies capital asset purchases exceeding the de minimis safe harbor ($2,500).
46. **Depreciable Property Agent**: Tracks asset class lives, recovery periods, and MACRS conventions.
47. **Vehicle/Mileage Agent**: Evaluates business vs. personal mileage logs under Rev. Proc. 2024-40.
48. **Home Office Agent**: Evaluates regular and exclusive use under IRC § 280A (actual vs. simplified).
49. **Travel Agent**: Validates away-from-home overnight travel rules under IRC § 162(a)(2).
50. **Meals Agent**: Applies 50% business meal disallowance rules under IRC § 274(n).
51. **Subscription/Software Agent**: Classifies SaaS and digital tools as current operating expenses.
52. **Contractor Expense Agent**: Audits payments to independent contractors and 1099-NEC obligations.
53. **Charitable Contribution Agent**: Verifies 501(c)(3) qualified status and contemporaneous receipts (§ 170).
54. **Education Expense Agent**: Evaluates work-related education maintaining or improving skills.
55. **Insurance Agent**: Segregates business liability, professional E&O, and health insurance.
56. **Retirement Agent**: Computes SEP-IRA, Solo 401(k), and traditional IRA deduction limits.
57. **Investment Agent**: Analyzes Form 1099-B sales of securities, wash sales, and holding periods.
58. **Brokerage Reconciliation Agent**: Reconciles realized capital gains against 1099-B totals.
59. **Cost Basis Agent**: Identifies missing basis on non-covered securities and crypto transfers.
60. **Estimated Payment Agent**: Reconciles federal and state quarterly estimated payments made.
61. **Withholding Agent**: Aggregates federal, state, and local income tax withholding across all forms.
62. **Cash Flow Agent**: Analyzes seasonal cash flows to support annualized estimated tax methods.

### Domain 3: Tax Intelligence Supervision (Federal & Multi-State)
63. **Tax Intelligence Supervisor**: Orchestrates statutory research, deduction hunting, and rule resolution.
64. **Federal Tax Agent**: Orchestrates Form 1040 assembly, adjusted gross income, and tax brackets.
65. **Deduction Hunter**: Scans financial reality for overlooked above-the-line and itemized deductions.
66. **Credit Hunter**: Analyzes eligibility for non-refundable and refundable federal credits.
67. **Tax Research Agent**: Performs deep semantic and statutory search over the Tax Rule Graph.
68. **Tax Rule Resolver**: Tests factual propositions against declarative rule conditions.
69. **Tax Authority Retriever**: Pulls primary authority text (IRC, Treas. Regs, Rev. Rul.) for citations.
70. **Tax Citation Validator**: Confirms citations exist, are valid, and directly support propositions.
71. **Authority Conflict Resolver**: Analyzes conflicting federal/state or circuit court interpretations.
72. **Eligibility Agent**: Evaluates statutory qualifications for elections and deductions.
73. **Phase-Out Agent**: Computes statutory phase-out reduction percentages across AGI tiers.
74. **Carryover Agent**: Tracks capital losses, NOLs, and charitable contribution carryovers.
75. **Election Agent**: Formulates formal tax elections (IRC § 179 expensing, de minimis safe harbor).
76. **Filing Status Agent**: Determines optimal filing status (e.g., Head of Household vs. Single).
77. **Dependent Eligibility Agent**: Validates gross income and support tests under IRC § 152.
78. **Self Employment Agent**: Computes self-employment tax base and deduction under IRC § 1401/1402.
79. **Schedule C Agent**: Compiles sole proprietorship gross profit, cost of goods sold, and net income.
80. **Qualified Business Income Agent**: Computes 20% Section 199A deduction, SSTB exclusions, and wage caps.
81. **Federal-State Conformity Agent**: Computes state-specific additions and subtractions to federal AGI.
82. **Residency Agent**: Resolves statutory residency, domicile, and part-year relocation dates.
83. **Multi-State Allocation Agent**: Sources income geographically and computes resident credits.
84. **State Withholding Agent**: Allocates state tax withholdings across multiple state returns.
85. **State Credit Agent**: Discovers state-specific tax credits (property tax, renter, earned income).
86. **State Deduction Agent**: Applies state-specific deductions (e.g., tuition, retirement exclusions).
87. **Local Tax Discovery Agent**: Discovers county, city, and transit taxes (NYC, Yonkers, MCTD).
88. **California Tax Agent**: Manages FTB Form 540 and California non-conformity modifications.
89. **California Residency Agent**: Applies FTB Pub 1031 safe harbors and domicile rules.
90. **California Conformity Agent**: Enforces CA HSA disallowance and Section 179 $25,000 cap.
91. **New York Tax Agent**: Manages DTF Form IT-201 and New York taxable income compilation.
92. **New York Residency Agent**: Applies 183-day statutory residency and permanent place of abode test.
93. **New York Conformity Agent**: Enforces New York Convenience of the Employer telecommuter rules.
94. **New Jersey Tax Agent**: Manages NJ-1040 Gross Income Tax compilations.
95. **New Jersey Residency Agent**: Determines NJ resident vs. nonresident status.
96. **New Jersey Conformity Agent**: Enforces NJ category loss netting restrictions.
97. **Illinois Tax Agent**: Manages IDOR Form IL-1040 flat tax calculations.
98. **Illinois Residency Agent**: Evaluates Illinois domicile and out-of-state residency.
99. **Illinois Conformity Agent**: Computes IL Schedule M addition and subtraction modifications.
100. **Massachusetts Tax Agent**: Manages MA DOR Form 1 tiered income classifications.
101. **Massachusetts Residency Agent**: Resolves Massachusetts statutory resident rules.
102. **Massachusetts Conformity Agent**: Computes 4% Fair Share Surtax and 8.5% short-term capital gains.

### Domain 4: Verification & Adversarial Supervision
103. **Verification Supervisor**: Orchestrates internal audit stress-testing and evidence auditing.
104. **Tax Optimizer**: Simulates alternative deduction and election strategies to minimize legal tax.
105. **IRS Challenger**: Acts as an adversarial revenue agent, attempting to disallow claimed deductions.
106. **Evidence Examiner**: Validates that documentary proof satisfies heightened IRC § 274 standards.
107. **Tax Reconciliation Agent**: Reconciles general ledger balances against tax return line items.
108. **Return Reconciliation Agent**: Cross-checks federal return totals against state return inputs.
109. **Cross-Document Validator**: Flags conflicting numbers between W-2s, 1099s, and bank statements.
110. **Cross-Year Validator**: Compares prior-year and current-year lines to flag anomalous shifts.
111. **Federal-State Validator**: Confirms state starting numbers mathematically equal federal AGI.
112. **Data Quality Agent**: Detects malformed dates, truncated EINs, and character encoding bugs.
113. **Anomaly Agent**: Flags statistical outliers based on national industry expense benchmarks.
114. **Outlier Agent**: Identifies transactions that deviate from the taxpayer's historic spend velocity.
115. **Duplicate Detector**: Cross-scans all accounts and documents for identical dollar/date events.
116. **Contradiction Agent**: Identifies irreconcilable factual conflicts and freezes case promotion.
117. **Tax Position Risk Agent**: Assigns audit probability risk scores based on IRS DIF algorithms.
118. **Confidence Engine**: Synthesizes fact, evidence, and rule confidence into an aggregate score.
119. **Question Reduction Agent**: Eliminates redundant inquiries and merges overlapping questions.
120. **Minimal Question Generator**: Crafts concise, plain-English Tax Inbox cards.
121. **Hallucination Validator**: Cross-checks all generated narrative text against verified facts.
122. **Citation Validator**: Confirms authority citations match official legal publishers.
123. **Calculation Sanity Agent**: Re-executes independent calculations to verify arithmetic consistency.
124. **Independent Review Agent**: Conducts an unprimed, blind evaluation of the entire tax file.

### Domain 5: Calculation & Filing Supervision
125. **Calculation/Filing Supervisor**: Manages deterministic engine compilation and MeF transmission.
126. **Tax Engine Adapter Agent**: Translates normalized TaxCase facts into deterministic engine calls.
127. **Federal Calculation Coordinator**: Orchestrates sequential line additions across 1040 schedules.
128. **State Calculation Coordinator**: Dispatches calculations across active sovereign state modules.
129. **Form Mapping Agent**: Maps calculation node outputs to IRS and state tax form line fields.
130. **Filing Payload Agent**: Compiles tax forms into validated MeF XML schemas.
131. **Signature/Authorization Agent**: Orchestrates Form 8879 taxpayer and ERO signature capture.
132. **Consent Agent**: Captures and archives Treasury Reg § 301.7216-3 disclosure consents.
133. **Submission Agent**: Transmits cryptographically signed SOAP packages to IRS/State MeF servers.
134. **Filing Status Agent**: Polls MeF acknowledgement queues and updates case states.
135. **Rejection Resolution Agent**: Translates IRS reject codes into actionable remediation steps.
136. **Amendment Agent**: Formulates Form 1040-X amended returns for post-filing adjustments.
137. **Refund Tracking Agent**: Monitors IRS "Where's My Refund" API and direct deposit timelines.
138. **Payment Coordination Agent**: Schedules electronic funds withdrawal (EFW) for tax liabilities.

### Domain 6: Professional Review Supervision
139. **Professional Review Supervisor**: Manages review queues, workload routing, and signoffs.
140. **Professional Matching Agent**: Matches cases to credentialed EAs/CPAs based on state licenses.
141. **EA Review Agent**: Provides Enrolled Agent workpaper review workspace.
142. **CPA Review Agent**: Provides CPA audit review workspace with signoff controls.
143. **Paid Preparer Review Agent**: Manages PTIN signature verification and diligence requirements.
144. **Tax Attorney Escalation Agent**: Provisions privileged legal workspace for Mode 4 controversy.
145. **Professional Review Brief Agent**: Generates the executive AI Review Brief workpapers.
146. **Professional QA Agent**: Verifies that human reviewer overrides include statutory rationales.
147. **Second Reviewer Agent**: Routes high-risk positions to a secondary partner for dual signoff.
148. **Workload Routing Agent**: Balances review capacity across the on-demand professional network.
149. **Professional Communication Agent**: Manages secure messaging between reviewer and client.

### Domain 7: Year-Round Intelligence Supervision
150. **Planning Supervisor**: Orchestrates continuous monitoring, scenarios, and quarterly compliance.
151. **Tax Planning Agent**: Identifies proactive tax reduction strategies for upcoming quarters.
152. **Tax Twin**: Maintains a live, simulated digital twin of the taxpayer's tax liability.
153. **Scenario Agent**: Simulates the tax impact of major financial decisions (equipment, entity change).
154. **Tax Impact Agent**: Calculates marginal tax rates on incremental revenue or expenses.
155. **Estimated Tax Agent**: Calculates quarterly estimated tax obligations under IRC § 6654.
156. **Quarterly Payment Agent**: Reminds and schedules payments for April, June, Sept, and Jan deadlines.
157. **Income Projection Agent**: Projects full-year taxable earnings using seasonal run-rate algorithms.
158. **Year-End Planning Agent**: Formulates December 31 harvesting, expensing, and retirement strategies.
159. **Life Event Agent**: Re-evaluates tax profile following marriage, relocation, or child birth.
160. **Tax Opportunity Monitor**: Continuously scans for newly enacted federal and state tax credits.
161. **Tax Deadline Agent**: Tracks statutory filing and extension deadlines with IRC § 7503 rollovers.
162. **Tax Notice Agent**: Ingests and OCR-analyzes IRS notices (CP2000, CP504, math error notices).
163. **Notice Deadline Agent**: Computes strict response statutory deadlines for tax notices.
164. **Notice Response Preparation Agent**: Drafts formal legal and factual response letters to IRS examiners.

### Domain 8: Platform Safety & Knowledge Governance
165. **Platform Safety Supervisor**: Enforces security, rule updating, and system integrity.
166. **Tax Authority Ingestion Agent**: Ingests new statutes, regulations, and forms from official sources.
167. **Tax Law Watcher**: Monitors federal and state legislative dockets for tax law changes.
168. **Tax Rule Normalizer**: Converts statutory text into machine-readable JSON-Logic rules.
169. **Tax Rule Versioning Agent**: Archives superseded rules and mints new immutable rule versions.
170. **Rule Sunset Agent**: Enforces statutory sunset provisions (e.g., expiring tax provisions).
171. **Federal Conformity Monitor**: Tracks state legislative sessions for rolling conformity updates.
172. **State Conformity Monitor**: Detects state decoupling from federal tax code amendments.
173. **Authority Change Detector**: Diffs new administrative guidance against current rule graph nodes.
174. **Rule Impact Analyzer**: Identifies cases affected by mid-year retroactive tax law changes.
175. **Tax Regression Agent**: Executes synthetic test suites against updated tax rule versions.
176. **Rule QA Agent**: Validates that all active rules carry valid primary authority citations.
177. **Fraud Detection Agent**: Analyzes return profiles for identity theft and refund fraud patterns.
178. **Account Takeover Detection Agent**: Monitors suspicious IP shifts, MFA bypasses, and session anomalies.
179. **PII Leakage Agent**: Scans outgoing agent responses and tool inputs for unmasked PII.
180. **Privacy Agent**: Enforces GDPR, CCPA, and state data privacy deletion requests.
181. **Consent Enforcement Agent**: Verifies active IRC § 7216 consent before cross-domain processing.
182. **Data Retention Agent**: Manages statutory 7-year document archives and cryptographic destruction.
183. **Access Review Agent**: Audits practitioner permissions and enforces least-privilege policies.
184. **Security Review Agent**: Conducts real-time threat modeling over agent tool invocations.
185. **Incident Triage Agent**: Initiates automated circuit breakers during detected security events.
186. **Abuse Detection Agent**: Detects automated scraping or denial-of-service attempts.
187. **Customer Support Router**: Routes taxpayer inquiries to technical, billing, or tax queues.
188. **Technical Support Agent**: Diagnoses document upload failures and browser connectivity issues.
189. **Tax Support Router**: Escalates tax law inquiries to licensed professionals (never answers legal advice directly).
190. **Billing Support Agent**: Manages subscription upgrades, invoice receipts, and refund credits.
191. **Case Operations Agent**: Monitors stuck cases and initiates automated recovery workflows.
192. **SLA Agent**: Flags cases approaching turnaround time thresholds for review or filing.
193. **Escalation Agent**: Handles urgent taxpayer complaints or impending statutory deadlines.
194. **Quality Assurance Agent**: Audits random samples of completed returns for procedural compliance.
195. **Case Assignment Agent**: Automatically assigns cases to reviewers based on state licensing and workload.
196. **Release Safety Agent**: Manages canary deployments and feature flag rollouts.
197. **Migration Safety Agent**: Validates schema migrations against live database replicas.
198. **Production Readiness Agent**: Executes pre-flight verification checks before production deployments.
199. **Feature Flag Agent**: Dynamically toggles experimental agent capabilities and state modules.
200. **Observability Agent**: Aggregates distributed OpenTelemetry spans across agent executions.
201. **Agent Performance Agent**: Profiles execution latencies and identifies workflow bottlenecks.
202. **Agent Cost Agent**: Tracks token expenditures and flags anomalous prompt token usage.
203. **Provider Failure Agent**: Manages fallback strategies when third-party APIs fail.
204. **Evaluation Judge**: Evaluates agent outputs against gold-standard tax answer keys.
205. **Regression Judge**: Compares calculation and extraction deltas across software releases.
206. **Synthetic Test Generator**: Generates realistic, unprimed synthetic tax cases for regression suites.
207. **Accessibility QA Agent**: Audits frontend UI components for WCAG 2.2 AA compliance.
208. **UI Regression Agent**: Validates visual snapshots across desktop and mobile viewports.
209. **API Contract Agent**: Verifies that partner endpoints adhere to OpenAPI 3.1 specifications.
