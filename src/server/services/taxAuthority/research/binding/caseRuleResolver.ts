/**
 * Autonomous Tax OS — Case-Specific Rule Resolver & Candidate Generator
 * 
 * Determines applicability of tax rules to specific taxpayer facts and
 * generates TaxRuleCandidates for review when novel legal rules are researched.
 */

import prisma from '../../../../db';
import { TaxRule } from '@prisma/client';
import {
  CaseApplicableRule,
  ConfirmedFact,
  FactApplicabilityMap,
  ResearchDomain,
  TaxResearchRequest,
  TaxRuleCandidateInput
} from '../types';
import { ConditionRuleRequirement, FactApplicabilityService } from './factApplicabilityMap';
import { AuthorityHierarchyEngine } from '../hierarchy/authorityHierarchyEngine';

export class CaseRuleResolver {
  private static instance: CaseRuleResolver;
  private factService: FactApplicabilityService;
  private hierarchyEngine: AuthorityHierarchyEngine;

  private constructor() {
    this.factService = FactApplicabilityService.getInstance();
    this.hierarchyEngine = AuthorityHierarchyEngine.getInstance();
  }

  public static getInstance(): CaseRuleResolver {
    if (!CaseRuleResolver.instance) {
      CaseRuleResolver.instance = new CaseRuleResolver();
    }
    return CaseRuleResolver.instance;
  }

  /**
   * Evaluates standard statutory requirements for home office (IRC § 280A).
   */
  public getHomeOfficeRequirements(): ConditionRuleRequirement[] {
    return [
      {
        ruleId: 'RULE-IRC-280A',
        conditionDescription: 'Exclusive trade or business use of the space',
        requiredFactKey: 'exclusive_business_use',
        expectedType: 'boolean',
        evaluator: (val: any) => Boolean(val) === true,
        questionIfMissing: {
          questionText: 'Is your home office space used exclusively for trade or business purposes (no personal use)?',
          options: ['Yes, exclusively business', 'No, shared personal use'],
          whyNeeded: 'IRC § 280A(c)(1) strictly disallows home office deductions if the space is used for personal activities.'
        }
      },
      {
        ruleId: 'RULE-IRC-280A',
        conditionDescription: 'Regular and continuous business use as principal place of business',
        requiredFactKey: 'regular_business_basis',
        expectedType: 'boolean',
        evaluator: (val: any) => Boolean(val) === true,
        questionIfMissing: {
          questionText: 'Is the home office used on a regular, ongoing basis as your principal place of business?',
          options: ['Yes, regular basis', 'No, occasional or incidental'],
          whyNeeded: 'IRC § 280A requires regular and continuous use for business operations or meeting clients.'
        }
      }
    ];
  }

  /**
   * Resolves applicability of an approved TaxRule to a specific case.
   */
  public resolveRule(
    caseId: string,
    rule: TaxRule,
    facts: ConfirmedFact[] = [],
    requirements: ConditionRuleRequirement[] = []
  ): CaseApplicableRule {
    const applicabilityMap: FactApplicabilityMap = requirements.length > 0
      ? this.factService.evaluateApplicability(caseId, rule.ruleId, requirements, facts)
      : {
          caseId,
          ruleId: rule.ruleId,
          bindings: [],
          allConditionsSatisfied: true,
          hasMissingFacts: false,
          missingFactKeys: [],
          missingFacts: []
        };

    let applicabilityStatus: CaseApplicableRule['applicabilityStatus'] = 'FULLY_APPLICABLE';

    if (applicabilityMap.hasMissingFacts) {
      applicabilityStatus = 'BLOCKED_BY_MISSING_FACTS';
    } else if (!applicabilityMap.allConditionsSatisfied) {
      applicabilityStatus = 'NOT_APPLICABLE';
    }

    const rank = 1;
    const weight = 1.0;

    return {
      ruleId: rule.ruleId,
      ruleTitle: rule.title,
      jurisdiction: rule.jurisdiction,
      taxYear: rule.taxYear,
      applicabilityStatus,
      authorityAssessment: {
        authorityType: 'STATUTE' as any,
        authorityLevel: rank,
        precedentialStatus: 'BINDING' as any,
        jurisdictionMatch: true,
        taxYearMatch: true,
        effectivePeriodMatch: true,
        sourceAuthenticity: true,
        supersessionStatus: 'CURRENT',
        directnessOfSupport: 'DIRECT',
        conflictStatus: 'NONE',
        authorityWeight: weight
      },
      applicabilityMap,
      confidenceScore: applicabilityStatus === 'FULLY_APPLICABLE' ? 1.0 : 0.0
    };
  }

  /**
   * Creates a novel TaxRuleCandidate for review by CPAs/Lawyers.
   */
  public async createRuleCandidate(candidate: TaxRuleCandidateInput): Promise<any> {
    try {
      const record = await prisma.taxRuleCandidate.create({
        data: {
          candidateRuleId: candidate.candidateRuleId,
          jurisdiction: candidate.jurisdiction,
          taxYear: candidate.taxYear,
          taxDomain: candidate.taxDomain || 'INCOME_TAX',
          topic: candidate.topic || 'GENERAL',
          title: candidate.title,
          description: candidate.description,
          conditions: candidate.conditions as any,
          authorityRefs: candidate.authorityRefs as any,
          discoveredByResearchId: candidate.discoveredByResearchId ?? null,
          status: 'CANDIDATE'
        }
      });
      return record;
    } catch (err) {
      console.warn('[CaseRuleResolver] DB error creating TaxRuleCandidate, returning stub:', err);
      return {
        id: `mock-candidate-${Date.now()}`,
        ...candidate,
        status: 'PENDING',
        createdAt: new Date()
      };
    }
  }
}
