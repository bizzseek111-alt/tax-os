# Autonomous Tax OS — Phase 8: Multi-State Payroll Tax Engines

## 1. Overview
Autonomous Tax OS launches with full deterministic payroll support across **Federal** and **five foundational commercial states**:
1. **California (`US-CA`)**
2. **New York (`US-NY`)**
3. **New Jersey (`US-NJ`)**
4. **Illinois (`US-IL`)**
5. **Massachusetts (`US-MA`)**

---

## 2. Jurisdiction Specifications

### California (`US-CA`)
- **Authority**: California Employment Development Department (EDD).
- **Personal Income Tax (PIT)**: Form DE 4 Method B exact calculation. Progressive brackets (1.1% to 12.3%, plus 1% Mental Health Services tax on income $> \$1\text{M}$).
- **State Disability Insurance (SDI)**: **1.20%** employee-paid rate. **No wage ceiling** (SB 951 repealed the taxable wage limit).
- **State Unemployment Insurance (SUI)**: Wage base cap of **$7,000**. Tax calculated via employer experience rate (e.g., 3.4%).
- **Employment Training Tax (ETT)**: **0.10%** employer-paid up to $7,000 cap.

### New York (`US-NY`)
- **Authority**: New York State Department of Taxation and Finance (DTF).
- **NYS PIT**: NYS-50-T exact calculation method with Single/MFJ progressive tax brackets (4.0% to 10.9%).
- **New York City (NYC) Resident Tax**: Exact local resident PIT withholding tables for employees residing in the five NYC boroughs.
- **Paid Family Leave (NY PFL)**: **0.373%** employee contribution up to statutory statewide cap.
- **State Unemployment (SUI)**: Wage base cap of **$13,000** for 2026.

### New Jersey (`US-NJ`)
- **Authority**: New Jersey Division of Taxation & Department of Labor and Workforce Development.
- **NJ PIT**: NJ-WT Table A exact calculation. Progressive brackets from 1.4% to 10.75%.
- **Employee SUI**: **0.3825%** withheld from employees on wages up to the NJ SUI cap ($44,500).
- **Family Leave Insurance (FLI)**: **0.09%** employee contribution up to $44,500.
- **Employer SUI**: Experience rate applied up to $44,500.

### Illinois (`US-IL`)
- **Authority**: Illinois Department of Revenue (IDOR).
- **PIT Rate**: Exact flat rate of **4.95%** (IL-700-T).
- **Allowances**: Standard annual basic allowance of $\$2,775$ per allowance ($P$-annualized subtraction).
- **State Unemployment (SUI)**: Wage base cap of **$13,590** for 2026.

### Massachusetts (`US-MA`)
- **Authority**: Massachusetts Department of Revenue (DOR).
- **PIT Rate**: Exact flat rate of **5.00%** (Circular M) minus personal exemptions ($\$4,400$ Single / $\$8,800$ Married).
- **Paid Family and Medical Leave (PFML)**:
  - Employee Share: **0.46%**
  - Employer Share: **0.42%**
  - Wage base tied to Social Security OASDI cap ($176,100).
- **State Unemployment (SUI)**: Wage base cap of **$15,000** for 2026.

---

## 3. Summary SUI Wage Caps Across Launch States

| State | Statutory SUI Cap (2026) | Employee SUI Rate | Additional State Taxes |
| :--- | :---: | :---: | :---: |
| **Federal** | $7,000 (FUTA) | 0.00% | FUTA Net 0.6% |
| **California** | $7,000 | 0.00% | CA SDI 1.2% (uncapped), ETT 0.1% |
| **New York** | $13,000 | 0.00% | NY PFL 0.373%, NYC Local Resident PIT |
| **New Jersey** | $44,500 | **0.3825%** | NJ FLI 0.09% |
| **Illinois** | $13,590 | 0.00% | None |
| **Massachusetts** | $15,000 | 0.00% | MA PFML (0.46% EE / 0.42% ER) |
