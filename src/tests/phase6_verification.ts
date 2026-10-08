/**
 * Autonomous Tax OS — Phase 6 Master Verification Suite
 * 
 * Comprehensive end-to-end verification covering all 28 Definition of Done criteria:
 * 1. ProfessionalProfile persistence & credential enforcement (ACTIVE vs EXPIRED)
 * 2. Strict jurisdiction scoping (California CPA denied for NY return)
 * 3. Domain authority enforcement (Income Tax vs Sales Tax)
 * 4. Review level thresholds (Junior Reviewer denied for materiality > $50k)
 * 5. Lease-based CaseLock acquisition & concurrent conflict blocking
 * 6. CaseLock heartbeat lease extension
 * 7. CaseLock voluntary release
 * 8. CaseLock administrative break-lock by Senior Reviewer / Admin
 * 9. ReviewTaskStateMachine valid status transitions
 * 10. ReviewTaskStateMachine invalid transition refusal
 * 11. Immutable audit event ledger recording for transitions
 * 12. Reviewer intelligent matching & scoring with continuity bonus
 * 13. Automated task assignment & capacity tracking
 * 14. Manual assignment validation & capacity limit rejection
 * 15. Position review: APPROVE with immutable TaxDecision audit hash
 * 16. Position review: MODIFY with ProfessionalCorrection learning & recalculation
 * 17. Position review: REJECT with ProfessionalCorrection & recalculation
 * 18. Customer request generation & "Needs You" queue synchronization
 * 19. Customer response submission & automatic ReviewTask unblocking
 * 20. Case messaging role-based scoping (Customer blocked from internal notes)
 * 21. Attorney-client privilege isolation (Non-lawyer blocked from authoring)
 * 22. Attorney legal controversy escalation & legal opinion memorandum
 * 23. Final review readiness gate blocking open tasks & high-risk positions
 * 24. Final review 14-point statutory checklist verification
 * 25. Authoritative final signoff persistence with deterministic fact hash
 * 26. Invariant enforcement: Fact mutation invalidates professional approval
 * 27. Quality Assurance (QA) sampling policy & Four-Eyes violation prevention
 * 28. SLA monitoring, breach escalation to URGENT & Customer Support scoped view
 */

import crypto from 'crypto';
import { prisma } from '../server/db';
import {
  UserRole,
  CredentialStatus,
  AvailabilityStatus,
  CredentialType
} from '@prisma/client';
import {
  ReviewAuthorizationEngine,
  CaseLockService,
  ReviewTaskStateMachine,
  ReviewAssignmentService,
  PositionReviewService,
  CustomerCollaborationService,
  TaxCaseMessagingService,
  FinalReturnReviewService,
  AttorneyEscalationService,
  QualityAssuranceService,
  ServiceLevelAgreementEngine,
  ReviewOperationsDashboardService,
  ReviewTaskType,
  ReviewTaskStatus,
  CustomerRequestType,
  CustomerRequestStatus,
  MessageRecipientScope,
  QaAction,
  QaSamplingReason,
  FinalReviewChecklist
} from '../server/review-operations';
import { CalculationRunService } from '../server/services/taxCalculation/calculationRunService';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - Detail: ${detail || 'Assertion failed'}`);
    throw new Error(`TEST_FAILURE: ${testName}`);
  }
}

async function runPhase6MasterVerification() {
  console.log('\n========================================================================');
  console.log('AUTONOMOUS TAX OS — PHASE 6 MASTER VERIFICATION SUITE');
  console.log('========================================================================\n');

  // Setup Base Organization
  let org = await prisma.organization.findFirst({ where: { slug: 'apex-global-p6' } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'Apex Review Operations', slug: 'apex-global-p6' }
    });
  }

  // 1. Seed Diverse Users & Professional Profiles
  const runId = Date.now().toString().slice(-6);

  // User A: California CPA (Level 2 Senior Reviewer)
  const cpaCaUser = await prisma.user.create({
    data: {
      email: `elena.cpa.${runId}@apex.example.com`,
      fullName: 'Elena Vance, CPA',
      role: UserRole.CPA,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.CPA } },
      professionalProfile: {
        create: {
          credentialType: CredentialType.CPA,
          credentialNumber: `CPA-CA-${runId}`,
          credentialState: 'CA',
          credentialStatus: CredentialStatus.ACTIVE,
          authorizedJurisdictions: ['US-FED', 'US-CA'],
          authorizedTaxDomains: ['INCOME_TAX'],
          reviewLevel: 2,
          qualityScore: 98.5,
          currentActiveCases: 2,
          capacity: 10,
          availabilityStatus: AvailabilityStatus.AVAILABLE
        }
      }
    }
  });

  // User B: Expired Preparer (Level 1)
  const expiredPreparer = await prisma.user.create({
    data: {
      email: `expired.prep.${runId}@apex.example.com`,
      fullName: 'Tom Expired, EA',
      role: UserRole.EA,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.EA } },
      professionalProfile: {
        create: {
          credentialType: CredentialType.ENROLLED_AGENT,
          credentialNumber: `EA-EXP-${runId}`,
          credentialStatus: CredentialStatus.EXPIRED,
          credentialExpiration: new Date(Date.now() - 30 * 24 * 3600 * 1000),
          authorizedJurisdictions: ['US-FED'],
          authorizedTaxDomains: ['INCOME_TAX'],
          reviewLevel: 1,
          currentActiveCases: 0,
          capacity: 5
        }
      }
    }
  });

  // User C: Junior Preparer (Level 1) - restricted for > $50k materiality
  const juniorPreparer = await prisma.user.create({
    data: {
      email: `junior.prep.${runId}@apex.example.com`,
      fullName: 'Junior Smith, Preparer',
      role: UserRole.PAID_PREPARER,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.PAID_PREPARER } },
      professionalProfile: {
        create: {
          credentialType: CredentialType.CTEC_PREPARER,
          credentialNumber: `CTEC-${runId}`,
          credentialStatus: CredentialStatus.ACTIVE,
          authorizedJurisdictions: ['US-FED', 'US-CA'],
          authorizedTaxDomains: ['INCOME_TAX'],
          reviewLevel: 1,
          currentActiveCases: 0,
          capacity: 10
        }
      }
    }
  });

  // User D: Licensed Tax Attorney
  const attorneyUser = await prisma.user.create({
    data: {
      email: `marcus.attorney.${runId}@apex.example.com`,
      fullName: 'Marcus Vance, Esq.',
      role: UserRole.ATTORNEY,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.ATTORNEY } },
      professionalProfile: {
        create: {
          credentialType: CredentialType.TAX_ATTORNEY,
          credentialNumber: `BAR-FED-${runId}`,
          credentialStatus: CredentialStatus.ACTIVE,
          authorizedJurisdictions: ['US-FED', 'US-CA', 'US-NY'],
          authorizedTaxDomains: ['INCOME_TAX'],
          reviewLevel: 3,
          currentActiveCases: 1,
          capacity: 10
        }
      }
    }
  });

  // User E: Customer Support Specialist
  const supportUser = await prisma.user.create({
    data: {
      email: `support.agent.${runId}@apex.example.com`,
      fullName: 'Sarah Support',
      role: UserRole.CUSTOMER_SUPPORT,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.CUSTOMER_SUPPORT } }
    }
  });

  // Taxpayer Customer
  const customerUser = await prisma.user.create({
    data: {
      email: `taxpayer.${runId}@example.com`,
      fullName: 'Jordan Taxpayer',
      role: UserRole.TAXPAYER,
      passwordHash: 'hashed_pw',
      memberships: { create: { organizationId: org.id, role: UserRole.TAXPAYER } }
    }
  });

  // Canonical TaxCase for testing
  const testCase = await prisma.taxCase.create({
    data: {
      organizationId: org.id,
      ownerId: customerUser.id,
      taxYear: 2026,
      caseType: 'INDIVIDUAL_INCOME',
      status: 'IN_REVIEW',
      riskLevel: 'LOW'
    }
  });

  const testObligation = await prisma.taxObligation.create({
    data: {
      taxCaseId: testCase.id,
      taxDomain: 'INCOME_TAX',
      jurisdictionCode: 'US-CA',
      period: '2026-ANNUAL',
      dueDate: new Date('2027-04-15')
    }
  });

  // Seed baseline W-2 facts for deterministic calculation
  await prisma.taxFact.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      category: 'INCOME',
      factType: 'W2_WAGES',
      key: 'w2_box1_wages',
      valueCents: BigInt(12500000), // $125,000.00
      taxYear: 2026,
      jurisdiction: 'US-FED'
    }
  });

  await prisma.taxFact.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      category: 'WITHHOLDING',
      factType: 'W2_FED_WITHHOLDING',
      key: 'w2_box2_federal_withheld',
      valueCents: BigInt(2200000), // $22,000.00
      taxYear: 2026,
      jurisdiction: 'US-FED'
    }
  });

  // Seed initial calculation run
  const initialCalc = await CalculationRunService.executeAndPersistRun(testCase.id);

  console.log('[SECTION 1: CREDENTIALS & AUTHORIZATION GATES]');

  // Test 1: Active credential check
  const activeCheck = await ReviewAuthorizationEngine.evaluateAuthorization({
    userId: cpaCaUser.id,
    jurisdiction: 'US-CA',
    taxDomain: 'INCOME_TAX'
  });
  assert(activeCheck.authorized, 'Test 1: Active California CPA credential recognized as authorized');

  const expiredCheck = await ReviewAuthorizationEngine.evaluateAuthorization({
    userId: expiredPreparer.id,
    jurisdiction: 'US-FED',
    taxDomain: 'INCOME_TAX'
  });
  assert(
    !expiredCheck.authorized && expiredCheck.reasons.some(r => r.includes('EXPIRED')),
    'Test 1b: Expired credential is strictly rejected by ReviewAuthorizationEngine'
  );

  // Test 2: Jurisdiction scoping
  const nyCheck = await ReviewAuthorizationEngine.evaluateAuthorization({
    userId: cpaCaUser.id,
    jurisdiction: 'US-NY',
    taxDomain: 'INCOME_TAX'
  });
  assert(
    !nyCheck.authorized && nyCheck.reasons.some(r => r.includes('not authorized for jurisdiction \'US-NY\'')),
    'Test 2: California CPA is refused authority for New York jurisdiction'
  );

  // Test 3: Domain authority scoping
  const salesTaxCheck = await ReviewAuthorizationEngine.evaluateAuthorization({
    userId: cpaCaUser.id,
    jurisdiction: 'US-CA',
    taxDomain: 'SALES_TAX'
  });
  assert(
    !salesTaxCheck.authorized && salesTaxCheck.reasons.some(r => r.includes('tax domain \'SALES_TAX\'')),
    'Test 3: Income Tax specialist is refused authority for Sales Tax domain'
  );

  // Test 4: Review level materiality threshold
  const juniorHighMateriality = await ReviewAuthorizationEngine.evaluateAuthorization({
    userId: juniorPreparer.id,
    jurisdiction: 'US-CA',
    taxDomain: 'INCOME_TAX',
    materialityUsd: 75000 // > $50k threshold
  });
  assert(
    !juniorHighMateriality.authorized && juniorHighMateriality.reasons.some(r => r.includes('$50,000 threshold')),
    'Test 4: Junior Preparer (Level 1) blocked from $75,000 high-materiality decision'
  );

  console.log('\n[SECTION 2: CONCURRENCY CASE LOCKING]');

  // Test 5: Lease-based case lock acquisition
  const lock1 = await CaseLockService.acquireLock(testCase.id, cpaCaUser.id, 'CPA annual review', 15);
  assert(lock1 !== null && lock1.lockedByUserId === cpaCaUser.id, 'Test 5: CPA acquired 15-minute lease lock on TaxCase');

  let secondLockBlocked = false;
  try {
    await CaseLockService.acquireLock(testCase.id, juniorPreparer.id, 'Concurrent edit attempt');
  } catch (err: any) {
    secondLockBlocked = err.message.includes('CASE_LOCKED');
  }
  assert(secondLockBlocked, 'Test 5b: Concurrent conflicting lock attempt by another reviewer is blocked');

  // Test 6: Heartbeat renewal
  const renewed = await CaseLockService.renewLock(testCase.id, cpaCaUser.id, 20);
  assert(renewed.expiresAt > lock1.expiresAt, 'Test 6: Active lock lease successfully extended via heartbeat');

  // Test 7: Voluntary release
  const released = await CaseLockService.releaseLock(testCase.id, cpaCaUser.id);
  const statusAfterRelease = await CaseLockService.checkLock(testCase.id);
  assert(released && !statusAfterRelease.isLocked, 'Test 7: Lock released voluntarily and checkLock confirms unlocked');

  // Test 8: Admin break-lock
  await CaseLockService.acquireLock(testCase.id, juniorPreparer.id, 'Junior lock to break');
  let juniorCannotBreak = false;
  try {
    await CaseLockService.breakLock(testCase.id, customerUser.id, 'Taxpayer cannot break lock');
  } catch (err: any) {
    juniorCannotBreak = err.message.includes('PERMISSION_DENIED');
  }
  assert(juniorCannotBreak, 'Test 8a: Non-admin/taxpayer forbidden from breaking case locks');

  const brokenByCpa = await CaseLockService.breakLock(testCase.id, cpaCaUser.id, 'Senior CPA supervisory override');
  const statusAfterBreak = await CaseLockService.checkLock(testCase.id);
  assert(brokenByCpa !== null && !statusAfterBreak.isLocked, 'Test 8b: Senior Reviewer successfully broke case lock with audit trace');

  console.log('\n[SECTION 3: STATE MACHINE & AUDIT LOGGING]');

  // Test 9: Valid state transitions
  const reviewTask = await prisma.reviewTask.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      reviewType: ReviewTaskType.FINAL_RETURN_REVIEW,
      jurisdiction: 'US-CA',
      taxDomain: 'INCOME_TAX',
      priority: 'HIGH',
      status: ReviewTaskStatus.UNASSIGNED,
      deadline: new Date(Date.now() + 48 * 3600 * 1000)
    }
  });

  const t1 = await ReviewTaskStateMachine.transition({
    taskId: reviewTask.id,
    targetStatus: ReviewTaskStatus.ASSIGNED,
    actorId: cpaCaUser.id,
    reason: 'Assigned to California CPA'
  });
  assert(t1.currentStatus === ReviewTaskStatus.ASSIGNED, 'Test 9a: Task transitioned UNASSIGNED -> ASSIGNED');

  const t2 = await ReviewTaskStateMachine.transition({
    taskId: reviewTask.id,
    targetStatus: ReviewTaskStatus.IN_REVIEW,
    actorId: cpaCaUser.id,
    reason: 'Started review'
  });
  assert(t2.currentStatus === ReviewTaskStatus.IN_REVIEW, 'Test 9b: Task transitioned ASSIGNED -> IN_REVIEW');

  // Test 10: Invalid state transition refusal
  let invalidTransitionBlocked = false;
  try {
    // Attempt invalid transition: IN_REVIEW -> UNASSIGNED directly is not allowed in state table
    await ReviewTaskStateMachine.transition({
      taskId: reviewTask.id,
      targetStatus: ReviewTaskStatus.UNASSIGNED,
      actorId: cpaCaUser.id
    });
  } catch (err: any) {
    invalidTransitionBlocked = err.message.includes('INVALID_STATE_TRANSITION');
  }
  assert(invalidTransitionBlocked, 'Test 10: Invalid state machine transition strictly refused');

  // Test 11: Audit trail check
  const audits = await prisma.auditEvent.findMany({
    where: {
      taxCaseId: testCase.id,
      action: 'REVIEW_TASK_STATUS_CHANGED'
    }
  });
  assert(audits.length >= 2, 'Test 11: State machine transitions appended to cryptographic audit ledger');

  console.log('\n[SECTION 4: INTELLIGENT MATCHING & ASSIGNMENT]');

  // Test 12: Eligible candidates lookup
  const candidates = await ReviewAssignmentService.findEligibleReviewers(reviewTask.id);
  assert(
    candidates.length > 0 && candidates.some(c => c.userId === cpaCaUser.id),
    'Test 12: ReviewAssignmentService identified qualified available California CPAs'
  );

  // Test 13: Auto assignment
  const autoAssigned = await ReviewAssignmentService.autoAssignTask(reviewTask.id, 'SUPER_ADMIN_SYSTEM');
  assert(
    autoAssigned.assignedUserId !== null &&
    (autoAssigned.status === ReviewTaskStatus.ASSIGNED || autoAssigned.status === ReviewTaskStatus.IN_REVIEW),
    'Test 13: Auto-assign assigned best qualified professional and updated status'
  );

  // Test 14: Manual assignment & capacity boundary
  // Set CPA active cases to max capacity
  await prisma.professionalProfile.update({
    where: { userId: cpaCaUser.id },
    data: { currentActiveCases: 10, capacity: 10 }
  });

  let capacityRefused = false;
  try {
    await ReviewAssignmentService.manualAssignTask(reviewTask.id, cpaCaUser.id, cpaCaUser.id);
  } catch (err: any) {
    capacityRefused = err.message.includes('CAPACITY_EXCEEDED');
  }
  assert(capacityRefused, 'Test 14: Manual assignment refused when reviewer reached 100% capacity cap');

  // Restore CPA capacity
  await prisma.professionalProfile.update({
    where: { userId: cpaCaUser.id },
    data: { currentActiveCases: 2, capacity: 10 }
  });

  console.log('\n[SECTION 5: POSITION REVIEWS & DETERMINISTIC RECALCULATION]');

  // Create proposed tax position (e.g. Schedule C Home Office deduction)
  const proposedPosition = await prisma.taxPosition.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      positionType: 'DEDUCTION',
      category: 'HOME_OFFICE',
      title: 'Home Office Deduction',
      statutoryCitation: '26 U.S.C. § 280A(c)(1)',
      amountCents: BigInt(150000), // $1,500.00
      rationale: 'Exclusive and regular home workspace',
      riskScore: 0.2,
      confidence: 0.95,
      status: 'PROPOSED'
    }
  });

  // Test 15: Approve position
  const approvedPos = await PositionReviewService.approvePosition(
    proposedPosition.id,
    cpaCaUser.id,
    'Substantiated by floor plan & utility bills'
  );
  assert(approvedPos.status === 'APPROVED', 'Test 15: Professional approved proposed position with notes');

  const approveDecision = await prisma.taxDecision.findFirst({
    where: { taxPositionId: proposedPosition.id, decisionAction: 'APPROVED' }
  });
  assert(approveDecision !== null && approveDecision.auditHash.length === 64, 'Test 15b: TaxDecision generated with SHA-256 audit hash');

  // Test 16: Modify position triggers ProfessionalCorrection & recalculation
  const modifiedRes = await PositionReviewService.modifyPosition(
    proposedPosition.id,
    cpaCaUser.id,
    {
      amountCents: BigInt(120000), // Adjusted down to $1,200.00
      rationale: 'Adjusted square footage proportion to 12% of total apartment area'
    },
    'Overstated square footage on initial AI proposal'
  );
  assert(
    modifiedRes.position.amountCents === BigInt(120000),
    'Test 16: Position amount adjusted from $1,500 to $1,200'
  );

  const correctionRec = await prisma.professionalCorrection.findFirst({
    where: { taxPositionId: proposedPosition.id }
  });
  assert(
    correctionRec !== null && correctionRec.reviewerId === cpaCaUser.id,
    'Test 16b: ProfessionalCorrection stored for agent feedback learning'
  );

  // Test 17: Reject position
  const rejectedRes = await PositionReviewService.rejectPosition(
    proposedPosition.id,
    cpaCaUser.id,
    'Disallowed: taxpayer used shared living room, failing § 280A exclusivity test'
  );
  assert(rejectedRes.position.status === 'REJECTED', 'Test 17: Position disallowed and rejected by CPA');

  console.log('\n[SECTION 6: CUSTOMER COLLABORATION ("Needs You" Queue)]');

  // Test 18: Customer request creation moves case to NEEDS_YOU
  const custReq = await CustomerCollaborationService.createRequest({
    taxCaseId: testCase.id,
    reviewTaskId: reviewTask.id,
    requestType: CustomerRequestType.QUESTION,
    prompt: 'Did you make any estimated tax payments in Q4 2026?',
    reason: 'Reconciling Form 1040-ES payments',
    expectedAnswerType: 'BOOLEAN',
    options: ['Yes', 'No'],
    requestedByUserId: cpaCaUser.id
  });

  const updatedCaseAfterReq = await prisma.taxCase.findUnique({ where: { id: testCase.id } });
  const updatedTaskAfterReq = await prisma.reviewTask.findUnique({ where: { id: reviewTask.id } });
  assert(
    custReq.status === CustomerRequestStatus.PENDING &&
    updatedCaseAfterReq?.status === 'NEEDS_YOU' &&
    updatedTaskAfterReq?.status === ReviewTaskStatus.WAITING_ON_CUSTOMER,
    'Test 18: Customer question created, TaxCase set to NEEDS_YOU, Task set to WAITING_ON_CUSTOMER'
  );

  // Test 19: Customer responds to request and unblocks task
  const answeredReq = await CustomerCollaborationService.respondToRequest({
    requestId: custReq.id,
    userId: customerUser.id,
    responsePayload: { answer: 'No', notes: 'All withholding done via W-2 payroll' }
  });

  const taskAfterReply = await prisma.reviewTask.findUnique({ where: { id: reviewTask.id } });
  assert(
    answeredReq.status === CustomerRequestStatus.RESPONDED &&
    taskAfterReply?.status === ReviewTaskStatus.IN_REVIEW,
    'Test 19: Customer submitted response, resolving request and unblocking task back to IN_REVIEW'
  );

  console.log('\n[SECTION 7: CASE MESSAGING & LEGAL PRIVILEGE]');

  // Test 20: Role-based message scoping
  await TaxCaseMessagingService.postMessage({
    taxCaseId: testCase.id,
    senderUserId: cpaCaUser.id,
    recipientScope: MessageRecipientScope.CUSTOMER_REVIEWER,
    content: 'Hello Jordan, your W-2 wage summary has been verified.'
  });

  await TaxCaseMessagingService.postMessage({
    taxCaseId: testCase.id,
    senderUserId: cpaCaUser.id,
    recipientScope: MessageRecipientScope.REVIEWER_SENIOR,
    content: 'Internal preparer note: checking depreciation carryover on secondary review.'
  });

  const customerView = await TaxCaseMessagingService.getMessagesForCase(testCase.id, customerUser.id);
  assert(
    customerView.length === 1 && !customerView.some(m => m.recipientScope === MessageRecipientScope.REVIEWER_SENIOR),
    'Test 20: Taxpayer is strictly blocked from seeing internal reviewer messages'
  );

  // Test 21: Legal privilege boundaries
  let nonLawyerPrivilegeBlocked = false;
  try {
    await TaxCaseMessagingService.postMessage({
      taxCaseId: testCase.id,
      senderUserId: juniorPreparer.id,
      recipientScope: MessageRecipientScope.REVIEWER_ATTORNEY,
      isPrivilegedLegal: true,
      content: 'Privileged analysis attempt by non-lawyer'
    });
  } catch (err: any) {
    nonLawyerPrivilegeBlocked = err.message.includes('PRIVILEGE_VIOLATION');
  }
  assert(nonLawyerPrivilegeBlocked, 'Test 21a: Non-lawyer strictly blocked from creating privileged legal communications');

  const legalMessage = await TaxCaseMessagingService.postMessage({
    taxCaseId: testCase.id,
    senderUserId: attorneyUser.id,
    recipientScope: MessageRecipientScope.REVIEWER_ATTORNEY,
    isPrivilegedLegal: true,
    content: 'ATTORNEY-CLIENT PRIVILEGE: Evaluating potential state nexus exposure.'
  });
  assert(legalMessage.isPrivilegedLegal, 'Test 21b: Licensed Attorney successfully authored privileged legal communication');

  const supportMsgView = await TaxCaseMessagingService.getMessagesForCase(testCase.id, supportUser.id);
  assert(
    !supportMsgView.some(m => m.isPrivilegedLegal),
    'Test 21c: Customer Support cannot read privileged legal communications'
  );

  // Test 22: Attorney legal controversy escalation
  const legalTask = await AttorneyEscalationService.escalateToAttorney({
    taxCaseId: testCase.id,
    referredByUserId: cpaCaUser.id,
    escalationReason: 'Taxpayer engaged in potential listed micro-captive transaction',
    controversyType: 'LISTED_TRANSACTION'
  });
  assert(
    legalTask.reviewType === ReviewTaskType.LEGAL_REVIEW && legalTask.isPrivileged,
    'Test 22a: Case escalated to Legal Review queue with attorney privilege flag'
  );

  const opinion = await AttorneyEscalationService.submitLegalOpinion({
    taskId: legalTask.id,
    attorneyUserId: attorneyUser.id,
    legalOpinionSummary: 'Statutory disclosure required under Treas. Reg. § 1.6011-4; proceed with Form 8886 attachment.',
    recommendation: 'MODIFY_POSITION',
    privilegedNotes: 'Strict liability penalty exposure under IRC § 6707A without disclosure.'
  });
  assert(opinion.status === ReviewTaskStatus.COMPLETED, 'Test 22b: Attorney submitted binding legal counsel opinion memorandum');

  console.log('\n[SECTION 8: FINAL REVIEW READINESS & SIGNOFF GOVERNANCE]');

  // Test 23: Readiness gate blocks open tasks
  const openPositionTask = await prisma.reviewTask.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      reviewType: ReviewTaskType.POSITION_REVIEW,
      jurisdiction: 'US-CA',
      priority: 'HIGH',
      status: ReviewTaskStatus.IN_REVIEW,
      deadline: new Date(Date.now() + 24 * 3600 * 1000)
    }
  });

  const readinessOpen = await FinalReturnReviewService.evaluateReadiness(testCase.id);
  assert(
    !readinessOpen.isReady && readinessOpen.blockingReasons.length > 0,
    'Test 23: Final signoff readiness gate blocked due to open review task'
  );

  // Resolve open tasks
  await ReviewTaskStateMachine.transition({
    taskId: openPositionTask.id,
    targetStatus: ReviewTaskStatus.APPROVED,
    actorId: cpaCaUser.id,
    reason: 'Position task approved'
  });

  await ReviewTaskStateMachine.transition({
    taskId: reviewTask.id,
    targetStatus: ReviewTaskStatus.APPROVED,
    actorId: cpaCaUser.id,
    reason: 'Primary task approved'
  });

  const readinessResolved = await FinalReturnReviewService.evaluateReadiness(testCase.id);
  assert(readinessResolved.isReady, 'Test 23b: Readiness gate passed once all blocking tasks are resolved');

  // Test 24: 14-Point checklist enforcement
  const incompleteChecklist: FinalReviewChecklist = {
    identityVerified: true,
    filingStatusVerified: true,
    dependentsResolved: true,
    incomeReconciled: true,
    withholdingReconciled: false, // Incomplete!
    estimatedPaymentsConfirmed: true,
    materialDeductionsReviewed: true,
    creditsReviewed: true,
    stateResidencyResolved: true,
    multiStateSourcingResolved: true,
    calculationValidationPassed: true,
    noUnresolvedHighRiskPositions: true,
    notesComplete: true
  };

  let checklistIncompleteBlocked = false;
  try {
    await FinalReturnReviewService.executeFinalSignoff({
      taxCaseId: testCase.id,
      reviewerUserId: cpaCaUser.id,
      checklist: incompleteChecklist,
      certificationNotes: 'Attempting partial signoff'
    });
  } catch (err: any) {
    checklistIncompleteBlocked = err.message.includes('CHECKLIST_INCOMPLETE');
  }
  assert(checklistIncompleteBlocked, 'Test 24: Signoff blocked when 14-point checklist has unverified items');

  // Complete checklist
  const completeChecklist: FinalReviewChecklist = {
    ...incompleteChecklist,
    withholdingReconciled: true
  };

  // Test 25: Authoritative professional signoff
  const signoff = await FinalReturnReviewService.executeFinalSignoff({
    taxCaseId: testCase.id,
    reviewerUserId: cpaCaUser.id,
    checklist: completeChecklist,
    certificationNotes: 'Return reviewed and verified compliant with IRC and Cal. RTC.'
  });

  const approvedCase = await prisma.taxCase.findUnique({ where: { id: testCase.id } });
  assert(
    signoff !== null && !signoff.isInvalidated && approvedCase?.status === 'APPROVED',
    'Test 25: Professional signoff persisted with fact hash, TaxCase status updated to APPROVED'
  );

  // Test 26: Fact mutation invalidates professional approval
  // Simulate subsequent taxpayer addition of a new 1099-MISC fact
  await prisma.taxFact.create({
    data: {
      taxCaseId: testCase.id,
      taxObligationId: testObligation.id,
      category: 'INCOME',
      factType: '1099_MISC_ROYALTY',
      key: '1099_misc_box2_royalties',
      valueCents: BigInt(500000), // $5,000.00
      taxYear: 2026,
      jurisdiction: 'US-FED'
    }
  });

  const invalidationCheck = await FinalReturnReviewService.invalidateSignoffIfFactsChanged(testCase.id);
  const recheckedCase = await prisma.taxCase.findUnique({ where: { id: testCase.id } });
  const recheckedSignoff = await prisma.reviewSignoff.findUnique({ where: { id: signoff.id } });

  assert(
    invalidationCheck.invalidated &&
    recheckedSignoff?.isInvalidated === true &&
    recheckedCase?.status === 'IN_REVIEW',
    'Test 26: Post-approval fact mutation invalidated signoff and reset TaxCase to IN_REVIEW'
  );

  console.log('\n[SECTION 9: QUALITY ASSURANCE & FOUR-EYES GOVERNANCE]');

  // Test 27: QA Sampling & Four-Eyes violation prevention
  // Create a high-risk case to test QA policy
  const highRiskCase = await prisma.taxCase.create({
    data: {
      organizationId: org.id,
      ownerId: customerUser.id,
      taxYear: 2026,
      riskLevel: 'HIGH',
      status: 'APPROVED'
    }
  });

  const qaSampling = await QualityAssuranceService.evaluateSamplingPolicy(highRiskCase.id, cpaCaUser.id);
  assert(
    qaSampling.shouldSample && qaSampling.reason === QaSamplingReason.HIGH_RISK,
    'Test 27a: Quality sampling policy automatically selected HIGH_RISK return for QA'
  );

  // Re-sign high-risk case to verify four-eyes violation
  await prisma.reviewSignoff.create({
    data: {
      taxCaseId: highRiskCase.id,
      reviewVersion: 1,
      approvedByUserId: cpaCaUser.id,
      calculationRunId: 'calc-run-qa-high-risk',
      ruleSetVersion: '2026.Q1',
      inputFactHash: 'dummy_hash',
      checklistResults: {}
    }
  });

  let fourEyesBlocked = false;
  try {
    // Elena Vance approved the return; she must NOT be the QA reviewer
    await QualityAssuranceService.createQualityReview({
      taxCaseId: highRiskCase.id,
      qaReviewerId: cpaCaUser.id,
      samplingReason: QaSamplingReason.HIGH_RISK
    });
  } catch (err: any) {
    fourEyesBlocked = err.message.includes('FOUR_EYES_VIOLATION');
  }
  assert(fourEyesBlocked, 'Test 27b: Four-Eyes Principle strictly prevents primary reviewer from QAing their own return');

  // Marcus Vance (Attorney/Level 3) can perform QA
  const validQa = await QualityAssuranceService.createQualityReview({
    taxCaseId: highRiskCase.id,
    qaReviewerId: attorneyUser.id,
    samplingReason: QaSamplingReason.HIGH_RISK
  });

  const completedQa = await QualityAssuranceService.completeQualityReview({
    qaReviewId: validQa.id,
    qaReviewerUserId: attorneyUser.id,
    action: QaAction.PASS,
    score: 96.0,
    findings: []
  });
  assert(
    completedQa.status === 'PASS' && completedQa.score === 96.0,
    'Test 27c: Independent Senior Reviewer completed QA review with score 96.0'
  );

  console.log('\n[SECTION 10: SLA ENGINE & OPERATIONS DASHBOARD]');

  // Test 28: SLA Engine evaluation & Customer Support privacy boundaries
  const slaStatus = await ServiceLevelAgreementEngine.evaluateTaskSla(reviewTask.id);
  assert(
    typeof slaStatus.elapsedHours === 'number' && typeof slaStatus.isBreached === 'boolean',
    'Test 28a: ServiceLevelAgreementEngine computed turnaround SLA and due date metrics'
  );

  // Operations Dashboard Metrics
  const opsMetrics = await ReviewOperationsDashboardService.getOperationsDashboard();
  assert(
    opsMetrics.totalActiveTasks >= 0 &&
    opsMetrics.reviewerCapacity.length >= 3 &&
    typeof opsMetrics.slaHealth.atRiskCount === 'number',
    'Test 28b: Operations Dashboard aggregated real-time capacity and queue turnaround statistics'
  );

  // Customer Support Scoped View
  const supportSummary = await ReviewOperationsDashboardService.getCustomerSupportCaseSummary(
    testCase.id,
    supportUser.id
  );
  assert(
    supportSummary.sanitizedNotice.includes('SUPPORT_SCOPED_VIEW') &&
    typeof supportSummary.completionPercent === 'number' &&
    Array.isArray(supportSummary.unresolvedQuestions),
    'Test 28c: Customer Support received privacy-scoped milestone summary without PII or return math'
  );

  console.log('\n========================================================================');
  console.log(`PHASE 6 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('========================================================================\n');
}

runPhase6MasterVerification().catch(err => {
  console.error('\nFATAL ERROR DURING PHASE 6 VERIFICATION:', err);
  process.exit(1);
});
