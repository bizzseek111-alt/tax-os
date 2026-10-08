import { DocumentType } from '@prisma/client';
import {
  OcrRawResult,
  ClassificationResult,
  StructuredExtractionResult,
  TableData,
  KeyValuePair,
  OcrPage,
} from './types';

export interface DocumentIntelligenceProvider {
  name: string;
  version: string;

  extractText(buffer: Buffer, mimeType: string): Promise<string>;
  extractPages(buffer: Buffer, mimeType: string): Promise<OcrPage[]>;
  extractTables(buffer: Buffer, mimeType: string): Promise<TableData[]>;
  extractKeyValuePairs(buffer: Buffer, mimeType: string): Promise<KeyValuePair[]>;
  classifyDocument(buffer: Buffer, mimeType: string, text: string): Promise<ClassificationResult>;
  extractStructuredFields(
    documentType: DocumentType,
    buffer: Buffer,
    mimeType: string,
    text: string
  ): Promise<StructuredExtractionResult>;
  processDocument(buffer: Buffer, mimeType: string): Promise<{
    rawOcr: OcrRawResult;
    classification: ClassificationResult;
    structured: StructuredExtractionResult;
  }>;
}
