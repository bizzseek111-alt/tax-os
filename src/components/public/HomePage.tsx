import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  Layers, 
  DollarSign, 
  Search, 
  Lock, 
  Building2, 
  TrendingUp, 
  Check, 
  Eye, 
  HelpCircle,
  Briefcase,
  Users,
  Calendar,
  ChevronRight,
  ExternalLink,
  Laptop,
  Plane,
  Server,
  FileCheck2
} from 'lucide-react';

interface HomePageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function HomePage({ onStartFiling, onNavigate }: HomePageProps) {
  // Section 8: Prove This Number interactive state
  const [selectedProveCategory, setSelectedProveCategory] = useState<string>('software');
  const [demoStep, setDemoStep] = useState<number>(3);

  return (
    <div className="space-y-24 py-6">
      
      {/* =========================================================================
          SECTION 1 — HERO
          ========================================================================= */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold mb-8">
          <span className="w-2 h-2 rounded-full bg-forest-700 animate-pulse"></span>
          <span>Now filing 2026 tax returns • Federal & State Compliant</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Tax filing without doing taxes.
        </h1>

        <p className="text-lg sm:text-xl text-neutral-700 max-w-3xl mx-auto mt-6 leading-relaxed font-normal">
          Upload your documents and connect your accounts. TaxOS reconstructs your tax picture, finds legitimate deductions and credits, checks supporting evidence, prepares federal and state filings, and asks you only what it cannot safely determine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button
            onClick={onStartFiling}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span>Start My Taxes</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('/how-it-works')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-sage-100 text-forest-950 font-bold text-base transition border border-sage-300 shadow-xs flex items-center justify-center gap-2"
          >
            <span>Watch How It Works</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs font-semibold text-neutral-600">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest-700" /> Free to begin
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest-700" /> No credit card upfront
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest-700" /> Evidence-backed accuracy
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — TRUST & COVERAGE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs">
          <div className="text-center mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
              Complete Sovereign Jurisdiction & Security Coverage
            </h2>
            <p className="text-sm font-semibold text-neutral-800 mt-1">
              Grounded in official statutory tax codes and direct e-filing pipelines
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div 
              onClick={() => onNavigate('/how-it-works')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">Federal (IRS)</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">Form 1040, 1120-S, 1065</span>
            </div>

            <div 
              onClick={() => onNavigate('/states/california')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">California</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">FTB Form 540 • Cal. RTC</span>
            </div>

            <div 
              onClick={() => onNavigate('/states/new-york')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">New York</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">DTF IT-201 • NYC Taxes</span>
            </div>

            <div 
              onClick={() => onNavigate('/states/new-jersey')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">New Jersey</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">NJ-1040 • Commuter Credits</span>
            </div>

            <div 
              onClick={() => onNavigate('/states/illinois')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">Illinois</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">IDOR IL-1040 • Flat 4.95%</span>
            </div>

            <div 
              onClick={() => onNavigate('/states/massachusetts')}
              className="p-4 rounded-2xl bg-sage-50 border border-sage-200 cursor-pointer hover:border-forest-700 transition"
            >
              <span className="text-xs font-bold text-forest-950 block">Massachusetts</span>
              <span className="text-[11px] text-neutral-500 block mt-0.5">DOR Form 1 • 4% Surtax</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-sage-200 flex flex-wrap items-center justify-around gap-6 text-xs text-neutral-700 font-semibold">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-forest-700" /> Autonomous AI Preparation
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700" /> Optional Licensed CPA/EA Verification
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest-700" /> Evidence-Backed Calculations
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-forest-700" /> Secure 256-Bit Financial Connections
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — LIVE AUTONOMOUS DEMONSTRATION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-extrabold uppercase tracking-wider">
            Live Product Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight mt-3">
            See how TaxOS works before you start.
          </h2>
          <p className="text-base text-neutral-600 mt-3">
            Synthetic taxpayer sample: Alex Rivera (Consultant & W-2 earner with multi-state obligations).
          </p>
        </div>

        <div className="bg-forest-950 text-white rounded-3xl p-8 lg:p-12 border border-forest-900 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Progress Console */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forest-800">
                <span className="text-xs uppercase tracking-wider text-sage-400 font-bold">Autonomous Tax Engine</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-lime-400 text-forest-950 font-bold">
                  94% Complete
                </span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>W-2 form understood ($56,200 wages extracted)</span>
                </div>
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>1099-NEC consulting compensation matched ($92,000)</span>
                </div>
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Brokerage 1099-B statements detected</span>
                </div>
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>2,842 bank & card transactions categorized</span>
                </div>
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>84 receipts verified and matched to bank ledger</span>
                </div>
                <div className="flex items-center gap-2.5 text-lime-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>37 potential statutory deductions evaluated</span>
                </div>
                <div className="flex items-center gap-2.5 text-amber-300 font-bold pt-1">
                  <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>3 items need your input to finalize</span>
                </div>
              </div>

              <div className="pt-4 border-t border-forest-800">
                <p className="text-xs text-sage-300">
                  Only 3 straightforward questions stand between you and your completed return. No tax forms to manually calculate.
                </p>
              </div>
            </div>

            {/* Right: Dynamic Return Snapshot Card */}
            <div className="lg:col-span-7 bg-white text-forest-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-sage-200">
              <div className="flex items-center justify-between pb-4 border-b border-sage-200">
                <div>
                  <h3 className="font-extrabold text-lg text-forest-950">2026 Draft Return Summary</h3>
                  <span className="text-xs text-neutral-500">Form 1040 + California Form 540</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 block font-bold">Estimated Federal Refund</span>
                  <span className="text-2xl font-extrabold text-forest-700">+$2,480.00</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
                <div className="p-3 rounded-xl bg-sage-50 border border-sage-200">
                  <span className="text-[11px] text-neutral-500 block">Gross Revenue</span>
                  <span className="text-base font-bold text-forest-950">$148,200</span>
                </div>
                <div className="p-3 rounded-xl bg-sage-50 border border-sage-200">
                  <span className="text-[11px] text-neutral-500 block">Schedule C Expenses</span>
                  <span className="text-base font-bold text-forest-700">-$18,490</span>
                </div>
                <div className="p-3 rounded-xl bg-sage-50 border border-sage-200">
                  <span className="text-[11px] text-neutral-500 block">QBI Deduction (20%)</span>
                  <span className="text-base font-bold text-forest-700">-$11,950</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">1 of 3 questions waiting for you:</strong>
                  <span>"Did you travel to Chicago on Sept 14 primarily for client meetings or personal vacation?"</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('/start')}
                  className="px-5 py-2.5 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition flex items-center gap-2"
                >
                  <span>Test with your own docs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-neutral-400 font-medium">Demo data based on real 2026 tax formulas</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — TAXDROP (UNIVERSAL INGESTION)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-3xl p-8 sm:p-14 border border-forest-800 shadow-xl">
          <div className="max-w-3xl">
            <span className="px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 text-xs font-bold uppercase tracking-wider">
              Universal Document Intake
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 text-white">
              Give us everything.
            </h2>
            <p className="text-lg text-sage-200 mt-4 leading-relaxed font-normal">
              Don't organize it. Don't rename it. TaxOS does the sorting. Drop your receipts, forms, and bank downloads in any order, and our multi-pass extraction engine matches every transaction to its proper legal schedule.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-10">
            <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/80 text-center">
              <FileText className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <span className="text-xs font-bold block text-white">W-2 & 1099s</span>
              <span className="text-[11px] text-sage-300 block mt-1">PDF or smartphone photo</span>
            </div>

            <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/80 text-center">
              <FileCheck2 className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <span className="text-xs font-bold block text-white">Receipts & Invoices</span>
              <span className="text-[11px] text-sage-300 block mt-1">Images, scans, paper clips</span>
            </div>

            <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/80 text-center">
              <Layers className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <span className="text-xs font-bold block text-white">Bank Statements</span>
              <span className="text-[11px] text-sage-300 block mt-1">PDF, CSV, Excel sheets</span>
            </div>

            <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/80 text-center">
              <TrendingUp className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <span className="text-xs font-bold block text-white">1099-B Brokerage</span>
              <span className="text-[11px] text-sage-300 block mt-1">Stock & crypto statements</span>
            </div>

            <div className="p-4 rounded-2xl bg-forest-800/60 border border-forest-700/80 text-center">
              <UploadCloud className="w-6 h-6 text-lime-400 mx-auto mb-2" />
              <span className="text-xs font-bold block text-white">Prior Returns & ZIPs</span>
              <span className="text-[11px] text-sage-300 block mt-1">Full historical tax packets</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — CONNECT YOUR FINANCIAL WORLD
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
              Read-Only Financial Feeds
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight leading-tight">
              Connect your accounts once. Let TaxOS do the math.
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Link your business checking accounts, cards, and payment processors through encrypted, read-only connections. We automatically eliminate internal transfers, separate business expenses from personal spending, and maintain complete audit trails.
            </p>

            <div className="p-4 rounded-2xl bg-sage-100 border border-sage-300 text-xs text-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-forest-900">
                <Lock className="w-4 h-4 text-forest-700" />
                <span>Affirmative Consent & Privacy Standard</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Connections are 100% read-only. TaxOS cannot move money or alter balances. We never sell your data or use your financial records to train public artificial intelligence models.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Bank Accounts</span>
              <span className="text-xs text-neutral-500 block mt-1">Chase, BofA, Wells, Mercury, Relay</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Credit Cards</span>
              <span className="text-xs text-neutral-500 block mt-1">Amex, Chase Ink, Brex, Ramp</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Payment Gateways</span>
              <span className="text-xs text-neutral-500 block mt-1">Stripe, Square, PayPal, Toast</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Payroll Providers</span>
              <span className="text-xs text-neutral-500 block mt-1">Gusto, ADP, Rippling, Paychex</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Brokerages</span>
              <span className="text-xs text-neutral-500 block mt-1">Fidelity, Schwab, Robinhood, Vanguard</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="font-bold text-sm text-forest-950 block">Commerce Platforms</span>
              <span className="text-xs text-neutral-500 block mt-1">Shopify, Amazon, WooCommerce</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — FIND WHAT YOU MAY HAVE MISSED
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
            Statutory Optimization
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight mt-2">
            Find every legitimate deduction you are legally owed.
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            TaxOS evaluates your expenses against codified federal and state statutes. We never make reckless claims or promise unrealistic "maximum refunds"—we ensure every dollar claimed is legally justified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-xs font-bold text-forest-700 uppercase">26 U.S.C. § 162</span>
            <h3 className="font-extrabold text-forest-950 text-base">Trade & Business Costs</h3>
            <p className="text-xs text-neutral-600">
              Categorizes software subscriptions, advertising, hosting, and professional legal fees into ordinary and necessary expenses.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-xs font-bold text-forest-700 uppercase">26 U.S.C. § 280A</span>
            <h3 className="font-extrabold text-forest-950 text-base">Home Office Deduction</h3>
            <p className="text-xs text-neutral-600">
              Evaluates simplified $5/sq ft rate vs actual square footage expense allocations to identify the mathematically optimal deduction.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-xs font-bold text-forest-700 uppercase">26 U.S.C. § 179</span>
            <h3 className="font-extrabold text-forest-950 text-base">Equipment Expensing</h3>
            <p className="text-xs text-neutral-600">
              Evaluates first-year expensing for laptops, monitors, and machinery, while enforcing state limitations (like CA's $25,000 cap).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-xs font-bold text-forest-700 uppercase">26 U.S.C. § 199A</span>
            <h3 className="font-extrabold text-forest-950 text-base">20% QBI Deduction</h3>
            <p className="text-xs text-neutral-600">
              Calculates qualified business income deductions for pass-through entities, factoring in SSTB phase-outs and W-2 wage thresholds.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — TAXOS CHECKS ITS OWN WORK
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 sm:p-12 border border-sage-300">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
              Continuous Verification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              TaxOS checks its own work five times before you see it.
            </h2>
            <p className="text-sm text-neutral-700 mt-2">
              Unlike generic language models that hallucinate answers, TaxOS uses a multi-layered verification pipeline designed specifically for regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-sage-300">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-lime-400 font-bold text-xs flex items-center justify-center mb-2">1</span>
              <strong className="text-xs font-bold text-forest-950 block">AI Preparation</strong>
              <p className="text-[11px] text-neutral-600 mt-1">Data extraction & initial tax mapping from documents.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-lime-400 font-bold text-xs flex items-center justify-center mb-2">2</span>
              <strong className="text-xs font-bold text-forest-950 block">Evidence Checking</strong>
              <p className="text-[11px] text-neutral-600 mt-1">Cross-referencing claims against source bank receipts.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-lime-400 font-bold text-xs flex items-center justify-center mb-2">3</span>
              <strong className="text-xs font-bold text-forest-950 block">Statutory Rules</strong>
              <p className="text-[11px] text-neutral-600 mt-1">Evaluating state conformity and IRS tax tables.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-lime-400 font-bold text-xs flex items-center justify-center mb-2">4</span>
              <strong className="text-xs font-bold text-forest-950 block">Calculation Validation</strong>
              <p className="text-[11px] text-neutral-600 mt-1">Deterministic arithmetic verified down to the exact cent.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300">
              <span className="w-6 h-6 rounded-full bg-forest-900 text-lime-400 font-bold text-xs flex items-center justify-center mb-2">5</span>
              <strong className="text-xs font-bold text-forest-950 block">Exception Detection</strong>
              <p className="text-[11px] text-neutral-600 mt-1">Isolating only ambiguities that require your confirmation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8 — PROVE THIS NUMBER (INSPECTABLE LINEAGE)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-md">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
              Line-by-Line Lineage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight mt-2">
              Prove This Number. Every calculation is inspectable.
            </h2>
            <p className="text-sm text-neutral-700 mt-2">
              Click any number on your tax return draft to inspect the exact transactions, receipt images, statutory citations, and legal justification behind it.
            </p>
          </div>

          {/* Interactive Prove This Number Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Category Breakdown */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-2xl bg-forest-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-sage-300 font-semibold block">Total Schedule C Expenses</span>
                  <span className="text-2xl font-extrabold text-lime-400">$18,490.00</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-forest-800 text-sage-200 font-bold">
                  Form 1040 Line 27a
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <button
                  onClick={() => setSelectedProveCategory('software')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between font-bold transition text-left ${
                    selectedProveCategory === 'software'
                      ? 'bg-sage-100 border-forest-700 text-forest-950'
                      : 'bg-white border-sage-200 text-neutral-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-forest-700" /> Software & Cloud Subscriptions
                  </span>
                  <span>$4,200.00</span>
                </button>

                <button
                  onClick={() => setSelectedProveCategory('travel')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between font-bold transition text-left ${
                    selectedProveCategory === 'travel'
                      ? 'bg-sage-100 border-forest-700 text-forest-950'
                      : 'bg-white border-sage-200 text-neutral-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-forest-700" /> Business Travel & Lodging
                  </span>
                  <span>$3,840.00</span>
                </button>

                <button
                  onClick={() => setSelectedProveCategory('equipment')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between font-bold transition text-left ${
                    selectedProveCategory === 'equipment'
                      ? 'bg-sage-100 border-forest-700 text-forest-950'
                      : 'bg-white border-sage-200 text-neutral-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-forest-700" /> Tech Hardware & Equipment
                  </span>
                  <span>$6,100.00</span>
                </button>

                <button
                  onClick={() => setSelectedProveCategory('professional')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between font-bold transition text-left ${
                    selectedProveCategory === 'professional'
                      ? 'bg-sage-100 border-forest-700 text-forest-950'
                      : 'bg-white border-sage-200 text-neutral-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-forest-700" /> Legal & Professional Services
                  </span>
                  <span>$2,100.00</span>
                </button>

                <button
                  onClick={() => setSelectedProveCategory('other')}
                  className={`w-full p-3.5 rounded-xl border flex items-center justify-between font-bold transition text-left ${
                    selectedProveCategory === 'other'
                      ? 'bg-sage-100 border-forest-700 text-forest-950'
                      : 'bg-white border-sage-200 text-neutral-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-forest-700" /> Other Operating Expenses
                  </span>
                  <span>$2,250.00</span>
                </button>
              </div>
            </div>

            {/* Right: Lineage Detail Pane */}
            <div className="lg:col-span-7 bg-sage-50 rounded-2xl p-6 border border-sage-300 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sage-200">
                <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                  Verified Documentary Evidence
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                  100% Substantiated
                </span>
              </div>

              {selectedProveCategory === 'software' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-sage-200 space-y-1">
                    <div className="flex justify-between font-bold text-forest-950">
                      <span>AWS Cloud Infrastructure</span>
                      <span>$2,450.00</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 block">Matched to card ending in 8412 • Invoiced 2026-11-01</span>
                    <span className="text-[11px] font-semibold text-forest-700 block">Receipt: AWS_Annual_Invoice_2026.pdf (Verified)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-sage-200 space-y-1">
                    <div className="flex justify-between font-bold text-forest-950">
                      <span>GitHub & Vercel Developer Seats</span>
                      <span>$1,750.00</span>
                    </div>
                    <span className="text-[11px] text-neutral-500 block">Matched to card ending in 8412 • Invoiced monthly</span>
                    <span className="text-[11px] font-semibold text-forest-700 block">Receipt: Developer_Tooling_Receipts.pdf (Verified)</span>
                  </div>

                  <div className="pt-2 text-[11px] text-neutral-600 space-y-1">
                    <strong className="font-bold text-neutral-900 block">Statutory Authority:</strong>
                    <p>Deductible under <strong>26 U.S.C. § 162(a)</strong> as ordinary and necessary expenses incurred in carrying on software consulting trade.</p>
                  </div>
                </div>
              )}

              {selectedProveCategory !== 'software' && (
                <div className="p-4 text-center text-xs text-neutral-600">
                  <p>All items in this category are fully reconciled against verified receipts and bank transactions.</p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/start')}
                  className="w-full py-2.5 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition flex items-center justify-center gap-2"
                >
                  <span>See how this number was verified</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — CHOOSE HOW YOU FILE (THREE REVIEW MODES)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
            Filing Choice Model
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight mt-2">
            Choose how you want to file.
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            TaxOS adapts to your comfort level. Whether you prefer pure autonomous filing or full CPA review, the choice is always yours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Option A: AI Autopilot */}
          <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-col justify-between hover:border-forest-700 transition">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-forest-100 text-forest-900 font-bold text-xs">
                Self-Directed
              </span>
              <h3 className="text-xl font-extrabold text-forest-950">AI Autopilot</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                TaxOS prepares your supported return autonomously. You review the plain-English summary, confirm flagged items, and digitally authorize e-file transmission.
              </p>
              <ul className="space-y-2 text-xs text-neutral-700 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Autonomous calculation & deduction match</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Evidence cross-checking</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Direct IRS & state e-file submission</li>
              </ul>
            </div>
            <button
              onClick={onStartFiling}
              className="mt-8 w-full py-3 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition"
            >
              Start with AI Autopilot
            </button>
          </div>

          {/* Option B: Human Verified */}
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-lime-400 text-forest-950 font-bold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-forest-800 text-lime-300 font-bold text-xs">
                CPA / EA Verified
              </span>
              <h3 className="text-xl font-extrabold text-white">Human Verified</h3>
              <p className="text-xs text-sage-200 leading-relaxed">
                TaxOS prepares the entire return, and a licensed CPA or Enrolled Agent reviews all positions, resolves flagged exceptions, and conducts final quality sign-off.
              </p>
              <ul className="space-y-2 text-xs text-sage-200 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Everything in AI Autopilot</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Licensed CPA / EA exception review</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Multi-state conformity sign-off</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> In-app messaging with your tax reviewer</li>
              </ul>
            </div>
            <button
              onClick={onStartFiling}
              className="mt-8 w-full py-3 rounded-xl bg-lime-400 text-forest-950 font-extrabold text-xs hover:bg-lime-300 transition"
            >
              Start Human Verified
            </button>
          </div>

          {/* Option C: Full Service */}
          <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-col justify-between hover:border-forest-700 transition">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-sage-200 text-forest-900 font-bold text-xs">
                Dedicated Team
              </span>
              <h3 className="text-xl font-extrabold text-forest-950">Full Professional Service</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                A dedicated senior CPA or tax attorney manages your entire filing workflow from start to finish with TaxOS AI assistance for complex business structures.
              </p>
              <ul className="space-y-2 text-xs text-neutral-700 pt-2">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Dedicated Senior CPA tax lead</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Complex partnership & S-Corp K-1s</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Tax Attorney escalation for controversies</li>
              </ul>
            </div>
            <button
              onClick={onStartFiling}
              className="mt-8 w-full py-3 rounded-xl bg-sage-100 hover:bg-sage-200 text-forest-950 font-bold text-xs transition border border-sage-300"
            >
              Request Full Service
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 10 — WHO TAXOS IS FOR
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-700">
            Designed for Modern Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight mt-2">
            Engineered for every tax situation.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div 
            onClick={() => onNavigate('/individuals')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Employees</span>
            <span className="text-xs text-neutral-500 block mt-1">W-2 income, RSUs, multi-state jobs</span>
          </div>

          <div 
            onClick={() => onNavigate('/self-employed')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Freelancers</span>
            <span className="text-xs text-neutral-500 block mt-1">1099-NEC, expenses, home office</span>
          </div>

          <div 
            onClick={() => onNavigate('/self-employed')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Creators</span>
            <span className="text-xs text-neutral-500 block mt-1">YouTube, Substack, Brand sponsorships</span>
          </div>

          <div 
            onClick={() => onNavigate('/self-employed')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Consultants</span>
            <span className="text-xs text-neutral-500 block mt-1">Client travel, contractor write-offs</span>
          </div>

          <div 
            onClick={() => onNavigate('/business')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Small Businesses</span>
            <span className="text-xs text-neutral-500 block mt-1">LLCs, S-Corps, payroll & sales tax</span>
          </div>

          <div 
            onClick={() => onNavigate('/states')}
            className="p-5 rounded-2xl bg-white border border-sage-300 shadow-2xs hover:border-forest-700 cursor-pointer transition"
          >
            <span className="text-sm font-bold text-forest-950 block">Multi-State</span>
            <span className="text-xs text-neutral-500 block mt-1">Commuters, moves, cross-border sales</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — TAX TWIN / YEAR ROUND SIMULATION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 border border-forest-800 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="px-3 py-1 rounded-full bg-lime-400 text-forest-950 text-xs font-bold uppercase tracking-wider">
                Year-Round Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Tax planning isn't an annual event. Meet your Tax Twin.
              </h2>
              <p className="text-sm text-sage-200 leading-relaxed font-normal">
                Your Tax Twin maintains a continuous forward-looking simulation of your financial year. Simulate major purchases, calculate quarterly safe harbor estimates, and model S-Corp elections before pulling the trigger.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/tax-twin')}
                  className="px-5 py-2.5 rounded-xl bg-white text-forest-950 font-bold text-xs hover:bg-sage-100 transition flex items-center gap-2"
                >
                  <span>Explore Tax Twin Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-forest-950/80 rounded-2xl p-6 border border-forest-800 space-y-4">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-forest-800">
                <span className="font-bold text-sage-300">Forward Tax Simulation (2027 Projections)</span>
                <span className="text-lime-400 font-mono text-[11px]">Active Model</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-forest-900/60 border border-forest-800 flex justify-between items-center">
                  <span>Current Projected Tax Liability:</span>
                  <strong className="text-white font-bold">$34,800.00</strong>
                </div>
                <div className="p-3 rounded-xl bg-forest-900/60 border border-forest-800 flex justify-between items-center">
                  <span>If elect S-Corp ($80k Salary + $50k Dist):</span>
                  <strong className="text-lime-400 font-bold">-$4,210.00 saved</strong>
                </div>
                <div className="p-3 rounded-xl bg-forest-900/60 border border-forest-800 flex justify-between items-center">
                  <span>Next Quarterly Payment (Form 1040-ES):</span>
                  <strong className="text-sage-200 font-bold">Due April 15, 2027</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12 — ENTERPRISE SECURITY & FINAL CTA
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-forest-900 text-lime-400 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight">
            Bank-grade encryption. Strict privacy charter.
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed max-w-2xl mx-auto font-normal">
            Your data is protected with 256-bit encryption in transit and at rest. We adhere strictly to IRS Publication 1075 standards and Treasury Circular 230 regulations. We will never sell your information or train public models on your confidential tax records.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartFiling}
            className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
          >
            <span>Start My Taxes</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span className="block text-xs text-neutral-500 mt-3 font-medium">
            Get started in under 3 minutes • Free to upload and inspect your return
          </span>
        </div>
      </section>

    </div>
  );
}
