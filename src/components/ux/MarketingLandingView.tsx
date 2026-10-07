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
        <div className="bg-white border border-sage-300 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
          <button
            onClick={() => setAudience('B2C_CONSUMER')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              audience === 'B2C_CONSUMER'
                ? 'bg-pine-700 text-white shadow-sm'
                : 'text-sage-600 hover:text-sage-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>For Freelancers & Creators (B2C)</span>
          </button>

          <button
            onClick={() => setAudience('B2B_FIRM')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              audience === 'B2B_FIRM'
                ? 'bg-pine-700 text-white shadow-sm'
                : 'text-sage-600 hover:text-sage-900'
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-lime-200 text-pine-900 border border-lime-300">
            <Sparkles className="w-3.5 h-3.5 text-pine-800" />
            <span>The AI-Native Tax Operating System</span>
          </div>

          {/* Headline Carousel Selector */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-sage-950 tracking-tight">
              {b2cHeadlines[selectedHeadlineIdx].title}
            </h1>
            <p className="text-base md:text-lg text-sage-600 max-w-2xl mx-auto font-normal">
              {b2cHeadlines[selectedHeadlineIdx].subtitle}
            </p>
          </div>

          {/* Headline Concept Buttons */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            <span className="text-[11px] text-sage-500 uppercase tracking-wider font-semibold mr-1">Headline Concept:</span>
            {b2cHeadlines.map((h, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHeadlineIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                  selectedHeadlineIdx === idx
                    ? 'bg-pine-700 border-pine-700 text-white'
                    : 'bg-white border-sage-300 text-sage-600 hover:text-sage-900 hover:border-sage-400'
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
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-lime-400 hover:bg-lime-500 text-pine-900 shadow-md transition flex items-center gap-2"
            >
              <span>Build My 2026 Tax Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartFiling}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 shadow-sm transition"
            >
              View Live Demo Return (Alex Rivera)
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-center gap-6 pt-6 text-xs text-sage-600 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Deterministic Math ($0.00 Drift)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Scale className="w-4 h-4 text-pine-700" />
              Every Line Item Grounded in Tax Law
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="w-4 h-4 text-pine-800" />
              AES-256 Zero-Trust PII Isolation
            </span>
          </div>
        </div>
      ) : (
        /* B2B Firm Positioning Hero */
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-lime-200 text-pine-900 border border-lime-300">
            <Building2 className="w-3.5 h-3.5 text-pine-800" />
            <span>For Accounting & Advisory Firms</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-sage-950 tracking-tight">
            “Let AI prepare the work. <br />
            <span className="text-pine-700">
              Your team reviews what matters.
            </span>”
          </h1>
          <p className="text-base md:text-lg text-sage-600 max-w-2xl mx-auto font-normal">
            Eliminate document hunting, data entry, and manual Schedule C reconciliations. Give your CPAs exception-based review briefs with 1-click workpaper audit trails.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={onSwitchToPro}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-lime-400 hover:bg-lime-500 text-pine-900 shadow-md transition flex items-center gap-2"
            >
              <span>Explore CPA Review Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-left">
            <div className="bg-white border border-sage-300 p-4 rounded-2xl shadow-sm">
              <div className="text-xl font-bold text-sage-950">10x</div>
              <div className="text-xs text-sage-600 mt-1 font-medium">Review Capacity Per Preparer</div>
            </div>
            <div className="bg-white border border-sage-300 p-4 rounded-2xl shadow-sm">
              <div className="text-xl font-bold text-emerald-600">&le; 3</div>
              <div className="text-xs text-sage-600 mt-1 font-medium">Avg Questions to File (QtF)</div>
            </div>
            <div className="bg-white border border-sage-300 p-4 rounded-2xl shadow-sm">
              <div className="text-xl font-bold text-pine-800">100%</div>
              <div className="text-xs text-sage-600 mt-1 font-medium">Provable Workpaper Lineage</div>
            </div>
            <div className="bg-white border border-sage-300 p-4 rounded-2xl shadow-sm">
              <div className="text-xl font-bold text-pine-800">5 States</div>
              <div className="text-xs text-sage-600 mt-1 font-medium">Sovereign Law Coverage</div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON MATRIX: Traditional Software vs. Autonomous Tax OS */}
      <div className="max-w-5xl mx-auto bg-white border border-sage-300 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-sage-950">Why Autonomous Tax OS Changes Everything</h2>
          <p className="text-xs text-sage-600 mt-1 font-medium">
            Compare the outdated interview questionnaire experience against autonomous intelligence.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-sage-200 text-sage-600 font-semibold">
                <th className="py-4 px-4 w-1/3">Capability</th>
                <th className="py-4 px-4 w-1/3 text-rose-700 bg-rose-50/60 rounded-t-2xl font-bold">
                  Traditional Tax Software (TurboTax / TaxAct)
                </th>
                <th className="py-4 px-4 w-1/3 text-pine-900 bg-sage-100/70 rounded-t-2xl font-bold">
                  Autonomous Tax OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-200 text-sage-700">
              <tr>
                <td className="py-4 px-4 font-semibold text-sage-950">User Interaction Model</td>
                <td className="py-4 px-4 text-rose-800 bg-rose-50/30">
                  <div className="flex items-center gap-1.5 font-medium">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>50+ screen questionnaire wizard (“Step 28”)</span>
                  </div>
                </td>
                <td className="py-4 px-4 bg-sage-50/60 font-semibold text-pine-950">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Zero forms; TaxDrop + Tax Inbox exception cards</span>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-sage-950">Questions Required to File</td>
                <td className="py-4 px-4 text-sage-600 bg-rose-50/30">
                  <span>35 to 80 interrogative screens</span>
                </td>
                <td className="py-4 px-4 bg-sage-50/60 font-bold text-emerald-700">
                  <span>Average &le; 3 questions (QtF = 1.20)</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-sage-950">Math & Calculation Integrity</td>
                <td className="py-4 px-4 text-sage-600 bg-rose-50/30">
                  <span>Black-box engine with zero click-through explanations</span>
                </td>
                <td className="py-4 px-4 bg-sage-50/60 font-bold text-pine-800">
                  <span>“Prove This Number” cryptographic DAG provenance</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-sage-950">Multi-Jurisdiction Sourcing</td>
                <td className="py-4 px-4 text-sage-600 bg-rose-50/30">
                  <span>Manual user apportionment entry with frequent double-tax</span>
                </td>
                <td className="py-4 px-4 bg-sage-50/60 font-bold text-pine-800">
                  <span>Automated nexus detection & sovereign 5-state packs</span>
                </td>
              </tr>

              <tr>
                <td className="py-4 px-4 font-semibold text-sage-950">Professional Review</td>
                <td className="py-4 px-4 text-sage-600 bg-rose-50/30">
                  <span>Expensive $250+ add-on duplicate screen share</span>
                </td>
                <td className="py-4 px-4 bg-sage-50/60 font-bold text-pine-800">
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
