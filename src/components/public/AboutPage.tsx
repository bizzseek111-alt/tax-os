import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Scale, 
  Lock, 
  Sparkles 
} from 'lucide-react';

interface AboutPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function AboutPage({ onStartFiling, onNavigate }: AboutPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Our Founding Mission
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          Building the autonomous operating system for American taxation.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          We believe American taxpayers and business owners shouldn't waste hundreds of hours performing manual data entry for outdated government bureaucracy.
        </p>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold text-forest-950">The $400 Billion Compliance Burden</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Americans spend over 6.5 billion hours and $400 billion every year just trying to comply with the federal and state tax code. Outdated consumer software relies on predatory upsells and tedious 50-page questionnaires, while traditional accounting firms struggle with chronic staffing shortages.
          </p>
        </div>
      </section>

      {/* SECTION 3: OPERATING PRINCIPLES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">Deterministic Math</span>
            <p className="text-neutral-600">We never allow probabilistic LLMs to guess tax calculations. Every number is computed using codified statutory logic.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">Full Provenance</span>
            <p className="text-neutral-600">Every deduction must be proven down to the underlying receipt, bank ledger line, and statutory citation.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="text-forest-700 font-bold block text-sm">Human-in-the-Loop Dignity</span>
            <p className="text-neutral-600">AI executes data extraction and arithmetic; certified CPAs and Enrolled Agents provide the human judgment.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: HUMAN + AI SYNERGY */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-lime-400" />
          <h3 className="text-xl font-bold text-white">Why Human Expertise + AI Wins</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Pure automated software fails when statutory ambiguity arises. Pure human firms fail to scale repetitive pre-accounting work. TaxOS combines both: autonomous algorithms preparing 90% of the return, and licensed CPAs reviewing the remaining 10% that requires legal judgment.
          </p>
        </div>
      </section>

      {/* SECTION 5: LEADERSHIP TEAM */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold text-forest-950 text-center">Leadership & Architecture Group</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-center">
            <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-forest-900 text-lime-400 font-bold flex items-center justify-center mx-auto text-base">AR</div>
              <strong className="font-bold text-forest-950 text-sm block">Alex Rivera</strong>
              <span className="text-neutral-500 block">Chief Executive Officer</span>
              <p className="text-neutral-600">Former Fintech Executive & Tax Technology Architect.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-forest-900 text-lime-400 font-bold flex items-center justify-center mx-auto text-base">SC</div>
              <strong className="font-bold text-forest-950 text-sm block">Sarah Chen, CPA</strong>
              <span className="text-neutral-500 block">Chief Product Officer</span>
              <p className="text-neutral-600">Former Big 4 Senior Tax Partner with 15+ years of corporate tax experience.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-forest-900 text-lime-400 font-bold flex items-center justify-center mx-auto text-base">MD</div>
              <strong className="font-bold text-forest-950 text-sm block">Michael Davis, JD</strong>
              <span className="text-neutral-500 block">Chief Legal Counsel</span>
              <p className="text-neutral-600">Former U.S. Tax Court Litigator & Treasury Policy Advisor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: REGULATORY ADVISORY BOARD */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Scale className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Independent Regulatory Oversight</h3>
          <p className="text-sm text-neutral-600">
            Our statutory rule library and algorithmic models are audited bi-annually by an independent advisory board of former IRS directors and state revenue commissioners.
          </p>
        </div>
      </section>

      {/* SECTION 7: ETHICAL AI CHARTER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-sage-100 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <Lock className="w-6 h-6 text-forest-700" />
          <h3 className="text-base font-bold text-forest-950">Our Ethical Tax AI Charter</h3>
          <p className="text-neutral-700 leading-relaxed">
            We pledge to never sell customer financial records, never monetize data via predatory loans, never conceal legitimate tax deductions to minimize preparation liability, and provide complete calculation transparency.
          </p>
        </div>
      </section>

      {/* SECTION 8: CAREERS & CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <div className="max-w-xl mx-auto space-y-4 mb-6">
          <h3 className="text-xl font-bold text-forest-950">Join Our Mission</h3>
          <p className="text-xs text-neutral-600">
            We are hiring distributed software engineers, regulatory tax attorneys, and certified CPAs across the United States.
          </p>
        </div>
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Get Started with TaxOS</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
