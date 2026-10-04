import React from 'react';
import { 
  GitFork, 
  Layers, 
  FileCheck, 
  Database, 
  ShieldCheck, 
  Code2, 
  Share2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const TaxGraphExplorer: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Unified Tax Graph & Provenance Engine</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              CROSS-DOMAIN CORE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual inspection of how Income Tax, Sales Tax, and Payroll Tax share the Tax Graph, Evidence Graph, and Calculation Provenance DAG.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span>Engine: TaxGraph-v4.1</span>
        </div>
      </div>

      {/* Visual DAG Architecture Concept */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Share2 className="w-4 h-4 text-emerald-400" />
          Cross-Domain Architecture Diagram
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Every tax domain operates as an autonomous rule layer consuming shared foundation graphs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Layer 1: Ingestion & Evidence Graph */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Database className="w-4 h-4" />
                1. Unified Evidence Graph
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Single cryptographic registry for financial facts, transaction streams & documents.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Stripe / Shopify Stream</span>
                  <span>tx_hash: 7f8a...9c2e</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Gusto / ADP Pay Run</span>
                  <span>run_hash: b312...fa40</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-500 block text-[10px]">Bank / General Ledger</span>
                  <span>ledger_hash: 104b...008a</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2: Versioned Tax Rule Graph */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                <GitFork className="w-4 h-4" />
                2. Versioned Tax Rule Graph
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Statutory codification with strict versioning, effective dates & jurisdiction hierarchy.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded border border-purple-900/40 text-purple-300">
                  <span className="text-slate-500 block text-[10px]">Sales Tax Rules</span>
                  <span>RULE-NY-SAAS-2027</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-emerald-900/40 text-emerald-300">
                  <span className="text-slate-500 block text-[10px]">Payroll Tax Rules</span>
                  <span>IRC-3101-FICA-2027</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-blue-900/40 text-blue-300">
                  <span className="text-slate-500 block text-[10px]">Income Tax Rules</span>
                  <span>IRC-1361-SCORP-2027</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 3: Calculation Provenance & Review */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <FileCheck className="w-4 h-4" />
                3. Audit Provenance & Signoff
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Every calculation produces immutable provenance with statutory citations and CPA/EA review signoff.
              </p>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Form 1120-S Provenance</span>
                  <span className="text-emerald-400 font-bold text-[10px]">CPA APPROVED</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Form 941 Provenance</span>
                  <span className="text-emerald-400 font-bold text-[10px]">EA APPROVED</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>Sales Tax Returns</span>
                  <span className="text-sky-400 font-bold text-[10px]">AI AUDITED</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Cross-Domain Reusability Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2">Common Tax Compliance Model Mapping</h3>
        <p className="text-xs text-slate-400 mb-4">
          How generic concepts are shared without over-generalizing domain-specific tax rules.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Shared Concept</th>
                <th className="py-3 px-4">Income Tax Instance</th>
                <th className="py-3 px-4">Sales & Use Tax Instance</th>
                <th className="py-3 px-4">Payroll Tax Instance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-400">TaxObligation</td>
                <td className="py-3 px-4">Annual Form 1120-S</td>
                <td className="py-3 px-4">Monthly/Quarterly CDTFA-401</td>
                <td className="py-3 px-4">Quarterly Form 941 + Annual 940</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-400">TaxJurisdiction</td>
                <td className="py-3 px-4">Federal + California FTB</td>
                <td className="py-3 px-4">State + County + City + District</td>
                <td className="py-3 px-4">IRS + State EDD + Local Taxes</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-400">TaxDeadline</td>
                <td className="py-3 px-4">March 15 / April 15</td>
                <td className="py-3 px-4">Last day of month following quarter</td>
                <td className="py-3 px-4">Semi-Weekly deposit + quarterly 941</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-400">TaxNotice</td>
                <td className="py-3 px-4">IRS CP2000 / Information Request</td>
                <td className="py-3 px-4">Notice of Determination / Desk Audit</td>
                <td className="py-3 px-4">Notice CP161 (Failure to Deposit)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-emerald-400">ProfessionalReview</td>
                <td className="py-3 px-4">CPA S-Corp return review</td>
                <td className="py-3 px-4">Sales Tax Specialist nexus audit</td>
                <td className="py-3 px-4">EA / Attorney Worker Classification</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
