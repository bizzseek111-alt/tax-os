/**
 * Autonomous Tax OS — Legal Escalation & AI Research Brief Service
 * 
 * Manages escalation of irreconcilable legal conflicts, novel questions, circuit splits,
 * and high-materiality tax issues to CPAs and Tax Attorneys.
 * Generates comprehensive AI Research Briefs with IRC § 6662 penalty protection assessments.
 */

import prisma from '../../../../db';
import { AIResearchBrief, AuthorityConflictDetail, AuthorityEscalationType, TaxResearchRequest } from '../types';

export class LegalEscalationService {
  private static instance: LegalEscalationService;

  private constructor() {}

  public static getInstance(): LegalEscalationService {
    if (!LegalEscalationService.instance) {
      LegalEscalationService.instance = new LegalEscalationService();
    }
    return LegalEscalationService.instance;
  }

  /**
   * Generates a formal AI Research Brief for tax professionals.
   */
  public generateResearchBrief(
    request: TaxResearchRequest,
    conflictDetails: {
      issueStatement: string;
      authorityA: { citation: string; rank: number; weight: number; summary: string };
      authorityB: { citation: string; rank: number; weight: number; summary: string };
      potentialLiabilityCents?: bigint;
    }
  ): AIResearchBrief {
    const exposure = conflictDetails.potentialLiabilityCents 
      ? Number(conflictDetails.potentialLiabilityCents) / 100 
      : 5000;

    return {
      issueStatement: conflictDetails.issueStatement,
      applicableFacts: {
        confirmed: (request.confirmedFacts || []).map(f => `${f.key}: ${JSON.stringify(f.value)}`),
        unconfirmed: (request.unresolvedFacts || []).map(f => `${f.key}: ${f.description}`)
      },
      competingAuthorities: [
        {
          citation: conflictDetails.authorityA.citation,
          rank: conflictDetails.authorityA.rank,
          weight: conflictDetails.authorityA.weight,
          quote: conflictDetails.authorityA.summary,
          argument: `Supports taxpayer position under ${conflictDetails.authorityA.citation}.`
        },
        {
          citation: conflictDetails.authorityB.citation,
          rank: conflictDetails.authorityB.rank,
          weight: conflictDetails.authorityB.weight,
          quote: conflictDetails.authorityB.summary,
          argument: `Adverse agency or judicial interpretation under ${conflictDetails.authorityB.citation}.`
        }
      ],
      argumentsAnalysis: `Legal tension between ${conflictDetails.authorityA.citation} and ${conflictDetails.authorityB.citation}. The higher weighted authority or specific statutory rule should be evaluated by qualified counsel.`,
      financialExposure: {
        bestCaseDollars: 0,
        worstCaseDollars: exposure,
        expectedLiabilityDollars: Math.round(exposure * 0.4)
      },
      substantialAuthorityAssessment: {
        meetsSubstantialAuthority: conflictDetails.authorityA.weight >= 0.70,
        likelihoodPercentage: Math.round(conflictDetails.authorityA.weight * 50),
        penaltyProtectionNotes: conflictDetails.authorityA.weight >= 0.70
          ? 'Meets substantial authority standard (IRC § 6662(d)(2)(B)) - substantial justification exists.'
          : 'Does not clearly reach substantial authority (requires Form 8275 disclosure for penalty relief).'
      },
      reasonableBasisAssessment: {
        meetsReasonableBasis: conflictDetails.authorityA.weight >= 0.40,
        likelihoodPercentage: Math.max(25, Math.round(conflictDetails.authorityA.weight * 35))
      },
      recommendedPosition: `Adopt position supported by ${conflictDetails.authorityA.citation} with Form 8275 disclosure if substantial authority is marginal.`,
      questionsForReviewer: [
        'Does the taxpayer possess documented contemporaneous substantiation?',
        'Does the relevant appellate jurisdiction have governing precedent on this specific statutory construction?'
      ]
    };
  }

  /**
   * Persists an AuthorityConflict record in PostgreSQL.
   */
  public async createAuthorityConflict(
    taxCaseId: string | undefined,
    conflict: AuthorityConflictDetail,
    brief?: AIResearchBrief
  ): Promise<any> {
    try {
      const record = await prisma.authorityConflict.create({
        data: {
          taxCaseId: taxCaseId ?? null,
          topic: conflict.topic,
          jurisdiction: conflict.jurisdiction,
          taxYear: conflict.taxYear,
          primarySourceCode: conflict.primarySourceCode,
          primaryRank: conflict.primaryRank,
          conflictingSourceCode: conflict.conflictingSourceCode,
          conflictingRank: conflict.conflictingRank,
          conflictSummary: conflict.conflictSummary,
          materialityCents: conflict.materialityCents || BigInt(0),
          escalationRequired: conflict.escalationRequired || AuthorityEscalationType.CPA_REVIEW,
          status: 'UNRESOLVED',
          resolutionNotes: brief ? JSON.stringify(brief) : null
        }
      });
      return record;
    } catch (err) {
      console.warn('[LegalEscalationService] DB record failed, using in-memory mock:', err);
      return {
        id: `conflict-${Date.now()}`,
        ...conflict,
        status: 'UNRESOLVED',
        createdAt: new Date()
      };
    }
  }
}
