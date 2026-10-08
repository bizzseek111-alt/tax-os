# Phase 7 — Transaction Sourcing Engine

## 1. Sourcing Methodologies
The `SourcingEngine` (`src/server/services/salesTax/sourcing/sourcingEngine.ts`) determines which state and local jurisdictions have statutory taxing rights over a given transaction:

1. **Destination-Based Sourcing**: Tax rates and jurisdictions are determined by the delivery address (ship-to address) where the customer receives or uses the product.
2. **Origin-Based Sourcing**: Tax rates and jurisdictions are determined by the seller's physical warehouse, store, or office location (ship-from address).
3. **Mixed Sourcing (State-Specific Nuance)**: Hybrid states apply origin rules to intrastate sales and destination rules to remote interstate sales.

---

## 2. Multi-State Sourcing Rules Matrix
TaxOS applies statutory sourcing rules across all launch states:

| State Code | In-State (Intrastate) Sourcing | Out-of-State (Interstate) Sourcing | Sourcing Rule Logic |
| :--- | :--- | :--- | :--- |
| **California (US-CA)** | **Destination** (Local District Tax) + **Origin** (City/County 1%) | **Destination** | Special district taxes are destination-based; base local taxes follow origin. |
| **New York (US-NY)** | **Destination** | **Destination** | Point of delivery / customer benefit determines composite county/city rate. |
| **New Jersey (US-NJ)** | **Destination** | **Destination** | Pure destination sourcing under Streamlined Sales and Use Tax Agreement (SSUTA). |
| **Illinois (US-IL)** | **Origin** (Retailers' Occupation Tax - ROT) | **Destination** (Illinois Use Tax) | **Mixed State**: Intrastate sales tax to seller physical location; interstate remote sales tax to buyer destination. |
| **Massachusetts (US-MA)** | **Destination** | **Destination** | Pure destination sourcing at point of delivery. |

---

## 3. Sourcing Determination Hierarchy
When evaluating a transaction:
1. Examine ship-to address.
2. If ship-to address is unavailable (e.g. digital SaaS order), evaluate billing address.
3. If neither address resolves to a valid U.S. jurisdiction, flag as `UNKNOWN_SOURCING` and route to `ReviewTask` (Tax Reviewer).
