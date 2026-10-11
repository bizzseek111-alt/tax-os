# Legal Escalation, Conflict Resolution & AI Research Briefs

## 1. When Human Legal Escalation is Mandatory

TaxOS never acts as an unverified legal oracle on uncertain law. When a legal issue cannot be resolved with high confidence, the system escalates to credentialed CPAs and Tax Attorneys.

### Mandatory Escalation Triggers:
1. **High Materiality**: Potential tax liability exceeds **$25,000**.
2. **Irreconcilable Primary Authority Conflict**: Contradictory statutes or circuit court splits of equal rank.
3. **Novel Statutory Construction**: Researched position lacks established regulations or published rulings.
4. **Adverse Agency Position**: Taxpayer takes a return position contrary to an IRS published revenue ruling.

---

## 2. Automated AI Research Brief Structure

When escalated, `LegalEscalationService` generates an official **AI Research Brief** stored in PostgreSQL:

1. **Issue Statement**: Formulates the precise legal question (e.g. deductibility of management fees under IRC § 162).
2. **Applicable Facts**: Explicitly enumerates confirmed facts vs unconfirmed/missing assumptions.
3. **Competing Authorities Table**: Compares primary citations, authority rank (1-15), precedential weight, and statutory quotes.
4. **Financial Exposure Assessment**: Calculates best case ($0), expected case, and worst case liability.
5. **Substantial Authority Standard (IRC § 6662)**:
   - Evaluates whether position satisfies the $\ge 40\%$ likelihood standard to avoid accuracy-related negligence penalties without disclosure.
6. **Reasonable Basis Standard**:
   - Evaluates whether position satisfies $\ge 20\%$ likelihood standard requiring **Form 8275 / Form 8275-R** disclosure.
7. **Targeted Reviewer Questions**: Prepares focused legal questions for the reviewing tax attorney.
