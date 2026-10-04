import React from 'react';
import { TaxDomain, LifecycleStage } from '../types/common';
import { TenantEntitlements, UserContext } from '../types/security';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  ArrowUpRight,
  ShieldCheck,
  Building,
  Info,
  Lock
} from 'lucide-react';

interface CommandCenterProps {
  tenant: TenantEntitlements;
  currentUser: UserContext;
  onNavigateTab: (tab: 'OVERVIEW' | 'SALES_TAX' | 'PAYROLL_TAX' | 'INCOME_TAX' | 'COMPLIANCE_OPS' | 'GRAPH' | 'SECURITY') => void;
}

export const BusinessTaxCommandCenter: React.FC<CommandCenterProps> = ({
  tenant,
  currentUser,
  onNavigateTab
}) => {
  const isSalesEntitled = tenant.domains.SALES_USE_TAX.isEntitled;
  const isPayrollEntitled = tenant.domains.PAYROLL_TAX.isEntitled;

  const stageBadge = (stage: LifecycleStage) => {
    switch (stage) {
      case 'PRODUCTION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PRODUCTION</span>;
      case 'BETA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">BETA</span>;
      case 'FOUNDATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">FOUNDATION</span>;
      case 'ARCHITECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">ARCHITECTED</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: 2027 Tax Compliance Master Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                Unified Compliance Cockpit
              </span>
              <span className="text-xs text-slate-400 font-mono">Tax Year 2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Business Tax Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Coordinated compliance orchestration across Individual/Business Income, Sales & Use, and Payroll Employment tax domains sharing the unified Tax Graph and Evidence Graph.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">Overall Readiness</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">94%</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">Active Jurisdictions</div>
              <div className="text-2xl font-black text-white mt-0.5">4 States</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400 uppercase font-semibold">Next Filing</div>
              <div className="text-base font-bold text-amber-400 mt-1">Apr 15, 2027</div>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 First-Class Platform Domains Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DOMAIN 1: INCOME TAX */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg relative group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Income Tax</h3>
                  <div className="text-xs text-slate-400">Federal & State Returns</div>
                </div>
              </div>
              {stageBadge(tenant.domains.INCOME_TAX.lifecycleStage)}
            </div>

            {/* Income Tax Status */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400 font-medium">Return Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 92% Ready
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Entity Form</span>
                  <span className="font-semibold text-slate-200">Form 1120-S (S-Corp)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Gross Revenue</span>
                  <span className="font-semibold text-slate-200">$3,450,000</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Net Taxable Profit</span>
                  <span className="font-semibold text-emerald-400">$740,000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">CPA Signoff</span>
                  <span className="text-amber-400 font-medium">In Review (Marcus Vance, CPA)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Federal Filing Deadline: <strong className="text-slate-200">April 15, 2027</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('INCOME_TAX')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl font-medium text-xs transition"
          >
            <span>Open Income Tax Workstation</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* DOMAIN 2: SALES & USE TAX */}
        <div className={`bg-slate-900 border ${isSalesEntitled ? 'border-slate-800' : 'border-slate-800/50 opacity-90'} rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg relative`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Sales & Use Tax</h3>
                  <div className="text-xs text-slate-400">Multi-Tier Jurisdictions & Nexus</div>
                </div>
              </div>
              {stageBadge(tenant.domains.SALES_USE_TAX.lifecycleStage)}
            </div>

            {isSalesEntitled ? (
              <>
                {/* Sales Tax Status */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400 font-medium">Jurisdictions</span>
                    <span className="font-bold text-white">3 Active • 1 Due</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Registered States</span>
                      <span className="font-semibold text-slate-200">CA, NY, WA</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Nexus Watchlist</span>
                      <span className="font-semibold text-amber-400">Texas (88% of threshold)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Q1 Tax Collected</span>
                      <span className="font-semibold text-emerald-400">$28,450</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Next Return Due</span>
                      <span className="text-amber-400 font-semibold">CA CDTFA (April 30)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>SaaS Taxability: NY & WA taxable, CA exempt, TX 80%</span>
                </div>
              </>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 my-6 text-center">
                <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">Sales Tax Module Not Subscribed</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tenant is currently on <code className="text-emerald-400">{tenant.tier}</code> tier.
                </p>
              </div>
            )}
          </div>

          {isSalesEntitled ? (
            <button
              onClick={() => onNavigateTab('SALES_TAX')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl font-medium text-xs transition"
            >
              <span>Open Sales Tax Workstation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="mt-5 w-full py-2.5 px-4 bg-slate-800/50 text-slate-500 rounded-xl font-medium text-xs cursor-not-allowed"
            >
              Subscription Add-on Available
            </button>
          )}
        </div>

        {/* DOMAIN 3: PAYROLL & EMPLOYMENT TAX */}
        <div className={`bg-slate-900 border ${isPayrollEntitled ? 'border-slate-800' : 'border-slate-800/50 opacity-90'} rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg relative`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Payroll Tax</h3>
                  <div className="text-xs text-slate-400">Withholding, FICA/FUTA & Filings</div>
                </div>
              </div>
              {stageBadge(tenant.domains.PAYROLL_TAX.lifecycleStage)}
            </div>

            {isPayrollEntitled ? (
              <>
                {/* Payroll Tax Status */}
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 my-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400 font-medium">Deposit Obligation</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Q1 Deposits Current
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Schedule Type</span>
                      <span className="font-semibold text-slate-200">Semi-Weekly (IRC § 6302)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Form 941 (Q1)</span>
                      <span className="font-semibold text-emerald-400">Reconciled ($96,960 deposited)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Next Filing Deadline</span>
                      <span className="font-semibold text-amber-400">April 30, 2027</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Worker Classification</span>
                      <span className="text-red-400 font-semibold">1 Contractor Flagged for Review</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {currentUser.role === 'INCOME_TAX_PREPARER' 
                      ? '⚠️ Employee SSNs & salaries isolated from preparer' 
                      : 'Full payroll records available for Payroll Admin'}
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 my-6 text-center">
                <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-300">Payroll Tax Module Not Subscribed</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Upgrade to <code className="text-emerald-400">INCOME_PLUS_PAYROLL</code> or <code className="text-emerald-400">FULL_TAX_OS</code>.
                </p>
              </div>
            )}
          </div>

          {isPayrollEntitled ? (
            <button
              onClick={() => onNavigateTab('PAYROLL_TAX')}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium text-xs transition"
            >
              <span>Open Payroll Tax Workstation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled
              className="mt-5 w-full py-2.5 px-4 bg-slate-800/50 text-slate-500 rounded-xl font-medium text-xs cursor-not-allowed"
            >
              Subscription Add-on Available
            </button>
          )}
        </div>

      </div>

      {/* SEVEN OPERATIONAL PILLARS & POLYMORPHIC TAXCASE ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Polymorphic TaxCase Hierarchy Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-md">
                Polymorphic Core Model
              </span>
              <span className="text-xs font-mono text-slate-400">src/types/taxCase.ts</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Polymorphic TaxCase Hierarchy</h3>
            <p className="text-xs text-slate-400 mb-4">
              Base <code className="text-sky-300 font-mono">TaxCase</code> shares common state machine, audit provenance, and professional review while specializing into domain obligation trees.
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>TaxCase (Base Case)</span>
              </div>
              <div className="pl-6 border-l-2 border-slate-800 space-y-2.5 pt-1">
                <div className="flex items-center justify-between bg-blue-950/40 border border-blue-900/40 px-3 py-1.5 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">├── IncomeTaxCase</span>
                    <span className="text-[10px] text-slate-400">(Form 1120-S / K-1)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Line 8 Wages Linked</span>
                </div>
                <div className="flex items-center justify-between bg-purple-950/40 border border-purple-900/40 px-3 py-1.5 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">├── SalesTaxCase / Obligation</span>
                    <span className="text-[10px] text-slate-400">(Multi-Tier Rates)</span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300">CDTFA / NY / TX</span>
                </div>
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-900/40 px-3 py-1.5 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">└── PayrollTaxCase / Obligation</span>
                    <span className="text-[10px] text-slate-400">(Form 941 / EFTPS)</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300">Semi-Weekly Deposit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Shared: Evidence Graph, Review Engine & Audit Log</span>
            <button
              onClick={() => onNavigateTab('GRAPH')}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <span>Inspect DAG</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Seven Operational Pillars Grid Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md">
                Seven Operational Pillars
              </span>
              <span className="text-xs font-mono text-emerald-400">All 7 Architected</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Seven Compliance Pillars</h3>
            <p className="text-xs text-slate-400 mb-4">
              Comprehensive end-to-end automation across jurisdictional filings, employer safety, statutory rollovers, and banking networks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">1. Sales Tax</div>
                  <div className="text-[10px] text-slate-400">Multi-tier & SaaS rules</div>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded">Foundation</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">2. Payroll Tax</div>
                  <div className="text-[10px] text-slate-400">FICA, FUTA, Lookback</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Foundation</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">3. Employer Compliance</div>
                  <div className="text-[10px] text-slate-400">W-4, DE-4, Workers' Comp</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Core Engine</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">4. Business Tax Compliance</div>
                  <div className="text-[10px] text-slate-400">1120-S, DE Franchise, BOIR</div>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">Production</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">5. Tax Registrations</div>
                  <div className="text-[10px] text-slate-400">Sales permits, SUTA, SOS</div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">Core Engine</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">6. Tax Deadlines (IRC § 7503)</div>
                  <div className="text-[10px] text-slate-400">Weekend/Holiday rollover</div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">Core Engine</span>
              </div>
            </div>
            
            <div className="mt-2 bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">7. Tax Payments & Safe Harbors</div>
                <div className="text-[10px] text-slate-400">NACHA CCD+ TXP banking addenda & 98% safe harbor checks</div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">Core Engine</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Operational Remittance & Registry</span>
            <button
              onClick={() => onNavigateTab('COMPLIANCE_OPS')}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Open Operations Cockpit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Shared Platform Infrastructure Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Unified Platform Infrastructure</h3>
            <p className="text-xs text-slate-400">
              Income, Sales, and Payroll tax share these common engines without coupling domain-specific rules.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('GRAPH')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>Explore Tax Graph</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="font-semibold text-slate-200">Unified Tax Graph</div>
            <div className="text-slate-400 mt-1">Cross-domain rule versioning, statutory citations & dependency DAG</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="font-semibold text-slate-200">Evidence Graph</div>
            <div className="text-slate-400 mt-1">Unified document hashes, OCR extraction & transaction lineage</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="font-semibold text-slate-200">Reconciliation Engine</div>
            <div className="text-slate-400 mt-1">Multi-channel cross-checks: GL vs Bank vs Returns vs Gateways</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="font-semibold text-slate-200">CPA/EA Review Matrix</div>
            <div className="text-slate-400 mt-1">Audit signoff workflows, attorney escalation & professional provenance</div>
          </div>
        </div>
      </div>
    </div>
  );
};
