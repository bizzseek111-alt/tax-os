/**
 * Autonomous Tax OS — New York DTF Authority Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for New York State and NYC Income Tax.
 * Covers N.Y. Tax Law Article 22, Convenience of the Employer rule (20 NYCRR § 132.18), and NYC local tax.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class NewYorkTaxSpecialist {
  private static instance: NewYorkTaxSpecialist;

  private constructor() {}

  public static getInstance(): NewYorkTaxSpecialist {
    if (!NewYorkTaxSpecialist.instance) {
      NewYorkTaxSpecialist.instance = new NewYorkTaxSpecialist();
    }
    return NewYorkTaxSpecialist.instance;
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
    const matchedCitations: string[] = ['N.Y. Tax Law § 601'];
    const decouplings: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];

    // Convenience of the Employer Rule
    if (q.includes('remote') || q.includes('telecommute') || q.includes('convenience') || q.includes('work from home')) {
      matchedCitations.push('20 NYCRR § 132.18(a)', 'TSB-M-06(5)I');
      findings.push('CONVENIENCE OF THE EMPLOYER RULE (20 NYCRR § 132.18(a)): If an employee whose primary office is in New York works remotely from another state for their own convenience, all telecommuting days are treated as New York source days unless the out-of-state home office meets the strict bona fide employer office test.');
      
      const employerOfficeInNy = request.confirmedFacts?.find(f => f.key === 'employer_ny_assigned' || f.key === 'employerInNy');
      const bonaFideOffice = request.confirmedFacts?.find(f => f.key === 'bona_fide_out_of_state_office');

      if (!employerOfficeInNy) {
        missingFacts.push('Is the employer official assigned office or base of operations located in New York?');
      }
      if (!bonaFideOffice) {
        missingFacts.push('Does the telecommuting arrangement meet New York DTF criteria for a bona fide employer necessity out-of-state office?');
      }
    }

    if (q.includes('199a') || q.includes('qbi')) {
      decouplings.push('DECOUPLED_FROM_IRC_199A');
      findings.push('CRITICAL DECOUPLING: New York does NOT conform to federal 26 U.S.C. § 199A Qualified Business Income deduction.');
    }

    findings.push('New York State imposes graduated individual income tax brackets up to 10.9% on taxable income over $25,000,000. New York City imposes a separate resident income tax up to 3.876%.');

    return {
      jurisdiction: 'US-NY',
      domain: request.taxDomain,
      matchedCitations,
      decouplings,
      findings,
      missingFacts
    };
  }
}
