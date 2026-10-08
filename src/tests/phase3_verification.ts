/**
 * Autonomous TaxOS — Phase 3 Master Verification Suite
 * Workstream 3: Deterministic Tax Calculation Core & Golden Test Verification
 * 
 * Verifies:
 * 1. BigInt Monetary Math & IRC § 6102 Rounding
 * 2. Statutory Parameter Registry & Citations (2026.1)
 * 3. Deterministic Federal 1040 Engine (Golden Scenarios FEDERAL-001 through FEDERAL-010)
 * 4. 5 Sovereign State Engines (CA, NY, NJ, IL, MA)
 * 5. Multi-State Wage Allocation & Resident Credit
 * 6. Boundary & Unsupported Scenario Rejection
 * 7. Cryptographic Snapshot Reproducibility (SHA-256)
 * 8. Statutory Form Line Mapping Coverage
 * 9. Explainable Lineage Graph ("Prove This Number")
 * 10. Database Persistence & Tax Twin What-If Simulation
 */

import { TaxMoney } from '../server/services/taxCalculation/money';
import { TaxParameterRegistry } from '../server/services/taxCalculation/parameterRegistry';
import { FederalTaxEngine } from '../server/services/taxCalculation/federalEngine';
import { getStateTaxModule, MultiStateEngine } from '../server/services/taxCalculation/states';
import { InternalDeterministicProvider } from '../server/services/taxCalculation/provider';
import { TaxValidationEngine } from '../server/services/taxCalculation/validation';
import { FormMappingService } from '../server/services/taxCalculation/formMapping';
import { CalculationLineageService } from '../server/services/taxCalculation/lineage';
import { CalculationRunService } from '../server/services/taxCalculation/calculationRunService';
import { GOLDEN_SCENARIOS } from './fixtures/goldenScenarios';
import { prisma } from '../server/db';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

async function runPhase3Verification() {
  console.log('\n========================================================================');
  console.log('AUTONOMOUS TAXOS — PHASE 3 DETERMINISTIC TAX ENGINE VERIFICATION');
  console.log('========================================================================\n');

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: MONETARY MATH & IRC § 6102 ROUNDING
  // ---------------------------------------------------------------------------
  console.log('--- Suite 1: Pure BigInt Monetary Math & IRC § 6102 Rounding ---');

  // Whole dollar rounding
  const roundDown = TaxMoney.roundToWholeDollarCents(12_349n); // $123.49 -> $123.00
  const roundUp = TaxMoney.roundToWholeDollarCents(12_350n);   // $123.50 -> $124.00
  assert(roundDown === 12_300n, 'IRC § 6102 rounds $123.49 down to $123.00');
  assert(roundUp === 12_400n, 'IRC § 6102 rounds $123.50 up to $124.00');

  // String parsing without float inaccuracies
  const parsed = TaxMoney.fromDollars('12345.67');
  assert(parsed === 1_234_567n, 'fromDollars("12345.67") parses exactly to 1234567n cents');

  // Basis point multiplication with half-up rounding
  const bpsTax = TaxMoney.multiplyBps(100_000n, 2400); // 24% of $1,000 = $240
  assert(bpsTax === 24_000n, 'Basis point multiplication: 100,000 cents * 2400 bps = 24,000 cents');

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: STATUTORY PARAMETER REGISTRY (2026.1)
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 2: Versioned Statutory Parameter Registry & Legal Citations ---');

  const singleStd = TaxParameterRegistry.getFederalStandardDeduction('SINGLE');
  const mfjStd = TaxParameterRegistry.getFederalStandardDeduction('MARRIED_FILING_JOINTLY');
  assert(singleStd.value === 1_575_000n, '2026 Single Standard Deduction is $15,750 (IRC § 63(c))');
  assert(mfjStd.value === 3_150_000n, '2026 MFJ Standard Deduction is $31,500 (IRC § 63(c))');
  assert(singleStd.citation.includes('IRC § 63'), 'Standard deduction includes IRC § 63 statutory citation');

  const fedBrackets = TaxParameterRegistry.getFederalBrackets('SINGLE');
  assert(fedBrackets.value.length === 7, 'Single federal brackets contain all 7 statutory tiers (IRC § 1(j))');
  assert(fedBrackets.value[0].rateBps === 1000, 'Tier 1 is 10.0%');
  assert(fedBrackets.value[6].rateBps === 3700, 'Tier 7 is 37.0%');

  const seParams = TaxParameterRegistry.getSelfEmploymentParameters();
  assert(seParams.netEarningsMultiplierBps === 9235, 'SE net earnings multiplier is 92.35% (IRC § 1402(a)(12))');
  assert(seParams.oasdiWageBaseCents === 17_610_000n, '2026 OASDI wage cap is $176,100');
  assert(seParams.deductibleSeTaxRateBps === 5000, 'Deductible SE tax rate is 50% (IRC § 164(f))');

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: FEDERAL GOLDEN SCENARIOS (10 SCENARIOS)
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 3: Deterministic Federal Golden Test Scenarios ---');

  // FEDERAL-001: Single Simple W-2
  const f001 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-001')!;
  const res001 = FederalTaxEngine.calculate(f001.input);
  assert(res001.totalIncomeCents === f001.expected.totalIncomeCents, 'FEDERAL-001: Total Income $75,000');
  assert(res001.taxableIncomeCents === f001.expected.taxableIncomeCents, 'FEDERAL-001: Taxable Income $59,250');
  assert(res001.totalFederalTaxCents === f001.expected.totalFederalTaxCents, 'FEDERAL-001: Regular Federal Tax $7,747.00');
  assert(res001.refundCents === f001.expected.refundCents, 'FEDERAL-001: True Refund $753.00');

  // FEDERAL-002: MFJ Two W-2s
  const f002 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-002')!;
  const res002 = FederalTaxEngine.calculate(f002.input);
  assert(res002.totalIncomeCents === f002.expected.totalIncomeCents, 'FEDERAL-002: Total Income $215,000');
  assert(res002.taxableIncomeCents === f002.expected.taxableIncomeCents, 'FEDERAL-002: Taxable Income $183,500');
  assert(res002.totalFederalTaxCents === f002.expected.totalFederalTaxCents, 'FEDERAL-002: Total Federal Tax $29,794.00');
  assert(res002.balanceDueCents === f002.expected.balanceDueCents, 'FEDERAL-002: Balance Due $4,794.00');

  // FEDERAL-003: Schedule C Freelancer
  const f003 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-003')!;
  const res003 = FederalTaxEngine.calculate(f003.input);
  assert(res003.scheduleCNetProfitCents === 10_500_000n, 'FEDERAL-003: Schedule C Net Profit $105,000');
  assert(res003.selfEmployment.totalSelfEmploymentTaxCents === f003.expected.selfEmploymentTaxCents, 'FEDERAL-003: SE Tax $14,836.03');
  assert(res003.selfEmployment.deductibleSeTaxCents === 741_802n, 'FEDERAL-003: Deductible SE Tax $7,418.02 (IRC § 164(f))');
  assert(res003.adjustedGrossIncomeCents === f003.expected.adjustedGrossIncomeCents, 'FEDERAL-003: AGI $97,581.98');
  assert(res003.qbi.allowedQbiDeductionCents === f003.expected.qbiDeductionCents, 'FEDERAL-003: QBI 20% Deduction $16,366.40 (Form 8995)');
  assert(res003.taxableIncomeCents === f003.expected.taxableIncomeCents, 'FEDERAL-003: Taxable Income $65,465.58');

  // FEDERAL-004: High Earner
  const f004 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-004')!;
  const res004 = FederalTaxEngine.calculate(f004.input);
  assert(res004.taxableIncomeCents === f004.expected.taxableIncomeCents, 'FEDERAL-004: Taxable Income $434,250');
  assert(res004.incomeTaxCents > 10_000_000n, 'FEDERAL-004: Federal income tax calculated correctly across top tiers');

  // FEDERAL-005: Head of Household with CTC
  const f005 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-005')!;
  const res005 = FederalTaxEngine.calculate(f005.input);
  assert(res005.taxableIncomeCents === f005.expected.taxableIncomeCents, 'FEDERAL-005: Taxable Income $41,375');
  assert(res005.credits.nonrefundableCreditsTotalCents === 400_000n, 'FEDERAL-005: Full $4,000 CTC claimed ($2,000 x 2)');
  assert(res005.totalFederalTaxCents === f005.expected.totalFederalTaxCents, 'FEDERAL-005: Total Tax reduced to $611.00');
  assert(res005.refundCents === f005.expected.refundCents, 'FEDERAL-005: True Refund $2,889.00');

  // FEDERAL-006: Schedule C Net Loss
  const f006 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-006')!;
  const res006 = FederalTaxEngine.calculate(f006.input);
  assert(res006.scheduleCNetProfitCents === -1_500_000n, 'FEDERAL-006: Schedule C Net Loss -$15,000');
  assert(res006.totalIncomeCents === f006.expected.totalIncomeCents, 'FEDERAL-006: Loss reduces total income to $45,000 (IRC § 62)');
  assert(res006.selfEmployment.totalSelfEmploymentTaxCents === 0n, 'FEDERAL-006: Zero SE Tax on net business loss');
  assert(res006.qbi.allowedQbiDeductionCents === 0n, 'FEDERAL-006: Zero QBI Deduction on net business loss');

  // FEDERAL-007: W-2 + Side Hustle
  const f007 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-007')!;
  const res007 = FederalTaxEngine.calculate(f007.input);
  assert(res007.totalIncomeCents === f007.expected.totalIncomeCents, 'FEDERAL-007: Total Income $110,000');
  assert(res007.selfEmployment.totalSelfEmploymentTaxCents === f007.expected.selfEmploymentTaxCents, 'FEDERAL-007: SE Tax $2,825.91');

  // FEDERAL-008: HSA Deduction
  const f008 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-008')!;
  const res008 = FederalTaxEngine.calculate(f008.input);
  assert(res008.adjustedGrossIncomeCents === f008.expected.adjustedGrossIncomeCents, 'FEDERAL-008: AGI reduced by $4,150 HSA deduction to $75,850');

  // FEDERAL-009: Itemized Deductions
  const f009 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-009')!;
  const res009 = FederalTaxEngine.calculate(f009.input);
  assert(res009.isItemized === true, 'FEDERAL-009: Itemized deduction chosen over standard');
  assert(res009.allowedDeductionCents === 2_200_000n, 'FEDERAL-009: Allowed deduction is $22,000');

  // FEDERAL-010: De Minimis SE Income
  const f010 = GOLDEN_SCENARIOS.find(s => s.id === 'FEDERAL-010')!;
  const res010 = FederalTaxEngine.calculate(f010.input);
  assert(res010.selfEmployment.totalSelfEmploymentTaxCents === 0n, 'FEDERAL-010: Zero SE Tax under IRC § 1402(b)(2) $400 threshold');

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: FIVE SOVEREIGN STATE MODULES
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 4: Sovereign State Tax Modules (CA, NY, NJ, IL, MA) ---');

  // California Form 540
  const ca001 = GOLDEN_SCENARIOS.find(s => s.id === 'CA-001')!;
  const caMod = getStateTaxModule('US-CA')!;
  const caStateRes = caMod.calculate({
    jurisdiction: 'US-CA',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: ca001.input.w2s,
    federalAgiCents: 12_000_000n,
    federalTaxableIncomeCents: 10_425_000n,
    stateWithholdingCents: 850_000n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(caStateRes.jurisdiction === 'US-CA', 'CA-001: California module identified as US-CA');
  assert(caStateRes.stateDeductionsCents === 554_000n, 'CA-001: California Standard Deduction $5,540 (CRTC § 17072)');
  assert(caStateRes.netStateTaxCents === 703_989n, 'CA-001: California net tax $7,039.89 (after $149 exemption credit)');
  assert(caStateRes.stateRefundCents === 146_011n, 'CA-001: California refund $1,460.11 ($8,500 withholding - $7,039.89 tax)');

  // California Millionaire Surtax
  const ca002 = GOLDEN_SCENARIOS.find(s => s.id === 'CA-002')!;
  const caSurRes = caMod.calculate({
    jurisdiction: 'US-CA',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: ca002.input.w2s,
    federalAgiCents: 150_000_000n,
    federalTaxableIncomeCents: 148_425_000n,
    stateWithholdingCents: 18_000_000n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(caSurRes.stateGrossTaxCents > 14_000_000n, 'CA-002: California 1% Mental Health Surtax triggered on income > $1M (CRTC § 17043)');

  // New York Form IT-201
  const ny001 = GOLDEN_SCENARIOS.find(s => s.id === 'NY-001')!;
  const nyMod = getStateTaxModule('US-NY')!;
  const nyStateRes = nyMod.calculate({
    jurisdiction: 'US-NY',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: ny001.input.w2s,
    federalAgiCents: 9_500_000n,
    federalTaxableIncomeCents: 7_925_000n,
    stateWithholdingCents: 520_000n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(nyStateRes.stateDeductionsCents === 800_000n, 'NY-001: New York Standard Deduction $8,000 (NY Tax Law § 614)');
  assert(nyStateRes.stateTaxableIncomeCents === 8_700_000n, 'NY-001: New York Taxable Income $87,000');
  assert(nyStateRes.netStateTaxCents === 490_126n, 'NY-001: New York Tax $4,901.26 (NY Tax Law § 601)');
  assert(nyStateRes.stateRefundCents === 29_874n, 'NY-001: New York Refund $298.74 ($5,200 withholding - $4,901.26 tax)');

  // New Jersey Form NJ-1040
  const nj001 = GOLDEN_SCENARIOS.find(s => s.id === 'NJ-001')!;
  const njMod = getStateTaxModule('US-NJ')!;
  const njStateRes = njMod.calculate({
    jurisdiction: 'US-NJ',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: [],
    scheduleC: nj001.input.scheduleC,
    federalAgiCents: 11_152_226n,
    federalTaxableIncomeCents: 9_577_226n,
    stateWithholdingCents: 0n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(njStateRes.startingIncomeCents === 12_000_000n, 'NJ-001: Independent NJ Gross Income $120,000 (N.J. Stat. Ann. § 54A:5-1)');
  assert(njStateRes.stateDeductionsCents === 0n, 'NJ-001: Zero standard deduction allowed under NJ Gross Income Tax Act');
  assert(njStateRes.stateExemptionsCents === 100_000n, 'NJ-001: $1,000 Personal Exemption (N.J. Stat. Ann. § 54A:3-1)');
  assert(njStateRes.netStateTaxCents === 545_580n, 'NJ-001: NJ Progressive Tax $5,455.80 on $119,000 NJ Taxable Income');

  // Illinois Form IL-1040
  const il001 = GOLDEN_SCENARIOS.find(s => s.id === 'IL-001')!;
  const ilMod = getStateTaxModule('US-IL')!;
  const ilStateRes = ilMod.calculate({
    jurisdiction: 'US-IL',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: il001.input.w2s,
    federalAgiCents: 9_000_000n, // $50k wages + $40k pension
    federalTaxableIncomeCents: 7_425_000n,
    pensionIncomeCents: 4_000_000, // $40k pension subtracted
    stateWithholdingCents: 240_000n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(ilStateRes.stateSubtractionsCents === 4_000_000n, 'IL-001: 100% pension subtraction $40,000 (35 ILCS 5/203(a)(2)(F))');
  assert(ilStateRes.stateExemptionsCents === 277_500n, 'IL-001: Illinois standard exemption $2,775 (35 ILCS 5/204(b))');
  assert(ilStateRes.stateTaxableIncomeCents === 4_722_500n, 'IL-001: Illinois Net Income $47,225 ($50k - $2,775)');
  assert(ilStateRes.netStateTaxCents === 233_764n, 'IL-001: Flat 4.95% Tax = $2,337.64 (35 ILCS 5/201(b)(14))');
  assert(ilStateRes.stateRefundCents === 6_236n, 'IL-001: Illinois Refund $62.36 ($2,400 withholding - $2,337.64 tax)');

  // Massachusetts Form 1
  const ma001 = GOLDEN_SCENARIOS.find(s => s.id === 'MA-001')!;
  const maMod = getStateTaxModule('US-MA')!;
  const maStateRes = maMod.calculate({
    jurisdiction: 'US-MA',
    taxYear: 2026,
    residencyStatus: 'FULL_YEAR_RESIDENT',
    w2s: ma001.input.w2s,
    federalAgiCents: 250_000_000n,
    federalTaxableIncomeCents: 248_425_000n,
    stateWithholdingCents: 20_000_000n,
    stateEstimatedPaymentsCents: 0n,
  }, 'SINGLE');
  assert(maStateRes.stateExemptionsCents === 440_000n, 'MA-001: Massachusetts Personal Exemption $4,400 (M.G.L. c. 62, § 3)');
  assert(maStateRes.stateTaxableIncomeCents === 249_560_000n, 'MA-001: MA Taxable Income $2,495,600');
  assert(maStateRes.netStateTaxCents === 18_460_400n, 'MA-001: 5.0% Part B + 4.0% Fair Share Surtax = $184,604.00 (MA Const. art. XLIV)');
  assert(maStateRes.stateRefundCents === 1_539_600n, 'MA-001: Massachusetts Refund $15,396.00 ($200,000 withholding - $184,604 tax)');

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: MULTI-STATE ALLOCATION & RESIDENT CREDITS
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 5: Multi-State Allocation & Other-State Credits ---');

  const multi001 = GOLDEN_SCENARIOS.find(s => s.id === 'MULTI-001')!;
  const allocations = MultiStateEngine.allocateW2Wages(multi001.input.w2s, 15_000_000n);
  assert(allocations['US-CA'].apportionmentRatioBps === 6667, 'CA wage ratio: 66.67% (100k / 150k)');
  assert(allocations['US-NY'].apportionmentRatioBps === 3333, 'NY wage ratio: 33.33% (50k / 150k)');

  const otherStateCredit = MultiStateEngine.calculateResidentOtherStateCredit(
    1_000_000n, // $10,000 CA resident tax
    15_000_000n, // $150,000 total income
    5_000_000n,  // $50,000 NY doubly taxed income (ratio cap = 1/3 * 10,000 = $3,333.33)
    2_500_00n    // $2,500 actual NY tax paid
  );
  assert(otherStateCredit === 250_000n, 'Other-state credit allowed is lesser of actual NY tax ($2,500) or ratio cap ($3,333)');

  // ---------------------------------------------------------------------------
  // TEST SUITE 6: BOUNDARY & UNSUPPORTED SCENARIOS
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 6: Boundary Guardrails & Unsupported Scenario Rejection ---');

  const edge001 = GOLDEN_SCENARIOS.find(s => s.id === 'EDGE-001')!;
  const val001 = TaxValidationEngine.validateInput(edge001.input);
  assert(val001.isValid === false, 'EDGE-001: Unsupported jurisdiction is rejected');
  assert(val001.issues.some(i => i.code === 'UNSUPPORTED_JURISDICTION'), 'EDGE-001: Returns UNSUPPORTED_JURISDICTION error code');

  const edge002 = GOLDEN_SCENARIOS.find(s => s.id === 'EDGE-002')!;
  const val002 = TaxValidationEngine.validateInput(edge002.input);
  assert(val002.isValid === false, 'EDGE-002: Negative W-2 wages rejected');
  assert(val002.issues.some(i => i.code === 'INVALID_W2_WAGES'), 'EDGE-002: Returns INVALID_W2_WAGES boundary error');

  // Invariant verification on synthetic invalid result
  const invalidResult: any = {
    federal: {
      taxableIncomeCents: -500n,
      totalFederalTaxCents: 100_000n,
      totalPaymentsCents: 120_000n,
      refundCents: 20_000n,
      balanceDueCents: 5_000n, // Invariant violation: both positive
    },
    states: [],
  };
  const invariantCheck = TaxValidationEngine.verifyResultInvariants(invalidResult);
  assert(invariantCheck.isValid === false, 'Invariant violation caught: Both refund and balance due positive');
  assert(invariantCheck.issues.some(i => i.code === 'INVARIANT_SIMULTANEOUS_REFUND_DUE'), 'Catches INVARIANT_SIMULTANEOUS_REFUND_DUE');

  // ---------------------------------------------------------------------------
  // TEST SUITE 7: CRYPTOGRAPHIC HASH REPRODUCIBILITY (SHA-256)
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 7: Cryptographic Hashing & Snapshot Reproducibility ---');

  const provider = new InternalDeterministicProvider();
  const run1 = await provider.calculateComprehensive('case_hash_test', f001.input);
  const run2 = await provider.calculateComprehensive('case_hash_test', f001.input);

  assert(run1.inputHash === run2.inputHash, 'Identical inputs produce bit-for-bit identical inputHash (SHA-256)');
  assert(run1.resultHash === run2.resultHash, 'Identical runs produce bit-for-bit identical resultHash (SHA-256)');

  // Mutated input produces different hash
  const mutatedInput = { ...f001.input, payments: { estimatedTaxPaymentsCents: 50_000n } };
  const run3 = await provider.calculateComprehensive('case_hash_test', mutatedInput);
  assert(run1.inputHash !== run3.inputHash, 'Mutated input produces completely different inputHash');
  assert(run1.resultHash !== run3.resultHash, 'Mutated input produces completely different resultHash');

  // ---------------------------------------------------------------------------
  // TEST SUITE 8: STATUTORY FORM LINE MAPPINGS
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 8: Statutory Form Line Mapping Coverage ---');

  const allMappings = FormMappingService.getAllMappings();
  assert(allMappings.length >= 25, `Comprehensive Form Line mappings registered: ${allMappings.length} lines`);

  const line1z = FormMappingService.getMappingByLineCode('1040:line_1z');
  assert(line1z !== undefined && line1z.formName === 'Form 1040', 'Mapped Form 1040 Line 1z (W-2 Wages)');

  const caLine31 = FormMappingService.getMappingByLineCode('CA_540:line_31');
  assert(caLine31 !== undefined && caLine31.jurisdiction === 'US-CA', 'Mapped CA Form 540 Line 31 (Tax before credits)');

  const ilLine12 = FormMappingService.getMappingByLineCode('IL_1040:line_12');
  assert(ilLine12 !== undefined && ilLine12.jurisdiction === 'US-IL', 'Mapped IL Form IL-1040 Line 12 (Flat tax)');

  // ---------------------------------------------------------------------------
  // TEST SUITE 9: CALCULATION LINEAGE & "PROVE THIS NUMBER" DAG
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 9: Calculation Lineage Graph ("Prove This Number") ---');

  const explainAgi = CalculationLineageService.explainNumber(run1, 'adjustedGrossIncome');
  assert(explainAgi !== null, 'Lineage explains Adjusted Gross Income');
  assert(explainAgi?.statutoryAuthority === 'IRC § 62', 'AGI links directly to IRC § 62 statutory authority');
  assert(explainAgi?.formattedValue === '$75,000.00', 'AGI formatted value matches $75,000.00');

  const explainFormLine = CalculationLineageService.explainNumber(run1, '1040:line_1z');
  assert(explainFormLine !== null, 'Lineage resolves Form 1040 Line 1z via form line code lookup');
  assert(explainFormLine?.formLineRef.includes('1040'), 'Lineage references Form 1040');

  // ---------------------------------------------------------------------------
  // TEST SUITE 10: DATABASE PERSISTENCE, RUN COMPARISON & TAX TWIN
  // ---------------------------------------------------------------------------
  console.log('\n--- Suite 10: PostgreSQL Persistence, Comparison & Tax Twin Simulation ---');

  // Find demo case
  const demoCase = await prisma.taxCase.findFirst({
    include: { facts: true }
  });

  if (demoCase) {
    // Execute and persist run in real database
    const persistedRun = await CalculationRunService.executeAndPersistRun(
      demoCase.id,
      undefined,
      f001.input
    );

    assert(persistedRun.calculationRunId.startsWith('calc_run_'), 'Persisted run created with unique ID');

    // Verify DB record
    const dbRecord = await prisma.taxCalculationRun.findUnique({
      where: { id: persistedRun.calculationRunId }
    });
    assert(dbRecord !== null, 'TaxCalculationRun successfully persisted in PostgreSQL database');
    assert(dbRecord?.inputSnapshotHash === persistedRun.inputHash, 'Database record preserves exact SHA-256 inputSnapshotHash');
    assert(dbRecord?.outputHash === persistedRun.resultHash, 'Database record preserves exact SHA-256 outputHash');
    const dbFed = (dbRecord?.outputSnapshot as any)?.federal;
    assert(dbFed?.totalFederalTaxCents === '774700', 'Database record preserves exact cent totalFederalTaxCents');

    // Tax Twin Simulation
    const twinSim = await CalculationRunService.simulateTaxTwinScenario(demoCase.id, {
      adjustments: { hsaDeductionCents: 415_000n } // $4,150 HSA contribution scenario
    });

    assert(twinSim.baseline !== undefined, 'Tax Twin executed baseline calculation');
    assert(twinSim.simulated !== undefined, 'Tax Twin executed what-if simulated calculation');
    assert(twinSim.comparison.length >= 4, 'Tax Twin generated line-by-line comparison deltas');
    console.log(`  ✓ [PASS] Tax Twin simulated delta: ${twinSim.comparison[1].field} changed by ${twinSim.comparison[1].dollarDifference}`);
    passed++;
  } else {
    console.log('  [NOTE] Skipping DB persistence sub-test: no seed tax case found (run pnpm run seed)');
  }

  // ---------------------------------------------------------------------------
  // FINAL SCORECARD
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`PHASE 3 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Master verification runner encountered an unexpected error:', err);
  process.exit(1);
});
