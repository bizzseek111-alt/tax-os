/**
 * Autonomous Tax OS — Tax Research & Statutory Verification Agent
 * 
 * Performs authoritative tax law research across the Phase 4 Tax Authority Engine.
 * Interrogates statutes, Treasury regulations, Revenue Procedures, and judicial precedent.
 * Validates citations to prevent hallucination.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { TaxAuthoritySearchService } from '../../services/taxAuthority/rag/search';
import { TaxCitationValidator } from '../../services/taxAuthority/validation/citationValidator';
import { SupportedJurisdiction } from '../../services/taxAuthority/types';

export interface TaxResearchInput {
  query: string;
  jurisdiction: SupportedJurisdiction;
  taxYear: number;
  assertedCitation?: string;
  topic?: string;
}

export interface TaxResearchResult {
  query: string;
  jurisdiction: string;
  taxYear: number;
  citationValid?: boolean;
  citationDetails?: any;
  topAuthorities: Array<{
    citation: string;
    title: string;
    authorityType: string;
    precedentialStatus: string;
    snippet: string;
    score: number;
  }>;
  legalConclusion: string;
}

export class TaxResearchAgent extends BaseAgent<TaxResearchInput, TaxResearchResult> {
  public readonly agentType = AgentType.TAX_RESEARCH_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: TaxResearchInput
  ): Promise<AgentResult<TaxResearchResult>> {
    const cleanQuery = this.sanitizeUntrustedText(input.query);

    // 1. If an asserted citation is provided, validate it
    let citationValid: boolean | undefined;
    let citationDetails: any = undefined;

    if (input.assertedCitation) {
      const citationRes = await this.invokeTool(
        ctx,
        'validateCitation',
        { citation: input.assertedCitation, jurisdiction: input.jurisdiction, taxYear: input.taxYear },
        async () => {
          return await TaxCitationValidator.validateCitation({
            citationCode: input.assertedCitation!,
            jurisdiction: input.jurisdiction,
            taxYear: input.taxYear
          });
        }
      );
      citationValid = citationRes.isVerified;
      citationDetails = citationRes;
    }

    // 2. Perform hybrid search
    const searchResults = await this.invokeTool(
      ctx,
      'searchTaxAuthority',
      { query: cleanQuery, jurisdiction: input.jurisdiction, taxYear: input.taxYear },
      async () => {
        return await TaxAuthoritySearchService.search({
          query: cleanQuery,
          jurisdiction: input.jurisdiction,
          taxYear: input.taxYear,
          limit: 5
        });
      }
    );

    const topAuthorities = searchResults.map((r: any) => ({
      citation: r.citationCode || r.chunk?.citation || 'UNKNOWN',
      title: r.heading || r.source?.title || r.sectionPath || r.citationCode || 'Statutory Source',
      authorityType: r.authorityType || r.chunk?.authorityType || 'STATUTE',
      precedentialStatus: r.precedentialStatus || r.chunk?.precedentialStatus || 'BINDING_PRECEDENT',
      snippet: (r.content || r.chunk?.content || '').substring(0, 300),
      score: r.finalScore ?? r.score ?? 1.0
    }));

    const ruleRefs = topAuthorities.map((a: any) => a.citation);
    if (input.assertedCitation && !ruleRefs.includes(input.assertedCitation)) {
      ruleRefs.push(input.assertedCitation);
    }

    return this.createSuccessResult(
      ctx,
      {
        query: cleanQuery,
        jurisdiction: input.jurisdiction,
        taxYear: input.taxYear,
        citationValid,
        citationDetails,
        topAuthorities,
        legalConclusion: topAuthorities.length > 0
          ? `Found ${topAuthorities.length} authoritative sources. Primary governing authority: ${topAuthorities[0].citation}.`
          : 'No authoritative chunks matched the query in the local corpus.'
      },
      {
        confidence: citationValid === false ? 0.40 : 0.95,
        ruleRefs,
        warnings: citationValid === false ? [`Citation '${input.assertedCitation}' failed verification!`] : []
      }
    );
  }
}
