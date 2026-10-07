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
  Building,
  Save,
  RotateCcw
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
  incomeSummary: string;
  evidenceSummary: string;
  federalDetails: {
    title: string;
    description: string;
    citation: string;
    defaultDeductible: number;
    defaultDisallowed: number;
  };
  stateDetails: {
    title: string;
    description: string;
    citation: string;
  };
}

export function TaxProfessionalView() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-101');
  const [cpaNotes, setCpaNotes] = useState('');
  const [overrideActive, setOverrideActive] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState('710.00');
  const [savedOverrides, setSavedOverrides] = useState<Record<string, { amount: string; note: string }>>({});
  const [signedCases, setSignedCases] = useState<Record<string, boolean>>({});
  const [escalatedCases, setEscalatedCases] = useState<Record<string, boolean>>({});

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
      status: 'READY_FOR_REVIEW',
      incomeSummary: 'Reconciled $92,000 consulting 1099-NEC + $56,200 W-2. Zero duplicate deposits detected.',
      evidenceSummary: '142 of 144 Schedule C expenses matched to verified receipts (98.4% documentary health).',
      federalDetails: {
        title: 'Client Meals vs Travel Expense ($1,420.00 Total)',
        description: 'AI identified $1,420 in restaurant charges during client trip to Chicago. Under IRC § 274(n), business meals are subject to 50% statutory disallowance. Deterministic engine allocated $710.00 deductible and $710.00 non-deductible.',
        citation: '26 U.S.C. § 274(n)',
        defaultDeductible: 710,
        defaultDisallowed: 710
      },
      stateDetails: {
        title: 'California Schedule CA HSA Addition & Sec 179 Cap',
        description: 'Federal HSA deduction of $4,150 added back to California taxable income under Cal. RTC § 17215.4. Section 179 depreciation capped at $25,000 state limit under Cal. RTC § 17255.',
        citation: 'Cal. RTC § 17215.4 & § 17255'
      }
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
      status: 'HIGH_RISK',
      incomeSummary: 'Reconciled $165,000 W-2 wages from Manhattan employer. 42 telecommuting days identified.',
      evidenceSummary: '96.2% documentary substantiation. Telecommuting work logs verified.',
      federalDetails: {
        title: 'Multi-State Telecommuting Wage Sourcing Allocation',
        description: 'Client performed remote engineering services from Jersey City apartment for NYC employer. Requires statutory sourcing analysis.',
        citation: '26 U.S.C. § 61',
        defaultDeductible: 165000,
        defaultDisallowed: 0
      },
      stateDetails: {
        title: 'New York Convenience of Employer vs NJ Resident Credit',
        description: 'New York asserts full sovereign taxing jurisdiction under 20 NYCRR § 131.18 convenience of the employer rule. Clashes with New Jersey credit under N.J.S.A. § 54A:4-1. Potential $3,450 double taxation exposure without disclosure statement.',
        citation: '20 NYCRR § 131.18 vs N.J.S.A. § 54A:4-1'
      }
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
      status: 'READY_FOR_REVIEW',
      incomeSummary: 'Reconciled $1,250,000 gross revenues. Deduplicated merchant payment settlement accounts.',
      evidenceSummary: '99.5% receipt substantiation. Verified cloud infrastructure and equipment invoices.',
      federalDetails: {
        title: 'Qualified Business Income (QBI) High-Earner Phase-out',
        description: 'Taxable income exceeds threshold ($197,200). Deterministic engine verified W-2 wage / UBIA limitation under IRC § 199A(b)(2).',
        citation: '26 U.S.C. § 199A',
        defaultDeductible: 0,
        defaultDisallowed: 0
      },
      stateDetails: {
        title: 'Massachusetts 4% Fair Share Surtax Calculation',
        description: 'Taxable income exceeds the statutory threshold of $1,053,750 (2026 inflation indexed). Deterministic engine applied the constitutional 4% surtax on $196,250 excess income ($7,850 surtax).',
        citation: 'Mass. Gen. Laws ch. 62, § 4(d)'
      }
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
      status: 'BLOCKED',
      incomeSummary: 'Ingested $50,000 Schedule C consulting and $80,000 pension 1099-R. Awaiting client confirmation of business mileage log.',
      evidenceSummary: '82.1% receipts verified. 3 expenses pending client response in Tax Inbox.',
      federalDetails: {
        title: 'Pending Mileage Log Substantiation',
        description: '8,400 business miles claimed without contemporaneous mileage log. Flagged for preparer substantiation hold.',
        citation: '26 U.S.C. § 274(d)',
        defaultDeductible: 5628,
        defaultDisallowed: 0
      },
      stateDetails: {
        title: 'Illinois 100% Pension Subtraction Modification',
        description: 'Illinois exempts 100% of qualified employee retirement distributions under 35 ILCS 5/203(a)(2)(F). $80,000 subtraction modification verified for Form IL-1040.',
        citation: '35 ILCS 5/203(a)(2)(F)'
      }
    }
  ];

  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const isCaseSigned = !!signedCases[currentCase.id];
  const isCaseEscalated = !!escalatedCases[currentCase.id];
  const activeOverride = savedOverrides[currentCase.id];

  const handleSaveOverride = () => {
    if (!cpaNotes.trim()) {
      alert("Please enter a mandatory CPA override justification note before saving.");
      return;
    }
    setSavedOverrides(prev => ({
      ...prev,
      [currentCase.id]: {
        amount: overrideAmount,
        note: cpaNotes
      }
    }));
    setOverrideActive(false);
  };

  const handleSignCase = () => {
    setSignedCases(prev => ({ ...prev, [currentCase.id]: true }));
  };

  const handleEscalateCase = () => {
    setEscalatedCases(prev => ({ ...prev, [currentCase.id]: true }));
    alert(`Case ${currentCase.id} (${currentCase.clientName}) successfully escalated to Tax Controversy Attorney for legal opinion.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Triage Statistics */}
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
              Tax Professional Workspace — CPA & EA Review
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200">
                PTIN #P01948291
              </span>
            </h2>
            <p className="text-xs text-sage-600 mt-0.5">
              Review exceptions first. Deterministic math and citation lineage are pre-verified.
            </p>
          </div>
        </div>

        {/* Triage Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-sage-50 border border-sage-200 text-center">
            <span className="text-sage-500 block text-[10px] uppercase font-bold">Assigned</span>
            <span className="font-extrabold text-sage-900 font-mono">{cases.length} Cases</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-lime-100 border border-lime-300 text-center">
            <span className="text-pine-900 block text-[10px] uppercase font-bold">Ready for Review</span>
            <span className="font-extrabold text-pine-900 font-mono">2 Cases</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-amber-800 block text-[10px] uppercase font-bold">Exceptions</span>
            <span className="font-extrabold text-amber-900 font-mono">6 Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Cases Triage Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Case Triage Queue</span>
            <span>Sorted by Risk</span>
          </div>

          <div className="space-y-2">
            {cases.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setOverrideActive(false);
                }}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedCaseId === c.id
                    ? 'bg-pine-50 border-pine-600 shadow-xs ring-1 ring-pine-600'
                    : 'bg-white border-sage-200 hover:border-sage-300 hover:bg-sage-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sage-900 truncate">{c.clientName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.riskRating === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    c.riskRating === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-lime-200 text-pine-900 border border-lime-300'
                  }`}>
                    {c.riskRating} RISK
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  {c.states.map((st) => (
                    <span key={st} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sage-100 text-sage-700 font-semibold">
                      {st}
                    </span>
                  ))}
                  {signedCases[c.id] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-200 text-pine-900 border border-lime-400">
                      SIGNED ✓
                    </span>
                  )}
                  {escalatedCases[c.id] && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-900 border border-pine-300">
                      ATTORNEY ⚖
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-sage-600 pt-2 border-t border-sage-200">
                  <span>Comp: <strong className="text-sage-900 font-mono">{c.completeness}%</strong></span>
                  <span>AI Conf: <strong className="text-pine-800 font-mono font-bold">{c.aiConfidence}%</strong></span>
                  <span className="text-amber-800 font-bold">{c.openExceptions} Exc</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Comprehensive AI REVIEW BRIEF */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-6">
            {/* Case Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sage-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-sage-900">
                    AI Review Brief — {currentCase.clientName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-700">
                    ID: {currentCase.id}
                  </span>
                </div>
                <p className="text-xs text-sage-600 mt-0.5">
                  Automated verification passed. {currentCase.openExceptions} exception(s) requiring professional determination.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSignCase}
                  disabled={isCaseSigned}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isCaseSigned
                      ? 'bg-pine-700 text-white cursor-default shadow-xs'
                      : 'bg-lime-400 hover:bg-lime-500 text-pine-900 shadow-xs'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isCaseSigned ? 'Return Signed (PTIN P01948291)' : 'Sign & Approve Return'}</span>
                </button>
              </div>
            </div>

            {/* AI Review Brief Dynamic Sections */}
            <div className="space-y-4">
              {/* Section 1: Income Reconciliation */}
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pine-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sage-900">
                      1. Income Reconciliation & Double-Counting Audit
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-200 text-pine-900 border border-lime-300">
                    PASSED (0 Duplicates)
                  </span>
                </div>
                <p className="text-xs text-sage-700 leading-relaxed">
                  {currentCase.incomeSummary}
                </p>
              </div>

              {/* Section 2: Evidence & Substantiation */}
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pine-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sage-900">
                      2. Documentary Evidence & Substantiation Health
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-200 text-pine-900 border border-lime-300">
                    PASSED
                  </span>
                </div>
                <p className="text-xs text-sage-700 leading-relaxed">
                  {currentCase.evidenceSummary}
                </p>
              </div>

              {/* Section 3: Federal Tax Positions & Material Exception */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      3. Federal Schedule C — Preparer Exception Item
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                    {activeOverride ? 'OVERRIDE SAVED' : 'ACTION REQUIRED'}
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="font-bold text-sage-900 flex items-center justify-between">
                    <span>{currentCase.federalDetails.title}</span>
                    <span className="font-mono text-pine-800">{currentCase.federalDetails.citation}</span>
                  </div>
                  <p className="text-sage-700 leading-relaxed">
                    {currentCase.federalDetails.description}
                  </p>

                  {/* If override saved, show confirmation card */}
                  {activeOverride && (
                    <div className="p-2.5 rounded-xl bg-lime-100 border border-lime-300 text-pine-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>CPA Override Active: ${activeOverride.amount} Deductible</span>
                      </div>
                      <p className="text-[11px] text-sage-700 italic">Workpaper Note: "{activeOverride.note}"</p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setOverrideActive(false);
                        setSavedOverrides(prev => {
                          const c = { ...prev };
                          delete c[currentCase.id];
                          return c;
                        });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs"
                    >
                      Confirm Default Allocation (${currentCase.federalDetails.defaultDeductible})
                    </button>
                    <button
                      onClick={() => setOverrideActive(!overrideActive)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sage-100 text-sage-800 text-xs font-semibold transition border border-sage-300 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{overrideActive ? 'Cancel Override' : 'Override Deduction Amount'}</span>
                    </button>
                  </div>

                  {overrideActive && (
                    <div className="mt-3 p-3.5 bg-sage-50 rounded-2xl border border-sage-300 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sage-700 font-semibold">New Deductible Amount: $</span>
                        <input
                          type="text"
                          value={overrideAmount}
                          onChange={(e) => setOverrideAmount(e.target.value)}
                          className="w-24 px-2 py-1 bg-white border border-sage-300 rounded-lg text-sage-900 font-mono text-xs font-bold focus:outline-none focus:border-pine-700"
                        />
                      </div>
                      <textarea
                        value={cpaNotes}
                        onChange={(e) => setCpaNotes(e.target.value)}
                        placeholder="Mandatory CPA override justification note (e.g. Client provided substantiation showing 100% company-wide employee event exception under IRC § 274(e)(4))..."
                        rows={2}
                        className="w-full p-2.5 bg-white border border-sage-300 rounded-xl text-sage-900 text-xs focus:outline-none focus:border-pine-700"
                      />
                      <button
                        onClick={handleSaveOverride}
                        className="px-3.5 py-1.5 bg-pine-700 hover:bg-pine-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>Save CPA Override & Audit Workpaper</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Multi-State Non-Conformity */}
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-pine-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sage-900">
                      4. State Non-Conformity & Allocation ({currentCase.states.join(' / ')})
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200">
                    {currentCase.stateDetails.citation}
                  </span>
                </div>
                <div className="text-xs font-bold text-sage-900">{currentCase.stateDetails.title}</div>
                <p className="text-xs text-sage-700 leading-relaxed">
                  {currentCase.stateDetails.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-sage-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-sage-600">
                <span className="font-mono font-semibold">Reviewer PTIN: P01948291</span>
                <span>•</span>
                <span>Workpapers Stored with Cryptographic Audit Digest</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleEscalateCase}
                  disabled={isCaseEscalated}
                  className={`px-3.5 py-2 rounded-2xl font-bold transition border flex items-center gap-1.5 ${
                    isCaseEscalated
                      ? 'bg-pine-100 text-pine-900 border-pine-300'
                      : 'bg-white hover:bg-sage-100 text-sage-800 border-sage-300'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCaseEscalated ? 'Escalated to Attorney ✓' : 'Escalate to Tax Attorney'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
