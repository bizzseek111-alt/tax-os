/**
 * Autonomous Tax OS — Filing Rejection Engine & Correction Workflow
 * 
 * Handles IRS MeF and state agency rejection notices:
 * - Translates obscure rejection codes into customer and professional explanations
 * - Intelligently routes simple issues to customer TaxTasks and complex issues to CPA ReviewTasks
 * - Enforces immutable correction provenance: Never mutates transmitted returns silently
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import {
  FilingRejection,
  FilingSubmissionStatus,
  FilingStatus,
  UserRole,
  RiskLevel,
  TaxDomain
} from '@prisma/client';
import { RejectionResolution } from '../types';
import { ReturnVersionService } from '../versioning/returnVersionService';
import { AuditEventService } from '../../audit';

export class RejectionEngine {
  /**
   * Statutory dictionary of standard IRS MeF reject codes with dual explanations.
   */
  private static readonly REJECT_DICTIONARY: Record<
    string,
    {
      category: string;
      customerExplanation: string;
      professionalExplanation: string;
      suggestedAction: 'TASK' | 'REVIEW' | 'LEGAL';
      fieldReference?: string;
    }
  > = {
    'R0000-500-01': {
      category: 'NAME_SSN_MISMATCH',
      customerExplanation:
        'The primary taxpayer name or Social Security Number did not match Social Security Administration records. Please verify the exact name on your Social Security card.',
      professionalExplanation:
        'MeF Rule R0000-500-01: Primary SSN and Name Control in ReturnHeader must match the IRS/SSA Master File Name Control database.',
      suggestedAction: 'TASK',
      fieldReference: 'ReturnHeader/Filer/PrimarySSN'
    },
    'F1040-068-01': {
      category: 'DEPENDENT_DUPLICATE_CLAIMED',
      customerExplanation:
        'A dependent claimed on your tax return was already claimed on another tax return filed this year. This usually happens if another family member or former spouse filed first.',
      professionalExplanation:
        'MeF Rule F1040-068-01: Qualifying Child or Qualifying Relative SSN has already been claimed as a dependent or exemption on a previously accepted return for this tax year under IRC § 151/152.',
      suggestedAction: 'REVIEW',
      fieldReference: 'IRS1040/Dependents'
    },
    'IND-516-01': {
      category: 'PRIOR_YEAR_AGI_MISMATCH',
      customerExplanation:
        'The prior year Adjusted Gross Income (AGI) entered for electronic signature verification did not match IRS records.',
      professionalExplanation:
        'MeF Rule IND-516-01: Primary Taxpayer prior year AGI does not match IRS Individual Master File records. Taxpayer must provide exact Line 11 AGI from prior year Form 1040 or request IRS Tax Transcript.',
      suggestedAction: 'TASK',
      fieldReference: 'ReturnHeader/SignatureOptionCd/PriorYearAGI'
    },
    'FW2-001-01': {
      category: 'EMPLOYER_EIN_INVALID',
      customerExplanation:
        'The Employer Identification Number (EIN) reported from your Form W-2 appears invalid or does not match IRS employer records.',
      professionalExplanation:
        'MeF Rule FW2-001-01: Form W-2 EmployerEIN must be a valid 9-digit format and exist in the IRS Business Master File.',
      suggestedAction: 'TASK',
      fieldReference: 'IRSW2/EmployerEIN'
    },
    'STATE-REJ-01': {
      category: 'STATE_RESIDENCY_DISPUTE',
      customerExplanation:
        'The state tax authority rejected the return because state withholding claimed does not match employer quarterly withholding reports.',
      professionalExplanation:
        'State Cross-Check Failure: State income tax withholding on Form W-2 Box 17 does not reconcile with state EDD/DTF wage reporting ledgers.',
      suggestedAction: 'REVIEW',
      fieldReference: 'StateReturn/Withholding'
    }
  };

  /**
   * Ingests and normalizes an agency rejection on a submission.
   */
  public static async ingestRejection(params: {
    submissionId: string;
    rejectCode: string;
    rawMessage: string;
    agency?: string;
    jurisdiction?: string;
  }): Promise<FilingRejection> {
    const submission = await prisma.filingSubmission.findUnique({
      where: { id: params.submissionId },
      include: { returnVersion: { include: { taxCase: true } } }
    });

    if (!submission) {
      throw new Error(`SUBMISSION_NOT_FOUND: Submission '${params.submissionId}' not found.`);
    }

    const dict = this.REJECT_DICTIONARY[params.rejectCode] || {
      category: 'GENERAL_REJECT',
      customerExplanation: `The tax authority returned a rejection: ${params.rawMessage}`,
      professionalExplanation: `Unrecognized MeF reject code ${params.rejectCode}: ${params.rawMessage}`,
      suggestedAction: 'REVIEW' as const
    };

    // 1. Create FilingRejection record
    const rejection = await prisma.filingRejection.create({
      data: {
        submissionId: params.submissionId,
        agency: params.agency || (submission.jurisdiction === 'US-FED' ? 'IRS' : 'STATE_AGENCY'),
        jurisdiction: params.jurisdiction || submission.jurisdiction,
        rejectCode: params.rejectCode,
        category: dict.category,
        rawMessage: params.rawMessage,
        customerFriendlyExplanation: dict.customerExplanation,
        professionalExplanation: dict.professionalExplanation,
        fieldOrFormReference: dict.fieldReference,
        resolutionStatus: 'UNRESOLVED'
      }
    });

    // 2. Update Submission & ReturnVersion to REJECTED / CORRECTION_REQUIRED
    await prisma.filingSubmission.update({
      where: { id: params.submissionId },
      data: {
        status: FilingSubmissionStatus.REJECTED,
        errorCode: params.rejectCode,
        errorMessage: params.rawMessage
      }
    });

    await prisma.returnVersion.update({
      where: { id: submission.returnVersionId },
      data: { filingStatus: FilingStatus.REJECTED }
    });

    // 3. Intelligent Rejection Routing
    let reviewTaskId: string | undefined;
    if (dict.suggestedAction === 'REVIEW' || dict.suggestedAction === 'LEGAL') {
      const reviewTask = await prisma.reviewTask.create({
        data: {
          taxCaseId: submission.taxCaseId,
          reviewType: 'REJECTION_REMEDIATION',
          taxDomain: TaxDomain.INCOME_TAX,
          jurisdiction: submission.jurisdiction,
          requiredRole: dict.suggestedAction === 'LEGAL' ? UserRole.ATTORNEY : UserRole.CPA,
          riskLevel: RiskLevel.HIGH,
          priority: 'HIGH',
          status: 'UNASSIGNED',
          deadline: new Date(Date.now() + 24 * 3600 * 1000),
          notes: `Agency rejection [${params.rejectCode}]: ${dict.professionalExplanation}`,
          professionalNotes: `Technical diagnostic: ${params.rawMessage}`
        }
      });
      reviewTaskId = reviewTask.id;

      await prisma.filingRejection.update({
        where: { id: rejection.id },
        data: { reviewTaskId, resolutionStatus: 'TASK_CREATED' }
      });
    } else {
      // Simple issue: create customer TaxTask
      await prisma.taxTask.create({
        data: {
          taxCaseId: submission.taxCaseId,
          taskType: 'CORRECT_REJECTED_INFORMATION',
          priority: 'HIGH',
          status: 'PENDING_TAXPAYER',
          reason: `Agency rejection [${params.rejectCode}]: ${dict.customerExplanation}`,
          auditRecordHash: crypto.createHash('sha256').update(`${submission.taxCaseId}:${params.rejectCode}:${Date.now()}`).digest('hex')
        }
      });
    }

    // 4. Record audit event
    await AuditEventService.recordEvent({
      organizationId: submission.returnVersion.taxCase.organizationId,
      actorId: submission.returnVersion.taxCase.ownerId,
      actorRole: UserRole.SUPER_ADMIN,
      actorType: 'SYSTEM',
      taxCaseId: submission.taxCaseId,
      action: 'INGEST_FILING_REJECTION',
      objectType: 'FilingRejection',
      objectId: rejection.id,
      newValue: { rejectCode: params.rejectCode, category: dict.category }
    });

    return prisma.filingRejection.findUniqueOrThrow({
      where: { id: rejection.id }
    });
  }

  /**
   * Executes the immutable Rejection Correction Flow:
   * 1. Marks prior rejection as RESOLVED
   * 2. Invalidates old signature requests
   * 3. Creates a new incremented ReturnVersion (e.g. v2)
   * 4. Resets filing status to CORRECTION_REQUIRED -> CALCULATING
   */
  public static async executeCorrectionFlow(params: {
    taxCaseId: string;
    rejectionId: string;
    correctedFacts: Record<string, any>;
    actorUserId: string;
    resolutionNotes: string;
  }): Promise<{ newReturnVersionId: string; rejectionStatus: string }> {
    // 1. Resolve rejection
    await prisma.filingRejection.update({
      where: { id: params.rejectionId },
      data: {
        resolutionStatus: 'RESOLVED',
        customerFriendlyExplanation: params.resolutionNotes
      }
    });

    // 2. Invalidate prior signatures
    await ReturnVersionService.invalidatePriorSignatures(
      params.taxCaseId,
      `Correction of agency rejection: ${params.resolutionNotes}`
    );

    // 3. Create fresh new ReturnVersion
    const latestVersion = await ReturnVersionService.getLatestReturnVersion(params.taxCaseId);
    const newVersion = await ReturnVersionService.createReturnVersion({
      taxCaseId: params.taxCaseId,
      taxYear: latestVersion?.taxYear || 2026,
      jurisdictions: latestVersion?.jurisdictions || ['US-FED'],
      forms: latestVersion?.forms || ['FORM_1040'],
      calculationRunIds: latestVersion?.calculationRunIds || [],
      ruleSetVersions: latestVersion?.ruleSetVersions || ['2026.1'],
      factsSnapshot: { ...(latestVersion?.factsSnapshot as any || {}), ...params.correctedFacts },
      actorUserId: params.actorUserId
    });

    // 4. Update status to CORRECTION_REQUIRED
    await prisma.returnVersion.update({
      where: { id: newVersion.id },
      data: { filingStatus: FilingStatus.CORRECTION_REQUIRED }
    });

    return {
      newReturnVersionId: newVersion.id,
      rejectionStatus: 'RESOLVED'
    };
  }
}
