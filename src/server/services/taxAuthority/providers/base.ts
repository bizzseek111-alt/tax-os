/**
 * Autonomous Tax OS — Abstract Tax Authority Provider
 * 
 * Defines the contract for official jurisdictional legal material providers.
 */

import {
  AuthorityChunkInput,
  AuthoritySourceInput,
  NormalizedRulePayload,
  StateConformityRecord,
  SupportedJurisdiction
} from '../types';

export interface TaxAuthorityProvider {
  readonly jurisdiction: SupportedJurisdiction;
  readonly publisherName: string;

  /**
   * Returns authoritative legal sources (Statutes, Regulations, Instructions) for tax year.
   */
  getSources(taxYear: number): Promise<AuthoritySourceInput[]>;

  /**
   * Returns normalized machine-readable TaxRules for this jurisdiction.
   */
  getRules(taxYear: number): Promise<NormalizedRulePayload[]>;

  /**
   * Returns state conformity records (for state providers).
   */
  getConformityRecords?(taxYear: number): Promise<StateConformityRecord[]>;
}
