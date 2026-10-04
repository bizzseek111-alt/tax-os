import React, { useState } from 'react';
import { 
  Inbox, 
  Plane, 
  Home, 
  TrendingUp, 
  Check, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  Info
} from 'lucide-react';

export interface InboxItem {
  id: string;
  category: 'BUSINESS_TRAVEL' | 'HOME_OFFICE' | 'MISSING_1099B' | 'CRYPTO_BASIS';
  title: string;
  badge: string;
  description: string;
  statutoryBasis: string;
  resolved: boolean;
  impactPreview: string;
}

interface TaxInboxCardQueueProps {
  onItemResolved: (itemId: string, outcome: string) => void;
  questionsRemaining: number;
}

export function TaxInboxCardQueue({ onItemResolved, questionsRemaining }: TaxInboxCardQueueProps) {
  const [items, setItems] = useState<InboxItem[]>([
    {
      id: 'inbox-01',
      category: 'BUSINESS_TRAVEL',
      title: 'Business Travel Confirmation (Delta Airlines)',
      badge: 'Ordinary & Necessary Expense',
      description: 'We detected a $412.50 transaction on Delta Air Lines in October matching your Acme Consulting contract dates. Was this trip exclusively for business purposes?',
      statutoryBasis: '26 U.S.C. § 162(a)(2)',
      resolved: false,
      impactPreview: '+$142 potential tax savings'
    },
    {
      id: 'inbox-02',
      category: 'HOME_OFFICE',
      title: 'Dedicated Home Office Workspace',
      badge: 'Deduction Opportunity',
      description: 'You reported $92,000 in independent consulting income. You may qualify for the home office deduction under IRC § 280A if you maintain a room exclusively and regularly for work.',
      statutoryBasis: '26 U.S.C. § 280A(c)(1)',
      resolved: false,
      impactPreview: '+$350 - $1,100 estimated deduction'
    },
    {
      id: 'inbox-03',
      category: 'MISSING_1099B',
      title: 'Missing Brokerage / Crypto Cost Basis',
      badge: 'Potential Audit Flag',
      description: 'We detected $2,400 in outbound proceeds from Coinbase into your checking account, but no 1099-B/DA cost basis was found in your uploaded documents.',
      statutoryBasis: 'Treas. Reg. § 1.6045-1',
      resolved: false,
      impactPreview: 'Prevents IRS CP2000 zero-basis notice'
    }
  ]);

  const [homeOfficeSqFt, setHomeOfficeSqFt] = useState('220');
  const [homeOfficeMethod, setHomeOfficeMethod] = useState<'SIMPLIFIED' | 'ACTUAL'>('SIMPLIFIED');

  const handleResolve = (id: string, outcome: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, resolved: true } : item));
    onItemResolved(id, outcome);
  };

  const activeItems = items.filter(i => !i.resolved);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">
                Tax Inbox — Questions to File
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {activeItems.length} Remaining
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Replaces the 80-question tax wizard. Only high-leverage unresolved tax facts are presented.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Questions to File target:</span>
          <span className="font-bold text-emerald-400 font-mono">≤ 3 items</span>
        </div>
      </div>

      {/* Cards Queue */}
      {activeItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-emerald-300">All Tax Inbox Items Resolved!</h4>
          <p className="text-xs text-slate-400 mt-1">
            Questions to File is now 0. Your tax positions have 100% factual grounding and deterministic lineage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            if (item.resolved) return null;

            return (
              <div 
                key={item.id} 
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                {/* Card Title & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.category === 'BUSINESS_TRAVEL' && <Plane className="w-4 h-4 text-blue-400" />}
                    {item.category === 'HOME_OFFICE' && <Home className="w-4 h-4 text-purple-400" />}
                    {item.category === 'MISSING_1099B' && <TrendingUp className="w-4 h-4 text-amber-400" />}
                    <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {item.statutoryBasis}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">
                      {item.impactPreview}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                {/* Specific Action Controls */}
                {item.category === 'BUSINESS_TRAVEL' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleResolve(item.id, 'YES_100_BUSINESS')}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm"
                    >
                      ✓ Yes, 100% Business Travel
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'NO_PERSONAL')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Personal Trip (Disallow)
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'MIXED_50_50')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Mixed Purpose (50%)
                    </button>
                  </div>
                )}

                {item.category === 'HOME_OFFICE' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Office Area:</span>
                        <input
                          type="number"
                          value={homeOfficeSqFt}
                          onChange={(e) => setHomeOfficeSqFt(e.target.value)}
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400">sq ft (max 300)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                          <input
                            type="radio"
                            name="method"
                            checked={homeOfficeMethod === 'SIMPLIFIED'}
                            onChange={() => setHomeOfficeMethod('SIMPLIFIED')}
                            className="accent-blue-500"
                          />
                          <span>Simplified ($5/sq ft = $1,100)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(item.id, `HOME_OFFICE_${homeOfficeSqFt}SQFT`)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                      >
                        ✓ Claim $1,100 Simplified Deduction
                      </button>
                      <button
                        onClick={() => handleResolve(item.id, 'DECLINE_HOME_OFFICE')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        Do Not Claim
                      </button>
                    </div>
                  </div>
                )}

                {item.category === 'MISSING_1099B' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleResolve(item.id, 'CONNECT_COINBASE_API')}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                    >
                      Connect Brokerage API
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'ZERO_NET_GAIN')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Cost Basis Equal to Proceeds ($0 Net Gain)
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'UPLOAD_CSV')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                      Upload CSV Statement
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
