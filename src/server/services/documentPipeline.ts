/**
 * Autonomous TaxOS — Asynchronous Document Ingestion Pipeline Coordinator (Phase 2)
 * 
 * Orchestrates the full lifecycle:
 * 1. File Security & Magic Byte Validation
 * 2. Object Storage Streaming & SHA-256 Verification
 * 3. Exact & Probable Deduplication
 * 4. Document Classification & OCR
 * 5. Structured Tax Form Extraction
 * 6. Fact Validation & Cross-Document Conflict Detection
 * 7. Evidence Graph Edge Linking
 * 8. Real-time Processing State Progression (UPLOADED -> QUEUED -> EXTRACTING -> READY / NEEDS_REVIEW)
 */

import { prisma } from '../db';
import { FileSecurityService } from './fileSecurity';
import { objectStorage } from './storage';
import { documentIntelligence } from './ocr/InternalTaxParser';
import { DeduplicationService } from './deduplication';
import { EvidenceGraphService } from './evidenceGraph';
import { IngestionQueueService, JobPayload } from '../queue/queue';
import { AuditEventService } from './audit';
import {
  DocumentType,
  DocumentProcessingState,
  DocumentStatus,
  ExtractionStatus,
  UserRole,
} from '@prisma/client';
import crypto from 'crypto';

export interface IngestDocumentInput {
  buffer: Buffer;
  originalFilename: string;
  claimedMimeType?: string;
  organizationId: string;
  userId: string;
  taxCaseId?: string;
  taxYear?: number;
}

export class DocumentPipelineService {
  /**
   * Initializes queue handlers for background document processing.
   */
  static initialize() {
    IngestionQueueService.registerHandler(
      'DOCUMENT_UPLOAD_RECEIVED',
      async (job: JobPayload) => {
        return this.processDocumentJob(job.documentId!, job.organizationId, job.taxCaseId);
      }
    );
  }

  /**
   * Ingests an uploaded document asynchronously.
   * Streams bytes to object vault, validates security, creates initial DB record,
   * enqueues background worker, and returns immediately without blocking.
   */
  static async ingestDocument(input: IngestDocumentInput) {
    // 1. File Security Validation
    const val = FileSecurityService.validateUpload(
      input.buffer,
      input.originalFilename,
      input.claimedMimeType
    );

    if (!val.isValid) {
      throw new Error(`SECURITY_VALIDATION_FAILED: ${val.error}`);
    }

    // 2. Stream to Object Storage Vault
    const documentId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const storageKey = `vault/${input.organizationId}/${documentId}_${val.sanitizedFilename}`;
    const putResult = await objectStorage.putObject(input.buffer, storageKey, val.detectedMimeType);

    // 3. Exact Duplicate Detection Check
    const dedup = await DeduplicationService.evaluateDocument(
      input.organizationId,
      input.taxCaseId || null,
      putResult.sha256,
      DocumentType.UNKNOWN,
      input.taxYear || 2026
    );

    const initialProcessingState: DocumentProcessingState = dedup.isDuplicate
      ? DocumentProcessingState.DUPLICATE
      : DocumentProcessingState.QUEUED;

    // 4. Persist Document Entity in PostgreSQL
    const doc = await prisma.document.create({
      data: {
        id: documentId,
        organizationId: input.organizationId,
        taxCaseId: input.taxCaseId,
        ownerId: input.userId,
        filename: val.sanitizedFilename,
        originalFilename: input.originalFilename,
        mimeType: val.detectedMimeType,
        sizeBytes: BigInt(putResult.sizeBytes),
        storageKey: putResult.storageKey,
        sha256: putResult.sha256,
        documentType: DocumentType.UNKNOWN,
        taxYear: input.taxYear || 2026,
        status: DocumentStatus.PROCESSING,
        processingState: initialProcessingState,
        extractionStatus: ExtractionStatus.EXTRACTING,
        duplicateOfId: dedup.duplicateOfId,
        duplicateType: dedup.duplicateType,
        duplicateConfidence: dedup.confidence,
        duplicateReason: dedup.reason,
      },
    });

    // 5. If not an exact duplicate, enqueue async processing job
    if (!dedup.isDuplicate) {
      await IngestionQueueService.enqueueJob({
        jobType: 'DOCUMENT_UPLOAD_RECEIVED',
        organizationId: input.organizationId,
        taxCaseId: input.taxCaseId,
        documentId: doc.id,
        data: {
          storageKey: doc.storageKey,
          mimeType: doc.mimeType,
          originalFilename: doc.originalFilename,
        },
      });
    }

    // 6. Record Audit Event
    await AuditEventService.recordEvent({
      organizationId: input.organizationId,
      actorId: input.userId,
      actorRole: UserRole.TAXPAYER,
      taxCaseId: input.taxCaseId,
      action: 'INGEST_DOCUMENT_RECEIVED',
      objectType: 'Document',
      objectId: doc.id,
      reason: `Document uploaded and enqueued for async OCR processing (SHA-256: ${doc.sha256.slice(0, 16)}...)`,
      newValue: {
        documentId: doc.id,
        storageKey: doc.storageKey,
        processingState: doc.processingState,
      },
    });

    return doc;
  }

  /**
   * Background processor: Executes OCR, classification, extraction, validation, and evidence linking.
   */
  static async processDocumentJob(documentId: string, organizationId: string, taxCaseId?: string) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new Error(`DOCUMENT_NOT_FOUND: ${documentId}`);
    }

    try {
      // Step A: SCANNING state
      await prisma.document.update({
        where: { id: documentId },
        data: { processingState: DocumentProcessingState.SCANNING },
      });

      // Retrieve buffer from storage
      const buffer = await objectStorage.getObject(doc.storageKey);

      // Step B: CLASSIFYING & OCR state
      await prisma.document.update({
        where: { id: documentId },
        data: { processingState: DocumentProcessingState.CLASSIFYING },
      });

      const ocrResult = await documentIntelligence.processDocument(buffer, doc.mimeType);

      // Step C: EXTRACTING & NORMALIZING state
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingState: DocumentProcessingState.EXTRACTING,
          documentType: ocrResult.classification.documentType,
          ocrRaw: ocrResult.rawOcr as any,
          ocrNormalizedText: ocrResult.rawOcr.normalizedText,
          ocrMetadata: {
            issuerName: ocrResult.structured.issuerName,
            issuerEinOrTin: ocrResult.structured.issuerEinOrTin,
            confidence: ocrResult.classification.confidence,
          },
        },
      });

      // Step D: VALIDATING & MATCHING state
      await prisma.document.update({
        where: { id: documentId },
        data: { processingState: DocumentProcessingState.VALIDATING },
      });

      // Persist structured facts and attach Evidence edges
      let createdFacts: any[] = [];
      if (taxCaseId && ocrResult.structured.facts.length > 0) {
        createdFacts = await EvidenceGraphService.persistExtractedFacts(
          taxCaseId,
          documentId,
          ocrResult.structured.facts
        );
      }

      // Check probable duplicates based on extracted issuer and amounts
      const probableCheck = await DeduplicationService.evaluateDocument(
        organizationId,
        taxCaseId || null,
        doc.sha256,
        ocrResult.classification.documentType,
        doc.taxYear,
        ocrResult.structured.issuerEinOrTin,
        [],
        doc.id
      );

      // Final processing state: READY or NEEDS_REVIEW
      const finalState: DocumentProcessingState =
        ocrResult.structured.requiresReview || probableCheck.isDuplicate
          ? DocumentProcessingState.NEEDS_REVIEW
          : DocumentProcessingState.READY;

      const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
          processingState: finalState,
          status: DocumentStatus.PROCESSED,
          extractionStatus: ExtractionStatus.EXTRACTED,
          duplicateOfId: probableCheck.duplicateOfId || doc.duplicateOfId,
          duplicateType: probableCheck.duplicateType || doc.duplicateType,
          duplicateConfidence: probableCheck.confidence || doc.duplicateConfidence,
          duplicateReason: probableCheck.reason || doc.duplicateReason,
        },
      });

      return {
        documentId: updated.id,
        processingState: updated.processingState,
        documentType: updated.documentType,
        factsCount: createdFacts.length,
      };
    } catch (err: any) {
      console.error(`[Document Pipeline Error] Doc ${documentId}: ${err.message}`);
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingState: DocumentProcessingState.FAILED,
          status: DocumentStatus.ERROR,
          extractionStatus: ExtractionStatus.FAILED,
          processingError: err.message,
        },
      });
      throw err;
    }
  }

  /**
   * Retries ingestion processing on a failed document.
   */
  static async retryDocument(documentId: string, organizationId: string) {
    const doc = await prisma.document.findFirst({
      where: { id: documentId, organizationId },
    });

    if (!doc) throw new Error('DOCUMENT_NOT_FOUND');

    await prisma.document.update({
      where: { id: documentId },
      data: {
        processingState: DocumentProcessingState.QUEUED,
        processingError: null,
      },
    });

    return IngestionQueueService.enqueueJob({
      jobType: 'DOCUMENT_UPLOAD_RECEIVED',
      organizationId,
      taxCaseId: doc.taxCaseId || undefined,
      documentId: doc.id,
      data: { storageKey: doc.storageKey, mimeType: doc.mimeType },
    });
  }
}

// Auto-initialize queue listeners
DocumentPipelineService.initialize();
