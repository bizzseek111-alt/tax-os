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
    <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-lime-400/30 text-pine-800 border border-lime-400/50">
            <Inbox className="w-5 h-5 text-pine-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-sage-900">
                Tax Inbox — Questions to File
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pine-700 text-lime-300">
                {activeItems.length} Remaining
              </span>
            </div>
            <p className="text-xs text-sage-500">
              Replaces the 80-question tax wizard. Only high-leverage unresolved tax facts are presented.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-sage-100 border border-sage-300 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-pine-700" />
          <span className="text-sage-600">QtF Target:</span>
          <span className="font-bold text-pine-800 font-mono">≤ 3 items</span>
        </div>
      </div>

      {/* Cards Queue */}
      {activeItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-pine-600/30 rounded-2xl bg-sage-50">
          <div className="w-10 h-10 mx-auto rounded-full bg-lime-400/40 text-pine-800 flex items-center justify-center mb-2">
            <Check className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-pine-900">All Tax Inbox Items Resolved!</h4>
          <p className="text-xs text-sage-600 mt-1">
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
                className="p-5 rounded-2xl bg-sage-50 border border-sage-200 hover:border-sage-300 transition space-y-4 shadow-2xs"
              >
                {/* Card Title & Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.category === 'BUSINESS_TRAVEL' && <Plane className="w-4 h-4 text-pine-700" />}
                    {item.category === 'HOME_OFFICE' && <Home className="w-4 h-4 text-pine-700" />}
                    {item.category === 'MISSING_1099B' && <TrendingUp className="w-4 h-4 text-amber-700" />}
                    <h4 className="text-sm font-bold text-sage-900">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white text-sage-700 border border-sage-300">
                      {item.statutoryBasis}
                    </span>
                    <span className="text-[11px] font-mono text-pine-800 font-bold">
                      {item.impactPreview}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-sage-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Specific Action Controls */}
                {item.category === 'BUSINESS_TRAVEL' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleResolve(item.id, 'YES_100_BUSINESS')}
                      className="px-3.5 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs"
                    >
                      ✓ Yes, 100% Business Travel
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'NO_PERSONAL')}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 text-xs font-semibold transition"
                    >
                      Personal Trip (Disallow)
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'MIXED_50_50')}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 text-xs font-semibold transition"
                    >
                      Mixed Purpose (50%)
                    </button>
                  </div>
                )}

                {item.category === 'HOME_OFFICE' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-sage-600 font-medium">Office Area:</span>
                        <input
                          type="number"
                          value={homeOfficeSqFt}
                          onChange={(e) => setHomeOfficeSqFt(e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-sage-300 rounded-xl text-center text-sage-900 font-mono text-xs focus:outline-none focus:border-pine-600"
                        />
                        <span className="text-sage-500">sq ft (max 300)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-sage-700">
                          <input
                            type="radio"
                            name="method"
                            checked={homeOfficeMethod === 'SIMPLIFIED'}
                            onChange={() => setHomeOfficeMethod('SIMPLIFIED')}
                            className="accent-pine-700"
                          />
                          <span>Simplified ($5/sq ft = $1,100)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(item.id, `HOME_OFFICE_${homeOfficeSqFt}SQFT`)}
                        className="px-3.5 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs"
                      >
                        ✓ Claim $1,100 Simplified Deduction
                      </button>
                      <button
                        onClick={() => handleResolve(item.id, 'DECLINE_HOME_OFFICE')}
                        className="px-3.5 py-2 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 text-xs font-semibold transition"
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
                      className="px-3.5 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs"
                    >
                      Connect Brokerage API
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'ZERO_NET_GAIN')}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 text-xs font-semibold transition"
                    >
                      Cost Basis Equal to Proceeds ($0 Net Gain)
                    </button>
                    <button
                      onClick={() => handleResolve(item.id, 'UPLOAD_CSV')}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 text-xs font-semibold transition"
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
