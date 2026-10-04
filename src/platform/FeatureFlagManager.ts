/**
 * Autonomous Tax OS — Feature Flag Manager
 * Workstream 1: Dynamic feature control with tenant and jurisdictional scoping.
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  allowedJurisdictions?: string[];
  allowedTenants?: string[];
  description: string;
}

export class FeatureFlagManager {
  private static flags: Map<string, FeatureFlag> = new Map([
    [
      'MULTI_STATE_APPORTIONMENT',
      {
        key: 'MULTI_STATE_APPORTIONMENT',
        enabled: true,
        allowedJurisdictions: ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'],
        description: 'Enable sovereign multi-state allocation & telecommuter convenience rules'
      }
    ],
    [
      'AI_TAX_INBOX_AUTOPILOT',
      {
        key: 'AI_TAX_INBOX_AUTOPILOT',
        enabled: true,
        description: 'Enable instant single-click tax inbox resolution cards'
      }
    ],
    [
      'DIRECT_IRS_MEF_TRANSMISSION',
      {
        key: 'DIRECT_IRS_MEF_TRANSMISSION',
        enabled: false, // Locked until live AATS transmitter certificate is loaded
        description: 'Production AATS e-file transmission pipeline'
      }
    ],
    [
      'PROVE_THIS_NUMBER_DAG',
      {
        key: 'PROVE_THIS_NUMBER_DAG',
        enabled: true,
        description: 'Render interactive cryptographic tax lineage graph'
      }
    ]
  ]);

  public static isEnabled(key: string, jurisdiction?: string, tenantId?: string): boolean {
    const flag = this.flags.get(key);
    if (!flag || !flag.enabled) return false;

    if (jurisdiction && flag.allowedJurisdictions && !flag.allowedJurisdictions.includes(jurisdiction)) {
      return false;
    }

    if (tenantId && flag.allowedTenants && !flag.allowedTenants.includes(tenantId)) {
      return false;
    }

    return true;
  }

  public static setFlag(key: string, enabled: boolean): void {
    const existing = this.flags.get(key);
    if (existing) {
      existing.enabled = enabled;
    } else {
      this.flags.set(key, { key, enabled, description: 'Dynamically registered flag' });
    }
  }

  public static getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }
}
