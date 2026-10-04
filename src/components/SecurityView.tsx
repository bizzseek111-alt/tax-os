import React from 'react';
import { ROLE_PERMISSIONS_MATRIX, UserRole, Permission, B2BSubscriptionTier } from '../types/security';
import { Shield, Lock, Unlock, Check, X, ShieldAlert, KeyRound } from 'lucide-react';

interface SecurityViewProps {
  currentRole: UserRole;
  subscriptionTier: B2BSubscriptionTier;
  onSelectRole: (role: UserRole) => void;
  onSelectTier: (tier: B2BSubscriptionTier) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  currentRole,
  subscriptionTier,
  onSelectRole,
  onSelectTier
}) => {
  const allRoles: UserRole[] = [
    'CLIENT_OWNER',
    'CFO_FINANCE_DIRECTOR',
    'INCOME_TAX_PREPARER',
    'SALES_TAX_SPECIALIST',
    'PAYROLL_ADMIN',
    'EXTERNAL_CPA_REVIEWER',
    'ATTORNEY_LEGAL_COUNSEL'
  ];

  const criticalPermissions: { key: Permission; label: string; domain: string; isHighRisk: boolean }[] = [
    { key: 'income_tax:read', label: 'View Income Tax Returns & Deductions', domain: 'INCOME', isHighRisk: false },
    { key: 'income_tax:write', label: 'Edit Income Tax Workpapers', domain: 'INCOME', isHighRisk: false },
    { key: 'sales_tax:read', label: 'View Sales Tax Jurisdictions & Rates', domain: 'SALES', isHighRisk: false },
    { key: 'sales_tax:configure_nexus', label: 'Modify Nexus Configurations', domain: 'SALES', isHighRisk: false },
    { key: 'payroll:read_aggregates', label: 'View Aggregate Wage Totals (For Deduction Lines)', domain: 'PAYROLL', isHighRisk: false },
    { key: 'payroll:read_compensation', label: 'View Individual Employee Compensation/Salaries', domain: 'PAYROLL', isHighRisk: true },
    { key: 'payroll:read_pii', label: 'View Employee SSNs & Banking Details', domain: 'PAYROLL', isHighRisk: true },
    { key: 'payroll:execute_run', label: 'Execute Payroll Disbursements', domain: 'PAYROLL', isHighRisk: true },
    { key: 'payroll:review_worker_class', label: 'Worker Classification Legal Analysis', domain: 'PAYROLL', isHighRisk: true }
  ];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Security, RBAC/ABAC & Entitlements Engine</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PRODUCTION CONTROLS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict domain boundaries: Income tax preparers are blocked from employee SSNs/salaries, and subscriptions are fully modular.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Current Role Simulation:</span>
          <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            {currentRole}
          </span>
        </div>
      </div>

      {/* CORE SECURITY RULE HIGHLIGHT */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/50 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <h3 className="text-base font-bold text-white">
              Zero-Trust Domain Segregation: The Income vs. Payroll Isolation Boundary
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In a business tax platform, employee payroll data contains highly confidential PII (SSNs, home addresses, compensation, bank routing numbers).
              <strong> A tax preparer who can access a business owner's 1120-S or 1040 return must NOT automatically receive unrestricted employee payroll records.</strong>
              TaxOS enforces this by allowing Income Tax Preparers to consume only <em>aggregated wage totals</em> (e.g. Line 8 wage deductions) via <code>payroll:read_aggregates</code>, 
              while explicitly denying <code>payroll:read_compensation</code> and <code>payroll:read_pii</code>.
            </p>
          </div>
        </div>
      </div>

      {/* RBAC MATRIX TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          Interactive RBAC / ABAC Domain Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Permission / Capability</th>
                <th className="py-3 px-4">Domain</th>
                {allRoles.map((role) => (
                  <th 
                    key={role} 
                    className={`py-3 px-3 text-center cursor-pointer transition ${currentRole === role ? 'text-emerald-400 bg-slate-900 border-b-2 border-emerald-400' : ''}`}
                    onClick={() => onSelectRole(role)}
                    title="Click to simulate this role"
                  >
                    {role.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {criticalPermissions.map((perm) => (
                <tr key={perm.key} className={perm.isHighRisk ? 'bg-slate-950/40' : ''}>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white block">{perm.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{perm.key}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      perm.domain === 'INCOME' ? 'text-blue-400 bg-blue-950/60' :
                      perm.domain === 'SALES' ? 'text-purple-400 bg-purple-950/60' :
                      'text-emerald-400 bg-emerald-950/60'
                    }`}>
                      {perm.domain}
                    </span>
                  </td>
                  {allRoles.map((role) => {
                    const hasPerm = ROLE_PERMISSIONS_MATRIX[role].includes(perm.key);
                    const isSelectedRole = currentRole === role;
                    return (
                      <td key={role} className={`py-3 px-3 text-center ${isSelectedRole ? 'bg-slate-900/60' : ''}`}>
                        {hasPerm ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODULAR B2B SUBSCRIPTION TIERS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2">Modular B2B Subscription Entitlements</h3>
        <p className="text-xs text-slate-400 mb-6">
          Businesses can subscribe to Income Tax only, Income + Sales, Income + Payroll, or the Full Tax OS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {[
            {
              id: 'INCOME_TAX_ONLY' as B2BSubscriptionTier,
              title: 'Income Tax Only',
              domains: 'Income Tax Only',
              badge: 'Single Domain'
            },
            {
              id: 'INCOME_PLUS_SALES' as B2BSubscriptionTier,
              title: 'Income + Sales Tax',
              domains: 'Income + Sales & Use Tax',
              badge: 'Dual Domain'
            },
            {
              id: 'INCOME_PLUS_PAYROLL' as B2BSubscriptionTier,
              title: 'Income + Payroll',
              domains: 'Income + Employment Tax',
              badge: 'Dual Domain'
            },
            {
              id: 'FULL_TAX_OS' as B2BSubscriptionTier,
              title: 'Full Tax OS',
              domains: 'Income + Sales + Payroll',
              badge: 'All 3 First-Class Domains'
            }
          ].map((tier) => {
            const isCurrent = subscriptionTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => onSelectTier(tier.id)}
                className={`cursor-pointer rounded-xl p-4 border transition ${
                  isCurrent 
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{tier.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                    {tier.badge}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1 mb-3">
                  Entitled domains: <strong className="text-slate-200">{tier.domains}</strong>
                </p>
                <div className={`text-xs font-semibold ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isCurrent ? '● Active Subscription' : 'Click to Switch Tier'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
