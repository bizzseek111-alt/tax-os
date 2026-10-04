import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  Scale, 
  Building2, 
  User, 
  Zap,
  Lock,
  Calculator,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MarketingLandingViewProps {
  onStartFiling: () => void;
  onOpenOnboarding: () => void;
  onSwitchToPro: () => void;
}

export function MarketingLandingView({ onStartFiling, onOpenOnboarding, onSwitchToPro }: MarketingLandingViewProps) {
  const [audience, setAudience] = useState<'B2C_CONSUMER' | 'B2B_FIRM'>('B2C_CONSUMER');
  const [selectedHeadlineIdx, setSelectedHeadlineIdx] = useState<number>(0);

  const b2cHeadlines = [
    {
      title: '“Your taxes. Already done.”',
      subtitle: 'Connect your accounts, drop whatever documents you have, and watch your 2026 return build itself in real time.'
    },
    {
      title: '“Drop your documents. We’ll take it from here.”',
      subtitle: 'No 50-step questionnaires. Our multimodal agents classify, reconcile, and prove every deduction automatically.'
    },
    {
      title: '“Tax filing without doing taxes.”',
      subtitle: 'Deterministic zero-hallucination tax math, backed by licensed CPA review and primary statutory citations.'
    },
    {
      title: '“Your AI tax team.”',
      subtitle: '209 specialized autonomous agents working synchronously across Federal and 5 sovereign states.'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Top Audience Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg">
          <button
            onClick={() => setAudience('B2C_CONSUMER')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              audience === 'B2C_CONSUMER'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>For Freelancers & Creators (B2C)</span>
          </button>

          <button
            onClick={() => setAudience('B2B_FIRM')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              audience === 'B2B_FIRM'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>For Tax & Accounting Practices (B2B)</span>
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      {audience === 'B2C_CONSUMER' ? (
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>The AI-Native Tax Operating System</span>
          </div>

          {/* Headline Carousel Selector */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              {b2cHeadlines[selectedHeadlineIdx].title}
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
              {b2cHeadlines[selectedHeadlineIdx].subtitle}
            </p>
          </div>

          {/* Headline Concept Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">Headline Concept:</span>
            {b2cHeadlines.map((h, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHeadlineIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                  selectedHeadlineIdx === idx
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Concept {idx + 1}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenOnboarding}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition flex items-center gap-2"
            >
              <span>Build My 2026 Tax Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartFiling}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
            >
              View Live Demo Return (Alex Rivera)
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Deterministic Math ($0.00 Drift)
            </span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-400" />
              Every Line Item Grounded in Tax Law
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" />
              AES-256 Zero-Trust PII Isolation
            </span>
          </div>
        </div>
      ) : (
        /* B2B Firm Positioning Hero */
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>For Accounting & Advisory Firms</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            “Let AI prepare the work. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              Your team reviews what matters.
            </span>”
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Eliminate document hunting, data entry, and manual Schedule C reconciliations. Give your CPAs exception-based review briefs with 1-click workpaper audit trails.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onSwitchToPro}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <span>Explore CPA Review Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-left">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xl font-bold text-white">10x</div>
              <div className="text-xs text-slate-400 mt-1">Review Capacity Per Preparer</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xl font-bold text-emerald-400">&le; 3</div>
              <div className="text-xs text-slate-400 mt-1">Avg Questions to File (QtF)</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xl font-bold text-indigo-300">100%</div>
              <div className="text-xs text-slate-400 mt-1">Provable Workpaper Lineage</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-xl font-bold text-purple-300">5 States</div>
              <div className="text-xs text-slate-400 mt-1">Sovereign Law Coverage</div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MATRIX: Traditional Software vs. Autonomous Tax OS */}
      <div className="max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Why Autonomous Tax OS Changes Everything</h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare the outdated interview questionnaire experience against autonomous intelligence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-4 px-4 w-1/3">Capability</th>
                <th className="py-4 px-4 w-1/3 text-rose-400 bg-rose-950/20 rounded-t-xl">
                  Traditional Tax Software (TurboTax / TaxAct)
                </th>
                <th className="py-4 px-4 w-1/3 text-blue-400 bg-blue-950/30 rounded-t-xl">
                  Autonomous Tax OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-4 px-4 font-semibold text-white">User Interaction Model</td>
                <td className="py-4 px-4 text-slate-400 bg-rose-950/10">
                  <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>50+ screen questionnaire wizard (“Step 28”)</span>
                  </div>
                </td>
                <td className="py-4 px-4 bg-blue-950/20 font-medium text-white">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Zero forms; TaxDrop + Tax Inbox exception cards</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-white">Questions Required to File</td>
                <td className="py-4 px-4 text-slate-400 bg-rose-950/10">
                  <span>35 to 80 interrogative screens</span>
                </td>
                <td className="py-4 px-4 bg-blue-950/20 font-semibold text-emerald-400">
                  <span>Average &le; 3 questions (QtF = 1.20)</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-white">Math & Calculation Integrity</td>
                <td className="py-4 px-4 text-slate-400 bg-rose-950/10">
                  <span>Black-box engine with zero click-through explanations</span>
                </td>
                <td className="py-4 px-4 bg-blue-950/20 font-semibold text-blue-300">
                  <span>“Prove This Number” cryptographic DAG provenance</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-white">Multi-Jurisdiction Sourcing</td>
                <td className="py-4 px-4 text-slate-400 bg-rose-950/10">
                  <span>Manual user apportionment entry with frequent double-tax</span>
                </td>
                <td className="py-4 px-4 bg-blue-950/20 font-semibold text-indigo-300">
                  <span>Automated nexus detection & sovereign 5-state packs</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-white">Professional Review</td>
                <td className="py-4 px-4 text-slate-400 bg-rose-950/10">
                  <span>Expensive $250+ add-on duplicate screen share</span>
                </td>
                <td className="py-4 px-4 bg-blue-950/20 font-semibold text-purple-300">
                  <span>Native EA/CPA exception review briefs & PTIN e-file</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
