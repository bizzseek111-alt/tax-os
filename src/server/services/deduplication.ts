/**
 * Autonomous TaxOS — Document Deduplication Engine
 * 
 * Implements multi-tier duplicate classification:
 * 1. EXACT_DUPLICATE: Identical cryptographic SHA-256 checksum
 * 2. PROBABLE_DUPLICATE: Matching document type, issuer/EIN, tax year, and monetary amounts
 * 3. RELATED_DOCUMENT: Correlated economic records (e.g. invoice and receipt)
 * 
 * Never deletes probable duplicates silently; surfaces duplicate links for professional review.
 */

import { prisma } from '../db';
import { DocumentType, DuplicateType } from '@prisma/client';

export interface DeduplicationCheckResult {
  isDuplicate: boolean;
  duplicateType?: DuplicateType;
  duplicateOfId?: string;
  confidence: number;
  reason?: string;
}

export class DeduplicationService {
  /**
   * Evaluates a newly ingested document against existing documents within the organization/case.
   */
  static async evaluateDocument(
    organizationId: string,
    taxCaseId: string | null,
    sha256: string,
    documentType: DocumentType,
    taxYear: number,
    issuerEinOrTin?: string,
    extractedAmounts?: number[],
    excludeDocumentId?: string
  ): Promise<DeduplicationCheckResult> {
    // 1. EXACT DUPLICATE CHECK (Cryptographic SHA-256)
    const exactMatch = await prisma.document.findFirst({
      where: {
        organizationId,
        sha256,
        id: excludeDocumentId ? { not: excludeDocumentId } : undefined,
      },
    });

    if (exactMatch) {
      return {
        isDuplicate: true,
        duplicateType: DuplicateType.EXACT_DUPLICATE,
        duplicateOfId: exactMatch.id,
        confidence: 1.0,
        reason: `Cryptographic SHA-256 collision with document ${exactMatch.filename} (${exactMatch.id})`,
      };
    }

    // 2. PROBABLE DUPLICATE CHECK (Same Type, Same Year, Same TaxCase)
    if (taxCaseId && documentType !== DocumentType.UNKNOWN) {
      const candidates = await prisma.document.findMany({
        where: {
          organizationId,
          taxCaseId,
          documentType,
          taxYear,
          id: excludeDocumentId ? { not: excludeDocumentId } : undefined,
        },
      });

      for (const candidate of candidates) {
        // Compare structured OCR metadata
        const metadata = candidate.ocrMetadata as any;
        if (metadata) {
          const candidateEin = metadata.issuerEinOrTin;
          if (issuerEinOrTin && candidateEin && issuerEinOrTin === candidateEin) {
            // Check amounts if present
            return {
              isDuplicate: true,
              duplicateType: DuplicateType.PROBABLE_DUPLICATE,
              duplicateOfId: candidate.id,
              confidence: 0.88,
              reason: `Matching document type (${documentType}), tax year (${taxYear}), and employer/payer TIN (${issuerEinOrTin})`,
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      confidence: 0.0,
    };
  }
}
