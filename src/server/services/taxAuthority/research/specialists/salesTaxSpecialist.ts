/**
 * Autonomous Tax OS — Sales & Use Tax Authority Specialist
 * 
 * Conducts authoritative statutory and regulatory analysis for Sales and Use Tax.
 * Covers Economic Nexus, Marketplace Facilitators, SaaS / Digital Good Taxability, Sourcing, and Exemptions.
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export class SalesTaxAuthoritySpecialist {
  private static instance: SalesTaxAuthoritySpecialist;

  private constructor() {}

  public static getInstance(): SalesTaxAuthoritySpecialist {
    if (!SalesTaxAuthoritySpecialist.instance) {
      SalesTaxAuthoritySpecialist.instance = new SalesTaxAuthoritySpecialist();
    }
    return SalesTaxAuthoritySpecialist.instance;
  }

  public async analyzeRequest(request: TaxResearchRequest): Promise<{
    jurisdiction: string;
    domain: ResearchDomain;
    matchedCitations: string[];
    findings: string[];
    nexusThresholdMet: boolean;
    missingFacts: string[];
  }> {
    const q = request.question.toLowerCase();
    const matchedCitations: string[] = ['South Dakota v. Wayfair, Inc., 138 S. Ct. 2080 (2018)'];
    const findings: string[] = [];
    const missingFacts: string[] = [];
    let nexusThresholdMet = false;

    const jur = request.jurisdiction || request.jurisdictions?.[0] || 'US-FED';

    // Economic nexus analysis per jurisdiction
    if (jur === 'US-CA') {
      matchedCitations.push('Cal. Rev. & Tax. Code § 6203');
      findings.push('CALIFORNIA ECONOMIC NEXUS: $500,000 threshold of gross sales of tangible personal property delivered in California during current or preceding calendar year (AB 147).');
    } else if (jur === 'US-NY') {
      matchedCitations.push('N.Y. Tax Law § 1101(b)(8)(iv)');
      findings.push('NEW YORK ECONOMIC NEXUS: Exceeding $500,000 in gross receipts AND 100 separate transactions delivered into New York during preceding 4 sales tax quarters.');
    } else if (jur === 'US-NJ') {
      matchedCitations.push('N.J. Stat. Ann. § 54:32B-3');
      findings.push('NEW JERSEY ECONOMIC NEXUS: Gross revenue exceeding $100,000 OR 200 separate transactions delivered into New Jersey in calendar year.');
    } else if (jur === 'US-IL') {
      matchedCitations.push('35 ILCS 120/2-12');
      findings.push('ILLINOIS ECONOMIC NEXUS: Exceeding $100,000 in gross receipts OR 200 transactions into Illinois under Leveling the Playing Field for Illinois Retail Act.');
    } else if (jur === 'US-MA') {
      matchedCitations.push('Mass. Gen. Laws ch. 64H, § 1');
      findings.push('MASSACHUSETTS ECONOMIC NEXUS: Exceeding $100,000 in Massachusetts sales in calendar year (transaction count requirement repealed).');
    }

    // SaaS and Digital Taxability
    if (q.includes('saas') || q.includes('software') || q.includes('cloud') || q.includes('digital goods')) {
      if (jur === 'US-NY') {
        findings.push('NEW YORK SAAS TAXABILITY: SaaS is treated as prewritten computer software transferred electronically and is SUBJECT TO SALES TAX under NY Tax Law § 1101(b)(6) and TSB-M-08(7)S.');
      } else if (jur === 'US-CA') {
        findings.push('CALIFORNIA SAAS TAXABILITY: Pure SaaS accessed remotely where no tangible media or software is transferred to customer possession is EXEMPT from California sales tax under 18 CCR § 1502.');
      } else if (jur === 'US-NJ') {
        findings.push('NEW JERSEY SAAS TAXABILITY: Pure cloud-hosted SaaS where customer does not take possession or download code is generally EXEMPT from NJ sales tax.');
      }
    }

    // Marketplace Facilitator Rules
    if (q.includes('marketplace') || q.includes('amazon') || q.includes('shopify') || q.includes('facilitator')) {
      findings.push('MARKETPLACE FACILITATOR RELIEF: Under state marketplace facilitator statutes, the marketplace facilitator is legally responsible for calculating, collecting, and remitting sales tax on third-party marketplace sales.');
    }

    return {
      jurisdiction: jur,
      domain: ResearchDomain.SALES_TAX,
      matchedCitations,
      findings,
      nexusThresholdMet,
      missingFacts
    };
  }
}
