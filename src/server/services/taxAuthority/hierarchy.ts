/**
 * Autonomous Tax OS — Statutory Authority Hierarchy & Precedence Engine
 * 
 * Enforces the strict legal hierarchy of tax authority:
 * Statute (IRC/State Code) > Regulation > Court Decision > Revenue Ruling >
 * Revenue Procedure > Notice > Legal Ruling > Technical Memo > Form > Form Instruction >
 * Administrative Guidance > E-file Business Rule > Publication > FAQ > Secondary Commentary.
 * 
 * Critical Legal Invariant:
 * An IRS FAQ, Publication, or Form Instruction CANNOT override an enacted statute or Treasury Regulation.
 * Superseded guidance is assigned an authority weight of 0.0 to prevent contamination.
 */

import {
  AuthorityType,
  AUTHORITY_HIERARCHY_RANK,
  PrecedentialStatus,
  SupportedJurisdiction
} from './types';

export class AuthorityHierarchyService {
  /**
   * Returns the numeric rank (1 = Highest, 15 = Lowest)
   */
  public static getRank(type: AuthorityType): number {
    return AUTHORITY_HIERARCHY_RANK[type] ?? 15;
  }

  /**
   * Calculates the authoritative scoring weight for search ranking.
   * Multiplier ranges from 1.0 (Binding Statute) to 0.06 (Secondary commentary).
   * Superseded guidance strictly receives 0.0 multiplier.
   */
  public static calculateAuthorityWeight(
    type: AuthorityType,
    status: PrecedentialStatus
  ): number {
    if (status === PrecedentialStatus.SUPERSEDED) {
      return 0.0; // Strictly zero weight for superseded law
    }

    const rank = this.getRank(type);
    const baseRankWeight = (16 - rank) / 15.0; // 1.0 (Rank 1) down to 0.066 (Rank 15)

    let statusMultiplier = 1.0;
    switch (status) {
      case PrecedentialStatus.BINDING:
        statusMultiplier = 1.0;
        break;
      case PrecedentialStatus.ADMINISTRATIVE:
        statusMultiplier = 0.85;
        break;
      case PrecedentialStatus.PERSUASIVE:
        statusMultiplier = 0.70;
        break;
      case PrecedentialStatus.PROPOSED:
        statusMultiplier = 0.40;
        break;
      case PrecedentialStatus.HISTORICAL:
        statusMultiplier = 0.20;
        break;
      default:
        statusMultiplier = 0.50;
    }

    return parseFloat((baseRankWeight * statusMultiplier).toFixed(4));
  }

  /**
   * Compares two authority sources to determine which has legal supremacy.
   * Returns negative if A outranks B, positive if B outranks A, 0 if tied.
   */
  public static comparePrecedence(
    sourceA: { authorityType: AuthorityType; precedentialStatus: PrecedentialStatus; effectiveFrom: Date },
    sourceB: { authorityType: AuthorityType; precedentialStatus: PrecedentialStatus; effectiveFrom: Date }
  ): number {
    // 1. Superseded check: any non-superseded source beats a superseded one
    if (sourceA.precedentialStatus === PrecedentialStatus.SUPERSEDED && sourceB.precedentialStatus !== PrecedentialStatus.SUPERSEDED) {
      return 1;
    }
    if (sourceB.precedentialStatus === PrecedentialStatus.SUPERSEDED && sourceA.precedentialStatus !== PrecedentialStatus.SUPERSEDED) {
      return -1;
    }

    // 2. Strict Rank comparison (Lower number = Higher authority)
    const rankA = this.getRank(sourceA.authorityType);
    const rankB = this.getRank(sourceB.authorityType);
    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // 3. Precedential status comparison
    const statusPriority: Record<PrecedentialStatus, number> = {
      [PrecedentialStatus.BINDING]: 1,
      [PrecedentialStatus.ADMINISTRATIVE]: 2,
      [PrecedentialStatus.PERSUASIVE]: 3,
      [PrecedentialStatus.PROPOSED]: 4,
      [PrecedentialStatus.HISTORICAL]: 5,
      [PrecedentialStatus.SUPERSEDED]: 6
    };

    const statusA = statusPriority[sourceA.precedentialStatus] ?? 99;
    const statusB = statusPriority[sourceB.precedentialStatus] ?? 99;
    if (statusA !== statusB) {
      return statusA - statusB;
    }

    // 4. Effective date: More recent effective date controls between equal ranks
    return sourceB.effectiveFrom.getTime() - sourceA.effectiveFrom.getTime();
  }

  /**
   * Validates whether source A legally overrides source B on contradictory guidance.
   */
  public static doesAOverrideB(
    sourceA: { authorityType: AuthorityType; precedentialStatus: PrecedentialStatus; effectiveFrom: Date },
    sourceB: { authorityType: AuthorityType; precedentialStatus: PrecedentialStatus; effectiveFrom: Date }
  ): { aOverridesB: boolean; reason: string } {
    const comp = this.comparePrecedence(sourceA, sourceB);
    if (comp < 0) {
      return {
        aOverridesB: true,
        reason: `${sourceA.authorityType} (Rank ${this.getRank(sourceA.authorityType)}) outranks ${sourceB.authorityType} (Rank ${this.getRank(sourceB.authorityType)}) under statutory hierarchy.`
      };
    } else if (comp > 0) {
      return {
        aOverridesB: false,
        reason: `${sourceB.authorityType} holds legal precedence over ${sourceA.authorityType}.`
      };
    } else {
      return {
        aOverridesB: false,
        reason: 'Both sources possess identical statutory rank and status.'
      };
    }
  }

  /**
   * Checks if an agency publication or FAQ can establish an authoritative deduction/credit.
   * Returns false if not supported by higher tier authority.
   */
  public static isNonPrecedentialGuidance(type: AuthorityType): boolean {
    return [
      AuthorityType.FAQ,
      AuthorityType.OFFICIAL_PUBLICATION,
      AuthorityType.ADMINISTRATIVE_GUIDANCE,
      AuthorityType.SECONDARY_COMMENTARY
    ].includes(type);
  }
}
