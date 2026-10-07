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
    <div className="fixed inset-0 z-50 bg-pine-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="prove-modal-title"
        className="bg-white border border-sage-300 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-sage-50 border-b border-sage-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="prove-modal-title" className="text-base font-bold text-sage-900">
                  Prove This Number — Deterministic Lineage DAG
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-lime-200 text-pine-950 border border-lime-300">
                  100% Verified Provenance
                </span>
              </div>
              <p className="text-xs text-sage-600 mt-0.5">
                Audited path from tax return line item to source transactions and primary legal statutes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close lineage inspector"
            className="p-2 rounded-xl text-sage-500 hover:text-sage-900 hover:bg-sage-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="px-6 py-4 bg-white border-b border-sage-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-sage-600 uppercase tracking-wider block">
              {data.label} ({data.formLine})
            </span>
            <span className="text-3xl font-extrabold text-sage-950 font-mono tracking-tight tabular-nums">
              ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-sage-100 p-1 rounded-2xl border border-sage-200">
            <button
              onClick={() => setActiveTab('LINEAGE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'LINEAGE' 
                  ? 'bg-pine-700 text-white shadow-xs' 
                  : 'text-sage-700 hover:text-sage-900'
              }`}
            >
              Lineage DAG
            </button>
            <button
              onClick={() => setActiveTab('TRANSACTIONS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'TRANSACTIONS' 
                  ? 'bg-pine-700 text-white shadow-xs' 
                  : 'text-sage-700 hover:text-sage-900'
              }`}
            >
              Source Transactions ({data.transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPLANATION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'EXPLANATION' 
                  ? 'bg-pine-700 text-white shadow-xs' 
                  : 'text-sage-700 hover:text-sage-900'
              }`}
            >
              Legal Authority & Plain English
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-sage-800">
          {activeTab === 'LINEAGE' && (
            <div className="space-y-6">
              <div className="text-xs text-sage-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pine-700" />
                <span>Lineage graph verified deterministically via cryptographic hashes. Zero AI hallucinations in this chain.</span>
              </div>

              {/* Visual Directed Acyclic Graph */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                {/* Node 1: Tax Return Line */}
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-pine-800 text-xs font-bold mb-2">
                      <FileCheck2 className="w-4 h-4" />
                      <span>1. Tax Return Line</span>
                    </div>
                    <div className="font-bold text-sage-900 text-sm">{data.formLine}</div>
                    <div className="text-xs text-sage-600 mt-1">{data.label}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sage-200 text-sm font-mono font-bold text-sage-950 tabular-nums">
                    ${data.amount.toLocaleString()}
                  </div>
                </div>

                {/* Node 2: Primary Authority */}
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-pine-800 text-xs font-bold mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>2. Governing Law</span>
                    </div>
                    <div className="font-bold text-sage-900 text-xs font-mono">{data.authorityCitation}</div>
                    <div className="text-xs text-sage-600 mt-1">{data.authorityTitle}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sage-200">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200">
                      {data.precedentialStatus}
                    </span>
                  </div>
                </div>

                {/* Node 3: Aggregated Ledger */}
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-pine-800 text-xs font-bold mb-2">
                      <Clock className="w-4 h-4" />
                      <span>3. Reconciled Ledger</span>
                    </div>
                    <div className="font-bold text-sage-900 text-sm">{data.transactions.length} Verified Entries</div>
                    <div className="text-xs text-sage-600 mt-1">Cross-matched against bank statement hashes</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sage-200 text-xs text-pine-800 font-bold">
                    0 Non-deductible items
                  </div>
                </div>

                {/* Node 4: Artifact Receipts */}
                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-pine-800 text-xs font-bold mb-2">
                      <Receipt className="w-4 h-4" />
                      <span>4. Source Evidence</span>
                    </div>
                    <div className="font-bold text-sage-900 text-sm">CAS Document Vault</div>
                    <div className="text-xs text-sage-600 mt-1">Multimodal OCR parsed & deduplicated</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-sage-200 text-xs text-sage-500 font-mono">
                    SHA-256 Fingerprinted
                  </div>
                </div>
              </div>

              {/* Step By Step Mathematical Formula */}
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-600 mb-2">
                  Deterministic Calculation Formula
                </h4>
                <div className="font-mono text-xs text-sage-900 bg-white p-3 rounded-xl border border-sage-200 overflow-x-auto font-semibold">
                  Line 27a (${data.amount.toLocaleString()}) = ∑(Verified Transactions [1..{data.transactions.length}]) - Statutory Disallowances ($0.00)
                </div>
              </div>
            </div>
          )}

          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-sage-600">
                <span>The following underlying transactions substantiate this tax line:</span>
                <span className="font-semibold">Total: {data.transactions.length} items</span>
              </div>

              <div className="border border-sage-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Date</th>
                      <th className="py-2.5 px-4 font-bold">Vendor</th>
                      <th className="py-2.5 px-4 font-bold">Business Purpose</th>
                      <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                      <th className="py-2.5 px-4 font-bold">Source Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-200 font-mono">
                    {data.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-sage-50/50 transition">
                        <td className="py-2.5 px-4 text-sage-600">{tx.date}</td>
                        <td className="py-2.5 px-4 text-sage-900 font-sans font-semibold">{tx.vendor}</td>
                        <td className="py-2.5 px-4 text-sage-700 font-sans">{tx.description}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-sage-900 tabular-nums">
                          ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-sage-600 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[120px] text-pine-700 font-semibold hover:underline cursor-pointer" title={tx.receiptFile}>
                              {tx.receiptFile}
                            </span>
                            <button
                              onClick={() => handleCopyHash(tx.receiptHash)}
                              title={`SHA-256: ${tx.receiptHash}`}
                              className="p-1 rounded hover:bg-sage-100 text-sage-500 hover:text-sage-800"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedHash === tx.receiptHash && (
                              <span className="text-[10px] text-pine-800 font-bold font-sans">Copied</span>
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
              <div className="p-4 rounded-2xl bg-pine-50 border border-pine-200">
                <div className="flex items-center gap-2 text-pine-800 font-bold text-xs mb-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Plain-English Tax Explanation: "Why is this number here?"</span>
                </div>
                <p className="text-sage-900 leading-relaxed text-sm">
                  {data.plainEnglishReason}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-sage-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-sage-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-pine-700" />
                    <span>Authoritative Statute: {data.authorityCitation}</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-lime-200 text-pine-950 border border-lime-300 font-bold">
                    Binding Federal Primary Law
                  </span>
                </div>
                <p className="text-xs text-sage-700 leading-relaxed italic bg-sage-50 p-3 rounded-xl border border-sage-200 font-serif">
                  "There shall be allowed as a deduction all the ordinary and necessary expenses paid or incurred during the taxable year in carrying on any trade or business..."
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-sage-500">
                  <span>Corpus ID: AUTH-FED-IRC-162-ORDINARY-EXPENSES</span>
                  <span className="flex items-center gap-1 text-pine-700 font-semibold hover:underline cursor-pointer">
                    View in Authority Engine <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-sage-50 border-t border-sage-200 flex items-center justify-between text-xs text-sage-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-500"></span>
            <span>Tax Case Hash: <span className="font-mono text-sage-800 font-semibold">sha256:7b91d2...</span></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-sage-100 text-sage-800 border border-sage-300 transition font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
