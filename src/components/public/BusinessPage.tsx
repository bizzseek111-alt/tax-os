import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Receipt, 
  Users, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Lock, 
  Check, 
  Clock, 
  Sparkles,
  Server
} from 'lucide-react';

interface BusinessPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function BusinessPage({ onStartFiling, onNavigate }: BusinessPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Enterprise Business Tax Operating System
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          An end-to-end tax operating system for growing companies.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Unify Corporate Income Tax, Multi-State Sales Tax, and Payroll Compliance in one synchronized operating platform. Built for modern LLCs, S-Corporations, Partnerships, and C-Corporations.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Launch Business Workspace</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: BUSINESS TAX COMMAND CENTER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-12 border border-forest-900 shadow-xl">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Unified Operational Visibility</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
              The Business Tax Command Center
            </h2>
            <p className="text-sm text-sage-200 mt-2">
              No more juggling four disconnected software tools and multiple regional accounting firms. TaxOS brings every entity obligation into one real-time dashboard.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-6 rounded-2xl bg-forest-900/80 border border-forest-800 space-y-2">
              <span className="text-lime-400 font-bold block uppercase text-[11px]">Domain 1</span>
              <h3 className="text-base font-bold text-white">Entity Income Tax</h3>
              <p className="text-sage-300">Form 1120-S, 1065, Schedule K-1s, book-to-tax adjustments, and state corporate franchise returns.</p>
            </div>
            <div className="p-6 rounded-2xl bg-forest-900/80 border border-forest-800 space-y-2">
              <span className="text-lime-400 font-bold block uppercase text-[11px]">Domain 2</span>
              <h3 className="text-base font-bold text-white">Sales & Use Tax</h3>
              <p className="text-sage-300">Economic nexus tracking across all 45 sales tax states, product taxability codes, and automated return prep.</p>
            </div>
            <div className="p-6 rounded-2xl bg-forest-900/80 border border-forest-800 space-y-2">
              <span className="text-lime-400 font-bold block uppercase text-[11px]">Domain 3</span>
              <h3 className="text-base font-bold text-white">Payroll & Employer Compliance</h3>
              <p className="text-sage-300">Form 941, Form 940, state unemployment insurance (SUI), and AB 5 worker classification protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORPORATE INCOME TAX */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Form 1120, 1120-S & 1065</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Book-to-tax adjustments made automatic.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              TaxOS bridges GAAP financial statements and tax accounting, calculating Schedule M-1 and M-3 reconciliations, depreciation schedules (MACRS), and generating partner/shareholder Schedule K-1s with cryptographic accuracy.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => onNavigate('/business/income-tax')}
                className="text-xs font-bold text-forest-700 hover:text-forest-950 flex items-center gap-1.5"
              >
                <span>Learn more about Business Income Tax</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Net Book Income (GAAP):</span>
              <span className="font-bold text-forest-950">$412,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Section 179 Depreciation Addition:</span>
              <span className="font-bold text-forest-700">-$62,500.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>50% Meal Disallowance Add-Back:</span>
              <span className="font-bold text-neutral-900">+$4,120.00</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-forest-900">
              <span>Taxable Ordinary Business Income:</span>
              <span>$353,620.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SALES TAX AUTOMATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-sage-100 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Multi-State Economic Nexus & Sourcing</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Monitor state-by-state economic thresholds under South Dakota v. Wayfair. When your sales cross $100k or 200 transactions in any state, TaxOS flags registration requirements and calculates exact rooftop sales tax rates.
          </p>
        </div>
      </section>

      {/* SECTION 5: PAYROLL TAX COMPLIANCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Federal & State Payroll Compliance</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Reconcile general ledger payroll against Form 941 quarterly filings and Form 940 annual FUTA returns. Strict zero-trust RBAC ensures employee wage PII remains completely isolated from corporate tax preparers.
          </p>
        </div>
      </section>

      {/* SECTION 6: TAX REGISTRATIONS & PERMITS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-sage-50 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Automated State Tax Registrations</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Expanding into a new state? TaxOS prepares state revenue department registration packets for withholding tax, corporate franchise tax, and sales tax permits with unified tracking.
          </p>
        </div>
      </section>

      {/* SECTION 7: STATUTORY DEADLINES ENGINE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Dynamic Compliance Calendar</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Never miss an S-Corp election deadline (March 15), quarterly estimated payment, sales tax return (20th of the month), or annual state franchise report.
          </p>
        </div>
      </section>

      {/* SECTION 8: FINANCIAL INTEGRATIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Server className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Seamless ERP & Accounting Ingestion</h3>
          <p className="text-sm text-neutral-600">
            Direct read-only integrations with QuickBooks Online, Xero, NetSuite, Stripe Billing, Gusto, and ADP Workforce Now.
          </p>
        </div>
      </section>

      {/* SECTION 9: MULTI-STATE COMPLIANCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <strong className="text-sm font-bold text-forest-950 block">Multi-State Corporate Apportionment</strong>
          <p className="text-neutral-700">
            Calculates single-sales-factor and 3-factor (property, payroll, sales) formulas across California, New York, New Jersey, Illinois, and Massachusetts to prevent double corporate taxation.
          </p>
        </div>
      </section>

      {/* SECTION 10: AI AUTOMATION PIPELINE */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Sparkles className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Autonomous Business Pre-Accounting</h3>
          <p className="text-sm text-neutral-600">
            90% of business tax work is data extraction, ledger reconciliation, and math verification. TaxOS executes this automatically.
          </p>
        </div>
      </section>

      {/* SECTION 11: DEDICATED HUMAN SPECIALISTS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Senior Corporate Tax Directors</h3>
          <p className="text-sm text-neutral-600">
            Every business return is reviewed and authorized by an experienced corporate CPA, EA, or tax attorney before submission.
          </p>
        </div>
      </section>

      {/* SECTION 12: SECURITY & RBAC */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <Lock className="w-4 h-4 text-forest-700" />
            <span>Zero-Trust Enterprise Access Control</span>
          </div>
          <p>
            Strict domain partitioning prevents corporate income tax preparers from viewing confidential employee compensation and SSNs, safeguarding company privacy.
          </p>
        </div>
      </section>

      {/* SECTION 13: STRATEGIC PLANNING */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <TrendingUp className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Year-Round Entity Restructuring</h3>
          <p className="text-sm text-neutral-600">
            Model the tax impact of LLC to S-Corp conversions, Pass-Through Entity Tax (PTET) elections, and R&D payroll tax credits.
          </p>
        </div>
      </section>

      {/* SECTION 14: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Get Started with TaxOS for Business</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
