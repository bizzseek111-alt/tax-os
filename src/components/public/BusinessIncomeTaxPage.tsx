import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  Lock 
} from 'lucide-react';

interface BusinessIncomeTaxPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function BusinessIncomeTaxPage({ onStartFiling, onNavigate }: BusinessIncomeTaxPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Form 1120, 1120-S & 1065 Engine
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          Entity income tax returns prepared with mathematical certainty.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          From general ledger ingestion to automated Schedule M-1 book-to-tax reconciliations and multi-tier shareholder K-1 packages.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Start Entity Income Tax Filing</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: SUPPORTED ENTITY CLASSES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">S-Corporation (1120-S)</span>
            <p className="text-neutral-600">Shareholder reasonable compensation, AAA tracking, Schedule K-1 allocations, and pass-through flow.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">Partnership & LLC (1065)</span>
            <p className="text-neutral-600">Guaranteed payments (§ 707(c)), partner capital accounts (tax basis), and special allocation schedules.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">C-Corporation (1120)</span>
            <p className="text-neutral-600">Federal 21% flat corporate rate, NOL carryforwards (§ 172), and state corporate tax provisions.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">Single-Member LLC</span>
            <p className="text-neutral-600">Disregarded entity Schedule C preparation integrated seamlessly into owner Form 1040.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: BOOK-TO-TAX RECONCILIATIONS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Schedule M-1 & M-3</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Automated book vs. tax reconciliation.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              TaxOS bridges GAAP financial accounting and IRS statutory tax rules, computing temporary and permanent differences: 50% business meal disallowance (§ 274(n)), tax depreciation variance over book depreciation, and municipal interest income.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-sage-200">
              <span className="font-semibold text-neutral-700">GAAP Net Income:</span>
              <span className="font-bold text-forest-950">$520,000</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200">
              <span className="font-semibold text-neutral-700">+ Permanent: Disallowed Meals</span>
              <span className="font-bold text-neutral-900">+$6,400</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200">
              <span className="font-semibold text-neutral-700">- Temporary: Tax Depreciation Excess</span>
              <span className="font-bold text-forest-700">-$38,200</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-forest-900">
              <span>Federal Taxable Business Income:</span>
              <span>$488,200</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: QUALIFIED BUSINESS INCOME (§ 199A) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Section 199A QBI Optimization</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Evaluates the 20% Qualified Business Income deduction for pass-through entities, dynamically applying W-2 wage limitations and unadjusted basis of qualified property (UBIA) thresholds for high-earning trade or business owners.
          </p>
        </div>
      </section>

      {/* SECTION 5: DEPRECIATION SCHEDULES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Fixed Asset Depreciation (Form 4562)</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Automates MACRS 5-year, 7-year, and 15-year recovery periods. Optimizes Section 179 first-year expensing vs. federal bonus depreciation while accounting for state-level non-conformity adjustments.
          </p>
        </div>
      </section>

      {/* SECTION 6: STATE CORPORATE ADD-BACKS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-white">Sovereign State Corporate Modifications</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Handles California Form 100/100S ($800 minimum franchise tax + 1.5% S-Corp tax), New York CT-3 / CT-3-S, New Jersey CBT, and state elective Pass-Through Entity Tax (PTET) deductions.
          </p>
        </div>
      </section>

      {/* SECTION 7: SCHEDULE K-1 PACKAGING */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Layers className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Automated Shareholder & Partner K-1 Packages</h3>
          <p className="text-sm text-neutral-600">
            Generates individual Schedule K-1 forms for every partner and shareholder, with direct export to their personal TaxOS accounts for seamless filing.
          </p>
        </div>
      </section>

      {/* SECTION 8: CRYPTOGRAPHIC WORKPAPERS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Audit-Ready Digital Workpaper Packets</h3>
          <p className="text-sm text-neutral-600">
            Every return includes an immutable workpaper packet linking general ledger lines to source invoices, bank statements, and tax authority citations.
          </p>
        </div>
      </section>

      {/* SECTION 9: HUMAN CPA REVIEW & PTIN SIGNOFF */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Building2 className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Certified Corporate CPA Review</h3>
          <p className="text-sm text-neutral-600">
            A licensed CPA or Enrolled Agent reviews all corporate tax positions, confirms statutory disclosures, and signs the return before electronic filing.
          </p>
        </div>
      </section>

      {/* SECTION 10: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>File Entity Income Tax with TaxOS</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
