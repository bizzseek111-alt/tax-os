# Phase 7 — Physical and Economic Nexus Engine

## 1. Statutory Threshold Matrix
The Nexus Engine implements versioned statutory rules (`2026.1`) for economic nexus following the landmark Supreme Court decision in *South Dakota v. Wayfair, Inc.*:

| State | Statutory Sales Threshold | Statutory Transaction Threshold | Operator | Measurement Period | Legal Citation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **California (CA)** | $500,000 | None | Sales Only | Prior or Current Calendar Year | Cal. Rev. & Tax. Code § 6203(c)(4) |
| **New York (NY)** | $500,000 | 100 Transactions | Sales AND Txns | Preceding 4 Sales Tax Quarters | N.Y. Tax Law § 1101(b)(8)(iv) |
| **New Jersey (NJ)** | $100,000 | 200 Transactions | Sales OR Txns | Prior or Current Calendar Year | N.J. Stat. Ann. § 54:32B-3 |
| **Illinois (IL)** | $100,000 | 200 Transactions | Sales OR Txns | Trailing 12 Months | 35 ILCS 120/2(b) |
| **Massachusetts (MA)** | $100,000 | None | Sales Only | Prior or Current Calendar Year | Mass. Gen. Laws ch. 64H, § 1 |

## 2. Warning Bands & Automated Escalation
To protect taxpayers from retroactive penalties, the engine continuously tracks progress toward economic thresholds:
- **< 75%**: `NO_NEXUS` status. Normal telemetry monitoring.
- **75% – 89.9%**: `APPROACHING_THRESHOLD` status. Emits `THRESHOLD_WARNING_75` event.
- **90% – 99.9%**: `APPROACHING_THRESHOLD` status. Emits `THRESHOLD_WARNING_90` event for preparatory action.
- **≥ 100%**: `NEXUS_ESTABLISHED` status. Emits `NEXUS_BREACHED` event and automatically provisions a high-priority `TaxTask` (`SALES_TAX_REGISTRATION_[STATE]`).

## 3. Physical Nexus Detection
Physical presence creates immediate sales tax obligations regardless of dollar thresholds. The engine monitors:
- 3PL fulfillment and inventory storage (Amazon FBA, Warehouses)
- Remote employees or contractors providing services in-state
- Physical offices, stores, and distribution centers
- Trade show attendance exceeding state de minimis statutory days (e.g., CA > 15 days).
