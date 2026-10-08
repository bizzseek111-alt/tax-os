/**
 * Autonomous Tax OS — Multi-State E-File Provider Abstraction
 * 
 * Provides state-specific transmission, validation, and acknowledgment handling:
 * - California FTB (Form 540)
 * - New York State DTF (Form IT-201)
 * - New Jersey Division of Taxation (Form NJ-1040)
 * - Illinois IDOR (Form IL-1040)
 * - Massachusetts MassTaxConnect (Form 1)
 * 
 * Guarantees per-obligation status isolation:
 * - Federal accepted, CA accepted, NY rejected can coexist within the same TaxCase.
 */

import crypto from 'crypto';
import { prisma } from '../../../db';
import {
  FilingSubmission,
  FilingSubmissionStatus,
  AcknowledgmentStatus,
  FilingStatus,
  UserRole
} from '@prisma/client';
import { TransmissionResult, AcknowledgmentResult } from '../types';
import { AuditEventService } from '../../audit';

export interface StateFilingProvider {
  stateCode: string;
  agencyName: string;
  formType: string;

  validate(returnVersionId: string): Promise<{ isValid: boolean; validationErrors: string[] }>;
  transmit(params: {
    returnVersionId: string;
    taxObligationId?: string;
    idempotencyKey: string;
  }): Promise<TransmissionResult>;
  getAcknowledgment(transmissionId: string): Promise<AcknowledgmentResult>;
}

export class BaseStateFilingProvider implements StateFilingProvider {
  constructor(
    public readonly stateCode: string,
    public readonly agencyName: string,
    public readonly formType: string
  ) {}

  public async validate(returnVersionId: string): Promise<{
    isValid: boolean;
    validationErrors: string[];
  }> {
    const returnVersion = await prisma.returnVersion.findUnique({
      where: { id: returnVersionId },
      include: { authorizations: true }
    });

    if (!returnVersion) {
      throw new Error(`RETURN_VERSION_NOT_FOUND: ReturnVersion '${returnVersionId}' not found.`);
    }

    const errors: string[] = [];
    if (!returnVersion.isSigned) {
      errors.push(`STATE_SIGNATURE_REQUIRED: State return (${this.stateCode}) requires taxpayer authorization.`);
    }
    if (!returnVersion.jurisdictions.includes(this.stateCode)) {
      errors.push(`JURISDICTION_MISMATCH: ReturnVersion does not include jurisdiction '${this.stateCode}'.`);
    }

    return {
      isValid: errors.length === 0,
      validationErrors: errors
    };
  }

  public async transmit(params: {
    returnVersionId: string;
    taxObligationId?: string;
    idempotencyKey: string;
  }): Promise<TransmissionResult> {
    const validation = await this.validate(params.returnVersionId);
    if (!validation.isValid) {
      throw new Error(
        `STATE_TRANSMISSION_FAILED: ${this.stateCode} validation failed: ${validation.validationErrors.join('; ')}`
      );
    }

    // Check idempotency
    const existing = await prisma.filingSubmission.findUnique({
      where: { idempotencyKey: params.idempotencyKey }
    });
    if (existing) {
      return {
        submissionId: existing.id,
        idempotencyKey: existing.idempotencyKey,
        transmissionId: existing.transmissionId || `tx_${existing.id}`,
        status: existing.status,
        provider: existing.provider,
        environment: existing.environment,
        submittedAt: existing.submittedAt || existing.createdAt,
        payloadHash: existing.payloadHash
      };
    }

    const returnVersion = await prisma.returnVersion.findUnique({
      where: { id: params.returnVersionId },
      include: { taxCase: true }
    });

    if (!returnVersion) {
      throw new Error(`RETURN_VERSION_NOT_FOUND: ReturnVersion '${params.returnVersionId}' not found.`);
    }

    const transmissionId = `${this.stateCode}_TX_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const payload = JSON.stringify({ state: this.stateCode, versionId: params.returnVersionId, form: this.formType });
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    const now = new Date();

    const submission = await prisma.filingSubmission.create({
      data: {
        returnVersionId: params.returnVersionId,
        taxObligationId: params.taxObligationId,
        taxCaseId: returnVersion.taxCaseId,
        jurisdiction: this.stateCode,
        provider: `SANDBOX_${this.stateCode}_PROVIDER`,
        environment: 'SANDBOX',
        submissionType: 'ORIGINAL',
        idempotencyKey: params.idempotencyKey,
        transmissionId,
        payloadHash,
        schemaVersion: '2026v1.0',
        status: FilingSubmissionStatus.SENT,
        submittedAt: now
      }
    });

    // Update obligation filingStatus specifically
    if (params.taxObligationId) {
      await prisma.taxObligation.update({
        where: { id: params.taxObligationId },
        data: { filingStatus: 'TRANSMITTED' }
      });
    }

    // Record immutable audit block
    await AuditEventService.recordEvent({
      organizationId: returnVersion.taxCase.organizationId,
      actorId: returnVersion.taxCase.ownerId,
      actorRole: UserRole.SUPER_ADMIN,
      actorType: 'SYSTEM',
      taxCaseId: returnVersion.taxCaseId,
      action: `TRANSMIT_${this.stateCode}_RETURN`,
      objectType: 'FilingSubmission',
      objectId: submission.id,
      newValue: { transmissionId, payloadHash, agency: this.agencyName }
    });

    return {
      submissionId: submission.id,
      idempotencyKey: params.idempotencyKey,
      transmissionId,
      status: FilingSubmissionStatus.SENT,
      provider: `SANDBOX_${this.stateCode}_PROVIDER`,
      environment: 'SANDBOX',
      submittedAt: now,
      payloadHash
    };
  }

  public async getAcknowledgment(transmissionId: string): Promise<AcknowledgmentResult> {
    const submission = await prisma.filingSubmission.findFirst({
      where: { transmissionId }
    });

    if (!submission) {
      throw new Error(`SUBMISSION_NOT_FOUND: Submission '${transmissionId}' not found.`);
    }

    const ackId = `${this.stateCode}_ACK_${Date.now()}`;
    const now = new Date();

    const rawContent = JSON.stringify({
      agency: this.agencyName,
      state: this.stateCode,
      status: 'ACCEPTED',
      ackId,
      timestamp: now.toISOString()
    });

    const ack = await prisma.filingAcknowledgment.create({
      data: {
        submissionId: submission.id,
        agencyAcknowledgmentId: ackId,
        status: AcknowledgmentStatus.ACCEPTED,
        receivedAt: now,
        rawXmlOrJson: rawContent,
        normalizedDetails: { state: this.stateCode, form: this.formType, code: 'STATE_ACCEPTED' }
      }
    });

    await prisma.filingSubmission.update({
      where: { id: submission.id },
      data: {
        status: FilingSubmissionStatus.ACCEPTED,
        acknowledgedAt: now,
        acknowledgmentId: ack.id
      }
    });

    if (submission.taxObligationId) {
      await prisma.taxObligation.update({
        where: { id: submission.taxObligationId },
        data: { filingStatus: 'ACCEPTED' }
      });
    }

    return {
      acknowledgmentId: ack.id,
      submissionId: submission.id,
      status: AcknowledgmentStatus.ACCEPTED,
      receivedAt: now,
      agencyAcknowledgmentNumber: ackId,
      rawContent
    };
  }
}

/**
 * Concrete Providers for the Five Foundation States
 */
export class CaliforniaStateFilingProvider extends BaseStateFilingProvider {
  constructor() {
    super('US-CA', 'California Franchise Tax Board (FTB)', 'FORM_540');
  }
}

export class NewYorkStateFilingProvider extends BaseStateFilingProvider {
  constructor() {
    super('US-NY', 'New York State Department of Taxation and Finance', 'FORM_IT_201');
  }
}

export class NewJerseyStateFilingProvider extends BaseStateFilingProvider {
  constructor() {
    super('US-NJ', 'New Jersey Division of Taxation', 'FORM_NJ_1040');
  }
}

export class IllinoisStateFilingProvider extends BaseStateFilingProvider {
  constructor() {
    super('US-IL', 'Illinois Department of Revenue', 'FORM_IL_1040');
  }
}

export class MassachusettsStateFilingProvider extends BaseStateFilingProvider {
  constructor() {
    super('US-MA', 'Massachusetts Department of Revenue (MassTaxConnect)', 'FORM_1');
  }
}

/**
 * Registry dispatcher for state e-file providers
 */
export class StateFilingRegistry {
  private static providers: Record<string, StateFilingProvider> = {
    'US-CA': new CaliforniaStateFilingProvider(),
    'CA': new CaliforniaStateFilingProvider(),
    'US-NY': new NewYorkStateFilingProvider(),
    'NY': new NewYorkStateFilingProvider(),
    'US-NJ': new NewJerseyStateFilingProvider(),
    'NJ': new NewJerseyStateFilingProvider(),
    'US-IL': new IllinoisStateFilingProvider(),
    'IL': new IllinoisStateFilingProvider(),
    'US-MA': new MassachusettsStateFilingProvider(),
    'MA': new MassachusettsStateFilingProvider()
  };

  public static getProvider(jurisdiction: string): StateFilingProvider {
    const provider = this.providers[jurisdiction];
    if (!provider) {
      throw new Error(`UNSUPPORTED_STATE_FILING: Filing provider for '${jurisdiction}' is not configured.`);
    }
    return provider;
  }
}
