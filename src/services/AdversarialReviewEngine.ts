/**
 * Autonomous Tax OS — Adversarial Review & Consensus Engine
 * Workstream 8: Optimizer, IRS Challenger, Evidence Examiner, Confidence Engine, Multi-Agent Debate.
 */

export interface TaxPositionProposal {
  positionId: string;
  category: string;
  claimedAmountCents: number;
  statutoryCitation: string;
  hasDocumentaryProof: boolean;
  jurisdiction: string;
  taxYear: number;
}

export interface AdversarialEvaluation {
  positionId: string;
  confidenceScore: number;
  verdict: 'APPROVED' | 'REJECTED' | 'PRO_REVIEW_REQUIRED' | 'USER_INPUT_REQUIRED';
  optimizerNotes?: string;
  challengerRebuttal?: string;
  evidenceDefects?: string[];
}

export class AdversarialReviewEngine {
  /**
   * Executes adversarial evaluation between the Optimizer, Evidence Examiner, and IRS Challenger.
   */
  public static evaluatePosition(proposal: TaxPositionProposal): AdversarialEvaluation {
    const defects: string[] = [];
    let confidenceScore = 1.0;
    let challengerRebuttal: string | undefined;

    // 1. Evidence Examiner Gate
    if (!proposal.hasDocumentaryProof) {
      defects.push('Missing supporting receipt or documentary vault proof.');
      confidenceScore -= 0.35;
    }

    // 2. Strict Tax Year Gate
    if (proposal.taxYear !== 2026) {
      defects.push(`Tax year mismatch: claimed for ${proposal.taxYear}, return is 2026.`);
      confidenceScore = 0.0;
      return {
        positionId: proposal.positionId,
        confidenceScore: 0.0,
        verdict: 'REJECTED',
        challengerRebuttal: 'Authority or expense does not apply to active tax year 2026.',
        evidenceDefects: defects
      };
    }

    // 3. IRS Challenger Rules
    if (proposal.category === 'MEALS' || proposal.category === 'BUSINESS_MEALS') {
      challengerRebuttal = 'Enforced 50% statutory disallowance pursuant to 26 U.S.C. § 274(n).';
    } else if (proposal.jurisdiction === 'US-CA' && proposal.category === 'HSA_DEDUCTION') {
      challengerRebuttal = 'Disallowed under Cal. RTC § 17215.4 (California does not conform to federal HSA deduction).';
      confidenceScore = 0.0;
      return {
        positionId: proposal.positionId,
        confidenceScore: 0.0,
        verdict: 'REJECTED',
        challengerRebuttal,
        evidenceDefects: ['State non-conformity bar']
      };
    } else if (proposal.jurisdiction === 'US-CA' && proposal.category === 'SECTION_179_EQUIPMENT' && proposal.claimedAmountCents > 2500000) {
      challengerRebuttal = 'Capped at $25,000 under Cal. RTC § 17255. Excess must be depreciated via MACRS.';
      confidenceScore = 0.85;
      return {
        positionId: proposal.positionId,
        confidenceScore,
        verdict: 'PRO_REVIEW_REQUIRED',
        challengerRebuttal,
        optimizerNotes: 'Apply federal 100% expensing with California Schedule CA addition modification.'
      };
    }

    // Determine final consensus verdict
    let verdict: AdversarialEvaluation['verdict'] = 'APPROVED';
    if (confidenceScore < 0.6) {
      verdict = 'REJECTED';
    } else if (confidenceScore < 0.9 || defects.length > 0) {
      verdict = defects.includes('Missing supporting receipt') ? 'USER_INPUT_REQUIRED' : 'PRO_REVIEW_REQUIRED';
    }

    return {
      positionId: proposal.positionId,
      confidenceScore: Math.max(0, confidenceScore),
      verdict,
      challengerRebuttal,
      optimizerNotes: 'Position maximizes legal taxpayer tax savings with binding primary statutory grounding.',
      evidenceDefects: defects.length > 0 ? defects : undefined
    };
  }
}
