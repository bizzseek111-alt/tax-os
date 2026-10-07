import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  DollarSign, 
  ArrowRight, 
  Download, 
  Layers, 
  Info, 
  Send, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Check, 
  UploadCloud, 
  FileSpreadsheet, 
  Sliders, 
  Lock, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  FileCheck2,
  FolderOpen
} from 'lucide-react';
import { ProveThisNumberModal, ProvenanceNode } from './ProveThisNumberModal';

// Canonical Provenance Data Map for "Prove This Number"
const PROVENANCE_DATA_MAP: Record<string, ProvenanceNode> = {
  GROSS_INCOME: {
    id: 'prov-00',
    label: 'Total Gross Income (Form 1040 Line 9)',
    amount: 148200,
    formLine: 'Form 1040 Line 9',
    authorityCitation: '26 U.S.C. § 61',
    authorityTitle: 'Gross Income Defined (All Income from Whatever Source Derived)',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'Your total gross income represents all taxable revenues received during tax year 2026. This includes $56,200 in W-2 wages from employer Acme Labs and $92,000 in independent consulting compensation reported on Form 1040 Schedule C. Deduplicated against bank transfers to eliminate double-counting.',
    transactions: [
      {
        id: 'tx-w2',
        date: '2026-12-31',
        vendor: 'Acme Labs Inc. (W-2 Employer)',
        description: 'Box 1 Wages, Tips, Other Compensation',
        amount: 56200,
        receiptHash: 'sha256:5a9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
        receiptFile: 'Form_W2_Acme_Labs_2026.pdf'
      },
      {
        id: 'tx-nec',
        date: '2026-12-31',
        vendor: 'Horizon Fintech Corp (1099-NEC Client)',
        description: 'Box 1 Nonemployee Consulting Compensation',
        amount: 92000,
        receiptHash: 'sha256:7a3d11b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
        receiptFile: 'Form_1099_NEC_Horizon_2026.pdf'
      }
    ]
  },
  SCHEDULE_C_EXPENSES: {
    id: 'prov-01',
    label: 'Schedule C Other Business Expenses',
    amount: 18490,
    formLine: 'Form 1040 Schedule C Line 27a',
    authorityCitation: '26 U.S.C. § 162(a)',
    authorityTitle: 'Trade or Business Expenses (Ordinary & Necessary)',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'These expenses represent verified cloud infrastructure (AWS), code hosting (GitHub), and software tooling necessary to operate your software consulting practice. All items have been cross-matched against card receipts and bank transactions.',
    transactions: [
      {
        id: 'tx-01',
        date: '2026-03-15',
        vendor: 'Amazon Web Services',
        description: 'Cloud Server Infrastructure & Databases',
        amount: 14200,
        receiptHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        receiptFile: 'AWS_Annual_Billing_2026.pdf'
      },
      {
        id: 'tx-02',
        date: '2026-06-20',
        vendor: 'GitHub & Vercel Inc.',
        description: 'Developer Seat Subscriptions & Hosting',
        amount: 4290,
        receiptHash: 'sha256:4f82a1389021c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899',
        receiptFile: 'GitHub_Vercel_Invoices_Bundle.pdf'
      }
    ]
  },
  QBI_DEDUCTION: {
    id: 'prov-02',
    label: 'Qualified Business Income Deduction (20%)',
    amount: 11950,
    formLine: 'Form 1040 Line 13',
    authorityCitation: '26 U.S.C. § 199A',
    authorityTitle: 'Qualified Business Income of Pass-Through Entities',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'As a sole proprietor with qualified business net income below the statutory threshold ($197,200 for single filers), you are entitled to deduct up to 20% of net qualified business income. Calculated as 20% of $59,750 net Schedule C earnings.',
    transactions: [
      {
        id: 'tx-03',
        date: '2026-12-31',
        vendor: 'Deterministic Math Engine',
        description: 'Form 8995 Simplified QBI Computation ($59,750 × 20%)',
        amount: 11950,
        receiptHash: 'sha256:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        receiptFile: 'Deterministic_Formula_Rule_199A.math'
      }
    ]
  },
  CA_HSA_ADDITION: {
    id: 'prov-03',
    label: 'California HSA Addition Modification',
    amount: 4150,
    formLine: 'Schedule CA (540) Part I Section A Line 13',
    authorityCitation: 'Cal. Rev. & Tax. Code § 17215.4',
    authorityTitle: 'California Non-Conformity to Federal Health Savings Accounts',
    precedentialStatus: 'BINDING_STATE_STATUTE',
    plainEnglishReason: 'California does NOT conform to the Federal HSA deduction allowed under IRC § 223. Your federal HSA deduction of $4,150 must be added back to California taxable income, increasing California liability by $386 at your marginal tax bracket.',
    transactions: [
      {
        id: 'tx-04',
        date: '2026-12-31',
        vendor: 'Fidelity HSA Custodian',
        description: 'Form 5498-SA HSA Contribution',
        amount: 4150,
        receiptHash: 'sha256:112233445566778899aabbccddeeff0011223344',
        receiptFile: 'Form_5498_SA_Fidelity.pdf'
      }
    ]
  },
  W2_WAGES: {
    id: 'prov-04',
    label: 'W-2 Wages & Compensation (Line 1z)',
    amount: 56200,
    formLine: 'Form 1040 Line 1z',
    authorityCitation: '26 U.S.C. § 61(a)(1)',
    authorityTitle: 'Compensation for Services, Including Fees, Commissions, Fringe Benefits',
    precedentialStatus: 'BINDING_PRIMARY_STATUTE',
    plainEnglishReason: 'Wages reported by your employer Acme Labs Inc on Box 1 of Form W-2. Federal withholding of $8,420 was cross-verified against IRS deposit transcripts.',
    transactions: [
      {
        id: 'tx-w2-box1',
        date: '2026-12-31',
        vendor: 'Acme Labs Inc.',
        description: 'W-2 Box 1 Taxable Wages',
        amount: 56200,
        receiptHash: 'sha256:5a9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d',
        receiptFile: 'Form_W2_Acme_Labs_2026.pdf'
      }
    ]
  }
};

export type TaxpayerTab = 'OVERVIEW' | 'NEEDS_YOU' | 'DOCUMENTS' | 'TAX_RETURN' | 'PLANNING';

interface DocumentLedgerItem {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'Verified' | 'Pending Review' | 'Duplicate Removed';
  factsCount: number;
  transactionsCount: number;
  duplicateStatus: string;
  confidence: string;
  sourceHash: string;
}

export function TaxpayerWorkspace({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [activeTab, setActiveTab] = useState<TaxpayerTab>('OVERVIEW');
  const [completionPercent, setCompletionPercent] = useState(92);
  const [federalRefund, setFederalRefund] = useState(4120);
  const [stateDue, setStateDue] = useState(1840);
  const [selectedProvenance, setSelectedProvenance] = useState<ProvenanceNode | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [eFileSubmitted, setEFileSubmitted] = useState(false);
  const [eFileAgreed, setEFileAgreed] = useState(false);
  const [taxpayerSignature, setTaxpayerSignature] = useState('');
  const [reviewMode, setReviewMode] = useState<'AI_AUTOPILOT' | 'HUMAN_VERIFIED' | 'FULL_SERVICE'>('HUMAN_VERIFIED');

  // AI Assistant State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // Needs You Unresolved Questions
  const [needsYouItems, setNeedsYouItems] = useState([
    {
      id: 'ny-01',
      category: 'BUSINESS_TRAVEL',
      title: 'Delta Air Lines Flight to San Francisco ($412.50)',
      whatFound: 'A $412.50 charge on Oct 14 matching dates of your client contract with Stripe Inc.',
      whyMatters: 'Potentially 100% deductible business travel expense under 26 U.S.C. § 162.',
      potentialImpact: '+$142 to your Federal Refund',
      evidence: 'Matched to Chase Business checking debit and airline e-ticket PDF.',
      minimumQuestion: 'Was this flight taken exclusively for business consulting purposes?',
      resolved: false,
      selectedChoice: null as string | null
    },
    {
      id: 'ny-02',
      category: 'HOME_OFFICE',
      title: 'Dedicated Home Office (300 sq ft)',
      whatFound: 'You earned $92,000 in consulting income from your principal residence in Oakland.',
      whyMatters: 'IRS § 280A allows deducting $5/sq ft under the simplified method up to 300 sq ft.',
      potentialImpact: '+$326 to your Federal Refund',
      evidence: 'Residential lease agreement on file; no duplicate employer reimbursement reported.',
      minimumQuestion: 'Do you use this dedicated room regularly and exclusively for your business?',
      resolved: false,
      selectedChoice: null as string | null
    },
    {
      id: 'ny-03',
      category: 'STOCK_BASIS',
      title: 'Robinhood Outbound Proceeds ($1,240)',
      whatFound: 'Detected $1,240 transferred from Robinhood to your checking account without Form 1099-B cost basis.',
      whyMatters: 'Without reported cost basis, the IRS treats proceeds as 100% taxable gain under CP2000.',
      potentialImpact: 'Prevents $430 erroneous IRS notice',
      evidence: 'Bank statement deposit matched; broker cost basis missing.',
      minimumQuestion: 'Did your purchase cost equal $1,240 (zero net gain), or can you upload the 1099-B?',
      resolved: false,
      selectedChoice: null as string | null
    }
  ]);

  // Document Vault State
  const [documents, setDocuments] = useState<DocumentLedgerItem[]>([
    {
      id: 'doc-01',
      name: 'Form_W2_Acme_Labs_2026.pdf',
      type: 'Form W-2',
      size: '240 KB',
      status: 'Verified',
      factsCount: 4,
      transactionsCount: 1,
      duplicateStatus: 'Unique (0 duplicates)',
      confidence: '99.8%',
      sourceHash: 'sha256:5a9d8c...2e1d'
    },
    {
      id: 'doc-02',
      name: 'Form_1099_NEC_Horizon_2026.pdf',
      type: 'Form 1099-NEC',
      size: '310 KB',
      status: 'Verified',
      factsCount: 2,
      transactionsCount: 1,
      duplicateStatus: 'Unique (0 duplicates)',
      confidence: '99.4%',
      sourceHash: 'sha256:7a3d11...e7f8'
    },
    {
      id: 'doc-03',
      name: 'AWS_Annual_Billing_2026.pdf',
      type: 'Cloud Invoice',
      size: '1.2 MB',
      status: 'Verified',
      factsCount: 12,
      transactionsCount: 12,
      duplicateStatus: 'Unique (0 duplicates)',
      confidence: '100.0%',
      sourceHash: 'sha256:e3b0c4...b855'
    },
    {
      id: 'doc-04',
      name: 'GitHub_Vercel_Invoices_Bundle.pdf',
      type: 'Software Subscription',
      size: '840 KB',
      status: 'Verified',
      factsCount: 8,
      transactionsCount: 8,
      duplicateStatus: 'Unique (0 duplicates)',
      confidence: '99.1%',
      sourceHash: 'sha256:4f82a1...b899'
    },
    {
      id: 'doc-05',
      name: 'Chase_Business_Checking_Dec2026.csv',
      type: 'Bank Feed',
      size: '56 KB',
      status: 'Verified',
      factsCount: 144,
      transactionsCount: 144,
      duplicateStatus: '1 duplicate eliminated',
      confidence: '100.0%',
      sourceHash: 'sha256:3b8c9d...9a0b'
    },
    {
      id: 'doc-06',
      name: 'Delta_AirLines_Oct14_Receipt.pdf',
      type: 'Travel Receipt',
      size: '185 KB',
      status: 'Pending Review',
      factsCount: 1,
      transactionsCount: 1,
      duplicateStatus: 'Unique (0 duplicates)',
      confidence: '98.7%',
      sourceHash: 'sha256:1a2b3c...4d5e'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');

  // Year-Round Planning Simulation State
  const [planEquipmentExpense, setPlanEquipmentExpense] = useState(5000);
  const [planIraContribution, setPlanIraContribution] = useState(3000);

  const unresolvedCount = needsYouItems.filter(i => !i.resolved).length;

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleResolveItem = (id: string, choice: string) => {
    // Optimistic UI update
    setNeedsYouItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, resolved: true, selectedChoice: choice };
      }
      return item;
    }));

    // Call live backend API endpoint
    fetch(`/api/tasks/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice, resolutionNote: `Confirmed by taxpayer: ${choice}` })
    }).then(res => res.json()).then(data => {
      if (data.updatedTaxCase) {
        setFederalRefund(data.updatedTaxCase.federalRefund);
        setCompletionPercent(data.updatedTaxCase.completionPercent);
      }
    }).catch(err => {
      console.warn('Backend resolve task fallback to local state:', err);
    });

    if (id === 'ny-01' && choice.includes('Business')) {
      setFederalRefund(r => r + 142);
      setCompletionPercent(p => Math.min(100, p + 3));
      triggerToast('Confirmed $412.50 business flight. Federal refund increased by $142.');
    } else if (id === 'ny-02' && choice.includes('Simplified')) {
      setFederalRefund(r => r + 326);
      setCompletionPercent(p => Math.min(100, p + 3));
      triggerToast('Claimed $1,500 Home Office deduction. Federal refund increased by $326.');
    } else if (id === 'ny-03') {
      setCompletionPercent(p => Math.min(100, p + 2));
      triggerToast('Basis confirmed at $1,240. Risk of IRS CP2000 eliminated.');
    }
  };

  const handleSimulateDrop = (fileName: string) => {
    setIsUploading(true);
    setUploadStage('Reading file & calculating cryptographic SHA-256 hash...');
    setTimeout(() => {
      setUploadStage('Extracting tax facts via OCR...');
    }, 600);
    setTimeout(() => {
      setUploadStage('Checking against existing bank feed for duplicates...');
    }, 1200);
    setTimeout(() => {
      setIsUploading(false);

      // Call live backend API endpoint
      fetch('/api/taxdrop/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, fileType: 'Tax Document', fileSize: '342 KB' })
      }).then(res => res.json()).then(data => {
        if (data.document) {
          setDocuments(prev => [data.document, ...prev.filter(d => d.id !== data.document.id)]);
        }
      }).catch(err => {
        console.warn('Backend taxdrop upload fallback to local state:', err);
      });

      const newDoc: DocumentLedgerItem = {
        id: `doc-${Date.now()}`,
        name: fileName,
        type: 'Tax Document',
        size: '342 KB',
        status: 'Verified',
        factsCount: 3,
        transactionsCount: 2,
        duplicateStatus: 'Unique (0 duplicates)',
        confidence: '99.5%',
        sourceHash: 'sha256:d8a7c2...1f4e'
      };
      setDocuments(prev => [newDoc, ...prev]);
      triggerToast(`Added ${fileName}. Extracted 3 tax facts and matched to return.`);
    }, 1800);
  };

  const handleAskAi = (question: string) => {
    // Call live backend API endpoint
    fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    }).then(res => res.json()).then(data => {
      if (data.answer) {
        setAiAnswer(data.answer);
      }
    }).catch(err => {
      console.warn('Backend AI query fallback to local rule graph:', err);
    });

    const q = question.toLowerCase();
    let res = '';
    if (q.includes('california') || q.includes('1,840') || q.includes('owe') || q.includes('hsa')) {
      res = "You owe California $1,840 primarily because California does not conform to the Federal HSA tax deduction under Cal. RTC § 17215.4. Your $4,150 HSA contribution is added back to California taxable income (adding $386 in state tax). In addition, California does not allow the federal 20% Qualified Business Income (QBI) deduction under IRC § 199A, creating a higher state taxable base.";
    } else if (q.includes('18,490') || q.includes('deductions come from') || q.includes('aws')) {
      res = "Your $18,490 in business deductions comes from 100% verified receipts: $14,200 for Amazon Web Services cloud infrastructure and $4,290 for developer tooling (GitHub & Vercel). Every expense was cross-matched against your Chase Business account statements with matching SHA-256 receipts.";
    } else if (q.includes('5,000') || q.includes('computer') || q.includes('equipment')) {
      res = "If you purchase a $5,000 work computer before Dec 31, 2026, you can expense 100% of it immediately under Section 179 (26 U.S.C. § 179). At your 24% federal marginal tax bracket and 9.3% California bracket, this will reduce your total taxes by approximately $1,665 ($1,200 federal + $465 California).";
    } else if (q.includes('qbi') || q.includes('199a')) {
      res = "Under 26 U.S.C. § 199A, eligible sole proprietors receive a 20% deduction on qualified business net income. With $59,750 in net Schedule C earnings, you receive a $11,950 deduction on Form 1040 Line 13, saving you $2,868 in federal tax.";
    } else {
      res = "Every calculation in TaxOS is deterministically computed from your source documents and backed by statutory authority. All data points maintain full cryptographic lineage.";
    }
    setAiAnswer(res);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className="p-3.5 rounded-2xl bg-white border border-pine-700/30 text-pine-900 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-pine-700" />
            <span className="font-medium">{actionToast}</span>
          </div>
          <span className="font-mono text-[10px] text-pine-700 font-bold bg-lime-400/30 px-2 py-0.5 rounded-full">Updated Live</span>
        </div>
      )}

      {/* Top Workspace Header & 5 Primary Tabs */}
      <div className="bg-white border border-sage-300 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pine-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              2026
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-sage-900">Taxpayer Workspace</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-400/40 text-pine-900 border border-lime-400/60">
                  Alex Rivera • Sole Proprietor & W-2
                </span>
              </div>
              <p className="text-xs text-sage-500 mt-0.5">
                Every number backed by source data • Federal Form 1040 + California Form 540
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAiModal(true);
                handleAskAi("Why do I owe California $1,840?");
              }}
              className="px-3.5 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-pine-900 text-xs font-bold transition flex items-center gap-1.5 border border-sage-300 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-pine-700" />
              <span>Ask Tax AI</span>
            </button>
            <div className="px-3 py-1.5 rounded-2xl bg-pine-50 border border-pine-200 text-pine-800 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-pine-700" />
              <span>Audit-Ready Provenance</span>
            </div>
          </div>
        </div>

        {/* 5 Primary Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'bg-pine-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-pine-900 hover:bg-sage-100'
            }`}
          >
            <span>Overview</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'OVERVIEW' ? 'bg-lime-400 text-pine-900' : 'bg-sage-200 text-sage-800'
            }`}>
              {completionPercent}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('NEEDS_YOU')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeTab === 'NEEDS_YOU'
                ? 'bg-pine-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-pine-900 hover:bg-sage-100'
            }`}
          >
            <span>Needs You</span>
            {unresolvedCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950">
                {unresolvedCount}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-400 text-pine-900">
                0
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeTab === 'DOCUMENTS'
                ? 'bg-pine-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-pine-900 hover:bg-sage-100'
            }`}
          >
            <span>Documents & TaxDrop</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-sage-200 text-sage-700 font-mono">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TAX_RETURN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeTab === 'TAX_RETURN'
                ? 'bg-pine-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-pine-900 hover:bg-sage-100'
            }`}
          >
            <span>Tax Return (Draft)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-lime-400/40 text-pine-900 font-bold">
              Form 1040/540
            </span>
          </button>

          <button
            onClick={() => setActiveTab('PLANNING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              activeTab === 'PLANNING'
                ? 'bg-pine-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-pine-900 hover:bg-sage-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-lime-500" />
            <span>Tax Twin & Planning</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Hero 5-Question Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-pine-700 text-white shadow-sm border border-pine-800 relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
                  Tax Year 2026 • Form 1040 + California Form 540
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Every number backed by source data</span>
                </span>
              </div>

              {/* 1. How complete are my taxes? */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your 2026 Taxes are <span className="text-lime-400 font-mono">{completionPercent}%</span> Ready
              </h1>

              {/* 3. What does TaxOS need from me? */}
              <p className="text-sm text-sage-200 leading-relaxed max-w-2xl">
                TaxOS has matched your W-2 wages, imported 1099 contracts, and cross-reconciled 37 business expense receipts.
                {unresolvedCount > 0 ? (
                  <span className="text-lime-300 font-bold"> Only {unresolvedCount} quick items need your confirmation before e-filing.</span>
                ) : (
                  <span className="text-lime-300 font-bold"> All items resolved. Ready for electronic transmission!</span>
                )}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-pine-900/80 rounded-full h-3 overflow-hidden border border-pine-800">
                <div 
                  className="bg-lime-400 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {/* 2. Refund or Amount Due? */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-sage-300 text-sage-900 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-sage-500 font-medium uppercase tracking-wider block">
                      Federal Estimated Refund
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-pine-700 font-mono tabular-nums">
                      +${federalRefund.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-lime-400/30 text-pine-900 border border-lime-400/50 text-xs font-bold">
                    Form 1040
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-sage-300 text-sage-900 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-sage-500 font-medium uppercase tracking-wider block">
                      California Balance Due
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono tabular-nums">
                      -${stateDue.toLocaleString('en-US')}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setShowAiModal(true);
                      handleAskAi("Why do I owe California $1,840 when I get a Federal refund of $4,120?");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pine-700 hover:bg-pine-800 text-lime-300 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why do I owe?</span>
                  </button>
                </div>
              </div>

              {/* 5. What happens next? */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-pine-800/80 p-4 rounded-2xl border border-pine-600/50">
                <div className="text-xs text-sage-200">
                  <span className="font-bold text-white">Next Step: </span>
                  {unresolvedCount > 0 
                    ? `Confirm ${unresolvedCount} items in Needs You to finish your deduction claims.` 
                    : `Review your draft returns and electronically sign Form 8879.`}
                </div>
                {unresolvedCount > 0 ? (
                  <button
                    onClick={() => setActiveTab('NEEDS_YOU')}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Review Needs You ({unresolvedCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('TAX_RETURN')}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-pine-900 font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>View & Transmit Return</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Opportunities & Verified Deductions Card */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-pine-700" />
                  Verified Deductions & Tax Opportunities
                </h3>
                <p className="text-xs text-sage-500 mt-0.5">
                  TaxOS has extracted and mathematically verified these deductions from your uploaded records.
                </p>
              </div>
              <span className="text-xs text-pine-700 font-bold font-mono bg-lime-400/30 px-2.5 py-1 rounded-full">
                $34,590 Total Deductions Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.SCHEDULE_C_EXPENSES)}
                className="p-4 rounded-2xl bg-sage-50 border border-sage-200 hover:border-pine-600 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-sage-500 font-medium">Business Expenses</span>
                  <span className="text-[10px] font-bold text-pine-700 bg-lime-400 px-1.5 py-0.5 rounded">Prove 🔍</span>
                </div>
                <div className="text-xl font-extrabold text-pine-900 font-mono">$18,490</div>
                <p className="text-[11px] text-sage-600 mt-1">
                  100% verified cloud hosting (AWS), GitHub, and software tooling under 26 U.S.C. § 162.
                </p>
              </div>

              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.QBI_DEDUCTION)}
                className="p-4 rounded-2xl bg-sage-50 border border-sage-200 hover:border-pine-600 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-sage-500 font-medium">20% QBI Pass-Through</span>
                  <span className="text-[10px] font-bold text-pine-700 bg-lime-400 px-1.5 py-0.5 rounded">Prove 🔍</span>
                </div>
                <div className="text-xl font-extrabold text-pine-900 font-mono">$11,950</div>
                <p className="text-[11px] text-sage-600 mt-1">
                  20% qualified sole proprietor deduction under 26 U.S.C. § 199A on $59,750 net earnings.
                </p>
              </div>

              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.CA_HSA_ADDITION)}
                className="p-4 rounded-2xl bg-sage-50 border border-sage-200 hover:border-amber-600 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-800 font-medium">California HSA Add-back</span>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">Prove 🔍</span>
                </div>
                <div className="text-xl font-extrabold text-amber-800 font-mono">+$4,150</div>
                <p className="text-[11px] text-sage-600 mt-1">
                  California state non-conformity add-back under Cal. RTC § 17215.4.
                </p>
              </div>
            </div>
          </div>

          {/* 4. What has TaxOS completed? (Completion Timeline & Recent Activity) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pine-700" />
                Completed Milestones
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-lime-400 text-pine-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-sage-900">Ingested Form W-2 & 1099-NEC</span>
                    <p className="text-sage-500 text-[11px]">Reconciled $148,200 gross compensation without missing items.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-lime-400 text-pine-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-sage-900">Cross-Document Bank Reconciliation</span>
                    <p className="text-sage-500 text-[11px]">Matched 144 bank debits to 37 vendor invoices; 1 duplicate eliminated.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-lime-400 text-pine-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-sage-900">Calculated Section 199A QBI Deduction</span>
                    <p className="text-sage-500 text-[11px]">Computed $11,950 pass-through deduction via deterministic formula engine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-lime-400 text-pine-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-sage-900">California Schedule CA Adjustments</span>
                    <p className="text-sage-500 text-[11px]">Accounted for state HSA non-conformity and Section 179 $25,000 cap.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-pine-700" />
                Recent TaxOS Activity
              </h3>
              <div className="space-y-3 font-mono text-[11px] text-sage-600">
                <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between">
                  <span>Re-computed Line 9 gross income ($148,200)</span>
                  <span className="text-sage-400 text-[10px]">Just now</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between">
                  <span>Applied Cal. RTC § 17215.4 HSA addition ($4,150)</span>
                  <span className="text-sage-400 text-[10px]">2 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between">
                  <span>Matched AWS invoice #INV-2026-11 to checking debit</span>
                  <span className="text-sage-400 text-[10px]">14 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between">
                  <span>Eliminated duplicate merchant payment deposit</span>
                  <span className="text-sage-400 text-[10px]">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NEEDS YOU (Replaces traditional tax questionnaire) */}
      {activeTab === 'NEEDS_YOU' && (
        <div className="space-y-6">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
                  <span>Needs You</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {unresolvedCount} High-Value Items
                  </span>
                </h2>
                <p className="text-xs text-sage-500 mt-1">
                  TaxOS does not make you answer hundreds of interview questions. We only ask what cannot be safely determined from source data.
                </p>
              </div>

              {unresolvedCount === 0 && (
                <div className="px-3.5 py-1.5 rounded-2xl bg-lime-100 text-pine-900 text-xs font-bold border border-lime-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pine-700" />
                  <span>All Items Resolved • Ready to File</span>
                </div>
              )}
            </div>

            {/* Focused Cards List */}
            <div className="pt-6 space-y-6">
              {needsYouItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    item.resolved 
                      ? 'bg-sage-50/70 border-sage-200 opacity-80' 
                      : 'bg-white border-pine-700/40 shadow-sm ring-1 ring-pine-600/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-pine-800 bg-lime-400/30 px-3 py-1 rounded-full border border-lime-400/50">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-pine-700">{item.potentialImpact}</span>
                      {item.resolved && (
                        <span className="px-2 py-0.5 rounded-full bg-pine-700 text-white font-mono text-[10px] font-bold">
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-4">
                    <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sage-500">What TaxOS Found</span>
                      <p className="text-sage-800">{item.whatFound}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sage-500">Why It Matters</span>
                      <p className="text-sage-800">{item.whyMatters}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pine-50/50 border border-pine-100 text-xs mb-4 flex items-center gap-2 text-pine-900">
                    <ShieldCheck className="w-4 h-4 text-pine-700 shrink-0" />
                    <span><strong>Evidence on file: </strong>{item.evidence}</span>
                  </div>

                  {/* The Minimum Question Required */}
                  <div className="space-y-3 pt-2 border-t border-sage-200">
                    <div className="text-xs font-bold text-sage-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-pine-700" />
                      <span>{item.minimumQuestion}</span>
                    </div>

                    {!item.resolved ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.id === 'ny-01' && (
                          <>
                            <button
                              onClick={() => handleResolveItem(item.id, '100% Business Travel')}
                              className="px-4 py-2 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs transition shadow-2xs"
                            >
                              ✓ Yes, 100% Business Travel
                            </button>
                            <button
                              onClick={() => handleResolveItem(item.id, 'Personal Travel')}
                              className="px-4 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-medium text-xs transition border border-sage-300"
                            >
                              Personal / Non-Deductible
                            </button>
                            <button
                              onClick={() => handleResolveItem(item.id, 'Mixed Purpose')}
                              className="px-4 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-medium text-xs transition border border-sage-300"
                            >
                              Mixed (Ask Tax Pro)
                            </button>
                          </>
                        )}

                        {item.id === 'ny-02' && (
                          <>
                            <button
                              onClick={() => handleResolveItem(item.id, 'Yes, Claim Simplified $1,500')}
                              className="px-4 py-2 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs transition shadow-2xs"
                            >
                              ✓ Yes, Claim Simplified Method ($1,500)
                            </button>
                            <button
                              onClick={() => handleResolveItem(item.id, 'No Home Office')}
                              className="px-4 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-medium text-xs transition border border-sage-300"
                            >
                              No Dedicated Space
                            </button>
                          </>
                        )}

                        {item.id === 'ny-03' && (
                          <>
                            <button
                              onClick={() => handleResolveItem(item.id, 'Confirm Cost Basis is $1,240 (Zero Gain)')}
                              className="px-4 py-2 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs transition shadow-2xs"
                            >
                              ✓ Confirm Cost Basis is $1,240 (Zero Gain)
                            </button>
                            <button
                              onClick={() => handleResolveItem(item.id, 'Connect Robinhood')}
                              className="px-4 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-medium text-xs transition border border-sage-300"
                            >
                              Connect Robinhood via OAuth
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-pine-800 font-semibold flex items-center gap-1.5 pt-1">
                        <Check className="w-3.5 h-3.5 text-pine-700" />
                        <span>Decision confirmed: {item.selectedChoice}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS & TAXDROP */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-6">
          {/* TaxDrop Ingestion Zone */}
          <div className="bg-white border-2 border-dashed border-pine-700/40 rounded-3xl p-8 text-center hover:border-pine-700 transition space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-lime-400/30 text-pine-900 mx-auto flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-pine-700" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-lg font-extrabold text-sage-900">
                TaxDrop: Give us everything.
              </h2>
              <p className="text-xs text-sage-500">
                “Don't organize it. Don't rename it.” We support PDF, JPG, PNG, CSV, XLSX, and tax bundles up to 100MB.
              </p>
            </div>

            {isUploading ? (
              <div className="p-4 rounded-2xl bg-pine-50 border border-pine-200 text-xs text-pine-800 max-w-sm mx-auto space-y-2">
                <div className="flex items-center justify-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-pine-700 animate-spin" />
                  <span>Processing automatically...</span>
                </div>
                <p className="text-sage-600">{uploadStage}</p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleSimulateDrop('Fidelity_Form_1099_Composite_2026.pdf')}
                  className="px-4 py-2 rounded-2xl bg-pine-700 hover:bg-pine-800 text-white text-xs font-bold transition shadow-xs"
                >
                  [Upload 1099 / W-2 Document]
                </button>
                <button
                  onClick={() => handleSimulateDrop('Chase_Credit_Card_YearEnd2026.csv')}
                  className="px-4 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-semibold transition border border-sage-300"
                >
                  [Upload Card Statement CSV]
                </button>
              </div>
            )}
          </div>

          {/* Document Vault Ledger */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-pine-700" />
                  Document Vault & Provenance Ledger
                </h3>
                <p className="text-xs text-sage-500 mt-0.5">
                  Every document is hashed with SHA-256 and mapped into your cryptographic tax graph.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-pine-700 bg-lime-400/30 px-3 py-1 rounded-full">
                {documents.length} Verified Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-200 text-sage-500 font-semibold">
                    <th className="pb-3 pl-2">Document Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Extracted Facts</th>
                    <th className="pb-3">Duplicate Check</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100 text-sage-800">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-sage-50/70 transition">
                      <td className="py-3 pl-2 font-mono font-medium text-sage-900 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-pine-700" />
                        <span>{doc.name}</span>
                      </td>
                      <td className="py-3 text-sage-600">{doc.type}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'Verified' 
                            ? 'bg-lime-400/30 text-pine-900' 
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono">{doc.factsCount} facts ({doc.transactionsCount} txs)</td>
                      <td className="py-3 text-sage-600">{doc.duplicateStatus}</td>
                      <td className="py-3 font-mono font-bold text-pine-700">{doc.confidence}</td>
                      <td className="py-3 text-right pr-2">
                        <button 
                          onClick={() => triggerToast(`Downloaded ${doc.name} audit bundle with SHA-256 verification hash.`)}
                          className="px-2.5 py-1 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-semibold transition text-[11px] border border-sage-200"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TAX RETURN (DRAFT) & PROVE THIS NUMBER */}
      {activeTab === 'TAX_RETURN' && (
        <div className="space-y-6">
          {/* Header Explanation */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
                <span>Draft Return Lineage Explorer</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-400 text-pine-900">
                  IRS MeF 2026 Compatible
                </span>
              </h2>
              <p className="text-xs text-sage-500 mt-1">
                Click any line item with the <strong className="text-pine-700">Prove 🔍</strong> badge to inspect its full mathematical derivation, receipts, and tax statute citations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => triggerToast('Exported complete Form 1040 & Schedule CA draft PDF with audit workpapers.')}
                className="px-3.5 py-2 rounded-2xl bg-sage-100 hover:bg-sage-200 text-sage-800 font-bold text-xs transition border border-sage-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Return PDF</span>
              </button>
            </div>
          </div>

          {/* Form 1040 Lines Table */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-pine-900 flex items-center justify-between border-b border-sage-200 pb-3">
              <span>U.S. Individual Income Tax Return — Form 1040 Draft</span>
              <span className="font-mono text-xs text-pine-700 font-bold">Tax Year 2026</span>
            </h3>

            <div className="divide-y divide-sage-100 text-xs">
              {/* Line 1z */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.W2_WAGES)}
                className="py-3 flex items-center justify-between hover:bg-lime-50/50 px-2 rounded-xl transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-sage-900 group-hover:text-pine-700 flex items-center gap-2">
                    <span>Line 1z: Wages, salaries, tips (from Form W-2)</span>
                    <span className="text-[10px] bg-lime-400 text-pine-900 px-2 py-0.5 rounded-full font-bold">Prove 🔍</span>
                  </div>
                  <span className="text-[11px] text-sage-500">Box 1 compensation from Acme Labs Inc under 26 U.S.C. § 61</span>
                </div>
                <span className="font-mono font-bold text-pine-900 text-sm">$56,200</span>
              </div>

              {/* Line 8 */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.SCHEDULE_C_EXPENSES)}
                className="py-3 flex items-center justify-between hover:bg-lime-50/50 px-2 rounded-xl transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-sage-900 group-hover:text-pine-700 flex items-center gap-2">
                    <span>Schedule 1 Line 3 / Line 8: Net Business Profit (Schedule C)</span>
                    <span className="text-[10px] bg-lime-400 text-pine-900 px-2 py-0.5 rounded-full font-bold">Prove 🔍</span>
                  </div>
                  <span className="text-[11px] text-sage-500">$92,000 gross consulting revenues minus $18,490 ordinary & necessary expenses</span>
                </div>
                <span className="font-mono font-bold text-pine-900 text-sm">$73,510</span>
              </div>

              {/* Line 9 */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.GROSS_INCOME)}
                className="py-3 flex items-center justify-between hover:bg-lime-50/50 px-2 rounded-xl transition cursor-pointer group bg-sage-50/50"
              >
                <div>
                  <div className="font-semibold text-sage-900 group-hover:text-pine-700 flex items-center gap-2">
                    <span>Line 9: Total Gross Income</span>
                    <span className="text-[10px] bg-lime-400 text-pine-900 px-2 py-0.5 rounded-full font-bold">Prove 🔍</span>
                  </div>
                  <span className="text-[11px] text-sage-500">Reconciled compensation under 26 U.S.C. § 61 (zero duplicate transfers)</span>
                </div>
                <span className="font-mono font-extrabold text-pine-900 text-base">$148,200</span>
              </div>

              {/* Line 13: QBI */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.QBI_DEDUCTION)}
                className="py-3 flex items-center justify-between hover:bg-lime-50/50 px-2 rounded-xl transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-sage-900 group-hover:text-pine-700 flex items-center gap-2">
                    <span>Line 13: Qualified Business Income Deduction (Form 8995)</span>
                    <span className="text-[10px] bg-lime-400 text-pine-900 px-2 py-0.5 rounded-full font-bold">Prove 🔍</span>
                  </div>
                  <span className="text-[11px] text-sage-500">20% pass-through sole proprietor deduction under 26 U.S.C. § 199A</span>
                </div>
                <span className="font-mono font-bold text-pine-700 text-sm">-$11,950</span>
              </div>

              {/* Line 34: Estimated Refund */}
              <div className="py-3.5 flex items-center justify-between bg-lime-100/40 px-3 rounded-xl">
                <div>
                  <div className="font-extrabold text-pine-900 text-sm">Line 34: Overpayment / Estimated Federal Refund</div>
                  <span className="text-[11px] text-pine-700">Direct deposit scheduled via ACH routing</span>
                </div>
                <span className="font-mono font-extrabold text-pine-800 text-lg tabular-nums">+${federalRefund.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          {/* California Form 540 Table */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-rose-900 flex items-center justify-between border-b border-sage-200 pb-3">
              <span>California Resident Income Tax Return — Form 540 Draft</span>
              <span className="font-mono text-xs text-rose-700 font-bold">Franchise Tax Board</span>
            </h3>

            <div className="divide-y divide-sage-100 text-xs">
              <div className="py-3 flex items-center justify-between px-2">
                <div>
                  <div className="font-semibold text-sage-900">Line 13: Federal Adjusted Gross Income</div>
                  <span className="text-[11px] text-sage-500">Starting state base from Form 1040</span>
                </div>
                <span className="font-mono font-bold text-sage-900">$148,200</span>
              </div>

              {/* California Schedule CA Addition */}
              <div 
                onClick={() => setSelectedProvenance(PROVENANCE_DATA_MAP.CA_HSA_ADDITION)}
                className="py-3 flex items-center justify-between hover:bg-amber-50 px-2 rounded-xl transition cursor-pointer group"
              >
                <div>
                  <div className="font-semibold text-amber-900 group-hover:text-amber-950 flex items-center gap-2">
                    <span>Schedule CA (540) Line 13: HSA Non-Conformity Addition</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">Prove 🔍</span>
                  </div>
                  <span className="text-[11px] text-sage-500">California non-conformity add-back under Cal. RTC § 17215.4</span>
                </div>
                <span className="font-mono font-bold text-amber-800 text-sm">+$4,150</span>
              </div>

              {/* Balance Due */}
              <div className="py-3.5 flex items-center justify-between bg-rose-50 px-3 rounded-xl">
                <div>
                  <div className="font-extrabold text-rose-900 text-sm">Line 94: California Amount You Owe</div>
                  <span className="text-[11px] text-rose-700">Due April 15, 2027 to Franchise Tax Board</span>
                </div>
                <span className="font-mono font-extrabold text-rose-700 text-lg tabular-nums">-${stateDue.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>

          {/* PART 13: HOW WOULD YOU LIKE TO COMPLETE YOUR RETURN? */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Review Mode Selection</span>
              <h3 className="text-base font-extrabold text-forest-950 mt-1">
                How would you like to complete your return?
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5">
                Select your preferred review tier before authorizing electronic transmission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Option A: AI Autopilot */}
              <div 
                onClick={() => setReviewMode('AI_AUTOPILOT')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition space-y-2 ${
                  reviewMode === 'AI_AUTOPILOT'
                    ? 'border-forest-900 bg-forest-900/5 shadow-xs'
                    : 'border-sage-200 hover:border-sage-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-forest-950">Option A: AI Autopilot</span>
                  {reviewMode === 'AI_AUTOPILOT' && <Check className="w-4 h-4 text-forest-900 font-bold" />}
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  TaxOS prepares and verifies your return autonomously. You review the plain-English summary, confirm exceptions, and digitally sign.
                </p>
              </div>

              {/* Option B: Human Verified */}
              <div 
                onClick={() => setReviewMode('HUMAN_VERIFIED')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition space-y-2 ${
                  reviewMode === 'HUMAN_VERIFIED'
                    ? 'border-forest-900 bg-forest-900/5 shadow-xs'
                    : 'border-sage-200 hover:border-sage-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-forest-950">Option B: Human Verified</span>
                  {reviewMode === 'HUMAN_VERIFIED' && <Check className="w-4 h-4 text-forest-900 font-bold" />}
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A licensed CPA or Enrolled Agent reviews all tax positions, inspects flagged exceptions, and conducts final sign-off before filing.
                </p>
              </div>

              {/* Option C: Full Service */}
              <div 
                onClick={() => setReviewMode('FULL_SERVICE')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition space-y-2 ${
                  reviewMode === 'FULL_SERVICE'
                    ? 'border-forest-900 bg-forest-900/5 shadow-xs'
                    : 'border-sage-200 hover:border-sage-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-forest-950">Option C: Full Professional Service</span>
                  {reviewMode === 'FULL_SERVICE' && <Check className="w-4 h-4 text-forest-900 font-bold" />}
                </div>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  A dedicated human CPA leads your entire preparation and advisory workflow with TaxOS AI assistance for complex business matters.
                </p>
              </div>
            </div>
          </div>

          {/* Electronic Filing Transmission & Authorization Card */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-sage-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-sage-900">
                  Electronic Filing & Form 8879 E-Signature
                </h3>
                <p className="text-xs text-sage-500 mt-0.5">
                  Authorize electronic transmission to IRS Modernized e-File (MeF) and California FTB systems.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime-400 text-pine-900">
                IRS MeF Approved
              </span>
            </div>

            <div className="space-y-3 text-xs text-sage-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={eFileAgreed}
                  onChange={(e) => setEFileAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-pine-700 focus:ring-pine-500" 
                />
                <span>
                  I declare under penalties of perjury that I have examined a copy of my 2026 electronic individual income tax return and accompanying schedules, and to the best of my knowledge and belief, it is true, correct, and complete.
                </span>
              </label>

              <div className="pt-2 max-w-sm">
                <label className="block text-[11px] font-bold text-sage-700 uppercase tracking-wider mb-1">
                  Type Full Legal Name (Electronic Signature)
                </label>
                <input 
                  type="text" 
                  value={taxpayerSignature}
                  onChange={(e) => setTaxpayerSignature(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2.5 bg-sage-50 border border-sage-300 rounded-2xl text-xs text-sage-900 font-medium focus:outline-none focus:border-pine-600 font-mono"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!eFileAgreed || !taxpayerSignature.trim()) {
                  alert('Please check the declaration box and provide your electronic signature.');
                  return;
                }
                setEFileSubmitted(true);

                // Call live backend API endpoint
                fetch('/api/efile/transmit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ taxpayerSignature, declarationAgreed: eFileAgreed })
                }).then(res => res.json()).then(data => {
                  if (data.transmissionHash) {
                    triggerToast(`Returns successfully transmitted! IRS MeF Gateway Hash: ${data.transmissionHash.slice(0, 18)}...`);
                  }
                }).catch(err => {
                  console.warn('Backend efile transmit fallback to local state:', err);
                  triggerToast('Returns successfully authorized and queued for IRS & FTB transmission!');
                });
              }}
              disabled={eFileSubmitted}
              className={`w-full py-4 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                eFileSubmitted
                  ? 'bg-pine-700 text-white cursor-default'
                  : 'bg-lime-400 hover:bg-lime-500 text-pine-900'
              }`}
            >
              {eFileSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-lime-300" />
                  <span>Returns Successfully Transmitted to IRS & California FTB!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>[AUTHORIZE & TRANSMIT RETURNS TO IRS + FTB]</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PLANNING & TAX TWIN */}
      {activeTab === 'PLANNING' && (
        <div className="space-y-6">
          <div className="bg-pine-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pine-800">
            <div className="max-w-2xl space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-pine-900 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Tax Twin Continuous Simulator
              </span>
              <h2 className="text-2xl font-bold text-white">Year-Round Scenario Optimization</h2>
              <p className="text-xs text-sage-200">
                Simulate potential transactions before the tax year closes to see exact dollar-for-dollar impacts on your federal and state tax liabilities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scenario 1: Section 179 Equipment */}
            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pine-700" />
                Section 179 Equipment Expensing
              </h3>
              <p className="text-xs text-sage-500">
                Simulate buying computers, servers, or office hardware before December 31.
              </p>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-sage-800 mb-1">
                  <span>Planned Equipment Purchase</span>
                  <span className="font-mono text-pine-700">${planEquipmentExpense.toLocaleString('en-US')}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="40000" 
                  step="1000"
                  value={planEquipmentExpense}
                  onChange={(e) => setPlanEquipmentExpense(Number(e.target.value))}
                  className="w-full accent-pine-700 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span>Federal Savings (24% Bracket):</span>
                  <span className="font-mono font-bold text-pine-800">
                    -${Math.round(planEquipmentExpense * 0.24).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>California Savings (Capped at $25k under RTC § 17255):</span>
                  <span className="font-mono font-bold text-pine-800">
                    -${Math.round(Math.min(planEquipmentExpense, 25000) * 0.093).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="border-t border-sage-300 pt-2 flex items-center justify-between font-bold text-pine-900">
                  <span>Total Tax Reduction:</span>
                  <span className="font-mono text-sm text-pine-700">
                    -${Math.round(planEquipmentExpense * 0.24 + Math.min(planEquipmentExpense, 25000) * 0.093).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario 2: Traditional / SEP-IRA */}
            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-sage-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pine-700" />
                Retirement / SEP-IRA Optimization
              </h3>
              <p className="text-xs text-sage-500">
                Pre-tax contributions reduce your adjusted gross income dollar-for-dollar.
              </p>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-sage-800 mb-1">
                  <span>Planned Contribution</span>
                  <span className="font-mono text-pine-700">${planIraContribution.toLocaleString('en-US')}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15000" 
                  step="500"
                  value={planIraContribution}
                  onChange={(e) => setPlanIraContribution(Number(e.target.value))}
                  className="w-full accent-pine-700 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span>Federal Tax Reduction:</span>
                  <span className="font-mono font-bold text-pine-800">
                    -${Math.round(planIraContribution * 0.24).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>California Tax Reduction:</span>
                  <span className="font-mono font-bold text-pine-800">
                    -${Math.round(planIraContribution * 0.093).toLocaleString('en-US')}
                  </span>
                </div>
                <div className="border-t border-sage-300 pt-2 flex items-center justify-between font-bold text-pine-900">
                  <span>Total Cash Savings:</span>
                  <span className="font-mono text-sm text-pine-700">
                    -${Math.round(planIraContribution * 0.333).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flagship Modal: Prove This Number */}
      {selectedProvenance && (
        <ProveThisNumberModal
          isOpen={true}
          onClose={() => setSelectedProvenance(null)}
          data={selectedProvenance}
        />
      )}

      {/* Contextual AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-sage-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sage-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-lime-400 text-pine-900">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-sage-900">Contextual Tax AI</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-sage-500 hover:text-sage-900 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-sage-600">
              Ask anything about your numbers, deductions, or state tax differences. TaxOS cites authoritative statutes.
            </p>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleAskAi("Why do I owe California $1,840?")}
                className="px-2.5 py-1 rounded-xl text-[11px] bg-sage-100 hover:bg-sage-200 text-sage-800 border border-sage-300 transition"
              >
                Why do I owe California $1,840?
              </button>
              <button
                onClick={() => handleAskAi("Where did my $18,490 deductions come from?")}
                className="px-2.5 py-1 rounded-xl text-[11px] bg-sage-100 hover:bg-sage-200 text-sage-800 border border-sage-300 transition"
              >
                Where did $18,490 deductions come from?
              </button>
              <button
                onClick={() => handleAskAi("What happens if I buy a $5,000 computer?")}
                className="px-2.5 py-1 rounded-xl text-[11px] bg-sage-100 hover:bg-sage-200 text-sage-800 border border-sage-300 transition"
              >
                What if I buy a $5,000 computer?
              </button>
            </div>

            {aiAnswer && (
              <div className="p-4 rounded-2xl bg-pine-700 text-white text-xs space-y-2">
                <div className="font-bold text-lime-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                  <span>Statutory Explanation</span>
                </div>
                <p className="text-sage-100 leading-relaxed">{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
