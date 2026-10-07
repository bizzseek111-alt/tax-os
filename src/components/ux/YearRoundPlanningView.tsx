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
      <div className="bg-pine-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-pine-600/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-pine-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tax Twin 2026 Engine
            </span>
            <span className="text-xs text-white/80 font-medium">Continuous Digital Twin Shadow</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Year-Round Planning & Scenario Simulator</h1>
          <p className="text-sm text-white/85 mt-1 max-w-2xl">
            Simulate high-impact tax events, optimize quarterly estimated tax payments, and avoid penalties before filing season.
          </p>
        </div>

        {/* Real-time Tax Twin Metrics */}
        <div className="flex items-center gap-4 bg-pine-800/80 border border-pine-600/50 p-4 rounded-2xl shadow-xs">
          <div className="text-right">
            <span className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">Projected 2026 AGI</span>
            <div className="text-xl font-bold text-white font-mono">$168,400</div>
          </div>
          <div className="h-8 w-[1px] bg-pine-600" />
          <div className="text-right">
            <span className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">Effective Tax Rate</span>
            <div className="text-xl font-bold text-lime-300 font-mono">19.8%</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenarios & Safe Harbor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Scenario Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SCENARIO 1: Section 179 Equipment Purchase */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sage-900">Scenario A: Section 179 Equipment Write-Off</h3>
                  <p className="text-xs text-sage-600">Simulate immediate expensing of computers, cameras, or machinery</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-200 text-pine-950 border border-lime-300">
                +${estimatedTaxSavings.toLocaleString()} Est. Savings
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sage-700 font-semibold">Asset Purchase Price:</span>
                <span className="font-mono text-sage-950 font-extrabold text-sm">${equipmentCost.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="5000"
                value={equipmentCost}
                onChange={(e) => setEquipmentCost(Number(e.target.value))}
                className="w-full accent-pine-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-sage-500 font-mono">
                <span>$5,000</span>
                <span>$50,000</span>
                <span>$100,000</span>
              </div>

              {/* State Non-Conformity Notice */}
              <div className="bg-sage-50 p-3.5 rounded-2xl border border-sage-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sage-900">State Statutory Divergence (Cal. RTC § 17255):</span>
                  <p className="text-sage-600 text-[11px] mt-0.5">
                    Federal IRC § 179 allows full deduction of ${equipmentCost.toLocaleString()}. California caps the first-year deduction at $25,000. Excess (${Math.max(0, equipmentCost - 25000).toLocaleString()}) must be added back on CA Form 3885A and depreciated via MACRS.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SCENARIO 2: S-Corp Election & Reasonable Salary */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sage-900">Scenario B: S-Corp Election & Salary Split</h3>
                  <p className="text-xs text-sage-600">Optimize W-2 salary vs. K-1 distributions to reduce 15.3% FICA</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-200 text-pine-950 border border-lime-300">
                +${seTaxSavings.toLocaleString()} FICA Savings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-sage-700">Total Net Business Profit:</label>
                <div className="mt-1 bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 text-xs text-sage-900 font-mono font-bold">
                  ${sCorpNetIncome.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-sage-700">Reasonable W-2 Salary (IRS Rev. Rul. 74-44):</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={sCorpSalary}
                    onChange={(e) => setSCorpSalary(Number(e.target.value))}
                    step="5000"
                    min="30000"
                    max={sCorpNetIncome}
                    className="w-full bg-sage-50 border border-sage-200 rounded-xl px-3 py-2 text-xs text-sage-900 font-mono font-bold focus:outline-none focus:border-pine-700"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-sage-700 bg-sage-50 p-3 rounded-2xl border border-sage-200">
              Distributions: <strong className="text-pine-800 font-mono font-bold">${distributions.toLocaleString()}</strong> are exempt from 12.4% Social Security and 2.9% Medicare self-employment taxes.
            </div>
          </div>

          {/* SCENARIO 3: State Residency Relocation */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sage-900">Scenario C: Multi-State Relocation (183-Day Test)</h3>
                  <p className="text-xs text-sage-600">Simulate moving tax domicile to a no-income-tax state</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                daysInDest >= 183
                  ? 'bg-lime-200 text-pine-950 border border-lime-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}>
                {daysInDest >= 183 ? `+$${stateTaxSaved.toLocaleString()} Saved` : 'Residency Not Met'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-sage-600 font-medium">Departing State:</span>
                <select
                  value={currentHomeState}
                  onChange={(e) => setCurrentHomeState(e.target.value as any)}
                  className="w-full mt-1 bg-sage-50 border border-sage-200 rounded-xl px-2.5 py-2 text-sage-900 font-semibold"
                >
                  <option value="NY">New York (6.85% + NYC)</option>
                  <option value="CA">California (9.3%)</option>
                </select>
              </div>

              <div>
                <span className="text-sage-600 font-medium">Destination State:</span>
                <select
                  value={destState}
                  onChange={(e) => setDestState(e.target.value as any)}
                  className="w-full mt-1 bg-sage-50 border border-sage-200 rounded-xl px-2.5 py-2 text-sage-900 font-semibold"
                >
                  <option value="FL">Florida (0.0%)</option>
                  <option value="TX">Texas (0.0%)</option>
                </select>
              </div>

              <div>
                <span className="text-sage-600 font-medium">Days Spent in Dest ({daysInDest}):</span>
                <input
                  type="range"
                  min="60"
                  max="300"
                  value={daysInDest}
                  onChange={(e) => setDaysInDest(Number(e.target.value))}
                  className="w-full mt-2 accent-pine-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="text-[11px] text-sage-700 bg-sage-50 p-3 rounded-2xl border border-sage-200">
              {daysInDest >= 183 ? (
                <span className="text-pine-800 font-bold">
                  ✓ Passed statutory 183-day bright-line presence test. Domicile change recognized; ${stateTaxSaved.toLocaleString()} state tax eliminated.
                </span>
              ) : (
                <span className="text-amber-800 font-bold">
                  ⚠ Under 183 days. {currentHomeState} DTF/FTB retains full resident taxation on worldwide income.
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Quarterly Estimated Payments & Safe Harbor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sage-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pine-700" />
                <h3 className="text-sm font-bold text-sage-900">Quarterly Estimated Taxes (Form 1040-ES)</h3>
              </div>
              <span className="text-xs text-sage-600 font-mono font-semibold">Tax Year 2026</span>
            </div>

            {/* Safe Harbor Rule Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-sage-700">Penalty Protection Safe Harbor:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSafeHarborMethod('PRIOR_YEAR_110')}
                  className={`p-3 rounded-2xl text-xs font-medium text-left border transition ${
                    safeHarborMethod === 'PRIOR_YEAR_110'
                      ? 'bg-pine-700 border-pine-700 text-white shadow-xs'
                      : 'bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  <div className="font-bold">110% Prior Year</div>
                  <div className={`text-[10px] mt-0.5 ${safeHarborMethod === 'PRIOR_YEAR_110' ? 'text-white/80' : 'text-sage-500'}`}>AGI &gt; $150k Safe Harbor</div>
                </button>

                <button
                  onClick={() => setSafeHarborMethod('CURRENT_YEAR_90')}
                  className={`p-3 rounded-2xl text-xs font-medium text-left border transition ${
                    safeHarborMethod === 'CURRENT_YEAR_90'
                      ? 'bg-pine-700 border-pine-700 text-white shadow-xs'
                      : 'bg-sage-50 border-sage-200 text-sage-700 hover:bg-sage-100'
                  }`}
                >
                  <div className="font-bold">90% Current Year</div>
                  <div className={`text-[10px] mt-0.5 ${safeHarborMethod === 'CURRENT_YEAR_90' ? 'text-white/80' : 'text-sage-500'}`}>Projected 2026 Liability</div>
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
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isScheduled
                        ? 'bg-pine-50 border-pine-200'
                        : 'bg-sage-50/70 border-sage-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-sage-900">{q.quarter} Voucher</span>
                        <span className="text-[11px] text-sage-600">Due {q.due}</span>
                      </div>
                      <div className="text-sm font-extrabold font-mono text-pine-800 mt-1">
                        ${q.amount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePayment(q.quarter)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isScheduled
                          ? 'bg-lime-300 text-pine-900 border border-lime-400 hover:bg-lime-400'
                          : 'bg-pine-700 hover:bg-pine-800 text-white'
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

            <div className="bg-sage-50 p-3 rounded-2xl border border-sage-200 text-[11px] text-sage-700 flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-pine-700 shrink-0" />
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
