# Phase 7 — Composite Rates & Address Jurisdiction Resolution

## 1. Multi-Tier Jurisdiction Hierarchy
ZIP codes in the United States do **not** uniquely identify tax jurisdictions. A single 5-digit ZIP code can span multiple counties, incorporated cities, and unincorporated special taxing districts (e.g., transit districts, fire protection districts, library authorities).

TaxOS resolves tax boundaries hierarchically:
```
[ State Jurisdiction ] (e.g. California State Base 6.00%)
       │
       ▼
[ County Jurisdiction ] (e.g. Los Angeles County 0.25%)
       │
       ▼
[ City / Local Jurisdiction ] (e.g. City of Los Angeles 1.00%)
       │
       ▼
[ Special Taxing District ] (e.g. LA County Transportation Commission Districts 2.25%)
       │
       ▼
[ Combined Composite Rate ] = 9.50%
```

---

## 2. Address Normalization Provider (`AddressProvider`)
The `AddressProvider` (`src/server/services/salesTax/address/addressProvider.ts`) provides:
- CASS-style standardization (capitalization, street abbreviations like `AVE` -> `Ave`, `BLVD` -> `Blvd`).
- ZIP+4 and rooftop geocoding resolution.
- Canonical jurisdiction ID assignment.
- Composite rate computation.

---

## 3. Versioned Rate Provider (`RateService`)
The `RateService` (`src/server/services/salesTax/rates/rateService.ts`) provides:
- **Sub-15ms In-Memory Caching**: High-throughput rating for high-volume transactions.
- **Effective-Date Awareness**: Rates are versioned with `effectiveFrom` and `effectiveTo` timestamps. Rate changes scheduled by state departments (e.g. California July 1 / January 1 rate changes) take effect automatically without code updates.
- **Deterministic Component Breakdown**: Every rate calculation returns exact decimal shares:
  - `stateRate`
  - `countyRate`
  - `cityRate`
  - `specialDistrictRate`
  - `combinedRate`
