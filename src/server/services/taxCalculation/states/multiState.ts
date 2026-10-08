/**
 * Autonomous TaxOS — Multi-State Allocation & Credit Engine
 * Workstream 3: Phase 3
 * 
 * Implements statutory allocation and resident credit for taxes paid to other jurisdictions
 * (CA Schedule S, NY IT-112-R, NJ Schedule NJ-COJ, IL Schedule CR, MA Schedule OJC).
 */

import { TaxMoney } from '../money';
import { SupportedJurisdiction, W2Input } from '../types';

export interface StateAllocation {
  jurisdiction: SupportedJurisdiction;
  stateWagesCents: bigint;
  stateWithholdingCents: bigint;
  apportionmentRatioBps: number;
}

export class MultiStateEngine {
  /**
   * Allocate wages across states from W-2 Box 15/16/17 records.
   */
  public static allocateW2Wages(w2s: W2Input[], totalFedWagesCents: bigint): Record<string, StateAllocation> {
    const allocations: Record<string, StateAllocation> = {};

    for (const w2 of w2s) {
      if (!w2.stateCode) continue;

      const code = `US-${w2.stateCode.toUpperCase()}` as SupportedJurisdiction;
      const stateWages = w2.stateWagesCents ?? w2.wagesCents;
      const stateWithholding = w2.stateWithholdingCents ?? 0n;

      if (!allocations[code]) {
        allocations[code] = {
          jurisdiction: code,
          stateWagesCents: 0n,
          stateWithholdingCents: 0n,
          apportionmentRatioBps: 0,
        };
      }

      allocations[code].stateWagesCents += stateWages;
      allocations[code].stateWithholdingCents += stateWithholding;
    }

    // Calculate apportionment basis points
    for (const key of Object.keys(allocations)) {
      if (totalFedWagesCents > 0n) {
        const ratio = TaxMoney.multiplyFraction(allocations[key].stateWagesCents, 10000n, totalFedWagesCents);
        allocations[key].apportionmentRatioBps = Number(ratio);
      }
    }

    return allocations;
  }

  /**
   * Calculate statutory resident credit for taxes paid to another state.
   * Statutory rule across CA, NY, NJ, IL, MA:
   * Credit is the LESSER of:
   * 1. Actual tax paid to the nonresident state on the doubly taxed income
   * 2. Resident state tax * (Doubly taxed income / Total resident income)
   */
  public static calculateResidentOtherStateCredit(
    residentGrossTaxCents: bigint,
    residentTotalIncomeCents: bigint,
    doublyTaxedIncomeCents: bigint,
    actualNonresidentTaxPaidCents: bigint
  ): bigint {
    if (residentGrossTaxCents <= 0n || residentTotalIncomeCents <= 0n || doublyTaxedIncomeCents <= 0n) {
      return 0n;
    }

    // Ratio cap: ResidentGrossTax * (DoublyTaxed / TotalResident)
    const ratioCapCents = TaxMoney.multiplyFraction(
      residentGrossTaxCents,
      TaxMoney.min(doublyTaxedIncomeCents, residentTotalIncomeCents),
      residentTotalIncomeCents
    );

    // Allowed credit is the lesser of the actual tax paid or the resident state ratio cap
    return TaxMoney.min(actualNonresidentTaxPaidCents, ratioCapCents);
  }
}
