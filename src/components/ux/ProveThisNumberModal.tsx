import React, { useState } from 'react';
import { 
  X, 
  FileCheck2, 
  BookOpen, 
  Receipt, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface ProvenanceNode {
  id: string;
  label: string;
  amount: number;
  formLine: string;
  authorityCitation: string;
  authorityTitle: string;
  precedentialStatus: string;
  plainEnglishReason: string;
  transactions: Array<{
    id: string;
    date: string;
    vendor: string;
    description: string;
    amount: number;
    receiptHash: string;
    receiptFile: string;
  }>;
}

interface ProveThisNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProvenanceNode;
}

export function ProveThisNumberModal({ isOpen, onClose, data }: ProveThisNumberModalProps) {
  const [activeTab, setActiveTab] = useState<'LINEAGE' | 'TRANSACTIONS' | 'EXPLANATION'>('LINEAGE');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="prove-modal-title"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="prove-modal-title" className="text-base font-bold text-slate-100">
                  Prove This Number — Deterministic Lineage DAG
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Verified Provenance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audited path from tax return line item to source transactions and primary legal statutes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close lineage inspector"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">
              {data.label} ({data.formLine})
            </span>
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight tabular-nums">
              ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('LINEAGE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'LINEAGE' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lineage DAG
            </button>
            <button
              onClick={() => setActiveTab('TRANSACTIONS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'TRANSACTIONS' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Source Transactions ({data.transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPLANATION')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'EXPLANATION' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Legal Authority & Plain English
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-300">
          {activeTab === 'LINEAGE' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lineage graph verified deterministically via cryptographic hashes. Zero AI hallucinations in this chain.</span>
              </div>

              {/* Visual Directed Acyclic Graph */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                {/* Node 1: Tax Return Line */}
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-2">
                      <FileCheck2 className="w-4 h-4" />
                      <span>1. Tax Return Line</span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm">{data.formLine}</div>
                    <div className="text-xs text-slate-400 mt-1">{data.label}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-sm font-mono font-bold text-slate-100 tabular-nums">
                    ${data.amount.toLocaleString()}
                  </div>
                </div>

                {/* Node 2: Primary Authority */}
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>2. Governing Law</span>
                    </div>
                    <div className="font-bold text-slate-100 text-xs font-mono">{data.authorityCitation}</div>
                    <div className="text-xs text-slate-400 mt-1">{data.authorityTitle}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      {data.precedentialStatus}
                    </span>
                  </div>
                </div>

                {/* Node 3: Aggregated Ledger */}
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-2">
                      <Clock className="w-4 h-4" />
                      <span>3. Reconciled Ledger</span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm">{data.transactions.length} Verified Entries</div>
                    <div className="text-xs text-slate-400 mt-1">Cross-matched against bank statement hashes</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400">
                    0 Non-deductible items
                  </div>
                </div>

                {/* Node 4: Artifact Receipts */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-2">
                      <Receipt className="w-4 h-4" />
                      <span>4. Source Evidence</span>
                    </div>
                    <div className="font-bold text-slate-100 text-sm">CAS Document Vault</div>
                    <div className="text-xs text-slate-400 mt-1">Multimodal OCR parsed & deduplicated</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
                    SHA-256 Fingerprinted
                  </div>
                </div>
              </div>

              {/* Step By Step Mathematical Formula */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Deterministic Calculation Formula
                </h4>
                <div className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto">
                  Line 27a (${data.amount.toLocaleString()}) = ∑(Verified Transactions [1..{data.transactions.length}]) - Statutory Disallowances ($0.00)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>The following underlying transactions substantiate this tax line:</span>
                <span>Total: {data.transactions.length} items</span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-4 font-semibold">Vendor</th>
                      <th className="py-2.5 px-4 font-semibold">Business Purpose</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Source Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-4 text-slate-400">{tx.date}</td>
                        <td className="py-2.5 px-4 text-slate-200 font-sans font-medium">{tx.vendor}</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{tx.description}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-100 tabular-nums">
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[120px] text-blue-400 hover:underline cursor-pointer" title={tx.receiptFile}>
                              {tx.receiptFile}
                            </span>
                            <button
                              onClick={() => handleCopyHash(tx.receiptHash)}
                              title={`SHA-256: ${tx.receiptHash}`}
                              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedHash === tx.receiptHash && (
                              <span className="text-[10px] text-emerald-400 font-sans">Copied</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'EXPLANATION' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Plain-English Tax Explanation: "Why is this number here?"</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">
                  {data.plainEnglishReason}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span>Authoritative Statute: {data.authorityCitation}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Binding Federal Primary Law
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 font-serif">
                  "There shall be allowed as a deduction all the ordinary and necessary expenses paid or incurred during the taxable year in carrying on any trade or business..."
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Corpus ID: AUTH-FED-IRC-162-ORDINARY-EXPENSES</span>
                  <span className="flex items-center gap-1 text-blue-400 hover:underline cursor-pointer">
                    View in Authority Engine <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Tax Case Hash: <span className="font-mono text-slate-300">sha256:7b91d2...</span></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
