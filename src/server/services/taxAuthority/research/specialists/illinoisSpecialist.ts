/**
 * Autonomous Tax OS — Illinois Department of Revenue Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for Illinois State Income Tax.
 * Covers 35 ILCS 5 (Illinois Income Tax Act), flat tax rate, and retirement income exemption.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class IllinoisTaxSpecialist {
  private static instance: IllinoisTaxSpecialist;

  private constructor() {}

  public static getInstance(): IllinoisTaxSpecialist {
    if (!IllinoisTaxSpecialist.instance) {
      IllinoisTaxSpecialist.instance = new IllinoisTaxSpecialist();
    }
    return IllinoisTaxSpecialist.instance;
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
    const matchedCitations: string[] = ['35 ILCS 5/201'];
    const decouplings: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];

    if (q.includes('retirement') || q.includes('pension') || q.includes('social security') || q.includes('401k') || q.includes('ira')) {
      matchedCitations.push('35 ILCS 5/203');
      findings.push('ILLINOIS RETIREMENT SUBTRACTION (35 ILCS 5/203): Illinois exempts 100% of qualified employee benefit plans, retirement plans (401(k), IRA distributions), state/federal pensions, and Social Security benefits from state income taxation via Schedule M.');
    }

    if (q.includes('replacement tax') || q.includes('s corp') || q.includes('partnership') || q.includes('pass-through')) {
      matchedCitations.push('35 ILCS 5/201(c)');
      findings.push('ILLINOIS PERSONAL PROPERTY REPLACEMENT TAX: In addition to individual owner income tax, partnerships, S-corporations, and trusts are subject to a 1.5% replacement tax on net income.');
    }

    findings.push('Illinois imposes a flat individual income tax rate of 4.95% on net taxable income.');

    return {
      jurisdiction: 'US-IL',
      domain: request.taxDomain,
      matchedCitations,
      decouplings,
      findings,
      missingFacts
    };
  }
}
