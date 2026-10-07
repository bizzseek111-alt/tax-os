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
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
              Firm Administration — Apex Tax Partners LLP
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200">
                IRS Authorized E-File Provider (EFIN #648291)
              </span>
            </h2>
            <p className="text-xs text-sage-600 mt-0.5">
              Manage firm credentials, team reviewer authorizations, custom review policies, and client white-labeling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-sage-100 p-1 rounded-2xl border border-sage-200">
          <button
            onClick={() => setActiveTab('POLICIES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'POLICIES' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
            }`}
          >
            Review Policies
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'PROFILE' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
            }`}
          >
            Firm Profile & Team
          </button>
          <button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'INTEGRATIONS' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
            }`}
          >
            API & Keys
          </button>
        </div>
      </div>

      {policiesSaved && (
        <div className="p-3.5 rounded-2xl bg-lime-100 border border-lime-300 text-pine-900 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Firm review policies updated successfully! Applied to all incoming 2026 tax cases.</span>
        </div>
      )}

      {/* Main Content Pane */}
      {activeTab === 'POLICIES' && (
        <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-sage-200">
            <div>
              <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pine-700" />
                <span>Deterministic Review & Escalation Rules</span>
              </h3>
              <p className="text-xs text-sage-600 mt-0.5">
                Configure when Autonomous Tax OS must halt automated workflow and mandate senior CPA review.
              </p>
            </div>

            <button
              onClick={handleSavePolicies}
              className="px-5 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs"
            >
              Save Policy Rules
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-sage-900">High-Revenue Schedule C Threshold</h4>
                <p className="text-xs text-sage-600 mt-0.5">
                  Mandates senior CPA sign-off if gross sole-proprietor revenue exceeds this threshold.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sage-600 text-xs font-bold">$</span>
                <input
                  type="text"
                  value={requireSeniorReviewAbove}
                  onChange={(e) => setRequireSeniorReviewAbove(e.target.value)}
                  className="w-28 px-3 py-1.5 bg-white border border-sage-300 rounded-xl text-sage-900 font-mono font-bold text-xs text-right focus:outline-none focus:border-pine-700"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-sage-900">Multi-State Allocation Mandatory Review</h4>
                <p className="text-xs text-sage-600 mt-0.5">
                  Always require licensed CPA inspection if client reports income sourced in 2 or more states (e.g. NY + NJ).
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceMultiStateReview}
                  onChange={(e) => setForceMultiStateReview(e.target.checked)}
                  className="w-4 h-4 accent-pine-700 rounded"
                />
                <span className="text-xs text-sage-900 font-bold">{forceMultiStateReview ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Licensed Preparers</span>
              <span className="text-xl font-extrabold font-mono text-sage-950 mt-1 block">18 Staff</span>
              <span className="text-[10px] text-sage-600">12 CPAs • 6 Enrolled Agents</span>
            </div>

            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Enterprise Returns</span>
              <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">1,420 / 2,500</span>
              <span className="text-[10px] text-pine-800 font-semibold">1,080 remaining in quota</span>
            </div>

            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Client Portal Branding</span>
              <span className="text-xl font-extrabold font-mono text-sage-950 mt-1 block">Apex White-Label</span>
              <span className="text-[10px] text-pine-800 font-bold">portal.apextax.com</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'INTEGRATIONS' && (
        <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-pine-700" />
            <span>Firm API Credentials & Webhook Endpoints</span>
          </h3>
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 font-mono text-xs space-y-2">
            <div className="text-sage-600 font-sans font-medium">Production Public Key:</div>
            <div className="text-sage-900 bg-white p-2.5 rounded-xl border border-sage-200 truncate font-bold">
              pk_live_apex_994827103819203810293
            </div>
            <div className="text-sage-600 pt-2 font-sans font-medium">Webhook URL (Return Acceptance):</div>
            <div className="text-sage-900 bg-white p-2.5 rounded-xl border border-sage-200 truncate font-bold">
              https://api.apextax.com/v1/tax-os/webhooks/filing-status
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
