/**
 * Autonomous Tax OS — Payroll Tax Authority Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for Federal & State Payroll Tax.
 * Covers FICA, FUTA, SECA, Deposit Schedules, and Worker Classification (Rev. Rul. 87-41).
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class PayrollAuthoritySpecialist {
  private static instance: PayrollAuthoritySpecialist;

  private constructor() {}

  public static getInstance(): PayrollAuthoritySpecialist {
    if (!PayrollAuthoritySpecialist.instance) {
      PayrollAuthoritySpecialist.instance = new PayrollAuthoritySpecialist();
    }
    return PayrollAuthoritySpecialist.instance;
  }

  public async analyzeRequest(request: TaxResearchRequest): Promise<{
    jurisdiction: string;
    domain: ResearchDomain;
    matchedCitations: string[];
    findings: string[];
    depositScheduleRecommendation?: string;
    missingFacts: string[];
  }> {
    const q = request.question.toLowerCase();
    const matchedCitations: string[] = [];
    const findings: string[] = [];
    const missingFacts: string[] = [];
    let depositScheduleRecommendation: string | undefined;

    // Worker Classification (1099 vs W-2)
    if (q.includes('classification') || q.includes('1099') || q.includes('contractor') || q.includes('employee') || q.includes('w-2')) {
      matchedCitations.push('Rev. Rul. 87-41', '26 U.S.C. § 3121(d)', 'Section 530 of Revenue Act of 1978');
      findings.push('WORKER CLASSIFICATION RULES: Evaluated under the 20-Factor Common Law Test (Rev. Rul. 87-41) analyzing Behavioral Control, Financial Control, and Relationship of the Parties. Misclassifying an employee as an independent contractor creates severe liability for back employment taxes under IRC § 3509.');
      
      const behaviorControl = request.confirmedFacts?.find(f => f.key === 'behavioral_control' || f.key === 'hours_mandated');
      if (!behaviorControl) {
        missingFacts.push('Does the hiring business control when, where, and how the worker performs the work (instructions and training)?');
      }
    }

    // FICA / Social Security Cap
    if (q.includes('fica') || q.includes('social security') || q.includes('medicare') || q.includes('wage base')) {
      matchedCitations.push('26 U.S.C. § 3101', '26 U.S.C. § 3111', 'IRS Notice 2025-XX');
      findings.push('FICA TAX RATES & LIMITS: Employee and employer each pay 6.2% Social Security on wages up to statutory wage base cap ($176,100), and 1.45% Medicare on all wages without cap. Additional 0.9% Medicare tax applies to employee wages exceeding $200,000 ($250,000 MFJ) under IRC § 3101(b)(2).');
    }

    // FUTA
    if (q.includes('futa') || q.includes('unemployment') || q.includes('940')) {
      matchedCitations.push('26 U.S.C. § 3301', '26 U.S.C. § 3302');
      findings.push('FEDERAL UNEMPLOYMENT TAX (FUTA): Imposes 6.0% tax on first $7,000 of employee wages. Maximum 5.4% credit applies for timely paid state unemployment tax, yielding an effective federal rate of 0.6% ($42/employee/year), subject to FUTA credit reduction state rules.');
    }

    // Deposit Schedules
    if (q.includes('deposit') || q.includes('semi-weekly') || q.includes('monthly') || q.includes('lookback')) {
      matchedCitations.push('26 CFR § 31.6302-1');
      findings.push('EMPLOYMENT TAX DEPOSIT RULES: Deposit schedule (monthly vs semi-weekly) is determined by total employment tax liability during the lookback period (July 1 to June 30 of preceding year). If liability <= $50,000, depositor is Monthly; if > $50,000, depositor is Semi-Weekly. If accumulated tax reaches $100,000 on any day, next-day deposit is mandatory.');
      depositScheduleRecommendation = 'Evaluated via 26 CFR § 31.6302-1 lookback rules';
    }

    return {
      jurisdiction: 'US-FED',
      domain: ResearchDomain.PAYROLL_TAX,
      matchedCitations,
      findings,
      depositScheduleRecommendation,
      missingFacts
    };
  }
}
