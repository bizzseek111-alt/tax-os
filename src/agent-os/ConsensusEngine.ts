/**
 * Autonomous Tax OS — Consensus Engine
 * Five-stage arbitration loop resolving proposed positions, adversarial challenges, and evidence proofs.
 */

import {
  ConsensusProposal,
  AdversarialChallenge,
  ConsensusVerdict
} from './types';

export class ConsensusEngine {
  /**
   * Arbitrates a debate between a proposed tax deduction and an adversarial IRS challenge.
   */
  public static arbitrate(
    proposal: ConsensusProposal,
    challenge: AdversarialChallenge | null,
    hasDocumentaryProof: boolean,
    hasStatutoryCitation: boolean
  ): ConsensusVerdict {
    const now = new Date().toISOString();

    // 1. Critical Disallowance: Missing primary statutory citation
    if (!hasStatutoryCitation || !proposal.statutoryCitation) {
      return {
        proposalId: proposal.proposalId,
        decision: 'REJECTED',
        approvedAmountCents: 0,
        statutoryJustification: 'Disallowed: Proposed position lacks verified primary statutory authority citation.',
        arbitrationTimestamp: now
      };
    }

    // 2. High Audit Risk with Missing Documentary Evidence
    if (challenge && challenge.auditRiskSeverity === 'HIGH' && !hasDocumentaryProof) {
      // If factual information could resolve the challenge, generate a Tax Inbox card
      if (challenge.missingProofElements.length > 0) {
        return {
          proposalId: proposal.proposalId,
          decision: 'USER_INPUT_REQUIRED',
          approvedAmountCents: 0,
          statutoryJustification: `Pending Substantiation under ${proposal.statutoryCitation}: Adversarial audit flagged missing proof elements: ${challenge.missingProofElements.join(', ')}.`,
          requiredInboxCard: {
            promptTitle: `Substantiate ${proposal.topic}`,
            questionText: `The IRS requires contemporaneous substantiation for this item. Can you confirm: ${challenge.missingProofElements[0]}?`,
            suggestedAnswers: ['Confirm Business Purpose', 'Mark as Personal Expense']
          },
          arbitrationTimestamp: now
        };
      }

      // If legal controversy, escalate to professional review
      return {
        proposalId: proposal.proposalId,
        decision: 'PRO_REVIEW_REQUIRED',
        approvedAmountCents: 0,
        statutoryJustification: `Escalated to CPA: Challenged under ${challenge.objectionRationale}`,
        reviewQueueNote: `Adversarial audit flagged high-risk position: ${challenge.objectionRationale}`,
        arbitrationTimestamp: now
      };
    }

    // 3. Fully Grounded Position: Documentary proof present, statutory authority verified
    if (hasDocumentaryProof && proposal.confidence >= 0.90) {
      return {
        proposalId: proposal.proposalId,
        decision: 'APPROVED',
        approvedAmountCents: proposal.amountCents,
        statutoryJustification: `Approved under ${proposal.statutoryCitation}: Verified with 100% documentary evidence and survived adversarial challenge.`,
        arbitrationTimestamp: now
      };
    }

    // 4. Moderate Position: User confirmed or low risk
    if (proposal.confidence >= 0.85 && (!challenge || challenge.auditRiskSeverity === 'LOW')) {
      return {
        proposalId: proposal.proposalId,
        decision: 'APPROVED',
        approvedAmountCents: proposal.amountCents,
        statutoryJustification: `Approved under ${proposal.statutoryCitation}: Satisfies ordinary and necessary business standard.`,
        arbitrationTimestamp: now
      };
    }

    // 5. Default Fallback: Route to professional review
    return {
      proposalId: proposal.proposalId,
      decision: 'PRO_REVIEW_REQUIRED',
      approvedAmountCents: 0,
      statutoryJustification: 'Ambiguous substantiation requiring CPA exception sign-off.',
      reviewQueueNote: 'Confidence below automated threshold.',
      arbitrationTimestamp: now
    };
  }
}
