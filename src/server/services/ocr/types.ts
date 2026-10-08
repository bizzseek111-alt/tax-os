import { DocumentType } from '@prisma/client';

export interface BoundingBox {
  pageNumber: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface KeyValuePair {
  key: string;
  value: string;
  confidence: number;
  keyBox?: BoundingBox;
  valueBox?: BoundingBox;
}

export interface TableCell {
  rowIndex: number;
  colIndex: number;
  text: string;
}

export interface TableData {
  pageNumber: number;
  rowCount: number;
  colCount: number;
  cells: TableCell[];
}

export interface OcrPage {
  pageNumber: number;
  text: string;
  width?: number;
  height?: number;
  tables?: TableData[];
  keyValuePairs?: KeyValuePair[];
}

export interface OcrRawResult {
  providerName: string;
  providerVersion: string;
  normalizedText: string;
  pages: OcrPage[];
  keyValuePairs: KeyValuePair[];
  tables: TableData[];
  overallConfidence: number;
  timestamp: string;
}

export interface ClassificationResult {
  documentType: DocumentType;
  confidence: number;
  alternatives: { type: DocumentType; confidence: number }[];
  requiresReview: boolean;
}

export interface ExtractedFactCandidate {
  key: string;
  category: 'INCOME' | 'EXPENSE' | 'DEDUCTION' | 'ASSET' | 'WITHHOLDING';
  factType: string;
  valueCents?: bigint;
  valueString?: string;
  unit?: string;
  taxYear?: number;
  jurisdiction?: string;
  sourcePage: number;
  sourceRegion: { box?: string; label: string };
  confidence: number;
}

export interface StructuredExtractionResult {
  documentType: DocumentType;
  taxYear?: number;
  confidence: number;
  issuerName?: string;
  issuerEinOrTin?: string;
  recipientName?: string;
  recipientSsnOrTinToken?: string;
  fields: Record<string, any>;
  facts: ExtractedFactCandidate[];
  requiresReview: boolean;
  validationErrors?: string[];
}
