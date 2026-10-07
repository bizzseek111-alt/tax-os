import React from 'react';
import { 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Scale, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  Building2, 
  DollarSign, 
  Layers 
} from 'lucide-react';

interface StatePageProps {
  currentPath: string;
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function StatePages({ currentPath, onStartFiling, onNavigate }: StatePageProps) {
  
  // -------------------------------------------------------------------------
  // SUB-PAGE: CALIFORNIA (/states/california) — 12 UNIQUE SECTIONS
  // -------------------------------------------------------------------------
  if (currentPath === '/states/california') {
    return (
      <div className="space-y-20 py-6">
        {/* Section 1: Hero */}
        <section className="pt-10 pb-12 px-6 max-w-7xl mx-auto text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-4">
            Franchise Tax Board (FTB Form 540 / 540NR)
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
            California State Tax Intelligence
          </h1>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-4 font-normal">
            Navigate the highest state tax brackets in the nation with automated California Revenue & Taxation Code (RTC) conformity adjustments.
          </p>
          <div className="mt-8 flex justify-center">
            <button onClick={onStartFiling} className="px-8 py-3.5 rounded-2xl bg-forest-900 text-lime-400 font-bold text-sm shadow-lg flex items-center gap-2">
              <span>Start California Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Section 2: Overview */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h2 className="text-xl font-bold text-forest-950">California Tax Architecture Overview</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              California taxes personal income at graduated rates from 1.0% up to 12.3%, with an additional 1.0% Mental Health Services Tax on taxable income over $1,000,000 (reaching 13.3% top marginal rate). California does not conform to many federal provisions, requiring Schedule CA (540) adjustments.
            </p>
          </div>
        </section>

        {/* Section 3: Resident Filing (FTB 540) */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Form 540 Resident Filing</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Full-year residents report worldwide income, applying California standard deduction ($5,540 Single / $11,080 Married) or itemized deductions subject to federal conformity limits.
            </p>
          </div>
        </section>

        {/* Section 4: Part-Year & Nonresident (540NR) */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Form 540NR Nonresident & Part-Year Apportionment</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Moving into or out of California? TaxOS determines your exact domicile dates and apportions California-source wage income, stock option vesting schedules, and business earnings.
            </p>
          </div>
        </section>

        {/* Section 5: Federal Conformity Differences */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Key RTC vs. IRC Non-Conformity Areas</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              California specifically decouples from federal provisions including bonus depreciation, Section 199A QBI deduction, and HSA deductions, requiring automated Schedule CA additions and subtractions.
            </p>
          </div>
        </section>

        {/* Section 6: HSA Add-Back (Cal. RTC § 17215.4) */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-lime-400">Mandatory HSA Deduction Add-Back (Cal. RTC § 17215.4)</h3>
            <p className="text-sm text-sage-200 leading-relaxed">
              California does not recognize Health Savings Accounts. Federal deductions for HSA contributions must be added back to California gross income, and interest earned within the HSA is taxable.
            </p>
          </div>
        </section>

        {/* Section 7: Sec 179 $25k Cap (Cal. RTC § 17255) */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Section 179 $25,000 State Limitation (Cal. RTC § 17255)</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              While federal law permits over $1,200,000 in first-year equipment expensing, California caps Section 179 depreciation at strictly $25,000, with a phase-out starting at $200,000.
            </p>
          </div>
        </section>

        {/* Section 8: AB 5 Worker Classification */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
            <Scale className="w-6 h-6 text-forest-700" />
            <h3 className="text-lg font-bold text-forest-950">California Assembly Bill 5 (AB 5) ABC Worker Test</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Rigorous compliance evaluation for 1099 contractors: proving freedom from control (Part A), service outside usual business (Part B), and independent trade establishment (Part C).
            </p>
          </div>
        </section>

        {/* Section 9: California Credits & SDI */}
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">CalEITC, Young Child Credit & State Disability Insurance</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Claim the California Earned Income Tax Credit, Young Child Tax Credit, and Renters' Credit while verifying excess State Disability Insurance (SDI) withholding refunds.
            </p>
          </div>
        </section>

        {/* Section 10: TaxOS CA Workflow */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
            <h3 className="text-xl font-bold text-forest-950">Automated FTB 540 Generation</h3>
            <p className="text-sm text-neutral-600">
              TaxOS populates Form 540, Schedule CA, and Form 3805P with 100% calculation provenance.
            </p>
          </div>
        </section>

        {/* Section 11: Human CA Review */}
        <section className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
            <h3 className="text-xl font-bold text-forest-950">Licensed California CPAs & EAs</h3>
            <p className="text-sm text-neutral-600">
              Reviewers with dedicated Franchise Tax Board experience verify complex residency and apportionment positions.
            </p>
          </div>
        </section>

        {/* Section 12: FAQ & CTA */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h3 className="text-xl font-bold text-forest-950">California Tax FAQ</h3>
          <p className="text-xs text-neutral-600">
            Does California tax worldwide income? Yes, for full-year residents. Nonresidents are taxed only on California-source income.
          </p>
          <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-xl inline-flex items-center gap-2">
            <span>Start California Filing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // SUB-PAGE: NEW YORK (/states/new-york) — 12 UNIQUE SECTIONS
  // -------------------------------------------------------------------------
  if (currentPath === '/states/new-york') {
    return (
      <div className="space-y-20 py-6">
        <section className="pt-10 pb-12 px-6 max-w-7xl mx-auto text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-4">
            NY Department of Taxation and Finance (DTF IT-201 / IT-203)
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
            New York State & City Tax Intelligence
          </h1>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-4 font-normal">
            Autonomous handling of the Convenience of the Employer rule, statutory residency audits, and NYC municipal taxes.
          </p>
          <div className="mt-8 flex justify-center">
            <button onClick={onStartFiling} className="px-8 py-3.5 rounded-2xl bg-forest-900 text-lime-400 font-bold text-sm shadow-lg flex items-center gap-2">
              <span>Start New York Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h2 className="text-xl font-bold text-forest-950">New York Tax Overview</h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              New York levies graduated personal income tax rates up to 10.9% at the state level, plus up to 3.876% for New York City residents.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-lime-400">Convenience of the Employer Rule (20 NYCRR § 131.18)</h3>
            <p className="text-sm text-sage-200 leading-relaxed">
              If your employer is based in New York, telecommuting days worked from an out-of-state home are taxed by New York unless working remotely is an absolute necessity of the employer. TaxOS logs and defends bona fide home office exceptions.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Statutory Residency & The 183-Day Rule</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Under NY Tax Law § 605(b)(1)(B), maintaining a permanent place of abode and spending 184+ days in New York triggers full-year resident taxation, regardless of legal domicile.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">New York City Resident Tax</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Dedicated local tax calculations for residents of Manhattan, Brooklyn, Queens, Bronx, and Staten Island.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Pass-Through Entity Tax (PTET) Credits</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Elective entity-level tax credits offsetting the federal $10,000 SALT cap for S-Corp and partnership owners.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 text-center">
          <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-xl inline-flex items-center gap-2">
            <span>File New York Taxes with TaxOS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // SUB-PAGE: NEW JERSEY (/states/new-jersey) — 11 UNIQUE SECTIONS
  // -------------------------------------------------------------------------
  if (currentPath === '/states/new-jersey') {
    return (
      <div className="space-y-20 py-6">
        <section className="pt-10 pb-12 px-6 max-w-7xl mx-auto text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-4">
            NJ Division of Taxation (Form NJ-1040)
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
            New Jersey State Tax Compliance
          </h1>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-4 font-normal">
            Navigating the Gross Income Tax Act (N.J.S.A. § 54A) and commuter tax credits.
          </p>
          <div className="mt-8 flex justify-center">
            <button onClick={onStartFiling} className="px-8 py-3.5 rounded-2xl bg-forest-900 text-lime-400 font-bold text-sm shadow-lg flex items-center gap-2">
              <span>Start New Jersey Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-lime-400">Strict Prohibition Against Loss Netting (N.J.S.A. § 54A:5-2)</h3>
            <p className="text-sm text-sage-200 leading-relaxed">
              New Jersey strictly prohibits offsetting losses in one category (e.g., net business loss) against income in another category (e.g., W-2 wages or interest). TaxOS enforces this statutory ban to prevent state audit assessments.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Schedule NJ-COJ Commuter Tax Credit</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Living in New Jersey while commuting to Manhattan? Claim full dollar-for-dollar credit for taxes paid to New York to prevent double taxation.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 text-center">
          <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-xl inline-flex items-center gap-2">
            <span>File New Jersey Taxes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // SUB-PAGE: ILLINOIS (/states/illinois) — 11 UNIQUE SECTIONS
  // -------------------------------------------------------------------------
  if (currentPath === '/states/illinois') {
    return (
      <div className="space-y-20 py-6">
        <section className="pt-10 pb-12 px-6 max-w-7xl mx-auto text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-4">
            Illinois Department of Revenue (IDOR IL-1040)
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Illinois State Tax Intelligence
          </h1>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-4 font-normal">
            Flat 4.95% rate calculation, 100% retirement subtraction, and property tax relief.
          </p>
          <div className="mt-8 flex justify-center">
            <button onClick={onStartFiling} className="px-8 py-3.5 rounded-2xl bg-forest-900 text-lime-400 font-bold text-sm shadow-lg flex items-center gap-2">
              <span>Start Illinois Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-lime-400">100% Retirement & Pension Subtraction (35 ILCS 5/203)</h3>
            <p className="text-sm text-sage-200 leading-relaxed">
              Illinois fully exempts qualifying distributions from IRAs, 401(k) plans, state pensions, and Social Security from state income taxation.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Property Tax Credit (Schedule ICR)</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Illinois homeowners can claim a 5% credit on residential property taxes paid on their principal dwelling.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 text-center">
          <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-xl inline-flex items-center gap-2">
            <span>File Illinois Taxes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // SUB-PAGE: MASSACHUSETTS (/states/massachusetts) — 11 UNIQUE SECTIONS
  // -------------------------------------------------------------------------
  if (currentPath === '/states/massachusetts') {
    return (
      <div className="space-y-20 py-6">
        <section className="pt-10 pb-12 px-6 max-w-7xl mx-auto text-center">
          <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-4">
            MA Department of Revenue (DOR Form 1)
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Massachusetts State Tax Compliance
          </h1>
          <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-4 font-normal">
            Tiered 5.0% income tax, 8.5% short-term capital gains, and the 4% Millionaires Tax surtax.
          </p>
          <div className="mt-8 flex justify-center">
            <button onClick={onStartFiling} className="px-8 py-3.5 rounded-2xl bg-forest-900 text-lime-400 font-bold text-sm shadow-lg flex items-center gap-2">
              <span>Start Massachusetts Return</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-lime-400">4% Fair Share Amendment Surtax</h3>
            <p className="text-sm text-sage-200 leading-relaxed">
              Massachusetts imposes an additional 4% surtax on taxable income exceeding $1,053,750 (indexed for inflation), bringing the top marginal rate to 9.0%.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
            <h3 className="text-lg font-bold text-forest-950">Schedule HC Health Care Mandate Verification</h3>
            <p className="text-sm text-neutral-700 leading-relaxed">
              Verifies qualifying minimum creditable health insurance coverage to avoid state-level individual mandate penalties.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 text-center">
          <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-xl inline-flex items-center gap-2">
            <span>File Massachusetts Taxes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // DEFAULT: ALL STATES HUB (/states) — 10 SECTIONS
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-24 py-6">
      <section className="pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Sovereign State Tax Intelligence Hub
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Precision state tax engines for America's largest economies.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Explore individual and business tax rules across California, New York, New Jersey, Illinois, and Massachusetts.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => onNavigate('/states/california')}
            className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs hover:border-forest-700 cursor-pointer transition space-y-3"
          >
            <span className="text-xs font-bold text-forest-700 uppercase">FTB Form 540</span>
            <h3 className="text-xl font-bold text-forest-950">California</h3>
            <p className="text-xs text-neutral-600">Cal. RTC conformity, HSA add-back (§ 17215.4), Sec 179 $25k cap, and AB 5 worker test.</p>
          </div>

          <div 
            onClick={() => onNavigate('/states/new-york')}
            className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs hover:border-forest-700 cursor-pointer transition space-y-3"
          >
            <span className="text-xs font-bold text-forest-700 uppercase">DTF IT-201 / IT-203</span>
            <h3 className="text-xl font-bold text-forest-950">New York</h3>
            <p className="text-xs text-neutral-600">Convenience of employer rule (20 NYCRR § 131.18), NYC local taxes, and 183-day residency.</p>
          </div>

          <div 
            onClick={() => onNavigate('/states/new-jersey')}
            className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs hover:border-forest-700 cursor-pointer transition space-y-3"
          >
            <span className="text-xs font-bold text-forest-700 uppercase">NJ-1040</span>
            <h3 className="text-xl font-bold text-forest-950">New Jersey</h3>
            <p className="text-xs text-neutral-600">Strict no-loss netting ban (N.J.S.A. § 54A:5-2) and NY/NJ commuter credit calculation.</p>
          </div>

          <div 
            onClick={() => onNavigate('/states/illinois')}
            className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs hover:border-forest-700 cursor-pointer transition space-y-3"
          >
            <span className="text-xs font-bold text-forest-700 uppercase">IDOR IL-1040</span>
            <h3 className="text-xl font-bold text-forest-950">Illinois</h3>
            <p className="text-xs text-neutral-600">Flat 4.95% individual income tax rate, 100% retirement subtraction, and property credits.</p>
          </div>

          <div 
            onClick={() => onNavigate('/states/massachusetts')}
            className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs hover:border-forest-700 cursor-pointer transition space-y-3"
          >
            <span className="text-xs font-bold text-forest-700 uppercase">DOR Form 1</span>
            <h3 className="text-xl font-bold text-forest-950">Massachusetts</h3>
            <p className="text-xs text-neutral-600">Tiered 5.0% rate, 8.5% ST capital gains, and the 4% Millionaires Tax surtax.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button onClick={onStartFiling} className="px-10 py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-base shadow-xl inline-flex items-center gap-2">
          <span>Start Multi-State Return</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>
    </div>
  );
}
