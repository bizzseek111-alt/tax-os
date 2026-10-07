import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Building2, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Check, 
  DollarSign 
} from 'lucide-react';

interface TaxTwinPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function TaxTwinPage({ onStartFiling, onNavigate }: TaxTwinPageProps) {
  const [projectedRevenue, setProjectedRevenue] = useState<number>(140000);
  const [estimatedExpenses, setEstimatedExpenses] = useState<number>(25000);

  const taxableIncome = Math.max(0, projectedRevenue - estimatedExpenses);
  const estimatedTax = Math.round(taxableIncome * 0.24);

  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Real-Time Continuous Tax Simulation
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Your personal tax simulation engine, running 365 days a year.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Taxes shouldn't be an annual surprise. Your Tax Twin models your tax picture continuously as you invoice clients, make business purchases, and plan major life decisions.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Activate My Tax Twin</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: WHAT IS THE TAX TWIN? */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold text-forest-950">A Digital Twin of Your Financial Profile</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            The Tax Twin is an intelligent clone of your statutory tax position. Connected to your read-only bank feeds, it updates your projected tax brackets, self-employment taxes, and state liabilities in real-time as money moves.
          </p>
        </div>
      </section>

      {/* SECTION 3: REAL-TIME TAX LIABILITY PROJECTIONS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-forest-950 text-white rounded-3xl p-8 sm:p-12 border border-forest-900 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-forest-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-lime-400 font-bold">Interactive What-If Modeling</span>
              <h3 className="text-xl font-bold text-white mt-1">Real-Time Simulation Slider</h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-forest-800 text-sage-200 font-mono">Tax Year 2026/2027</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Projected Gross Revenue</span>
                <span className="text-lime-400 font-mono">${projectedRevenue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="300000"
                step="5000"
                value={projectedRevenue}
                onChange={(e) => setProjectedRevenue(Number(e.target.value))}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Estimated Deductible Expenses</span>
                <span className="text-lime-400 font-mono">${estimatedExpenses.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="80000"
                step="2500"
                value={estimatedExpenses}
                onChange={(e) => setEstimatedExpenses(Number(e.target.value))}
                className="w-full accent-lime-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-forest-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <div>
              <span className="text-sage-400 block">Projected Net Taxable Income:</span>
              <strong className="text-lg font-bold text-white font-mono">${taxableIncome.toLocaleString()}</strong>
            </div>
            <div className="text-right">
              <span className="text-sage-400 block">Estimated Combined Liability:</span>
              <strong className="text-2xl font-extrabold text-lime-400 font-mono">${estimatedTax.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ENTITY RESTRUCTURING SIMULATOR */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Building2 className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">LLC vs. S-Corporation Election Modeling</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Wondering when to make an S-Corp election (Form 2553)? TaxOS calculates the exact tipping point where self-employment tax savings outpace the additional costs of running payroll and corporate filings.
          </p>
        </div>
      </section>

      {/* SECTION 5: MAJOR TRANSACTIONS & ASSET MODELING */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Major Purchase & Asset Timing</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Planning to purchase equipment, a vehicle, or real estate? Simulate Section 179 depreciation vs. installment sales before closing the transaction to optimize deduction timing.
          </p>
        </div>
      </section>

      {/* SECTION 6: QUARTERLY SAFE HARBOR TRACKER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-900 text-white border border-forest-800 max-w-4xl mx-auto space-y-3">
          <Calendar className="w-8 h-8 text-lime-400" />
          <h3 className="text-xl font-bold text-white">Quarterly Safe Harbor Tracker (Form 1040-ES)</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Avoid IRS Form 2210 underpayment penalties. Your Tax Twin tracks your safe harbor target (100% or 110% of prior-year tax) and generates exact quarterly vouchers.
          </p>
        </div>
      </section>

      {/* SECTION 7: MULTI-STATE TAX IMPACT ANALYZER */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <MapPin className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Relocation & Telecommuting Simulator</h3>
          <p className="text-sm text-neutral-600">
            Thinking about moving to Texas, Florida, or Washington? Compare your exact take-home pay against current California or New York state tax liabilities.
          </p>
        </div>
      </section>

      {/* SECTION 8: DEDUCTION MAXIMIZER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">Year-End Deduction Acceleration</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Receive proactive alerts in November and December with recommendations for retirement contributions (Solo 401k / SEP-IRA) and deductible business expenses.
          </p>
        </div>
      </section>

      {/* SECTION 9: AUDIT TRAIL READINESS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Continuous 365-Day Audit Readiness</h3>
          <p className="text-sm text-neutral-600">
            By matching receipts and categorizing transactions all year long, April 15 becomes a 5-minute review rather than a stressful week of scramble.
          </p>
        </div>
      </section>

      {/* SECTION 10: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Launch Your Tax Twin Simulator</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
