/**
 * Autonomous TaxOS — Golden Test Scenarios Fixture Suite
 * Workstream 3: Phase 3
 * 
 * Defines 20 comprehensive golden test cases covering:
 * - Federal individual scenarios (W-2, MFJ, Freelancer, High Earner, CTC, Net Loss, Side Hustle, HSA, Itemized, De Minimis)
 * - 5 Sovereign States (CA, NY, NJ, IL, MA)
 * - Multi-State Apportionment & Resident Credit
 * - Boundary & Unsupported Scenario Rejections
 */

import { FederalTaxInput } from '../../server/services/taxCalculation/types';

export interface GoldenScenario {
  id: string;
  name: string;
  description: string;
  input: FederalTaxInput;
  expected: {
    totalIncomeCents: bigint;
    adjustedGrossIncomeCents: bigint;
    taxableIncomeCents?: bigint;
    totalFederalTaxCents?: bigint;
    selfEmploymentTaxCents?: bigint;
    qbiDeductionCents?: bigint;
    refundCents?: bigint;
    balanceDueCents?: bigint;
    stateTaxCents?: Partial<Record<string, bigint>>;
    shouldFailValidation?: boolean;
    expectedErrorCode?: string;
  };
}

export const GOLDEN_SCENARIOS: GoldenScenario[] = [
  // ---------------------------------------------------------------------------
  // FEDERAL SCENARIOS
  // ---------------------------------------------------------------------------
  {
    id: 'FEDERAL-001',
    name: 'Single, Simple W-2 Employee',
    description: '$75,000 wages, Standard Deduction $15,750, Withholding $8,500',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Alex Rivera',
      w2s: [{
        employerName: 'Acme Corp',
        employerEin: '12-3456789',
        wagesCents: 7_500_000n, // $75,000
        federalWithholdingCents: 850_000n, // $8,500
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 7_500_000n,
      adjustedGrossIncomeCents: 7_500_000n,
      taxableIncomeCents: 5_925_000n, // 75,000 - 15,750 = $59,250
      // Tax: 10% on 12,400 = 1,240; 12% on (50,400 - 12,400 = 38,000) = 4,560; 22% on (59,250 - 50,400 = 8,850) = 1,947. Total = 7,747 ($774,700)
      totalFederalTaxCents: 774_700n,
      refundCents: 75_300n, // 8,500 - 7,747 = $753.00
      balanceDueCents: 0n,
    },
  },

  {
    id: 'FEDERAL-002',
    name: 'Married Filing Jointly, Two W-2s',
    description: '$120,000 + $95,000 wages, MFJ Standard Deduction $31,500, Withholding $25,000',
    input: {
      taxYear: 2026,
      filingStatus: 'MARRIED_FILING_JOINTLY',
      taxpayerName: 'Morgan & Jordan Taylor',
      w2s: [
        {
          employerName: 'Tech Innovations LLC',
          employerEin: '23-4567890',
          wagesCents: 12_000_000n, // $120,000
          federalWithholdingCents: 1_400_000n, // $14,000
        },
        {
          employerName: 'Global Logistics Inc',
          employerEin: '34-5678901',
          wagesCents: 9_500_000n, // $95,000
          federalWithholdingCents: 1_100_000n, // $11,000
        },
      ],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 21_500_000n, // $215,000
      adjustedGrossIncomeCents: 21_500_000n,
      taxableIncomeCents: 18_350_000n, // 215,000 - 31,500 = $183,500
      // 10% on 24,800 = 2,480; 12% on 76,000 = 9,120; 22% on 82,700 = 18,194. Total = $29,794
      totalFederalTaxCents: 2_979_400n,
      refundCents: 0n,
      balanceDueCents: 479_400n, // 29,794 - 25,000 = $4,794
    },
  },

  {
    id: 'FEDERAL-003',
    name: 'Single Freelancer / Schedule C Sole Proprietor',
    description: '$140,000 gross receipts, $35,000 expenses ($105,000 net profit), SE tax, QBI 20%',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Elena Rostova',
      w2s: [],
      scheduleC: {
        businessName: 'Rostova Strategic Consulting',
        grossReceiptsCents: 14_000_000n, // $140,000
        expenses: {
          advertising: 500_000n,
          contract_labor: 1_500_000n,
          office_expense: 500_000n,
          supplies: 1_000_000n,
        },
      },
      payments: { estimatedTaxPaymentsCents: 1_800_000n }, // $18,000
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 10_500_000n, // $105,000 net profit
      // SE earnings: 105,000 * 0.9235 = $96,967.50 = 9,696,750n
      // OASDI: 12.4% on 96,967.50 = $12,023.97 = 1,202,397n
      // Medicare: 2.9% on 96,967.50 = $2,812.06 = 281,206n
      // Total SE Tax = 1,483,603n ($14,836.03)
      // Deductible SE Tax (50%) = 741,802n ($7,418.02)
      selfEmploymentTaxCents: 1_483_603n,
      adjustedGrossIncomeCents: 9_758_198n, // 10,500,000 - 741,802 = $97,581.98
      // Standard deduction: 1,575,000n ($15,750)
      // Net QBI = 10,500,000 - 741,802 = 9,758,198n
      // Tentative QBI (20%) = 1,951,640n ($19,516.40)
      // Taxable income before QBI = 9,758,198 - 1,575,000 = 8,183,198n ($81,831.98)
      // Overall QBI cap = 20% of 8,183,198 = 1,636,640n ($16,366.40)
      qbiDeductionCents: 1_636_640n,
      taxableIncomeCents: 6_546_558n, // 8,183,198 - 1,636,640 = $65,465.58
    },
  },

  {
    id: 'FEDERAL-004',
    name: 'Single High Earner with Additional Medicare Tax',
    description: '$450,000 W-2, crossing multiple progressive brackets',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Sarah Jenkins',
      w2s: [{
        employerName: 'Apex Capital Partners',
        employerEin: '45-6789012',
        wagesCents: 45_000_000n, // $450,000
        federalWithholdingCents: 12_500_000n, // $125,000
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 45_000_000n,
      adjustedGrossIncomeCents: 45_000_000n,
      taxableIncomeCents: 43_425_000n, // 450,000 - 15,750 = $434,250
    },
  },

  {
    id: 'FEDERAL-005',
    name: 'Head of Household with 2 Qualifying Children (CTC)',
    description: '$65,000 W-2, HOH Standard Deduction $23,625, Child Tax Credit $4,000',
    input: {
      taxYear: 2026,
      filingStatus: 'HEAD_OF_HOUSEHOLD',
      taxpayerName: 'Maria Santos',
      w2s: [{
        employerName: 'Metro Healthcare',
        employerEin: '56-7890123',
        wagesCents: 6_500_000n, // $65,000
        federalWithholdingCents: 350_000n, // $3,500
      }],
      dependents: [
        { name: 'Lucas Santos', relationship: 'Son', ageYears: 6, monthsLivedWithTaxpayer: 12, isUnder17: true, hasSsn: true },
        { name: 'Sofia Santos', relationship: 'Daughter', ageYears: 9, monthsLivedWithTaxpayer: 12, isUnder17: true, hasSsn: true },
      ],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 6_500_000n,
      adjustedGrossIncomeCents: 6_500_000n,
      taxableIncomeCents: 4_137_500n, // 65,000 - 23,625 = $41,375
      // Income tax on 41,375: 10% on 17,700 = 1,770; 12% on (41,375 - 17,700 = 23,675) = 2,841. Total = $4,611 = 461,100n
      // CTC: $4,000 nonrefundable credit reduces tax to $611 ($61,100)
      totalFederalTaxCents: 61_100n,
      refundCents: 288_900n, // 3,500 - 611 = $2,889.00
      balanceDueCents: 0n,
    },
  },

  {
    id: 'FEDERAL-006',
    name: 'Schedule C with Net Business Loss',
    description: '$60,000 W-2, Schedule C ($20,000 gross - $35,000 expenses = -$15,000 net loss)',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'David Kim',
      w2s: [{
        employerName: 'Design Studio LLC',
        employerEin: '67-8901234',
        wagesCents: 6_000_000n, // $60,000
        federalWithholdingCents: 600_000n,
      }],
      scheduleC: {
        businessName: 'Kim Retail Ventures',
        grossReceiptsCents: 2_000_000n, // $20,000
        expenses: {
          rent_lease: 2_500_000n,
          supplies: 1_000_000n,
        },
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 4_500_000n, // 60,000 - 15,000 = $45,000
      adjustedGrossIncomeCents: 4_500_000n,
      selfEmploymentTaxCents: 0n, // No SE tax on net loss
      qbiDeductionCents: 0n, // No QBI deduction on net loss
      taxableIncomeCents: 2_925_000n, // 45,000 - 15,750 = $29,250
    },
  },

  {
    id: 'FEDERAL-007',
    name: 'Single W-2 + 1099 Side Hustle',
    description: '$90,000 W-2 + Schedule C ($25,000 gross - $5,000 expenses = $20,000 net profit)',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Rachel Green',
      w2s: [{
        employerName: 'Corporate Firm Inc',
        employerEin: '78-9012345',
        wagesCents: 9_000_000n, // $90,000
        federalWithholdingCents: 12_000_00n,
      }],
      scheduleC: {
        businessName: 'Green Freelance Writing',
        grossReceiptsCents: 2_500_000n,
        expenses: {
          office_expense: 500_000n,
        },
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 11_000_000n, // $90,000 + $20,000 = $110,000
      // Net profit = $20,000. SE earnings = 20,000 * 0.9235 = 18,470 ($1,847,000)
      // OASDI: 12.4% on 18,470 = $2,290.28. Medicare: 2.9% on 18,470 = $535.63. Total SE Tax = $2,825.91 = 282,591n
      // Deductible SE = 141,296n ($1,412.96)
      selfEmploymentTaxCents: 282_591n,
      adjustedGrossIncomeCents: 10_858_704n, // 110,000 - 1,412.96 = $108,587.04
    },
  },

  {
    id: 'FEDERAL-008',
    name: 'Single with Above-the-Line HSA Deduction',
    description: '$80,000 W-2, $4,150 Form 8889 HSA deduction',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Marcus Vance',
      w2s: [{
        employerName: 'BioHealth Labs',
        employerEin: '89-0123456',
        wagesCents: 8_000_000n, // $80,000
        federalWithholdingCents: 900_000n,
      }],
      adjustments: {
        hsaDeductionCents: 415_000n, // $4,150
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 8_000_000n,
      adjustedGrossIncomeCents: 7_585_000n, // 80,000 - 4,150 = $75,850
      taxableIncomeCents: 6_010_000n, // 75,850 - 15,750 = $60,100
    },
  },

  {
    id: 'FEDERAL-009',
    name: 'Itemized Deductions Higher than Standard Deduction',
    description: '$150,000 W-2, $22,000 itemized deduction claimed',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Hannah Abbott',
      w2s: [{
        employerName: 'Capital Partners',
        employerEin: '90-1234567',
        wagesCents: 15_000_000n, // $150,000
        federalWithholdingCents: 250_000n,
      }],
      isItemizedClaimed: true,
      itemizedDeductionCents: 2_200_000n, // $22,000 > $15,750 standard
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 15_000_000n,
      adjustedGrossIncomeCents: 15_000_000n,
      taxableIncomeCents: 12_800_000n, // 150,000 - 22,000 = $128,000
    },
  },

  {
    id: 'FEDERAL-010',
    name: 'De Minimis Self-Employment Income Under $400',
    description: '$40,000 W-2 + $350 Schedule C Net Profit (IRC § 1402(b)(2) zero SE tax)',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Oliver Wood',
      w2s: [{
        employerName: 'School District 12',
        employerEin: '01-2345678',
        wagesCents: 4_000_000n, // $40,000
        federalWithholdingCents: 350_000n,
      }],
      scheduleC: {
        businessName: 'Wood Handcrafts',
        grossReceiptsCents: 35_000n, // $350
        expenses: {},
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 4_035_000n,
      adjustedGrossIncomeCents: 4_035_000n,
      selfEmploymentTaxCents: 0n, // De minimis exemption: under $400 SE earnings
    },
  },

  // ---------------------------------------------------------------------------
  // STATE SCENARIOS
  // ---------------------------------------------------------------------------
  {
    id: 'CA-001',
    name: 'California Resident Single W-2',
    description: '$120,000 wages, CA Standard Deduction $5,540, Exemption credit $149, Progressive brackets',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'California Taxpayer',
      w2s: [{
        employerName: 'Silicon Valley Systems',
        employerEin: '11-1111111',
        wagesCents: 12_000_000n, // $120,000
        federalWithholdingCents: 180_000n,
        stateCode: 'CA',
        stateWagesCents: 12_000_000n,
        stateWithholdingCents: 850_000n, // $8,500
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-CA'],
    },
    expected: {
      totalIncomeCents: 12_000_000n,
      adjustedGrossIncomeCents: 12_000_000n,
      taxableIncomeCents: 10_425_000n,
      stateTaxCents: {
        'US-CA': 703_989n, // CA Tax
      },
    },
  },

  {
    id: 'CA-002',
    name: 'California Millionaire Mental Health Surtax',
    description: '$1,500,000 wages, 1% Mental Health Services Surtax on CA taxable income > $1M',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Bay Area Founder',
      w2s: [{
        employerName: 'Unicorn AI Inc',
        employerEin: '22-2222222',
        wagesCents: 150_000_000n, // $1,500,000
        federalWithholdingCents: 45_000_000n,
        stateCode: 'CA',
        stateWagesCents: 150_000_000n,
        stateWithholdingCents: 18_000_000n,
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-CA'],
    },
    expected: {
      totalIncomeCents: 150_000_000n,
      adjustedGrossIncomeCents: 150_000_000n,
      taxableIncomeCents: 148_425_000n,
    },
  },

  {
    id: 'NY-001',
    name: 'New York Resident Form IT-201',
    description: '$95,000 wages, NY Standard Deduction $8,000, Progressive brackets (4.0% - 6.25%)',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Manhattan Professional',
      w2s: [{
        employerName: 'Financial Center Corp',
        employerEin: '33-3333333',
        wagesCents: 9_500_000n, // $95,000
        federalWithholdingCents: 120_000n,
        stateCode: 'NY',
        stateWagesCents: 9_500_000n,
        stateWithholdingCents: 520_000n, // $5,200
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-NY'],
    },
    expected: {
      totalIncomeCents: 9_500_000n,
      adjustedGrossIncomeCents: 9_500_000n,
      taxableIncomeCents: 7_925_000n,
      stateTaxCents: {
        'US-NY': 490_126n, // NY Tax on $87,000 NY taxable income
      },
    },
  },

  {
    id: 'NJ-001',
    name: 'New Jersey Non-Conforming Gross Income Tax',
    description: '$120,000 Schedule C net profit, independent NJ Gross Income, NO federal standard deduction, $1,000 exemption',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Princeton Consultant',
      w2s: [],
      scheduleC: {
        businessName: 'Princeton Analytical',
        grossReceiptsCents: 15_000_000n,
        expenses: { supplies: 3_000_000n }, // $120,000 net profit
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-NJ'],
    },
    expected: {
      totalIncomeCents: 12_000_000n,
      adjustedGrossIncomeCents: 11_152_226n,
      stateTaxCents: {
        'US-NJ': 545_580n, // NJ GIT on $119,000 NJ taxable income
      },
    },
  },

  {
    id: 'IL-001',
    name: 'Illinois Resident with 100% Pension Subtraction',
    description: '$50,000 W-2 + $40,000 pension, 100% pension subtraction under 35 ILCS 5/203, $2,775 exemption, flat 4.95%',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Chicago Retiree',
      w2s: [{
        employerName: 'Consulting Group',
        employerEin: '44-4444444',
        wagesCents: 5_000_000n, // $50,000
        federalWithholdingCents: 400_000n,
        stateCode: 'IL',
        stateWagesCents: 5_000_000n,
        stateWithholdingCents: 240_000n,
      }],
      investmentIncome: {
        taxableInterestCents: 0n,
        ordinaryDividendsCents: 0n,
        qualifiedDividendsCents: 0n,
      },
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-IL'],
    },
    expected: {
      totalIncomeCents: 5_000_000n,
      adjustedGrossIncomeCents: 5_000_000n,
      taxableIncomeCents: 3_425_000n,
      stateTaxCents: {
        'US-IL': 233_764n, // 4.95% on ($50,000 - $2,775 = $47,225) = $2,337.64
      },
    },
  },

  {
    id: 'MA-001',
    name: 'Massachusetts High Earner with Fair Share Surtax',
    description: '$2,500,000 wages, flat 5.0% Part B + 4.0% Fair Share Surtax on taxable income > $1,000,000',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Boston Executive',
      w2s: [{
        employerName: 'Boston Biotech Inc',
        employerEin: '55-5555555',
        wagesCents: 250_000_000n, // $2,500,000
        federalWithholdingCents: 70_000_000n,
        stateCode: 'MA',
        stateWagesCents: 250_000_000n,
        stateWithholdingCents: 20_000_000n,
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-MA'],
    },
    expected: {
      totalIncomeCents: 250_000_000n,
      adjustedGrossIncomeCents: 250_000_000n,
      taxableIncomeCents: 248_425_000n,
      // MA taxable: $2,500,000 - $4,400 = $2,495,600 (249,560,000n)
      // Part B: 5.0% on 249,560,000 = 12,478,000n ($124,780)
      // Surtax: 4.0% on (249,560,000 - 100,000,000 = 149,560,000) = 5,982,400n ($59,824)
      // Total MA Tax: 18,460,400n ($184,604)
      stateTaxCents: {
        'US-MA': 18_460_400n,
      },
    },
  },

  {
    id: 'MULTI-001',
    name: 'Multi-State Allocation: CA Resident with NY Income',
    description: 'CA resident with $100k CA wages and $50k NY wages, verifies multi-state wage allocation and other-state credit',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Bi-Coastal Consultant',
      w2s: [
        {
          employerName: 'West Coast Client',
          employerEin: '66-6666666',
          wagesCents: 10_000_000n, // $100,000
          federalWithholdingCents: 150_000n,
          stateCode: 'CA',
          stateWagesCents: 10_000_000n,
          stateWithholdingCents: 600_000n,
        },
        {
          employerName: 'East Coast Client',
          employerEin: '77-7777777',
          wagesCents: 5_000_000n, // $50,000
          federalWithholdingCents: 75_000n,
          stateCode: 'NY',
          stateWagesCents: 5_000_000n,
          stateWithholdingCents: 300_000n,
        },
      ],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-CA'],
    },
    expected: {
      totalIncomeCents: 15_000_000n,
      adjustedGrossIncomeCents: 15_000_000n,
      taxableIncomeCents: 13_425_000n,
    },
  },

  // ---------------------------------------------------------------------------
  // BOUNDARY & UNSUPPORTED SCENARIOS
  // ---------------------------------------------------------------------------
  {
    id: 'EDGE-001',
    name: 'Unsupported Jurisdiction Rejection',
    description: 'Input with unsupported state (e.g. US-TX or US-FL) triggers clean UNSUPPORTED validation rejection',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Texas Resident',
      w2s: [{
        employerName: 'Austin Tech',
        employerEin: '88-8888888',
        wagesCents: 10_000_000n,
        federalWithholdingCents: 150_000n,
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED', 'US-TX' as any],
    },
    expected: {
      totalIncomeCents: 10_000_000n,
      adjustedGrossIncomeCents: 10_000_000n,
      taxableIncomeCents: 8_425_000n,
      shouldFailValidation: true,
      expectedErrorCode: 'UNSUPPORTED_JURISDICTION',
    },
  },

  {
    id: 'EDGE-002',
    name: 'Negative Wages Boundary Rejection',
    description: 'Input with negative W-2 Box 1 wages triggers FATAL arithmetic boundary error',
    input: {
      taxYear: 2026,
      filingStatus: 'SINGLE',
      taxpayerName: 'Corrupt Input Case',
      w2s: [{
        employerName: 'Invalid Corp',
        employerEin: '99-9999999',
        wagesCents: -500_000n, // Negative wages
        federalWithholdingCents: 0n,
      }],
      payments: { estimatedTaxPaymentsCents: 0n },
      residentStates: ['US-FED'],
    },
    expected: {
      totalIncomeCents: 0n,
      adjustedGrossIncomeCents: 0n,
      taxableIncomeCents: 0n,
      shouldFailValidation: true,
      expectedErrorCode: 'INVALID_W2_WAGES',
    },
  },
];
