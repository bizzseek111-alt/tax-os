/**
 * Autonomous Tax OS — Phase 1 Persistence & Security Verification Suite
 * 
 * Verifies:
 * 1. Database Persistence & Schema Coverage (PostgreSQL 16 via Prisma)
 * 2. Multi-Tenant Data Isolation (Tenant A cannot query Tenant B)
 * 3. Role-Based Access Control (RBAC enforcement)
 * 4. Professional Routing (Jurisdiction & Domain gating for CPAs/EAs)
 * 5. Privileged Access Management (PAM 15-minute PII unmasking & revocation)
 * 6. Canonical TaxCase State Machine (Enforcement of valid transitions)
 * 7. Cryptographic Audit Trail (SHA-256 Block Hashing & Tamper Detection)
 * 8. Object Storage & Document Vault SHA-256 Lineage
 */

import { prisma } from '../server/db';
import { AuthService } from '../server/services/auth';
import { AuditEventService } from '../server/services/audit';
import { PrivilegedPiiService } from '../server/services/pam';
import { TaxCaseService } from '../server/services/taxCase';
import { ReviewRoutingService } from '../server/services/reviewRouting';
import { objectStorage } from '../server/services/storage';
import { CaseStatus, ReviewMode, UserRole } from '@prisma/client';
import crypto from 'crypto';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, durationMs: Date.now() - start });
    console.log(`  ✅ [PASS] ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, details: err.message, durationMs: Date.now() - start });
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
  }
}

async function runPhase1Verification() {
  console.log('\n======================================================================');
  console.log('🚀 RUNNING AUTONOMOUS TAX OS — PHASE 1 ALPHA VERIFICATION SUITE');
  console.log('======================================================================\n');

  // TEST 1: Database Schema & Seed Verification
  await runTest('1. Database Schema & Seed Integrity', async () => {
    const jurisdictionsCount = await prisma.taxJurisdiction.count();
    if (jurisdictionsCount < 5) throw new Error(`Expected at least 5 jurisdictions, found ${jurisdictionsCount}`);

    const orgsCount = await prisma.organization.count();
    if (orgsCount < 2) throw new Error(`Expected at least 2 tenant organizations, found ${orgsCount}`);

    const usersCount = await prisma.user.count();
    if (usersCount < 5) throw new Error(`Expected at least 5 users across roles, found ${usersCount}`);

    const cases = await prisma.taxCase.findMany({
      include: { obligations: true, tasks: true }
    });
    if (cases.length < 2) throw new Error(`Expected at least 2 cases, found ${cases.length}`);

    const apexCase = cases.find(c => c.id === 'case-2026-alex-rivera');
    if (!apexCase) throw new Error('Canonical TaxCase for Alex Rivera not found');
    if (apexCase.reviewMode !== ReviewMode.HUMAN_VERIFIED) throw new Error(`Expected reviewMode HUMAN_VERIFIED, got ${apexCase.reviewMode}`);
    if (apexCase.obligations.length < 3) throw new Error(`Expected multi-domain obligations >= 3, got ${apexCase.obligations.length}`);
  });

  // TEST 2: Multi-Tenant Data Isolation
  await runTest('2. Multi-Tenant Data Isolation Enforcement', async () => {
    const apexOrg = await prisma.organization.findUnique({ where: { slug: 'apex-dynamics' } });
    const boutiqueOrg = await prisma.organization.findUnique({ where: { slug: 'boutique-roasters' } });
    if (!apexOrg || !boutiqueOrg) throw new Error('Required tenants missing');

    // Tenant A querying own case -> succeeds
    const ownCase = await TaxCaseService.getCaseById('case-2026-alex-rivera', apexOrg.id);
    if (!ownCase) throw new Error('Failed to retrieve own case in Tenant A');

    // Tenant A querying Tenant B's case -> MUST FAIL
    let isolationViolated = false;
    try {
      await TaxCaseService.getCaseById('case-2026-boutique-roasters', apexOrg.id);
      isolationViolated = true;
    } catch (err: any) {
      if (!err.message.includes('CASE_NOT_FOUND_OR_ACCESS_DENIED')) {
        throw new Error(`Unexpected error message on tenant violation: ${err.message}`);
      }
    }

    if (isolationViolated) {
      throw new Error('SECURITY VIOLATION: Tenant A was able to read Tenant B case!');
    }
  });

  // TEST 3: Role-Based Access Control (RBAC)
  await runTest('3. Role-Based Access Control (RBAC)', async () => {
    const taxpayerUser = await prisma.user.findFirst({ where: { role: UserRole.TAXPAYER } });
    if (!taxpayerUser) throw new Error('Taxpayer user missing');

    // Taxpayer attempting to access professional review queue -> MUST FAIL
    let rbacBypassed = false;
    try {
      await ReviewRoutingService.getEligibleQueue(taxpayerUser.id);
      rbacBypassed = true;
    } catch (err: any) {
      if (!err.message.includes('INACTIVE_OR_UNAUTHORIZED_PROFESSIONAL_PROFILE')) {
        throw new Error(`Unexpected error on taxpayer review queue call: ${err.message}`);
      }
    }

    if (rbacBypassed) {
      throw new Error('SECURITY VIOLATION: Taxpayer was able to query professional review queue!');
    }

    // Taxpayer requesting privileged PII access grant -> MUST FAIL
    let pamBypassed = false;
    try {
      await PrivilegedPiiService.requestPiiAccess({
        userId: taxpayerUser.id,
        organizationId: 'org-apex-dynamics-2026',
        taxCaseId: 'case-2026-alex-rivera',
        targetRecordId: taxpayerUser.id,
        passwordConfirm: 'TaxOS2026!',
        reason: 'Attempting unauthorized PII elevation'
      });
      pamBypassed = true;
    } catch (err: any) {
      if (!err.message.includes('UNAUTHORIZED_ROLE_FOR_PII_ACCESS')) {
        throw new Error(`Unexpected error on unauthorized PAM request: ${err.message}`);
      }
    }

    if (pamBypassed) {
      throw new Error('SECURITY VIOLATION: Taxpayer was granted privileged PII access!');
    }
  });

  // TEST 4: Professional Routing (Jurisdiction & Domain Gating)
  await runTest('4. Professional Routing (Jurisdiction & Domain Gating)', async () => {
    const sarahCpa = await prisma.user.findUnique({
      where: { email: 'cpa.sarah.jenkins@taxos.example.com' },
      include: { professionalProfile: true }
    });
    const marcusEa = await prisma.user.findUnique({
      where: { email: 'ea.marcus.vance@taxos.example.com' },
      include: { professionalProfile: true }
    });

    if (!sarahCpa || !marcusEa) throw new Error('CPA and EA users missing');

    // 1. Sarah (CA + FED) attempts to claim CA review task -> SUCCEEDS
    const caClaim = await ReviewRoutingService.claimTask({
      reviewTaskId: 'rev-task-ca-540-01',
      reviewerUserId: sarahCpa.id
    });
    if (caClaim.status !== 'IN_REVIEW') throw new Error('Failed to set task status to IN_REVIEW');

    // 2. Sarah (CA + FED) attempts to claim NY review task -> MUST FAIL
    let unauthorizedJurisdictionAllowed = false;
    try {
      await ReviewRoutingService.claimTask({
        reviewTaskId: 'rev-task-ny-it201-01',
        reviewerUserId: sarahCpa.id
      });
      unauthorizedJurisdictionAllowed = true;
    } catch (err: any) {
      if (!err.message.includes('UNAUTHORIZED_JURISDICTION')) {
        throw new Error(`Unexpected error on unauthorized jurisdiction claim: ${err.message}`);
      }
    }

    if (unauthorizedJurisdictionAllowed) {
      throw new Error('SECURITY VIOLATION: CPA was able to claim task in unauthorized jurisdiction (NY)!');
    }

    // 3. Marcus (NY + FED) claims NY review task -> SUCCEEDS
    const nyClaim = await ReviewRoutingService.claimTask({
      reviewTaskId: 'rev-task-ny-it201-01',
      reviewerUserId: marcusEa.id
    });
    if (nyClaim.status !== 'IN_REVIEW') throw new Error('EA failed to claim NY task');

    // 4. Sarah signs off CA task with her PTIN -> Creates ProfessionalReview & signs off
    const signoffResult = await ReviewRoutingService.signoffTask({
      reviewTaskId: 'rev-task-ca-540-01',
      reviewerUserId: sarahCpa.id,
      ptin: 'P01849201',
      notes: 'California Form 540 adjustments confirmed.'
    });

    if (signoffResult.task.status !== 'APPROVED') throw new Error('ReviewTask status not set to APPROVED');
    if (!signoffResult.reviewRecord.signoffHash) throw new Error('Missing cryptographic signoffHash');
  });

  // TEST 5: Privileged Access Management (PAM) for PII (15-Minute Window)
  await runTest('5. Privileged Access Management (PAM) for PII', async () => {
    const alexUser = await prisma.user.findFirst({ where: { email: 'alex.rivera@apex.example.com' } });
    const sarahCpa = await prisma.user.findFirst({ where: { email: 'cpa.sarah.jenkins@taxos.example.com' } });
    if (!alexUser || !sarahCpa) throw new Error('Test users missing');

    const profile = await prisma.taxpayerProfile.findUnique({ where: { userId: alexUser.id } });
    if (!profile) throw new Error('TaxpayerProfile missing');

    // 1. Without active grant, CPA sees masked SSN
    const maskedCheck = await PrivilegedPiiService.getProtectedSsn(
      sarahCpa.id,
      alexUser.id,
      profile.ssnEncrypted,
      profile.ssnLast4
    );
    if (maskedCheck.isUnmasked || maskedCheck.ssn !== '***-**-6789') {
      throw new Error(`Expected masked SSN ***-**-6789, got ${maskedCheck.ssn}`);
    }

    // 2. Request privileged grant with invalid password -> FAILS
    let invalidPwPassed = false;
    try {
      await PrivilegedPiiService.requestPiiAccess({
        userId: sarahCpa.id,
        organizationId: 'org-apex-dynamics-2026',
        taxCaseId: 'case-2026-alex-rivera',
        targetRecordId: alexUser.id,
        passwordConfirm: 'wrong_password_123',
        reason: 'Audit verification for federal return'
      });
      invalidPwPassed = true;
    } catch (err: any) {
      if (!err.message.includes('INVALID_REAUTHENTICATION_CREDENTIALS')) {
        throw new Error(`Unexpected error on bad password re-auth: ${err.message}`);
      }
    }
    if (invalidPwPassed) throw new Error('SECURITY VIOLATION: Granted PAM access with invalid password!');

    // 3. Request privileged grant with valid password -> SUCCEEDS
    const grant = await PrivilegedPiiService.requestPiiAccess({
      userId: sarahCpa.id,
      organizationId: 'org-apex-dynamics-2026',
      taxCaseId: 'case-2026-alex-rivera',
      targetRecordId: alexUser.id,
      passwordConfirm: 'TaxOS2026!',
      reason: 'Audit verification of Form W-2 Box a SSN conformity'
    });

    const msUntilExpiry = grant.expiresAt.getTime() - grant.grantedAt.getTime();
    if (msUntilExpiry !== 15 * 60 * 1000) {
      throw new Error(`Grant duration must be exactly 15 minutes, got ${msUntilExpiry / 60000} mins`);
    }

    // 4. With active grant, CPA sees unmasked SSN
    const unmaskedCheck = await PrivilegedPiiService.getProtectedSsn(
      sarahCpa.id,
      alexUser.id,
      profile.ssnEncrypted,
      profile.ssnLast4
    );
    if (!unmaskedCheck.isUnmasked || unmaskedCheck.ssn !== '000-12-6789') {
      throw new Error(`Expected unmasked SSN 000-12-6789, got ${unmaskedCheck.ssn}`);
    }

    // 5. Revoke grant -> Reverts immediately to masked SSN
    await PrivilegedPiiService.revokeGrant(grant.id, sarahCpa.id, UserRole.CPA);
    const postRevokeCheck = await PrivilegedPiiService.getProtectedSsn(
      sarahCpa.id,
      alexUser.id,
      profile.ssnEncrypted,
      profile.ssnLast4
    );
    if (postRevokeCheck.isUnmasked || postRevokeCheck.ssn !== '***-**-6789') {
      throw new Error('SSN remained unmasked after grant revocation!');
    }
  });

  // TEST 6: TaxCase State Machine Transitions
  await runTest('6. TaxCase State Machine Transitions', async () => {
    const org = await prisma.organization.findUnique({ where: { slug: 'apex-dynamics' } });
    const user = await prisma.user.findFirst({ where: { email: 'alex.rivera@apex.example.com' } });
    if (!org || !user) throw new Error('Test entities missing');

    const testCase = await prisma.taxCase.create({
      data: {
        organizationId: org.id,
        ownerId: user.id,
        taxYear: 2026,
        status: CaseStatus.DRAFT,
        auditHash: 'genesis'
      }
    });

    // 1. Legal transition: DRAFT -> DOCUMENT_INTAKE -> SUCCEEDS
    const transition1 = await TaxCaseService.transitionStatus(
      testCase.id,
      org.id,
      CaseStatus.DOCUMENT_INTAKE,
      user.id,
      user.role,
      'Documents uploaded by taxpayer'
    );
    if (transition1.status !== CaseStatus.DOCUMENT_INTAKE) throw new Error('Transition failed');
    if (transition1.auditHash === 'genesis') throw new Error('auditHash was not updated');

    // 2. Illegal transition: DOCUMENT_INTAKE -> TRANSMITTED (skipping review & signoff) -> MUST FAIL
    let illegalTransitionPassed = false;
    try {
      await TaxCaseService.transitionStatus(
        testCase.id,
        org.id,
        CaseStatus.TRANSMITTED,
        user.id,
        user.role,
        'Attempting illegal skip directly to e-file'
      );
      illegalTransitionPassed = true;
    } catch (err: any) {
      if (!err.message.includes('ILLEGAL_CASE_TRANSITION')) {
        throw new Error(`Unexpected error on illegal state transition: ${err.message}`);
      }
    }

    if (illegalTransitionPassed) {
      throw new Error('STATE MACHINE VIOLATION: Case transitioned illegally to TRANSMITTED!');
    }

    // Clean up test case
    await prisma.taxCase.delete({ where: { id: testCase.id } });
  });

  // TEST 7: Cryptographic Audit Trail (SHA-256 Blockchain & Tamper Detection)
  await runTest('7. Cryptographic Audit Trail & Tamper Detection', async () => {
    const org = await prisma.organization.findUnique({ where: { slug: 'apex-dynamics' } });
    if (!org) throw new Error('Tenant missing');

    // 1. Verify uncorrupted chain
    const initialVerification = await AuditEventService.verifyChainIntegrity(org.id);
    if (!initialVerification.isValid) {
      throw new Error(`Audit chain verification failed unexpectedly: ${initialVerification.error}`);
    }
    if (initialVerification.totalBlocksVerified < 3) {
      throw new Error(`Expected at least 3 verified blocks, got ${initialVerification.totalBlocksVerified}`);
    }

    // 2. Simulate Tampering: Modify a historic block's data payload directly in PostgreSQL
    const targetBlock = await prisma.auditEvent.findFirst({
      where: { organizationId: org.id, sequence: 2n }
    });
    if (!targetBlock) throw new Error('Block at sequence 2 not found');

    const originalReason = targetBlock.reason;
    await prisma.auditEvent.update({
      where: { id: targetBlock.id },
      data: { reason: 'TAMPERED_PAYLOAD_UNAUTHORIZED_MUTATION' }
    });

    // 3. Verify integrity -> MUST FAIL AND CATCH TAMPERING
    const tamperedVerification = await AuditEventService.verifyChainIntegrity(org.id);
    if (tamperedVerification.isValid) {
      throw new Error('TAMPER DETECTION FAILURE: Modified audit block was not detected!');
    }

    if (tamperedVerification.tamperedSequence !== 2n) {
      throw new Error(`Expected tampered sequence 2, detected ${tamperedVerification.tamperedSequence}`);
    }

    // 4. Restore original content and verify it passes again
    await prisma.auditEvent.update({
      where: { id: targetBlock.id },
      data: { reason: originalReason }
    });

    const restoredVerification = await AuditEventService.verifyChainIntegrity(org.id);
    if (!restoredVerification.isValid) {
      throw new Error('Failed to restore verified audit chain after tamper test');
    }
  });

  // TEST 8: Object Storage & Cryptographic Document Vault
  await runTest('8. Object Storage & Document Vault SHA-256 Lineage', async () => {
    const testKey = `test_vault/test_doc_${Date.now()}.pdf`;
    const testContent = Buffer.from('PDF-1.7 Form 1040 Statutory Workpapers Verification Payload');
    const expectedSha256 = crypto.createHash('sha256').update(testContent).digest('hex');

    // Put object
    const putResult = await objectStorage.putObject(testContent, testKey, 'application/pdf');
    if (putResult.sha256 !== expectedSha256) {
      throw new Error(`Checksum mismatch: expected ${expectedSha256}, got ${putResult.sha256}`);
    }

    // Read object
    const retrieved = await objectStorage.getObject(testKey);
    if (!retrieved.equals(testContent)) {
      throw new Error('Retrieved content does not match original bytes');
    }

    // Verify SHA-256 check
    const isValid = await objectStorage.verifyObjectSha256(testKey, expectedSha256);
    if (!isValid) throw new Error('Storage provider verifyObjectSha256 failed');

    // Clean up
    await objectStorage.deleteObject(testKey);
  });

  console.log('\n======================================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('======================================================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1Verification()
  .catch((e) => {
    console.error('Fatal Test Runner Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
