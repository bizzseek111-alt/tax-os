/**
 * Autonomous Tax OS — Agent Operating System Verification Suite
 * Automated unit and integration testing covering permissions, routing, consensus, and kill switches.
 */

import { AgentPermissionController, PermissionViolationError } from '../agent-os/PermissionController';
import { ModelRouter } from '../agent-os/ModelRouter';
import { ConsensusEngine } from '../agent-os/ConsensusEngine';
import { KillSwitchManager, KillSwitchActiveError } from '../agent-os/KillSwitchManager';
import { TaxCaseSupervisor, DomainSupervisor } from '../agent-os/Supervisor';
import { AgentPermissionGrant, ConsensusProposal, AdversarialChallenge, AgentResult } from '../agent-os/types';

declare const process: any;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('====================================================');
console.log('AUTONOMOUS TAX OS — AGENT OS VERIFICATION SUITE');
console.log('====================================================\n');

// ------------------------------------------------------------------
// 1. Agent Permission Controller Tests
// ------------------------------------------------------------------
console.log('[Security] Agent Permission Controller & PII Masking');

const deductionHunterGrant: AgentPermissionGrant = {
  grantId: 'grant_dh_01',
  agentName: 'DeductionHunter',
  taxCaseId: 'case_maya_lin_2026',
  tenantId: 'tenant_apex_01',
  allowedReadPaths: ['case.facts.*', 'case.evidence.*'],
  allowedWritePaths: ['case.positions.candidates'],
  allowedTools: ['rule_graph_query', 'citation_lookup'],
  allowedJurisdictions: ['US-FED', 'US-NY'],
  piiClearanceLevel: 'MASKED',
  canAccessRawSsn: false,
  canAccessRawBankNumbers: false,
  maxExecutionTimeMs: 5000,
  maxTokenBudget: 10000
};

// Tool Authorization
let toolErrorThrown = false;
try {
  AgentPermissionController.assertToolAllowed(deductionHunterGrant, 'mef_transmit_return');
} catch (e) {
  if (e instanceof PermissionViolationError && e.code === 'TOOL_UNAUTHORIZED') {
    toolErrorThrown = true;
  }
}
assert(toolErrorThrown, 'DeductionHunter blocked from calling unauthorized tool (mef_transmit_return)');

// Jurisdiction Authorization
let jurisErrorThrown = false;
try {
  AgentPermissionController.assertJurisdictionAllowed(deductionHunterGrant, 'US-CA');
} catch (e) {
  if (e instanceof PermissionViolationError && e.code === 'JURISDICTION_UNAUTHORIZED') {
    jurisErrorThrown = true;
  }
}
assert(jurisErrorThrown, 'DeductionHunter blocked from operating outside authorized jurisdiction scope (US-CA blocked)');

// Write Path Authorization
let writeErrorThrown = false;
try {
  AgentPermissionController.assertWritePathAllowed(deductionHunterGrant, 'case.filingSubmission.status');
} catch (e) {
  if (e instanceof PermissionViolationError && e.code === 'WRITE_PATH_FORBIDDEN') {
    writeErrorThrown = true;
  }
}
assert(writeErrorThrown, 'DeductionHunter blocked from unauthorized write to final filing status');

// PII Sanitization
const rawDataWithPii = {
  taxpayerName: 'Maya Lin',
  ssn: '123-45-6789',
  accountNumber: '99281729182',
  amount: 4500
};
const sanitizedData = AgentPermissionController.sanitizeDataForAgent(deductionHunterGrant, rawDataWithPii);
assert(sanitizedData.ssn === '***-**-****', 'SSN automatically masked for unprivileged agent');
assert(sanitizedData.accountNumber === '***9182', 'Bank account number masked to last 4 digits');

// ------------------------------------------------------------------
// 2. Model Router & Cost Controller Tests
// ------------------------------------------------------------------
console.log('\n[Architecture] Model Routing & Deterministic Separation');

const mathRoute = ModelRouter.resolveRoute('calculate_schedule_c_line_31');
assert(mathRoute.modelClass === 'DETERMINISTIC_MATH', 'Tax math routed to DETERMINISTIC_MATH with 0 LLM tokens');
assert(mathRoute.estimatedCostPer1kTokensUsd === 0.0, 'Deterministic tax math has $0.00 token cost');

const adversarialRoute = ModelRouter.resolveRoute('audit_challenge_expense', true);
assert(adversarialRoute.modelClass === 'DEEP_REASONER', 'Adversarial audit routed to DEEP_REASONER');

const ocrRoute = ModelRouter.resolveRoute('extract_doc_w2');
assert(ocrRoute.modelClass === 'DOCUMENT_EXTRACTOR', 'W-2 extraction routed to DOCUMENT_EXTRACTOR');

const merchantRoute = ModelRouter.resolveRoute('normalize_merchant_string');
assert(merchantRoute.modelClass === 'FAST_CLASSIFIER', 'Merchant normalization routed to FAST_CLASSIFIER');

// ------------------------------------------------------------------
// 3. Consensus Engine Arbitration Tests
// ------------------------------------------------------------------
console.log('\n[Orchestration] Consensus Engine & Adversarial Arbitration');

const validProposal: ConsensusProposal = {
  proposalId: 'prop_camera_exp',
  topic: 'Camera Equipment Expensing',
  proposedByAgent: 'DeductionHunter',
  targetFormLine: 'Form 1040, Schedule C, Line 13',
  amountCents: 240000,
  statutoryCitation: 'IRC § 179(a); Treas. Reg. § 1.179-1',
  evidenceRefs: ['doc_bh_receipt_sha256'],
  confidence: 0.98
};

// Case A: Disallowance for missing citation
const ungroundedProposal = { ...validProposal, statutoryCitation: '' };
const rejectVerdict = ConsensusEngine.arbitrate(ungroundedProposal, null, true, false);
assert(rejectVerdict.decision === 'REJECTED', 'Position lacking primary citation is rejected by Consensus Engine');

// Case B: High audit risk missing documentary proof -> Solicits user input
const highRiskChallenge: AdversarialChallenge = {
  challengeId: 'chal_01',
  proposalId: validProposal.proposalId,
  challengerAgent: 'IRSChallenger',
  auditRiskSeverity: 'HIGH',
  objectionRationale: 'IRC § 274(d) requires contemporaneous documentation of exclusive business use percentage.',
  missingProofElements: ['Exclusive commercial use percentage']
};
const inquiryVerdict = ConsensusEngine.arbitrate(validProposal, highRiskChallenge, false, true);
assert(inquiryVerdict.decision === 'USER_INPUT_REQUIRED', 'Challenged position with missing proof generates Tax Inbox inquiry');
assert(inquiryVerdict.requiredInboxCard !== undefined, 'Tax Inbox card payload created with prompt title');

// Case C: Fully substantiated position survives challenge
const approvedVerdict = ConsensusEngine.arbitrate(validProposal, highRiskChallenge, true, true);
assert(approvedVerdict.decision === 'APPROVED', 'Position with 100% documentary proof and valid citation is APPROVED');
assert(approvedVerdict.approvedAmountCents === 240000, 'Approved amount equals full proposed deduction');

// ------------------------------------------------------------------
// 4. Granular Emergency Kill Switch Tests
// ------------------------------------------------------------------
console.log('\n[Platform Safety] Granular Emergency Kill Switches');

// Trip California Filing Kill Switch
KillSwitchManager.tripKillSwitch(
  'SPECIFIC_JURISDICTION',
  'US-CA',
  'California FTB Schematron update in progress',
  'PlatformAdmin'
);

let caKillErrorThrown = false;
try {
  KillSwitchManager.assertNotKilled(undefined, 'US-CA');
} catch (e) {
  if (e instanceof KillSwitchActiveError) {
    caKillErrorThrown = true;
  }
}
assert(caKillErrorThrown, 'California operations frozen by jurisdiction kill switch');

// Assert New York and Federal remain operating
let nyErrorThrown = false;
try {
  KillSwitchManager.assertNotKilled(undefined, 'US-NY');
} catch {
  nyErrorThrown = true;
}
assert(!nyErrorThrown, 'New York operations remain fully active while California is frozen');

// Clear California Kill Switch
KillSwitchManager.clearKillSwitch('SPECIFIC_JURISDICTION', 'US-CA');
let caCleared = true;
try {
  KillSwitchManager.assertNotKilled(undefined, 'US-CA');
} catch {
  caCleared = false;
}
assert(caCleared, 'California operations restored after kill switch cleared');

// ------------------------------------------------------------------
// 5. Tax Case Supervisor Integration Tests
// ------------------------------------------------------------------
console.log('\n[Supervision] Tax Case Supervisor & Domain Delegation');

class MockIntakeSupervisor extends DomainSupervisor {
  constructor() {
    super('IntakeSupervisor', ['IntakeAgent', 'DocumentExtractor']);
  }

  public async executePhase(caseId: string, grant: AgentPermissionGrant): Promise<AgentResult<any>> {
    this.checkKillSwitch(grant.allowedJurisdictions[0]);
    return {
      status: 'SUCCESS',
      result: { extractedDocsCount: 3 },
      confidence: 0.99,
      evidenceRefs: ['doc_1'],
      ruleRefs: [],
      sourceRefs: ['doc_1'],
      taxCaseRefs: [caseId],
      warnings: [],
      contradictions: [],
      unresolvedFacts: [],
      requiresUserInput: false,
      requiresProfessionalReview: false,
      recommendedNextAction: 'ADVANCE_TO_FACT_RECONSTRUCTION',
      auditMetadata: {
        agentName: 'IntakeSupervisor',
        agentVersion: '1.0.0',
        runId: 'run_123',
        timestamp: new Date().toISOString(),
        executionDurationMs: 15,
        inputHash: 'hash_in',
        outputHash: 'hash_out',
        modelUsed: 'DocumentAi',
        totalTokens: 120,
        estimatedCostUsd: 0.002
      }
    };
  }
}

TaxCaseSupervisor.registerSupervisor(new MockIntakeSupervisor());

async function runSupervisorTest() {
  const supervisorResult = await TaxCaseSupervisor.dispatchDomain(
    'IntakeSupervisor',
    'case_maya_lin_2026',
    deductionHunterGrant
  );

  assert(supervisorResult.status === 'SUCCESS', 'TaxCaseSupervisor successfully dispatched IntakeSupervisor');
  assert(supervisorResult.result.extractedDocsCount === 3, 'Domain result correctly returned to root supervisor');
  assert(supervisorResult.auditMetadata.executionDurationMs >= 0, 'Execution duration measured and recorded in audit metadata');

  console.log('\n====================================================');
  console.log('ALL AGENT OS VERIFICATION TESTS PASSED! 🎉');
  console.log('====================================================\n');
}

runSupervisorTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
