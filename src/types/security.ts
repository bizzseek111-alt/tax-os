import { TaxDomain, LifecycleStage } from './common';

// ============================================================================
// SECURITY, RBAC/ABAC & DOMAIN ISOLATION ARCHITECTURE
// ============================================================================

export type UserRole = 
  | 'CLIENT_OWNER'             // Full access across all subscribed domains
  | 'CFO_FINANCE_DIRECTOR'     // Financial aggregates, approvals, reports
  | 'INCOME_TAX_PREPARER'      // Solely Income Tax forms, Schedule C, 1120-S, K-1s. BLOCKED from employee payroll PII/wages!
  | 'SALES_TAX_SPECIALIST'     // Multi-jurisdiction nexus, exemptions, filing
  | 'PAYROLL_ADMIN'            // Employee compensation, W-4s, payroll runs, 941s
  | 'EXTERNAL_CPA_REVIEWER'    // Cross-domain review & signoff with elevated audit rights
  | 'ATTORNEY_LEGAL_COUNSEL';  // Worker classification & tax litigation escalation

export type Permission = 
  // Income Tax Permissions
  | 'income_tax:read'
  | 'income_tax:write'
  | 'income_tax:signoff'

  // Sales Tax Permissions
  | 'sales_tax:read'
  | 'sales_tax:write'
  | 'sales_tax:configure_nexus'
  | 'sales_tax:manage_certificates'
  | 'sales_tax:reconcile'

  // Payroll Tax Permissions (STRICTLY SEGREGATED)
  | 'payroll:read_aggregates'      // e.g. total wages for 1120-S deduction line without individual PII
  | 'payroll:read_compensation'    // SENSITIVE: Individual salary, hourly rate, bonus
  | 'payroll:read_pii'             // HIGH SENSITIVITY: Full SSN, home address, banking ACH
  | 'payroll:execute_run'
  | 'payroll:review_worker_class'
  | 'payroll:sign_941'

  // Common Governance
  | 'audit:view_provenance'
  | 'billing:manage_entitlements';

export interface UserContext {
  userId: string;
  name: string;
  role: UserRole;
  email: string;
  permissions: Set<Permission>;
  assignedClientIds: string[];
}

export type B2BSubscriptionTier = 
  | 'INCOME_TAX_ONLY'
  | 'INCOME_PLUS_SALES'
  | 'INCOME_PLUS_PAYROLL'
  | 'FULL_TAX_OS';

export interface DomainEntitlement {
  domain: TaxDomain;
  isEntitled: boolean;
  lifecycleStage: LifecycleStage;
  enabledFeatures: string[];
}

export interface TenantEntitlements {
  tenantId: string;
  businessName: string;
  tier: B2BSubscriptionTier;
  domains: Record<TaxDomain, DomainEntitlement>;
}

// Built-in Role Definitions demonstrating explicit domain segregation
export const ROLE_PERMISSIONS_MATRIX: Record<UserRole, Permission[]> = {
  CLIENT_OWNER: [
    'income_tax:read', 'income_tax:write', 'income_tax:signoff',
    'sales_tax:read', 'sales_tax:write', 'sales_tax:configure_nexus', 'sales_tax:manage_certificates', 'sales_tax:reconcile',
    'payroll:read_aggregates', 'payroll:read_compensation', 'payroll:read_pii', 'payroll:execute_run', 'payroll:review_worker_class', 'payroll:sign_941',
    'audit:view_provenance', 'billing:manage_entitlements'
  ],
  CFO_FINANCE_DIRECTOR: [
    'income_tax:read', 'income_tax:write',
    'sales_tax:read', 'sales_tax:write', 'sales_tax:reconcile',
    'payroll:read_aggregates', 'payroll:read_compensation', 'payroll:execute_run', 'payroll:review_worker_class',
    'audit:view_provenance'
  ],
  INCOME_TAX_PREPARER: [
    'income_tax:read', 'income_tax:write',
    // NOTICE: INCOME_TAX_PREPARER only receives aggregate wage totals needed for income tax deduction lines.
    // They are explicitly DENIED 'payroll:read_compensation' and 'payroll:read_pii'!
    'payroll:read_aggregates',
    'audit:view_provenance'
  ],
  SALES_TAX_SPECIALIST: [
    'sales_tax:read', 'sales_tax:write', 'sales_tax:configure_nexus', 'sales_tax:manage_certificates', 'sales_tax:reconcile',
    'audit:view_provenance'
  ],
  PAYROLL_ADMIN: [
    'payroll:read_aggregates', 'payroll:read_compensation', 'payroll:read_pii', 'payroll:execute_run', 'payroll:review_worker_class', 'payroll:sign_941',
    'audit:view_provenance'
  ],
  EXTERNAL_CPA_REVIEWER: [
    'income_tax:read', 'income_tax:signoff',
    'sales_tax:read', 'sales_tax:reconcile',
    'payroll:read_aggregates', 'payroll:read_compensation', 'payroll:review_worker_class', 'payroll:sign_941',
    'audit:view_provenance'
  ],
  ATTORNEY_LEGAL_COUNSEL: [
    'income_tax:read',
    'sales_tax:read',
    'payroll:read_aggregates', 'payroll:review_worker_class',
    'audit:view_provenance'
  ]
};
