import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Scale, 
  Lock, 
  Building2, 
  User, 
  Briefcase, 
  Layers, 
  FileText, 
  Coins, 
  Check, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  Clock,
  PhoneCall,
  Mail,
  MapPin,
  FileCheck,
  ShieldAlert,
  Zap
} from 'lucide-react';

export interface PublicWebsiteProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onStartFiling: () => void;
  onSignIn: (role?: string) => void;
}

export function PublicWebsite({ currentPath, onNavigate, onStartFiling, onSignIn }: PublicWebsiteProps) {
  const [activeHeadline, setActiveHeadline] = useState(0);

  const headlines = [
    {
      title: 'Tax filing without doing taxes.',
      subtitle: 'Upload your documents and connect your accounts. Your AI tax team organizes everything, finds legitimate deductions and credits, prepares your federal and state returns, and asks you only what it cannot safely determine.'
    },
    {
      title: 'Your taxes. Almost done before you start.',
      subtitle: 'No 80-question interview wizards. Direct financial connections and multimodal document extraction build your 2026 return in real time.'
    }
  ];

  return (
    <div className="min-h-screen bg-sage-200 text-sage-950 flex flex-col font-sans">
      {/* GLOBAL PUBLIC NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-sage-300 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          
          {/* Brand */}
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-pine-700 text-lime-400 flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition">
              T
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-pine-900 leading-none">
                TaxOS
              </div>
              <span className="text-[10px] font-bold text-pine-700 tracking-wider uppercase">
                Autonomous Tax Platform
              </span>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-sage-700">
            <button 
              onClick={() => onNavigate('/individuals')} 
              className={`hover:text-pine-900 transition ${currentPath === '/individuals' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Individuals
            </button>
            <button 
              onClick={() => onNavigate('/self-employed')} 
              className={`hover:text-pine-900 transition ${currentPath === '/self-employed' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Self-Employed
            </button>
            <button 
              onClick={() => onNavigate('/business')} 
              className={`hover:text-pine-900 transition ${currentPath === '/business' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Businesses
            </button>
            <button 
              onClick={() => onNavigate('/tax-professionals')} 
              className={`hover:text-pine-900 transition ${currentPath === '/tax-professionals' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Tax Professionals
            </button>
            <button 
              onClick={() => onNavigate('/how-it-works')} 
              className={`hover:text-pine-900 transition ${currentPath === '/how-it-works' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              How It Works
            </button>
            <button 
              onClick={() => onNavigate('/pricing')} 
              className={`hover:text-pine-900 transition ${currentPath === '/pricing' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Pricing
            </button>
            <button 
              onClick={() => onNavigate('/resources')} 
              className={`hover:text-pine-900 transition ${currentPath === '/resources' ? 'text-pine-900 font-extrabold' : ''}`}
            >
              Resources
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/signin')}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-sage-800 hover:text-pine-900 hover:bg-sage-100 transition"
            >
              Sign In
            </button>

            <button
              onClick={onStartFiling}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-pine-700 hover:bg-pine-800 text-white shadow-xs transition flex items-center gap-1.5"
            >
              <span>Start My Taxes</span>
              <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
            </button>
          </div>

        </div>
      </header>

      {/* BODY CONTENT BY ROUTE */}
      <main className="flex-1">
        
        {/* ============================================================== */}
        {/* 1. HOMEPAGE ROUTE (/)                                          */}
        {/* ============================================================== */}
        {currentPath === '/' && (
          <div className="space-y-20 py-12 px-6">
            {/* HERO SECTION */}
            <div className="max-w-5xl mx-auto text-center space-y-8 pt-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-lime-400/30 text-pine-900 border border-lime-400/50">
                <Sparkles className="w-3.5 h-3.5 text-pine-700" />
                <span>Federal Form 1040 + Sovereign 5-State Coverage (CA, NY, NJ, IL, MA)</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-black text-sage-950 tracking-tight leading-[1.1]">
                  {headlines[activeHeadline].title}
                </h1>
                <p className="text-base sm:text-lg text-sage-600 max-w-2xl mx-auto font-normal leading-relaxed">
                  {headlines[activeHeadline].subtitle}
                </p>
              </div>

              {/* Headline Tester Pill Toggle */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sage-500 mr-1">Concept:</span>
                <button
                  onClick={() => setActiveHeadline(0)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                    activeHeadline === 0 
                      ? 'bg-pine-700 text-white border-pine-700 shadow-2xs' 
                      : 'bg-white text-sage-700 border-sage-300 hover:border-sage-400'
                  }`}
                >
                  1. "Without Doing Taxes"
                </button>
                <button
                  onClick={() => setActiveHeadline(1)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                    activeHeadline === 1 
                      ? 'bg-pine-700 text-white border-pine-700 shadow-2xs' 
                      : 'bg-white text-sage-700 border-sage-300 hover:border-sage-400'
                  }`}
                >
                  2. "Almost Done Before You Start"
                </button>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={onStartFiling}
                  className="px-8 py-4 rounded-3xl font-extrabold text-sm bg-pine-700 hover:bg-pine-800 text-white shadow-md transition flex items-center gap-2"
                >
                  <span>START MY TAXES</span>
                  <ArrowRight className="w-4 h-4 text-lime-400" />
                </button>

                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="px-8 py-4 rounded-3xl font-bold text-sm bg-white hover:bg-sage-50 text-sage-800 border border-sage-300 transition shadow-2xs"
                >
                  SEE HOW IT WORKS
                </button>
              </div>

              {/* Core Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-xs text-sage-600 font-semibold border-t border-sage-300/60 max-w-3xl mx-auto">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Deterministic Math ($0.00 Drift)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-pine-700" />
                  <span>Primary Statutory Authority (IRC & State RTC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-pine-800" />
                  <span>Zero-Trust PII Isolation</span>
                </div>
              </div>

            </div>

            {/* MOCK PRODUCT INTERACTION CAROUSEL / DEMONSTRATION */}
            <div className="max-w-5xl mx-auto bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-200 pb-6">
                <div>
                  <span className="text-xs font-bold text-pine-700 uppercase tracking-wider">Live System Simulation</span>
                  <h3 className="text-2xl font-black text-sage-950 mt-1">
                    See How TaxOS Operates in Real Time
                  </h3>
                  <p className="text-xs text-sage-600 mt-1">
                    Alex Rivera • Delaware LLC • Resident California (FTB) • W-2 + Consulting 1099-NEC
                  </p>
                </div>
                <button
                  onClick={onStartFiling}
                  className="px-4 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs shadow-2xs transition self-start sm:self-auto"
                >
                  Start with Your Documents →
                </button>
              </div>

              {/* 3 Step Interactive Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Autonomous Ingestion */}
                <div className="p-5 rounded-3xl bg-sage-50 border border-sage-200 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-sage-900">TaxDrop™ Intake</h4>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    Drop PDF receipts, W-2s, and 1099s without renaming or sorting. Multimodal agents hash, OCR, and match transactions automatically.
                  </p>
                  <div className="p-3 rounded-2xl bg-white border border-sage-200 text-[11px] font-mono text-sage-700 space-y-1">
                    <div className="text-emerald-700 font-bold">✓ Form_W2_Acme_2026.pdf</div>
                    <div className="text-emerald-700 font-bold">✓ Form_1099NEC_Horizon.pdf</div>
                    <div className="text-sage-500">✓ 37 Receipts Hashed (SHA-256)</div>
                  </div>
                </div>

                {/* 2. Needs You Card */}
                <div className="p-5 rounded-3xl bg-sage-50 border border-sage-200 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-lime-200 text-pine-900 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-sage-900">Exception Cards</h4>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    Instead of a 50-step questionnaire, you only answer the few high-value facts AI cannot safely infer from evidence.
                  </p>
                  <div className="p-3 rounded-2xl bg-white border border-sage-200 text-[11px] space-y-2">
                    <div className="font-bold text-pine-900">Delta Air Lines ($412.50)</div>
                    <div className="text-sage-600 text-[10px]">Client consultation flight to SF</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-lime-400 text-pine-900 font-bold">
                      +$142 Potential Refund
                    </span>
                  </div>
                </div>

                {/* 3. Prove Lineage */}
                <div className="p-5 rounded-3xl bg-sage-50 border border-sage-200 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-pine-700 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-sage-900">Prove This Number™</h4>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    Click any line on Form 1040 to inspect the complete lineage: formula, transactions, receipt hashes, and statutory citations.
                  </p>
                  <div className="p-3 rounded-2xl bg-white border border-sage-200 text-[11px] font-mono space-y-1">
                    <div className="text-sage-900 font-bold">Form 1040 Line 9: $148,200</div>
                    <div className="text-pine-700 font-semibold">26 U.S.C. § 61 (Gross Income)</div>
                    <div className="text-sage-500 text-[10px]">Deterministic Provenance Verified</div>
                  </div>
                </div>

              </div>

            </div>

            {/* AUDIENCE SELECTOR GRID */}
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Tailored Solutions</span>
                <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Built for Every Tax Scenario</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div 
                  onClick={() => onNavigate('/individuals')}
                  className="p-6 rounded-3xl bg-white border border-sage-300 hover:border-pine-600 transition cursor-pointer shadow-xs space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 group-hover:bg-pine-100 text-pine-800 flex items-center justify-center transition">
                    <User className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-sage-950">Individuals & Families</h3>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    W-2 wages, multiple state jobs, childcare credits, and standard deductions filed in minutes.
                  </p>
                  <span className="text-xs font-bold text-pine-700 flex items-center gap-1 group-hover:underline">
                    Explore Personal →
                  </span>
                </div>

                <div 
                  onClick={() => onNavigate('/self-employed')}
                  className="p-6 rounded-3xl bg-white border border-sage-300 hover:border-pine-600 transition cursor-pointer shadow-xs space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 group-hover:bg-pine-100 text-pine-800 flex items-center justify-center transition">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-sage-950">Self-Employed</h3>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    1099-NEC, Schedule C write-offs, home office expensing, and Form 8995 20% QBI deduction optimization.
                  </p>
                  <span className="text-xs font-bold text-pine-700 flex items-center gap-1 group-hover:underline">
                    Explore Freelance →
                  </span>
                </div>

                <div 
                  onClick={() => onNavigate('/business')}
                  className="p-6 rounded-3xl bg-white border border-sage-300 hover:border-pine-600 transition cursor-pointer shadow-xs space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 group-hover:bg-pine-100 text-pine-800 flex items-center justify-center transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-sage-950">Businesses & S-Corps</h3>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    Multi-domain integration: Corporate 1120-S + Multi-Tier Sales Tax + Multi-State Payroll Compliance.
                  </p>
                  <span className="text-xs font-bold text-pine-700 flex items-center gap-1 group-hover:underline">
                    Explore Business →
                  </span>
                </div>

                <div 
                  onClick={() => onNavigate('/tax-professionals')}
                  className="p-6 rounded-3xl bg-white border border-sage-300 hover:border-pine-600 transition cursor-pointer shadow-xs space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-sage-100 group-hover:bg-pine-100 text-pine-800 flex items-center justify-center transition">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-sage-950">Tax Professionals</h3>
                  <p className="text-xs text-sage-600 leading-relaxed">
                    AI Review Briefs for CPAs and EAs. Review exceptions in under 8 minutes with 1-click workpaper trails.
                  </p>
                  <span className="text-xs font-bold text-pine-700 flex items-center gap-1 group-hover:underline">
                    Explore Pro Portal →
                  </span>
                </div>

              </div>
            </div>

            {/* SOVEREIGN 5-STATE LAUNCH PACKS */}
            <div className="max-w-5xl mx-auto bg-pine-700 text-white rounded-4xl p-8 sm:p-12 shadow-sm space-y-6">
              <div className="max-w-2xl space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-pine-900">
                  Sovereign Law Coverage
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Federal + 5 Sovereign Launch States
                </h2>
                <p className="text-xs sm:text-sm text-sage-200 leading-relaxed">
                  Every state has unique non-conformity adjustments, convenience rules, and credit regimes. TaxOS runs verified state rule packs.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { name: 'California (FTB)', code: 'CA', path: '/states/california', note: 'Cal. RTC § 17215.4 HSA' },
                  { name: 'New York (DTF)', code: 'NY', path: '/states/new-york', note: '20 NYCRR § 131.18' },
                  { name: 'New Jersey (Div of Tax)', code: 'NJ', path: '/states/new-jersey', note: 'N.J.S.A. § 54A:4-1' },
                  { name: 'Illinois (IDOR)', code: 'IL', path: '/states/illinois', note: 'Flat 4.95% + PTE' },
                  { name: 'Massachusetts (DOR)', code: 'MA', path: '/states/massachusetts', note: 'Ch. 62 4% Surtax' }
                ].map((st) => (
                  <button
                    key={st.code}
                    onClick={() => onNavigate(st.path)}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-left transition space-y-1"
                  >
                    <div className="text-lg font-black text-lime-400">{st.code}</div>
                    <div className="text-xs font-bold text-white truncate">{st.name}</div>
                    <div className="text-[10px] text-sage-300 font-mono">{st.note}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. HOW IT WORKS (/how-it-works)                                */}
        {/* ============================================================== */}
        {currentPath === '/how-it-works' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">The 4-Step Process</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">How Autonomous TaxOS Works</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                No questionnaires. No guessing. Just drop your financial reality and review what matters.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Drop Documents & Connect Financial Feeds',
                  desc: 'Upload your tax documents in any format (PDF, JPG, CSV, ZIP) or securely connect your bank accounts via Plaid and Stripe. Do not organize or rename anything—TaxOS automatically splits, hashes, and classifies every file.',
                  icon: FileText
                },
                {
                  step: '02',
                  title: 'Autonomous Fact Reconstruction & Deduction Search',
                  desc: 'Our specialized tax agents triangulate gross revenues, verify business deductions against 26 U.S.C. § 162, check depreciation schedules, and calculate multi-state apportionments without human intervention.',
                  icon: Sparkles
                },
                {
                  step: '03',
                  title: 'Answer a Few Focused Needs You Cards',
                  desc: 'Instead of an 80-question wizard, you only receive questions where tax law requires a subjective factual confirmation (such as verifying client travel vs. personal travel). The fleet average is under 3 questions.',
                  icon: CheckCircle2
                },
                {
                  step: '04',
                  title: 'Review Lineage & E-File with Optional CPA Sign-Off',
                  desc: 'Inspect your return with Prove This Number, review state schedules, and submit directly to the IRS and state tax agencies via Modernized e-File (MeF). You can also request a licensed CPA or EA to review and sign your return.',
                  icon: ShieldCheck
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white border border-sage-300 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-pine-700 text-lime-400 flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    {item.step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-sage-950">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-sage-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center pt-6">
              <button
                onClick={onStartFiling}
                className="px-8 py-4 rounded-3xl font-extrabold text-sm bg-pine-700 hover:bg-pine-800 text-white shadow-md transition"
              >
                Start My 2026 Return Now →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. INDIVIDUALS (/individuals)                                  */}
        {/* ============================================================== */}
        {currentPath === '/individuals' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Personal Tax Filing</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Simple, Stress-Free Taxes for Individuals</h1>
              <p className="text-sm text-sage-600 max-w-xl">
                Whether you have one W-2 or juggle multiple jobs across different states, TaxOS organizes your family taxes automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <h3 className="font-bold text-base text-sage-950">W-2 Ingestion & State Withholding</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Drop your Form W-2 PDF or snap a photo. We extract Box 1 wages, Box 2 federal tax, and Box 15-20 state withholding with instant cryptographic verification.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <h3 className="font-bold text-base text-sage-950">Family Credits & Deductions</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Automatic qualification checking for Child Tax Credit ($2,000/child), Child & Dependent Care Credit, Earned Income Credit, and Student Loan Interest deductions.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <h3 className="font-bold text-base text-sage-950">Multi-State Job Moves</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Moved during 2026? TaxOS automatically splits part-year resident returns, preventing double-taxation across California, New York, and New Jersey.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <h3 className="font-bold text-base text-sage-950">HSA & Retirement Optimization</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Form 8889 HSA contributions with state non-conformity adjustments (such as California's mandatory addition modification under Cal. RTC § 17215.4).
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-pine-700 text-white flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Ready to file your personal return?</h4>
                <p className="text-xs text-sage-200">Average completion time is under 15 minutes.</p>
              </div>
              <button onClick={onStartFiling} className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs shadow-xs">
                Start Personal Return →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. SELF-EMPLOYED (/self-employed)                              */}
        {/* ============================================================== */}
        {currentPath === '/self-employed' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">1099, Freelancers & Creators</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Maximize Schedule C Write-Offs with Provable Evidence</h1>
              <p className="text-sm text-sage-600 max-w-xl">
                Independent consultants, gig workers, and creators miss an average of $3,800 in valid deductions every year. TaxOS finds every legitimate dollar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <div className="text-xl font-black text-pine-700">20% QBI</div>
                <h3 className="font-bold text-sm text-sage-950">Qualified Business Income</h3>
                <p className="text-xs text-sage-600">
                  Form 8995 calculation automatically deducts up to 20% of net consulting earnings under 26 U.S.C. § 199A.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <div className="text-xl font-black text-pine-700">§ 280A</div>
                <h3 className="font-bold text-sm text-sage-950">Home Office Expensing</h3>
                <p className="text-xs text-sage-600">
                  Evaluates Simplified Method ($5/sq ft) vs. Actual Prorated Expenses to yield the largest deduction.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <div className="text-xl font-black text-pine-700">Zero Dups</div>
                <h3 className="font-bold text-sm text-sage-950">Processor Triangulation</h3>
                <p className="text-xs text-sage-600">
                  Cross-checks Stripe, PayPal, and bank transfers to prevent counting payouts and gross 1099-K twice.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-sage-950">Supported Deductions Catalog</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-sage-700">
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Software & SaaS Tools</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Home Office Studio</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Business Travel & Flights</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Vehicle Mileage (67¢/mi)</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Phone & Internet %</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Health Insurance Premiums</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Subcontractor Payouts</div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">✓ Client Meals (50% rule)</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button onClick={onStartFiling} className="px-8 py-4 rounded-3xl bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-sm shadow-md">
                Build My Self-Employed Return →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. BUSINESS & S-CORPS (/business)                              */}
        {/* ============================================================== */}
        {currentPath === '/business' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Enterprise Compliance</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Income + Sales Tax + Payroll in One Unified Operating System</h1>
              <p className="text-sm text-sage-600 max-w-xl">
                Stop juggling 3 different software tools for corporate filings, sales tax, and employer compliance. TaxOS synchronizes all 3 domains.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-sage-950">Corporate Income Tax</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Form 1120-S & 1065. Section 179 asset expensing, shareholder K-1 allocations, and pass-through entity (PTE) elective state tax credits.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-sage-950">Multi-Tier Sales Tax</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  State, county, city, and district composite rates. Automated economic nexus monitors and marketplace facilitator tax reconciliation.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-sage-950">Employer Payroll Tax</h3>
                <p className="text-xs text-sage-600 leading-relaxed">
                  FICA, FUTA, SUTA, Form 941 quarterly reconciliations, and California AB 5 worker classification guards. PII strictly segregated.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-pine-700 text-white space-y-3">
              <h3 className="font-bold text-base">Cross-Domain Wage Deductibility Proof</h3>
              <p className="text-xs text-sage-200 leading-relaxed">
                When payroll runs complete, total verified gross compensation flows directly into Form 1120-S Line 8 with zero variance. Income tax preparers verify the exact dollar number without ever accessing confidential employee SSNs.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. TAX PROFESSIONALS (/tax-professionals)                      */}
        {/* ============================================================== */}
        {currentPath === '/tax-professionals' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">For Accounting Practices & CPAs</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Let AI Prepare the Workpapers. Your Team Reviews What Matters.</h1>
              <p className="text-sm text-sage-600 max-w-xl">
                Eliminate document hunting, manual data entry, and Schedule C keypunching. Give your CPAs and EAs exception-based review briefs with 1-click audit trails.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-3xl bg-white border border-sage-300 shadow-xs">
                <div className="text-2xl font-black text-pine-800">10x</div>
                <div className="text-xs text-sage-600 font-medium mt-1">Review Capacity</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-sage-300 shadow-xs">
                <div className="text-2xl font-black text-emerald-600">7.2 min</div>
                <div className="text-xs text-sage-600 font-medium mt-1">Avg Case Review Time</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-sage-300 shadow-xs">
                <div className="text-2xl font-black text-pine-800">&le; 3</div>
                <div className="text-xs text-sage-600 font-medium mt-1">Questions to File (QtF)</div>
              </div>
              <div className="p-5 rounded-3xl bg-white border border-sage-300 shadow-xs">
                <div className="text-2xl font-black text-pine-800">100%</div>
                <div className="text-xs text-sage-600 font-medium mt-1">Audit Provenance</div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-sage-950">The CPA AI Review Brief</h3>
              <p className="text-xs text-sage-600">
                Opening any case generates a 1-page structured review brief prioritizing anomalies:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="font-bold text-sage-900">Income Triangulation</div>
                  <div className="text-sage-600 text-[11px]">W-2, 1099, and bank deposits reconciled ($0.00 variance).</div>
                </div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="font-bold text-sage-900">Evidence Graph Health</div>
                  <div className="text-sage-600 text-[11px]">37 primary receipts verified with SHA-256 hashes.</div>
                </div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="font-bold text-sage-900">Adversarial Challenger Flags</div>
                  <div className="text-sage-600 text-[11px]">IRS Challenger checks flagged 1 state addition modification.</div>
                </div>
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="font-bold text-sage-900">1-Click PTIN Sign-off</div>
                  <div className="text-sage-600 text-[11px]">Sign return with PTIN and dispatch directly to IRS MeF.</div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button 
                onClick={() => onSignIn('EXTERNAL_CPA_REVIEWER')}
                className="px-8 py-4 rounded-3xl bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-sm shadow-md"
              >
                Access CPA Cockpit Demo →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 7. PRICING (/pricing)                                          */}
        {/* ============================================================== */}
        {currentPath === '/pricing' && (
          <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Simple, Transparent Pricing</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Pay Only When You File</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                No surprises. You can connect accounts and see your complete tax calculation for free before paying a dime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Individual */}
              <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sage-500">Personal</div>
                  <div className="text-3xl font-black text-sage-950">$49 <span className="text-xs text-sage-500 font-normal">/ federal return</span></div>
                  <p className="text-xs text-sage-600">Perfect for W-2 earners, families, and simple personal filings.</p>
                  <ul className="space-y-2 text-xs text-sage-700 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Form 1040 + All Standard Credits</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited W-2 Document Ingestion</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Free State Return Preview</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> "Prove This Number" Lineage</li>
                  </ul>
                </div>
                <button onClick={onStartFiling} className="w-full py-3 rounded-2xl bg-white border border-sage-300 hover:border-pine-600 text-pine-900 font-bold text-xs transition">
                  Start Free Preview
                </button>
              </div>

              {/* Self-Employed (Featured) */}
              <div className="p-8 rounded-4xl bg-pine-700 text-white shadow-md space-y-6 flex flex-col justify-between border-2 border-lime-400 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-lime-400 text-pine-900 font-bold text-[10px] uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-lime-400">Self-Employed</div>
                  <div className="text-3xl font-black text-white">$99 <span className="text-xs text-sage-200 font-normal">/ federal return</span></div>
                  <p className="text-xs text-sage-200">For freelancers, consultants, contractors, and creators.</p>
                  <ul className="space-y-2 text-xs text-sage-100 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Full Schedule C Expense Optimization</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Form 8995 20% QBI Deduction</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Bank & Stripe Ingestion Triangulation</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Home Office & Vehicle Mileage</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Continuous Year-Round Tax Twin</li>
                  </ul>
                </div>
                <button onClick={onStartFiling} className="w-full py-3 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs transition shadow-xs">
                  Start Free Preview
                </button>
              </div>

              {/* Business S-Corp */}
              <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-sage-500">Business Enterprise</div>
                  <div className="text-3xl font-black text-sage-950">$349 <span className="text-xs text-sage-500 font-normal">/ return</span></div>
                  <p className="text-xs text-sage-600">For LLCs, S-Corps (1120-S), Partnerships (1065), and multi-state businesses.</p>
                  <ul className="space-y-2 text-xs text-sage-700 font-medium">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Form 1120-S / 1065 + K-1 Packages</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Section 179 Depreciation Schedules</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Sales Tax Nexus & Composite Rates</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Payroll Wage Deductibility Proof</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Optional CPA Review Sign-Off (+$150)</li>
                  </ul>
                </div>
                <button onClick={onStartFiling} className="w-full py-3 rounded-2xl bg-white border border-sage-300 hover:border-pine-600 text-pine-900 font-bold text-xs transition">
                  Start Business Filing
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 8. SECURITY (/security)                                        */}
        {/* ============================================================== */}
        {currentPath === '/security' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Bank-Grade Protection</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Zero-Trust Security & PII Isolation</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                We design for high-trust fintech and CPA practice standards. Your sensitive personal and financial data is mathematically isolated.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <Lock className="w-6 h-6 text-pine-700 mb-2" />
                <h3 className="font-bold text-base text-sage-950">AES-256 Envelope Encryption</h3>
                <p className="text-xs text-sage-600">
                  Every document, SSN, and bank account number is encrypted at rest using isolated customer keys managed in dedicated hardware security modules.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <ShieldAlert className="w-6 h-6 text-pine-700 mb-2" />
                <h3 className="font-bold text-base text-sage-950">Field-Level PII Tokenization</h3>
                <p className="text-xs text-sage-600">
                  AI models and general preparers see surrogate tokens (`taxpayer_token_8819`), never raw 9-digit SSNs or unmasked payroll wages.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-2">
                <Scale className="w-6 h-6 text-pine-700 mb-2" />
                <h3 className="font-bold text-base text-sage-950">IRS Pub 1075 & SOC 2</h3>
                <p className="text-xs text-sage-600">
                  Compliant with IRS Publication 1075, Publication 1345 electronic filing security mandates, and AICPA SOC 2 Type II trust principles.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 9. SOVEREIGN STATE PACKS (/states, /states/*)                   */}
        {/* ============================================================== */}
        {(currentPath.startsWith('/states') || currentPath === '/sales-tax' || currentPath === '/payroll-tax') && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="space-y-3">
              <button onClick={() => onNavigate('/states')} className="text-xs font-bold text-pine-700 hover:underline">
                ← Back to States Directory
              </button>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">
                {currentPath === '/states/california' && 'California State Tax (FTB Form 540)'}
                {currentPath === '/states/new-york' && 'New York State Tax (DTF IT-201 / IT-203)'}
                {currentPath === '/states/new-jersey' && 'New Jersey State Tax (NJ-1040)'}
                {currentPath === '/states/illinois' && 'Illinois State Tax (IDOR Form IL-1040)'}
                {currentPath === '/states/massachusetts' && 'Massachusetts State Tax (DOR Form 1)'}
                {currentPath === '/states' && 'Sovereign State Tax Intelligence'}
                {currentPath === '/sales-tax' && 'Autonomous Multi-Tier Sales & Use Tax'}
                {currentPath === '/payroll-tax' && 'Autonomous Multi-State Payroll & Employment Tax'}
              </h1>
              <p className="text-sm text-sage-600 max-w-xl">
                Every sovereign jurisdiction maintains its own non-conformity adjustments, statutory court precedents, and filing mandates.
              </p>
            </div>

            <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-sage-950">Statutory Rules Codified in Engine</h3>
              {currentPath === '/states/california' && (
                <ul className="space-y-3 text-xs text-sage-700">
                  <li className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                    <strong>Cal. Rev. & Tax. Code § 17215.4 (HSA Non-Conformity):</strong> California disallows federal HSA deductions; federal contributions must be added back to California taxable income.
                  </li>
                  <li className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                    <strong>Cal. Rev. & Tax. Code § 17255 (Section 179 Cap):</strong> California strictly limits immediate equipment expensing to $25,000 per year (unlike Federal $1,220,000 cap).
                  </li>
                  <li className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                    <strong>Schedule P Alternative Minimum Tax (AMT):</strong> Automatic exemption phase-out calculation for California high-earners.
                  </li>
                </ul>
              )}
              {currentPath === '/states/new-york' && (
                <ul className="space-y-3 text-xs text-sage-700">
                  <li className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                    <strong>20 NYCRR § 131.18 (Convenience of the Employer Test):</strong> New York taxes 100% of remote worker wage compensation unless telecommuting is an absolute necessity of the employer.
                  </li>
                  <li className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                    <strong>Form IT-203 Non-Resident Allocation:</strong> Exact working day fractions allocated between New York workdays and out-of-state telecommuting days.
                  </li>
                </ul>
              )}
              {currentPath !== '/states/california' && currentPath !== '/states/new-york' && (
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-700">
                  Full statutory logic, form generation, and direct agency electronic filing pipeline active.
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <button onClick={onStartFiling} className="px-8 py-4 rounded-3xl bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-sm shadow-md">
                Start Filing for This Jurisdiction →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 10. SIGN IN (/signin)                                          */}
        {/* ============================================================== */}
        {currentPath === '/signin' && (
          <div className="max-w-md mx-auto py-16 px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-pine-700 text-lime-400 flex items-center justify-center font-black text-2xl mx-auto shadow-xs">
                T
              </div>
              <h1 className="text-2xl font-black text-sage-950">Sign In to TaxOS</h1>
              <p className="text-xs text-sage-600">Access your private tax workspace or professional portal</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-sage-700 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="alex@rivera-consulting.com" 
                  defaultValue="alex@rivera-consulting.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-300 text-xs text-sage-900 focus:outline-none focus:border-pine-600 bg-sage-50/50"
                />
              </div>

              <button
                onClick={() => onSignIn('CLIENT_OWNER')}
                className="w-full py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition"
              >
                Sign In with Passkey / Magic Link
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-200" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-sage-500 bg-white px-2">
                  Role-Resolved Demo Logins
                </div>
              </div>

              {/* Quick Persona Logins for Testing */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onSignIn('CLIENT_OWNER')}
                  className="w-full py-2 px-3 rounded-xl border border-sage-300 hover:border-pine-600 text-left text-xs text-sage-800 font-semibold transition flex items-center justify-between"
                >
                  <span>👤 Alex Rivera (Taxpayer / Client)</span>
                  <span className="text-[10px] text-pine-700 font-mono">B2C Space</span>
                </button>

                <button
                  onClick={() => onSignIn('EXTERNAL_CPA_REVIEWER')}
                  className="w-full py-2 px-3 rounded-xl border border-sage-300 hover:border-pine-600 text-left text-xs text-sage-800 font-semibold transition flex items-center justify-between"
                >
                  <span>💼 Marcus Vance, CPA (Reviewer)</span>
                  <span className="text-[10px] text-pine-700 font-mono">CPA Cockpit</span>
                </button>

                <button
                  onClick={() => onSignIn('ATTORNEY_LEGAL_COUNSEL')}
                  className="w-full py-2 px-3 rounded-xl border border-sage-300 hover:border-pine-600 text-left text-xs text-sage-800 font-semibold transition flex items-center justify-between"
                >
                  <span>⚖️ Sarah Lin, Esq. (Tax Attorney)</span>
                  <span className="text-[10px] text-pine-700 font-mono">Legal Desk</span>
                </button>

                <button
                  onClick={() => onSignIn('CFO_FINANCE_DIRECTOR')}
                  className="w-full py-2 px-3 rounded-xl border border-sage-300 hover:border-pine-600 text-left text-xs text-sage-800 font-semibold transition flex items-center justify-between"
                >
                  <span>📊 David K., Operations Lead</span>
                  <span className="text-[10px] text-pine-700 font-mono">Ops Manager</span>
                </button>
              </div>

            </div>

            <p className="text-center text-xs text-sage-500">
              New to TaxOS?{' '}
              <button onClick={onStartFiling} className="font-bold text-pine-700 hover:underline">
                Start your taxes here
              </button>
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* 11. RESOURCES (/resources)                                     */}
        {/* ============================================================== */}
        {currentPath === '/resources' && (
          <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Tax Intelligence & Tools</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">TaxOS Knowledge & Resource Center</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                Authoritative statutory references, 2026 inflation parameters, and practitioner tax checklists.
              </p>
            </div>

            {/* 2026 Tax Year Statutory Quick Reference Table */}
            <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-sage-200 pb-3">
                <h3 className="font-bold text-base text-sage-950">2026 Statutory Inflation Adjustments & Limits</h3>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-lime-400 text-pine-900">
                  IRS Rev. Proc. 2025-32 Grounded
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                  <span className="text-sage-500 font-bold uppercase text-[10px]">Standard Deduction</span>
                  <div className="text-lg font-black text-pine-900">$14,600 / $29,200</div>
                  <p className="text-sage-600 text-[11px]">Single / Married Filing Jointly</p>
                </div>
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                  <span className="text-sage-500 font-bold uppercase text-[10px]">Section 179 Cap</span>
                  <div className="text-lg font-black text-pine-900">$1,220,000</div>
                  <p className="text-sage-600 text-[11px]">CA state cap: $25,000 (RTC § 17255)</p>
                </div>
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                  <span className="text-sage-500 font-bold uppercase text-[10px]">Section 199A QBI</span>
                  <div className="text-lg font-black text-pine-900">20% Deduction</div>
                  <p className="text-sage-600 text-[11px]">Phase-out starts at $197,200</p>
                </div>
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                  <span className="text-sage-500 font-bold uppercase text-[10px]">Business Mileage</span>
                  <div className="text-lg font-black text-pine-900">67¢ / mile</div>
                  <p className="text-sage-600 text-[11px]">Contemporaneous log required</p>
                </div>
              </div>
            </div>

            {/* Guides & Reference Articles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold text-xs">
                  📘
                </div>
                <h4 className="font-bold text-base text-sage-950">California Schedule CA Non-Conformity</h4>
                <p className="text-xs text-sage-600 leading-relaxed">
                  How California treats HSA contributions, Section 179 depreciation differences, and why California does not allow the 20% federal QBI deduction.
                </p>
                <button onClick={() => onNavigate('/states/california')} className="text-xs font-bold text-pine-700 hover:underline">
                  Read California Guide →
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold text-xs">
                  📙
                </div>
                <h4 className="font-bold text-base text-sage-950">New York Convenience of Employer Rule</h4>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Understanding 20 NYCRR § 131.18 telecommuting wage sourcing and how remote workers living in New Jersey or Connecticut can defend against double taxation.
                </p>
                <button onClick={() => onNavigate('/states/new-york')} className="text-xs font-bold text-pine-700 hover:underline">
                  Read New York Guide →
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-xs space-y-3">
                <div className="w-8 h-8 rounded-xl bg-pine-100 text-pine-800 flex items-center justify-center font-bold text-xs">
                  📗
                </div>
                <h4 className="font-bold text-base text-sage-950">Multi-Tier Sales Tax Economic Nexus</h4>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Post-Wayfair thresholds, marketplace facilitator collection statutes, and when software-as-a-service (SaaS) becomes taxable in target states.
                </p>
                <button onClick={() => onNavigate('/sales-tax')} className="text-xs font-bold text-pine-700 hover:underline">
                  Read Sales Tax Guide →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 12. ABOUT US (/about)                                          */}
        {/* ============================================================== */}
        {currentPath === '/about' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Our Mission</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">Taxes That Largely Do Themselves</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                TaxOS was founded on a simple truth: tax compliance should be deterministic, provable, and quiet.
              </p>
            </div>

            <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-6">
              <h3 className="font-extrabold text-xl text-sage-950">The Vision</h3>
              <p className="text-xs sm:text-sm text-sage-700 leading-relaxed">
                Traditional tax software makes customers into unpaid data entry clerks, asking them 80 bewildering questions about forms they have never seen.
                TaxOS flips the model: customers connect their accounts and drop their raw files. Specialized autonomous agents read, triangulate, cross-reconcile, find deductions, check legal authorities, and prepare returns—asking humans only the few subjective questions that cannot be safely inferred from data.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-sage-200">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-pine-900">Deterministic Math</div>
                  <p className="text-xs text-sage-600">Pure integer cents arithmetic. LLMs never compute dollar amounts directly.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-pine-900">Zero Hallucination</div>
                  <p className="text-xs text-sage-600">Every single position links to binding primary statutes and verified receipts.</p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-pine-900">Regulated MeF</div>
                  <p className="text-xs text-sage-600">IRS Authorized e-File Provider conforming to Publication 1345 standards.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 13. CONTACT US (/contact)                                      */}
        {/* ============================================================== */}
        {currentPath === '/contact' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Get In Touch</span>
              <h1 className="text-3xl sm:text-5xl font-black text-sage-950">We're Here to Help</h1>
              <p className="text-sm text-sage-600 max-w-xl mx-auto">
                Have questions about filing, CPA partnerships, or enterprise integrations? Reach our tax engineering team.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="p-8 rounded-4xl bg-pine-700 text-white shadow-xs space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl">Direct Communication</h3>
                  <p className="text-xs text-sage-200 mt-1">Our licensed CPAs and engineering team respond within 1 business hour.</p>
                </div>

                <div className="space-y-4 text-xs text-sage-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-lime-400" />
                    <span><strong>General Support:</strong> support@taxos.io</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-lime-400" />
                    <span><strong>CPA Practice Advisory:</strong> partners@taxos.io</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-lime-400" />
                    <span><strong>Security & PGP:</strong> security@taxos.io</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-lime-400" />
                    <span>San Francisco, CA • Washington, D.C.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-pine-800/80 border border-pine-600/50 text-[11px] text-sage-200">
                  🔒 Encrypted transmission channel. Never send unredacted Social Security Numbers via standard unencrypted email.
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="p-8 rounded-4xl bg-white border border-sage-300 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-sage-950">Send a Message</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-sage-700 font-bold mb-1">Your Name</label>
                    <input type="text" placeholder="Alex Rivera" className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-sage-50/50 focus:outline-none focus:border-pine-600" />
                  </div>
                  <div>
                    <label className="block text-sage-700 font-bold mb-1">Email Address</label>
                    <input type="email" placeholder="alex@example.com" className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-sage-50/50 focus:outline-none focus:border-pine-600" />
                  </div>
                  <div>
                    <label className="block text-sage-700 font-bold mb-1">Inquiry Type</label>
                    <select className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-sage-50/50 focus:outline-none focus:border-pine-600">
                      <option>Personal Filing Question</option>
                      <option>Self-Employed / 1099 Deduction Review</option>
                      <option>CPA Firm Partnership</option>
                      <option>Enterprise Multi-Domain API</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sage-700 font-bold mb-1">Message</label>
                    <textarea rows={3} placeholder="How can our tax team assist you?" className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-sage-50/50 focus:outline-none focus:border-pine-600" />
                  </div>
                  <button onClick={() => alert('Thank you! Your message has been received by the TaxOS engineering team.')} className="w-full py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold transition">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* GLOBAL PUBLIC FOOTER */}
      <footer className="bg-white border-t border-sage-300 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pine-700 text-lime-400 flex items-center justify-center font-black text-base">
                T
              </div>
              <span className="font-extrabold text-base text-pine-900">TaxOS</span>
            </div>
            <p className="text-sage-600 max-w-sm text-xs leading-relaxed">
              The AI-Native Tax Operating System for individuals, independent professionals, and accounting firms. Deterministic mathematics, cryptographic lineage, and primary tax law.
            </p>
            <div className="text-[11px] text-sage-500 font-medium pt-2">
              © 2026 TaxOS Technologies Inc. All rights reserved. IRS Authorized e-File Provider.
            </div>
          </div>

          <div>
            <div className="font-bold text-sage-950 uppercase tracking-wider text-[11px] mb-3">Product</div>
            <ul className="space-y-2 text-sage-600">
              <li><button onClick={() => onNavigate('/individuals')} className="hover:text-pine-900">Individuals</button></li>
              <li><button onClick={() => onNavigate('/self-employed')} className="hover:text-pine-900">Self-Employed</button></li>
              <li><button onClick={() => onNavigate('/business')} className="hover:text-pine-900">Businesses</button></li>
              <li><button onClick={() => onNavigate('/tax-professionals')} className="hover:text-pine-900">Tax Professionals</button></li>
              <li><button onClick={() => onNavigate('/pricing')} className="hover:text-pine-900">Pricing</button></li>
              <li><button onClick={() => onNavigate('/security')} className="hover:text-pine-900">Security & Privacy</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-sage-950 uppercase tracking-wider text-[11px] mb-3">Sovereign States</div>
            <ul className="space-y-2 text-sage-600">
              <li><button onClick={() => onNavigate('/states/california')} className="hover:text-pine-900">California (FTB)</button></li>
              <li><button onClick={() => onNavigate('/states/new-york')} className="hover:text-pine-900">New York (DTF)</button></li>
              <li><button onClick={() => onNavigate('/states/new-jersey')} className="hover:text-pine-900">New Jersey (Div of Tax)</button></li>
              <li><button onClick={() => onNavigate('/states/illinois')} className="hover:text-pine-900">Illinois (IDOR)</button></li>
              <li><button onClick={() => onNavigate('/states/massachusetts')} className="hover:text-pine-900">Massachusetts (DOR)</button></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-sage-950 uppercase tracking-wider text-[11px] mb-3">Resources</div>
            <ul className="space-y-2 text-sage-600">
              <li><button onClick={() => onNavigate('/how-it-works')} className="hover:text-pine-900">How It Works</button></li>
              <li><button onClick={() => onNavigate('/sales-tax')} className="hover:text-pine-900">Sales Tax Guide</button></li>
              <li><button onClick={() => onNavigate('/payroll-tax')} className="hover:text-pine-900">Payroll Guide</button></li>
              <li><button onClick={() => onNavigate('/signin')} className="hover:text-pine-900">Client Sign In</button></li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
}
