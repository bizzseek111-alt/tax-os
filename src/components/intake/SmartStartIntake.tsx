import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  UploadCloud, 
  Building2, 
  User, 
  Briefcase, 
  Scale, 
  Zap, 
  FileCheck, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck,
  MapPin,
  Lock,
  Layers,
  Coins,
  Home,
  GraduationCap
} from 'lucide-react';
import { TaxDropZone, ProcessedDocument } from '../ux/TaxDropZone';

export interface SmartStartIntakeProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function SmartStartIntake({ onComplete, onCancel }: SmartStartIntakeProps) {
  const [step, setStep] = useState<number>(1);
  
  // Step 1: Who filing for
  const [filerType, setFilerType] = useState<'PERSONAL' | 'SELF_EMPLOYED' | 'BUSINESS' | 'PRO'>('SELF_EMPLOYED');
  
  // Step 2: Tax Year
  const [taxYear] = useState<number>(2026);
  
  // Step 3: States
  const [residentState, setResidentState] = useState('CA');
  const [movedStates, setMovedStates] = useState(false);
  const [remoteStates, setRemoteStates] = useState(false);
  const [additionalStates, setAdditionalStates] = useState<string[]>([]);
  
  // Step 4: Situation Cards
  const [situations, setSituations] = useState<string[]>([
    'W2', 
    '1099_NEC', 
    'HOME_OFFICE', 
    'BANK_ACCOUNTS'
  ]);
  
  // Step 5: Authentication
  const [email, setEmail] = useState('alex@rivera-consulting.com');
  const [fullName, setFullName] = useState('Alex Rivera');
  const [isAuthVerified, setIsAuthVerified] = useState(false);

  // Step 6 & 7: TaxDrop & Account Link
  const [ingestedDocsCount, setIngestedDocsCount] = useState(3);
  const [isBankConnected, setIsBankConnected] = useState(false);

  // Step 8: Live Building Simulation Stages
  const [buildingStageIndex, setBuildingStageIndex] = useState(0);

  const situationOptions = [
    { id: 'W2', label: 'W-2 Wages', icon: '💼', desc: 'Employed full-time or part-time' },
    { id: '1099_NEC', label: '1099-NEC / Freelance', icon: '🛠️', desc: 'Contracting or consulting' },
    { id: 'CREATOR', label: 'Creator / 1099-K', icon: '📱', desc: 'Stripe, YouTube, Substack, Etsy' },
    { id: 'BUSINESS', label: 'Single-Member LLC', icon: '🏢', desc: 'Form 1040 Schedule C' },
    { id: 'INVESTMENTS', label: 'Stocks & Dividends', icon: '📈', desc: 'Form 1099-B, 1099-DIV' },
    { id: 'CRYPTO', label: 'Cryptocurrency', icon: '🪙', desc: 'Coinbase, Kraken, Web3 trades' },
    { id: 'HOME_OFFICE', label: 'Home Office / House', icon: '🏠', desc: 'Mortgage interest, property tax' },
    { id: 'DEPENDENTS', label: 'Dependents & Children', icon: '👨‍👩‍👧', desc: 'Child Tax Credit eligible' },
    { id: 'EDUCATION', label: 'Education & Loans', icon: '🎓', desc: '1098-E student loan interest' },
    { id: 'RETIREMENT', label: 'IRA / 401(k)', icon: '🏖️', desc: 'Contributions and rollovers' },
    { id: 'RENTAL', label: 'Rental Property', icon: '🏘️', desc: 'Real estate Schedule E' },
    { id: 'BANK_ACCOUNTS', label: 'Business Checking', icon: '💳', desc: 'Expense categorization' }
  ];

  const buildStages = [
    'Understanding uploaded documents (37 verified)...',
    'Matching bank accounts and Stripe processor feeds...',
    'Reconstructing gross income ($148,200.00)...',
    'Finding verifiable tax evidence...',
    'Checking for duplicates (1 duplicate statement eliminated)...',
    'Looking for tax opportunities & Form 8995 QBI deduction...',
    'Building Federal Form 1040 return lines...',
    'Building California Form 540 state return lines...'
  ];

  const toggleSituation = (id: string) => {
    setSituations(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAdditionalState = (st: string) => {
    setAdditionalStates(prev => 
      prev.includes(st) ? prev.filter(s => s !== st) : [...prev, st]
    );
  };

  const startBuildingTaxCase = () => {
    setStep(8);

    // Register TaxCase in backend API
    fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filerType,
        taxYear,
        residentState,
        additionalStates,
        situations,
        email,
        fullName
      })
    }).catch(err => {
      console.warn('Backend intake registration fallback to local state:', err);
    });

    let stage = 0;
    const interval = setInterval(() => {
      stage += 1;
      if (stage < buildStages.length) {
        setBuildingStageIndex(stage);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-sage-200 text-sage-950 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-sage-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pine-700 text-lime-400 flex items-center justify-center font-black text-base">
            T
          </div>
          <div>
            <div className="font-extrabold text-sm text-pine-900">TaxOS Smart Start</div>
            <div className="text-[11px] text-sage-500">Autonomous Intake & TaxCase Builder</div>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="text-xs font-bold text-sage-600 hover:text-pine-900 transition"
        >
          Exit to Home
        </button>
      </header>

      {/* Main Flow Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:py-12">
        
        {/* Step Progress Bar */}
        {step < 8 && (
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-sage-600">
              <span>Step {step} of 7</span>
              <span>
                {step === 1 && 'Entity Type'}
                {step === 2 && 'Tax Year'}
                {step === 3 && 'States & Jurisdictions'}
                {step === 4 && 'Your Situation'}
                {step === 5 && 'Account Creation'}
                {step === 6 && 'TaxDrop™ Ingestion'}
                {step === 7 && 'Connect Financial Accounts'}
              </span>
            </div>
            <div className="w-full bg-sage-300 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-pine-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: WHO ARE YOU FILING FOR?                                 */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 1</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Who are you filing for?</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                TaxOS configures deduction finders tailored to your legal profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { id: 'PERSONAL', title: 'Personal Taxes', sub: 'Individual, married, or family with W-2 wages and investments', icon: User },
                { id: 'SELF_EMPLOYED', title: 'Self-Employed Taxes', sub: 'Freelancer, consultant, creator, solo LLC with Schedule C', icon: Briefcase },
                { id: 'BUSINESS', title: 'Business Taxes', sub: 'S-Corporation (1120-S), Partnership (1065), or multi-member LLC', icon: Building2 }
              ].map((card) => {
                const isSelected = filerType === card.id;
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={() => setFilerType(card.id as any)}
                    className={`p-5 rounded-3xl border-2 transition cursor-pointer space-y-2 ${
                      isSelected 
                        ? 'border-forest-900 bg-forest-900/5 shadow-xs' 
                        : 'border-sage-200 hover:border-sage-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-2xl ${isSelected ? 'bg-forest-900 text-lime-400' : 'bg-sage-100 text-sage-700'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-forest-900 font-bold" />}
                    </div>
                    <div className="font-bold text-base text-forest-950">{card.title}</div>
                    <div className="text-xs text-neutral-600 leading-relaxed">{card.sub}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: TAX YEAR                                               */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 2</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Which tax year are you filing?</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                TaxOS runs versioned statutory rule sets specifically compiled for each filing year.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-pine-50 border-2 border-pine-700 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-pine-950">{taxYear} Calendar Year</div>
                <div className="text-xs text-pine-700 font-medium">Standard 2026 Filing Season (Returns due April 15, 2027)</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-pine-700 text-white font-bold text-xs">
                Active Rule Set
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: STATES & MULTI-JURISDICTION NEXUS                      */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 3</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Where did you live and earn?</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                Select your primary resident state and any states where you performed remote services.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-sage-800 block mb-1.5">Primary Resident State:</label>
                <select
                  value={residentState}
                  onChange={(e) => setResidentState(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-sage-300 bg-sage-50 text-xs font-bold text-sage-900 focus:outline-none focus:border-pine-600"
                >
                  <option value="CA">California (Franchise Tax Board - Form 540)</option>
                  <option value="NY">New York (Department of Taxation & Finance - IT-201)</option>
                  <option value="NJ">New Jersey (Division of Taxation - NJ-1040)</option>
                  <option value="IL">Illinois (Department of Revenue - IL-1040)</option>
                  <option value="MA">Massachusetts (Department of Revenue - Form 1)</option>
                </select>
              </div>

              {/* State Movement / Remote Checkboxes */}
              <div className="p-4 rounded-3xl bg-sage-50 border border-sage-200 space-y-3">
                <label className="flex items-center gap-2.5 text-xs text-sage-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={movedStates}
                    onChange={(e) => setMovedStates(e.target.checked)}
                    className="w-4 h-4 rounded text-pine-700 focus:ring-pine-600"
                  />
                  <span className="font-semibold">I moved between states during 2026 (Part-Year Resident)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-sage-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteStates}
                    onChange={(e) => setRemoteStates(e.target.checked)}
                    className="w-4 h-4 rounded text-pine-700 focus:ring-pine-600"
                  />
                  <span className="font-semibold">I worked remotely or performed client services in other states</span>
                </label>
              </div>

              {(movedStates || remoteStates) && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-sage-700">Select Additional States to Reconcile:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['NY', 'NJ', 'IL', 'MA', 'TX', 'WA'].filter(s => s !== residentState).map((st) => {
                      const isSelected = additionalStates.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleAdditionalState(st)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                            isSelected 
                              ? 'bg-pine-700 text-white border-pine-700' 
                              : 'bg-white text-sage-700 border-sage-300'
                          }`}
                        >
                          <span>{st}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-lime-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: SITUATION CARDS                                        */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 4</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Select your tax situation</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                Choose what applies to you. We only ask questions relevant to your selected cards.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {situationOptions.map((item) => {
                const isSelected = situations.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSituation(item.id)}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer space-y-1 ${
                      isSelected 
                        ? 'border-pine-700 bg-pine-50/60 shadow-xs' 
                        : 'border-sage-200 hover:border-sage-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-pine-700" />}
                    </div>
                    <div className="font-bold text-xs text-sage-950 truncate">{item.label}</div>
                    <div className="text-[10px] text-sage-500 leading-tight truncate">{item.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(5)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: AUTHENTICATION / CREATE ACCOUNT                        */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 5</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Create your secure workspace</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                Your return will be encrypted with your private passkey.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-sage-800 block mb-1">Your Full Legal Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-sage-300 bg-sage-50 text-xs font-bold text-sage-900 focus:outline-none focus:border-pine-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-sage-800 block mb-1">Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-sage-300 bg-sage-50 text-xs font-bold text-sage-900 focus:outline-none focus:border-pine-600"
                />
              </div>

              <div className="p-4 rounded-3xl bg-sage-50 border border-sage-200 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs text-sage-600">
                  <span className="font-bold text-sage-900">Zero-Trust Isolation Active: </span>
                  Your account is protected by hardware-backed passkeys and AES-256 envelope encryption.
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(6)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue to TaxDrop™</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 6: TAXDROP™ INGESTION                                      */}
        {/* ============================================================== */}
        {step === 6 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 6 • TaxDrop™</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">
                Give us everything. Don’t organize it. Don’t rename it.
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                Upload PDFs, receipts, 1099s, W-2s, or CSV files. Multimodal AI parses, hashes, and matches everything automatically.
              </p>
            </div>

            <div className="border-2 border-dashed border-sage-300 hover:border-pine-600 rounded-3xl p-8 text-center bg-sage-50/50 space-y-4 transition">
              <div className="w-12 h-12 rounded-2xl bg-pine-100 text-pine-800 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-sage-950">Drag & Drop Documents Here</div>
                <div className="text-xs text-sage-500 mt-0.5">Supports PDF, JPG, PNG, CSV, XLSX, ZIP up to 100MB</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIngestedDocsCount(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs shadow-2xs transition"
                >
                  Browse Files...
                </button>
                <button
                  type="button"
                  onClick={() => setIngestedDocsCount(prev => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-sage-300 text-sage-700 font-bold text-xs hover:border-sage-400 transition"
                >
                  + Simulate Dropping 2025 Prior Return
                </button>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-sage-50 border border-sage-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sage-900">{ingestedDocsCount} Documents Verified & Hashed</span>
              </div>
              <span className="text-emerald-700 font-mono font-bold">100% Parsing Confidence</span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(5)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(7)}
                className="px-6 py-3 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <span>Continue to Account Linking</span>
                <ArrowRight className="w-4 h-4 text-lime-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 7: CONNECT FINANCIAL ACCOUNTS                              */}
        {/* ============================================================== */}
        {step === 7 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pine-700">Step 7</span>
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950 mt-1">Connect financial accounts</h2>
              <p className="text-xs sm:text-sm text-sage-600 mt-1">
                TaxOS automatically reconciles processor receipts and categorizes Schedule C business deductions.
              </p>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => setIsBankConnected(!isBankConnected)}
                className={`p-5 rounded-3xl border-2 transition cursor-pointer flex items-center justify-between ${
                  isBankConnected 
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs' 
                    : 'border-sage-200 hover:border-sage-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-pine-100 text-pine-800 font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-sage-950">Chase Business Checking (...4819)</div>
                    <div className="text-xs text-sage-500">
                      {isBankConnected ? 'Connected • 142 transactions synced' : 'Click to connect via Plaid OAuth'}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isBankConnected ? 'bg-emerald-200 text-emerald-900' : 'bg-sage-100 text-sage-700'}`}>
                  {isBankConnected ? 'Connected' : 'Connect'}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setStep(6)}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-sage-600 hover:text-sage-900 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={startBuildingTaxCase}
                className="px-7 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-extrabold text-xs shadow-md transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-pine-900" />
                <span>Build My 2026 Tax Workspace</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 8: LIVE TAXCASE BUILD EXPERIENCE                           */}
        {/* ============================================================== */}
        {step === 8 && (
          <div className="bg-white border border-sage-300 rounded-4xl p-8 sm:p-12 shadow-sm text-center space-y-8 my-8">
            <div className="w-16 h-16 rounded-3xl bg-pine-700 text-lime-400 flex items-center justify-center mx-auto shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-sage-950">
                Building your 2026 tax workspace...
              </h2>
              <p className="text-xs sm:text-sm text-sage-600 max-w-md mx-auto">
                Running deterministic calculations, checking state non-conformity adjustments, and structuring your TaxCase.
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-2.5 text-left">
              {buildStages.map((stageText, idx) => {
                const isPassed = idx <= buildingStageIndex;
                const isCurrent = idx === buildingStageIndex;
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl text-xs transition flex items-center gap-3 ${
                      isCurrent 
                        ? 'bg-pine-100/80 text-pine-950 font-bold border border-pine-300' 
                        : isPassed 
                        ? 'text-emerald-800 font-medium' 
                        : 'text-sage-400 opacity-50'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-sage-300 shrink-0" />
                    )}
                    <span className="truncate">{stageText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
