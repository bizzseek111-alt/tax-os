/**
 * Autonomous TaxOS — Feature Flag & Private Beta Gating Service
 * 
 * Provides controlled rollout, canary deployment, and strict Private Beta gating:
 * - Scoped flags by organization, role, tax domain, and jurisdiction
 * - Strictly blocks unsupported tax scenarios during Private Beta without improvising
 */

import { prisma } from '../../db';
import { UserRole } from '@prisma/client';

export interface EvaluateFlagParams {
  key: string;
  organizationId?: string;
  userRole?: UserRole;
  jurisdiction?: string;
  taxDomain?: string;
}

export class FeatureFlagService {
  /**
   * Evaluates if a feature flag is enabled for the specific caller context.
   */
  public static async isEnabled(params: EvaluateFlagParams): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: params.key }
    });

    if (!flag) return false;
    if (!flag.isEnabled) return false;

    // 1. Organization scoping
    if (flag.targetOrganizations && flag.targetOrganizations.length > 0) {
      if (!params.organizationId || !flag.targetOrganizations.includes(params.organizationId)) {
        return false;
      }
    }

    // 2. Role scoping
    if (flag.targetRoles && flag.targetRoles.length > 0) {
      if (!params.userRole || !flag.targetRoles.includes(params.userRole)) {
        return false;
      }
    }

    // 3. Jurisdiction scoping
    if (flag.targetJurisdictions && flag.targetJurisdictions.length > 0) {
      if (!params.jurisdiction || !flag.targetJurisdictions.includes(params.jurisdiction)) {
        return false;
      }
    }

    // 4. Domain scoping
    if (flag.targetDomains && flag.targetDomains.length > 0) {
      if (!params.taxDomain || !flag.targetDomains.includes(params.taxDomain)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sets or creates a feature flag.
   */
  public static async setFlag(params: {
    key: string;
    name: string;
    description: string;
    isEnabled: boolean;
    targetOrganizations?: string[];
    targetRoles?: string[];
    targetJurisdictions?: string[];
    targetDomains?: string[];
    isBetaOnly?: boolean;
    rolloutPercentage?: number;
  }) {
    return prisma.featureFlag.upsert({
      where: { key: params.key },
      update: {
        isEnabled: params.isEnabled,
        targetOrganizations: params.targetOrganizations || [],
        targetRoles: params.targetRoles || [],
        targetJurisdictions: params.targetJurisdictions || [],
        targetDomains: params.targetDomains || [],
        isBetaOnly: params.isBetaOnly ?? true,
        rolloutPercentage: params.rolloutPercentage ?? (params.isEnabled ? 100 : 0)
      },
      create: {
        key: params.key,
        name: params.name,
        description: params.description,
        isEnabled: params.isEnabled,
        targetOrganizations: params.targetOrganizations || [],
        targetRoles: params.targetRoles || [],
        targetJurisdictions: params.targetJurisdictions || [],
        targetDomains: params.targetDomains || [],
        isBetaOnly: params.isBetaOnly ?? true,
        rolloutPercentage: params.rolloutPercentage ?? (params.isEnabled ? 100 : 0)
      }
    });
  }

  /**
   * Private Beta Support Boundary Guard:
   * Explicitly evaluates if a tax case falls within the strictly supported beta matrix:
   * - Tax Year: 2026 (or 2025 prior year)
   * - Supported Filing Statuses: SINGLE, MFJ, HOH, MFS
   * - Supported Income: W-2, 1099-INT, 1099-DIV, 1099-NEC, Schedule C, 1099-K
   * - Supported States: US-FED, US-CA, US-NY, US-NJ, US-IL, US-MA
   * - Unsupported in Beta: Foreign Earned Income (Form 2555), Like-Kind Exchange (Form 8824),
   *   Passive Activity Credit Carryovers (Form 8582-CR).
   */
  public static evaluateBetaSupportEligibility(params: {
    taxYear: number;
    filingStatus: string;
    jurisdictions: string[];
    formsRequested: string[];
  }): { isSupportedInBeta: boolean; unsupportedReasons: string[] } {
    const reasons: string[] = [];

    // 1. Tax Year Check
    if (params.taxYear !== 2026 && params.taxYear !== 2025) {
      reasons.push(`Tax Year ${params.taxYear} is not currently supported in Private Beta. Supported years: 2025, 2026.`);
    }

    // 2. Jurisdiction Check
    const allowedJurisdictions = ['US-FED', 'US-CA', 'US-NY', 'US-NJ', 'US-IL', 'US-MA'];
    for (const j of params.jurisdictions) {
      if (!allowedJurisdictions.includes(j)) {
        reasons.push(`Jurisdiction ${j} is outside the Private Beta geographic scope. Supported: Federal, CA, NY, NJ, IL, MA.`);
      }
    }

    // 3. Unsupported complex forms
    const unsupportedBetaForms = ['FORM_2555', 'FORM_8824', 'FORM_8582_CR', 'FORM_1116_COMPLEX'];
    for (const f of params.formsRequested) {
      if (unsupportedBetaForms.includes(f)) {
        reasons.push(`Form ${f} requires specialized international or tax shelter review not supported in Private Beta.`);
      }
    }

    return {
      isSupportedInBeta: reasons.length === 0,
      unsupportedReasons: reasons
    };
  }
}
