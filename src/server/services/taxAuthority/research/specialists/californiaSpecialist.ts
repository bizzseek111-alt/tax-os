/**
 * Autonomous Tax OS — California FTB Authority Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for California State Income & Franchise Tax.
 * Tracks explicit statutory decoupling from Federal IRC provisions.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class CaliforniaTaxSpecialist {
  private static instance: CaliforniaTaxSpecialist;

  private constructor() {}

  public static getInstance(): CaliforniaTaxSpecialist {
    if (!CaliforniaTaxSpecialist.instance) {
      CaliforniaTaxSpecialist.instance = new CaliforniaTaxSpecialist();
    }
    return CaliforniaTaxSpecialist.instance;
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
    const matchedCitations: string[] = ['Cal. Rev. & Tax. Code § 17041'];
    const decouplings: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];

    // Decoupling checks
    if (q.includes('199a') || q.includes('qbi') || q.includes('qualified business income')) {
      decouplings.push('DECOUPLED_FROM_IRC_199A');
      findings.push('CRITICAL DECOUPLING: California does NOT conform to 26 U.S.C. § 199A. The federal 20% Qualified Business Income deduction is completely disallowed on California Form 540 Schedule CA.');
    }

    if (q.includes('bonus depreciation') || q.includes('168(k)') || q.includes('168k')) {
      decouplings.push('DECOUPLED_FROM_IRC_168K_BONUS_DEPRECIATION');
      findings.push('CRITICAL DECOUPLING: California does NOT conform to federal bonus depreciation under IRC § 168(k). Standard MACRS or California depreciation methods must be computed on FTB Form 3885A.');
    }

    if (q.includes('residency') || q.includes('domicile') || q.includes('part-year') || q.includes('nonresident')) {
      matchedCitations.push('FTB Legal Ruling 2014-01');
      findings.push('California residency is determined under Cal. Rev. & Tax. Code § 17014 and FTB Legal Ruling 2014-01 by evaluating where the taxpayer has the closest connection (permanent abode, employment, family, bank accounts).');
      
      const daysInCa = request.confirmedFacts?.find(f => f.key === 'days_in_california' || f.key === 'daysInCa');
      if (!daysInCa) {
        missingFacts.push('Number of days physically present in California during the tax year.');
      }
    }

    findings.push('California imposes personal income tax with graduated brackets up to 12.3%, plus a mandatory 1.0% Mental Health Services Tax on taxable income exceeding $1,000,000 (effective top marginal rate of 13.3%).');

    return {
      jurisdiction: 'US-CA',
      domain: request.taxDomain,
      matchedCitations,
      decouplings,
      findings,
      missingFacts
    };
  }
}
