/**
 * Autonomous Tax OS — Synthetic Test Universe (20 Gold-Standard Tax Cases)
 * Fully anonymized, zero real PII, comprehensive multi-state coverage.
 */

export interface SyntheticTaxCase {
  caseId: string;
  name: string;
  description: string;
  taxYear: number;
  jurisdictions: string[];
  filingStatus: 'SINGLE' | 'MFJ' | 'HOH';
  grossIncome: number;
  w2Wages?: number;
  scheduleCRevenue?: number;
  scheduleCExpenses?: number;
  stateAdjustments?: {
    jurisdiction: string;
    additions: number;
    subtractions: number;
    statutoryCitations: string[];
  };
  expectedQtF: number; // Questions to File
  expectedExceptionsCount: number;
  specialConditions: {
    hasDuplicateDocs?: boolean;
    hasCrossBorderConflict?: boolean;
    hasHomeOffice?: boolean;
    hasSection179Cap?: boolean;
    hasPensionsSubtraction?: boolean;
    hasFairShareSurtax?: boolean;
    hasMissingBasis?: boolean;
    hasPromptInjection?: boolean;
  };
}

export const SYNTHETIC_TAX_UNIVERSE: SyntheticTaxCase[] = [
  {
    caseId: 'TC-001',
    name: '001 W-2 Only',
    description: 'Single wage earner with simple W-2, standard deduction, no side income.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-IL'],
    filingStatus: 'SINGLE',
    grossIncome: 75000,
    w2Wages: 75000,
    expectedQtF: 0,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-002',
    name: '002 W-2 + Schedule C Side Business',
    description: 'Full-time employee ($90,000 W-2) with freelance software consulting ($28,000 1099-NEC).',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA'],
    filingStatus: 'SINGLE',
    grossIncome: 118000,
    w2Wages: 90000,
    scheduleCRevenue: 28000,
    scheduleCExpenses: 4200,
    stateAdjustments: {
      jurisdiction: 'US-CA',
      additions: 0,
      subtractions: 0,
      statutoryCitations: ['Cal. RTC § 17071']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-003',
    name: '003 1099 Freelancer Solo',
    description: 'Full-time freelance graphic designer with multiple 1099-NECs and Schedule C software/hardware.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-MA'],
    filingStatus: 'SINGLE',
    grossIncome: 95000,
    scheduleCRevenue: 95000,
    scheduleCExpenses: 18500,
    expectedQtF: 2,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-004',
    name: '004 Creator + 1099-K Digital Platforms',
    description: 'Digital streamer with YouTube, Patreon, and Stripe 1099-K payment settlement cards.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA'],
    filingStatus: 'SINGLE',
    grossIncome: 112000,
    scheduleCRevenue: 112000,
    scheduleCExpenses: 24000,
    expectedQtF: 2,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-005',
    name: '005 California Freelancer with HSA',
    description: 'CA resident sole proprietor with Federal HSA contribution triggering Cal. RTC § 17215.4 add-back.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA'],
    filingStatus: 'SINGLE',
    grossIncome: 140000,
    scheduleCRevenue: 140000,
    scheduleCExpenses: 22000,
    stateAdjustments: {
      jurisdiction: 'US-CA',
      additions: 4150,
      subtractions: 0,
      statutoryCitations: ['Cal. RTC § 17215.4', 'Cal. RTC § 17255']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-006',
    name: '006 NY Resident Statutory 183-Day',
    description: 'High-income consultant maintaining permanent place of abode in Manhattan with >183 days present.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NY'],
    filingStatus: 'SINGLE',
    grossIncome: 240000,
    scheduleCRevenue: 240000,
    scheduleCExpenses: 35000,
    stateAdjustments: {
      jurisdiction: 'US-NY',
      additions: 0,
      subtractions: 0,
      statutoryCitations: ['NY Tax Law § 605(b)(1)(B)']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-007',
    name: '007 NJ Resident / NY Remote Worker (Convenience Conflict)',
    description: 'Lives in NJ, telecommutes 50% for NYC firm. Clashes under 20 NYCRR § 131.18 vs NJSA 54A:4-1.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NY', 'US-NJ'],
    filingStatus: 'SINGLE',
    grossIncome: 165000,
    w2Wages: 165000,
    expectedQtF: 2,
    expectedExceptionsCount: 1,
    specialConditions: { hasCrossBorderConflict: true }
  },
  {
    caseId: 'TC-008',
    name: '008 Illinois Consultant with Pension',
    description: 'Semi-retired consultant in Chicago claiming 100% pension subtraction under 35 ILCS 5/203.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-IL'],
    filingStatus: 'MFJ',
    grossIncome: 130000,
    scheduleCRevenue: 50000,
    scheduleCExpenses: 8000,
    stateAdjustments: {
      jurisdiction: 'US-IL',
      additions: 0,
      subtractions: 45000,
      statutoryCitations: ['35 ILCS 5/203(a)(2)(F)']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: { hasPensionsSubtraction: true }
  },
  {
    caseId: 'TC-009',
    name: '009 Massachusetts High-Earner Fair Share Surtax',
    description: 'MA tech founder earning >$1.05M taxable income triggering 4% surtax under MGL c. 62 § 4(d).',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-MA'],
    filingStatus: 'SINGLE',
    grossIncome: 1250000,
    scheduleCRevenue: 1250000,
    scheduleCExpenses: 110000,
    stateAdjustments: {
      jurisdiction: 'US-MA',
      additions: 0,
      subtractions: 0,
      statutoryCitations: ['Mass. Gen. Laws ch. 62, § 4(d)']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: { hasFairShareSurtax: true }
  },
  {
    caseId: 'TC-010',
    name: '010 Part-Year Residency (Moved CA to NY)',
    description: 'Relocated domicile from San Francisco to Brooklyn on July 1, 2026. Split dual-state allocation.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA', 'US-NY'],
    filingStatus: 'SINGLE',
    grossIncome: 180000,
    w2Wages: 180000,
    expectedQtF: 2,
    expectedExceptionsCount: 1,
    specialConditions: { hasCrossBorderConflict: true }
  },
  {
    caseId: 'TC-011',
    name: '011 Duplicate Stripe / 1099-K / Bank Deposit Collision',
    description: 'E-commerce merchant with Stripe 1099-K + raw bank deposits. Must eliminate $48,000 double-count.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-IL'],
    filingStatus: 'SINGLE',
    grossIncome: 92000,
    scheduleCRevenue: 92000,
    scheduleCExpenses: 14000,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: { hasDuplicateDocs: true }
  },
  {
    caseId: 'TC-012',
    name: '012 Missing Brokerage 1099-B Form',
    description: 'Outbound crypto/brokerage transfers detected without corresponding 1099-B basis reporting.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA'],
    filingStatus: 'SINGLE',
    grossIncome: 88000,
    scheduleCRevenue: 88000,
    scheduleCExpenses: 11000,
    expectedQtF: 1,
    expectedExceptionsCount: 1,
    specialConditions: { hasMissingBasis: true }
  },
  {
    caseId: 'TC-013',
    name: '013 Ambiguous Travel vs Meals Disallowance',
    description: 'Client trip combining airfare with $1,420 restaurants. 50% statutory disallowance under IRC § 274.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NY'],
    filingStatus: 'SINGLE',
    grossIncome: 105000,
    scheduleCRevenue: 105000,
    scheduleCExpenses: 16000,
    expectedQtF: 1,
    expectedExceptionsCount: 1,
    specialConditions: {}
  },
  {
    caseId: 'TC-014',
    name: '014 Dedicated Home Office Uncertainty',
    description: 'Consultant claiming dedicated room under IRC § 280A. Evaluating Simplified ($5/sq ft) vs Actual.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NJ'],
    filingStatus: 'SINGLE',
    grossIncome: 82000,
    scheduleCRevenue: 82000,
    scheduleCExpenses: 9500,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: { hasHomeOffice: true }
  },
  {
    caseId: 'TC-015',
    name: '015 Asset Purchase (Section 179 CA $25k Cap)',
    description: 'Purchased $65,000 enterprise server rack. Federal allows 100% § 179; CA caps at $25,000.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA'],
    filingStatus: 'SINGLE',
    grossIncome: 210000,
    scheduleCRevenue: 210000,
    scheduleCExpenses: 85000,
    stateAdjustments: {
      jurisdiction: 'US-CA',
      additions: 40000, // $65,000 - $25,000 cap = $40,000 addition
      subtractions: 0,
      statutoryCitations: ['Cal. RTC § 17255']
    },
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: { hasSection179Cap: true }
  },
  {
    caseId: 'TC-016',
    name: '016 Business Mileage Log Substantiation',
    description: 'Independent app developer logging 8,400 business miles at standard mileage rate ($0.67/mi).',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-MA'],
    filingStatus: 'SINGLE',
    grossIncome: 78000,
    scheduleCRevenue: 78000,
    scheduleCExpenses: 12500,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-017',
    name: '017 Charitable Contribution Cash & Stock',
    description: 'High-income taxpayer donating $15,000 appreciated stock. Evaluates Schedule A vs standard deduction.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-IL'],
    filingStatus: 'SINGLE',
    grossIncome: 195000,
    w2Wages: 195000,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-018',
    name: '018 Investment Cost Basis Wash Sale',
    description: 'Robinhood 1099-B reporting wash sale disallowed loss under IRC § 1091 added back to basis.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NY'],
    filingStatus: 'SINGLE',
    grossIncome: 145000,
    w2Wages: 145000,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-019',
    name: '019 Conflicting W-2 vs State Wage Box Mismatch',
    description: 'Box 1 Federal wages differs from Box 16 State wages due to pre-tax retirement non-conformity.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-NJ'],
    filingStatus: 'SINGLE',
    grossIncome: 115000,
    w2Wages: 115000,
    expectedQtF: 1,
    expectedExceptionsCount: 0,
    specialConditions: {}
  },
  {
    caseId: 'TC-020',
    name: '020 Multi-State Federal / State Non-Conformity Master',
    description: 'Complex multi-jurisdictional freelancer operating across CA, NY, and Federal with HSA + QBI.',
    taxYear: 2026,
    jurisdictions: ['US-FED', 'US-CA', 'US-NY'],
    filingStatus: 'SINGLE',
    grossIncome: 220000,
    scheduleCRevenue: 220000,
    scheduleCExpenses: 38000,
    stateAdjustments: {
      jurisdiction: 'US-CA',
      additions: 4150,
      subtractions: 0,
      statutoryCitations: ['Cal. RTC § 17215.4', '20 NYCRR § 131.18']
    },
    expectedQtF: 2,
    expectedExceptionsCount: 1,
    specialConditions: { hasCrossBorderConflict: true }
  }
];
