import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Building, 
  MapPin, 
  ShieldCheck, 
  X, 
  DollarSign, 
  FileCheck,
  Check,
  Zap
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [taxYear] = useState<number>(2026);
  const [taxpayerName, setTaxpayerName] = useState('Alex Rivera');
  const [filingStatus, setFilingStatus] = useState<'SINGLE' | 'MARRIED_JOINT' | 'HEAD_OF_HOUSEHOLD'>('SINGLE');
  const [selectedStates, setSelectedStates] = useState<string[]>(['US-CA']);
  const [incomeProfiles, setIncomeProfiles] = useState<string[]>(['W2', '1099_CONTRACTOR', 'SINGLE_MEMBER_LLC']);
  const [priorReturnImported, setPriorReturnImported] = useState(false);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  if (!isOpen) return null;

  const toggleState = (st: string) => {
    setSelectedStates(prev => 
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const toggleProfile = (p: string) => {
    setIncomeProfiles(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleFinish = () => {
    setIsBuilding(true);
    setTimeout(() => {
      setIsBuilding(false);
      onComplete();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-pine-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-sage-300 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-sage-400 hover:text-sage-700 p-2 rounded-full hover:bg-sage-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-pine-700' : i < step ? 'w-4 bg-lime-500' : 'w-4 bg-sage-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-sage-500">Step {step} of 4</span>
        </div>

        {/* STEP 1: Identity & Tax Year */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 1 • Identity Essentials</span>
              <h2 className="text-xl font-bold text-sage-950 mt-1">Let's set up your 2026 tax workspace</h2>
              <p className="text-xs text-sage-600 mt-1">
                We only ask what is legally mandatory to establish your tax profile.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-sage-700">Your Full Legal Name:</label>
                <input
                  type="text"
                  value={taxpayerName}
                  onChange={(e) => setTaxpayerName(e.target.value)}
                  className="w-full mt-1 bg-sage-50 border border-sage-300 rounded-xl px-3.5 py-2.5 text-xs text-sage-900 focus:outline-none focus:border-pine-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sage-700">Tax Year (Anchored):</label>
                <div className="mt-1 bg-sage-50 border border-sage-300 rounded-xl px-3.5 py-2 text-xs text-sage-800 font-mono">
                  {taxYear} Calendar Year Filing
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-sage-700">Filing Status:</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['SINGLE', 'MARRIED_JOINT', 'HEAD_OF_HOUSEHOLD'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilingStatus(status)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition border ${
                        filingStatus === status
                          ? 'bg-pine-700 border-pine-700 text-white font-bold'
                          : 'bg-white border-sage-300 text-sage-600 hover:text-sage-900'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Resident & Nexus States */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 2 • Jurisdiction Selection</span>
              <h2 className="text-xl font-bold text-sage-950 mt-1">Where did you live or earn in 2026?</h2>
              <p className="text-xs text-sage-600 mt-1">
                Select your resident state and any states where you performed services.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'US-CA', name: 'California (FTB)' },
                { id: 'US-NY', name: 'New York (DTF)' },
                { id: 'US-NJ', name: 'New Jersey (Div of Tax)' },
                { id: 'US-IL', name: 'Illinois (IDOR)' },
                { id: 'US-MA', name: 'Massachusetts (DOR)' }
              ].map((st) => {
                const isSelected = selectedStates.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleState(st.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-lime-100/70 border-pine-600 text-pine-950 font-bold'
                        : 'bg-white border-sage-300 text-sage-600 hover:text-sage-900 hover:border-sage-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{st.name}</div>
                      <div className="text-[10px] text-sage-500 font-mono">{st.id}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-pine-700" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Income Profile */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 3 • Income Profile</span>
              <h2 className="text-xl font-bold text-sage-950 mt-1">How do you earn income?</h2>
              <p className="text-xs text-sage-600 mt-1">
                Our AI agents will only configure deduction extractors matching your business profile.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { id: 'W2', label: 'W-2 Wage Earner (Full-time or part-time employment)' },
                { id: '1099_CONTRACTOR', label: '1099-NEC / Freelance Consulting (Independent professional)' },
                { id: 'CREATOR', label: 'Digital Creator / 1099-K (YouTube, Stripe, Patreon, Substack)' },
                { id: 'SINGLE_MEMBER_LLC', label: 'Single-Member LLC / Schedule C Business' }
              ].map((prof) => {
                const isSelected = incomeProfiles.includes(prof.id);
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => toggleProfile(prof.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-lime-100/70 border-pine-600 text-pine-950 font-bold'
                        : 'bg-white border-sage-300 text-sage-600 hover:text-sage-900 hover:border-sage-400'
                    }`}
                  >
                    <span className="text-xs font-medium">{prof.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-pine-700 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Import Prior Year & Account Link */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 4 • Accelerate With Instant Ingestion</span>
              <h2 className="text-xl font-bold text-sage-950 mt-1">Import prior return & connect accounts</h2>
              <p className="text-xs text-sage-600 mt-1">
                Drop your 2025 Form 1040 to auto-seed prior carryovers and depreciation schedules.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Prior Year PDF Upload Simulation */}
              <div
                onClick={() => setPriorReturnImported(!priorReturnImported)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  priorReturnImported
                    ? 'bg-lime-100/60 border-lime-500 text-pine-950'
                    : 'bg-white border-sage-300 hover:border-sage-400 text-sage-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sage-100 border border-sage-200">
                    <FileCheck className="w-5 h-5 text-pine-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">2025 Form 1040 (PDF)</div>
                    <div className="text-[11px] text-sage-500">
                      {priorReturnImported ? 'Uploaded • Carryovers extracted' : 'Click to simulate instant import'}
                    </div>
                  </div>
                </div>
                {priorReturnImported ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-lime-200 text-pine-900 font-bold">Imported</span>
                ) : (
                  <span className="text-xs text-pine-700 font-bold">Select PDF</span>
                )}
              </div>

              {/* Plaid / Stripe Connection */}
              <div
                onClick={() => setPlaidConnected(!plaidConnected)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  plaidConnected
                    ? 'bg-lime-100/60 border-lime-500 text-pine-950'
                    : 'bg-white border-sage-300 hover:border-sage-400 text-sage-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sage-100 border border-sage-200">
                    <Zap className="w-5 h-5 text-pine-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Connect Financial Accounts (Plaid)</div>
                    <div className="text-[11px] text-sage-500">
                      {plaidConnected ? 'Chase Business Checking connected (142 transactions)' : 'Auto-classify business deductions'}
                    </div>
                  </div>
                </div>
                {plaidConnected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-lime-200 text-pine-900 font-bold">Connected</span>
                ) : (
                  <span className="text-xs text-pine-700 font-bold">Connect</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-sage-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-sage-600 hover:text-sage-900 hover:bg-sage-100 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pine-700 hover:bg-pine-800 text-white transition flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isBuilding}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-lime-400 hover:bg-lime-500 text-pine-900 transition shadow-md flex items-center gap-2"
            >
              {isBuilding ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-pine-800" />
                  <span>Building Tax Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Let us build your tax workspace</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
