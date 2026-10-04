import React from 'react';
import { MOCK_INCOME_RETURN, MOCK_INCOME_TAX_CASE, MOCK_BUSINESS } from '../services/MockData';
import { 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  TrendingDown, 
  Layers, 
  UserCheck, 
  Clock 
} from 'lucide-react';

export const IncomeTaxView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Income Tax Workstation</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PRODUCTION STAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Federal Form 1120-S (S-Corporation), Multi-State Apportionment, Schedule K-1s & deduction optimization connected to the shared Tax Graph.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Tax Case ID:</span>
          <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            {MOCK_INCOME_TAX_CASE.id}
          </span>
        </div>
      </div>

      {/* Tax Case Header & Readiness Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{MOCK_BUSINESS.name}</span>
              <span className="text-xs font-mono text-slate-400">({MOCK_BUSINESS.fein})</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Form 1120-S • S-Corporation Federal Return • Due: April 15, 2027
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Readiness Score</span>
              <span className="text-xl font-black text-emerald-400">{MOCK_INCOME_TAX_CASE.readinessScore}% Ready</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              CPA REVIEW REQUIRED
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 mb-6">
          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${MOCK_INCOME_TAX_CASE.readinessScore}%` }} />
        </div>

        {/* 1120-S Financial Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="text-slate-400 font-sans">Gross Receipts / Sales</div>
            <div className="text-lg font-bold text-white mt-1">${MOCK_INCOME_RETURN.grossRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Line 1a of Form 1120-S</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="text-slate-400 font-sans">Cost of Goods Sold (COGS)</div>
            <div className="text-lg font-bold text-slate-300 mt-1">${MOCK_INCOME_RETURN.costOfGoodsSold.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Line 2 (Inventory & materials)</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="text-slate-400 font-sans">Total Deductions</div>
            <div className="text-lg font-bold text-blue-400 mt-1">${MOCK_INCOME_RETURN.totalDeductions.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Wages, Rent, Sec 179, R&D</div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <div className="text-slate-400 font-sans">Ordinary Business Income</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">${MOCK_INCOME_RETURN.netTaxableIncome.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1 font-sans">Passes through to Schedule K-1s</div>
          </div>
        </div>
      </div>

      {/* CROSS-DOMAIN DATA LINKAGE: Line 8 Wages linked to Payroll Domain */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Cross-Domain Tax Graph Integration: Line 8 Wage Deduction
            </h3>
            <p className="text-xs text-slate-400">
              Demonstrates that Income Tax accesses the aggregated wage expense computed in the Payroll Tax domain without exposing individual employee SSNs!
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
            Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1">Payroll Domain (Sum of Form 941s):</span>
            <div className="text-base font-bold text-white font-mono">$1,280,000.00</div>
            <span className="text-[11px] text-slate-500 block mt-1">4 Quarters total taxable wages</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1">Income Tax Deduction (Line 8):</span>
            <div className="text-base font-bold text-emerald-400 font-mono">$1,280,000.00</div>
            <span className="text-[11px] text-emerald-500 block mt-1">✓ Exact match to penny</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 block mb-1">Security Boundary Enforced:</span>
            <div className="text-xs font-semibold text-sky-400 mt-1">Aggregated Wages Only</div>
            <span className="text-[11px] text-slate-400 block mt-1">Employee SSNs & individual salaries excluded</span>
          </div>
        </div>
      </div>

      {/* CPA Review Dossier & Signoff Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-400" />
            Professional CPA Review & Signoff
          </h3>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800">
            Reviewer: Marcus Vance, CPA
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="font-semibold text-slate-200 block mb-2">Review Findings:</span>
            <ul className="space-y-1.5 text-slate-300">
              {MOCK_INCOME_RETURN.filing.professionalReview?.findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-amber-300">
              <strong>Open Item:</strong> {MOCK_INCOME_RETURN.filing.professionalReview?.recommendations[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
