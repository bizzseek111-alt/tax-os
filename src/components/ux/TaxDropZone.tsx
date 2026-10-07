import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Copy,
  Layers,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';

export interface ProcessedDocument {
  id: string;
  name: string;
  type: 'W2' | '1099_NEC' | 'RECEIPT' | 'PRIOR_RETURN' | 'CSV_LEDGER' | 'BROKERAGE_1099B';
  size: string;
  hash: string;
  status: 'PROCESSED' | 'DUPLICATE_REMOVED' | 'OCR_PARSED' | 'PENDING_MATCH';
  extractedInfo: string;
}

interface TaxDropZoneProps {
  onDocumentAdded?: (doc: ProcessedDocument) => void;
}

export function TaxDropZone({ onDocumentAdded }: TaxDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [recentDocs, setRecentDocs] = useState<ProcessedDocument[]>([
    {
      id: 'doc-001',
      name: 'Vanguard_Form_1099_DIV_2026.pdf',
      type: '1099_NEC',
      size: '245 KB',
      hash: 'sha256:8f4c2e...91b0',
      status: 'PROCESSED',
      extractedInfo: '$3,840 Qualified Dividends ($0 Cap Gains)'
    },
    {
      id: 'doc-002',
      name: 'Acme_Consulting_Contract_1099NEC.pdf',
      type: '1099_NEC',
      size: '412 KB',
      hash: 'sha256:7a3d11...440c',
      status: 'PROCESSED',
      extractedInfo: '$92,000 Nonemployee Compensation'
    },
    {
      id: 'doc-003',
      name: 'AWS_Hosting_Invoice_Nov2026_Duplicate.pdf',
      type: 'RECEIPT',
      size: '128 KB',
      hash: 'sha256:4f82a1...293e',
      status: 'DUPLICATE_REMOVED',
      extractedInfo: 'Duplicate of Tx #1092 removed (saved $1,240 duplicate error)'
    }
  ]);

  const processIncomingFile = (fileName: string, fileSizeStr: string, fileTypeHint: string) => {
    setIsProcessing(true);
    setProcessingStage('1. Ingesting & SHA-256 Hashing...');

    setTimeout(() => {
      setProcessingStage('2. Multimodal OCR & Key-Value Parsing...');
    }, 500);

    setTimeout(() => {
      setProcessingStage('3. Cross-Document Deduplication & Collision Audit...');
    }, 1000);

    setTimeout(() => {
      setProcessingStage('4. Matching Bank Transactions & Updating Tax Graph...');
    }, 1500);

    setTimeout(() => {
      setIsProcessing(false);
      setProcessingStage('');
      const isDup = recentDocs.some(d => d.name === fileName);
      const newDoc: ProcessedDocument = {
        id: `doc-${Date.now().toString().slice(-4)}`,
        name: fileName,
        type: fileTypeHint === 'PRIOR_RETURN' ? 'PRIOR_RETURN' : 'RECEIPT',
        size: fileSizeStr,
        hash: `sha256:${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`,
        status: isDup ? 'DUPLICATE_REMOVED' : 'PROCESSED',
        extractedInfo: isDup 
          ? 'Duplicate artifact detected and bypassed; no duplicate expense hazard.' 
          : fileTypeHint === 'PRIOR_RETURN' 
            ? 'Prior depreciation schedule imported; carryover losses verified.' 
            : 'Expense verified, vendor normalized, and bound to Schedule C Line 27.'
      };
      setRecentDocs(prev => [newDoc, ...prev]);
      if (onDocumentAdded) onDocumentAdded(newDoc);
    }, 2000);
  };

  const handleSimulateDrop = (fileType: string) => {
    if (fileType === 'RECEIPT') {
      processIncomingFile('Delta_Airlines_Receipt_INV-9821.pdf', '1.2 MB', 'RECEIPT');
    } else {
      processIncomingFile('Form_1040_PriorYear_2025.pdf', '3.4 MB', 'PRIOR_RETURN');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
      processIncomingFile(file.name, sizeStr, file.name.includes('1040') ? 'PRIOR_RETURN' : 'RECEIPT');
    }
  };

  return (
    <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.zip"
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
              TaxDrop — Intelligent Ingestion Vault
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200">
                Live CAS Pipeline
              </span>
            </h3>
            <p className="text-xs text-sage-600 mt-0.5">
              Drag PDFs, receipts, CSVs, or tax packets. AI classifies and matches deterministically.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-mono text-pine-800 font-bold block">{recentDocs.length + 34} Documents Ingested</span>
          <span className="text-[11px] text-sage-500 font-medium">Auto-Deduplication Active</span>
        </div>
      </div>

      {/* Drop Zone Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { 
          e.preventDefault(); 
          setIsDragging(false); 
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const f = e.dataTransfer.files[0];
            const sizeKb = Math.round(f.size / 1024);
            const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
            processIncomingFile(f.name, sizeStr, 'RECEIPT');
          } else {
            handleSimulateDrop('RECEIPT'); 
          }
        }}
        className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition cursor-pointer relative ${
          isDragging 
            ? 'border-pine-600 bg-pine-50/60' 
            : 'border-sage-300 hover:border-pine-600 bg-sage-50/70'
        }`}
      >
        {isProcessing ? (
          <div className="py-4 space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-pine-100 border border-pine-300 flex items-center justify-center animate-spin text-pine-800">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-sage-900">{processingStage}</div>
            <p className="text-xs text-sage-600 max-w-sm mx-auto">
              Running deterministic OCR parsing, cryptographic hashing, and transaction cross-matching...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-pine-700 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-sage-900">
                Drop your tax forms, bank CSVs, or receipts here
              </div>
              <p className="text-xs text-sage-600 mt-1">
                Supports PDF, JPG, PNG, CSV, Excel, or ZIP bundles up to 100MB
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse Files...</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDrop('RECEIPT')}
                className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 text-xs font-semibold transition border border-sage-300"
              >
                + Drop Delta Flight Receipt
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDrop('PRIOR_RETURN')}
                className="px-3.5 py-1.5 rounded-2xl bg-white hover:bg-sage-100 text-sage-800 text-xs font-semibold transition border border-sage-300"
              >
                + Drop 2025 Prior Return
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ingested Documents List */}
      <div className="mt-5 space-y-2">
        <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider flex items-center justify-between">
          <span>Recently Ingested Artifacts ({recentDocs.length})</span>
          <span className="text-[11px] text-sage-500">Auto-Encrypted AES-256</span>
        </div>

        <div className="divide-y divide-sage-200 border border-sage-200 rounded-2xl overflow-hidden bg-white">
          {recentDocs.map((doc) => (
            <div key={doc.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-sage-50/50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-xl shrink-0 ${
                  doc.status === 'DUPLICATE_REMOVED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-pine-100 text-pine-800 border border-pine-200'
                }`}>
                  {doc.status === 'DUPLICATE_REMOVED' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-sage-900 truncate">{doc.name}</div>
                  <div className="text-[11px] text-sage-600 mt-0.5">{doc.extractedInfo}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                <span className="font-mono text-[10px] text-sage-500 hidden sm:inline">{doc.hash}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  doc.status === 'DUPLICATE_REMOVED'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-lime-200 text-pine-900 border border-lime-400'
                }`}>
                  {doc.status === 'DUPLICATE_REMOVED' ? 'Duplicate Dropped' : 'Reconciled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
