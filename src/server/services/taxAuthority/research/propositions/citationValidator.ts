/**
 * Autonomous Tax OS — Strict Citation Anti-Hallucination Validator
 * 
 * Verifies that citations generated or claimed actually exist in official government sources,
 * have not been fabricated by LLMs, and are not superseded.
 */

import { PrecedentialStatus } from '../../types';
import { OfficialConnectorRegistry } from '../connectors/connectorRegistry';
import { OfficialSourceItem } from '../connectors/baseConnector';

export interface CitationValidationResult {
  isValid: boolean;
  status: 'VERIFIED' | 'INVALID_CITATION' | 'SUPERSEDED' | 'HALLUCINATION_DETECTED';
  citationCode: string;
  jurisdiction: string;
  officialSource?: OfficialSourceItem;
  reason: string;
}

export class CitationValidator {
  private static instance: CitationValidator;
  private registry: OfficialConnectorRegistry;

  private constructor() {
    this.registry = OfficialConnectorRegistry.getInstance();
  }

  public static getInstance(): CitationValidator {
    if (!CitationValidator.instance) {
      CitationValidator.instance = new CitationValidator();
    }
    return CitationValidator.instance;
  }

  /**
   * Validates a citation against official statutory repositories.
   */
  public async validateCitation(
    citationCode: string,
    jurisdiction: string,
    taxYear: number,
    claimedProposition?: string
  ): Promise<CitationValidationResult> {
    if (!citationCode || citationCode.trim().length === 0) {
      return {
        isValid: false,
        status: 'INVALID_CITATION',
        citationCode,
        jurisdiction,
        reason: 'Empty citation code provided.'
      };
    }

    // Try finding connector for jurisdiction
    let connector = this.registry.getConnector(jurisdiction);
    if (!connector && jurisdiction !== 'US-FED') {
      connector = this.registry.getConnector('US-FED');
    }

    if (!connector) {
      return {
        isValid: false,
        status: 'INVALID_CITATION',
        citationCode,
        jurisdiction,
        reason: `No registered official connector for jurisdiction ${jurisdiction}.`
      };
    }

    // Fetch official source
    const source = await connector.fetchSource(citationCode, taxYear);

    if (!source) {
      // Citation does not exist in official repository -> Hallucination Guard Triggers
      return {
        isValid: false,
        status: 'HALLUCINATION_DETECTED',
        citationCode,
        jurisdiction,
        reason: `Citation "${citationCode}" was not found in official government repositories for jurisdiction ${jurisdiction}. LLM citation hallucination rejected.`
      };
    }

    // Check Official URL domain whitelist
    if (!connector.isOfficialUrl(source.sourceUrl)) {
      return {
        isValid: false,
        status: 'INVALID_CITATION',
        citationCode,
        jurisdiction,
        reason: `Source URL ${source.sourceUrl} does not originate from an authorized official government domain.`
      };
    }

    // Check Precedential Status for supersession
    if (source.precedentialStatus === PrecedentialStatus.SUPERSEDED) {
      return {
        isValid: false,
        status: 'SUPERSEDED',
        citationCode,
        jurisdiction,
        officialSource: source,
        reason: `Statutory authority ${citationCode} has been superseded or repealed and cannot support tax positions.`
      };
    }

    // Check Proposition support if provided
    if (claimedProposition && source.rawText) {
      // Basic semantic validation: check if text contradicts disallowances
      const propLower = claimedProposition.toLowerCase();
      const rawLower = source.rawText.toLowerCase();

      if (propLower.includes('exempt') && rawLower.includes('no exemption') && !rawLower.includes('unless')) {
        return {
          isValid: false,
          status: 'INVALID_CITATION',
          citationCode,
          jurisdiction,
          officialSource: source,
          reason: `Cited text in ${citationCode} does not support the claimed exemption.`
        };
      }
    }

    return {
      isValid: true,
      status: 'VERIFIED',
      citationCode,
      jurisdiction,
      officialSource: source,
      reason: `Citation verified successfully against official ${connector.publisherName} repository.`
    };
  }
}
