import { SalesTaxNexus, SalesTaxTransaction } from '../types/salesTax';
import { Employee, Contractor, WorkerClassification, PayrollRun, Form941Record } from '../types/payrollTax';
import { IncomeTaxReturn } from '../types/incomeTax';
import { TaxCase, IncomeTaxCase, SalesTaxCase, PayrollTaxCase } from '../types/taxCase';
import { SAMPLE_MULTI_TIER_RATES } from './SalesTaxEngine';

export const MOCK_BUSINESS = {
  id: 'biz-apex-01',
  name: 'Apex Dynamics, Inc.',
  fein: '88-4928172',
  entityType: 'S_CORP',
  stateOfIncorporation: 'Delaware',
  headquarters: 'San Francisco, CA',
  fiscalYear: 2027
};

export const MOCK_INCOME_TAX_CASE: IncomeTaxCase = {
  id: 'case-2027-apex-income',
  businessId: 'biz-apex-01',
  taxYear: 2027,
  domain: 'INCOME_TAX',
  title: 'Apex Dynamics 2027 Form 1120-S Annual Return',
  entityStructure: 'S_CORP_1120S',
  formType: 'FORM_1120_S',
  status: 'REVIEW_REQUIRED',
  readinessScore: 92,
  assignedPreparerId: 'prep-jennifer-w',
  assignedReviewerId: 'cpa-marcus-vance',
  evidenceNodeIds: ['ev-gl-ledger', 'ev-bank-feed', 'ev-sec179-receipts'],
  openIssueIds: ['issue-k1-allocations'],
  fiscalYearEndMonth: 12,
  primaryStateJurisdiction: 'CA',
  apportionmentStateCodes: ['CA', 'NY', 'TX', 'WA'],
  grossRevenue: 3450000,
  costOfGoodsSold: 890000,
  grossProfit: 2560000,
  totalDeductions: 1820000,
  ordinaryBusinessIncome: 740000,
  line8WageDeductionLink: {
    payrollTaxCaseId: 'case-2027-apex-payroll-q1',
    verifiedAggregateWages: 1280000,
    reconciliationVariance: 0
  },
  k1ShareholderCount: 3,
  returnId: 'ret-1120s-2027',
  provenance: {
    engineVersion: 'IncomeTaxEngine-v4.0.1',
    ruleSetVersion: '2027.S-CORP',
    ruleIds: ['IRC-1361', 'IRC-162-DEDUCTIONS', 'IRC-179-DEPRECIATION'],
    inputHash: 'hash-inc-apex-2027',
    calculatedAt: '2027-04-01T10:00:00Z',
    citations: ['IRC § 1361 (S Corporation Taxation)', 'IRC § 162', 'IRC § 179']
  },
  createdAt: '2027-01-15T09:00:00Z',
  updatedAt: '2027-04-02T14:30:00Z'
};

export const MOCK_SALES_TAX_CASE: SalesTaxCase = {
  id: 'case-2027-apex-sales-ca-q1',
  businessId: 'biz-apex-01',
  taxYear: 2027,
  domain: 'SALES_USE_TAX',
  title: 'California CDTFA-401 Q1 2027 Sales & Use Tax Return',
  jurisdictionId: 'CA-CDTFA',
  stateCode: 'CA',
  periodFrequency: 'QUARTERLY',
  periodLabel: 'Q1 2027 (Jan - Mar)',
  returnDueDate: '2027-04-30',
  status: 'CALCULATING',
  readinessScore: 88,
  assignedPreparerId: 'prep-alex-m',
  evidenceNodeIds: ['ev-stripe-stream', 'ev-shopify-orders'],
  openIssueIds: ['issue-resale-cert-missing-01'],
  grossSales: 450000,
  taxableSales: 275000,
  exemptSales: 25000,
  marketplaceFacilitatorSales: 150000,
  directMerchantSales: 300000,
  compositeRateApplied: 0.0950, // 9.50% LA County Composite
  taxCalculated: 26125,
  taxCollected: 26125,
  marketplaceCollectedAmount: 14250,
  prepaymentsDeducted: 0,
  netRemittanceDue: 26125,
  sourcingRule: 'DESTINATION',
  associatedNexusId: 'nexus-ca',
  provenance: {
    engineVersion: 'SalesTaxEngine-v2.4.0',
    ruleSetVersion: '2027.Q1',
    ruleIds: ['rate-ca-la-2027', 'CAL-REV-TAX-6051'],
    inputHash: 'hash-sales-ca-q1',
    calculatedAt: '2027-04-02T11:00:00Z',
    citations: ['Cal. Rev. & Tax. Code § 6051', 'Cal. Rev. & Tax. Code § 7202']
  },
  createdAt: '2027-04-01T08:00:00Z',
  updatedAt: '2027-04-03T16:00:00Z'
};

export const MOCK_PAYROLL_TAX_CASE: PayrollTaxCase = {
  id: 'case-2027-apex-payroll-q1',
  businessId: 'biz-apex-01',
  taxYear: 2027,
  domain: 'PAYROLL_TAX',
  title: 'Federal Form 941 Quarterly Payroll Return (Q1 2027)',
  formType: 'FORM_941',
  quarterNumber: 1,
  periodLabel: 'Q1 2027 (Quarter Ended March 31)',
  filingDueDate: '2027-04-30',
  status: 'REVIEW_REQUIRED',
  readinessScore: 95,
  assignedPreparerId: 'prep-jennifer-w',
  assignedReviewerId: 'ea-rachel-green',
  evidenceNodeIds: ['ev-gusto-payrun-q1', 'ev-eftps-deposits'],
  openIssueIds: ['issue-worker-class-elena'],
  coveredEmployeeCount: 18,
  totalGrossWages: 320000,
  taxableSocialSecurityWages: 320000,
  socialSecurityTaxTotal: 39680,
  taxableMedicareWages: 320000,
  medicareTaxTotal: 9280,
  federalIncomeTaxWithheld: 48000,
  totalFederalTaxLiability: 96960,
  depositSchedule: 'SEMI_WEEKLY',
  totalDepositsRemitted: 96960,
  balanceDueOrOverpayment: 0,
  isTreasRegSafeHarborMet: true,
  flaggedWorkerClassificationIds: ['wc-dev-01'],
  payrollReturnId: 'form-941-2027-q1',
  provenance: {
    engineVersion: 'PayrollEngine-v3.1.0',
    ruleSetVersion: '2027-FED-PUB-15T',
    ruleIds: ['IRC-3101-FICA', 'IRC-3402-FIT', 'IRC-6302-DEPOSITS'],
    inputHash: 'hash-payroll-q1-2027',
    calculatedAt: '2027-04-01T09:00:00Z',
    citations: ['IRC § 3101', 'IRC § 3111', 'IRC § 3402', 'Treas. Reg. § 31.6302-1']
  },
  createdAt: '2027-04-01T08:30:00Z',
  updatedAt: '2027-04-02T15:00:00Z'
};

export const MOCK_INCOME_RETURN: IncomeTaxReturn = {
  id: 'ret-1120s-2027',
  taxCaseId: 'case-2027-apex-income',
  taxYear: 2027,
  formType: 'FORM_1120_S',
  grossRevenue: 3450000,
  costOfGoodsSold: 890000,
  grossProfit: 2560000,
  totalDeductions: 1820000,
  netTaxableIncome: 740000,
  effectiveTaxRate: 0.21,
  marginalTaxRate: 0.21,
  quarterlyEstimatedTaxesPaid: 155000,
  refundOrBalanceDue: 400,
  taxLiability: {
    id: 'liab-inc-2027',
    domain: 'INCOME_TAX',
    jurisdictionId: 'US-FED',
    periodId: 'period-2027-annual',
    grossAmount: 3450000,
    exemptAmount: 0,
    taxableAmount: 740000,
    taxRate: 0.21,
    taxOwed: 155400,
    penalties: 0,
    interest: 0,
    totalDue: 400,
    currency: 'USD',
    calculatedAt: '2027-04-01T10:00:00Z',
    provenance: {
      engineVersion: 'IncomeTaxEngine-v4.0.1',
      ruleSetVersion: '2027.S-CORP',
      ruleIds: ['IRC-1361', 'IRC-162-DEDUCTIONS', 'IRC-179-DEPRECIATION'],
      inputHash: 'hash-inc-apex-2027',
      calculatedAt: '2027-04-01T10:00:00Z',
      citations: ['IRC § 1361 (S Corporation Taxation)', 'IRC § 162 (Trade or Business Expenses)', 'IRC § 179']
    }
  },
  filing: {
    id: 'filing-1120s-2027',
    domain: 'INCOME_TAX',
    periodId: 'period-2027-annual',
    jurisdictionId: 'US-FED',
    formName: 'Form 1120-S',
    status: 'UNDER_REVIEW',
    professionalReview: {
      id: 'rev-cpa-01',
      domain: 'INCOME_TAX',
      reviewerId: 'cpa-marcus-vance',
      reviewerName: 'Marcus Vance, CPA',
      credentials: 'CPA',
      status: 'IN_REVIEW',
      findings: [
        'Form 1120-S draft ready at 92% readiness score.',
        'Wages deduction on Line 8 matches Form 941 Box 2 aggregates ($1,280,000).',
        'Section 179 equipment expense verification complete.'
      ],
      recommendations: [
        'Confirm final shareholder K-1 ownership percentage distributions before April 15 filing.'
      ]
    }
  },
  provenance: {
    engineVersion: 'IncomeTaxEngine-v4.0.1',
    ruleSetVersion: '2027.S-CORP',
    ruleIds: ['IRC-1361', 'IRC-162'],
    inputHash: 'hash-inc-apex-2027',
    calculatedAt: '2027-04-01T10:00:00Z',
    citations: ['IRC § 1361', 'IRC § 162']
  }
};

export const MOCK_SALES_NEXUS_STATES: SalesTaxNexus[] = [
  {
    id: 'nexus-ca',
    stateCode: 'CA',
    stateName: 'California',
    nexusType: 'PHYSICAL',
    thresholdType: 'AMOUNT_OR_TRANSACTION',
    thresholdAmount: 500000,
    thresholdTransactionCount: undefined,
    measurementPeriod: 'CURRENT_OR_PREVIOUS_YEAR',
    currentTrailingSales: 1250000,
    currentTrailingTransactions: 1420,
    percentageTowardsThreshold: 100,
    hasNexus: true,
    nexusTriggerDate: '2026-03-15',
    registrationDeadline: '2026-04-15',
    registrationStatus: 'REGISTERED',
    filingObligation: 'QUARTERLY',
    events: [
      {
        id: 'ev-ca-1',
        eventType: 'PHYSICAL_PROPERTY_ADDED',
        description: 'San Francisco office lease established.',
        occurredAt: '2026-03-15',
        evaluatedRuleId: 'RULE-CA-PHYSICAL-NEXUS'
      }
    ]
  },
  {
    id: 'nexus-ny',
    stateCode: 'NY',
    stateName: 'New York',
    nexusType: 'ECONOMIC',
    thresholdType: 'AMOUNT_AND_TRANSACTION',
    thresholdAmount: 500000,
    thresholdTransactionCount: 100,
    measurementPeriod: 'TRAILING_12_MONTHS',
    currentTrailingSales: 540000,
    currentTrailingTransactions: 148,
    percentageTowardsThreshold: 100,
    hasNexus: true,
    nexusTriggerDate: '2027-02-10',
    registrationDeadline: '2027-03-15',
    registrationStatus: 'REGISTERED',
    filingObligation: 'QUARTERLY',
    events: [
      {
        id: 'ev-ny-1',
        eventType: 'THRESHOLD_BREACHED',
        description: 'Exceeded $500,000 sales AND 100 transactions in trailing 4 quarters.',
        occurredAt: '2027-02-10',
        metricValue: 540000,
        evaluatedRuleId: 'RULE-NY-WAYFAIR-THRESHOLD'
      }
    ]
  },
  {
    id: 'nexus-tx',
    stateCode: 'TX',
    stateName: 'Texas',
    nexusType: 'ECONOMIC',
    thresholdType: 'SALES_AMOUNT_ONLY',
    thresholdAmount: 500000,
    measurementPeriod: 'TRAILING_12_MONTHS',
    currentTrailingSales: 440000,
    currentTrailingTransactions: 82,
    percentageTowardsThreshold: 88,
    hasNexus: false,
    registrationStatus: 'NOT_REQUIRED',
    filingObligation: 'OCCASIONAL',
    events: []
  },
  {
    id: 'nexus-wa',
    stateCode: 'WA',
    stateName: 'Washington',
    nexusType: 'ECONOMIC',
    thresholdType: 'SALES_AMOUNT_ONLY',
    thresholdAmount: 100000,
    measurementPeriod: 'CALENDAR_YEAR',
    currentTrailingSales: 165000,
    currentTrailingTransactions: 45,
    percentageTowardsThreshold: 100,
    hasNexus: true,
    nexusTriggerDate: '2027-01-20',
    registrationDeadline: '2027-02-28',
    registrationStatus: 'REGISTERED',
    filingObligation: 'MONTHLY',
    events: [
      {
        id: 'ev-wa-1',
        eventType: 'THRESHOLD_BREACHED',
        description: 'Surpassed $100,000 threshold for digital services/SaaS.',
        occurredAt: '2027-01-20',
        metricValue: 165000,
        evaluatedRuleId: 'RULE-WA-100K-THRESHOLD'
      }
    ]
  }
];

export const MOCK_SALES_TRANSACTIONS: SalesTaxTransaction[] = [
  {
    id: 'tx-001',
    transactionNumber: 'TX-2027-9812',
    orderId: 'ORD-8941',
    salesChannel: 'STRIPE',
    isMarketplaceFacilitator: false,
    transactionDate: '2027-04-02T11:20:00Z',
    sellerLocation: {
      address: '500 Howard St',
      city: 'San Francisco',
      county: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    buyerLocation: {
      address: '120 Broadway',
      city: 'New York',
      county: 'New York',
      state: 'NY',
      zipCode: '10271'
    },
    productCategoryId: 'SW_SAAS',
    productName: 'Apex Cloud Enterprise Tier (Annual)',
    customerCategory: 'B2B',
    sourcingApplied: 'DESTINATION',
    grossAmount: 12000,
    exemptAmount: 0,
    taxableAmount: 12000,
    rateApplied: SAMPLE_MULTI_TIER_RATES['NY_NEW_YORK_CITY'],
    taxCalculated: 1065, // 8.875%
    taxCollected: 1065,
    marketplaceCollectedAmount: 0,
    directlyCollectedAmount: 1065,
    currency: 'USD',
    provenance: {
      engineVersion: 'SalesTaxEngine-v2.4.0',
      ruleSetVersion: '2027.Q1',
      ruleIds: ['rate-ny-nyc-2027', 'NY-SAAS-TSB-M-08'],
      inputHash: 'hash-tx-001',
      calculatedAt: '2027-04-02T11:20:00Z',
      citations: ['NY Tax Law §§ 1105, 1107, 1109', 'NY TSB-M-08(7)S (Prewritten Software / SaaS)']
    }
  },
  {
    id: 'tx-002',
    transactionNumber: 'TX-2027-9813',
    orderId: 'ORD-8942',
    salesChannel: 'AMAZON',
    isMarketplaceFacilitator: true,
    marketplaceName: 'Amazon Business',
    transactionDate: '2027-04-03T15:45:00Z',
    sellerLocation: {
      address: '500 Howard St',
      city: 'San Francisco',
      county: 'San Francisco',
      state: 'CA',
      zipCode: '94105'
    },
    buyerLocation: {
      address: '600 Congress Ave',
      city: 'Austin',
      county: 'Travis',
      state: 'TX',
      zipCode: '78701'
    },
    productCategoryId: 'HARDWARE_ROBOTICS',
    productName: 'Apex Industrial Edge Telemetry Hub',
    customerCategory: 'B2B',
    sourcingApplied: 'DESTINATION',
    grossAmount: 4500,
    exemptAmount: 0,
    taxableAmount: 4500,
    rateApplied: SAMPLE_MULTI_TIER_RATES['TX_AUSTIN'],
    taxCalculated: 371.25, // 8.25%
    taxCollected: 371.25,
    marketplaceCollectedAmount: 371.25,
    directlyCollectedAmount: 0,
    currency: 'USD',
    provenance: {
      engineVersion: 'SalesTaxEngine-v2.4.0',
      ruleSetVersion: '2027.Q1',
      ruleIds: ['rate-tx-austin-2027', 'TX-MARKETPLACE-FACILITATOR'],
      inputHash: 'hash-tx-002',
      calculatedAt: '2027-04-03T15:45:00Z',
      citations: ['Tex. Tax Code § 151.0242 (Marketplace Facilitators)', 'Tex. Tax Code § 151.051']
    }
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    employerId: 'biz-apex-01',
    employeeNumber: 'E-101',
    firstName: 'Sarah',
    lastName: 'Chen',
    ssnMasked: 'XXX-XX-4819',
    homeAddress: {
      street: '420 Montgomery St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104'
    },
    workLocationState: 'CA',
    hireDate: '2025-06-01',
    employmentPeriod: {
      id: 'ep-01',
      workerId: 'emp-01',
      startDate: '2025-06-01',
      employmentType: 'FULL_TIME',
      standardHoursPerWeek: 40,
      isOfficer: false
    },
    w4Status: {
      filingStatus: 'SINGLE_OR_SEPARATE',
      multipleJobsOrSpouseWorks: false,
      dependentCreditAmount: 0,
      otherIncomeAmount: 0,
      deductionsAmount: 0,
      extraWithholdingPerPaycheck: 0
    },
    compensation: {
      payType: 'SALARY',
      baseRate: 185000,
      payFrequency: 'SEMI_MONTHLY'
    }
  },
  {
    id: 'emp-02',
    employerId: 'biz-apex-01',
    employeeNumber: 'E-102',
    firstName: 'David',
    lastName: 'Miller',
    ssnMasked: 'XXX-XX-7921',
    homeAddress: {
      street: '150 West End Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10023'
    },
    workLocationState: 'NY',
    hireDate: '2026-01-15',
    employmentPeriod: {
      id: 'ep-02',
      workerId: 'emp-02',
      startDate: '2026-01-15',
      employmentType: 'FULL_TIME',
      standardHoursPerWeek: 40,
      isOfficer: true
    },
    w4Status: {
      filingStatus: 'MARRIED_JOINT',
      multipleJobsOrSpouseWorks: false,
      dependentCreditAmount: 2000,
      otherIncomeAmount: 0,
      deductionsAmount: 0,
      extraWithholdingPerPaycheck: 50
    },
    compensation: {
      payType: 'SALARY',
      baseRate: 215000, // Triggers Additional Medicare threshold!
      payFrequency: 'SEMI_MONTHLY'
    }
  }
];

export const MOCK_WORKER_CLASSIFICATIONS: WorkerClassification[] = [
  {
    id: 'wc-dev-01',
    workerId: 'cont-01',
    workerName: 'Elena Rostova',
    currentDesignation: '1099_CONTRACTOR',
    facts: {
      behavioralControl: {
        instructionsGivenLevel: 'HIGH',
        trainingProvidedByEmployer: true,
        evaluationSystemsControl: true
      },
      financialControl: {
        significantInvestmentInTools: false,
        unreimbursedBusinessExpenses: false,
        servicesAvailableToOpenMarket: false,
        methodOfPayment: 'HOURLY_SALARY',
        opportunityForProfitOrLoss: false
      },
      typeOfRelationship: {
        writtenContractsInPlace: true,
        employeeBenefitsProvided: false,
        permanencyOfRelationship: 'INDEFINITE',
        servicesCoreToRegularBusiness: true
      }
    },
    aiFactFindingSummary: 
      'Contractor Elena Rostova is classified as 1099-NEC but required to work fixed 40 hours/week, uses company-issued hardware, follows internal engineering sprint sprints, and is restricted by non-compete clauses.',
    riskAssessment: 'CRITICAL_DISPUTED',
    identifiedAuthorities: [
      'IRS Rev. Rul. 87-41 (Behavioral Control & Integration)',
      'IRC § 3121(d)(2) (Common Law Agency)',
      'Cal. Labor Code § 2775 (AB 5 / Dynamex Prong B Standard)'
    ],
    escalationStatus: 'ESCALATED_TO_CPA',
    review: {
      id: 'rev-class-01',
      domain: 'PAYROLL_TAX',
      reviewerId: 'cpa-marcus-vance',
      reviewerName: 'Marcus Vance, CPA',
      credentials: 'CPA',
      status: 'CHANGES_REQUESTED',
      findings: [
        'High audit risk under California EDD and IRS employment tax examination.',
        'Prong B of the ABC test is violated because backend software development is the primary business of Apex Dynamics.'
      ],
      recommendations: [
        'Transition worker to W-2 Employee status retroactively or reformulate contract to milestone-based deliverable model with independent tooling.',
        'Escalate to labor attorney if retroactive reclassification requires voluntary disclosure program.'
      ]
    }
  }
];

export const MOCK_FORM_941_Q1: Form941Record = {
  id: 'form-941-2027-q1',
  domain: 'PAYROLL_TAX',
  periodId: 'period-2027-q1',
  jurisdictionId: 'US-FED',
  formType: 'FORM_941',
  grossAmount: 320000,
  taxableAmount: 320000,
  taxLiability: 96960,
  filingStatus: 'AI_GENERATED',
  taxYear: 2027,
  quarter: 1,
  totalWages: 320000,
  federalWithheld: 48000,
  ficaTotal: 48960,
  totalDeposits: 96960,
  numberOfEmployees: 18,
  wagesTipsOtherCompensation: 320000,
  federalIncomeTaxWithheld: 48000,
  taxableSocialSecurityWages: 320000,
  socialSecurityTax: 39680, // 12.4% total (employee 6.2% + employer 6.2%)
  taxableMedicareWages: 320000,
  medicareTax: 9280, // 2.9% total (employee 1.45% + employer 1.45%)
  totalTaxesBeforeAdjustments: 96960,
  totalDepositsForQuarter: 96960,
  balanceDueOrOverpayment: 0,
  provenance: {
    engineVersion: 'PayrollEngine-v3.1.0',
    ruleSetVersion: '2027-FED-PUB-15T',
    ruleIds: ['IRC-3101-FICA', 'IRC-3402-FIT'],
    inputHash: 'hash-form-941-q1-2027',
    calculatedAt: '2027-04-01T09:00:00Z',
    citations: ['IRC § 3101', 'IRC § 3111', 'IRC § 3402']
  },
  filing: {
    id: 'filing-941-q1',
    domain: 'PAYROLL_TAX',
    periodId: 'period-2027-q1',
    jurisdictionId: 'US-FED',
    formName: 'Form 941 (Employer Quarterly Federal Tax Return)',
    status: 'AI_GENERATED',
    irsTransmissionId: 'IRS-MEF-TX-98418',
    professionalReview: {
      id: 'rev-941-q1',
      domain: 'PAYROLL_TAX',
      reviewerId: 'ea-rachel-green',
      reviewerName: 'Rachel Green, EA',
      credentials: 'EA',
      status: 'APPROVED',
      findings: ['Semi-weekly deposit schedule confirmed current. Box 10 deposits reconcile to penny with EFTPS records.'],
      recommendations: ['Ready for client e-signature and submission prior to April 30, 2027 deadline.']
    }
  }
};
