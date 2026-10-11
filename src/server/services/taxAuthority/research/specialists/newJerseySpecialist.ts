/**
 * Autonomous Tax OS — New Jersey Division of Taxation Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for New Jersey Gross Income Tax.
 * Covers N.J.S.A. Title 54A, independent gross income categories, and prohibition on cross-category loss offsetting.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class NewJerseyTaxSpecialist {
  private static instance: NewJerseyTaxSpecialist;

  private constructor() {}

  public static getInstance(): NewJerseyTaxSpecialist {
    if (!NewJerseyTaxSpecialist.instance) {
      NewJerseyTaxSpecialist.instance = new NewJerseyTaxSpecialist();
    }
    return NewJerseyTaxSpecialist.instance;
  }

  public async analyzeRequest(request: TaxResearchRequest): Promise<{
    jurisdiction: string;
    domain: ResearchDomain;
    matchedCitations: string[];
    decouplings: string[];
    findings: string[];
    missingFacts: string[];
  }> {
    const q = request.question.toLowerCase();
    const matchedCitations: string[] = ['N.J. Stat. Ann. § 54A:2-1'];
    const decouplings: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];

    // Autonomous income definition & no cross-category offsetting
    if (q.includes('loss') || q.includes('offset') || q.includes('schedule c') || q.includes('business loss') || q.includes('category')) {
      matchedCitations.push('N.J. Stat. Ann. § 54A:5-1');
      decouplings.push('PROHIBITION_CROSS_CATEGORY_LOSS_OFFSET');
      findings.push('CRITICAL NEW JERSEY RULE (N.J.S.A. § 54A:5-1): New Jersey gross income is calculated across discrete statutory categories. Business losses (Schedule C or pass-through) CANNOT offset wage income, interest, or dividends. Each category must be zero or positive.');
    }

    if (q.includes('credit') || q.includes('ny tax') || q.includes('resident credit') || q.includes('double tax')) {
      matchedCitations.push('N.J. Stat. Ann. § 54A:4-1');
      findings.push('CREDIT FOR TAXES PAID TO OTHER JURISDICTIONS (Schedule NJ-COJ): New Jersey residents are eligible for a credit for taxes paid to other states (e.g. New York) on income earned therein, limited to the New Jersey tax attributable to that income.');
    }

    findings.push('New Jersey Gross Income Tax rates range from 1.40% to a top marginal bracket of 10.75% for income exceeding $1,000,000.');

    return {
      jurisdiction: 'US-NJ',
      domain: request.taxDomain,
      matchedCitations,
      decouplings,
      findings,
      missingFacts
    };
  }
}
