import React from 'react';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  DollarSign, 
  Home, 
  Briefcase, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp,
  MapPin,
  Lock,
  Sparkles,
  Check
} from 'lucide-react';

interface IndividualsPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function IndividualsPage({ onStartFiling, onNavigate }: IndividualsPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Personal Income Tax • Form 1040 & State Schedules
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          Personal tax filing without the paperwork headache.
        </h1>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-6 font-normal">
          Whether you have a single W-2, stock investments, a new mortgage, or income across multiple states, TaxOS organizes your documents and prepares a compliant, evidence-backed return.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Start My Individual Return</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: WHO IT SUPPORTS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Built for modern individuals and families.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <Users className="w-6 h-6 text-forest-700 mb-2" />
            <h3 className="font-bold text-sm text-forest-950">W-2 Professionals</h3>
            <p className="text-xs text-neutral-600 mt-1">Single or multi-job employees with retirement, HSA, or commuter benefits.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <TrendingUp className="w-6 h-6 text-forest-700 mb-2" />
            <h3 className="font-bold text-sm text-forest-950">Active Investors</h3>
            <p className="text-xs text-neutral-600 mt-1">Stock options, crypto trades, dividend reinvestments, and capital gains schedules.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <Home className="w-6 h-6 text-forest-700 mb-2" />
            <h3 className="font-bold text-sm text-forest-950">Homeowners</h3>
            <p className="text-xs text-neutral-600 mt-1">Mortgage interest (Form 1098), real estate property taxes, and clean energy credits.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <MapPin className="w-6 h-6 text-forest-700 mb-2" />
            <h3 className="font-bold text-sm text-forest-950">Multi-State Movers</h3>
            <p className="text-xs text-neutral-600 mt-1">Residents who moved between states or telecommuted across state lines during 2026.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: W-2 & JOB INCOME */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Automated Extraction</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Every W-2 box categorized instantly.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              Snap a photo or drop your W-2 PDF. TaxOS reads every box with cryptographic checksum verification, handling complex deferred compensation (Box 12 codes), state and local withholdings, and HSA payroll deductions automatically.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Box 1: Wages, Tips, Other Comp</span>
              <span className="text-forest-900 font-bold">$94,500.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Box 2: Federal Income Tax Withheld</span>
              <span className="text-forest-900 font-bold">$14,210.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Box 12 Code D: 401(k) Elective Deferrals</span>
              <span className="text-forest-900 font-bold">$22,500.00</span>
            </div>
            <div className="flex justify-between py-1.5 font-semibold">
              <span>Box 12 Code W: Employer HSA Contributions</span>
              <span className="text-forest-900 font-bold">$3,850.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FAMILY & DEPENDENTS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Family Tax Optimization</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
            Maximize legitimate child and dependent credits.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Child Tax Credit (§ 24)</h3>
            <p className="text-neutral-600 mt-2">Up to $2,000 per qualifying child under age 17, with automatic phase-out calculations based on MAGI thresholds.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Child & Dependent Care (§ 21)</h3>
            <p className="text-neutral-600 mt-2">Claim legitimate daycare, after-school care, and preschool expenses that enabled you to work.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Earned Income Tax Credit (§ 32)</h3>
            <p className="text-neutral-600 mt-2">Automatic eligibility calculation based on investment income caps and family composition.</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: INVESTMENTS & CRYPTO */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 sm:p-12 border border-sage-300 space-y-4">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Capital Gains & Losses</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Schedule D and Form 8949 reconciliations made simple.
          </h2>
          <p className="text-sm text-neutral-700 max-w-3xl leading-relaxed">
            Import Form 1099-B from Schwab, Fidelity, Robinhood, or Coinbase. TaxOS identifies wash sale disallowances (§ 1091), separates short-term vs long-term capital gains, and applies the $3,000 annual net capital loss limitation against ordinary income.
          </p>
        </div>
      </section>

      {/* SECTION 6: HOME, EDUCATION, RETIREMENT */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Homeowner Deductions</h3>
            <p className="text-neutral-600 mt-2">Form 1098 mortgage interest deduction under the $750k acquisition indebtedness cap, plus property taxes.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Higher Education Credits</h3>
            <p className="text-neutral-600 mt-2">American Opportunity Tax Credit (AOTC up to $2,500) and Lifetime Learning Credit (LLC) optimization.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Retirement Accounts</h3>
            <p className="text-neutral-600 mt-2">Traditional IRA deduction phase-out analysis, Roth IRA contribution limits, and Saver's Credit (§ 25B).</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: DEDUCTIONS & CREDITS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Standard Deduction vs. Itemized Schedule A
          </h2>
          <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
            TaxOS calculates both paths simultaneously. We compare your total medical expenses (&gt;7.5% AGI), SALT deduction ($10,000 cap), charitable gifts (§ 170), and mortgage interest against the 2026 standard deduction ($15,750 Single / $31,500 Married), automatically selecting whichever maximizes your after-tax savings.
          </p>
        </div>
      </section>

      {/* SECTION 8: MULTI-STATE TAX SOURCING */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-lime-400 uppercase tracking-wider">Multi-State Living</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
              Cross-border living without double taxation.
            </h2>
            <p className="text-sm text-sage-200 mt-3 leading-relaxed">
              Living in New Jersey and working in New York? Relocated to California mid-year? TaxOS apportion wages based on exact workday logs and calculates statutory credits for taxes paid to other jurisdictions, ensuring you never pay twice on the same dollar.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-forest-900 border border-forest-800 text-xs space-y-2">
            <div className="flex justify-between font-bold text-white">
              <span>Resident State Return (NJ-1040)</span>
              <span>Primary Filer</span>
            </div>
            <div className="flex justify-between text-sage-300">
              <span>Nonresident State Return (NY IT-203)</span>
              <span>Commuter Allocation</span>
            </div>
            <div className="flex justify-between text-lime-400 font-bold pt-2 border-t border-forest-800">
              <span>Credit for Taxes Paid to NY (Schedule COJ)</span>
              <span>100% Offset Applied</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: TAXDROP FOR INDIVIDUALS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <UploadCloud className="w-10 h-10 text-forest-700 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Drop your documents in seconds.
          </h2>
          <p className="text-sm text-neutral-600">
            No endless 50-page questionnaires. Simply upload your tax forms and let our intelligent ingestion pipeline build your tax graph automatically.
          </p>
        </div>
      </section>

      {/* SECTION 10: AI REVIEW ENGINE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 text-xs space-y-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <Sparkles className="w-4 h-4 text-forest-700" />
            <span>Autonomous AI Return Validation</span>
          </div>
          <p className="text-neutral-700">
            Before your return is finalized, TaxOS cross-checks your numbers against thousands of statutory rules, math schemas, and IRS e-file reject codes.
          </p>
        </div>
      </section>

      {/* SECTION 11: OPTIONAL HUMAN CPA REVIEW */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Optional CPA & Enrolled Agent verification.
          </h2>
          <p className="text-sm text-neutral-600">
            Want an expert human eye on your return? Upgrade to Human Verified with one click. A licensed CPA or EA will inspect your positions and sign off before transmission.
          </p>
        </div>
      </section>

      {/* SECTION 12: SECURITY & ENCRYPTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs flex items-center justify-between text-xs text-neutral-700 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-forest-700" />
            <span>Encrypted with AES-256. Zero AI model training on personal tax forms.</span>
          </div>
          <span className="font-bold text-forest-900">IRS Pub 1075 Compliant</span>
        </div>
      </section>

      {/* SECTION 13: FAQ */}
      <section className="max-w-4xl mx-auto px-6 space-y-6">
        <h2 className="text-2xl font-extrabold text-forest-950 tracking-tight text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-white border border-sage-200 space-y-1">
            <strong className="font-bold text-forest-950 block">How long does filing take?</strong>
            <p className="text-neutral-600">Most individual filers complete their entire return in under 10 minutes once documents are uploaded.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-sage-200 space-y-1">
            <strong className="font-bold text-forest-950 block">When can I expect my IRS refund?</strong>
            <p className="text-neutral-600">E-filed returns with direct deposit are typically processed and refunded by the IRS within 21 days.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-sage-200 space-y-1">
            <strong className="font-bold text-forest-950 block">Can I review everything before it is submitted?</strong>
            <p className="text-neutral-600">Yes. You have full line-by-line inspection rights and must digitally sign Form 8879 before any return is transmitted.</p>
          </div>
        </div>
      </section>

      {/* SECTION 14: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Start My Individual Taxes</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
