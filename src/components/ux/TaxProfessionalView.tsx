import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Edit3, 
  Scale, 
  FileText,
  BadgeAlert,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  Building
} from 'lucide-react';

interface CaseTriageItem {
  id: string;
  clientName: string;
  states: string[];
  completeness: number;
  aiConfidence: number;
  openExceptions: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  status: 'READY_FOR_REVIEW' | 'BLOCKED' | 'HIGH_RISK' | 'FILED';
}

export function TaxProfessionalView() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-101');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [cpaNotes, setCpaNotes] = useState('');
  const [positionApproved, setPositionApproved] = useState(false);
  const [overrideActive, setOverrideActive] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState('710.00');

  const cases: CaseTriageItem[] = [
    {
      id: 'case-101',
      clientName: 'Alex Rivera (Sole Prop & W-2)',
      states: ['US-FED', 'US-CA'],
      completeness: 92,
      aiConfidence: 98,
      openExceptions: 1,
      riskRating: 'LOW',
      deadline: 'April 15, 2027',
      status: 'READY_FOR_REVIEW'
    },
    {
      id: 'case-102',
      clientName: 'Elena Rostova (Remote Tech Consultant)',
      states: ['US-FED', 'US-NY', 'US-NJ'],
      completeness: 88,
      aiConfidence: 89,
      openExceptions: 2,
      riskRating: 'HIGH',
      deadline: 'April 15, 2027',
      status: 'HIGH_RISK'
    },
    {
      id: 'case-103',
      clientName: 'Marcus Vance (Single-Member LLC)',
      states: ['US-FED', 'US-MA'],
      completeness: 98,
      aiConfidence: 99,
      openExceptions: 0,
      riskRating: 'LOW',
      deadline: 'April 15, 2027',
      status: 'READY_FOR_REVIEW'
    },
    {
      id: 'case-104',
      clientName: 'David K. (Freelance Architect)',
      states: ['US-FED', 'US-IL'],
      completeness: 64,
      aiConfidence: 84,
      openExceptions: 3,
      riskRating: 'MEDIUM',
      deadline: 'April 15, 2027',
      status: 'BLOCKED'
    }
  ];

  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Statistics */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tax Professional Workspace — CPA & EA Review
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                PTIN #P01948291
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Review exceptions first. Deterministic math and citation lineage are pre-verified.
            </p>
          </div>
        </div>

        {/* Triage Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Assigned</span>
            <span className="font-bold text-slate-100 font-mono">14 Cases</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-emerald-400 block text-[10px] uppercase">Ready for Review</span>
            <span className="font-bold text-emerald-300 font-mono">8 Cases</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-amber-400 block text-[10px] uppercase">Exceptions</span>
            <span className="font-bold text-amber-300 font-mono">3 Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Cases Triage Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Case Triage Queue</span>
            <span>Sorted by Risk</span>
          </div>

          <div className="space-y-2">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedCaseId === c.id
                    ? 'bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 truncate">{c.clientName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    c.riskRating === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    c.riskRating === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {c.riskRating} RISK
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  {c.states.map((st) => (
                    <span key={st} className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {st}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Comp: <strong className="text-slate-200 font-mono">{c.completeness}%</strong></span>
                  <span>AI Conf: <strong className="text-emerald-400 font-mono">{c.aiConfidence}%</strong></span>
                  <span className="text-amber-400 font-semibold">{c.openExceptions} Exc</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Comprehensive AI REVIEW BRIEF */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Case Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-100">
                    AI Review Brief — {currentCase.clientName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    ID: {currentCase.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated reconciliation passed 142 items. 1 material exception flagged for preparer determination.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPositionApproved(true)}
                  disabled={positionApproved}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    positionApproved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{positionApproved ? 'Return Signed & Approved' : 'Sign & Approve Return'}</span>
                </button>
              </div>
            </div>

            {/* AI Review Brief Sections */}
            <div className="space-y-4">
              {/* Section 1: Income Reconciliation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      1. Income Reconciliation & Double-Counting Audit
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PASSED (0 Duplicates)
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cross-matched 1099-NEC ($92,000), 1099-DIV ($3,840), and bank deposits ($108,240). Detected and safely eliminated $12,400 in personal checking transfers to prevent double-counting gross income.
                </p>
              </div>

              {/* Section 2: Evidence & Substantiation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      2. Documentary Evidence & Substantiation Health
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PASSED (98.4% Documented)
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  37 documents ingested and cryptographically fingerprinted in CAS vault. 142 of 144 Schedule C expense line items have corresponding receipt OCR parses. Zero ungrounded inferences.
                </p>
              </div>

              {/* Section 3: Federal Tax Positions & Material Exception */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      3. Federal Schedule C — Preparer Exception Flagged
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    ACTION REQUIRED
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Client Meals vs Travel Expense ($1,420.00 Total)</span>
                    <span className="font-mono text-purple-400">26 U.S.C. § 274(n)</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    AI identified $1,420 in restaurant charges during client trip to Chicago. 
                    Under IRC § 274(n), business meals are subject to a 50% statutory disallowance.
                    Deterministic engine allocated <strong className="text-slate-200">$710.00 deductible</strong> and <strong className="text-slate-200">$710.00 non-deductible</strong>.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOverrideActive(false)}
                      className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                    >
                      Confirm 50% Disallowance ($710.00)
                    </button>
                    <button
                      onClick={() => setOverrideActive(!overrideActive)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700"
                    >
                      Override Deduction Amount
                    </button>
                  </div>

                  {overrideActive && (
                    <div className="mt-3 p-3 bg-slate-900 rounded border border-slate-700 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">New Deductible Amount: $</span>
                        <input
                          type="text"
                          value={overrideAmount}
                          onChange={(e) => setOverrideAmount(e.target.value)}
                          className="w-24 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 font-mono text-xs"
                        />
                      </div>
                      <textarea
                        value={cpaNotes}
                        onChange={(e) => setCpaNotes(e.target.value)}
                        placeholder="Mandatory CPA override justification note (e.g. Client provided substantiation showing 100% company-wide employee picnic exception under IRC § 274(e)(4))..."
                        rows={2}
                        className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Multi-State Non-Conformity */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      4. State Non-Conformity Adjustments (California)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Cal. RTC § 17215.4 Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  California Schedule CA addition modification of +$4,150 applied for Federal HSA contributions. Section 179 depreciation capped at state limit ($25,000) under Cal. RTC § 17255.
                </p>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="font-mono">Reviewer PTIN: P01948291</span>
                <span>•</span>
                <span>Workpapers Stored with Immutable Audit Hash</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert("Matter escalated to Tax Controversy Attorney for multi-state sourcing review.")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-semibold transition border border-amber-500/30 flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Escalate to Tax Attorney</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
