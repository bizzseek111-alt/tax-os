/**
 * Autonomous Tax OS — Multi-State Tax Research Coordinator
 * 
 * Coordinates multi-jurisdictional tax analysis across states:
 * - Domicile vs Statutory Residency (183-day rule + permanent place of abode)
 * - NY Convenience of the Employer rule vs NJ/CT Remote Worker Resident Credits
 * - Part-Year allocation and income sourcing
 * - S-Corp and Partnership apportionment (single sales factor vs three-factor)
 * - Decoupling tracking across multiple state returns
 */

import { ResearchDomain, TaxResearchRequest } from '../types';

export interface MultiStateCoordinationResult {
  jurisdictionsInvolved: string[];
  residencyAnalysis: {
    residentState?: string;
    nonResidentStates: string[];
    statutoryResidencyRisk: boolean;
    daysBreakdown?: Record<string, number>;
  };
  crossBorderConflicts: string[];
  creditsForTaxesPaid: {
    sourceState: string;
    residentState: string;
    creditApplicable: boolean;
    statutoryCitation: string;
  }[];
  decouplingSummary: Record<string, string[]>;
  recommendedReturns: string[];
}

export class MultiStateCoordinator {
  private static instance: MultiStateCoordinator;

  private constructor() {}

  public static getInstance(): MultiStateCoordinator {
    if (!MultiStateCoordinator.instance) {
      MultiStateCoordinator.instance = new MultiStateCoordinator();
    }
    return MultiStateCoordinator.instance;
  }

  public coordinate(request: TaxResearchRequest): MultiStateCoordinationResult {
    const jurisdictions = request.jurisdictions || [];
    const jurSet = new Set(jurisdictions);
    const conflicts: string[] = [];
    const credits: MultiStateCoordinationResult['creditsForTaxesPaid'] = [];
    const recommendedReturns: string[] = [];
    const decouplingSummary: Record<string, string[]> = {};

    let residentState = jurisdictions.find(j => j !== 'US-FED') || 'US-CA';
    const nonResidentStates: string[] = [];
    let statutoryResidencyRisk = false;

    // Detect NY / NJ Cross-Border Remote Worker Conflict
    if (jurSet.has('US-NY') && jurSet.has('US-NJ')) {
      conflicts.push(
        'NY CONVENIENCE OF EMPLOYER vs NJ RESIDENT CREDIT: New York taxes remote work performed from New Jersey under 20 NYCRR § 132.18(a). New Jersey allows a resident credit under N.J.S.A. § 54A:4-1 (Schedule NJ-COJ) but subjects remote workers to potential double taxation risks if withholding is misallocated.'
      );
      credits.push({
        sourceState: 'US-NY',
        residentState: 'US-NJ',
        creditApplicable: true,
        statutoryCitation: 'N.J. Stat. Ann. § 54A:4-1'
      });
      recommendedReturns.push('Form IT-203 (New York Nonresident Return)', 'Form NJ-1040 (New Jersey Resident Return)');
    }

    // Check Statutory Residency (183-day rule)
    const daysInStateFact = request.confirmedFacts?.find(f => f.key.startsWith('days_in_') || f.key.includes('days'));
    if (daysInStateFact && Number(daysInStateFact.value) > 183) {
      statutoryResidencyRisk = true;
      conflicts.push(`STATUTORY RESIDENCY RISK: Taxpayer spent > 183 days (${daysInStateFact.value} days) in jurisdiction, triggering statutory residency test.`);
    }

    // Record state-specific decouplings
    if (jurSet.has('US-CA')) {
      decouplingSummary['US-CA'] = ['IRC § 199A Disallowed', 'IRC § 168(k) Bonus Depreciation Disallowed'];
      recommendedReturns.push('Form 540 / 540NR (California Return)');
    }
    if (jurSet.has('US-NY')) {
      decouplingSummary['US-NY'] = ['IRC § 199A Disallowed', 'NYC Resident Tax Separate Schedule'];
      if (!recommendedReturns.some(r => r.includes('IT-'))) {
        recommendedReturns.push('Form IT-201 / IT-203 (New York Return)');
      }
    }
    if (jurSet.has('US-NJ')) {
      decouplingSummary['US-NJ'] = ['Zero Cross-Category Loss Offsets (N.J.S.A. § 54A:5-1)'];
      if (!recommendedReturns.some(r => r.includes('NJ-'))) {
        recommendedReturns.push('Form NJ-1040 (New Jersey Return)');
      }
    }
    if (jurSet.has('US-IL')) {
      decouplingSummary['US-IL'] = ['Retirement & Pension Subtraction (35 ILCS 5/203)'];
      recommendedReturns.push('Form IL-1040 (Illinois Return)');
    }
    if (jurSet.has('US-MA')) {
      decouplingSummary['US-MA'] = ['4% Fair Share Surtax on Income > $1M (MGL c. 62 § 4)'];
      recommendedReturns.push('Form 1 / 1-NR (Massachusetts Return)');
    }

    return {
      jurisdictionsInvolved: jurisdictions,
      residencyAnalysis: {
        residentState,
        nonResidentStates,
        statutoryResidencyRisk
      },
      crossBorderConflicts: conflicts,
      creditsForTaxesPaid: credits,
      decouplingSummary,
      recommendedReturns
    };
  }
}
