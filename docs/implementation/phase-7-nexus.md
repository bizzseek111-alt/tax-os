# Phase 7 — Physical and Economic Nexus Engine

## 1. Architectural Philosophy
In Autonomous Tax OS, sales tax is never modeled as `"state tax rate × revenue"`. A taxpayer cannot incur sales tax collection liability in a jurisdiction without establishing legal nexus. The `NexusEngine` (`src/server/services/salesTax/nexus/nexusEngine.ts`) provides continuous, deterministic monitoring of physical and economic nexus across all jurisdictions, linking every determination to statutory tax authorities and the Evidence Graph.

---

## 2. Statutory Economic Nexus Threshold Matrix
Economic nexus rules follow the landmark U.S. Supreme Court decision in *South Dakota v. Wayfair, Inc.* (2018). Rather than hardcoding generic "$100k" logic across all states, TaxOS implements versioned statutory rules (`2026.1`):

| State Code | Statutory Sales Threshold | Statutory Transaction Threshold | Operator | Measurement Period | Legal Authority Citation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **California (US-CA)** | $500,000 | None | Sales Only | Prior or Current Calendar Year | Cal. Rev. & Tax. Code § 6203(c)(4) |
| **New York (US-NY)** | $500,000 | 100 Transactions | Sales AND Txns | Preceding 4 Sales Tax Quarters | N.Y. Tax Law § 1101(b)(8)(iv) |
| **New Jersey (US-NJ)** | $100,000 | 200 Transactions | Sales OR Txns | Prior or Current Calendar Year | N.J. Stat. Ann. § 54:32B-3(c) |
| **Illinois (US-IL)** | $100,000 | 200 Transactions | Sales OR Txns | Trailing 12-Month Rolling Period | 35 ILCS 120/2(b) |
| **Massachusetts (US-MA)** | $100,000 | None | Sales Only | Prior or Current Calendar Year | Mass. Gen. Laws ch. 64H, § 1 |

---

## 3. Early Warning Bands & Progressive Escalation
To protect businesses from retroactive compliance penalties, interest, and mandatory lookback liabilities, the `NexusEngine` continuously evaluates incoming transactions against configurable warning bands:

- **< 75% of Threshold**: `NO_NEXUS` status. Normal telemetry monitoring.
- **75.0% – 89.9% of Threshold**: `APPROACHING_THRESHOLD` status. Emits `THRESHOLD_WARNING_75` event.
- **90.0% – 99.9% of Threshold**: `APPROACHING_THRESHOLD` status. Emits `THRESHOLD_WARNING_90` urgent warning.
- **≥ 100.0% of Threshold**: `NEXUS_ESTABLISHED` status. Emits `NEXUS_BREACHED` event, marks `EconomicNexusMeasurement.status = 'THRESHOLD_MET'`, and creates a high-priority `TaxTask` (`SALES_TAX_REGISTRATION_[STATE]`).

> **Warning Band Distinction**: The engine strictly distinguishes operational warning bands (75%, 90%) from statutory legal obligations (100%), preventing premature registration before legal nexus arises.

---

## 4. Physical Nexus Fact Tracking
Physical nexus facts supersede economic thresholds, creating immediate collection requirements from day one. TaxOS monitors physical facts via `PhysicalNexusFact`:
- **3PL Inventory & Warehousing**: Fulfillment centers (e.g. Amazon FBA, ShipBob).
- **Remote Employees & Contractors**: Full-time, part-time, or 1099 staff operating in-state.
- **Offices & Physical Locations**: Leased or owned commercial property, storefronts, and co-working spaces.
- **Trade Show & Temporary Presence**: On-the-ground activity exceeding state statutory de minimis days (e.g., CA > 15 days per RTC § 6203).

---

## 5. Persistence & Evidence Graph Lineage
Every measurement is stored in `EconomicNexusMeasurement`:
```prisma
model EconomicNexusMeasurement {
  id                   String      @id @default(uuid())
  organizationId       String
  stateCode            String
  period               String
  grossSalesCents      BigInt      @default(0)
  taxableSalesCents    BigInt      @default(0)
  transactionCount     Int         @default(0)
  salesThresholdCents  BigInt
  txThresholdCount     Int?
  percentSales         Float       @default(0.0)
  percentTransactions  Float       @default(0.0)
  status               NexusStatus @default(NO_NEXUS)
  ruleSetVersion       String      @default("2026.1")
}
```
Every determination links to:
1. Associated `SalesTransaction` records.
2. Verified `PhysicalNexusFact` records.
3. `TaxRule` and `TaxAuthoritySource` statutory citations in the Tax Rule Graph.
