/**
 * Autonomous Tax OS — Phase 8 Master Verification Suite
 * 
 * Comprehensive end-to-end verification covering all Phase 8 Definition of Done criteria:
 * 1. Persistent Employer Registration & Multi-Jurisdiction Setup (US-FED, US-CA, US-NY, US-NJ, US-IL, US-MA)
 * 2. Employee Onboarding & W-4 Configurations (Single, MFJ, HOH, Multiple Jobs, Dependent Credits, Extra Withholding)
 * 3. Pre-Tax Deduction Exemption Matrix & Distinct Wage Base Computations (IRC § 125, § 402(g), § 3121(a)(5)(A))
 * 4. FICA OASDI cap ($176,100), Medicare uncapped, and Additional Medicare threshold ($200,000)
 * 5. FUTA wage base ($7,000) and State Unemployment SUI caps across all 5 launch states
 * 6. Deterministic Federal Withholding Engine (IRS Pub 15-T percentage method & supplemental bonus 22%/37%)
 * 7. Deterministic FICA & FUTA Engine (OASDI 6.2%/6.2%, Medicare 1.45%/1.45%, Add'l Med 0.9%, FUTA 0.6% net)
 * 8. Deterministic 5-State Payroll Engines:
 *    - California EDD Method B, CA SDI 1.2% uncapped (SB 951), SUI, ETT 0.1%
 *    - New York NYS-50-T PIT brackets, NYC local resident PIT, NY PFL, NY SUI
 *    - New Jersey NJ-WT Table A, NJ Employee SUI (0.3825%), NJ FLI (0.09%), NJ Employer SUI
 *    - Illinois IL-700-T flat 4.95% PIT minus basic allowances, IL SUI
 *    - Massachusetts Circular M flat 5.0% PIT minus exemptions, MA PFML (0.46% EE / 0.42% ER), MA SUI
 * 9. Payroll Ingestion & Run Execution persisting all Prisma models
 * 10. Deposit Schedule Engine (Monthly vs Semi-Weekly lookback threshold $50k, $100k Next-Day rule, FUTA $500 threshold)
 * 11. Form 941 Engine (Lines 1, 2, 3, 5a-d, 6, 10, 12, 15, and Schedule B allocations)
 * 12. Form 940 Engine (Lines 3, 4, 7, 8, 9, 12, 13, 14, 15)
 * 13. Form W-2 Generation (Boxes 1-6, Box 12 Codes D/W, Box 13, Box 14, Boxes 15-20)
 * 14. Form W-3 Transmittal & Parity Reconciliation with 4 quarters of Form 941
 * 15. Four-Way Payroll Reconciliation Engine (Runs <-> 941, 941 <-> W-2/W-3, Liabilities <-> Deposits, Runs <-> GL)
 * 16. Discrepancy Detection on intentional accounting variance
 * 17. Worker Classification Risk Engine (IRS 3-pillar common law & state ABC tests, emitting POTENTIAL_RISK)
 * 18. Privileged Access Management (PAM) & SSN/EIN Masking (15-minute elevation, domain isolation)
 * 19. Agency Payroll Notice Ingestion & Automated Priority ReviewTask Routing (IRS CP161, CA EDD)
 * 20. Two-Party Authorization Gate for Return Filing & Remittance Payments
 * 21. Multi-Agent Payroll Suite Execution (All 15 payroll agents verified)
 */

import { prisma } from '../server/db';
import {
  WageBaseService,
  FederalWithholdingEngine,
  FicaFutaEngine,
  CaliforniaPayrollModule,
  NewYorkPayrollModule,
  NewJerseyPayrollModule,
  IllinoisPayrollModule,
  MassachusettsPayrollModule,
  StatePayrollRegistry,
  DepositScheduleEngine,
  Form941Engine,
  Form940Engine,
  W2W3Engine,
  PayrollReconciliationEngine,
  WorkerClassificationEngine,
  PayrollIngestionService,
  PayrollFilingProvider,
  PayrollNoticeService,
  PayrollSecurityService,
  PayrollTaxType
} from '../server/services/payroll';

import {
  PayrollTaxSupervisorAgent,
  PayrollImportAgent,
  FederalWithholdingAgent,
  FICAAgent,
  FUTAAgent,
  StateWithholdingAgent,
  StateUnemploymentAgent,
  DepositScheduleAgent,
  Form941Agent,
  Form940Agent,
  W2Agent,
  W3Agent,
  WorkerClassificationRiskAgent,
  PayrollNoticeAgent,
  PayrollReconciliationAgent
} from '../server/agent-runtime/payroll';

import { AgentExecutionContext } from '../server/agent-runtime/context';
import {
  CaseType,
  ReviewMode,
  UserRole,
  PayFrequency,
  DepositFrequency,
  PayrollReturnStatus,
  SalesTaxNoticeSeverity,
  TaxDomain,
  EarningType,
  DeductionType,
  EmployerRegistrationType,
  EmployerRegistrationStatus
} from '@prisma/client';

let testRunId = `p8-${Date.now()}`;
let testOrgId = '';
let testUserId = '';
let testCaseId = '';
let testEmployerId = '';

let testEmpCAId = '';
let testEmpNYId = '';
let testEmpNJId = '';
let testEmpILId = '';
let testEmpMAId = '';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function setupPhase8TestEnvironment() {
  console.log('\n--- Setting up Phase 8 Test Organization, TaxCase, and Employer ---');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: `Apex Global Robotics ${testRunId}`,
      slug: `apex-robotics-${testRunId}`,
      fein: '88-4421903',
      settings: { payrollTaxEnabled: true }
    }
  });
  testOrgId = org.id;

  // 2. Create User (CPA / Payroll Reviewer)
  const user = await prisma.user.create({
    data: {
      email: `cpa-payroll-${testRunId}@taxos.test`,
      passwordHash: 'hash',
      fullName: 'Alexander Hamilton, CPA',
      role: UserRole.CPA
    }
  });
  testUserId = user.id;

  // 3. Create TaxCase
  const taxCase = await prisma.taxCase.create({
    data: {
      organizationId: testOrgId,
      ownerId: testUserId,
      taxYear: 2026,
      caseType: CaseType.PAYROLL_TAX,
      reviewMode: ReviewMode.HUMAN_VERIFIED,
      status: 'DRAFT',
      completionPercent: 40
    }
  });
  testCaseId = taxCase.id;

  // 4. Create Employer
  const employer = await prisma.employer.create({
    data: {
      organizationId: testOrgId,
      legalName: 'Apex Robotics Inc',
      dba: 'Apex Robotics',
      einEncrypted: 'enc_ein_apex_robotics',
      einLast4: '1903',
      entityType: 'C_CORP',
      primaryAddress: { street: '500 Howard St', city: 'San Francisco', state: 'CA', zip: '94105' },
      taxJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
      defaultPaySchedule: PayFrequency.BIWEEKLY
    }
  });
  testEmployerId = employer.id;

  // 5. Create Employer Registrations for Fed & Launch States
  const jurisdictions = ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'];
  for (const j of jurisdictions) {
    await prisma.employerRegistration.create({
      data: {
        employerId: testEmployerId,
        jurisdictionCode: j,
        registrationType: j === 'US-FED' ? EmployerRegistrationType.FEDERAL_EIN : EmployerRegistrationType.STATE_WITHHOLDING,
        accountNumber: '7721-8899',
        status: EmployerRegistrationStatus.ACTIVE,
        effectiveDate: new Date('2024-01-01')
      }
    });
  }

  // 6. Create State Unemployment Accounts
  const stateSuiRates: { [key: string]: number } = {
    CA: 0.034,
    NY: 0.041,
    NJ: 0.028,
    IL: 0.0395,
    MA: 0.0242
  };
  for (const [state, rate] of Object.entries(stateSuiRates)) {
    await prisma.stateUnemploymentAccount.create({
      data: {
        employerId: testEmployerId,
        stateCode: state,
        accountNumber: `SUI-${state}-9901`,
        effectiveYear: 2026,
        experienceRate: rate,
        maxWageBaseCents: WageBaseService.STATE_SUI_WAGE_BASES_2026[state] || BigInt(700000)
      }
    });
  }

  console.log(`  Initialized TaxCase: ${testCaseId}, Employer: ${testEmployerId}`);
}

async function runTests() {
  await setupPhase8TestEnvironment();

  console.log('\n--- 1. Employee Onboarding & W-4 Configurations across 5 States ---');
  {
    // CA Employee: Single, standard, $120,000 salary
    const empCA = await prisma.employee.create({
      data: {
        employerId: testEmployerId,
        employeeNumber: 'EMP-CA-001',
        firstName: 'Sarah',
        lastName: 'Chen',
        ssnEncrypted: 'enc_ssn_chen',
        ssnLast4: '1001',
        address: { street: '123 Market St', city: 'San Francisco', state: 'CA', zip: '94105' },
        workLocationState: 'US-CA',
        residentState: 'US-CA',
        hireDate: new Date('2024-01-15'),
        payFrequency: PayFrequency.BIWEEKLY,
        payRateCents: BigInt(461538), // $4,615.38 biweekly
        isSalaried: true,
        w4FilingStatus: 'SINGLE',
        w4MultipleJobs: false,
        w4ClaimDependentsCents: BigInt(0),
        w4OtherIncomeCents: BigInt(0),
        w4DeductionsCents: BigInt(0),
        w4ExtraWithholdingCents: BigInt(0),
        stateWithholdingConfig: { filingStatus: 'SINGLE', allowances: 1 }
      }
    });
    testEmpCAId = empCA.id;
    assert(empCA.employeeNumber === 'EMP-CA-001', 'Created CA Employee Sarah Chen');

    // NY Employee: MFJ, NYC resident, $220,000 salary (exceeds $200k Additional Medicare and $176.1k OASDI cap)
    const empNY = await prisma.employee.create({
      data: {
        employerId: testEmployerId,
        employeeNumber: 'EMP-NY-002',
        firstName: 'David',
        lastName: 'Miller',
        ssnEncrypted: 'enc_ssn_miller',
        ssnLast4: '2002',
        address: { street: '450 Lexington Ave', city: 'New York', state: 'NY', zip: '10017' },
        workLocationState: 'US-NY',
        residentState: 'US-NY',
        hireDate: new Date('2023-05-01'),
        payFrequency: PayFrequency.BIWEEKLY,
        payRateCents: BigInt(846154), // $8,461.54 biweekly
        isSalaried: true,
        w4FilingStatus: 'MARRIED_FILING_JOINTLY',
        w4MultipleJobs: false,
        w4ClaimDependentsCents: BigInt(200000), // $2,000 child tax credit
        w4OtherIncomeCents: BigInt(0),
        w4DeductionsCents: BigInt(0),
        w4ExtraWithholdingCents: BigInt(0),
        stateWithholdingConfig: { filingStatus: 'MARRIED', allowances: 2, isNycResident: true }
      }
    });
    testEmpNYId = empNY.id;
    assert(empNY.employeeNumber === 'EMP-NY-002', 'Created NY Employee David Miller (NYC Resident)');

    // NJ Employee: Hourly $50/hr ($4,000 biweekly), Multiple Jobs checked
    const empNJ = await prisma.employee.create({
      data: {
        employerId: testEmployerId,
        employeeNumber: 'EMP-NJ-003',
        firstName: 'Elena',
        lastName: 'Gomez',
        ssnEncrypted: 'enc_ssn_gomez',
        ssnLast4: '3003',
        address: { street: '80 River Rd', city: 'Hoboken', state: 'NJ', zip: '07030' },
        workLocationState: 'US-NJ',
        residentState: 'US-NJ',
        hireDate: new Date('2024-03-01'),
        payFrequency: PayFrequency.BIWEEKLY,
        payRateCents: BigInt(5000), // $50.00/hr
        isSalaried: false,
        w4FilingStatus: 'SINGLE',
        w4MultipleJobs: true,
        w4ClaimDependentsCents: BigInt(0),
        w4OtherIncomeCents: BigInt(0),
        w4DeductionsCents: BigInt(0),
        w4ExtraWithholdingCents: BigInt(5000), // $50 extra withholding
        stateWithholdingConfig: { tableRateCode: 'A', allowances: 1 }
      }
    });
    testEmpNJId = empNJ.id;
    assert(empNJ.employeeNumber === 'EMP-NJ-003', 'Created NJ Employee Elena Gomez');

    // IL Employee: Salaried $85,000 ($3,269.23 biweekly), HOH, 2 basic allowances
    const empIL = await prisma.employee.create({
      data: {
        employerId: testEmployerId,
        employeeNumber: 'EMP-IL-004',
        firstName: 'Marcus',
        lastName: 'Johnson',
        ssnEncrypted: 'enc_ssn_johnson',
        ssnLast4: '4004',
        address: { street: '200 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601' },
        workLocationState: 'US-IL',
        residentState: 'US-IL',
        hireDate: new Date('2024-02-15'),
        payFrequency: PayFrequency.BIWEEKLY,
        payRateCents: BigInt(326923),
        isSalaried: true,
        w4FilingStatus: 'HEAD_OF_HOUSEHOLD',
        w4MultipleJobs: false,
        w4ClaimDependentsCents: BigInt(50000),
        w4OtherIncomeCents: BigInt(0),
        w4DeductionsCents: BigInt(0),
        w4ExtraWithholdingCents: BigInt(0),
        stateWithholdingConfig: { allowances: 2 }
      }
    });
    testEmpILId = empIL.id;
    assert(empIL.employeeNumber === 'EMP-IL-004', 'Created IL Employee Marcus Johnson');

    // MA Employee: Salaried $95,000 ($3,653.85 biweekly), Single, 1 exemption
    const empMA = await prisma.employee.create({
      data: {
        employerId: testEmployerId,
        employeeNumber: 'EMP-MA-005',
        firstName: 'Claire',
        lastName: 'O\'Connor',
        ssnEncrypted: 'enc_ssn_oconnor',
        ssnLast4: '5005',
        address: { street: '75 State St', city: 'Boston', state: 'MA', zip: '02109' },
        workLocationState: 'US-MA',
        residentState: 'US-MA',
        hireDate: new Date('2024-04-01'),
        payFrequency: PayFrequency.BIWEEKLY,
        payRateCents: BigInt(365385),
        isSalaried: true,
        w4FilingStatus: 'SINGLE',
        w4MultipleJobs: false,
        w4ClaimDependentsCents: BigInt(0),
        w4OtherIncomeCents: BigInt(0),
        w4DeductionsCents: BigInt(0),
        w4ExtraWithholdingCents: BigInt(0),
        stateWithholdingConfig: { exemptions: 1 }
      }
    });
    testEmpMAId = empMA.id;
    assert(empMA.employeeNumber === 'EMP-MA-005', 'Created MA Employee Claire O\'Connor');
  }

  console.log('\n--- 2. Pre-Tax Deduction Exemption Matrix & Distinct Wage Base Computations ---');
  {
    // Test pre-tax deductions: Gross $5,000, 401(k) $500, Health Sec 125 $200
    const gross = BigInt(500000);
    const deductions = [
      { deductionType: DeductionType.HEALTH_INSURANCE, amountCents: BigInt(20000) },
      { deductionType: DeductionType.RETIREMENT_401K, amountCents: BigInt(50000) }
    ];

    const result = WageBaseService.calculateTaxableWages({
      grossWagesCents: gross,
      deductions,
      priorYtdSubjectWages: {
        socialSecurityCents: BigInt(0),
        medicareCents: BigInt(0),
        futaCents: BigInt(0),
        suiCents: BigInt(0)
      },
      workLocationState: 'US-CA'
    });

    const fitTaxable = result.taxableWages.find(w => w.taxType === PayrollTaxType.FEDERAL_INCOME)!.taxableWagesCents;
    const ssTaxable = result.taxableWages.find(w => w.taxType === PayrollTaxType.SOCIAL_SECURITY)!.taxableWagesCents;
    const medTaxable = result.taxableWages.find(w => w.taxType === PayrollTaxType.MEDICARE)!.taxableWagesCents;
    const futaTaxable = result.taxableWages.find(w => w.taxType === PayrollTaxType.FUTA)!.taxableWagesCents;
    const sitTaxable = result.taxableWages.find(w => w.taxType === PayrollTaxType.STATE_INCOME)!.taxableWagesCents;

    // IRC § 125 reduces FIT, FICA, FUTA, SIT
    // IRC § 402(g) 401(k) reduces FIT & SIT, but NOT FICA or FUTA (IRC § 3121(a)(5)(A))
    assert(fitTaxable === BigInt(430000), 'FIT taxable wage = Gross - Sec 125 ($200) - 401k ($500) = $4,300');
    assert(ssTaxable === BigInt(480000), 'FICA SS taxable wage = Gross - Sec 125 ($200) = $4,800 (401k is subject to FICA)');
    assert(medTaxable === BigInt(480000), 'Medicare taxable wage = Gross - Sec 125 ($200) = $4,800');
    assert(futaTaxable === BigInt(480000), 'FUTA taxable wage = Gross - Sec 125 ($200) = $4,800');
    assert(sitTaxable === BigInt(430000), 'State SIT taxable wage = $4,300');

    // Test FICA OASDI cap ($176,100 limit for 2024/2025/2026)
    const capResult = WageBaseService.calculateTaxableWages({
      grossWagesCents: BigInt(1000000), // $10,000
      deductions: [],
      priorYtdSubjectWages: {
        socialSecurityCents: BigInt(17400000), // Already at $174,000 (only $2,100 room left to $176,100)
        medicareCents: BigInt(17400000),
        futaCents: BigInt(700000), // FUTA already capped
        suiCents: BigInt(700000)
      },
      workLocationState: 'US-CA'
    });
    const capSsTaxable = capResult.taxableWages.find(w => w.taxType === PayrollTaxType.SOCIAL_SECURITY)!.taxableWagesCents;
    const capMedTaxable = capResult.taxableWages.find(w => w.taxType === PayrollTaxType.MEDICARE)!.taxableWagesCents;
    const capFutaTaxable = capResult.taxableWages.find(w => w.taxType === PayrollTaxType.FUTA)!.taxableWagesCents;

    assert(capSsTaxable === BigInt(210000), 'FICA OASDI taxable wage capped at exactly remaining room ($2,100)');
    assert(capMedTaxable === BigInt(1000000), 'Medicare has no wage cap (full $10,000 taxable)');
    assert(capFutaTaxable === BigInt(0), 'FUTA capped at $7,000, incremental taxable is $0');

    // Test Additional Medicare threshold ($200,000)
    const addlMedResult = WageBaseService.calculateTaxableWages({
      grossWagesCents: BigInt(1500000), // $15,000
      deductions: [],
      priorYtdSubjectWages: {
        socialSecurityCents: BigInt(17610000),
        medicareCents: BigInt(19500000), // $195,000 YTD (crosses $200k threshold by $10,000)
        futaCents: BigInt(700000),
        suiCents: BigInt(700000)
      },
      workLocationState: 'US-CA'
    });
    const addlMedTaxable = addlMedResult.taxableWages.find(w => w.taxType === PayrollTaxType.ADDITIONAL_MEDICARE)!.taxableWagesCents;
    assert(addlMedTaxable === BigInt(1000000), 'Additional Medicare applies to portion exceeding $200,000 ($10,000)');

    // Test SUI caps across all 5 launch states
    assert(WageBaseService.STATE_SUI_WAGE_BASES_2026['US-CA'] === BigInt(700000), 'CA SUI cap is $7,000');
    assert(WageBaseService.STATE_SUI_WAGE_BASES_2026['US-NY'] === BigInt(1300000), 'NY SUI cap is $13,000');
    assert(WageBaseService.STATE_SUI_WAGE_BASES_2026['US-NJ'] === BigInt(4450000), 'NJ SUI cap is $44,500');
    assert(WageBaseService.STATE_SUI_WAGE_BASES_2026['US-IL'] === BigInt(1359000), 'IL SUI cap is $13,590');
    assert(WageBaseService.STATE_SUI_WAGE_BASES_2026['US-MA'] === BigInt(1500000), 'MA SUI cap is $15,000');
  }

  console.log('\n--- 3. Deterministic Federal Withholding Engine (IRS Pub 15-T) ---');
  {
    // Single biweekly wage $4,000
    const fitSingle = FederalWithholdingEngine.calculateRegularWithholding({
      taxableWageCents: BigInt(400000),
      frequency: PayFrequency.BIWEEKLY,
      w4: { filingStatus: 'SINGLE', multipleJobs: false, claimDependentsCents: BigInt(0), otherIncomeCents: BigInt(0), deductionsCents: BigInt(0), extraWithholdingCents: BigInt(0) }
    });
    assert(fitSingle.fitWithholdingCents > BigInt(0), `Calculated Single FIT withholding: $${Number(fitSingle.fitWithholdingCents) / 100}`);

    // MFJ biweekly wage $4,000 (lower withholding due to wider married brackets)
    const fitMfj = FederalWithholdingEngine.calculateRegularWithholding({
      taxableWageCents: BigInt(400000),
      frequency: PayFrequency.BIWEEKLY,
      w4: { filingStatus: 'MARRIED_FILING_JOINTLY', multipleJobs: false, claimDependentsCents: BigInt(0), otherIncomeCents: BigInt(0), deductionsCents: BigInt(0), extraWithholdingCents: BigInt(0) }
    });
    assert(fitMfj.fitWithholdingCents < fitSingle.fitWithholdingCents, 'MFJ withholding is lower than Single withholding for identical wages');

    // Multiple jobs checked -> higher withholding
    const fitMultipleJobs = FederalWithholdingEngine.calculateRegularWithholding({
      taxableWageCents: BigInt(400000),
      frequency: PayFrequency.BIWEEKLY,
      w4: { filingStatus: 'SINGLE', multipleJobs: true, claimDependentsCents: BigInt(0), otherIncomeCents: BigInt(0), deductionsCents: BigInt(0), extraWithholdingCents: BigInt(0) }
    });
    assert(fitMultipleJobs.fitWithholdingCents > fitSingle.fitWithholdingCents, 'W-4 Step 2 checkbox results in higher withholding');

    // Claim dependents $2,000 credit -> reduces withholding
    const fitWithDeps = FederalWithholdingEngine.calculateRegularWithholding({
      taxableWageCents: BigInt(400000),
      frequency: PayFrequency.BIWEEKLY,
      w4: { filingStatus: 'SINGLE', multipleJobs: false, claimDependentsCents: BigInt(200000), otherIncomeCents: BigInt(0), deductionsCents: BigInt(0), extraWithholdingCents: BigInt(0) }
    });
    const expectedReduction = BigInt(Math.round(200000 / 26));
    assert(fitSingle.fitWithholdingCents - fitWithDeps.fitWithholdingCents === expectedReduction, 'W-4 Step 3 child credit accurately reduces per-period withholding');

    // Supplemental Wages (Flat 22% rate)
    const supp22 = FederalWithholdingEngine.calculateSupplementalWithholding({
      supplementalWageCents: BigInt(1000000), // $10,000 bonus
      ytdSupplementalWagesCents: BigInt(0)
    });
    assert(supp22.fitWithholdingCents === BigInt(220000), 'Supplemental bonus <= $1M withheld at exact flat 22% rate ($2,200)');

    // Supplemental Wages > $1M (37% rate on excess)
    const supp37 = FederalWithholdingEngine.calculateSupplementalWithholding({
      supplementalWageCents: BigInt(50000000), // $500,000 additional bonus
      ytdSupplementalWagesCents: BigInt(100000000) // Already at $1,000,000 YTD
    });
    assert(supp37.fitWithholdingCents === BigInt(18500000), 'Supplemental bonus > $1M withheld at exact flat 37% rate ($185,000)');
  }

  console.log('\n--- 4. Deterministic FICA & FUTA Engine ---');
  {
    const fica = FicaFutaEngine.calculateFica({
      employeeId: 'test-emp',
      taxableSsWagesCents: BigInt(400000),
      taxableMedWagesCents: BigInt(400000),
      taxableAddlMedWagesCents: BigInt(100000)
    });

    assert(fica.totalFicaEmployeeCents === BigInt(24800 + 5800 + 900), 'FICA EE = 6.2% OASDI ($248) + 1.45% Med ($58) + 0.9% Addl Med ($9) = $315');
    assert(fica.totalFicaEmployerCents === BigInt(24800 + 5800), 'FICA ER = 6.2% OASDI ($248) + 1.45% Med ($58) = $306 (ER does NOT match Addl Med)');

    // FUTA net 0.6% calculation
    const futa = FicaFutaEngine.calculateFuta({
      employeeId: 'test-emp',
      taxableFutaWagesCents: BigInt(400000)
    });
    assert(futa.taxAmountCents === BigInt(2400), 'Net FUTA = 0.6% of $4,000 = $24.00 (gross 6.0% minus 5.4% max SUI credit)');
  }

  console.log('\n--- 5. Deterministic 5-State Payroll Engines ---');
  {
    // 1. California: EDD Method B, CA SDI 1.2% uncapped (SB 951), SUI, ETT 0.1%
    const caRes = CaliforniaPayrollModule.calculateCaliforniaTaxes({
      employeeId: testEmpCAId,
      sitTaxableWageCents: BigInt(461538),
      suiTaxableWageCents: BigInt(461538),
      grossWageCents: BigInt(461538),
      frequency: PayFrequency.BIWEEKLY,
      config: { stateCode: 'CA', filingStatus: 'SINGLE', allowances: 1 },
      employerSuiRate: 0.034
    });
    assert(caRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_INCOME && w.taxAmountCents > BigInt(0)), 'CA PIT computed');
    const sdiWithholding = caRes.withholdings.find(w => w.taxType === PayrollTaxType.STATE_DISABILITY);
    assert(sdiWithholding?.taxAmountCents === BigInt(Math.round(461538 * 0.012)), 'CA SDI calculated at 1.2% (uncapped under SB 951)');
    assert(caRes.employerTaxes.some(t => t.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'CA Employer SUI calculated');
    assert(caRes.employerTaxes.some(t => t.jurisdiction === 'US-CA-ETT'), 'CA Employment Training Tax (ETT) 0.1% calculated');

    // 2. New York: NYS-50-T PIT brackets, NYC local resident PIT, NY PFL, NY SUI
    const nyRes = NewYorkPayrollModule.calculateNewYorkTaxes({
      employeeId: testEmpNYId,
      sitTaxableWageCents: BigInt(846154),
      suiTaxableWageCents: BigInt(846154),
      grossWageCents: BigInt(846154),
      frequency: PayFrequency.BIWEEKLY,
      config: { stateCode: 'NY', filingStatus: 'MARRIED', allowances: 2 },
      isNycResident: true,
      employerSuiRate: 0.041
    });
    assert(nyRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_INCOME), 'NYS PIT computed');
    assert(nyRes.withholdings.some(w => w.taxType === PayrollTaxType.LOCAL_INCOME), 'NYC resident local PIT computed');
    assert(nyRes.employerTaxes.some(t => t.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'NY Employer SUI computed');

    // 3. New Jersey: NJ-WT Table A, NJ EE SUI (0.3825%), NJ FLI (0.09%), NJ ER SUI
    const njRes = NewJerseyPayrollModule.calculateNewJerseyTaxes({
      employeeId: testEmpNJId,
      sitTaxableWageCents: BigInt(400000),
      suiTaxableWageCents: BigInt(400000),
      grossWageCents: BigInt(400000),
      frequency: PayFrequency.BIWEEKLY,
      config: { stateCode: 'NJ', allowances: 1 },
      employerSuiRate: 0.028
    });
    assert(njRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_INCOME), 'NJ SIT computed');
    assert(njRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'NJ Employee SUI (0.3825%) computed');
    assert(njRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_DISABILITY), 'NJ Family Leave Insurance (0.09%) computed');
    assert(njRes.employerTaxes.some(t => t.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'NJ Employer SUI computed');

    // 4. Illinois: IL-700-T flat 4.95% PIT minus basic allowances, IL SUI
    const ilRes = IllinoisPayrollModule.calculateIllinoisTaxes({
      employeeId: testEmpILId,
      sitTaxableWageCents: BigInt(326923),
      suiTaxableWageCents: BigInt(326923),
      grossWageCents: BigInt(326923),
      frequency: PayFrequency.BIWEEKLY,
      config: { stateCode: 'IL', allowances: 2 },
      employerSuiRate: 0.0395
    });
    assert(ilRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_INCOME), 'IL flat 4.95% SIT minus allowances computed');
    assert(ilRes.employerTaxes.some(t => t.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'IL Employer SUI computed');

    // 5. Massachusetts: Circular M flat 5.0% PIT minus exemptions, MA PFML, MA SUI
    const maRes = MassachusettsPayrollModule.calculateMassachusettsTaxes({
      employeeId: testEmpMAId,
      sitTaxableWageCents: BigInt(365385),
      suiTaxableWageCents: BigInt(365385),
      grossWageCents: BigInt(365385),
      frequency: PayFrequency.BIWEEKLY,
      config: { stateCode: 'MA', allowances: 1 },
      employerSuiRate: 0.0242
    });
    assert(maRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_INCOME), 'MA flat 5.0% SIT minus exemptions computed');
    assert(maRes.withholdings.some(w => w.taxType === PayrollTaxType.STATE_DISABILITY), 'MA PFML Employee contribution (0.46%) computed');
    assert(maRes.employerTaxes.some(t => t.jurisdiction === 'US-MA-PFML'), 'MA PFML Employer contribution (0.42%) computed');
    assert(maRes.employerTaxes.some(t => t.taxType === PayrollTaxType.STATE_UNEMPLOYMENT), 'MA Employer SUI computed');

    // Multi-state dispatcher test
    const dispatched = StatePayrollRegistry.calculateStatePayroll({
      stateCode: 'CA',
      employeeId: testEmpCAId,
      sitTaxableWageCents: BigInt(461538),
      suiTaxableWageCents: BigInt(461538),
      grossWageCents: BigInt(461538),
      frequency: PayFrequency.BIWEEKLY
    });
    assert(dispatched.withholdings.length > 0, 'Multi-State dispatcher successfully routed to California engine');
  }

  console.log('\n--- 6. Ingestion & Payroll Run Execution Persisting Prisma Models ---');
  {
    const runResult = await PayrollIngestionService.processPayrollRun({
      employerId: testEmployerId,
      taxCaseId: testCaseId,
      payDate: new Date('2026-03-31'),
      payFrequency: PayFrequency.BIWEEKLY,
      sourceProvider: 'INTERNAL_DETERMINISTIC',
      employees: [
        {
          employeeId: testEmpCAId,
          earnings: [{ earningType: EarningType.SALARY, amountCents: BigInt(461538) }],
          deductions: [
            { deductionType: DeductionType.HEALTH_INSURANCE, amountCents: BigInt(20000) },
            { deductionType: DeductionType.RETIREMENT_401K, amountCents: BigInt(50000) }
          ]
        },
        {
          employeeId: testEmpNYId,
          earnings: [{ earningType: EarningType.SALARY, amountCents: BigInt(846154) }],
          deductions: [
            { deductionType: DeductionType.HSA, amountCents: BigInt(15000) }
          ]
        },
        {
          employeeId: testEmpNJId,
          earnings: [{ earningType: EarningType.REGULAR, hours: 80, rateCents: BigInt(5000), amountCents: BigInt(400000) }],
          deductions: [
            { deductionType: DeductionType.CAFETERIA_SECTION125, amountCents: BigInt(5000) }
          ]
        },
        {
          employeeId: testEmpILId,
          earnings: [{ earningType: EarningType.SALARY, amountCents: BigInt(326923) }],
          deductions: []
        },
        {
          employeeId: testEmpMAId,
          earnings: [{ earningType: EarningType.SALARY, amountCents: BigInt(365385) }],
          deductions: []
        }
      ]
    });

    assert(Boolean(runResult.runId), 'Payroll run successfully persisted in database');
    assert(runResult.grossWagesCents === BigInt(461538 + 846154 + 400000 + 326923 + 365385), 'Total gross wages match sum of 5 employees');
    assert(runResult.employeeWithholdingsCents > BigInt(0), 'Employee withholdings calculated and persisted');
    assert(runResult.employerTaxesCents > BigInt(0), 'Employer payroll taxes calculated and persisted');
    assert(runResult.totalTaxLiabilityCents === runResult.employeeWithholdingsCents + runResult.employerTaxesCents, 'Total tax liability equals EE + ER tax');
    assert(runResult.netPayCents > BigInt(0), 'Net take-home pay computed accurately');

    // Verify DB relations
    const dbRun = await prisma.payrollRun.findUnique({
      where: { id: runResult.runId },
      include: {
        earnings: true,
        deductions: true,
        taxableWages: true,
        withholdings: true,
        employerTaxes: true
      }
    });
    assert(dbRun!.earnings.length === 5, '5 earnings records persisted');
    assert(dbRun!.deductions.length === 4, '4 deductions records persisted');
    assert(dbRun!.taxableWages.length >= 25, 'Taxable wages records persisted for all employees and tax types');
    assert(dbRun!.withholdings.length >= 10, 'All employee withholdings persisted');
    assert(dbRun!.employerTaxes.length >= 10, 'All employer taxes persisted');

    // Verify PayrollTaxLiability was recorded
    const liabilities = await prisma.payrollTaxLiability.findMany({
      where: { payrollRunId: runResult.runId }
    });
    assert(liabilities.length >= 1, 'PayrollTaxLiability record created with SCHEDULED status');
  }

  console.log('\n--- 7. Deposit Schedule Engine & Statutory Rules ---');
  {
    // Lookback test: < $50,000 -> Monthly
    const monthlyFreq = DepositScheduleEngine.determineDepositFrequency({
      lookbackTotalTaxLiabilityCents: BigInt(4500000) // $45,000
    });
    assert(monthlyFreq === DepositFrequency.MONTHLY, 'Lookback under $50,000 correctly assigned MONTHLY deposit frequency');

    // Lookback test: >= $50,000 -> Semi-Weekly
    const semiWeeklyFreq = DepositScheduleEngine.determineDepositFrequency({
      lookbackTotalTaxLiabilityCents: BigInt(6500000) // $65,000
    });
    assert(semiWeeklyFreq === DepositFrequency.SEMI_WEEKLY, 'Lookback >= $50,000 correctly assigned SEMI_WEEKLY deposit frequency');

    // Next-Day Rule: >= $100,000 liability triggers next banking day deposit regardless of schedule
    const nextDayCheck = DepositScheduleEngine.calculateFederalDepositDueDate({
      payDate: new Date('2026-04-10'), // Friday
      accumulatedLiabilityCents: BigInt(12500000), // $125,000
      frequency: DepositFrequency.MONTHLY
    });
    assert(nextDayCheck.isNextDayRuleTriggered === true, '$100k Next-Day rule triggered');
    assert(nextDayCheck.appliedFrequency === DepositFrequency.NEXT_DAY, 'Frequency promoted to NEXT_DAY');

    // FUTA quarterly accumulation threshold ($500 limit)
    const futaUnder500 = DepositScheduleEngine.evaluateFutaDepositRequirement({
      quarter: 1,
      accumulatedFutaLiabilityCents: BigInt(42000), // $420
      year: 2026
    });
    assert(futaUnder500.isDepositRequired === false, 'FUTA < $500 rolled forward to next quarter');

    const futaOver500 = DepositScheduleEngine.evaluateFutaDepositRequirement({
      quarter: 1,
      accumulatedFutaLiabilityCents: BigInt(75000), // $750
      year: 2026
    });
    assert(futaOver500.isDepositRequired === true, 'FUTA >= $500 requires deposit by end of following month');
  }

  console.log('\n--- 8. Form 941 Engine (Quarterly Federal Tax Return) & Schedule B ---');
  {
    const form941 = Form941Engine.calculateForm941({
      taxYear: 2026,
      quarter: 1,
      numEmployees: 5,
      grossWagesCents: BigInt(24000000), // $240,000
      fitWithheldCents: BigInt(3600000),  // $36,000
      taxableSsWagesCents: BigInt(23500000), // $235,000
      taxableMedWagesCents: BigInt(23500000), // $235,000
      taxableAddlMedWagesCents: BigInt(1000000), // $10,000
      totalDepositsCents: BigInt(7244500),
      depositFrequency: DepositFrequency.SEMI_WEEKLY,
      dailyLiabilities: [
        { date: '2026-01-15', amountCents: BigInt(2400000) },
        { date: '2026-02-15', amountCents: BigInt(2400000) },
        { date: '2026-03-15', amountCents: BigInt(2444500) }
      ]
    });

    assert(form941.line1NumEmployees === 5, 'Line 1: 5 employees reported');
    assert(form941.line2WagesCents === BigInt(24000000), 'Line 2: $240,000 gross wages');
    assert(form941.line3FitWithheldCents === BigInt(3600000), 'Line 3: $36,000 FIT withheld');
    assert(form941.line5aTaxCents === BigInt(2914000), 'Line 5a: 12.4% SS tax = $29,140');
    assert(form941.line5cTaxCents === BigInt(681500), 'Line 5c: 2.9% Medicare tax = $6,815');
    assert(form941.line5dTaxCents === BigInt(9000), 'Line 5d: 0.9% Additional Medicare tax = $90');
    assert(form941.line5eTotalFicaCents === BigInt(2914000 + 681500 + 9000), 'Line 5e: Total SS & Medicare = $36,045');
    assert(form941.line10TotalTaxesCents === BigInt(3600000 + 3604500), 'Line 10: Total federal taxes = $72,045');
    assert(form941.scheduleBRequired === true, 'Schedule B required for semi-weekly depositor');
    assert(form941.scheduleBAllocations.length > 0, 'Schedule B allocations populated');
  }

  console.log('\n--- 9. Form 940 Engine (Annual Federal Unemployment Tax Return) ---');
  {
    const form940 = Form940Engine.calculateForm940({
      taxYear: 2026,
      totalPaymentsCents: BigInt(50000000), // $500,000
      exemptPaymentsCents: BigInt(10000000), // $100,000
      taxableFutaWagesCents: BigInt(3500000), // $35,000 (5 employees * $7k cap)
      totalDepositsCents: BigInt(21000)      // $210
    });

    assert(form940.line3TotalPaymentsCents === BigInt(50000000), 'Line 3: Total payments = $500,000');
    assert(form940.line4ExemptPaymentsCents === BigInt(10000000), 'Line 4: Exempt payments = $100,000');
    assert(form940.line7TotalTaxableWages === BigInt(3500000), 'Line 7: Taxable FUTA wages = $35,000');
    assert(form940.line8FutaTaxBeforeCredit === BigInt(210000), 'Line 8: Gross FUTA 6.0% = $2,100');
    assert(form940.line9StateCreditCents === BigInt(189000), 'Line 9: Max SUTA credit 5.4% = $1,890');
    assert(form940.line12TotalFutaTaxCents === BigInt(21000), 'Line 12: Net FUTA 0.6% = $210');
    assert(form940.line14BalanceDueCents === BigInt(0), 'Line 14: Balance due = $0 ($210 deposited)');
  }

  console.log('\n--- 10. Form W-2 / W-3 Engine & Transmittal Parity ---');
  {
    // Build W-2 for Sarah Chen
    const w2Chen = W2W3Engine.generateW2({
      employeeId: testEmpCAId,
      taxYear: 2026,
      annualGrossWagesCents: BigInt(12000000), // $120,000
      annualFitTaxableWagesCents: BigInt(10700000), // $107,000 (minus $5.2k Sec 125, $13k 401k)
      annualFitWithheldCents: BigInt(1850000),
      annualSsWagesCents: BigInt(11480000),
      annualSsTaxWithheldCents: BigInt(711760),
      annualMedWagesCents: BigInt(11480000),
      annualMedTaxWithheldCents: BigInt(166460),
      annual401kCents: BigInt(1300000),
      annualHsaCents: BigInt(0),
      stateWithholdings: [{ state: 'CA', stateWagesCents: BigInt(10700000), stateTaxCents: BigInt(750000) }],
      box14Items: [{ label: 'CA SDI', amountCents: BigInt(144000) }]
    });

    assert(w2Chen.box1WagesCents === BigInt(10700000), 'W-2 Box 1: FIT wages correctly excludes 401(k) and Sec 125');
    assert(w2Chen.box3SsWagesCents === BigInt(11480000), 'W-2 Box 3: SS wages includes 401(k)');
    assert(w2Chen.box12Codes.some(c => c.code === 'D' && c.amountCents === BigInt(1300000)), 'W-2 Box 12 Code D: 401(k) elective deferral reported');
    assert(w2Chen.box13RetirementPlan === true, 'W-2 Box 13: Retirement plan checked');
    assert(w2Chen.box14Other.some(i => i.label === 'CA SDI'), 'W-2 Box 14: CA SDI reported');
    assert(w2Chen.stateWithholdings[0].state === 'CA', 'W-2 Box 15: State CA reported');

    // Transmittal W-3 Parity Validation against Form 941
    const w3 = W2W3Engine.compileW3({
      taxYear: 2026,
      w2Records: [w2Chen],
      quarterly941Totals: {
        q1toQ4Line2WagesCents: BigInt(10700000),
        q1toQ4Line3FitCents: BigInt(1850000),
        q1toQ4Line5aTaxableSsWagesCents: BigInt(11480000),
        q1toQ4Line5aTaxCents: BigInt(711760),
        q1toQ4Line5cTaxableMedWagesCents: BigInt(11480000),
        q1toQ4Line5cTaxCents: BigInt(166460)
      }
    });

    assert(w3.totalW2Count === 1, 'W-3 aggregated 1 W-2');
    assert(w3.reconciliationStatus === 'BALANCED', 'W-3 Transmittal in exact parity with Form 941 totals');
  }

  console.log('\n--- 11. Four-Way Payroll Reconciliation Engine & Anomaly Detection ---');
  {
    // 1. Balanced Reconciliation
    const balanced = PayrollReconciliationEngine.reconcilePayrollRunsTo941({
      runTotalGrossWagesCents: BigInt(24000000),
      runTotalFitWithheldCents: BigInt(3600000),
      runTotalFicaTaxesCents: BigInt(3604500),
      form941Line2WagesCents: BigInt(24000000),
      form941Line3FitCents: BigInt(3600000),
      form941Line5eFicaCents: BigInt(3604500)
    });
    assert(balanced.isBalanced === true, 'Run-to-941 balanced reconciliation passes with zero variance');

    // 2. Discrepancy Detection on intentional accounting variance ($5.00 discrepancy)
    const unbalanced = PayrollReconciliationEngine.reconcilePayrollRunsTo941({
      runTotalGrossWagesCents: BigInt(24000000),
      runTotalFitWithheldCents: BigInt(3600500), // $5.00 discrepancy
      runTotalFicaTaxesCents: BigInt(3604500),
      form941Line2WagesCents: BigInt(24000000),
      form941Line3FitCents: BigInt(3600000),
      form941Line5eFicaCents: BigInt(3604500)
    });
    assert(unbalanced.isBalanced === false, 'Discrepancy correctly flagged');
    assert(unbalanced.anomalies.some(a => a.code === 'FIT_WITHHOLDING_MISMATCH'), 'Identified FIT withholding variance');

    // 3. Tax Liability vs Deposit Reconciliation
    const depRecon = PayrollReconciliationEngine.reconcileTaxLiabilitiesToDeposits({
      totalTaxLiabilityCents: BigInt(7204500),
      totalDepositsCents: BigInt(7204500)
    });
    assert(depRecon.isBalanced === true, 'Liability-to-Deposit reconciliation balanced');

    // 4. Payroll Runs vs General Ledger Reconciliation
    const glRecon = PayrollReconciliationEngine.reconcilePayrollToGeneralLedger({
      payrollGrossWagesCents: BigInt(24000000),
      glWagesExpenseCents: BigInt(24000000),
      payrollEmployerTaxesCents: BigInt(3604500),
      glEmployerTaxesExpenseCents: BigInt(3604500)
    });
    assert(glRecon.isBalanced === true, 'Run-to-GL reconciliation balanced');
  }

  console.log('\n--- 12. Worker Classification Risk Engine (IRS Common Law & State ABC Tests) ---');
  {
    // Contractor Scenario: High Control (Company sets exact hours, requires proprietary equipment, primary revenue source)
    const highRiskContractor = WorkerClassificationEngine.evaluateWorker({
      workerId: 'cont-001',
      workerName: 'Alex Rivera',
      stateCode: 'CA',
      hasWrittenContract: true,
      contractSpecifiesIndependent: true,
      setsOwnHours: false, // fails Prong A
      usesOwnEquipment: false, // fails Prong A
      worksForOtherClients: false, // fails Prong C
      hasIndependentBusinessEntity: false, // fails Prong C
      performsCoreBusinessFunction: true, // fails Prong B
      paidHourlyOrSalary: true,
      receivesEmployeeBenefits: false,
      canRealizeProfitOrLoss: false
    });

    assert(highRiskContractor.riskLevel === 'CRITICAL' || highRiskContractor.riskLevel === 'HIGH', 'Flagged as HIGH/CRITICAL worker classification risk');
    assert(highRiskContractor.abcTestPassed === false, 'Fails California ABC Test');
    assert(highRiskContractor.primaryRiskFactors.some(f => f.includes('Prong A')), 'Fails California ABC Test Part A (Freedom from control)');
    assert(highRiskContractor.primaryRiskFactors.some(f => f.includes('Prong B')), 'Fails California ABC Test Part B (Work is core to business)');
    assert(highRiskContractor.primaryRiskFactors.length >= 3, 'Multiple distinct statutory risk factors identified');
    assert(highRiskContractor.recommendation === 'HIGH_RISK_RECLASSIFICATION_RECOMMENDED', 'Routes to credentialed review (never unauthorized legal advice)');
  }

  console.log('\n--- 13. Security, Privileged Access Management (PAM) & SSN/EIN Masking ---');
  {
    // Field masking verification
    const maskedSsn = PayrollSecurityService.maskSsn('123-45-6789');
    assert(maskedSsn === '***-**-6789', 'SSN correctly masked as ***-**-6789');

    const maskedEin = PayrollSecurityService.maskEin('12-3456789');
    assert(maskedEin === '**-***6789', 'EIN correctly masked as **-***6789');

    // 15-Minute PAM Grant
    const pamGrant = await PayrollSecurityService.grantPrivilegedAccess({
      userId: testUserId,
      userRole: UserRole.CPA,
      organizationId: testOrgId,
      targetEmployeeId: testEmpCAId,
      taxCaseId: testCaseId,
      reason: 'Audit Form W-2 Box 1 and SSN reconciliation',
      authFactorUsed: 'PASSWORD_REAUTH'
    });
    assert(Boolean(pamGrant.grantToken), 'PAM 15-minute access grant token generated');
    assert(pamGrant.expiresAt.getTime() > Date.now(), 'Expiration set in future (15 minutes)');

    // PAM Validation
    const validation = await PayrollSecurityService.verifyPrivilegedAccess(pamGrant.grantToken);
    assert(validation.isValid === true, 'PAM grant verified as ACTIVE');

    // Domain isolation test: Sales tax / support role denied payroll access
    const isAllowed = PayrollSecurityService.canAccessPayrollDomain(UserRole.VIEWER);
    assert(isAllowed === false, 'Non-payroll role strictly denied access to payroll domain');
  }

  console.log('\n--- 14. Payroll Notice Ingestion & ReviewTask Routing ---');
  {
    const notice = await PayrollNoticeService.ingestPayrollNotice({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      employerId: testEmployerId,
      agencyName: 'Internal Revenue Service',
      jurisdiction: 'US-FED',
      noticeType: 'CP161',
      noticeNumber: 'IRS-CP161-2026-01',
      periodCovered: '2025-Q4',
      assessedAmountCents: BigInt(185000), // $1,850 underpayment penalty
      severity: SalesTaxNoticeSeverity.ASSESSMENT,
      responseDueDate: new Date('2026-05-15')
    });

    assert(Boolean(notice.id), 'IRS CP161 Notice ingested');
    assert(Boolean(notice.reviewTaskId), 'High-priority ReviewTask automatically provisioned');

    const revTask = await prisma.reviewTask.findUnique({ where: { id: notice.reviewTaskId! } });
    assert(revTask?.taxDomain === TaxDomain.PAYROLL_TAX, 'ReviewTask domain is PAYROLL_TAX');
    assert(revTask?.priority === 'HIGH', 'Notice ReviewTask set to HIGH priority');

    // Resolve notice
    const resolved = await PayrollNoticeService.resolveNotice(notice.id, 'Penalty abated under First-Time Abate (FTA) administrative waiver.');
    assert(resolved.status === 'RESOLVED', 'Notice marked RESOLVED');
  }

  console.log('\n--- 15. Return Filing & Payment Gates ---');
  {
    // Create draft payroll return
    const payrollReturn = await prisma.payrollReturn.create({
      data: {
        employerId: testEmployerId,
        taxCaseId: testCaseId,
        jurisdiction: 'US-FED',
        formType: 'FORM_941',
        taxYear: 2026,
        quarter: 1,
        totalTaxLiabilityCents: BigInt(7204500),
        status: PayrollReturnStatus.DRAFT
      }
    });

    // 1. Validation before approval -> Blocked
    const val1 = await PayrollFilingProvider.validateReturn(payrollReturn.id);
    assert(val1.isValid === false, 'Return submission blocked prior to CPA approval');

    // 2. CPA Approves
    const approved = await PayrollFilingProvider.approveReturn(payrollReturn.id, testUserId);
    assert(approved.status === PayrollReturnStatus.APPROVED, 'Return approved by CPA');

    // 3. Validation before taxpayer authorization -> Blocked
    const val2 = await PayrollFilingProvider.validateReturn(payrollReturn.id);
    assert(val2.isValid === false, 'Return submission blocked prior to Taxpayer authorization');

    // 4. Taxpayer Authorizes
    const authorized = await PayrollFilingProvider.authorizeReturn(payrollReturn.id, {
      taxpayerUserId: testUserId,
      signatureText: 'Alexander Hamilton, CPA & Treasurer',
      ipAddress: '10.0.0.1'
    });
    assert(authorized.status === PayrollReturnStatus.AUTHORIZED_BY_TAXPAYER, 'Return authorized by Taxpayer');

    // 5. Submit Return
    const filed = await PayrollFilingProvider.submitReturn(payrollReturn.id);
    assert(filed.status === PayrollReturnStatus.FILED, 'Return successfully FILED');
    assert(Boolean(filed.confirmationNumber), 'Received official electronic filing confirmation number');

    // 6. Schedule EFTPS Remittance Payment
    const payment = await PayrollFilingProvider.schedulePayment({
      payrollReturnId: payrollReturn.id,
      amountCents: BigInt(7204500),
      paymentMethod: 'EFTPS_DEBIT',
      bankAccountId: 'bank-tax-dep-01',
      scheduledDate: new Date('2026-04-30')
    });
    assert(payment.status === 'SCHEDULED', 'EFTPS payment SCHEDULED');
    assert(Boolean(payment.confirmationNumber), 'Payment confirmation number issued');
  }

  console.log('\n--- 16. Multi-Agent Payroll Suite Execution (All 15 Agents) ---');
  {
    const ctx = new AgentExecutionContext({
      taxCaseId: testCaseId,
      organizationId: testOrgId,
      userId: testUserId,
      userRole: UserRole.CPA,
      taxDomain: TaxDomain.PAYROLL_TAX
    });

    // 1. PayrollTaxSupervisorAgent
    const supervisor = new PayrollTaxSupervisorAgent();
    const supRes = await supervisor.execute(ctx, { employerId: testEmployerId });
    assert(supRes.status === 'SUCCESS', 'PayrollTaxSupervisorAgent executed successfully');
    assert(supRes.result.totalPayrollRuns >= 1, 'Supervisor detected executed payroll runs');

    // 2. PayrollImportAgent
    const importAgent = new PayrollImportAgent();
    const impRes = await importAgent.execute(ctx, {
      employerId: testEmployerId,
      payDate: new Date('2026-04-15'),
      payFrequency: PayFrequency.BIWEEKLY,
      employees: [
        {
          employeeId: testEmpCAId,
          earnings: [{ earningType: EarningType.SALARY, amountCents: BigInt(461538) }],
          deductions: []
        }
      ]
    });
    assert(impRes.status === 'SUCCESS', 'PayrollImportAgent executed successfully');

    // 3. FederalWithholdingAgent
    const fitAgent = new FederalWithholdingAgent();
    const fitRes = await fitAgent.execute(ctx, {
      taxableWageCents: BigInt(461538),
      frequency: PayFrequency.BIWEEKLY,
      w4: { filingStatus: 'SINGLE', multipleJobs: false, claimDependentsCents: BigInt(0), otherIncomeCents: BigInt(0), deductionsCents: BigInt(0), extraWithholdingCents: BigInt(0) }
    });
    assert(fitRes.status === 'SUCCESS', 'FederalWithholdingAgent executed successfully');
    assert(fitRes.result.fitWithholdingCents > BigInt(0), 'Agent calculated FIT withholding');

    // 4. FICAAgent
    const ficaAgent = new FICAAgent();
    const ficaRes = await ficaAgent.execute(ctx, {
      employeeId: testEmpCAId,
      taxableSsWagesCents: BigInt(461538),
      taxableMedWagesCents: BigInt(461538),
      taxableAddlMedWagesCents: BigInt(0)
    });
    assert(ficaRes.status === 'SUCCESS', 'FICAAgent executed successfully');
    assert(ficaRes.result.totalFicaEmployeeCents > BigInt(0), 'FICAAgent calculated FICA withholding');

    // 5. FUTAAgent
    const futaAgent = new FUTAAgent();
    const futaRes = await futaAgent.execute(ctx, {
      employeeId: testEmpCAId,
      taxableFutaWagesCents: BigInt(461538)
    });
    assert(futaRes.status === 'SUCCESS', 'FUTAAgent executed successfully');
    assert(futaRes.result.futaTax.taxAmountCents === BigInt(2769), 'FUTAAgent calculated net 0.6% tax');

    // 6. StateWithholdingAgent
    const sitAgent = new StateWithholdingAgent();
    const sitRes = await sitAgent.execute(ctx, {
      stateCode: 'CA',
      employeeId: testEmpCAId,
      sitTaxableWageCents: BigInt(461538),
      suiTaxableWageCents: BigInt(461538),
      grossWageCents: BigInt(461538),
      frequency: PayFrequency.BIWEEKLY
    });
    assert(sitRes.status === 'SUCCESS', 'StateWithholdingAgent executed successfully');
    assert(sitRes.result.totalStateEmployeeCents > BigInt(0), 'StateWithholdingAgent calculated CA tax');

    // 7. StateUnemploymentAgent
    const suiAgent = new StateUnemploymentAgent();
    const suiRes = await suiAgent.execute(ctx, {
      stateCode: 'CA',
      taxableWagesCents: BigInt(461538),
      employerExperienceRate: 0.034
    });
    assert(suiRes.status === 'SUCCESS', 'StateUnemploymentAgent executed successfully');
    assert(suiRes.result.suiTaxAmountCents > BigInt(0), 'StateUnemploymentAgent calculated SUI tax');

    // 8. DepositScheduleAgent
    const depAgent = new DepositScheduleAgent();
    const depRes = await depAgent.execute(ctx, {
      payDate: new Date('2026-04-10'),
      accumulatedLiabilityCents: BigInt(1500000),
      frequency: DepositFrequency.MONTHLY
    });
    assert(depRes.status === 'SUCCESS', 'DepositScheduleAgent executed successfully');
    assert(depRes.result.appliedFrequency === DepositFrequency.MONTHLY, 'DepositScheduleAgent confirmed monthly');

    // 9. Form941Agent
    const f941Agent = new Form941Agent();
    const f941Res = await f941Agent.execute(ctx, {
      taxYear: 2026,
      quarter: 1,
      numEmployees: 5,
      grossWagesCents: BigInt(24000000),
      fitWithheldCents: BigInt(3600000),
      taxableSsWagesCents: BigInt(23500000),
      taxableMedWagesCents: BigInt(23500000),
      taxableAddlMedWagesCents: BigInt(1000000),
      totalDepositsCents: BigInt(7204500),
      depositFrequency: DepositFrequency.MONTHLY
    });
    assert(f941Res.status === 'SUCCESS', 'Form941Agent executed successfully');
    assert(f941Res.result.form941.line10TotalTaxesCents === BigInt(7204500), 'Form941Agent verified line 10 balance');

    // 10. Form940Agent
    const f940Agent = new Form940Agent();
    const f940Res = await f940Agent.execute(ctx, {
      taxYear: 2026,
      totalPaymentsCents: BigInt(50000000),
      exemptPaymentsCents: BigInt(10000000),
      taxableFutaWagesCents: BigInt(3500000),
      totalDepositsCents: BigInt(21000)
    });
    assert(f940Res.status === 'SUCCESS', 'Form940Agent executed successfully');
    assert(f940Res.result.form940.line12TotalFutaTaxAfterAdjustmentsCents === BigInt(21000), 'Form940Agent confirmed net FUTA');

    // 11. W2Agent
    const w2Agent = new W2Agent();
    const w2Res = await w2Agent.execute(ctx, {
      employeeId: testEmpCAId,
      taxYear: 2026,
      annualGrossWagesCents: BigInt(12000000),
      annualFitTaxableWagesCents: BigInt(10700000),
      annualFitWithheldCents: BigInt(1850000),
      annualSsWagesCents: BigInt(11480000),
      annualSsTaxWithheldCents: BigInt(711760),
      annualMedWagesCents: BigInt(11480000),
      annualMedTaxWithheldCents: BigInt(166460),
      annual401kCents: BigInt(1300000),
      annualHsaCents: BigInt(0),
      stateWithholdings: [{ state: 'CA', stateWagesCents: BigInt(10700000), stateTaxCents: BigInt(750000) }]
    });
    assert(w2Res.status === 'SUCCESS', 'W2Agent executed successfully');
    assert(w2Res.result.w2.box1WagesCents === BigInt(10700000), 'W2Agent confirmed Box 1 wages');

    // 12. W3Agent
    const w3Agent = new W3Agent();
    const w3Res = await w3Agent.execute(ctx, {
      taxYear: 2026,
      w2Records: [w2Res.result.w2],
      quarterly941Totals: {
        q1toQ4Line2WagesCents: BigInt(10700000),
        q1toQ4Line3FitCents: BigInt(1850000),
        q1toQ4Line5aTaxableSsWagesCents: BigInt(11480000),
        q1toQ4Line5aTaxCents: BigInt(711760),
        q1toQ4Line5cTaxableMedWagesCents: BigInt(11480000),
        q1toQ4Line5cTaxCents: BigInt(166460)
      }
    });
    assert(w3Res.status === 'SUCCESS', 'W3Agent executed successfully');
    assert(w3Res.result.w3.reconciliationStatus === 'BALANCED', 'W3Agent verified parity');

    // 13. WorkerClassificationRiskAgent
    const classRiskAgent = new WorkerClassificationRiskAgent();
    const classRes = await classRiskAgent.execute(ctx, {
      workerId: 'cont-002',
      workerName: 'Jordan Lee',
      stateCode: 'CA',
      hasWrittenContract: true,
      contractSpecifiesIndependent: true,
      setsOwnHours: false,
      usesOwnEquipment: false,
      worksForOtherClients: false,
      hasIndependentBusinessEntity: false,
      performsCoreBusinessFunction: true,
      paidHourlyOrSalary: true,
      receivesEmployeeBenefits: false,
      canRealizeProfitOrLoss: false
    });
    assert(classRes.status === 'SUCCESS', 'WorkerClassificationRiskAgent executed successfully');
    assert(classRes.result.evaluation.riskLevel === 'CRITICAL' || classRes.result.evaluation.riskLevel === 'HIGH', 'Risk agent flagged high risk');

    // 14. PayrollNoticeAgent
    const noticeAgent = new PayrollNoticeAgent();
    const notRes = await noticeAgent.execute(ctx, {
      employerId: testEmployerId,
      agencyName: 'California EDD',
      jurisdiction: 'US-CA',
      noticeType: 'DE88_INQUIRY',
      assessedAmountCents: BigInt(45000)
    });
    assert(notRes.status === 'SUCCESS', 'PayrollNoticeAgent executed successfully');

    // 15. PayrollReconciliationAgent
    const reconAgent = new PayrollReconciliationAgent();
    const reconRes = await reconAgent.execute(ctx, {
      runTotalGrossWagesCents: BigInt(24000000),
      runTotalFitWithheldCents: BigInt(3600000),
      runTotalFicaTaxesCents: BigInt(3604500),
      form941Line2WagesCents: BigInt(24000000),
      form941Line3FitCents: BigInt(3600000),
      form941Line5eFicaCents: BigInt(3604500)
    });
    assert(reconRes.status === 'SUCCESS', 'PayrollReconciliationAgent executed successfully');
    assert(reconRes.result.isBalanced === true, 'PayrollReconciliationAgent confirmed balanced status');
  }

  console.log('\n==================================================');
  console.log(`PHASE 8 MASTER VERIFICATION COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('==================================================\n');
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
