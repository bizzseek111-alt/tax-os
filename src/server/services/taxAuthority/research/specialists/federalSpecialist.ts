/**
 * Autonomous Tax OS — Federal Tax Authority Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for Federal Individual & Corporate Income Tax.
 * Covers IRC Title 26, Treasury Regulations (26 CFR), and IRS Official Bulletins.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';
import { OfficialConnectorRegistry } from '../connectors/connectorRegistry';
import { FederalIrsAuthorityConnector } from '../connectors/federalConnector';

export interface SpecialistAnalysisResult {
  jurisdiction: string;
  domain: ResearchDomain;
  matchedCitations: string[];
  findings: string[];
  requiredFacts: string[];
  missingFacts: string[];
  taxpayerPositionsSupported: boolean;
  notes: string[];
}

export class FederalTaxSpecialist {
  private static instance: FederalTaxSpecialist;
  private connector: FederalIrsAuthorityConnector;

  private constructor() {
    const registry = OfficialConnectorRegistry.getInstance();
    this.connector = registry.getConnector('US-FED') as FederalIrsAuthorityConnector;
  }

  public static getInstance(): FederalTaxSpecialist {
    if (!FederalTaxSpecialist.instance) {
      FederalTaxSpecialist.instance = new FederalTaxSpecialist();
    }
    return FederalTaxSpecialist.instance;
  }

  public async analyzeRequest(request: TaxResearchRequest): Promise<SpecialistAnalysisResult> {
    const q = request.question.toLowerCase();
    const matchedCitations: string[] = [];
    const findings: string[] = [];
    const requiredFacts: string[] = [];
    const missingFacts: string[] = [];
    const notes: string[] = [];

    // Analyze topics based on question and facts
    if (q.includes('home office') || q.includes('280a') || q.includes('principal place of business')) {
      matchedCitations.push('26 U.S.C. § 280A');
      requiredFacts.push('exclusive_business_use', 'regular_business_basis');
      
      const hasExclusive = request.confirmedFacts?.find(f => f.key === 'exclusive_business_use' || f.key === 'exclusiveUse');
      const hasRegular = request.confirmedFacts?.find(f => f.key === 'regular_business_basis' || f.key === 'regularUse');

      if (!hasExclusive) {
        missingFacts.push('Is the home office space used strictly and EXCLUSIVELY for trade or business purposes?');
      }
      if (!hasRegular) {
        missingFacts.push('Is the home office space used on a regular, continuous basis as the principal place of business?');
      }

      if (hasExclusive && hasExclusive.value === false) {
        findings.push('Home office deduction is DISALLOWED under 26 U.S.C. § 280A(c)(1) due to failure of exclusive business use test.');
      } else if (hasExclusive && hasExclusive.value === true) {
        findings.push('Qualifies for home office deduction under 26 U.S.C. § 280A(c)(1). Eligible for either simplified square footage method ($5/sq ft up to $1,500) or actual itemized expense allocation.');
      }
    }

    if (q.includes('qbi') || q.includes('qualified business income') || q.includes('199a') || q.includes('section 199a')) {
      matchedCitations.push('26 U.S.C. § 199A');
      requiredFacts.push('qualified_trade_or_business', 'sstb_status', 'taxpayer_taxable_income');

      const sstb = request.confirmedFacts?.find(f => f.key === 'sstb_status' || f.key === 'is_sstb');
      const taxableIncome = request.confirmedFacts?.find(f => f.key === 'taxable_income' || f.key === 'taxpayer_taxable_income');

      if (!taxableIncome) {
        missingFacts.push('Taxpayer total taxable income is required to determine IRC § 199A statutory phase-in / phase-out limits.');
      }
      if (!sstb) {
        missingFacts.push('Specified Service Trade or Business (SSTB) status is required under IRC § 199A(d)(2).');
      }

      findings.push('Under 26 U.S.C. § 199A, eligible taxpayers may deduct up to 20% of qualified business income from domestic sole proprietorships, partnerships, or S-corporations subject to wage and capital limitations.');
    }

    if (q.includes('business expense') || q.includes('ordinary and necessary') || q.includes('162') || q.includes('deduction')) {
      if (!matchedCitations.includes('26 U.S.C. § 162')) {
        matchedCitations.push('26 U.S.C. § 162');
        findings.push('Deductions for trade or business expenses require that expenditures be ordinary and necessary under 26 U.S.C. § 162(a) and substantiated.');
      }
    }

    if (q.includes('self-employment') || q.includes('se tax') || q.includes('1401')) {
      matchedCitations.push('26 U.S.C. § 1401');
      findings.push('Self-employment tax of 15.3% applies to net earnings from self-employment over $400 under 26 U.S.C. § 1401, with one-half deductible under § 164(f).');
    }

    if (matchedCitations.length === 0) {
      // Default standard federal income tax authority
      matchedCitations.push('26 U.S.C. § 1', '26 U.S.C. § 63');
      findings.push('Federal income tax computation adheres to standard progressive statutory brackets under 26 U.S.C. § 1.');
    }

    return {
      jurisdiction: 'US-FED',
      domain: request.taxDomain,
      matchedCitations,
      findings,
      requiredFacts,
      missingFacts,
      taxpayerPositionsSupported: missingFacts.length === 0,
      notes
    };
  }
}
