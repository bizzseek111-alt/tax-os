# Phase 3 Form Mapping & Lineage DAG ("Prove This Number")

**Autonomous TaxOS Specification**  
**Workstream:** Phase 3 — Form Line Mapping & Lineage Graph  
**Status:** COMPLETE & VERIFIED  

---

## 1. Statutory Form Mapping Service

The `FormMappingService` bridges internal calculation variables to statutory IRS and State return lines:

### Form Line Coverage Matrix:
- **IRS Form 1040:** Lines 1z, 2b, 3b, 9, 10, 11, 12, 13, 15, 16, 19, 22, 23, 24, 25d, 26, 28, 33, 34, 37
- **Schedule 1:** Lines 3, 15, 26
- **Schedule C:** Lines 1, 7, 28, 31
- **Schedule SE:** Lines 4c, 5a, 6, 12
- **Form 8995:** Line 15 (QBI Deduction)
- **Schedule 8812:** Line 27 (Additional Child Tax Credit)
- **CA Form 540:** Lines 13, 14, 15, 17, 18, 19, 31, 32, 48, 71, 72, 78, 99, 104
- **NY Form IT-201:** Lines 19, 23, 32, 33, 34, 37, 39, 41, 46, 72, 75, 76, 77, 80
- **NJ Form NJ-1040:** Lines 15, 18, 29, 30, 39, 41, 43, 46, 54, 55, 57, 58, 61
- **IL Form IL-1040:** Lines 1, 2, 5, 9, 10, 11, 12, 15, 24, 25, 26, 32, 36, 39
- **MA Form 1:** Lines 10, 11, 15, 17, 18, 19, 20, 28b, 32, 39, 44, 45, 46, 50, 51, 54

---

## 2. Lineage Directed Acyclic Graph (DAG)

Whenever a number is calculated, a `CalculationLineageNode` is attached to the calculation run.

```typescript
export interface CalculationLineageNode {
  field: string;
  valueCents: bigint;
  formulaDescription: string;
  ruleParameters: Record<string, any>;
  statutoryAuthority: string;
  formLineRef: string;
  sourceFactIds: string[];
}
```

### "Prove This Number" Drawer Flow:
1. User clicks any figure in the UI (e.g. AGI: **\$97,581.98** or Taxable Income: **\$65,465.58**).
2. UI issues `GET /api/taxcase/:id/calculation/lineage/:field`.
3. Server resolves the exact calculation node, rule parameters, formula breakdown, statutory code section (e.g. IRC § 62, IRC § 162), and links back to the source W-2 / 1099 extraction facts.
4. CPA review briefs receive full mathematical traceability with zero AI hallucination.
