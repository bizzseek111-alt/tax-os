import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  Edit3, 
  Scale, 
  FileText,
  BadgeAlert,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Check,
  Building,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Send,
  MessageSquare,
  Search,
  Filter,
  DollarSign,
  Layers,
  Receipt,
  UserCheck
} from 'lucide-react';

export type ReviewDomain = 'INCOME_TAX' | 'STATE_TAX' | 'SALES_TAX' | 'PAYROLL_TAX';
export type CaseStatus = 
  | 'ASSIGNED' 
  | 'READY_FOR_REVIEW' 
  | 'IN_REVIEW' 
  | 'WAITING_FOR_CUSTOMER' 
  | 'WAITING_FOR_AI' 
  | 'NEEDS_SENIOR_REVIEW' 
  | 'NEEDS_ATTORNEY' 
  | 'APPROVED' 
  | 'FILED' 
  | 'REJECTED' 
  | 'DUE_SOON';

interface ReviewCase {
  id: string;
  customerName: string;
  taxYear: number;
  jurisdictions: string[];
  taxDomain: ReviewDomain;
  status: CaseStatus;
  readinessPercent: number;
  materialityCents: number;
  aiConfidencePercent: number;
  evidenceCompletenessPercent: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  
  // AI Review Brief
  aiBrief: {
    taxBaseSummary: string;
    priorYearVariance: string;
    keyPositions: string[];
    statutoryCitations: string[];
    contradictionsFound: string;
    outstandingQuestions: string[];
    aiRecommendation: string;
  };

  // Specific Domain Details
  domainDetails?: {
    salesTax?: {
      nexusStatus: string;
      taxableSales: string;
      exemptSales: string;
      collectedTax: string;
    };
    payroll?: {
      grossWages: string;
      form941Reconciled: boolean;
      suiState: string;
      workerClassStatus: string;
    };
  };
}

export function TaxProfessionalView() {
  const [activeDomain, setActiveDomain] = useState<ReviewDomain>('INCOME_TAX');
  const [activeStatusFilter, setActiveStatusFilter] = useState<CaseStatus>('READY_FOR_REVIEW');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-fed-01');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action state
  const [isModifying, setIsModifying] = useState(false);
  const [overrideValue, setOverrideValue] = useState('710.00');
  const [overrideNote, setOverrideNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Authorized jurisdictions for current logged-in CPA/EA
  const authorizedStates = ['US-FED', 'US-CA', 'US-NY'];

  // Master Cases Repository
  const [cases, setCases] = useState<ReviewCase[]>([
    {
      id: 'case-fed-01',
      customerName: 'Alex Rivera (Sole Prop & W-2)',
      taxYear: 2026,
      jurisdictions: ['US-FED', 'US-CA'],
      taxDomain: 'INCOME_TAX',
      status: 'READY_FOR_REVIEW',
      readinessPercent: 94,
      materialityCents: 14820000,
      aiConfidencePercent: 98,
      evidenceCompletenessPercent: 98.4,
      riskRating: 'LOW',
      deadline: 'April 15, 2027',
      aiBrief: {
        taxBaseSummary: 'Reconciled $92,000 Schedule C consulting 1099-NEC revenue + $56,200 W-2 compensation. Zero duplicate deposits detected.',
        priorYearVariance: '+18.4% gross revenue increase over 2025; deduction profile remains consistent.',
        keyPositions: [
          '26 U.S.C. § 162: $18,490 Schedule C software, cloud hosting & ordinary trade expenses.',
          '26 U.S.C. § 199A: $11,950 20% Qualified Business Income deduction claimed for sole proprietorship.',
          '26 U.S.C. § 274(n): $1,420 Chicago trip restaurant expenses split 50% ($710 deductible / $710 disallowed).'
        ],
        statutoryCitations: ['26 U.S.C. § 61', '26 U.S.C. § 162(a)', '26 U.S.C. § 199A', '26 U.S.C. § 274(n)'],
        contradictionsFound: 'None. All 142 card expenses match uploaded receipt PDFs with unique SHA-256 hashes.',
        outstandingQuestions: ['1 taxpayer inquiry waiting in "Needs You": Travel purpose confirmation for Sept 14 flight.'],
        aiRecommendation: 'Approve positions. Schedule C deduction evidence meets strict Treasury Regulation § 1.162-1 criteria.'
      }
    },
    {
      id: 'case-state-ny-02',
      customerName: 'Elena Rostova (Remote Consultant)',
      taxYear: 2026,
      jurisdictions: ['US-FED', 'US-NY', 'US-NJ'],
      taxDomain: 'STATE_TAX',
      status: 'READY_FOR_REVIEW',
      readinessPercent: 88,
      materialityCents: 16500000,
      aiConfidencePercent: 89,
      evidenceCompletenessPercent: 96.2,
      riskRating: 'HIGH',
      deadline: 'April 15, 2027',
      aiBrief: {
        taxBaseSummary: '$165,000 W-2 wages from Manhattan employer. 42 telecommuting days worked from Jersey City residence.',
        priorYearVariance: 'First year telecommuting out of state; significant New York IT-203 allocation change.',
        keyPositions: [
          '20 NYCRR § 131.18: Convenience of the employer rule allocation. Days worked from NJ require bona fide home office defense.',
          'N.J.S.A. § 54A:4-1: Schedule NJ-COJ credit for income taxes paid to New York State.'
        ],
        statutoryCitations: ['20 NYCRR § 131.18', 'NY Tax Law § 605(b)', 'N.J.S.A. § 54A:4-1'],
        contradictionsFound: 'Telecommuting log indicates work performed in NJ, while Box 16 W-2 shows 100% NY withholding.',
        outstandingQuestions: ['Employer letter requested verifying remote work necessity.'],
        aiRecommendation: 'Senior review recommended to determine if bona fide employer office exception applies.'
      }
    },
    {
      id: 'case-sales-03',
      customerName: 'AeroGear E-Commerce LLC',
      taxYear: 2026,
      jurisdictions: ['US-FED', 'US-CA', 'US-TX', 'US-NY'],
      taxDomain: 'SALES_TAX',
      status: 'READY_FOR_REVIEW',
      readinessPercent: 96,
      materialityCents: 84000000,
      aiConfidencePercent: 99,
      evidenceCompletenessPercent: 99.1,
      riskRating: 'MEDIUM',
      deadline: 'January 20, 2027',
      aiBrief: {
        taxBaseSummary: '$840,000 total digital and physical retail sales across 14 states.',
        priorYearVariance: 'Crossed $500,000 California threshold and $100,000 Texas economic nexus threshold in Q3 2026.',
        keyPositions: [
          'South Dakota v. Wayfair: Economic nexus established in CA (CDTFA-401) and TX (01-114).',
          'Marketplace Facilitator: $320,000 in Amazon sales excluded from direct merchant tax collection.'
        ],
        statutoryCitations: ['Cal. RTC § 6203', 'Tex. Tax Code § 151.051', 'NY Tax Law § 1101(b)'],
        contradictionsFound: 'None. Marketplace facilitator certificates on file.',
        outstandingQuestions: ['None. Return draft balances within $0.02 of General Ledger.'],
        aiRecommendation: 'Approve and queue electronic return transmission to CDTFA and Texas Comptroller.'
      },
      domainDetails: {
        salesTax: {
          nexusStatus: 'Active in CA, TX, NY',
          taxableSales: '$520,000.00',
          exemptSales: '$320,000.00 (Marketplace Facilitated)',
          collectedTax: '$44,200.00'
        }
      }
    },
    {
      id: 'case-payroll-04',
      customerName: 'Apex Cloud Solutions Inc',
      taxYear: 2026,
      jurisdictions: ['US-FED', 'US-CA'],
      taxDomain: 'PAYROLL_TAX',
      status: 'READY_FOR_REVIEW',
      readinessPercent: 95,
      materialityCents: 45000000,
      aiConfidencePercent: 98,
      evidenceCompletenessPercent: 99.5,
      riskRating: 'LOW',
      deadline: 'January 31, 2027',
      aiBrief: {
        taxBaseSummary: 'Quarterly Form 941 reconciliation for 12 full-time employees and 4 independent contractors.',
        priorYearVariance: 'Added 3 new remote employees in Q4.',
        keyPositions: [
          'IRC § 3111: FICA & Medicare taxes reconciled against quarterly EFTPS tax deposits.',
          'California AB 5: Contractor classification review passed for 4 software consultants.'
        ],
        statutoryCitations: ['26 U.S.C. § 3102', '26 U.S.C. § 3111', 'Cal. Lab. Code § 2775'],
        contradictionsFound: 'None. Form 941 Schedule B daily deposit record matches bank EFTPS debits.',
        outstandingQuestions: ['None. All quarterly W-2 boxes balance.'],
        aiRecommendation: 'Authorize Form 941 Q4 transmission and release employee W-2 packets.'
      },
      domainDetails: {
        payroll: {
          grossWages: '$450,000.00',
          form941Reconciled: true,
          suiState: 'CA (3.4% Experience Rate)',
          workerClassStatus: 'All 4 contractors pass AB 5 Part C'
        }
      }
    }
  ]);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleAction = (actionType: string) => {
    setActionNotice(`Action executed: ${actionType} on Case ${selectedCase.id}. Audit event recorded with PTIN.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredCases = cases.filter(c => {
    const matchesDomain = c.taxDomain === activeDomain;
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery);
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Domain Selection Cockpit */}
      <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-forest-950">Professional Review Cockpit</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-forest-900 text-lime-400">
              PTIN #P01948291 • Verified Reviewer
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Authorized jurisdictions: <strong className="text-forest-900">Federal (US-FED), California (US-CA), New York (US-NY)</strong>
          </p>
        </div>

        {/* Domain Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'INCOME_TAX', label: 'Federal Income Tax', icon: FileText },
            { id: 'STATE_TAX', label: 'State Income Tax', icon: Building },
            { id: 'SALES_TAX', label: 'Sales & Use Tax', icon: Receipt },
            { id: 'PAYROLL_TAX', label: 'Payroll & 941', icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveDomain(tab.id as ReviewDomain);
                  const firstMatch = cases.find(c => c.taxDomain === tab.id);
                  if (firstMatch) setSelectedCaseId(firstMatch.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
                  isCurrent 
                    ? 'bg-forest-900 text-lime-400 shadow-xs' 
                    : 'bg-sage-100 hover:bg-sage-200 text-neutral-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-800 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 2. Dual-Pane Workstation: Queue on Left, Case Brief on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Filterable Case Queue */}
        <div className="lg:col-span-4 bg-white border border-sage-300 rounded-3xl p-5 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-forest-950">Queue: {activeDomain.replace('_', ' ')}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-900 font-bold">
              {filteredCases.length} Cases
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter client name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-sage-50 border border-sage-200 rounded-xl text-xs text-forest-950 focus:outline-forest-700"
            />
          </div>

          {/* Cases List */}
          <div className="space-y-2.5">
            {filteredCases.map(c => {
              const isSelected = c.id === selectedCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                    isSelected 
                      ? 'border-forest-900 bg-forest-900/5 shadow-xs' 
                      : 'border-sage-200 hover:border-sage-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-950">{c.customerName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.riskRating === 'HIGH' ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {c.riskRating} Risk
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <span>{c.jurisdictions.join(' • ')}</span>
                    <span className="font-mono font-semibold text-forest-700">{c.readinessPercent}% Ready</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sage-100">
                    <span className="text-neutral-600">Base: ${(c.materialityCents / 100).toLocaleString()}</span>
                    <span className="text-amber-700 font-bold">Due {c.deadline}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Case Deep-Dive & AI Review Brief */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Case Header Card */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sage-200 pb-4">
              <div>
                <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
                  Case Review View • {selectedCase.id}
                </span>
                <h2 className="text-xl font-extrabold text-forest-950 mt-1">
                  {selectedCase.customerName}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600">
                  <span>Tax Year {selectedCase.taxYear}</span>
                  <span>•</span>
                  <span>Jurisdictions: {selectedCase.jurisdictions.join(', ')}</span>
                  <span>•</span>
                  <span>AI Confidence: <strong className="text-forest-700">{selectedCase.aiConfidencePercent}%</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-sage-100 text-forest-950 font-bold text-xs">
                  {selectedCase.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* AI Review Brief */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <h3 className="text-sm font-bold text-forest-950">Executive AI Review Brief</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 space-y-1">
                  <strong className="text-neutral-500 block text-[11px]">Income & Tax Base</strong>
                  <p className="text-neutral-800">{selectedCase.aiBrief.taxBaseSummary}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 space-y-1">
                  <strong className="text-neutral-500 block text-[11px]">Prior-Year Variance</strong>
                  <p className="text-neutral-800">{selectedCase.aiBrief.priorYearVariance}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sage-50 border border-sage-200 text-xs space-y-2">
                <strong className="text-forest-950 block">Key Positions & Citations</strong>
                <ul className="space-y-1.5 text-neutral-700">
                  {selectedCase.aiBrief.keyPositions.map((pos, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCase.aiBrief.outstandingQuestions.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>Outstanding Client Clarifications</span>
                  </div>
                  {selectedCase.aiBrief.outstandingQuestions.map((q, idx) => (
                    <p key={idx} className="text-[11px] text-amber-900">• {q}</p>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-xl bg-forest-950 text-white text-xs space-y-1 border border-forest-900">
                <span className="text-lime-400 font-bold block text-[11px] uppercase tracking-wider">AI Recommendation</span>
                <p className="text-sage-200">{selectedCase.aiBrief.aiRecommendation}</p>
              </div>
            </div>

            {/* Professional Actions Bar */}
            <div className="pt-4 border-t border-sage-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('APPROVE_AND_SIGN')}
                  className="px-4 py-2.5 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Sign Return</span>
                </button>

                <button
                  onClick={() => setIsModifying(!isModifying)}
                  className="px-3.5 py-2.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-neutral-800 font-bold text-xs transition border border-sage-300 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modify Position</span>
                </button>

                <button
                  onClick={() => handleAction('REQUEST_CUSTOMER_INFO')}
                  className="px-3.5 py-2.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-neutral-800 font-bold text-xs transition border border-sage-300 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Client Info</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction('ESCALATE_SENIOR')}
                  className="px-3 py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-amber-900 font-bold text-xs transition border border-sage-300"
                >
                  Escalate Senior
                </button>

                <button
                  onClick={() => handleAction('ESCALATE_ATTORNEY')}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition border border-purple-300"
                >
                  Escalate Attorney
                </button>
              </div>
            </div>

            {/* Position Modification Drawer */}
            {isModifying && (
              <div className="p-4 rounded-2xl bg-sage-100 border border-sage-300 text-xs space-y-3">
                <div className="flex justify-between items-center font-bold text-forest-950">
                  <span>Manual Statutory Override</span>
                  <button onClick={() => setIsModifying(false)} className="text-neutral-500 hover:text-forest-900">Close</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 mb-1">Adjust Deductible Amount ($)</label>
                    <input
                      type="text"
                      value={overrideValue}
                      onChange={(e) => setOverrideValue(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-sage-300 text-forest-950 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 mb-1">Professional Reason for Ledger</label>
                    <input
                      type="text"
                      placeholder="e.g. Travel log confirms client banquet meeting"
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-sage-300 text-forest-950"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleAction(`MANUAL_OVERRIDE_${overrideValue}`);
                    setIsModifying(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs hover:bg-forest-950 transition"
                >
                  Save Override to Audit Ledger
                </button>
              </div>
            )}

          </div>

          {/* Domain Specific Data (Sales Tax or Payroll) */}
          {selectedCase.domainDetails?.salesTax && (
            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-forest-950">Sales Tax Jurisdictional Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Nexus State</span>
                  <strong className="text-forest-950">{selectedCase.domainDetails.salesTax.nexusStatus}</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Taxable Sales</span>
                  <strong className="text-forest-950">{selectedCase.domainDetails.salesTax.taxableSales}</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Exempt Sales</span>
                  <strong className="text-forest-950">{selectedCase.domainDetails.salesTax.exemptSales}</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Collected Tax</span>
                  <strong className="text-forest-700">{selectedCase.domainDetails.salesTax.collectedTax}</strong>
                </div>
              </div>
            </div>
          )}

          {selectedCase.domainDetails?.payroll && (
            <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
              <h3 className="text-sm font-bold text-forest-950">Payroll & Employer Compliance Detail</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Total Gross Wages</span>
                  <strong className="text-forest-950">{selectedCase.domainDetails.payroll.grossWages}</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Form 941 Reconciled</span>
                  <strong className="text-forest-700">Verified Match ✓</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">State SUI Rate</span>
                  <strong className="text-forest-950">{selectedCase.domainDetails.payroll.suiState}</strong>
                </div>
                <div className="p-3 bg-sage-50 rounded-xl">
                  <span className="text-neutral-500 block">Worker Classification</span>
                  <strong className="text-forest-700">{selectedCase.domainDetails.payroll.workerClassStatus}</strong>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
