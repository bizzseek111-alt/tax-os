/**
 * Autonomous Tax OS — Massachusetts Department of Revenue Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for Massachusetts State Income Tax.
 * Covers M.G.L. c. 62, 5.0% Part B rate, and 4.0% Fair Share Millionaires Surtax.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class MassachusettsTaxSpecialist {
  private static instance: MassachusettsTaxSpecialist;

  private constructor() {}

  public static getInstance(): MassachusettsTaxSpecialist {
    if (!MassachusettsTaxSpecialist.instance) {
      MassachusettsTaxSpecialist.instance = new MassachusettsTaxSpecialist();
    }
    return MassachusettsTaxSpecialist.instance;
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
    const matchedCitations: string[] = ['Mass. Gen. Laws ch. 62, § 4'];
    const decouplings: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];

    if (q.includes('millionaire') || q.includes('surtax') || q.includes('fair share') || q.includes('high income')) {
      findings.push('MASSACHUSETTS 4% FAIR SHARE SURTAX: Imposed on taxable income exceeding $1,000,000 (statutorily indexed for inflation). Taxpayers with over $1,000,000 in income pay 5.0% baseline + 4.0% surtax = 9.0% combined state tax rate.');
    }

    if (q.includes('capital gain') || q.includes('part a') || q.includes('short term')) {
      matchedCitations.push('Mass. Gen. Laws ch. 62, § 2');
      findings.push('Massachusetts classifies income into Part A (interest, dividends, short-term capital gains taxed at 8.5%), Part B (earned income taxed at 5.0%), and Part C (long-term capital gains taxed at 5.0%).');
    }

    findings.push('Massachusetts imposes a flat 5.0% individual income tax on Part B income, plus a 4.0% surtax on income over $1,000,000.');

    return {
      jurisdiction: 'US-MA',
      domain: request.taxDomain,
      matchedCitations,
      decouplings,
      findings,
      missingFacts
    };
  }
}
