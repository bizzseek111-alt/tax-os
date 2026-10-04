import React, { useState } from 'react';
import { Header } from './components/Header';
import { BusinessTaxCommandCenter } from './components/BusinessTaxCommandCenter';
import { SalesTaxView } from './components/SalesTaxView';
import { PayrollTaxView } from './components/PayrollTaxView';
import { IncomeTaxView } from './components/IncomeTaxView';
import { TaxGraphExplorer } from './components/TaxGraphExplorer';
import { SecurityView } from './components/SecurityView';
import { ComplianceOperationsCockpit } from './components/ComplianceOperationsCockpit';

// Prompt 4 Role-Based Experience Views
import { B2CTaxpayerView } from './components/ux/B2CTaxpayerView';
import { TaxProfessionalView } from './components/ux/TaxProfessionalView';
import { TaxAttorneyView } from './components/ux/TaxAttorneyView';
import { OperationsManagerView } from './components/ux/OperationsManagerView';
import { SuperAdminView } from './components/ux/SuperAdminView';
import { B2BAdminView } from './components/ux/B2BAdminView';

import { UserRole, B2BSubscriptionTier, UserContext } from './types/security';
import { EntitlementsGuard } from './services/EntitlementsGuard';
import { MOCK_BUSINESS } from './services/MockData';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Share2, 
  Shield,
  CalendarCheck,
  User,
  Scale,
  Briefcase,
  BarChart3,
  Sliders,
  Sparkles,
  Building2
} from 'lucide-react';

export type ExperienceMode = 
  | 'B2C_TAXPAYER'
  | 'TAX_PRO_CPA'
  | 'TAX_ATTORNEY'
  | 'OPS_MANAGER'
  | 'SUPER_ADMIN'
  | 'B2B_FIRM_ADMIN'
  | 'MULTI_DOMAIN_ENGINE';

export function App() {
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('B2C_TAXPAYER');
  const [multiDomainTab, setMultiDomainTab] = useState<'OVERVIEW' | 'SALES_TAX' | 'PAYROLL_TAX' | 'INCOME_TAX' | 'COMPLIANCE_OPS' | 'GRAPH' | 'SECURITY'>('OVERVIEW');
  const [currentRole, setCurrentRole] = useState<UserRole>('CLIENT_OWNER');
  const [subscriptionTier, setSubscriptionTier] = useState<B2BSubscriptionTier>('FULL_TAX_OS');

  // Derive tenant entitlements & current user context dynamically
  const tenant = EntitlementsGuard.createTenantEntitlements(
    'tenant-apex-2027',
    MOCK_BUSINESS.name,
    subscriptionTier
  );

  const currentUser: UserContext = EntitlementsGuard.createUserContext(
    'user-sim-01',
    'Simulated Operator',
    currentRole,
    'compliance@apexdynamics.io'
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSelectRole={setCurrentRole}
        subscriptionTier={subscriptionTier}
        onSelectTier={setSubscriptionTier}
        businessName={MOCK_BUSINESS.name}
      />

      {/* Master Role-Based Experience Switcher Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 sticky top-[65px] z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-slate-400 font-semibold mr-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500">Role View:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setExperienceMode('B2C_TAXPAYER')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'B2C_TAXPAYER'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>B2C Taxpayer</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-400/20 text-blue-200">92% Ready</span>
            </button>

            <button
              onClick={() => setExperienceMode('TAX_PRO_CPA')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'TAX_PRO_CPA'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Tax Pro (CPA/EA)</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-200">Review Brief</span>
            </button>

            <button
              onClick={() => setExperienceMode('TAX_ATTORNEY')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'TAX_ATTORNEY'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Controversy Attorney</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-400/20 text-purple-200">Privileged</span>
            </button>

            <button
              onClick={() => setExperienceMode('OPS_MANAGER')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'OPS_MANAGER'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Operations Manager</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400/20 text-amber-200">QtF 2.4</span>
            </button>

            <button
              onClick={() => setExperienceMode('SUPER_ADMIN')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'SUPER_ADMIN'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-400/20 text-rose-200">Kill Switches</span>
            </button>

            <button
              onClick={() => setExperienceMode('B2B_FIRM_ADMIN')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'B2B_FIRM_ADMIN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Firm Admin</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">Policies</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-700 mx-1 shrink-0" />

            <button
              onClick={() => setExperienceMode('MULTI_DOMAIN_ENGINE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                experienceMode === 'MULTI_DOMAIN_ENGINE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'text-slate-300 hover:text-white bg-slate-950/70 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Multi-Domain Engine</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-400/20 text-emerald-200">Sales/Payroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto px-6 py-6 flex-1 flex flex-col">
        
        {/* If in Multi-Domain Engine mode, show multi-domain tabs bar */}
        {experienceMode === 'MULTI_DOMAIN_ENGINE' && (
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
            <button
              onClick={() => setMultiDomainTab('OVERVIEW')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'OVERVIEW'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('INCOME_TAX')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'INCOME_TAX'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Income Tax</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-400">Prod</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('SALES_TAX')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'SALES_TAX'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sales & Use Tax</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-950/80 text-purple-300">Foundation</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('PAYROLL_TAX')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'PAYROLL_TAX'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Payroll & Employment Tax</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/80 text-emerald-300">Foundation</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('COMPLIANCE_OPS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'COMPLIANCE_OPS'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Deadlines & Registrations</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('GRAPH')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'GRAPH'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Tax Graph & Provenance</span>
            </button>

            <button
              onClick={() => setMultiDomainTab('SECURITY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                multiDomainTab === 'SECURITY'
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Entitlements</span>
            </button>
          </div>
        )}

        {/* Dynamic Views Rendering based on Experience Mode */}
        <main className="flex-1">
          {experienceMode === 'B2C_TAXPAYER' && (
            <B2CTaxpayerView />
          )}

          {experienceMode === 'TAX_PRO_CPA' && (
            <TaxProfessionalView />
          )}

          {experienceMode === 'TAX_ATTORNEY' && (
            <TaxAttorneyView />
          )}

          {experienceMode === 'OPS_MANAGER' && (
            <OperationsManagerView />
          )}

          {experienceMode === 'SUPER_ADMIN' && (
            <SuperAdminView />
          )}

          {experienceMode === 'B2B_FIRM_ADMIN' && (
            <B2BAdminView />
          )}

          {experienceMode === 'MULTI_DOMAIN_ENGINE' && (
            <>
              {multiDomainTab === 'OVERVIEW' && (
                <BusinessTaxCommandCenter
                  tenant={tenant}
                  currentUser={currentUser}
                  onNavigateTab={(tab) => setMultiDomainTab(tab)}
                />
              )}

              {multiDomainTab === 'INCOME_TAX' && (
                <IncomeTaxView />
              )}

              {multiDomainTab === 'SALES_TAX' && (
                <SalesTaxView />
              )}

              {multiDomainTab === 'PAYROLL_TAX' && (
                <PayrollTaxView currentUser={currentUser} />
              )}

              {multiDomainTab === 'COMPLIANCE_OPS' && (
                <ComplianceOperationsCockpit />
              )}

              {multiDomainTab === 'GRAPH' && (
                <TaxGraphExplorer />
              )}

              {multiDomainTab === 'SECURITY' && (
                <SecurityView
                  currentRole={currentRole}
                  subscriptionTier={subscriptionTier}
                  onSelectRole={setCurrentRole}
                  onSelectTier={setSubscriptionTier}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            Autonomous Tax OS • Unified Architecture for Consumer, Professional & Enterprise Compliance
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Versioned Rule Engine v2026.Q1</span>
            <span>•</span>
            <span>100% Cryptographic Provenance DAG</span>
            <span>•</span>
            <span>Zero-Trust PII Isolation</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
