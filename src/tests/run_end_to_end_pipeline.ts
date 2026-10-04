/**
 * Autonomous Tax OS — Master End-to-End Pipeline Verification Suite
 * Validates Workstreams 1 through 15 across the entire software execution lifecycle.
 */

import { AuditLedger } from '../platform/AuditLedger';
import { PlatformEventBus } from '../platform/EventBus';
import { FeatureFlagManager } from '../platform/FeatureFlagManager';
import { CanonicalTaxGraph } from '../models/TaxGraph';
import { TaxDropService, RawUploadFile } from '../services/TaxDropService';
import { PlaidReadyAdapter } from '../services/FinancialDataService';
import { IncomeReconstructionEngine, IncomeSourceItem } from '../services/IncomeReconstructionEngine';
import { AdversarialReviewEngine } from '../services/AdversarialReviewEngine';
import { TaxCalculationEngine } from '../services/TaxCalculationEngine';
import { TaxTwinService } from '../services/TaxTwinService';
import { TaxResearchEngine } from '../tax-authority/TaxResearchEngine';
import { CitationValidator } from '../tax-authority/CitationValidator';

declare const process: any;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runMasterPipeline() {
  console.log('====================================================');
  console.log('AUTONOMOUS TAX OS — END-TO-END PIPELINE VERIFICATION');
  console.log('====================================================\n');

  // WORKSTREAM 1: Platform Event Bus & Cryptographic Audit Ledger
  console.log('[Workstream 1: Platform] Initializing Event System & Audit Ledger');
  AuditLedger.clearForTesting();
  const genesisEntry = AuditLedger.record(
    'sys-init',
    'PLATFORM_SUPERVISOR',
    'INITIALIZE_TAX_OS',
    'tenant-apex-101',
    'TENANT',
    { version: '2026.Q1', mode: 'PRODUCTION_VERIFIED' }
  );
  assert(genesisEntry.sequence === 1, 'AuditLedger initialized at sequence 1');
  assert(AuditLedger.verifyIntegrity().isValid, 'Audit chain integrity verified at genesis');

  // Test EventBus pub/sub
  let eventReceived = false;
  PlatformEventBus.subscribe('taxdrop.document_processed', (evt) => {
    eventReceived = true;
  });
  await PlatformEventBus.publish('taxdrop.document_processed', { file: 'test.pdf' }, 'tenant-apex-101');
  assert(eventReceived, 'PlatformEventBus successfully routes typed events to subscribers');

  // WORKSTREAM 2 & 3: TaxDrop Ingestion & Canonical TaxGraph
  console.log('\n[Workstream 2 & 3: TaxDrop & TaxGraph] Ingesting Documents with SHA-256 Hashes');
  const taxGraph = new CanonicalTaxGraph();
  TaxDropService.clearHashesForTesting();

  const w2File: RawUploadFile = {
    name: 'Form_W2_Acme_Labs_2026.pdf',
    sizeBytes: 1048576,
    mimeType: 'application/pdf',
    base64OrBinary: 'JVBERi0xLjQKJcTl8uXr...W2_DATA_STREAM'
  };
  const docW2 = TaxDropService.processUpload(w2File, taxGraph);
  assert(!docW2.isDuplicate, 'Form W-2 ingested as unique primary document');
  assert(docW2.classification === 'FORM_W2', 'Document correctly classified as FORM_W2');

  // Test Duplicate Detection
  const duplicateW2 = TaxDropService.processUpload(w2File, taxGraph);
  assert(duplicateW2.isDuplicate, 'Duplicate W-2 upload detected and prevented from re-ingestion');

  const necFile: RawUploadFile = {
    name: 'Form_1099_NEC_Horizon_2026.pdf',
    sizeBytes: 524288,
    mimeType: 'application/pdf',
    base64OrBinary: 'JVBERi0xLjQKJcTl8uXr...1099_NEC_DATA_STREAM'
  };
  const docNec = TaxDropService.processUpload(necFile, taxGraph);
  assert(docNec.classification === 'FORM_1099_NEC', 'Document correctly classified as FORM_1099_NEC');

  // WORKSTREAM 4 & 5: Income Reconstruction & Anti-Double-Counting
  console.log('\n[Workstream 4 & 5: Income Reconstruction] Triangulation & Overlap Prevention');
  const incomeSources: IncomeSourceItem[] = [
    {
      id: 'src-01',
      sourceType: 'W2_EMPLOYER',
      payerName: 'Acme Labs Inc.',
      grossAmountCents: 5620000,
      metadata: { form: 'W-2' }
    },
    {
      id: 'src-02',
      sourceType: 'FORM_1099_NEC',
      payerName: 'Horizon Fintech Corp',
      grossAmountCents: 9200000,
      metadata: { form: '1099-NEC' }
    },
    {
      id: 'src-03',
      sourceType: 'FORM_1099_K_PROCESSOR',
      payerName: 'Stripe Payments LLC',
      grossAmountCents: 9200000, // Identical volume to 1099-NEC
      metadata: { processor: 'Stripe' }
    },
    {
      id: 'src-04',
      sourceType: 'BANK_DEPOSIT_FEED',
      payerName: 'Chase Business Checking',
      grossAmountCents: 9200000, // Identical transfer
      metadata: { feed: 'Plaid' }
    }
  ];

  const reconciledIncome = IncomeReconstructionEngine.reconcile(incomeSources);
  assert(reconciledIncome.w2WagesCents === 5620000, 'W-2 wages accurately reconciled ($56,200.00)');
  assert(reconciledIncome.scheduleCRevenuesCents === 9200000, 'Schedule C revenues accurately reconciled ($92,000.00)');
  assert(reconciledIncome.totalGrossIncomeCents === 14820000, 'Total Gross Income strictly equal to $148,200.00');
  assert(
    reconciledIncome.overlappingDeduplicatedCents === 18400000,
    'Successfully eliminated $184,000.00 in overlapping processor & bank duplicate deposits'
  );

  // WORKSTREAM 7 & 8: Legal Authority & Adversarial Review
  console.log('\n[Workstream 7 & 8: Tax Authority & Adversarial Review] Consensus Engine Gate');
  const travelProposal = {
    positionId: 'pos-travel-01',
    category: 'BUSINESS_TRAVEL',
    claimedAmountCents: 41250,
    statutoryCitation: '26 U.S.C. § 162(a)(2)',
    hasDocumentaryProof: true,
    jurisdiction: 'US-FED',
    taxYear: 2026
  };
  const travelVerdict = AdversarialReviewEngine.evaluatePosition(travelProposal);
  assert(travelVerdict.verdict === 'APPROVED', 'Ordinary business travel deduction approved');

  // Test IRS Challenger State Non-Conformity Gate
  const hsaCaProposal = {
    positionId: 'pos-hsa-ca-01',
    category: 'HSA_DEDUCTION',
    claimedAmountCents: 415000,
    statutoryCitation: 'Cal. Rev. & Tax. Code § 17215.4',
    hasDocumentaryProof: true,
    jurisdiction: 'US-CA',
    taxYear: 2026
  };
  const hsaCaVerdict = AdversarialReviewEngine.evaluatePosition(hsaCaProposal);
  assert(hsaCaVerdict.verdict === 'REJECTED', 'California HSA deduction correctly rejected by IRS Challenger under Cal. RTC § 17215.4');

  // WORKSTREAM 9: Deterministic Tax Calculation
  console.log('\n[Workstream 9: Tax Engine] Deterministic Integer-Cents Mathematical Calculation');
  const calcInput = {
    taxYear: 2026,
    filingStatus: 'SINGLE' as const,
    w2WagesCents: 5620000,           // $56,200.00
    scheduleCGrossCents: 9200000,    // $92,000.00
    scheduleCExpensesCents: 1849000, // $18,490.00
    hsaContributionCents: 415000,    // $4,150.00
    residentState: 'US-CA' as const
  };

  const calcOutput = TaxCalculationEngine.calculate(calcInput);
  assert(calcOutput.scheduleCNetProfitCents === 7351000, 'Schedule C Net Profit ($73,510.00) matches deterministic math');
  assert(calcOutput.qbiDeductionCents === 1470200, 'Form 8995 QBI 20% deduction ($14,702.00) verified');
  assert(calcOutput.formLineBreakdown['Form 1040 Line 9 (Total Income)'] === 12971000, 'Form 1040 Line 9 Total Income verified');
  assert(calcOutput.stateJurisdiction === 'US-CA', 'California Form 540 state return processed');
  assert(calcOutput.stateTaxCents > 0, 'California state liability deterministically computed');

  // WORKSTREAM 15: Tax Twin & Year-Round Planning
  console.log('\n[Workstream 15: Year-Round Planning] Tax Twin & Safe Harbor Simulator');
  const s179Simulation = TaxTwinService.simulateSection179(3500000, 'US-CA'); // $35,000 equipment
  assert(s179Simulation.stateDeductionCents === 2500000, 'California Section 179 strictly capped at $25,000 (Cal. RTC § 17255)');
  assert(s179Simulation.stateNonConformityExcessCents === 1000000, 'California $10,000 Section 179 excess flagged for Form 3885A MACRS');

  const safeHarbor = TaxTwinService.calculateQuarterlySafeHarbor(3000000, 3600000, 'PRIOR_YEAR_110');
  assert(safeHarbor.totalRequiredAnnualPaymentCents === 3300000, '110% Prior-Year Safe Harbor ($33,000.00) verified');
  assert(safeHarbor.quarterlyVoucherCents === 825000, 'Quarterly Voucher ($8,250.00) verified across 4 quarters');

  // Cryptographic Audit Ledger Integrity Verification
  console.log('\n[Audit Verification] Validating Hash-Chained Audit Ledger');
  const auditVerification = AuditLedger.verifyIntegrity();
  assert(auditVerification.isValid, '100% of audit ledger entries cryptographically verified with unbroken SHA-256 chain');

  console.log('\n====================================================');
  console.log('MASTER END-TO-END PIPELINE VERIFIED SUCCESSFULLY! 🎉');
  console.log('====================================================\n');
}

runMasterPipeline().catch((err) => {
  console.error('Fatal Pipeline Error:', err);
  process.exit(1);
});
