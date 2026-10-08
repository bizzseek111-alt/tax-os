/**
 * Autonomous Tax OS — Review Authorization Engine
 * 
 * Enforces credential verification, jurisdiction authority, tax-domain scoping,
 * and review level thresholds before permitting any professional action.
 */

import { prisma } from '../db';
import { CredentialStatus, UserRole } from '@prisma/client';
import { ReviewerAuthorizationCheck } from './types';

export class ReviewAuthorizationEngine {
  /**
   * Evaluates if a reviewer has authority for a given task or case.
   */
  public static async evaluateAuthorization(params: {
    userId: string;
    jurisdiction: string;
    taxDomain: string;
    materialityUsd?: number;
    isLegalControversy?: boolean;
    requiredRole?: UserRole | string;
    minimumReviewLevel?: number;
  }): Promise<ReviewerAuthorizationCheck> {
    const reasons: string[] = [];

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        professionalProfile: true,
        credentials: true
      }
    });

    if (!user) {
      return {
        authorized: false,
        reasons: ['User does not exist'],
        reviewerId: params.userId,
        credentialStatus: CredentialStatus.PENDING_VERIFICATION,
        reviewLevel: 0,
        authorizedJurisdictions: [],
        authorizedTaxDomains: []
      };
    }

    // Super Admin bypass for operational emergencies
    if (user.role === UserRole.SUPER_ADMIN) {
      return {
        authorized: true,
        reasons: ['SUPER_ADMIN operational authorization grant'],
        reviewerId: user.id,
        credentialStatus: CredentialStatus.ACTIVE,
        reviewLevel: 3,
        authorizedJurisdictions: ['*'],
        authorizedTaxDomains: ['*']
      };
    }

    const profile = user.professionalProfile;
    if (!profile) {
      return {
        authorized: false,
        reasons: ['User lacks a ProfessionalProfile in TaxOS'],
        reviewerId: user.id,
        credentialStatus: CredentialStatus.PENDING_VERIFICATION,
        reviewLevel: 0,
        authorizedJurisdictions: [],
        authorizedTaxDomains: []
      };
    }

    // 1. Check Credential Status
    if (profile.credentialStatus !== CredentialStatus.ACTIVE) {
      reasons.push(`Professional credential status is '${profile.credentialStatus}'. Must be 'ACTIVE'.`);
    }

    // 2. Check Credential Expiration
    if (profile.credentialExpiration && profile.credentialExpiration < new Date()) {
      reasons.push(`Professional credential expired on ${profile.credentialExpiration.toISOString().slice(0, 10)}.`);
    }

    // 3. Check Jurisdiction Scoping
    const jurisdictions = profile.authorizedJurisdictions || [];
    const isJurisdictionAllowed =
      jurisdictions.includes('*') ||
      jurisdictions.includes(params.jurisdiction) ||
      (params.jurisdiction === 'US-FED' && jurisdictions.some(j => j.startsWith('US-')));

    if (!isJurisdictionAllowed) {
      reasons.push(`Reviewer is not authorized for jurisdiction '${params.jurisdiction}'. Permitted: [${jurisdictions.join(', ')}]`);
    }

    // 4. Check Tax Domain Scoping
    const domains = profile.authorizedTaxDomains || [];
    const isDomainAllowed = domains.includes('*') || domains.includes(params.taxDomain);
    if (!isDomainAllowed) {
      reasons.push(`Reviewer is not authorized for tax domain '${params.taxDomain}'. Permitted: [${domains.join(', ')}]`);
    }

    // 5. Check Legal Controversy requirement
    if (params.isLegalControversy) {
      if (user.role !== UserRole.ATTORNEY && profile.credentialType !== 'TAX_ATTORNEY') {
        reasons.push('Legal controversy / fraud exposure requires licensed Tax Attorney representation.');
      }
    }

    // 6. Check Review Level for high materiality
    const materiality = params.materialityUsd || 0;
    if (materiality > 50000 && profile.reviewLevel < 2) {
      reasons.push(`Materiality ($${materiality.toLocaleString()}) exceeds $50,000 threshold, requiring Senior Reviewer (Level 2+).`);
    }

    if (params.minimumReviewLevel && profile.reviewLevel < params.minimumReviewLevel) {
      reasons.push(`Task requires minimum review level ${params.minimumReviewLevel}, but reviewer is Level ${profile.reviewLevel}.`);
    }

    // 7. Check Role Match if explicitly required
    if (params.requiredRole) {
      const reqRole = params.requiredRole.toString();
      const hasRoleMatch =
        user.role === reqRole ||
        (reqRole === 'ATTORNEY' && user.role === UserRole.ATTORNEY) ||
        (reqRole === 'CPA' && (user.role === UserRole.CPA || user.role === UserRole.SENIOR_REVIEWER)) ||
        (reqRole === 'EA' && (user.role === UserRole.EA || user.role === UserRole.CPA));

      if (!hasRoleMatch) {
        reasons.push(`Reviewer role '${user.role}' does not satisfy required role '${reqRole}'.`);
      }
    }

    return {
      authorized: reasons.length === 0,
      reasons,
      reviewerId: user.id,
      credentialStatus: profile.credentialStatus,
      reviewLevel: profile.reviewLevel,
      authorizedJurisdictions: jurisdictions,
      authorizedTaxDomains: domains
    };
  }

  /**
   * Asserts that a user is authorized or throws an error.
   */
  public static async assertAuthorized(params: {
    userId: string;
    jurisdiction: string;
    taxDomain: string;
    materialityUsd?: number;
    isLegalControversy?: boolean;
    requiredRole?: UserRole | string;
    minimumReviewLevel?: number;
  }): Promise<void> {
    const check = await this.evaluateAuthorization(params);
    if (!check.authorized) {
      throw new Error(`REVIEW_AUTHORIZATION_DENIED: ${check.reasons.join('; ')}`);
    }
  }

  /**
   * Verifies that the user has final return approval authority.
   */
  public static async assertCanApproveFinalReturn(userId: string, jurisdiction: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { professionalProfile: true }
    });

    if (!user) throw new Error('User not found');

    const allowedApprovalRoles: UserRole[] = [
      UserRole.CPA,
      UserRole.EA,
      UserRole.ATTORNEY,
      UserRole.SENIOR_REVIEWER,
      UserRole.SUPER_ADMIN
    ];

    if (!allowedApprovalRoles.includes(user.role)) {
      throw new Error(`APPROVAL_PERMISSION_DENIED: Role '${user.role}' cannot sign final return approval.`);
    }

    const profile = user.professionalProfile;
    if (user.role !== UserRole.SUPER_ADMIN) {
      if (!profile || profile.credentialStatus !== CredentialStatus.ACTIVE) {
        throw new Error('APPROVAL_PERMISSION_DENIED: Reviewer must have an ACTIVE professional credential.');
      }
      if (profile.credentialExpiration && profile.credentialExpiration < new Date()) {
        throw new Error('APPROVAL_PERMISSION_DENIED: Reviewer credential has expired.');
      }
      if (!profile.authorizedJurisdictions.includes('*') && !profile.authorizedJurisdictions.includes(jurisdiction)) {
        throw new Error(`APPROVAL_PERMISSION_DENIED: Reviewer not authorized for jurisdiction '${jurisdiction}'.`);
      }
    }
  }
}
