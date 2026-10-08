# Autonomous Tax OS — Phase 8: Payroll Security & PII Protection

## 1. Threat Model & Payroll Security Principles
Payroll records contain highly sensitive Personally Identifiable Information (PII), including Social Security Numbers (SSNs), Employer Identification Numbers (EINs), compensation levels, and corporate banking coordinates.

### Security Invariants:
1. **Masking by Default**: All SSNs (`***-**-1234`) and EINs (`**-***1234`) are masked in API responses, user interfaces, logs, and agent execution traces.
2. **Privileged Access Management (PAM)**: Access to unmasked PII requires an explicit, audited elevation grant that **strictly expires after 15 minutes**.
3. **Domain Isolation**: Roles specialized in other tax domains (e.g., `SALES_TAX_REVIEWER`, `CUSTOMER_SUPPORT`) are strictly blocked from accessing payroll records.
4. **Immutable Audit Logging**: Every unmasking action, PAM grant, return signoff, and payment instruction writes a block to the cryptographic audit ledger.

---

## 2. Privileged Access Management (PAM) Implementation

```typescript
export class PayrollSecurityService {
  /**
   * Requests a 15-minute time-limited PAM grant to inspect payroll PII.
   */
  public static async grantPrivilegedAccess(params: {
    userId: string;
    userRole: UserRole;
    organizationId: string;
    targetEmployeeId: string;
    reason: string;
    authFactorUsed: string;
    taxCaseId?: string;
  }): Promise<{ grantId: string; grantToken: string; expiresAt: Date }> {
    this.assertPayrollAccessAuthorized(params.userRole);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // Exactly 15 minutes

    const grant = await prisma.privilegedPiiAccessGrant.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        taxCaseId: resolvedTaxCaseId,
        targetRecordId: params.targetEmployeeId,
        reason: params.reason,
        authFactorUsed: params.authFactorUsed,
        grantedAt: now,
        expiresAt
      }
    });

    // Emits immutable block in cryptographic audit ledger
    await AuditEventService.recordEvent({
      organizationId: params.organizationId,
      actorId: params.userId,
      actorRole: params.userRole,
      actorType: 'USER',
      taxCaseId: resolvedTaxCaseId,
      action: 'UNMASK_PAYROLL_PII',
      objectType: 'Employee',
      objectId: params.targetEmployeeId,
      newValue: { grantId: grant.id, expiresAt, reason: params.reason }
    });

    return { grantId: grant.id, grantToken: grant.id, expiresAt };
  }
}
```

---

## 3. Role-Based Domain Isolation

| User Role | Can Access Payroll? | Can Request PAM Unmask? | Can Approve Return? |
| :--- | :---: | :---: | :---: |
| **`CPA` / `PAYROLL_REVIEWER`** | **YES** | **YES** (with re-auth) | **YES** |
| **`TAX_ATTORNEY`** | **YES** | **YES** (with re-auth) | **YES** |
| **`SALES_TAX_REVIEWER`** | **NO** (Blocked) | **NO** (Blocked) | **NO** (Blocked) |
| **`CUSTOMER_SUPPORT`** | **NO** (Blocked) | **NO** (Blocked) | **NO** (Blocked) |
| **`VIEWER`** | **NO** (Blocked) | **NO** (Blocked) | **NO** (Blocked) |
