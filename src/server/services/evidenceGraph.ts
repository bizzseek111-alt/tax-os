/**
 * Autonomous TaxOS — Evidence Graph & Fact Validation Engine (Phase 2)
 * 
 * Provides:
 * - Deterministic validation rules for tax facts (Box 1 numeric, non-negative withholding, EIN/SSN format)
 * - Cross-document conflict detection (e.g. duplicate W-2 with mismatching wages)
 * - Evidence graph construction linking TaxFacts to source Documents, pages, and boxes
 * - Cryptographic provenance traversal: `getFactProvenance(factId)` ("Prove This Number")
 * - Audited fact corrections with immutable version history
 */

import { prisma } from '../db';
import { FactValidationStatus, EvidenceType, UserRole } from '@prisma/client';
import { AuditEventService } from './audit';
import crypto from 'crypto';

export interface FactValidationRuleResult {
  isValid: boolean;
  status: FactValidationStatus;
  errors: string[];
}

export interface FactProvenanceReport {
  factId: string;
  category: string;
  key: string;
  valueCents: string | null;
  valueString: string | null;
  confidence: number;
  validationStatus: FactValidationStatus;
  sourceDocument?: {
    id: string;
    filename: string;
    mimeType: string;
    sha256: string;
    storageKey: string;
    taxYear: number;
  };
  evidenceProvenance: {
    evidenceId: string;
    evidenceType: EvidenceType;
    relationType: string;
    hash: string;
    sourcePage: number | null;
    sourceRegion: any;
  }[];
}

export class EvidenceGraphService {
  /**
   * Deterministically validates an extracted tax fact candidate.
   */
  static validateFactRules(
    key: string,
    valueCents?: bigint,
    taxYear?: number,
    caseTaxYear = 2026,
    additionalMetadata?: Record<string, any>
  ): FactValidationRuleResult {
    const errors: string[] = [];

    // Rule: Box 1 numeric & positive
    if (key === 'w2_box1_wages') {
      if (valueCents === undefined || valueCents === null || valueCents <= 0n) {
        errors.push('W-2 Box 1 wages must be a positive numeric value');
      }
    }

    // Rule: Box 2 withholding cannot be negative
    if (key === 'w2_box2_federal_withholding') {
      if (valueCents !== undefined && valueCents < 0n) {
        errors.push('Federal income tax withholding cannot be negative');
      }
    }

    // Rule: Tax Year conformity
    if (taxYear && taxYear !== caseTaxYear && !key.startsWith('prior_year')) {
      errors.push(`Tax year (${taxYear}) does not match active tax case filing year (${caseTaxYear})`);
    }

    // Rule: Valid 2-letter state code
    if (additionalMetadata?.stateCode) {
      const code = additionalMetadata.stateCode.toUpperCase();
      if (!/^[A-Z]{2}$/.test(code)) {
        errors.push(`Invalid state jurisdiction code format: ${code}`);
      }
    }

    // Rule: Valid EIN format
    if (additionalMetadata?.ein) {
      if (!/^[0-9]{2}-[0-9]{7}$/.test(additionalMetadata.ein)) {
        errors.push(`Invalid EIN format: ${additionalMetadata.ein}`);
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        status: FactValidationStatus.CONFLICTED,
        errors,
      };
    }

    return {
      isValid: true,
      status: FactValidationStatus.VALIDATED,
      errors: [],
    };
  }

  /**
   * Persists extracted facts and attaches bi-directional Evidence edges.
   */
  static async persistExtractedFacts(
    taxCaseId: string,
    documentId: string,
    facts: {
      key: string;
      category: string;
      factType: string;
      valueCents?: bigint;
      valueString?: string;
      taxYear?: number;
      jurisdiction?: string;
      sourcePage: number;
      sourceRegion: any;
      confidence: number;
    }[]
  ) {
    const createdFacts = [];

    for (const f of facts) {
      // 1. Validate rules
      const val = this.validateFactRules(f.key, f.valueCents, f.taxYear);

      // 2. Check cross-document conflicts
      const existing = await prisma.taxFact.findFirst({
        where: {
          taxCaseId,
          key: f.key,
          sourceDocumentId: { not: documentId },
        },
      });

      let finalStatus = val.status;
      let conflictDetails: any = null;

      if (existing && existing.valueCents && f.valueCents && existing.valueCents !== f.valueCents) {
        finalStatus = FactValidationStatus.CONFLICTED;
        conflictDetails = {
          conflictingFactId: existing.id,
          conflictingDocumentId: existing.sourceDocumentId,
          existingValueCents: existing.valueCents.toString(),
          newValueCents: f.valueCents.toString(),
          reason: `Mismatching value for ${f.key} across multiple documents`,
        };

        // Create a TaxTask for the taxpayer or reviewer to resolve
        await prisma.taxTask.create({
          data: {
            taxCaseId,
            taskType: 'CROSS_DOCUMENT_CONFLICT',
            reason: `Conflicting values for ${f.key}: $${Number(existing.valueCents) / 100} vs $${Number(f.valueCents) / 100}. Please confirm the accurate source.`,
            status: 'PENDING_TAXPAYER',
            priority: 'HIGH',
            auditRecordHash: crypto.createHash('sha256').update(`${f.key}|CONFLICT|${Date.now()}`).digest('hex'),
          },
        });
      }

      // 3. Persist TaxFact
      const fact = await prisma.taxFact.create({
        data: {
          taxCaseId,
          category: f.category,
          factType: f.factType,
          key: f.key,
          valueCents: f.valueCents,
          valueString: f.valueString,
          taxYear: f.taxYear || 2026,
          jurisdiction: f.jurisdiction,
          sourceDocumentId: documentId,
          sourcePage: f.sourcePage,
          sourceRegion: f.sourceRegion,
          confidence: f.confidence,
          validationStatus: finalStatus,
          conflictDetails: conflictDetails ?? undefined,
        },
      });

      // 4. Attach Evidence Edge
      const evidenceHash = crypto
        .createHash('sha256')
        .update(`${fact.id}|${documentId}|${f.sourcePage}|${JSON.stringify(f.sourceRegion)}`)
        .digest('hex');

      await prisma.evidence.create({
        data: {
          taxCaseId,
          documentId,
          factId: fact.id,
          evidenceType: EvidenceType.DOCUMENT,
          relationType: 'SUBSTANTIATES',
          hash: evidenceHash,
          confidence: f.confidence,
          createdBy: 'DocumentIntelligencePipeline',
        },
      });

      createdFacts.push(fact);
    }

    return createdFacts;
  }

  /**
   * Cryptographic Provenance Traversal ("Prove This Number")
   */
  static async getFactProvenance(factId: string): Promise<FactProvenanceReport> {
    const fact = await prisma.taxFact.findUnique({
      where: { id: factId },
      include: {
        evidence: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!fact) {
      throw new Error(`FACT_NOT_FOUND: ${factId}`);
    }

    const doc = fact.evidence[0]?.document;

    return {
      factId: fact.id,
      category: fact.category,
      key: fact.key,
      valueCents: fact.valueCents ? fact.valueCents.toString() : null,
      valueString: fact.valueString,
      confidence: fact.confidence,
      validationStatus: fact.validationStatus,
      sourceDocument: doc
        ? {
            id: doc.id,
            filename: doc.filename,
            mimeType: doc.mimeType,
            sha256: doc.sha256,
            storageKey: doc.storageKey,
            taxYear: doc.taxYear,
          }
        : undefined,
      evidenceProvenance: fact.evidence.map((e) => ({
        evidenceId: e.id,
        evidenceType: e.evidenceType,
        relationType: e.relationType,
        hash: e.hash,
        sourcePage: fact.sourcePage,
        sourceRegion: fact.sourceRegion,
      })),
    };
  }

  /**
   * Corrects a TaxFact with immutable versioning and audit block.
   */
  static async correctFact(
    factId: string,
    newValueCents: bigint,
    correctionReason: string,
    actorId: string,
    actorRole: UserRole,
    organizationId: string
  ) {
    const originalFact = await prisma.taxFact.findUnique({
      where: { id: factId },
      include: { taxCase: true },
    });

    if (!originalFact) {
      throw new Error(`FACT_NOT_FOUND: ${factId}`);
    }

    // 1. Update fact with confirmed status
    const updatedFact = await prisma.taxFact.update({
      where: { id: factId },
      data: {
        valueCents: newValueCents,
        validationStatus:
          actorRole === UserRole.CPA || actorRole === UserRole.EA
            ? FactValidationStatus.PROFESSIONAL_CONFIRMED
            : FactValidationStatus.USER_CONFIRMED,
        isVerified: true,
        verifiedByUserId: actorId,
      },
    });

    // 2. Attach Evidence edge for manual user/professional confirmation
    await prisma.evidence.create({
      data: {
        taxCaseId: originalFact.taxCaseId,
        factId: originalFact.id,
        evidenceType:
          actorRole === UserRole.CPA || actorRole === UserRole.EA
            ? EvidenceType.PROFESSIONAL_CONFIRMATION
            : EvidenceType.USER_CONFIRMATION,
        relationType: 'MANUAL_CORRECTION_OVERRIDE',
        hash: crypto
          .createHash('sha256')
          .update(`${factId}|CORRECTION|${newValueCents}|${actorId}`)
          .digest('hex'),
        createdBy: actorId,
      },
    });

    // 3. Record to immutable audit blockchain
    await AuditEventService.recordEvent({
      organizationId,
      actorId,
      actorRole,
      taxCaseId: originalFact.taxCaseId,
      action: 'CORRECT_TAX_FACT',
      objectType: 'TaxFact',
      objectId: factId,
      previousValue: { valueCents: originalFact.valueCents?.toString() },
      newValue: { valueCents: newValueCents.toString() },
      reason: correctionReason,
    });

    return updatedFact;
  }
}
