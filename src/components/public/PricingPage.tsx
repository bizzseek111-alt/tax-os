import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Check, 
  HelpCircle, 
  Sparkles, 
  Layers 
} from 'lucide-react';

interface PricingPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function PricingPage({ onStartFiling, onNavigate }: PricingPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Transparent Upfront Pricing
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          Clear, honest pricing. No surprises. No upsells.
        </h1>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-6 font-normal">
          Free to upload, connect accounts, and inspect your draft return. You only pay when you are ready to file with the IRS.
        </p>
      </section>

      {/* SECTION 2: THREE CORE FILING TIERS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Basic / W-2 */}
          <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-sage-100 text-forest-900 text-xs font-bold">Simple W-2</span>
              <h3 className="text-2xl font-extrabold text-forest-950">Personal Basic</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-forest-950">$0</span>
                <span className="text-xs text-neutral-500">Federal + 1 State</span>
              </div>
              <p className="text-xs text-neutral-600">Ideal for single or dual W-2 employees, basic interest, and standard deduction.</p>
              <ul className="space-y-2 text-xs text-neutral-700 pt-3">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Automated W-2 photo upload</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Standard deduction optimization</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Direct IRS & state e-file</li>
              </ul>
            </div>
            <button onClick={onStartFiling} className="mt-8 w-full py-3 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition">
              File Free
            </button>
          </div>

          {/* Freelancer & 1099 */}
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 shadow-xl flex flex-col justify-between relative">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-lime-400 text-forest-950 text-[10px] font-bold uppercase">
              Popular
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-forest-800 text-lime-300 text-xs font-bold">1099 & Schedule C</span>
              <h3 className="text-2xl font-extrabold text-white">Self-Employed Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-lime-400">$89</span>
                <span className="text-xs text-sage-300">per federal return</span>
              </div>
              <p className="text-xs text-sage-200">For freelancers, creators, and independent contractors with business write-offs.</p>
              <ul className="space-y-2 text-xs text-sage-200 pt-3">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Unlimited 1099-NEC & 1099-K forms</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Bank feed receipt matching</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Home office & vehicle deductions</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-lime-400" /> Quarterly 1040-ES calculation</li>
              </ul>
            </div>
            <button onClick={onStartFiling} className="mt-8 w-full py-3 rounded-xl bg-lime-400 text-forest-950 font-bold text-xs hover:bg-lime-300 transition">
              Start Pro Filing
            </button>
          </div>

          {/* Business & Entities */}
          <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-sage-100 text-forest-900 text-xs font-bold">LLC / S-Corp / 1065</span>
              <h3 className="text-2xl font-extrabold text-forest-950">Business Command</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-forest-950">$249</span>
                <span className="text-xs text-neutral-500">per entity return</span>
              </div>
              <p className="text-xs text-neutral-600">Full entity returns, Schedule K-1 generation, and book-to-tax reconciliation.</p>
              <ul className="space-y-2 text-xs text-neutral-700 pt-3">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Form 1120-S / Form 1065 prep</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Schedule K-1 distribution</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Section 179 depreciation</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-forest-700" /> Book-to-tax Schedule M-1</li>
              </ul>
            </div>
            <button onClick={onStartFiling} className="mt-8 w-full py-3 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition">
              Start Business Return
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 3: ADD-ON EXPERT REVIEW SERVICES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 sm:p-12 border border-sage-300 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Add-On Human Verification by Licensed CPAs</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Need an authorized human eye on your return? Add Human Verified review to any tier for +$99 (Individual) or +$199 (Business). A licensed CPA or Enrolled Agent reviews all positions and signs off before filing.
          </p>
        </div>
      </section>

      {/* SECTION 4: STATE RETURN PRICING */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <h4 className="text-base font-bold text-forest-950">State Return Pricing</h4>
            <p className="text-neutral-600 mt-1">One state return is included with every Pro & Business filing. Additional states are just $39 each.</p>
          </div>
          <span className="text-2xl font-extrabold text-forest-900">$39 / add'l state</span>
        </div>
      </section>

      {/* SECTION 5: TRANSPARENCY GUARANTEE */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">No Surprise Fees Guarantee</h3>
          <p className="text-sm text-neutral-600">
            We never charge hidden fees to unlock tax credits, download your return PDFs, or access customer support.
          </p>
        </div>
      </section>

      {/* SECTION 6: FEATURE COMPARISON MATRIX */}
      <section className="max-w-4xl mx-auto px-6">
        <h3 className="text-xl font-bold text-forest-950 text-center mb-6">Detailed Plan Comparison</h3>
        <div className="bg-white rounded-2xl border border-sage-300 overflow-hidden text-xs">
          <div className="grid grid-cols-4 p-3 bg-sage-50 font-bold text-forest-950 border-b border-sage-200">
            <span>Feature</span>
            <span className="text-center">Basic ($0)</span>
            <span className="text-center">Pro ($89)</span>
            <span className="text-center">Business ($249)</span>
          </div>
          <div className="divide-y divide-sage-200">
            <div className="grid grid-cols-4 p-3 items-center">
              <span>Form 1040 W-2 Income</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
            </div>
            <div className="grid grid-cols-4 p-3 items-center">
              <span>Schedule C Business Write-offs</span>
              <span className="text-center text-neutral-300">-</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
            </div>
            <div className="grid grid-cols-4 p-3 items-center">
              <span>Form 1120-S / 1065 / K-1s</span>
              <span className="text-center text-neutral-300">-</span>
              <span className="text-center text-neutral-300">-</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
            </div>
            <div className="grid grid-cols-4 p-3 items-center">
              <span>Prove This Number Lineage</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
              <span className="text-center text-forest-700 font-bold">✓</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRICING FAQ */}
      <section className="max-w-4xl mx-auto px-6 space-y-4 text-xs">
        <h3 className="text-xl font-bold text-forest-950 text-center mb-4">Pricing FAQ</h3>
        <div className="p-4 rounded-xl bg-white border border-sage-200 space-y-1">
          <strong className="font-bold text-forest-950 block">When am I charged?</strong>
          <p className="text-neutral-600">You are only charged at the final review step right before your return is transmitted to the IRS.</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-sage-200 space-y-1">
          <strong className="font-bold text-forest-950 block">Can I deduct the cost of TaxOS?</strong>
          <p className="text-neutral-600">Yes! If you are self-employed or a business owner, the preparation cost is deductible on Schedule C or Form 1120-S.</p>
        </div>
      </section>

      {/* SECTION 8: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
