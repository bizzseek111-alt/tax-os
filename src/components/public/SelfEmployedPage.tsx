import React from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  DollarSign, 
  Home, 
  Car, 
  Utensils, 
  Laptop, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  TrendingUp,
  Receipt,
  Layers
} from 'lucide-react';

interface SelfEmployedPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function SelfEmployedPage({ onStartFiling, onNavigate }: SelfEmployedPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Schedule C & 1099 Tax Intelligence
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          The tax system built for how you actually work.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Designed specifically for independent contractors, consultants, and creators. Connect your bank accounts or drop receipts, and TaxOS identifies every legitimate write-off while keeping you audit-ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Start My Self-Employed Return</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: FREELANCER / CREATOR / CONSULTANT PROFILES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Laptop className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Tech Consultants & Devs</h3>
            <p className="text-xs text-neutral-600">SaaS tooling, remote work gear, home studio allocations, and multi-state client sourcing.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Sparkles className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Creators & Media Producers</h3>
            <p className="text-xs text-neutral-600">Cameras, editing software, studio props, travel production costs, and brand contract 1099-MISC/NEC.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Briefcase className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Independent Contractors</h3>
            <p className="text-xs text-neutral-600">Mileage logging, subcontractor payments, equipment expensing, and quarterly 1040-ES payments.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: 1099 INCOME INTELLIGENCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Multi-1099 Reconciliation</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Never get double-counted on 1099-NEC & 1099-K.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              When clients pay you through Stripe or PayPal, you often receive both a 1099-NEC from the client and a 1099-K from the payment platform. TaxOS automatically reconciles transaction IDs to eliminate phantom revenue duplication.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Form 1099-NEC Reported:</span>
              <span className="text-forest-900 font-bold">$92,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Form 1099-K Processor Match:</span>
              <span className="text-forest-900 font-bold">$92,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 text-forest-700 font-bold">
              <span>Deduplication Status:</span>
              <span>100% Resolved ($0 Double Count)</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: BANK & ACCOUNT CONNECTIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <Layers className="w-10 h-10 text-forest-700 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Connect once. Ingest automatically.
          </h2>
          <p className="text-sm text-neutral-600">
            Link your business checking and credit card accounts. TaxOS reads transactions in real-time, matching payments to vendors and isolating personal expenses from business write-offs.
          </p>
        </div>
      </section>

      {/* SECTION 5: INCOME RECONSTRUCTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 text-xs space-y-3 max-w-4xl mx-auto">
          <strong className="text-sm font-bold text-forest-950 block">Automated Inter-Account Transfer Elimination</strong>
          <p className="text-neutral-700">
            Moving money from your business checking to your personal account or emergency fund is not taxable revenue. TaxOS pairs the debit and credit sides of every internal transfer so your gross revenue matches your genuine earnings.
          </p>
        </div>
      </section>

      {/* SECTION 6: EXPENSE INTELLIGENCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">26 U.S.C. § 162</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
            Ordinary & necessary expense classification.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950">Advertising & Marketing</h4>
            <p className="text-neutral-600 mt-1">Google Ads, Meta campaigns, sponsorship fees, domain renewals.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950">Contract Labor</h4>
            <p className="text-neutral-600 mt-1">Freelancer contractor payments with automated 1099 filing prep.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950">Professional Services</h4>
            <p className="text-neutral-600 mt-1">Legal counsel, bookkeeping software, tax prep, registered agent fees.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300">
            <h4 className="font-bold text-forest-950">Supplies & Materials</h4>
            <p className="text-neutral-600 mt-1">Consumable items, packaging materials, project-specific hardware.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: RECEIPT MATCHING */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <Receipt className="w-8 h-8 text-lime-400 mb-3" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Receipt matching with zero manual data entry.
            </h2>
            <p className="text-sm text-sage-200 mt-3 leading-relaxed">
              Drop receipts into TaxOS anytime. Our OCR pipeline extracts the vendor, date, and tax amount, pairing each image with the corresponding bank transaction to provide bulletproof IRS audit substantiation.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-forest-900 border border-forest-800 text-xs space-y-2">
            <div className="flex justify-between font-bold text-lime-400">
              <span>Receipt Match Rate</span>
              <span>98.6% of Expenses</span>
            </div>
            <p className="text-sage-300">All receipts stored in your permanent encrypted vault with SHA-256 integrity hashes.</p>
          </div>
        </div>
      </section>

      {/* SECTION 8: HOME OFFICE (§ 280A) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Home Office Deduction (§ 280A) Optimization</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            TaxOS evaluates the IRS Simplified Method ($5/sq ft up to 300 sq ft) against the Actual Expense Method (allocating rent, utilities, insurance, and internet by square footage percentage), recommending the largest legal deduction for your primary workspace.
          </p>
        </div>
      </section>

      {/* SECTION 9: VEHICLE & MILEAGE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Business Mileage & Vehicle Costs</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Compare the 2026 standard mileage rate against actual operating expenses (gas, repairs, lease payments, depreciation) to claim the optimal vehicle write-off while maintaining contemporary mileage trip records.
          </p>
        </div>
      </section>

      {/* SECTION 10: TRAVEL & MEALS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <Utensils className="w-4 h-4 text-forest-700" />
            <span>Business Meals 50% Disallowance Rule (26 U.S.C. § 274(n))</span>
          </div>
          <p className="text-neutral-600">
            TaxOS automatically isolates client entertainment from business meals, applying the mandatory 50% statutory deduction limit without requiring manual calculation.
          </p>
        </div>
      </section>

      {/* SECTION 11: EQUIPMENT & SOFTWARE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Section 179 First-Year Depreciation</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Instantly expense qualifying tech equipment, computers, and office furniture up to statutory limits, factoring in individual state conformity laws (such as California's $25,000 cap).
          </p>
        </div>
      </section>

      {/* SECTION 12: QUARTERLY ESTIMATED TAXES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-900 text-white border border-forest-800 max-w-4xl mx-auto space-y-3">
          <Calendar className="w-6 h-6 text-lime-400" />
          <h3 className="text-xl font-bold text-white">Quarterly Estimated Taxes (Form 1040-ES)</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Eliminate IRS underpayment penalties (Form 2210) through exact safe harbor calculation (100% or 110% of prior-year liability vs. 90% of current year).
          </p>
        </div>
      </section>

      {/* SECTION 13: TAX TWIN PLANNING */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <TrendingUp className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Year-Round Tax Twin Modeling</h3>
          <p className="text-sm text-neutral-600">
            See when it makes sense to elect S-Corporation status, how opening a SEP-IRA or Solo 401(k) lowers your self-employment tax, and plan ahead.
          </p>
        </div>
      </section>

      {/* SECTION 14: EXPERT VERIFICATION */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Certified Small Business CPA Sign-Off</h3>
          <p className="text-sm text-neutral-600">
            Get your completed Schedule C and self-employment tax (Schedule SE) inspected and certified by a licensed professional.
          </p>
        </div>
      </section>

      {/* SECTION 15: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Start My Self-Employed Taxes</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
