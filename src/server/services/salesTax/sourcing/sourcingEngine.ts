/**
 * Autonomous Tax OS — Sales Tax Sourcing Engine
 * 
 * Evaluates Destination-based vs. Origin-based vs. Mixed sourcing rules
 * across interstate and intrastate commerce in CA, NY, NJ, IL, MA.
 */

import { SourcingRule } from '@prisma/client';
import { NormalizedAddress } from '../address/addressProvider';

export interface SourcingDetermination {
  rule: SourcingRule;
  sourcingLocation: 'ORIGIN' | 'DESTINATION';
  effectiveStateCode: string;
  effectiveZip: string;
  rationale: string;
}

export class SourcingEngine {
  /**
   * Deterministically resolves transaction sourcing rule
   */
  public resolveSourcing(
    origin: NormalizedAddress,
    destination: NormalizedAddress,
    productCategory: string = 'TPP'
  ): SourcingDetermination {
    const originState = origin.state.toUpperCase();
    const destState = destination.state.toUpperCase();
    const isIntrastate = originState === destState;

    // Illinois Mixed Rules:
    // Intrastate sales are sourced to seller origin for Retailers' Occupation Tax (ROT).
    // Remote interstate sales are sourced to purchaser destination for Use Tax.
    if (destState === 'IL') {
      if (isIntrastate) {
        return {
          rule: SourcingRule.ORIGIN,
          sourcingLocation: 'ORIGIN',
          effectiveStateCode: originState,
          effectiveZip: origin.postalCode,
          rationale: 'Illinois Intrastate Sale: Sourced to seller origin location under 35 ILCS 120/2 Retailers\' Occupation Tax.'
        };
      } else {
        return {
          rule: SourcingRule.DESTINATION,
          sourcingLocation: 'DESTINATION',
          effectiveStateCode: destState,
          effectiveZip: destination.postalCode,
          rationale: 'Illinois Interstate Remote Sale: Sourced to purchaser destination for Illinois Use Tax / Leveling the Playing Field Act.'
        };
      }
    }

    // California:
    // State base rate is origin/statewide, but local district taxes are sourced to destination of delivery (Cal. Rev. & Tax. Code § 7200 et seq.)
    if (destState === 'CA') {
      return {
        rule: SourcingRule.DESTINATION,
        sourcingLocation: 'DESTINATION',
        effectiveStateCode: 'CA',
        effectiveZip: destination.postalCode,
        rationale: 'California District Taxes: Sourced to purchaser delivery destination under CDTFA Regulation 1823.'
      };
    }

    // New York, New Jersey, Massachusetts:
    // Strict destination-based sourcing for all retail sales and digital services delivered into the state.
    return {
      rule: SourcingRule.DESTINATION,
      sourcingLocation: 'DESTINATION',
      effectiveStateCode: destState,
      effectiveZip: destination.postalCode,
      rationale: `Destination Sourcing: Sourced to purchaser delivery location in ${destState}.`
    };
  }
}
