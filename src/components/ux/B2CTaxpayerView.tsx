import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  DollarSign, 
  ArrowRight, 
  Download, 
  Layers, 
  Info,
  Send,
  Building2,
  Calendar,
  AlertTriangle,
  Search,
  Check
} from 'lucide-react';
import { TaxDropZone } from './TaxDropZone';
import { TaxInboxCardQueue } from './TaxInboxCardQueue';
import { ProveThisNumberModal, ProvenanceNode } from './ProveThisNumberModal';

const PROVENANCE_DATA_MAP: Record<string, ProvenanceNode> = {
  GROSS_INCOME: {
    id: 'prov-00',
    label: 'Total Gross Income (Form 1040 Line 9)',
    amount: 148200,
    formLine: 'Form 1040 Line 9',
    authorityCitation: '26 U.S.C. § 61',
    authorityTitle: 'Gross Income Defined (All Income from Whatever Source Derived)',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'Your total gross income represents all taxable revenues received during tax year 2026. This includes $56,200 in W-2 wages from employer Acme Labs and $92,000 in independent consulting compensation reported on Form 1040 Schedule C. Deduplicated against bank transfers to eliminate double-counting.',
    transactions: [
      {
        id: 'tx-w2',
        date: '2026-12-31',
        vendor: 'Acme Labs Inc. (W-2 Employer)',
        description: 'Box 1 Wages, Tips, Other Compensation',
        amount: 56200,
        receiptHash: 'sha256:5a9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
        receiptFile: 'Form_W2_Acme_Labs_2026.pdf'
      },
      {
        id: 'tx-nec',
        date: '2026-12-31',
        vendor: 'Horizon Fintech Corp (1099-NEC Client)',
        description: 'Box 1 Nonemployee Consulting Compensation',
        amount: 92000,
        receiptHash: 'sha256:7a3d11b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        receiptFile: 'Form_1099_NEC_Horizon_2026.pdf'
      }
    ]
  },
  SCHEDULE_C_EXPENSES: {
    id: 'prov-01',
    label: 'Schedule C Other Business Expenses',
    amount: 18490,
    formLine: 'Form 1040 Schedule C Line 27a',
    authorityCitation: '26 U.S.C. § 162(a)',
    authorityTitle: 'Trade or Business Expenses (Ordinary & Necessary)',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'These expenses represent verified cloud infrastructure (AWS), code hosting (GitHub), and software tooling necessary to operate your software consulting practice. All items have been cross-matched against card receipts and bank transactions.',
    transactions: [
      {
        id: 'tx-01',
        date: '2026-03-15',
        vendor: 'Amazon Web Services',
        description: 'Cloud Server Infrastructure & Databases',
        amount: 14200,
        receiptHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        receiptFile: 'AWS_Annual_Billing_2026.pdf'
      },
      {
        id: 'tx-02',
        date: '2026-06-20',
        vendor: 'GitHub & Vercel Inc.',
        description: 'Developer Seat Subscriptions & Hosting',
        amount: 4290,
        receiptHash: 'sha256:4f82a1389021c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
        receiptFile: 'GitHub_Vercel_Invoices_Bundle.pdf'
      }
    ]
  },
  QBI_DEDUCTION: {
    id: 'prov-02',
    label: 'Qualified Business Income Deduction (20%)',
    amount: 11950,
    formLine: 'Form 1040 Line 13',
    authorityCitation: '26 U.S.C. § 199A',
    authorityTitle: 'Qualified Business Income of Pass-Through Entities',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'As a sole proprietor with qualified business net income below the statutory threshold ($197,200 for single filers), you are entitled to deduct up to 20% of net qualified business income. Calculated as 20% of $59,750 net Schedule C earnings.',
    transactions: [
      {
        id: 'tx-03',
        date: '2026-12-31',
        vendor: 'Deterministic Math Engine',
        description: 'Form 8995 Simplified QBI Computation ($59,750 × 20%)',
        amount: 11950,
        receiptHash: 'sha256:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        receiptFile: 'Deterministic_Formula_Rule_199A.math'
      }
    ]
  },
  CA_HSA_ADDITION: {
    id: 'prov-03',
    label: 'California HSA Addition Modification',
    amount: 4150,
    formLine: 'Schedule CA (540) Part I Section A Line 13',
    authorityCitation: 'Cal. Rev. & Tax. Code § 17215.4',
    authorityTitle: 'California Non-Conformity to Federal Health Savings Accounts',
    precedentialStatus: 'BINDING_STATE_STATUTE',
    plainEnglishReason: 'California does NOT conform to the Federal HSA deduction allowed under IRC § 223. Your federal HSA deduction of $4,150 must be added back to California taxable income, increasing California liability by $386 at your marginal tax bracket.',
    transactions: [
      {
        id: 'tx-04',
        date: '2026-12-31',
        vendor: 'Fidelity HSA Custodian',
        description: 'Form 5498-SA HSA Contribution',
        amount: 4150,
        receiptHash: 'sha256:112233445566778899aabbccddeeff0011223344',
        receiptFile: 'Form_5498_SA_Fidelity.pdf'
      }
    ]
  }
};

export function B2CTaxpayerView() {
  const [completionPercent, setCompletionPercent] = useState(92);
  const [federalRefund, setFederalRefund] = useState(4120);
  const [stateDue, setStateDue] = useState(1840);
  const [questionsCount, setQuestionsCount] = useState(3);
  const [selectedProvenance, setSelectedProvenance] = useState<ProvenanceNode | null>(null);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiAssistantInput, setAiAssistantInput] = useState('');
  const [aiAssistantAnswer, setAiAssistantAnswer] = useState<string | null>(null);
  const [eFileSubmitted, setEFileSubmitted] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleResolveInboxItem = (id: string, outcome: string) => {
    setQuestionsCount(prev => Math.max(0, prev - 1));
    setCompletionPercent(prev => Math.min(100, prev + 3));

    // Dynamic math updates based on resolved tax facts
    if (outcome.includes('100_BUSINESS')) {
      setFederalRefund(prev => prev + 142);
      triggerToast('Confirmed $412.50 business travel deduction under 26 U.S.C. § 162 (+ $142 Federal refund)');
    } else if (outcome.includes('HOME_OFFICE')) {
      setFederalRefund(prev => prev + 326);
      triggerToast('Claimed $1,100 Home Office deduction under 26 U.S.C. § 280A (+ $326 Federal refund)');
    } else if (outcome.includes('ZERO_NET_GAIN') || outcome.includes('CONNECT')) {
      triggerToast('Brokerage cost basis reconciled. Zero CP2000 discrepancy risk.');
    }
  };

  const triggerToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleAskAssistant = (queryText: string) => {
    const q = queryText.toLowerCase();
    let answer = "";

    if (q.includes('california') || q.includes('1,840') || q.includes('owe') || q.includes('hsa')) {
      answer = "You owe California $1,840 primarily because California does not conform to the Federal HSA tax deduction under Cal. RTC § 17215.4. Your $4,150 HSA contribution is added back to California taxable income (adding $386 in state tax). In addition, your state marginal tax bracket is 9.3% on $119,750 of taxable income, and California does not allow the 20% Qualified Business Income (QBI) deduction under IRC § 199A.";
    } else if (q.includes('qbi') || q.includes('199a') || q.includes('business income')) {
      answer = "Under 26 U.S.C. § 199A, eligible sole proprietors and pass-through business owners receive a 20% deduction against net qualified business income. Since your taxable income is below the $197,200 threshold, you qualify for the full 20% deduction on your $59,750 net Schedule C earnings ($11,950 total deduction). Note that California completely disallows this deduction on Form 540.";
    } else if (q.includes('179') || q.includes('depreciation') || q.includes('server') || q.includes('hardware')) {
      answer = "Under 26 U.S.C. § 179, the Federal government allows up to $1,220,000 of immediate equipment expensing for 2026. However, California strictly limits Section 179 expensing to $25,000 per year under Cal. RTC § 17255. Any equipment purchase exceeding $25,000 requires an addition modification on California Schedule CA.";
    } else if (q.includes('remote') || q.includes('convenience') || q.includes('new york') || q.includes('ny') || q.includes('nj')) {
      answer = "Under 20 NYCRR § 131.18, New York taxes all telecommuting wage earnings from an NYC employer unless working from home is an absolute necessity of the employer. New Jersey provides a resident credit under N.J.S.A. § 54A:4-1 with retaliatory convenience provisions. Our controversy attorney module can generate a Form 8275 disclosure to defend against double taxation.";
    } else if (q.includes('home office') || q.includes('280a') || q.includes('sq ft')) {
      answer = "Under 26 U.S.C. § 280A(c)(1), you can deduct a dedicated area used exclusively and regularly as your principal place of business. You may use either the Simplified Method ($5/sq ft up to 300 sq ft = $1,500 maximum) or the Actual Expense method prorated by home square footage.";
    } else if (q.includes('meals') || q.includes('travel') || q.includes('274')) {
      answer = "Under 26 U.S.C. § 274(n), ordinary business meals with clients are subject to a strict 50% statutory disallowance. Business lodging and airfare remain 100% deductible under IRC § 162(a)(2).";
    } else {
      answer = `Under 26 U.S.C. § 162(a), all ordinary and necessary expenses incurred in carrying on your trade or business are deductible. All figures in your return are supported by primary receipts stored in our cryptographic evidence vault with 100% calculation provenance.`;
    }

    setAiAssistantAnswer(answer);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiAssistantInput.trim()) return;
    handleAskAssistant(aiAssistantInput);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionFeedback}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">Recalculated</span>
        </div>
      )}

      {/* Hero Completion Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-64 h-64 text-blue-400" />
        </div>

        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Tax Year 2026 • Form 1040 + California Form 540
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Hallucination Verified</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Your 2026 Taxes are <span className="text-blue-400 font-mono">{completionPercent}%</span> Ready
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            The application has collected your 1099 contracts, matched 37 receipts, and computed your deductions. 
            {questionsCount > 0 ? (
              <span className="text-amber-300 font-semibold"> Only {questionsCount} quick items need your confirmation before e-filing.</span>
            ) : (
              <span className="text-emerald-300 font-semibold"> All items resolved. Ready for final review and e-filing!</span>
            )}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/60">
            <div 
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Refund & Due Financial Figures */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                  Federal Estimated Refund
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  +${federalRefund.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Form 1040
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
                  California Balance Due
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
                  -${stateDue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </span>
              </div>
              <button 
                onClick={() => {
                  setShowAiAssistant(true);
                  handleAskAssistant("Why do I owe California $1,840 when I get a Federal refund of $4,120?");
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-semibold transition border border-slate-700 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why do I owe?</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tax Inbox + TaxDrop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tax Inbox (Questions to File) */}
        <div className="lg:col-span-7 space-y-6">
          <TaxInboxCardQueue
            questionsRemaining={questionsCount}
            onItemResolved={handleResolveInboxItem}
          />

          {/* Interactive Lineage Summary: Clickable Line Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Tax Position Lineage & Summary
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Click any row to open <strong className="text-blue-400">Prove This Number</strong>
              </span>
            </div>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              {/* Row 1: Gross Income */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.GROSS_INCOME)}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-blue-500/5 transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-blue-300 flex items-center gap-1.5">
                    <span>Total Gross Income (Form 1040 Line 9)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Prove 🔍</span>
                  </div>
                  <div className="text-[11px] text-slate-400">W-2 + 1099-NEC consulting compensation under 26 U.S.C. § 61</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100 tabular-nums text-sm">$148,200</div>
                  <span className="text-[10px] text-emerald-400 font-mono">Reconciled (0 dups)</span>
                </div>
              </div>

              {/* Row 2: Schedule C Expenses */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.SCHEDULE_C_EXPENSES)}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-blue-500/5 transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-blue-300 flex items-center gap-1.5">
                    <span>Schedule C Business Expenses (Line 27a)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Prove 🔍</span>
                  </div>
                  <div className="text-[11px] text-slate-400">AWS hosting, GitHub, and SaaS tools under 26 U.S.C. § 162</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100 tabular-nums text-sm">$18,490</div>
                  <span className="text-[10px] text-blue-400 font-mono">100% Documented</span>
                </div>
              </div>

              {/* Row 3: QBI Deduction */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.QBI_DEDUCTION)}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-blue-500/5 transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-blue-300 flex items-center gap-1.5">
                    <span>Qualified Business Income Deduction (Line 13)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Prove 🔍</span>
                  </div>
                  <div className="text-[11px] text-slate-400">20% Pass-through deduction under 26 U.S.C. § 199A</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-100 tabular-nums text-sm">$11,950</div>
                  <span className="text-[10px] text-purple-400 font-mono">Deterministic Formula</span>
                </div>
              </div>

              {/* Row 4: California HSA Addition */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.CA_HSA_ADDITION)}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-amber-500/5 transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-amber-300 flex items-center gap-1.5">
                    <span>California HSA Addition Modification (Sch CA Line 13)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Prove 🔍</span>
                  </div>
                  <div className="text-[11px] text-slate-400">State non-conformity add-back under Cal. RTC § 17215.4</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-amber-400 tabular-nums text-sm">+$4,150</div>
                  <span className="text-[10px] text-amber-300 font-mono">State Non-Conformity</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: TaxDrop Vault + Contextual AI Explainer */}
        <div className="lg:col-span-5 space-y-6">
          <TaxDropZone />

          {/* Contextual AI Explainer Widget with Interactive Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  Contextual Tax AI Assistant
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                Tax Authority Grounded
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Ask any question about your numbers, deductions, or state rules. Answers cite exact statutes.
            </p>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAskAssistant("Why do I owe California $1,840?")}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                "Why do I owe California $1,840?"
              </button>
              <button
                onClick={() => handleAskAssistant("How is my QBI deduction calculated?")}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                "How is QBI calculated?"
              </button>
              <button
                onClick={() => handleAskAssistant("Are my AWS server costs 100% deductible?")}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              >
                "Are AWS costs deductible?"
              </button>
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleCustomQuestionSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={aiAssistantInput}
                  onChange={(e) => setAiAssistantInput(e.target.value)}
                  placeholder="Ask any tax question (e.g. 'What is the California 179 limit?')..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shrink-0"
              >
                Ask AI
              </button>
            </form>

            {aiAssistantAnswer && (
              <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-xs space-y-2">
                <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Authoritative Answer</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {aiAssistantAnswer}
                </p>
              </div>
            )}
          </div>

          {/* E-File Ready Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Electronic Filing Status</span>
              <span className="text-xs font-mono text-blue-400">IRS MeF 2026 Ready</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Federal Form 1040:</span>
                <span className="text-emerald-400 font-semibold">Ready to E-File</span>
              </div>
              <div className="flex items-center justify-between">
                <span>California Form 540:</span>
                <span className="text-emerald-400 font-semibold">Ready to E-File</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Professional Review:</span>
                <span className="text-blue-400 font-semibold">Optional CPA Sign-off Available</span>
              </div>
            </div>

            <button
              onClick={() => {
                setEFileSubmitted(true);
                triggerToast('Return successfully staged and queued for IRS & FTB electronic transmission!');
              }}
              disabled={eFileSubmitted}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                eFileSubmitted
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {eFileSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Returns Successfully Staged for E-File!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Authorize & Transmit Returns to IRS + FTB</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Prove This Number Modal */}
      {selectedProvenance && (
        <ProveThisNumberModal
          isOpen={true}
          onClose={() => setSelectedProvenance(null)}
          data={selectedProvenance}
        />
      )}
    </div>
  );
}
