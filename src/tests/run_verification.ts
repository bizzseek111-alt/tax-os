import { SalesTaxEngine, SAMPLE_MULTI_TIER_RATES } from '../services/SalesTaxEngine';
import { PayrollEngine, PAYROLL_CONSTANTS_2027 } from '../services/PayrollEngine';
import { WorkerClassificationGuard } from '../services/WorkerClassificationGuard';
import { ReconciliationEngine } from '../services/ReconciliationEngine';
import { EntitlementsGuard } from '../services/EntitlementsGuard';
import { MOCK_WORKER_CLASSIFICATIONS } from '../services/MockData';
import { UserContext, UserRole } from '../types/security';

declare const process: any;

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

console.log('====================================================');
console.log('TAXOS COMPREHENSIVE MULTI-DOMAIN VERIFICATION SUITE');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1: Sales Tax Multi-Tier Jurisdictional Modeling
// ----------------------------------------------------
console.log('[Domain: Sales Tax] Multi-Tier Rate Verification');
const laRate = SAMPLE_MULTI_TIER_RATES['CA_LOS_ANGELES'];
assert(laRate.stateRate === 0.0600, 'California state base rate is 6.00%');
assert(laRate.countyRate === 0.0025, 'LA County base rate is 0.25%');
assert(laRate.cityRate === 0.0125, 'LA City rate is 1.25%');
assert(laRate.specialDistrictRate === 0.0200, 'LA MTA District rate is 2.00%');
assert(laRate.compositeRate === 0.0950, 'Composite rate sums correctly to 9.50% (NOT a single state rate)');

const nycRate = SAMPLE_MULTI_TIER_RATES['NY_NEW_YORK_CITY'];
assert(nycRate.compositeRate === 0.08875, 'NYC composite rate stacks state (4%) + city (4.5%) + MCTD (0.375%)');

// ----------------------------------------------------
// TEST 2: SaaS Taxability Rules Across States
// ----------------------------------------------------
console.log('\n[Domain: Sales Tax] SaaS Taxability Rules');
const txSaas = SalesTaxEngine.determineTaxability('SW_SAAS', 'TX');
assert(txSaas.rateFactor === 0.80, 'Texas data processing/SaaS is 80% taxable pursuant to Tex. Tax Code § 151.011');

const caSaas = SalesTaxEngine.determineTaxability('SW_SAAS', 'CA');
assert(caSaas.status === 'EXEMPT', 'California SaaS is exempt under Cal. Reg. 1502');

const nySaas = SalesTaxEngine.determineTaxability('SW_SAAS', 'NY');
assert(nySaas.status === 'TAXABLE', 'New York SaaS is taxable as prewritten software under TSB-M-08(7)S');

// ----------------------------------------------------
// TEST 3: Economic Nexus Evaluation
// ----------------------------------------------------
console.log('\n[Domain: Sales Tax] Economic Nexus Evaluation');
const subThresholdNexus = SalesTaxEngine.evaluateNexus({
  id: 'nexus-test',
  stateCode: 'TX',
  stateName: 'Texas',
  nexusType: 'ECONOMIC',
  thresholdType: 'SALES_AMOUNT_ONLY',
  thresholdAmount: 500000,
  measurementPeriod: 'TRAILING_12_MONTHS',
  currentTrailingSales: 250000,
  currentTrailingTransactions: 50,
  percentageTowardsThreshold: 50,
  hasNexus: false,
  registrationStatus: 'NOT_REQUIRED',
  filingObligation: 'OCCASIONAL',
  events: []
});
assert(!subThresholdNexus.hasNexus, 'Sub-threshold sales do not trigger nexus');
assert(subThresholdNexus.percentage === 50, 'Nexus progress meter accurately computes 50%');

// ----------------------------------------------------
// TEST 4: Payroll Withholding & FICA Capping
// ----------------------------------------------------
console.log('\n[Domain: Payroll Tax] Withholding & Statutory Caps');
const highEarnerWithholding = PayrollEngine.calculateEmployeeWithholding({
  grossWages: 10000,
  ytdGrossWages: 195000, // Exceeds Social Security cap ($168.6k) and reaches near $200k Add'l Med threshold
  preTaxDeductions: [],
  filingStatus: 'SINGLE_OR_SEPARATE',
  stateCode: 'CA',
  extraWithholding: 0
});
assert(highEarnerWithholding.withholding.socialSecurityEmployee === 0, 'Social Security tax is capped once YTD exceeds $168,600');
assert(highEarnerWithholding.withholding.medicareEmployee === 145, 'Medicare employee tax remains uncapped (1.45% of $10,000 = $145)');
assert(highEarnerWithholding.withholding.additionalMedicareEmployee === 45, 'Additional Medicare 0.9% applies to wages exceeding $200,000 threshold ($5,000 * 0.9% = $45)');

// ----------------------------------------------------
// TEST 5: IRC § 6302 Deposit Schedule Evaluation
// ----------------------------------------------------
console.log('\n[Domain: Payroll Tax] IRC § 6302 Lookback Deposit Schedule');
const monthlySchedule = PayrollEngine.determineDepositSchedule(45000);
assert(monthlySchedule.federalSchedule === 'MONTHLY', 'Lookback liability <= $50,000 mandates Monthly schedule');

const semiWeeklySchedule = PayrollEngine.determineDepositSchedule(85000);
assert(semiWeeklySchedule.federalSchedule === 'SEMI_WEEKLY', 'Lookback liability > $50,000 mandates Semi-Weekly schedule');

// ----------------------------------------------------
// TEST 6: AI Worker Classification Safeguards
// ----------------------------------------------------
console.log('\n[Domain: Payroll Tax] Worker Classification Safeguard Engine');
const contractorRecord = MOCK_WORKER_CLASSIFICATIONS[0];
const classificationAudit = WorkerClassificationGuard.analyzeWorker(contractorRecord);
assert(classificationAudit.mandatoryProfessionalEscalation, 'Inconsistent contractor facts trigger mandatory professional escalation');
assert(classificationAudit.legalDisclaimer.includes('DOES NOT render legal advice'), 'AI safeguard notice explicitly disclaims legal determination');
assert(classificationAudit.applicableAuthorities.length >= 3, 'Audit dossier cites statutory authorities (IRS Rev. Rul. 87-41, IRC § 3121, ABC test)');

// ----------------------------------------------------
// TEST 7: Cross-Domain Reconciliations
// ----------------------------------------------------
console.log('\n[Shared Core] Cross-Domain Reconciliation Engine');
const salesRecon = ReconciliationEngine.reconcileSalesTax({
  periodId: 'p1',
  stateCode: 'CA',
  storefrontGross: 100000,
  generalLedgerGross: 100000,
  marketplaceSales: 40000,
  directSales: 60000,
  exemptSales: 10000,
  taxCollectedDirectly: 4750,
  taxCollectedMarketplace: 3800,
  remittedAmount: 4750
});
assert(!salesRecon.isDiscrepancyDetected, 'Matching sales tax records report zero discrepancy');

const payrollRecon = ReconciliationEngine.reconcilePayroll({
  taxYear: 2027,
  providerWagesYTD: 500000,
  quarterly941TotalWages: 500000,
  w3Box1Wages: 500000,
  glPayrollExpense: 550000,
  bankPayrollDisbursements: 550000
});
assert(payrollRecon.isFullyReconciled, 'Quarterly 941 wages match annual W-3 and general ledger');

// ----------------------------------------------------
// TEST 8: Zero-Trust RBAC Isolation (Income Preparer vs. Payroll PII)
// ----------------------------------------------------
console.log('\n[Security] RBAC & Domain Isolation');
const incomePreparer = EntitlementsGuard.createUserContext('prep-1', 'Preparer', 'INCOME_TAX_PREPARER', 'prep@tax.com');
const payrollAdmin = EntitlementsGuard.createUserContext('admin-1', 'Admin', 'PAYROLL_ADMIN', 'admin@tax.com');

const rawSSN = '123-45-6789';
const maskedForPreparer = EntitlementsGuard.maskSSN(rawSSN, incomePreparer);
const unmaskedForAdmin = EntitlementsGuard.maskSSN(rawSSN, payrollAdmin);
assert(maskedForPreparer === '***-**-6789', 'Income tax preparer receives masked SSN');
assert(unmaskedForAdmin === rawSSN, 'Payroll admin receives unmasked SSN');

const rawSalary = 150000;
const salaryForPreparer = EntitlementsGuard.maskCompensation(rawSalary, incomePreparer);
const salaryForAdmin = EntitlementsGuard.maskCompensation(rawSalary, payrollAdmin);
assert(salaryForPreparer.includes('RESTRICTED'), 'Income tax preparer is blocked from individual employee compensation');
assert(salaryForAdmin === '$150,000.00', 'Payroll admin can view compensation');

// ----------------------------------------------------
// TEST 9: Modular B2B Entitlements Tiers
// ----------------------------------------------------
console.log('\n[Security] Modular B2B Subscriptions');
const incomeOnlyTenant = EntitlementsGuard.createTenantEntitlements('t1', 'Company A', 'INCOME_TAX_ONLY');
assert(EntitlementsGuard.isDomainEntitled(incomeOnlyTenant, 'INCOME_TAX'), 'Income tax is entitled');
assert(!EntitlementsGuard.isDomainEntitled(incomeOnlyTenant, 'SALES_USE_TAX'), 'Sales tax is NOT entitled for Income Only tier');
assert(!EntitlementsGuard.isDomainEntitled(incomeOnlyTenant, 'PAYROLL_TAX'), 'Payroll tax is NOT entitled for Income Only tier');

const fullOsTenant = EntitlementsGuard.createTenantEntitlements('t2', 'Company B', 'FULL_TAX_OS');
assert(EntitlementsGuard.isDomainEntitled(fullOsTenant, 'INCOME_TAX'), 'Full OS entitles Income Tax');
assert(EntitlementsGuard.isDomainEntitled(fullOsTenant, 'SALES_USE_TAX'), 'Full OS entitles Sales Tax');
assert(EntitlementsGuard.isDomainEntitled(fullOsTenant, 'PAYROLL_TAX'), 'Full OS entitles Payroll Tax');

// ----------------------------------------------------
// TEST 10: Tax Deadlines & IRC § 7503 Statutory Rollover
// ----------------------------------------------------
console.log('\n[Operations] Tax Deadlines & IRC § 7503 Rollover Engine');
import { TaxDeadlinesEngine } from '../services/TaxDeadlinesEngine';
const satDate = '2027-05-15'; // 2027-05-15 is a Saturday!
const rolloverSat = TaxDeadlinesEngine.applyStatutoryRollover(satDate);
assert(rolloverSat.isRolled, 'Saturday statutory deadline triggers rollover');
assert(rolloverSat.effectiveDate === '2027-05-17', 'Saturday deadline rolls forward to Monday under IRC § 7503');

const wedDate = '2027-04-07'; // Wednesday
const rolloverWed = TaxDeadlinesEngine.applyStatutoryRollover(wedDate);
assert(!rolloverWed.isRolled, 'Weekday deadline requires no rollover');
assert(rolloverWed.effectiveDate === wedDate, 'Weekday deadline remains unchanged');

// ----------------------------------------------------
// TEST 11: NACHA CCD+ TXP Banking Addenda Formatting
// ----------------------------------------------------
console.log('\n[Operations] NACHA CCD+ TXP Electronic Tax Payment Engine');
import { TaxPaymentsEngine } from '../services/TaxPaymentsEngine';
const txpString = TaxPaymentsEngine.formatNachaTxpRecord({
  tin: '88-4928172',
  taxTypeCode: '94101',
  periodEndDate: '2027-03-31',
  amountCents: 2424000 // $24,240.00
});
assert(txpString === 'TXP*884928172*94101*270331*T*2424000*\\', 'NACHA CCD+ TXP record formats correctly with standard delimiters');

// ----------------------------------------------------
// TEST 12: Treas. Reg. § 31.6302-1(f) Payroll 98% Safe Harbor
// ----------------------------------------------------
console.log('\n[Operations] Payroll Deposit Safe Harbor Evaluation');
const safeHarborPass = TaxPaymentsEngine.evaluatePayrollSafeHarbor(98500, 100000); // 98.5% deposited (shortfall $1,500 < 2% / $2,000)
assert(safeHarborPass.isSafeHarborMet, 'Deposit covering >= 98% satisfies semi-weekly shortfall safe harbor');

const safeHarborFail = TaxPaymentsEngine.evaluatePayrollSafeHarbor(95000, 100000); // 95% deposited (shortfall $5,000 > $2,000)
assert(!safeHarborFail.isSafeHarborMet, 'Deposit covering < 98% breaches safe harbor and flags IRC § 6656 penalty exposure');

// ----------------------------------------------------
// TEST 13: Multi-State Registration Mandates
// ----------------------------------------------------
console.log('\n[Operations] State Tax Registrations Lifecycle');
import { TaxRegistrationsEngine } from '../services/TaxRegistrationsEngine';
const existingRegs = TaxRegistrationsEngine.getBusinessRegistrations();
const remoteHiredInColorado = TaxRegistrationsEngine.evaluateRegistrationMandate({
  eventType: 'REMOTE_EMPLOYEE_HIRED',
  stateCode: 'CO',
  existingRegistrations: existingRegs
});
assert(remoteHiredInColorado.requiresWithholdingAccount, 'Hiring remote worker in CO mandates State Withholding registration');
assert(remoteHiredInColorado.requiresSutaAccount, 'Hiring remote worker in CO mandates State Unemployment (SUTA) account');
assert(remoteHiredInColorado.requiresForeignQualification, 'Hiring remote worker in CO mandates Secretary of State Foreign Qualification');

// ----------------------------------------------------
// TEST 14: TaxCase Polymorphic Hierarchy & Cross-Domain Linkage
// ----------------------------------------------------
console.log('\n[Core Architecture] TaxCase Polymorphic Hierarchy');
import { MOCK_INCOME_TAX_CASE, MOCK_SALES_TAX_CASE, MOCK_PAYROLL_TAX_CASE } from '../services/MockData';

// 1. Verify IncomeTaxCase specialization
assert(MOCK_INCOME_TAX_CASE.domain === 'INCOME_TAX', 'IncomeTaxCase has domain INCOME_TAX');
assert(MOCK_INCOME_TAX_CASE.entityStructure === 'S_CORP_1120S', 'IncomeTaxCase retains S-Corp pass-through structure');
assert(MOCK_INCOME_TAX_CASE.line8WageDeductionLink?.verifiedAggregateWages === 1280000, 'IncomeTaxCase links to verified wage total');

// 2. Verify SalesTaxCase specialization
assert(MOCK_SALES_TAX_CASE.domain === 'SALES_USE_TAX', 'SalesTaxCase has domain SALES_USE_TAX');
assert(MOCK_SALES_TAX_CASE.stateCode === 'CA', 'SalesTaxCase tracks jurisdiction CA-CDTFA');
assert(MOCK_SALES_TAX_CASE.compositeRateApplied === 0.0950, 'SalesTaxCase applies 9.50% multi-tier rate');

// 3. Verify PayrollTaxCase specialization
assert(MOCK_PAYROLL_TAX_CASE.domain === 'PAYROLL_TAX', 'PayrollTaxCase has domain PAYROLL_TAX');
assert(MOCK_PAYROLL_TAX_CASE.formType === 'FORM_941', 'PayrollTaxCase tracks quarterly Form 941');
assert(MOCK_PAYROLL_TAX_CASE.depositSchedule === 'SEMI_WEEKLY', 'PayrollTaxCase tracks Semi-Weekly deposit schedule');

// 4. Verify Polymorphism: All three are valid TaxCases
function validateGenericCase(taxCase: import('../types/taxCase').TaxCase): boolean {
  return taxCase.businessId.length > 0 && taxCase.taxYear === 2027 && taxCase.readinessScore > 0;
}
assert(validateGenericCase(MOCK_INCOME_TAX_CASE), 'IncomeTaxCase passes generic TaxCase validation');
assert(validateGenericCase(MOCK_SALES_TAX_CASE), 'SalesTaxCase passes generic TaxCase validation');
assert(validateGenericCase(MOCK_PAYROLL_TAX_CASE), 'PayrollTaxCase passes generic TaxCase validation');

console.log('\n====================================================');
console.log('ALL 14 DOMAIN & HIERARCHY VERIFICATION TESTS PASSED! 🎉');
console.log('====================================================');
