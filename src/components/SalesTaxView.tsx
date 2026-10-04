import React, { useState } from 'react';
import { MOCK_SALES_NEXUS_STATES, MOCK_SALES_TRANSACTIONS } from '../services/MockData';
import { SAMPLE_MULTI_TIER_RATES, SalesTaxEngine, SAAS_TAXABILITY_RULES } from '../services/SalesTaxEngine';
import { ReconciliationEngine } from '../services/ReconciliationEngine';
import { 
  Building2, 
  MapPin, 
  Calculator, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Store, 
  ShieldAlert, 
  RefreshCw,
  FileText,
  BadgeAlert
} from 'lucide-react';

export const SalesTaxView: React.FC = () => {
  // Simulator State
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<'CA_LOS_ANGELES' | 'NY_NEW_YORK_CITY' | 'TX_AUSTIN' | 'WA_SEATTLE'>('CA_LOS_ANGELES');
  const [productCategory, setProductCategory] = useState<'SW_SAAS' | 'HARDWARE_ROBOTICS'>('SW_SAAS');
  const [transactionAmount, setTransactionAmount] = useState<number>(5000);
  const [isMarketplace, setIsMarketplace] = useState<boolean>(false);
  const [isCustomerExempt, setIsCustomerExempt] = useState<boolean>(false);

  // Selected State Code
  const stateCodeMap: Record<string, string> = {
    'CA_LOS_ANGELES': 'CA',
    'NY_NEW_YORK_CITY': 'NY',
    'TX_AUSTIN': 'TX',
    'WA_SEATTLE': 'WA'
  };
  const activeStateCode = stateCodeMap[selectedJurisdiction];

  // Run calculation
  const simResult = SalesTaxEngine.calculateTransaction({
    transactionNumber: 'SIM-2027-LIVE',
    amount: transactionAmount,
    destinationKey: selectedJurisdiction,
    stateCode: activeStateCode,
    productCategory,
    isMarketplace,
    customerExempt: isCustomerExempt
  });

  // Reconciliation data
  const reconciliation = ReconciliationEngine.reconcileSalesTax({
    periodId: 'period-2027-q1',
    stateCode: 'CA',
    storefrontGross: 450000,
    generalLedgerGross: 450000,
    marketplaceSales: 150000,
    directSales: 300000,
    exemptSales: 25000,
    taxCollectedDirectly: 26125,
    taxCollectedMarketplace: 14250,
    remittedAmount: 26125
  });

  const rate = SAMPLE_MULTI_TIER_RATES[selectedJurisdiction];

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Sales & Use Tax Workstation</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              FOUNDATION STAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-tier jurisdiction rates (State + County + City + District), economic nexus monitoring, SaaS taxability & marketplace facilitator reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sales Tax Provider Abstraction:</span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            NativeTaxEngine (Plug-in: Avalara / TaxJar Ready)
          </span>
        </div>
      </div>

      {/* SECTION 1: PROOF OF MULTI-TIER JURISDICTION MODELING */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              Multi-Tier Jurisdiction Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Architecture strictly prevents single state-level percentage modeling. Each jurisdiction stacks State, County, City, and Special Districts.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Versioned Tax Graph: v2027.Q1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(SAMPLE_MULTI_TIER_RATES).map(([key, item]) => {
            const isSelected = selectedJurisdiction === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedJurisdiction(key as any)}
                className={`cursor-pointer rounded-xl p-4 border transition ${
                  isSelected 
                    ? 'bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm">{key.replace('_', ' - ')}</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {(item.compositeRate * 100).toFixed(3)}%
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                  <div className="flex justify-between">
                    <span>State:</span>
                    <span className="text-slate-200">{(item.stateRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>County:</span>
                    <span className="text-slate-200">{(item.countyRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>City:</span>
                    <span className="text-slate-200">{(item.cityRate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Special District:</span>
                    <span className="text-slate-200">{(item.specialDistrictRate * 100).toFixed(2)}%</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/50 text-[10px] text-slate-500 truncate" title={item.statuteCitation}>
                  Statute: {item.statuteCitation}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: ECONOMIC & PHYSICAL NEXUS MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              State Nexus Tracking Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Nexus thresholds are evaluated from the Tax Rule Graph (not hard-coded into prompts). Trailing metrics determine registration obligations.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Post-South Dakota v. Wayfair Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_SALES_NEXUS_STATES.map((nexus) => {
            const evalResult = SalesTaxEngine.evaluateNexus(nexus);
            return (
              <div key={nexus.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">{nexus.stateCode}</span>
                      <span className="text-xs text-slate-400">{nexus.stateName}</span>
                    </div>
                    {nexus.hasNexus ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        NEXUS ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        APPROACHING
                      </span>
                    )}
                  </div>

                  {/* Progress Bar towards threshold */}
                  <div className="my-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Threshold Progress</span>
                      <span className="font-bold text-slate-200">{evalResult.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${nexus.hasNexus ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${evalResult.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Threshold:</span>
                      <span className="text-slate-200 font-mono">${nexus.thresholdAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trailing Sales:</span>
                      <span className="text-emerald-400 font-mono font-semibold">${nexus.currentTrailingSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trailing Tx Count:</span>
                      <span className="text-slate-200 font-mono">{nexus.currentTrailingTransactions} tx</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Registration:</span>
                      <span className={nexus.registrationStatus === 'REGISTERED' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {nexus.registrationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                  {evalResult.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: INTERACTIVE TRANSACTION ENGINE & PROVENANCE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Transaction Simulator Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Live Transaction Tax Simulator
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Destination Jurisdiction</label>
              <select
                value={selectedJurisdiction}
                onChange={(e) => setSelectedJurisdiction(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="CA_LOS_ANGELES">Los Angeles, CA (9.500% Composite)</option>
                <option value="NY_NEW_YORK_CITY">New York City, NY (8.875% Composite)</option>
                <option value="TX_AUSTIN">Austin, TX (8.250% Composite)</option>
                <option value="WA_SEATTLE">Seattle, WA (10.350% Composite)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Product / Service Classification</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="SW_SAAS">Cloud B2B Software / SaaS (SW_SAAS)</option>
                <option value="HARDWARE_ROBOTICS">Tangible Hardware Equipment (HARDWARE_ROBOTICS)</option>
              </select>
              <div className="mt-1 text-[11px] text-slate-400 italic">
                {productCategory === 'SW_SAAS' 
                  ? `SaaS Rule for ${activeStateCode}: ${SAAS_TAXABILITY_RULES[activeStateCode]?.citation || 'Standard'}`
                  : 'Tangible Personal Property: Generally 100% taxable in destination jurisdiction.'}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Transaction Gross Amount ($)</label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isMarketplace}
                  onChange={(e) => setIsMarketplace(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Marketplace Facilitator Sale (e.g. Amazon / Etsy collects & remits)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={isCustomerExempt}
                  onChange={(e) => setIsCustomerExempt(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Valid Resale / Exemption Certificate on File</span>
              </label>
            </div>
          </div>
        </div>

        {/* Calculation Result & Provenance */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                Calculation Output & Audit Provenance
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                Hash: {simResult.provenance?.inputHash}
              </span>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4">
              <div>
                <div className="text-[11px] text-slate-400">Gross Sales</div>
                <div className="text-base font-bold text-white font-mono">${simResult.grossAmount?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Taxable Sales</div>
                <div className="text-base font-bold text-sky-400 font-mono">${simResult.taxableAmount?.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Tax Calculated</div>
                <div className="text-base font-bold text-emerald-400 font-mono">${simResult.taxCalculated?.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Remittance Entity</div>
                <div className="text-xs font-bold text-amber-400 mt-1">
                  {isMarketplace ? 'Marketplace Facilitator' : 'Merchant Direct'}
                </div>
              </div>
            </div>

            {/* Trace Log */}
            <div className="space-y-1.5 text-xs font-mono bg-slate-950 border border-slate-800/80 rounded-xl p-4">
              <div className="text-slate-400 font-bold mb-1">// Engine Trace Log:</div>
              {simResult.provenance?.traceLog?.map((log, idx) => (
                <div key={idx} className="text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500">›</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="text-slate-400 mt-2 font-sans pt-2 border-t border-slate-800/60">
                <strong className="text-slate-300">Statutory Citations:</strong>
                <ul className="list-disc list-inside text-[11px] text-slate-400 mt-1">
                  {simResult.provenance?.citations.map((cite, i) => (
                    <li key={i}>{cite}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: MULTI-CHANNEL RECONCILIATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Multi-Channel Sales Tax Reconciliation (Q1 2027)
            </h3>
            <p className="text-xs text-slate-400">
              Cross-reconciliation between Gross Sales, General Ledger, Taxable Sales, Marketplace vs Direct, and Remitted Tax.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            Reconciled: $0 Variance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4 text-xs">
          <div>
            <div className="text-slate-400">Storefront Feeds (Shopify + Amazon)</div>
            <div className="text-base font-bold text-white mt-0.5">${reconciliation.grossSalesECommerce.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">General Ledger Gross Revenue</div>
            <div className="text-base font-bold text-white mt-0.5">${reconciliation.grossSalesGeneralLedger.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">Marketplace Remitted (Amazon)</div>
            <div className="text-base font-bold text-blue-400 mt-0.5">${reconciliation.taxCollectedByMarketplaces.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">Merchant Direct Remittance (CDTFA)</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">${reconciliation.taxRemittedToState.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {reconciliation.reconciliationItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="font-semibold text-slate-200">{item.channel}</span>
                <span className="text-slate-400 text-[11px] block">{item.explanation}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-emerald-400 font-bold">${item.recordedTax.toFixed(2)}</span>
                <span className="text-slate-500 text-[10px] block">Variance: ${item.variance.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
