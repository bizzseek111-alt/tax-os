import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Calculator, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle, 
  Building2, 
  MapPin, 
  ShieldCheck,
  CreditCard,
  Briefcase
} from 'lucide-react';

export function YearRoundPlanningView() {
  // Scenario 1: Equipment / Section 179 purchase
  const [equipmentCost, setEquipmentCost] = useState<number>(35000);
  const [stateOfPurchase, setStateOfPurchase] = useState<'US-FED' | 'US-CA' | 'US-NY'>('US-CA');

  // Scenario 2: S-Corp Salary vs Distribution
  const [sCorpNetIncome, setSCorpNetIncome] = useState<number>(180000);
  const [sCorpSalary, setSCorpSalary] = useState<number>(75000);

  // Scenario 3: Multi-State Relocation
  const [currentHomeState, setCurrentHomeState] = useState<'NY' | 'CA'>('NY');
  const [destState, setDestState] = useState<'FL' | 'TX'>('FL');
  const [daysInDest, setDaysInDest] = useState<number>(195);

  // Estimated Payments Safe Harbor
  const [safeHarborMethod, setSafeHarborMethod] = useState<'PRIOR_YEAR_110' | 'CURRENT_YEAR_90'>('PRIOR_YEAR_110');
  const [scheduledPayments, setScheduledPayments] = useState<Record<string, boolean>>({
    Q1: true,
    Q2: true,
    Q3: false,
    Q4: false
  });

  // Calculate Section 179 & tax savings
  // Under CA RTC § 17255, CA caps 179 at $25,000. Federal allows up to $1,160,000.
  const fedDeduction = equipmentCost;
  const caDeduction = stateOfPurchase === 'US-CA' ? Math.min(equipmentCost, 25000) : equipmentCost;
  const estimatedTaxSavings = Math.round(fedDeduction * 0.24 + caDeduction * 0.093);

  // Calculate S-Corp SE tax savings
  // Distribution portion is exempt from 15.3% FICA (up to wage base)
  const distributions = Math.max(0, sCorpNetIncome - sCorpSalary);
  const seTaxSavings = Math.round(distributions * 0.153);

  // Multi-state relocation savings (e.g. NY top marginal rate ~6.85% + local NYC 3.876% or CA 9.3%)
  const stateRate = currentHomeState === 'CA' ? 0.093 : 0.0685;
  const stateTaxSaved = daysInDest >= 183 ? Math.round(sCorpNetIncome * stateRate) : 0;

  const handleTogglePayment = (quarter: string) => {
    setScheduledPayments(prev => ({
      ...prev,
      [quarter]: !prev[quarter]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Tax Twin 2026 */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border border-blue-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tax Twin 2026 Engine
            </span>
            <span className="text-xs text-slate-400">Continuous Digital Twin Shadow</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Year-Round Planning & Scenario Simulator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate high-impact tax events, optimize quarterly estimated tax payments, and avoid penalties before filing season.
          </p>
        </div>

        {/* Real-time Tax Twin Metrics */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Projected 2026 AGI</span>
            <div className="text-xl font-bold text-white font-mono">$168,400</div>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Effective Tax Rate</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">19.8%</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenarios & Safe Harbor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Scenario Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SCENARIO 1: Section 179 Equipment Purchase */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scenario A: Section 179 Equipment Write-Off</h3>
                  <p className="text-xs text-slate-400">Simulate immediate expensing of computers, cameras, or machinery</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +${estimatedTaxSavings.toLocaleString()} Est. Savings
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Asset Purchase Price:</span>
                <span className="font-mono text-white font-bold">${equipmentCost.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={equipmentCost}
                onChange={(e) => setEquipmentCost(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>$5,000</span>
                <span>$50,000</span>
                <span>$100,000</span>
              </div>

              {/* State Non-Conformity Notice */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">State Statutory Divergence (Cal. RTC § 17255):</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Federal IRC § 179 allows full deduction of ${equipmentCost.toLocaleString()}. California caps the first-year deduction at $25,000. Excess (${Math.max(0, equipmentCost - 25000).toLocaleString()}) must be added back on CA Form 3885A and depreciated via MACRS.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SCENARIO 2: S-Corp Election & Reasonable Salary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scenario B: S-Corp Election & Salary Split</h3>
                  <p className="text-xs text-slate-400">Optimize W-2 salary vs. K-1 distributions to reduce 15.3% FICA</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                +${seTaxSavings.toLocaleString()} FICA Savings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300">Total Net Business Profit:</label>
                <div className="mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono">
                  ${sCorpNetIncome.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300">Reasonable W-2 Salary (IRS Rev. Rul. 74-44):</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={sCorpSalary}
                    onChange={(e) => setSCorpSalary(Number(e.target.value))}
                    step="5000"
                    min="30000"
                    max={sCorpNetIncome}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Distributions: <strong className="text-purple-300 font-mono">${distributions.toLocaleString()}</strong> are exempt from 12.4% Social Security and 2.9% Medicare self-employment taxes.
            </div>
          </div>

          {/* SCENARIO 3: State Residency Relocation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Scenario C: Multi-State Relocation (183-Day Test)</h3>
                  <p className="text-xs text-slate-400">Simulate moving tax domicile to a no-income-tax state</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                daysInDest >= 183
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {daysInDest >= 183 ? `+$${stateTaxSaved.toLocaleString()} Saved` : 'Residency Not Met'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400">Departing State:</span>
                <select
                  value={currentHomeState}
                  onChange={(e) => setCurrentHomeState(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                >
                  <option value="NY">New York (6.85% + NYC)</option>
                  <option value="CA">California (9.3%)</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400">Destination State:</span>
                <select
                  value={destState}
                  onChange={(e) => setDestState(e.target.value as any)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white"
                >
                  <option value="FL">Florida (0.0%)</option>
                  <option value="TX">Texas (0.0%)</option>
                </select>
              </div>

              <div>
                <span className="text-slate-400">Days Spent in Dest ({daysInDest}):</span>
                <input
                  type="range"
                  min="60"
                  max="300"
                  value={daysInDest}
                  onChange={(e) => setDaysInDest(Number(e.target.value))}
                  className="w-full mt-2 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {daysInDest >= 183 ? (
                <span className="text-emerald-400 font-medium">
                  ✓ Passed statutory 183-day bright-line presence test. Domicile change recognized; ${stateTaxSaved.toLocaleString()} state tax eliminated.
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  ⚠ Under 183 days. {currentHomeState} DTF/FTB retains full resident taxation on worldwide income.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Quarterly Estimated Payments & Safe Harbor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Quarterly Estimated Taxes (Form 1040-ES)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Tax Year 2026</span>
            </div>

            {/* Safe Harbor Rule Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Penalty Protection Safe Harbor:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSafeHarborMethod('PRIOR_YEAR_110')}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition ${
                    safeHarborMethod === 'PRIOR_YEAR_110'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">110% Prior Year</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">AGI &gt; $150k Safe Harbor</div>
                </button>

                <button
                  onClick={() => setSafeHarborMethod('CURRENT_YEAR_90')}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border transition ${
                    safeHarborMethod === 'CURRENT_YEAR_90'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">90% Current Year</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Projected 2026 Liability</div>
                </button>
              </div>
            </div>

            {/* Quarterly Vouchers */}
            <div className="space-y-3 pt-2">
              {[
                { quarter: 'Q1', due: 'April 15, 2026', amount: 8450, status: 'PAID' },
                { quarter: 'Q2', due: 'June 16, 2026', amount: 8450, status: 'PAID' },
                { quarter: 'Q3', due: 'September 15, 2026', amount: 8450, status: 'UPCOMING' },
                { quarter: 'Q4', due: 'January 15, 2027', amount: 8450, status: 'UPCOMING' }
              ].map((q) => {
                const isScheduled = scheduledPayments[q.quarter];
                return (
                  <div
                    key={q.quarter}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isScheduled
                        ? 'bg-slate-950/90 border-emerald-500/30'
                        : 'bg-slate-950/50 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{q.quarter} Voucher</span>
                        <span className="text-[11px] text-slate-400">Due {q.due}</span>
                      </div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
                        ${q.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePayment(q.quarter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        isScheduled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isScheduled ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Scheduled (EFTPS)</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Schedule Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                100% immunity from IRC § 6654 underpayment penalties achieved via Safe Harbor calculation.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
