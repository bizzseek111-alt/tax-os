# Phase 7 — Sourcing Rules & Composite Jurisdiction Rates

## 1. Sourcing Engine
TaxOS handles interstate and intrastate sales using state-specific statutory sourcing rules:

### 1.1. Destination-Based Sourcing
- **States**: California (for district taxes), New York, New Jersey, Massachusetts.
- **Rule**: Sales tax is calculated based on the purchaser's delivery address or location where the benefit of the service is received.

### 1.2. Mixed / Origin Sourcing (Illinois)
- **Intrastate Sales**: When an Illinois business sells to an Illinois purchaser, the sale is sourced to the **seller's physical origin facility** for state, municipal, and county Retailers' Occupation Tax (ROT).
- **Interstate Remote Sales**: Out-of-state remote sellers shipping goods into Illinois are sourced to the **purchaser's destination address** for Illinois Use Tax under the Leveling the Playing Field for Illinois Retail Act.

## 2. Hierarchical Composite Rates
Rates are never resolved by 5-digit ZIP code alone. The `AddressProvider` normalizes the address to CASS standards, determines rooftop or plus-4 location, and resolves:
- **State Rate**
- **County Rate**
- **City / Municipal Rate**
- **Special District Rate** (Transit, BART, RTA, Hospital, Police, Fire)
- **Composite Rate** = `State + County + City + Special District`.

### Representative Launch Composites:
- **San Francisco, CA (`US-CA-06075`)**: 6.00% State + 1.25% County/Bradley-Burns + 0.00% City + 1.375% SFCTA/BART = **8.625%**.
- **Los Angeles, CA (`US-CA-06037`)**: 6.00% State + 1.25% County + 0.00% City + 2.25% LA MTA = **9.500%**.
- **New York City, NY (`US-NY-36061`)**: 4.00% State + 0.00% County + 4.50% City + 0.375% MCTD = **8.875%**.
- **Chicago, IL (`US-IL-17031`)**: 6.25% State + 1.75% Cook Home Rule + 1.25% City + 1.00% RTA = **10.250%**.
- **New Jersey Statewide (`US-NJ-STATE`)**: Flat **6.625%**.
- **Massachusetts Statewide (`US-MA-STATE`)**: Flat **6.250%**.
