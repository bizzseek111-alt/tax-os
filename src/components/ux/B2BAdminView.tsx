import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Sliders, 
  Palette, 
  Key, 
  CheckCircle2, 
  Check, 
  CreditCard,
  FileText
} from 'lucide-react';

export function B2BAdminView() {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'POLICIES' | 'INTEGRATIONS'>('POLICIES');
  const [requireSeniorReviewAbove, setRequireSeniorReviewAbove] = useState('250000');
  const [forceMultiStateReview, setForceMultiStateReview] = useState(true);
  const [policiesSaved, setPoliciesSaved] = useState(false);

  const handleSavePolicies = () => {
    setPoliciesSaved(true);
    setTimeout(() => setPoliciesSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Firm Administration — Apex Tax Partners LLP
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                IRS Authorized E-File Provider (EFIN #648291)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage firm credentials, team reviewer authorizations, custom review policies, and client white-labeling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('POLICIES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'POLICIES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Review Policies
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'PROFILE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Firm Profile & Team
          </button>
          <button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'INTEGRATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            API & Keys
          </button>
        </div>
      </div>

      {policiesSaved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Firm review policies updated successfully! Applied to all incoming 2026 tax cases.</span>
        </div>
      )}

      {/* Main Content Pane */}
      {activeTab === 'POLICIES' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Deterministic Review & Escalation Rules</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure when Autonomous Tax OS must halt automated workflow and mandate senior CPA review.
              </p>
            </div>

            <button
              onClick={handleSavePolicies}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
            >
              Save Policy Rules
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200">High-Revenue Schedule C Threshold</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandates senior CPA sign-off if gross sole-proprietor revenue exceeds this threshold.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-xs">$</span>
                <input
                  type="text"
                  value={requireSeniorReviewAbove}
                  onChange={(e) => setRequireSeniorReviewAbove(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs text-right"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multi-State Allocation Mandatory Review</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Always require licensed CPA inspection if client reports income sourced in 2 or more states (e.g. NY + NJ).
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceMultiStateReview}
                  onChange={(e) => setForceMultiStateReview(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
                <span className="text-xs text-slate-300 font-semibold">{forceMultiStateReview ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Licensed Preparers</span>
              <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">18 Staff</span>
              <span className="text-[10px] text-slate-500">12 CPAs • 6 Enrolled Agents</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Enterprise Returns</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">1,420 / 2,500</span>
              <span className="text-[10px] text-emerald-400">1,080 remaining in quota</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Client Portal Branding</span>
              <span className="text-xl font-bold text-slate-100 mt-1 block">Apex White-Label</span>
              <span className="text-[10px] text-blue-400">portal.apextax.com</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'INTEGRATIONS' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" />
            <span>Firm API Credentials & Webhook Endpoints</span>
          </h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
            <div className="text-slate-400">Production Public Key:</div>
            <div className="text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 truncate">
              pk_live_apex_994827103819203810293
            </div>
            <div className="text-slate-400 pt-2">Webhook URL (Return Acceptance):</div>
            <div className="text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 truncate">
              https://api.apextax.com/v1/tax-os/webhooks/filing-status
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
