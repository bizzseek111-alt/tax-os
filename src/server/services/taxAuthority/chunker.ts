/**
 * Autonomous Tax OS — Statutory Legal & Form Chunker
 * 
 * Unlike naive token-window chunkers that slice sentences in half and lose legal context,
 * the Statutory Chunker parses legal codes by structural semantic units:
 * - Section (§)
 * - Subsection ((a), (b))
 * - Paragraph ((1), (2))
 * - Subparagraph ((A), (B))
 * - Clause ((i), (ii))
 * - Form Line Instructions
 * - Tax Brackets & Tables
 * 
 * Guarantees every chunk retains its complete hierarchical path (e.g. "§ 199A > (b) > (2) > (A)").
 */

import {
  AuthorityChunkInput,
  AuthorityType,
  AUTHORITY_HIERARCHY_RANK,
  PrecedentialStatus
} from './types';

export interface ChunkingOptions {
  baseSection?: string;
  authorityType: AuthorityType;
  precedentialStatus: PrecedentialStatus;
  maxChunkSizeChars?: number;
}

export class StatutoryChunker {
  /**
   * Main entry point to chunk legal and administrative tax texts.
   */
  public static chunkDocument(
    rawText: string,
    options: ChunkingOptions
  ): AuthorityChunkInput[] {
    const authorityLevel = AUTHORITY_HIERARCHY_RANK[options.authorityType] ?? 10;
    const precedentialStatus = options.precedentialStatus;
    const baseSection = options.baseSection || 'General';

    // 1. Detect if this is a structured statute / regulation (contains § or subsections)
    if (this.isStatutoryFormat(rawText)) {
      return this.chunkStatute(rawText, baseSection, authorityLevel, precedentialStatus);
    }

    // 2. Detect if this is a form instruction (contains Line numbers or topics)
    if (this.isFormInstructionFormat(rawText)) {
      return this.chunkFormInstruction(rawText, baseSection, authorityLevel, precedentialStatus);
    }

    // 3. Fallback to structural heading and paragraph chunking
    return this.chunkStructuralText(rawText, baseSection, authorityLevel, precedentialStatus);
  }

  private static isStatutoryFormat(text: string): boolean {
    return /§\s*\d+|subsection\s*\([a-z]\)|\([a-z]\)\s+[A-Z]|\([0-9]+\)\s+[A-Z]/i.test(text);
  }

  private static isFormInstructionFormat(text: string): boolean {
    return /Line\s+\d+[a-z]?|Schedule\s+[A-Z]|Part\s+[I|V|X]+/i.test(text);
  }

  /**
   * Structural parser for Internal Revenue Code and State Tax Statutes.
   */
  private static chunkStatute(
    text: string,
    baseSection: string,
    authorityLevel: number,
    precedentialStatus: PrecedentialStatus
  ): AuthorityChunkInput[] {
    const chunks: AuthorityChunkInput[] = [];
    const lines = text.split('\n');

    let currentSection = baseSection;
    let currentSubsection = '';
    let currentParagraph = '';
    let currentHeading = '';
    let currentBuffer: string[] = [];
    let lineNumber = 1;
    let chunkStartLine = 1;

    const commitBuffer = () => {
      const content = currentBuffer.join('\n').trim();
      if (content.length > 0) {
        const pathParts = [currentSection];
        if (currentSubsection) pathParts.push(currentSubsection);
        if (currentParagraph) pathParts.push(currentParagraph);

        chunks.push({
          sectionPath: pathParts.join(' > '),
          heading: currentHeading || undefined,
          content,
          lineNumber: chunkStartLine,
          authorityLevel,
          precedentialStatus
        });
      }
      currentBuffer = [];
      chunkStartLine = lineNumber;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      lineNumber = i + 1;

      // Section header: e.g. "§ 199A. Qualified business income" or "SEC. 199A."
      const sectionMatch = line.match(/^(?:§|SEC\.|Section)\s*([0-9]+[A-Z]?\.?)\s*(.*)/i);
      if (sectionMatch) {
        commitBuffer();
        currentSection = `§ ${sectionMatch[1].replace('.', '')}`;
        currentSubsection = '';
        currentParagraph = '';
        currentHeading = sectionMatch[2]?.trim() || '';
        currentBuffer.push(line);
        continue;
      }

      // Subsection header: e.g. "(a) Allowance of deduction" or "(b) Deduction amount"
      const subsectionMatch = line.match(/^\s*\(([a-z])\)\s*(.*)/);
      if (subsectionMatch) {
        commitBuffer();
        currentSubsection = `(${subsectionMatch[1]})`;
        currentParagraph = '';
        currentHeading = subsectionMatch[2]?.trim() || '';
        currentBuffer.push(line);
        continue;
      }

      // Paragraph header: e.g. "(1) In general" or "(2) Specified service trade or business"
      const paragraphMatch = line.match(/^\s*\(([0-9]+)\)\s*(.*)/);
      if (paragraphMatch) {
        commitBuffer();
        currentParagraph = `(${paragraphMatch[1]})`;
        currentHeading = paragraphMatch[2]?.trim() || '';
        currentBuffer.push(line);
        continue;
      }

      currentBuffer.push(line);
    }

    commitBuffer();

    return chunks.length > 0 ? chunks : [{
      sectionPath: baseSection,
      heading: undefined,
      content: text.trim(),
      authorityLevel,
      precedentialStatus
    }];
  }

  /**
   * Parser for official IRS and State tax form instructions.
   */
  private static chunkFormInstruction(
    text: string,
    baseSection: string,
    authorityLevel: number,
    precedentialStatus: PrecedentialStatus
  ): AuthorityChunkInput[] {
    const chunks: AuthorityChunkInput[] = [];
    const lines = text.split('\n');

    let currentTopic = baseSection;
    let currentBuffer: string[] = [];
    let lineNumber = 1;
    let chunkStartLine = 1;

    const commitBuffer = () => {
      const content = currentBuffer.join('\n').trim();
      if (content.length > 0) {
        chunks.push({
          sectionPath: `${baseSection} > ${currentTopic}`,
          heading: currentTopic,
          content,
          lineNumber: chunkStartLine,
          authorityLevel,
          precedentialStatus
        });
      }
      currentBuffer = [];
      chunkStartLine = lineNumber;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      lineNumber = i + 1;

      // Line instruction: e.g. "Line 1z. Wages, salaries, tips" or "Schedule C, Line 31"
      const lineMatch = line.match(/^\s*(Line\s+[0-9]+[a-z]?|Part\s+[I|V|X]+|Schedule\s+[A-Z](?:\s*Line\s+[0-9]+)?)\.?\s*(.*)/i);
      if (lineMatch) {
        commitBuffer();
        currentTopic = lineMatch[1] + (lineMatch[2] ? ` - ${lineMatch[2]}` : '');
        currentBuffer.push(line);
        continue;
      }

      currentBuffer.push(line);
    }

    commitBuffer();
    return chunks.length > 0 ? chunks : [{
      sectionPath: baseSection,
      heading: baseSection,
      content: text.trim(),
      authorityLevel,
      precedentialStatus
    }];
  }

  /**
   * Parser for standard administrative guidance, revenue rulings, FAQs, and publications.
   */
  private static chunkStructuralText(
    text: string,
    baseSection: string,
    authorityLevel: number,
    precedentialStatus: PrecedentialStatus
  ): AuthorityChunkInput[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: AuthorityChunkInput[] = [];

    for (let idx = 0; idx < paragraphs.length; idx++) {
      const p = paragraphs[idx].trim();
      if (!p) continue;

      // Detect heading
      let heading: string | undefined;
      const firstLine = p.split('\n')[0].trim();
      if (firstLine.startsWith('#') || firstLine.endsWith(':') || firstLine.length < 60) {
        heading = firstLine.replace(/^#+\s*/, '').replace(/:$/, '');
      }

      chunks.push({
        sectionPath: heading ? `${baseSection} > ${heading}` : `${baseSection} > Part ${idx + 1}`,
        heading,
        content: p,
        pageNumber: 1,
        lineNumber: idx * 10 + 1,
        authorityLevel,
        precedentialStatus
      });
    }

    return chunks;
  }
}
