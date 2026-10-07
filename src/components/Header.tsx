import React from 'react';
import { UserRole, B2BSubscriptionTier, UserContext } from '../types/security';
import { Shield, Building2, UserCircle2, Layers, Lock, Unlock } from 'lucide-react';

interface HeaderProps {
  currentUser: UserContext;
  onSelectRole: (role: UserRole) => void;
  subscriptionTier: B2BSubscriptionTier;
  onSelectTier: (tier: B2BSubscriptionTier) => void;
  businessName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSelectRole,
  subscriptionTier,
  onSelectTier,
  businessName
}) => {
  const hasPayrollPii = currentUser.permissions.has('payroll:read_pii');
  const hasPayrollComp = currentUser.permissions.has('payroll:read_compensation');

  return (
    <header className="border-b border-sage-300 bg-white/95 backdrop-blur sticky top-0 z-50 px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Brand & Business */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-pine-700 flex items-center justify-center shadow-md shadow-pine-700/20 text-lime-400 font-black text-xl">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-pine-900 tracking-tight text-lg">TaxOS</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-lime-400/40 text-pine-800 border border-lime-500/40">
                Autonomous AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sage-500">
              <Building2 className="w-3.5 h-3.5 text-sage-500" />
              <span className="font-medium text-sage-800">{businessName}</span>
              <span className="text-sage-400">•</span>
              <span>EIN: 88-4928172</span>
            </div>
          </div>
        </div>

        {/* Controls: Role simulation & Subscription tier */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Subscription Tier Selector */}
          <div className="flex items-center gap-2 bg-sage-100 border border-sage-300 rounded-2xl px-3 py-1.5">
            <Layers className="w-4 h-4 text-pine-700" />
            <span className="text-xs font-medium text-sage-600">Tier:</span>
            <select
              value={subscriptionTier}
              onChange={(e) => onSelectTier(e.target.value as B2BSubscriptionTier)}
              className="bg-transparent text-xs font-semibold text-pine-900 focus:outline-none cursor-pointer"
            >
              <option value="FULL_TAX_OS" className="bg-white text-sage-900">Full Tax OS (All 3 Domains)</option>
              <option value="INCOME_PLUS_SALES" className="bg-white text-sage-900">Income + Sales Tax</option>
              <option value="INCOME_PLUS_PAYROLL" className="bg-white text-sage-900">Income + Payroll Tax</option>
              <option value="INCOME_TAX_ONLY" className="bg-white text-sage-900">Income Tax Only</option>
            </select>
          </div>

          {/* RBAC Role Switcher */}
          <div className="flex items-center gap-2 bg-sage-100 border border-sage-300 rounded-2xl px-3 py-1.5">
            <UserCircle2 className="w-4 h-4 text-pine-700" />
            <span className="text-xs font-medium text-sage-600">Role:</span>
            <select
              value={currentUser.role}
              onChange={(e) => onSelectRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-pine-900 focus:outline-none cursor-pointer"
            >
              <option value="CLIENT_OWNER" className="bg-white text-sage-900">Client Owner (All Domains)</option>
              <option value="CFO_FINANCE_DIRECTOR" className="bg-white text-sage-900">CFO / Finance Director</option>
              <option value="INCOME_TAX_PREPARER" className="bg-white text-sage-900">Income Tax Preparer (Restricted)</option>
              <option value="SALES_TAX_SPECIALIST" className="bg-white text-sage-900">Sales Tax Specialist</option>
              <option value="PAYROLL_ADMIN" className="bg-white text-sage-900">Payroll Administrator</option>
              <option value="EXTERNAL_CPA_REVIEWER" className="bg-white text-sage-900">External CPA Reviewer</option>
              <option value="ATTORNEY_LEGAL_COUNSEL" className="bg-white text-sage-900">Attorney / Legal Counsel</option>
            </select>
          </div>

          {/* RBAC Security Isolation Indicator */}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-2xl border bg-sage-50 transition-colors">
            {hasPayrollPii && hasPayrollComp ? (
              <span className="flex items-center gap-1 text-pine-700 border-pine-500/30">
                <Unlock className="w-3.5 h-3.5" />
                <span className="font-semibold">Payroll PII Unlocked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 border-amber-500/30" title="Security Boundary: Income Tax Preparers cannot access employee SSNs or compensation records">
                <Lock className="w-3.5 h-3.5" />
                <span className="font-medium">Payroll PII Segregated</span>
              </span>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
