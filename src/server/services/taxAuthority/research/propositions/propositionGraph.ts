/**
 * Autonomous Tax OS — Proposition Graph Service
 * 
 * Links TaxPositions to fine-grained statutory propositions, rules, official source chunks,
 * and cryptographic content hashes. Validates every proposition against official sources.
 */

import prisma from '../../../../db';
import { PropositionNodeData } from '../types';
import { CitationValidator } from './citationValidator';
import { AuthorityHierarchyEngine } from '../hierarchy/authorityHierarchyEngine';

export class PropositionGraphService {
  private static instance: PropositionGraphService;
  private citationValidator: CitationValidator;
  private hierarchyEngine: AuthorityHierarchyEngine;

  private constructor() {
    this.citationValidator = CitationValidator.getInstance();
    this.hierarchyEngine = AuthorityHierarchyEngine.getInstance();
  }

  public static getInstance(): PropositionGraphService {
    if (!PropositionGraphService.instance) {
      PropositionGraphService.instance = new PropositionGraphService();
    }
    return PropositionGraphService.instance;
  }

  /**
   * Constructs and attaches a proposition node to a TaxPosition.
   */
  public async addProposition(
    taxPositionId: string,
    proposition: {
      claimText: string;
      ruleId?: string;
      citationCode: string;
      pinpointCitation?: string;
      jurisdiction: string;
      taxYear: number;
    }
  ): Promise<PropositionNodeData> {
    // 1. Strict anti-hallucination validation
    const validation = await this.citationValidator.validateCitation(
      proposition.citationCode,
      proposition.jurisdiction,
      proposition.taxYear,
      proposition.claimText
    );

    let authorityLevel = 15;
    let authorityWeight = 0.0;
    let sourceChunkText = '';
    let sourceHash = '';
    let sourceUrl = '';

    if (validation.officialSource) {
      const auth = this.hierarchyEngine.assessSource(
        validation.officialSource,
        proposition.jurisdiction,
        proposition.taxYear
      );
      authorityLevel = auth.authorityLevel;
      authorityWeight = auth.authorityWeight;
      sourceChunkText = validation.officialSource.rawText;
      sourceHash = validation.officialSource.contentHash;
      sourceUrl = validation.officialSource.sourceUrl;
    }

    const nodeData: PropositionNodeData = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      taxPositionId,
      propositionText: proposition.claimText,
      statutoryCitation: proposition.citationCode,
      authorityLevel,
      ruleId: proposition.ruleId,
      validationStatus: validation.status,
      sourceUrl,
      sourceChunkText,
      sourceHash,
      authorityWeight,
      verificationDetails: {
        sourceUrl,
        sourceChunkText,
        sourceHash,
        authorityWeight,
        pinpointCitation: proposition.pinpointCitation
      },
      createdAt: new Date()
    };

    try {
      const created = await prisma.propositionNode.create({
        data: {
          taxPositionId: nodeData.taxPositionId!,
          propositionText: nodeData.propositionText,
          statutoryCitation: nodeData.statutoryCitation,
          authorityLevel: nodeData.authorityLevel,
          ruleId: nodeData.ruleId,
          validationStatus: nodeData.validationStatus,
          verificationDetails: nodeData.verificationDetails as any
        }
      });
      return {
        ...nodeData,
        id: created.id,
        createdAt: created.createdAt
      };
    } catch (err) {
      console.warn('[PropositionGraphService] DB write failed, using in-memory node:', err);
      return nodeData;
    }
  }

  /**
   * Retrieves all proposition nodes associated with a TaxPosition.
   */
  public async getPropositionsForPosition(taxPositionId: string): Promise<PropositionNodeData[]> {
    try {
      const records = await prisma.propositionNode.findMany({
        where: { taxPositionId }
      });
      return records.map((r: any) => ({
        id: r.id,
        taxPositionId: r.taxPositionId,
        propositionText: r.propositionText,
        statutoryCitation: r.statutoryCitation,
        authorityLevel: r.authorityLevel,
        ruleId: r.ruleId ?? undefined,
        validationStatus: r.validationStatus,
        verificationDetails: r.verificationDetails as any,
        sourceUrl: (r.verificationDetails as any)?.sourceUrl,
        sourceChunkText: (r.verificationDetails as any)?.sourceChunkText,
        sourceHash: (r.verificationDetails as any)?.sourceHash,
        authorityWeight: (r.verificationDetails as any)?.authorityWeight,
        createdAt: r.createdAt
      }));
    } catch {
      return [];
    }
  }
}
