import { 
  UserRole, 
  Permission, 
  UserContext, 
  TenantEntitlements, 
  ROLE_PERMISSIONS_MATRIX,
  B2BSubscriptionTier
} from '../types/security';
import { TaxDomain, LifecycleStage } from '../types/common';

export class EntitlementsGuard {
  /**
   * Evaluates if a tenant is entitled to a specific tax domain
   */
  static isDomainEntitled(tenant: TenantEntitlements, domain: TaxDomain): boolean {
    const entitlement = tenant.domains[domain];
    return entitlement ? entitlement.isEntitled : false;
  }

  /**
   * Checks if user has a required permission
   */
  static hasPermission(user: UserContext, requiredPermission: Permission): boolean {
    return user.permissions.has(requiredPermission);
  }

  /**
   * Masks sensitive PII unless the user has 'payroll:read_pii'
   */
  static maskSSN(ssn: string, user: UserContext): string {
    if (this.hasPermission(user, 'payroll:read_pii')) {
      return ssn;
    }
    // Return redacted
    const last4 = ssn.replace(/\D/g, '').slice(-4);
    return `***-**-${last4 || '****'}`;
  }

  /**
   * Masks employee compensation figures unless the user has 'payroll:read_compensation'
   * Note: An Income Tax Preparer only needs aggregate wage expense on Schedule C/1120-S line 8!
   */
  static maskCompensation(amount: number, user: UserContext): string {
    if (this.hasPermission(user, 'payroll:read_compensation')) {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return '🔒 RESTRICTED (Requires payroll:read_compensation)';
  }

  /**
   * Helper to build default tenant entitlements for a given tier
   */
  static createTenantEntitlements(tenantId: string, businessName: string, tier: B2BSubscriptionTier): TenantEntitlements {
    const isSalesIncluded = tier === 'INCOME_PLUS_SALES' || tier === 'FULL_TAX_OS';
    const isPayrollIncluded = tier === 'INCOME_PLUS_PAYROLL' || tier === 'FULL_TAX_OS';

    return {
      tenantId,
      businessName,
      tier,
      domains: {
        INCOME_TAX: {
          domain: 'INCOME_TAX',
          isEntitled: true,
          lifecycleStage: 'PRODUCTION' as LifecycleStage,
          enabledFeatures: ['Form 1120-S / 1040', 'Schedule C Optimization', 'Depreciation Schedules', 'K-1 Distribution']
        },
        SALES_USE_TAX: {
          domain: 'SALES_USE_TAX',
          isEntitled: isSalesIncluded,
          lifecycleStage: 'FOUNDATION' as LifecycleStage,
          enabledFeatures: ['Multi-Jurisdiction Rates', 'Economic Nexus Matrix', 'SaaS Taxability Engine', 'Marketplace Reconciliation']
        },
        PAYROLL_TAX: {
          domain: 'PAYROLL_TAX',
          isEntitled: isPayrollIncluded,
          lifecycleStage: 'FOUNDATION' as LifecycleStage,
          enabledFeatures: ['FICA/FUTA/SUTA Engine', 'IRC § 6302 Deposit Schedules', 'Form 941 Quarterly Engine', 'Worker Classification Guard']
        }
      }
    };
  }

  /**
   * Helper to build user context with permissions
   */
  static createUserContext(userId: string, name: string, role: UserRole, email: string): UserContext {
    const perms = new Set<Permission>(ROLE_PERMISSIONS_MATRIX[role]);
    return {
      userId,
      name,
      role,
      email,
      permissions: perms,
      assignedClientIds: ['client-apex-2027']
    };
  }
}
