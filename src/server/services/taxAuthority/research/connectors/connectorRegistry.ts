/**
 * Autonomous Tax OS — Official Tax Authority Connector Registry
 * 
 * Manages official government connectors across Federal and all State jurisdictions.
 * Enforces domain whitelisting, anti-tampering guards, and network resilience.
 */

import { OfficialTaxAuthorityProvider, OfficialSourceItem, OfficialSearchCriteria } from './baseConnector';
import { FederalIrsAuthorityConnector } from './federalConnector';
import { CaliforniaFtbAuthorityConnector } from './californiaConnector';
import { NewYorkDtfAuthorityConnector } from './newYorkConnector';
import { NewJerseyDivTaxAuthorityConnector } from './newJerseyConnector';
import { IllinoisDorAuthorityConnector } from './illinoisConnector';
import { MassachusettsDorAuthorityConnector } from './massachusettsConnector';

export class OfficialConnectorRegistry {
  private static instance: OfficialConnectorRegistry;
  private connectors: Map<string, OfficialTaxAuthorityProvider> = new Map();
  private simulatedOutages: Set<string> = new Set();

  private constructor() {
    this.registerConnector(new FederalIrsAuthorityConnector());
    this.registerConnector(new CaliforniaFtbAuthorityConnector());
    this.registerConnector(new NewYorkDtfAuthorityConnector());
    this.registerConnector(new NewJerseyDivTaxAuthorityConnector());
    this.registerConnector(new IllinoisDorAuthorityConnector());
    this.registerConnector(new MassachusettsDorAuthorityConnector());
  }

  public static getInstance(): OfficialConnectorRegistry {
    if (!OfficialConnectorRegistry.instance) {
      OfficialConnectorRegistry.instance = new OfficialConnectorRegistry();
    }
    return OfficialConnectorRegistry.instance;
  }

  public registerConnector(connector: OfficialTaxAuthorityProvider): void {
    this.connectors.set(connector.jurisdiction, connector);
  }

  public getConnector(jurisdiction: string): OfficialTaxAuthorityProvider | undefined {
    if (this.simulatedOutages.has(jurisdiction)) {
      throw new Error(`Official Authority Connector for jurisdiction ${jurisdiction} is currently unreachable (simulated outage/downtime)`);
    }
    return this.connectors.get(jurisdiction);
  }

  public getAllConnectors(): OfficialTaxAuthorityProvider[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Simulates an agency portal outage for testing fallback and resilience behavior.
   */
  public setSimulatedOutage(jurisdiction: string, outage: boolean): void {
    if (outage) {
      this.simulatedOutages.add(jurisdiction);
    } else {
      this.simulatedOutages.delete(jurisdiction);
    }
  }

  /**
   * Validates if a URL belongs to ANY recognized official government domain.
   * SEO blogs, forums, commercial sites, and non-official blogs are rejected.
   */
  public isAnyOfficialUrl(url: string): boolean {
    if (!url) return false;
    for (const connector of this.connectors.values()) {
      if (connector.isOfficialUrl(url)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Searches across multiple jurisdictions simultaneously.
   */
  public async searchJurisdictions(
    criteria: { query: string; taxYear: number; topic?: string },
    jurisdictions: string[]
  ): Promise<OfficialSourceItem[]> {
    const results: OfficialSourceItem[] = [];
    for (const jur of jurisdictions) {
      try {
        const connector = this.getConnector(jur);
        if (connector) {
          const items = await connector.searchOfficialSources({
            query: criteria.query,
            jurisdiction: jur,
            taxYear: criteria.taxYear,
            topic: criteria.topic
          });
          results.push(...items);
        }
      } catch (err) {
        // Log connector error or outage
        console.warn(`[OfficialConnectorRegistry] Unable to query jurisdiction ${jur}:`, err);
      }
    }
    return results;
  }
}
