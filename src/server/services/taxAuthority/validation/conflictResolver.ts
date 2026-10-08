/**
 * Autonomous Tax OS — Tax Authority Conflict Resolution Engine
 * 
 * Resolves contradictory guidance across the 15-tier authority hierarchy.
 * 
 * Strict Legal Standards:
 * 1. Hierarchy Primacy: An enacted statute (26 U.S.C.) ALWAYS overrides contradictory
 *    Treasury Regulations, Revenue Rulings, Form Instructions, or FAQs.
 * 2. Loper Bright Standard: Agency interpretations (Treasury Regs, IRS Notices) that exceed
 *    statutory text do not supersede clear statutory language.
 * 3. Circuit Splits & Equal Tiers: Where two equal authorities conflict (e.g. 5th Cir. vs 9th Cir.),
 *    the system flags 'REQUIRES_REVIEW' and dispatches to a human CPA/Attorney rather than guessing.
 */

import { AuthorityType, PrecedentialStatus } from '../types';
import { AuthorityHierarchyService } from '../hierarchy';

export interface ConflictResolutionResult {
  hasConflict: boolean;
  resolution: 'RESOLVED_BY_HIERARCHY' | 'REQUIRES_REVIEW' | 'IDENTICAL_RANK';
  controllingSource?: {
    citationCode: string;
    authorityType: AuthorityType;
  };
  rationale: string;
  isHumanEscalationNeeded: boolean;
}

export class TaxConflictResolver {
  public static resolveConflict(
    sourceA: {
      citationCode: string;
      authorityType: AuthorityType;
      precedentialStatus: PrecedentialStatus;
      effectiveFrom: Date;
    },
    sourceB: {
      citationCode: string;
      authorityType: AuthorityType;
      precedentialStatus: PrecedentialStatus;
      effectiveFrom: Date;
    }
  ): ConflictResolutionResult {
    // 1. Superseded check
    if (sourceA.precedentialStatus === PrecedentialStatus.SUPERSEDED && sourceB.precedentialStatus !== PrecedentialStatus.SUPERSEDED) {
      return {
        hasConflict: true,
        resolution: 'RESOLVED_BY_HIERARCHY',
        controllingSource: {
          citationCode: sourceB.citationCode,
          authorityType: sourceB.authorityType
        },
        rationale: `${sourceA.citationCode} is SUPERSEDED and carries no legal force against active source ${sourceB.citationCode}.`,
        isHumanEscalationNeeded: false
      };
    }
    if (sourceB.precedentialStatus === PrecedentialStatus.SUPERSEDED && sourceA.precedentialStatus !== PrecedentialStatus.SUPERSEDED) {
      return {
        hasConflict: true,
        resolution: 'RESOLVED_BY_HIERARCHY',
        controllingSource: {
          citationCode: sourceA.citationCode,
          authorityType: sourceA.authorityType
        },
        rationale: `${sourceB.citationCode} is SUPERSEDED and carries no legal force against active source ${sourceA.citationCode}.`,
        isHumanEscalationNeeded: false
      };
    }

    // 2. Rank comparison
    const rankA = AuthorityHierarchyService.getRank(sourceA.authorityType);
    const rankB = AuthorityHierarchyService.getRank(sourceB.authorityType);

    if (rankA < rankB) {
      return {
        hasConflict: true,
        resolution: 'RESOLVED_BY_HIERARCHY',
        controllingSource: {
          citationCode: sourceA.citationCode,
          authorityType: sourceA.authorityType
        },
        rationale: `${sourceA.citationCode} (${sourceA.authorityType}, Rank ${rankA}) legally controls over lower-tier guidance ${sourceB.citationCode} (${sourceB.authorityType}, Rank ${rankB}).`,
        isHumanEscalationNeeded: false
      };
    } else if (rankB < rankA) {
      return {
        hasConflict: true,
        resolution: 'RESOLVED_BY_HIERARCHY',
        controllingSource: {
          citationCode: sourceB.citationCode,
          authorityType: sourceB.authorityType
        },
        rationale: `${sourceB.citationCode} (${sourceB.authorityType}, Rank ${rankB}) legally controls over lower-tier guidance ${sourceA.citationCode} (${sourceA.authorityType}, Rank ${rankA}).`,
        isHumanEscalationNeeded: false
      };
    }

    // 3. Identical rank conflict (e.g. two conflicting court decisions or revenue rulings)
    return {
      hasConflict: true,
      resolution: 'REQUIRES_REVIEW',
      rationale: `Substantive conflict between two equal-rank authorities: ${sourceA.citationCode} vs ${sourceB.citationCode} (both ${sourceA.authorityType}). Escalated to licensed CPA/Tax Attorney for professional review.`,
      isHumanEscalationNeeded: true
    };
  }
}
