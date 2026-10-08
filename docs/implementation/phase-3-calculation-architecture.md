# Phase 3 Architecture: Deterministic Calculation Core & Zero-Float Arithmetic

**Autonomous TaxOS Specification**  
**Workstream:** Phase 3 — Tax Calculation Architecture  
**Status:** COMPLETE & PRODUCTION VERIFIED  

---

## 1. Architectural Philosophy

Traditional tax software prototypes frequently suffer from three fatal flaws:
1. **Floating-point inaccuracies** caused by IEEE-754 arithmetic in JavaScript/Python engines.
2. **LLM hallucination** during tax liability computations.
3. **Hardcoded heuristic shortcuts** (e.g. flat percentages or assumed refunds).

TaxOS Phase 3 replaces all mock calculation logic with an immutable, deterministic, integer-cent calculation engine backed by statutory legal citations and cryptographic provenance.

---

## 2. Monetary Precision: Pure 64-Bit BigInt Cent Math

Every monetary amount in TaxOS is stored and manipulated as integer cents using JavaScript `BigInt` primitives (`bigint`):
- `$100.00` = `10000n` cents
- `$1,234.56` = `123456n` cents

### Mathematical Invariants & Rounding:
- **Basis Points (bps):** Rates are represented in integer basis points ($1\text{ bps} = 0.01\%$).
- **Half-Up Rounding:** Fractional cent results are rounded using strict half-up integer division:
  $$\text{result} = \frac{\text{cents} \times \text{rateBps} + 5000\text{n}}{10000\text{n}}$$
- **IRC § 6102 Whole-Dollar Rounding:** Fractions under 50 cents are dropped; fractions of 50 cents or more are rounded up to the nearest dollar.

---

## 3. Core Engine Components

```
src/server/services/taxCalculation/
├── types.ts                      # Strict BigInt-cent data contracts & interfaces
├── money.ts                      # BigInt cent arithmetic & progressive bracket helper
├── parameterRegistry.ts          # Centralized statutory rates, thresholds & legal citations
├── federalEngine.ts              # Deterministic Form 1040, Sch 1, Sch C, Sch SE, 8995, 8812
├── formMapping.ts                # Statutory line mapping for Form 1040 & 5 state returns
├── lineage.ts                    # Directed Acyclic Graph (DAG) for "Prove This Number"
├── validation.ts                 # Arithmetic invariants & unsupported scenario rejections
├── calculationRunService.ts      # Immutable run persistence, comparison & Tax Twin simulation
├── provider.ts                   # TaxEngineProvider abstraction & SHA-256 snapshotting
└── states/
    ├── types.ts                  # StateTaxModule interface
    ├── california.ts             # CA FTB Form 540 + Prop 63 Surtax + HSA Non-Conformity
    ├── newYork.ts                # NY DTF Form IT-201 + Progressive Brackets
    ├── newJersey.ts              # NJ Div of Taxation Form NJ-1040 + Gross Income Tax
    ├── illinois.ts               # IL DOR Form IL-1040 + 4.95% Flat Rate + Pension Subtraction
    ├── massachusetts.ts          # MA DOR Form 1 + Part B 5.0% + Fair Share Surtax
    ├── multiState.ts             # Multi-State Wage Allocation & Resident Credits
    └── index.ts                  # Module registry & factory
```

---

## 4. Cryptographic Reproducibility & Audit Trail

Every calculation run produces two SHA-256 cryptographic hashes:
1. **`inputSnapshotHash`:** SHA-256 digest of the canonical JSON serialization of the input fact snapshot.
2. **`outputHash`:** SHA-256 digest of the deterministic calculation output.

### Invariant Verification:
- Identical inputs produce bit-for-bit identical hashes across all runs.
- Any modification to inputs (e.g. estimated payments or expense deductions) immediately alters both hashes.
- Mutually exclusive settlement invariants: $\text{refundCents} > 0 \implies \text{balanceDueCents} = 0$ and vice-versa.
