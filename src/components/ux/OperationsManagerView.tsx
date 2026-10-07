import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Shuffle, 
  ShieldCheck, 
  Lock, 
  Unlock,
  TrendingDown, 
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Filter,
  Key,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Send,
  UserCheck,
  FileText,
  Percent,
  Search,
  CheckCircle,
  Eye,
  Sliders,
  Award
} from 'lucide-react';

interface PodWorkload {
  id: string;
  name: string;
  lead: string;
  capacityPercent: number;
  activeCases: number;
  specialization: string;
}

interface MaskedCasePipeline {
  id: string;
  maskedName: string;
  realName: string;
  maskedSsn: string;
  realSsn: string;
  assignedPod: string;
  questionsToFile: number;
  aiExceptionRate: string;
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  stuckReason: 'NONE' | 'MISSING_DOCS' | 'AB5_CONTRACTOR' | 'PLAID_REAUTH' | 'VARIANCE_FLAG' | 'ATTORNEY_ESCALATION';
  stuckDurationDays: number;
  domain: string;
}

interface ReviewerMember {
  id: string;
  name: string;
  role: string;
  licenses: string[];
  activeCases: number;
  completedToday: number;
  capacityHours: number;
  utilizationPercent: number;
  overrideRate: string;
  qaScore: string;
}

interface QASampleRecord {
  id: string;
  caseId: string;
  maskedClient: string;
  domain: string;
  reviewer: string;
  aiProposedValue: string;
  cpaFinalizedValue: string;
  varianceReason: string;
  statutoryBasis: string;
  qaStatus: 'PASSED' | 'FLAGGED_REMEDIATION' | 'PENDING';
}

export function OperationsManagerView() {
  const [activeOpsTab, setActiveOpsTab] = useState<'TAX_OPS' | 'REVIEW_OPS'>('TAX_OPS');
  
  // Tax Operations State
  const [selectedPodFilter, setSelectedPodFilter] = useState<string>('ALL');
  const [selectedStuckFilter, setSelectedStuckFilter] = useState<string>('ALL');
  const [isPiiUnmasked, setIsPiiUnmasked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [unmaskAuditLog, setUnmaskAuditLog] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Review Operations State
  const [selectedQaSample, setSelectedQaSample] = useState<QASampleRecord | null>(null);

  const [pods, setPods] = useState<PodWorkload[]>([
    {
      id: 'pod-a',
      name: 'Enrolled Agent Pod A (Individual & Creators)',
      lead: 'Sarah Jenkins, EA',
      capacityPercent: 82,
      activeCases: 94,
      specialization: 'Schedule C / Freelancer / W-2'
    },
    {
      id: 'pod-b',
      name: 'Enrolled Agent Pod B (Sole Proprietorships)',
      lead: 'Michael Chang, EA',
      capacityPercent: 64,
      activeCases: 68,
      specialization: 'Single-Member LLC / Depreciation'
    },
    {
      id: 'pod-c',
      name: 'Senior CPA Pod (Multi-State & Controversy)',
      lead: 'Rebecca Taylor, CPA',
      capacityPercent: 94,
      activeCases: 112,
      specialization: 'NY / NJ / CA Sourcing & AB 5'
    },
    {
      id: 'pod-d',
      name: 'Business & Indirect Tax Pod (Sales & Payroll)',
      lead: 'David Kim, EA & CPA',
      capacityPercent: 74,
      activeCases: 86,
      specialization: 'Wayfair Nexus / Form 941 Payroll'
    }
  ]);

  const [pipelineCases, setPipelineCases] = useState<MaskedCasePipeline[]>([
    {
      id: 'case-901',
      maskedName: 'A*** R****',
      realName: 'Alex Rivera',
      maskedSsn: '•••-••-9482',
      realSsn: '123-45-9482',
      assignedPod: 'pod-a',
      questionsToFile: 1,
      aiExceptionRate: '4.2%',
      slaStatus: 'ON_TRACK',
      priority: 'NORMAL',
      stuckReason: 'NONE',
      stuckDurationDays: 0,
      domain: 'Individual (Fed + CA)'
    },
    {
      id: 'case-902',
      maskedName: 'E**** R******',
      realName: 'Elena Rostova',
      maskedSsn: '•••-••-1102',
      realSsn: '987-65-1102',
      assignedPod: 'pod-c',
      questionsToFile: 2,
      aiExceptionRate: '8.4%',
      slaStatus: 'AT_RISK',
      priority: 'HIGH',
      stuckReason: 'AB5_CONTRACTOR',
      stuckDurationDays: 3,
      domain: 'Multi-State Sourcing (NY + NJ)'
    },
    {
      id: 'case-903',
      maskedName: 'M***** V****',
      realName: 'Marcus Vance',
      maskedSsn: '•••-••-4481',
      realSsn: '456-78-4481',
      assignedPod: 'pod-b',
      questionsToFile: 0,
      aiExceptionRate: '1.2%',
      slaStatus: 'ON_TRACK',
      priority: 'NORMAL',
      stuckReason: 'NONE',
      stuckDurationDays: 0,
      domain: 'LLC / Schedule C'
    },
    {
      id: 'case-904',
      maskedName: 'D**** K****',
      realName: 'David Kim',
      maskedSsn: '•••-••-7729',
      realSsn: '321-65-7729',
      assignedPod: 'pod-a',
      questionsToFile: 3,
      aiExceptionRate: '11.0%',
      slaStatus: 'AT_RISK',
      priority: 'HIGH',
      stuckReason: 'MISSING_DOCS',
      stuckDurationDays: 5,
      domain: 'Schedule C / Freelance'
    },
    {
      id: 'case-905',
      maskedName: 'S**** B*****',
      realName: 'Sophia Bennett',
      maskedSsn: '•••-••-3321',
      realSsn: '554-32-3321',
      assignedPod: 'pod-c',
      questionsToFile: 4,
      aiExceptionRate: '14.2%',
      slaStatus: 'BREACHED',
      priority: 'CRITICAL',
      stuckReason: 'ATTORNEY_ESCALATION',
      stuckDurationDays: 7,
      domain: 'AB 5 Worker Classification'
    },
    {
      id: 'case-906',
      maskedName: 'T****** O******',
      realName: 'Thomas Owens',
      maskedSsn: '•••-••-8819',
      realSsn: '412-99-8819',
      assignedPod: 'pod-d',
      questionsToFile: 1,
      aiExceptionRate: '3.1%',
      slaStatus: 'ON_TRACK',
      priority: 'NORMAL',
      stuckReason: 'PLAID_REAUTH',
      stuckDurationDays: 2,
      domain: 'Sales Tax (Wayfair Nexus)'
    },
    {
      id: 'case-907',
      maskedName: 'C**** H******',
      realName: 'Claire Hudson',
      maskedSsn: '•••-••-6254',
      realSsn: '602-18-6254',
      assignedPod: 'pod-b',
      questionsToFile: 2,
      aiExceptionRate: '9.0%',
      slaStatus: 'AT_RISK',
      priority: 'HIGH',
      stuckReason: 'VARIANCE_FLAG',
      stuckDurationDays: 4,
      domain: 'Business Sec 179 Depreciation'
    }
  ]);

  const [reviewers] = useState<ReviewerMember[]>([
    {
      id: 'rev-01',
      name: 'Sarah Jenkins',
      role: 'Lead Enrolled Agent',
      licenses: ['IRS EA', 'CA CTEC'],
      activeCases: 14,
      completedToday: 9,
      capacityHours: 8,
      utilizationPercent: 88,
      overrideRate: '2.8%',
      qaScore: '99.9%'
    },
    {
      id: 'rev-02',
      name: 'Michael Chang',
      role: 'Enrolled Agent',
      licenses: ['IRS EA'],
      activeCases: 11,
      completedToday: 7,
      capacityHours: 8,
      utilizationPercent: 72,
      overrideRate: '3.1%',
      qaScore: '99.7%'
    },
    {
      id: 'rev-03',
      name: 'Rebecca Taylor',
      role: 'Senior CPA & Multi-State Lead',
      licenses: ['CPA (NY, NJ, CA)', 'AICPA'],
      activeCases: 19,
      completedToday: 12,
      capacityHours: 8,
      utilizationPercent: 96,
      overrideRate: '4.6%',
      qaScore: '100%'
    },
    {
      id: 'rev-04',
      name: 'David Kim',
      role: 'Indirect & Payroll Specialist',
      licenses: ['IRS EA', 'CPA (IL)'],
      activeCases: 13,
      completedToday: 8,
      capacityHours: 8,
      utilizationPercent: 78,
      overrideRate: '2.4%',
      qaScore: '99.8%'
    },
    {
      id: 'rev-05',
      name: 'Amanda Brooks',
      role: 'Staff Preparer',
      licenses: ['CPA Eligible', 'IRS PTIN'],
      activeCases: 8,
      completedToday: 6,
      capacityHours: 8,
      utilizationPercent: 62,
      overrideRate: '1.9%',
      qaScore: '99.5%'
    }
  ]);

  const [qaSamples, setQaSamples] = useState<QASampleRecord[]>([
    {
      id: 'qa-401',
      caseId: 'case-907',
      maskedClient: 'C**** H******',
      domain: 'Federal Schedule C',
      reviewer: 'Michael Chang, EA',
      aiProposedValue: '$18,400 Vehicle Sec 179',
      cpaFinalizedValue: '$12,200 Luxury Auto Cap Applied',
      varianceReason: 'IRC § 280F passenger automobile first-year depreciation limit enforced after verifying gross vehicle weight < 6,000 lbs.',
      statutoryBasis: '26 U.S.C. § 280F(a)(1)(A)',
      qaStatus: 'PASSED'
    },
    {
      id: 'qa-402',
      caseId: 'case-902',
      maskedClient: 'E**** R******',
      domain: 'New York Nonresident (IT-203)',
      reviewer: 'Rebecca Taylor, CPA',
      aiProposedValue: '35% NY Sourced Allocation',
      cpaFinalizedValue: '62% NY Sourced Allocation',
      varianceReason: 'Convenience of the employer rule applied. Remote telecommuting days treated as NY working days because telecommuting was for employee personal preference, not bona fide employer necessity.',
      statutoryBasis: '20 NYCRR § 131.18',
      qaStatus: 'PASSED'
    },
    {
      id: 'qa-403',
      caseId: 'case-905',
      maskedClient: 'S**** B*****',
      domain: 'California Schedule C',
      reviewer: 'Sarah Jenkins, EA',
      aiProposedValue: '$4,150 HSA Federal Deduction',
      cpaFinalizedValue: '$0 HSA Deduction (RTC Non-Conformity)',
      varianceReason: 'California does not conform to IRC § 223. Form 540 Schedule CA adjustment line 13 addition enforced.',
      statutoryBasis: 'Cal. Rev. & Tax. Code § 17215.4',
      qaStatus: 'PASSED'
    },
    {
      id: 'qa-404',
      caseId: 'case-906',
      maskedClient: 'T****** O******',
      domain: 'Sales Tax (Wayfair Nexus)',
      reviewer: 'David Kim, EA',
      aiProposedValue: 'Wholesale B2B Gross Taxable',
      cpaFinalizedValue: 'Exempt B2B Resale Verified',
      varianceReason: 'Resale certificates validated against CDTFA seller permit database; transaction properly excluded from taxable receipts.',
      statutoryBasis: 'Cal. Code Regs. tit. 18, § 1668',
      qaStatus: 'PENDING'
    }
  ]);

  const handleAutoRebalance = () => {
    setPods(prev => prev.map(p => {
      if (p.id === 'pod-c') return { ...p, capacityPercent: 78, activeCases: 92 };
      if (p.id === 'pod-b') return { ...p, capacityPercent: 79, activeCases: 88 };
      return p;
    }));
    setActionSuccessNotice('Workload rebalanced! 20 cases safely routed from Senior CPA Pod C to Pod B.');
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const handleNudgeCustomer = (caseId: string, clientName: string) => {
    setActionSuccessNotice(`SMS & Email reminder sent to ${clientName} for pending documents on ${caseId}.`);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  const handleRetriggerAgent = (caseId: string) => {
    setPipelineCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, slaStatus: 'ON_TRACK', aiExceptionRate: '0.0%', stuckReason: 'NONE' };
      }
      return c;
    }));
    setActionSuccessNotice(`Agent pipeline re-triggered for ${caseId}. Background DAG re-computation in progress.`);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  const handleElevateCase = (caseId: string) => {
    setPipelineCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return { ...c, priority: 'CRITICAL', assignedPod: 'pod-c' };
      }
      return c;
    }));
    setActionSuccessNotice(`Case ${caseId} elevated to CRITICAL and routed to Senior CPA Pod C.`);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  const handleAuthorizeUnmask = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput.length >= 4) {
      setIsPiiUnmasked(true);
      setShowPinModal(false);
      setPinInput('');
      setUnmaskAuditLog(`AUDIT EVENT #SEC-9821: Taxpayer PII unmasked by Operations Manager at ${new Date().toLocaleTimeString()} (Justification: Pre-filing QA Audit).`);
    } else {
      alert("Invalid Supervisor PIN. Enter '2026' to authorize.");
    }
  };

  const filteredCases = pipelineCases.filter(c => {
    const matchesPod = selectedPodFilter === 'ALL' || c.assignedPod === selectedPodFilter;
    const matchesStuck = selectedStuckFilter === 'ALL' || c.stuckReason === selectedStuckFilter;
    return matchesPod && matchesStuck;
  });

  return (
    <div className="space-y-6">
      {/* Cockpit Mode Toggle Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sage-300 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#08211C] tracking-tight flex items-center gap-2">
            <span>Tax Operations & Quality Cockpit</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C2E8A2] text-[#08211C] border border-[#A4D67A]">
              Live Telemetry Active
            </span>
          </h1>
          <p className="text-xs text-sage-600 mt-0.5">
            Real-time bottleneck detection, reviewer capacity, and compliance QA sampling.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-sage-100 p-1.5 rounded-2xl border border-sage-300">
          <button
            onClick={() => setActiveOpsTab('TAX_OPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeOpsTab === 'TAX_OPS'
                ? 'bg-[#122A26] text-white shadow-xs'
                : 'text-sage-700 hover:text-sage-900 hover:bg-white/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tax Operations ("Where is work stuck?")</span>
          </button>
          <button
            onClick={() => setActiveOpsTab('REVIEW_OPS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeOpsTab === 'REVIEW_OPS'
                ? 'bg-[#122A26] text-white shadow-xs'
                : 'text-sage-700 hover:text-sage-900 hover:bg-white/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Review Operations (QA & Capacity)</span>
          </button>
        </div>
      </div>

      {actionSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-[#EDF8E5] border border-[#C2E8A2] text-[#08211C] text-xs flex items-center gap-2 font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#1E5642]" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {unmaskAuditLog && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span className="font-medium">{unmaskAuditLog}</span>
          </div>
          <button
            onClick={() => {
              setIsPiiUnmasked(false);
              setUnmaskAuditLog(null);
            }}
            className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-bold"
          >
            Re-Mask PII
          </button>
        </div>
      )}

      {/* ============================================================
          TAB 1: TAX OPERATIONS ("Where is work stuck?")
         ============================================================ */}
      {activeOpsTab === 'TAX_OPS' && (
        <div className="space-y-6">
          {/* Top Metric Strip: Where is work stuck? */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Total Active Filings</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">1,428</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">98.2% on schedule</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Ready for Review</span>
              <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">342</span>
              <span className="text-[10px] text-sage-500 font-medium">Avg wait: 2.1 hrs</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Waiting on Customer</span>
              <span className="text-xl font-extrabold font-mono text-amber-700 mt-1 block">184</span>
              <span className="text-[10px] text-amber-700 font-semibold">Avg queue age: 4.2 days</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Waiting on Attorney</span>
              <span className="text-xl font-extrabold font-mono text-purple-700 mt-1 block">14</span>
              <span className="text-[10px] text-purple-700 font-medium">Privileged § 7525</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Imminent Deadlines</span>
              <span className="text-xl font-extrabold font-mono text-rose-700 mt-1 block">18</span>
              <span className="text-[10px] text-rose-700 font-semibold">Due today • 142 this week</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Questions to File (QtF)</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">1.1</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">Target ≤ 2.5 (Industry beat)</span>
            </div>
          </div>

          {/* Bottleneck Diagnostic Bar & Quick Filter */}
          <div className="bg-white border border-sage-300 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-sage-900 uppercase tracking-wider">
                  Bottleneck Root Cause Analyzer (Click reason to isolate stalled cases)
                </h3>
              </div>
              <span className="text-[11px] text-sage-500 font-medium">
                Avg Intake-to-Transmission: <strong className="text-sage-800">18.4 hours</strong> • Failure Rate: <strong className="text-sage-800">0.3%</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <button
                onClick={() => setSelectedStuckFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  selectedStuckFilter === 'ALL' 
                    ? 'bg-[#122A26] text-white shadow-2xs' 
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                All Pipeline ({pipelineCases.length})
              </button>
              <button
                onClick={() => setSelectedStuckFilter('MISSING_DOCS')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  selectedStuckFilter === 'MISSING_DOCS'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Missing 1099/W-2</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-mono font-bold">42</span>
              </button>
              <button
                onClick={() => setSelectedStuckFilter('AB5_CONTRACTOR')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  selectedStuckFilter === 'AB5_CONTRACTOR'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>AB 5 Worker Classification</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-mono font-bold">28</span>
              </button>
              <button
                onClick={() => setSelectedStuckFilter('PLAID_REAUTH')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  selectedStuckFilter === 'PLAID_REAUTH'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Bank Plaid Re-auth Needed</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-mono font-bold">19</span>
              </button>
              <button
                onClick={() => setSelectedStuckFilter('VARIANCE_FLAG')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  selectedStuckFilter === 'VARIANCE_FLAG'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span>Prior-Year Variance &gt; 25%</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-mono font-bold">31</span>
              </button>
              <button
                onClick={() => setSelectedStuckFilter('ATTORNEY_ESCALATION')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
                  selectedStuckFilter === 'ATTORNEY_ESCALATION'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <span>Attorney Escalation (§ 7525)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-200 text-purple-950 font-mono font-bold">14</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Team Capacity Pods */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
                  Workload Pods (Click to Filter)
                </span>
                <div className="flex items-center gap-2">
                  {selectedPodFilter !== 'ALL' && (
                    <button
                      onClick={() => setSelectedPodFilter('ALL')}
                      className="text-[11px] text-[#1E5642] font-bold hover:underline"
                    >
                      Reset Filter
                    </button>
                  )}
                  <button
                    onClick={handleAutoRebalance}
                    className="px-2.5 py-1 rounded-xl bg-[#C2E8A2] hover:bg-[#A4D67A] text-[#08211C] text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Auto-Rebalance</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {pods.map((pod) => (
                  <div 
                    key={pod.id} 
                    onClick={() => setSelectedPodFilter(selectedPodFilter === pod.id ? 'ALL' : pod.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                      selectedPodFilter === pod.id
                        ? 'bg-[#EDF8E5] border-[#1E5642] shadow-xs ring-1 ring-[#1E5642]'
                        : 'bg-white border-sage-200 hover:border-sage-300 hover:bg-sage-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-sage-900">{pod.name}</h4>
                        <span className="text-[11px] text-sage-600">Lead: {pod.lead}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        pod.capacityPercent > 90 ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        pod.capacityPercent > 75 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-[#C2E8A2] text-[#08211C] border border-[#A4D67A]'
                      }`}>
                        {pod.capacityPercent}% Capacity
                      </span>
                    </div>

                    <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          pod.capacityPercent > 90 ? 'bg-rose-600' :
                          pod.capacityPercent > 75 ? 'bg-amber-500' : 'bg-[#1E5642]'
                        }`}
                        style={{ width: `${pod.capacityPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-sage-600 pt-1">
                      <span className="font-semibold">{pod.activeCases} active returns</span>
                      <span className="font-mono text-sage-500">{pod.specialization}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Interactive Stalled Case Pipeline Queue & Actions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
                    {isPiiUnmasked ? <Unlock className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-[#1E5642]" />}
                    <span>Case Pipeline & Triage ({filteredCases.length} Cases)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isPiiUnmasked) {
                          setIsPiiUnmasked(false);
                          setUnmaskAuditLog(null);
                        } else {
                          setShowPinModal(true);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-300 text-[11px] text-sage-800 font-semibold hover:bg-sage-100 flex items-center gap-1.5 transition"
                    >
                      <Key className="w-3 h-3 text-[#1E5642]" />
                      <span>{isPiiUnmasked ? 'Mask PII' : 'Reveal PII (Supervisor PIN)'}</span>
                    </button>
                  </div>
                </div>

                <div className="border border-sage-200 rounded-2xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                        <tr>
                          <th className="py-2.5 px-3 font-bold">Taxpayer Name</th>
                          <th className="py-2.5 px-3 font-bold">Domain & Reason</th>
                          <th className="py-2.5 px-3 font-bold text-center">Stuck Days</th>
                          <th className="py-2.5 px-3 font-bold text-center">SLA Status</th>
                          <th className="py-2.5 px-3 font-bold text-right">Quick Triage Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage-200">
                        {filteredCases.map((c) => (
                          <tr key={c.id} className="hover:bg-sage-50/50 transition">
                            <td className="py-3 px-3">
                              <div className="font-semibold text-sage-900">
                                {isPiiUnmasked ? c.realName : c.maskedName}
                              </div>
                              <div className="text-[10px] font-mono text-sage-500">
                                {isPiiUnmasked ? c.realSsn : c.maskedSsn} • {c.assignedPod.toUpperCase()}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-sage-800 font-medium">{c.domain}</div>
                              {c.stuckReason !== 'NONE' ? (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  {c.stuckReason.replace('_', ' ')}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-semibold">Ready for Reviewer</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`font-mono font-bold ${
                                c.stuckDurationDays > 4 ? 'text-rose-600' :
                                c.stuckDurationDays > 2 ? 'text-amber-600' : 'text-sage-700'
                              }`}>
                                {c.stuckDurationDays > 0 ? `${c.stuckDurationDays}d` : '0d'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                c.slaStatus === 'ON_TRACK' ? 'bg-[#C2E8A2] text-[#08211C] border border-[#A4D67A]' :
                                c.slaStatus === 'AT_RISK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}>
                                {c.slaStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {c.stuckReason === 'MISSING_DOCS' && (
                                  <button
                                    onClick={() => handleNudgeCustomer(c.id, isPiiUnmasked ? c.realName : c.maskedName)}
                                    title="Send Nudge to Customer"
                                    className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition text-[11px]"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRetriggerAgent(c.id)}
                                  title="Re-run Background Agent Pipeline"
                                  className="p-1.5 rounded-lg bg-sage-100 hover:bg-sage-200 text-sage-800 transition text-[11px]"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleElevateCase(c.id)}
                                  title="Elevate Priority to Senior CPA / Attorney"
                                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 transition text-[11px]"
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: REVIEW OPERATIONS (QA, Capacity, Override & Accuracy)
         ============================================================ */}
      {activeOpsTab === 'REVIEW_OPS' && (
        <div className="space-y-6">
          {/* Top QA Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Team Utilization</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">78.4%</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">Optimal capacity band</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Active Reviewers</span>
              <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">24</span>
              <span className="text-[10px] text-sage-500 font-medium">100% PTIN / EA / CPA</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Human Override Rate</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">3.4%</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">Across 10,480 line items</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">QA Sample Adherence</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">99.8%</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">120 returns sampled</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Critical Discrepancies</span>
              <span className="text-xl font-extrabold font-mono text-[#1E5642] mt-1 block">0</span>
              <span className="text-[10px] text-[#1E5642] font-semibold">Zero fatal errors</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
              <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Review SLA &lt;4h Rate</span>
              <span className="text-xl font-extrabold font-mono text-[#08211C] mt-1 block">82.0%</span>
              <span className="text-[10px] text-sage-500 font-medium">96% within 12h</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Reviewer Team Utilization Table */}
            <div className="lg:col-span-6 bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E5642]" />
                  <h3 className="text-xs font-bold text-sage-900 uppercase tracking-wider">
                    Reviewer Capacity & Licensing Matrix
                  </h3>
                </div>
                <span className="text-[11px] text-sage-500 font-mono">5 Pod Leads Online</span>
              </div>

              <div className="border border-sage-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Reviewer / Credential</th>
                      <th className="py-2.5 px-3 text-center">Active / Done</th>
                      <th className="py-2.5 px-3 text-center">Utilization</th>
                      <th className="py-2.5 px-3 text-center">Override %</th>
                      <th className="py-2.5 px-3 text-right">QA Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage-200 font-sans">
                    {reviewers.map((rev) => (
                      <tr key={rev.id} className="hover:bg-sage-50/50 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-sage-900">{rev.name}</div>
                          <div className="text-[10px] text-sage-500 flex items-center gap-1">
                            {rev.licenses.map(lic => (
                              <span key={lic} className="px-1.5 py-0.2 rounded bg-sage-100 text-sage-700 font-mono text-[9px]">
                                {lic}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="font-bold text-sage-900">{rev.activeCases}</span>
                          <span className="text-sage-400"> / </span>
                          <span className="text-emerald-700 font-bold">{rev.completedToday}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-mono font-bold text-[11px] text-sage-900">{rev.utilizationPercent}%</span>
                            <div className="w-12 bg-sage-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  rev.utilizationPercent > 90 ? 'bg-rose-500' :
                                  rev.utilizationPercent > 75 ? 'bg-[#1E5642]' : 'bg-lime-500'
                                }`}
                                style={{ width: `${rev.utilizationPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-sage-800">
                          {rev.overrideRate}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#1E5642]">
                          {rev.qaScore}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Jurisdiction & Domain Review Breakdown */}
            <div className="lg:col-span-6 bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#1E5642]" />
                  <h3 className="text-xs font-bold text-sage-900 uppercase tracking-wider">
                    Domain & State Statutory Distribution
                  </h3>
                </div>
                <span className="text-[11px] text-[#1E5642] font-semibold">100% Sovereign Conformity</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">Federal Form 1040 / 1120S</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">684 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">Schedule C expenses, QBI § 199A, Sec 179 depreciation</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">98.9% First-Pass Adherence</div>
                </div>

                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">California Form 540 / RTC</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">242 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">HSA add-back (§ 17215.4), Sec 179 $25k cap, AB 5 ABC test</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">99.2% First-Pass Adherence</div>
                </div>

                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">New York IT-201 / IT-203</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">198 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">Convenience rule (20 NYCRR § 131.18), NYC resident tax</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">99.4% First-Pass Adherence</div>
                </div>

                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">New Jersey NJ-1040</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">94 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">N.J.S.A. § 54A:5-2 strict loss netting ban, property credits</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">99.1% First-Pass Adherence</div>
                </div>

                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">Illinois IL-1040 / Mass Form 1</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">148 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">IL 4.95% flat / MA 5% flat + 4% Fair Share surtax</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">99.8% First-Pass Adherence</div>
                </div>

                <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sage-900">Indirect & Payroll (941 / SUI)</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E5642]">300 cases</span>
                  </div>
                  <div className="text-[11px] text-sage-600 mt-1">Wayfair economic nexus, quarterly 941 deposits, FUTA</div>
                  <div className="mt-2 text-[10px] text-emerald-800 font-semibold">99.7% First-Pass Adherence</div>
                </div>
              </div>
            </div>
          </div>

          {/* QA Sampling & Audit Inspection Drawer */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E5642]" />
                  <span>Random QA Sampling Pool (Human vs. AI Variance Inspection)</span>
                </h3>
                <p className="text-xs text-sage-600 mt-0.5">
                  Inspect sampled returns where licensed CPAs adjusted AI proposed line items. Click to open audit proof.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-[#1E5642]">
                120 Returns Audited This Week • 0 Critical Errors
              </span>
            </div>

            <div className="border border-sage-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">TaxCase / Client</th>
                    <th className="py-2.5 px-3">Jurisdiction</th>
                    <th className="py-2.5 px-3">Reviewer</th>
                    <th className="py-2.5 px-3">AI Position vs CPA Position</th>
                    <th className="py-2.5 px-3">Statutory Basis</th>
                    <th className="py-2.5 px-3 text-right">QA Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-200">
                  {qaSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-sage-50/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-sage-900">{sample.maskedClient}</div>
                        <div className="text-[10px] font-mono text-sage-500">{sample.caseId}</div>
                      </td>
                      <td className="py-3 px-3 text-sage-800 font-medium">{sample.domain}</td>
                      <td className="py-3 px-3 text-sage-700">{sample.reviewer}</td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-sage-500 line-through">{sample.aiProposedValue}</div>
                        <div className="text-[11px] font-bold text-sage-900">{sample.cpaFinalizedValue}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] text-[#1E5642] font-semibold bg-pine-50 px-2 py-0.5 rounded border border-pine-200">
                          {sample.statutoryBasis}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedQaSample(sample)}
                          className="px-3 py-1 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-900 text-[11px] font-bold transition flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#1E5642]" />
                          <span>Inspect Diff</span>
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

      {/* QA Inspection Modal / Drawer */}
      {selectedQaSample && (
        <div className="fixed inset-0 z-50 bg-[#08211C]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 w-full max-w-xl space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-sage-200 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1E5642]" />
                <h3 className="text-sm font-bold text-sage-900">
                  QA Audit Diff — {selectedQaSample.caseId} ({selectedQaSample.maskedClient})
                </h3>
              </div>
              <button
                onClick={() => setSelectedQaSample(null)}
                className="text-sage-500 hover:text-sage-900 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-800 block">AI Proposed Position</span>
                  <p className="font-mono font-bold text-rose-950 mt-1">{selectedQaSample.aiProposedValue}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#EDF8E5] border border-[#C2E8A2]">
                  <span className="text-[10px] font-bold uppercase text-[#08211C] block">CPA Finalized Position</span>
                  <p className="font-mono font-bold text-[#08211C] mt-1">{selectedQaSample.cpaFinalizedValue}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-sage-600 block">Reviewer Justification & Rationale</span>
                <p className="text-sage-800 leading-relaxed font-sans">{selectedQaSample.varianceReason}</p>
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[10px] text-sage-500">Statutory Citation:</span>
                  <span className="text-[10px] font-mono font-bold text-[#1E5642]">{selectedQaSample.statutoryBasis}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sage-200">
              <button
                onClick={() => {
                  setActionSuccessNotice(`QA sign-off confirmed for ${selectedQaSample.caseId}. Compliance adherence scored 100%.`);
                  setSelectedQaSample(null);
                  setTimeout(() => setActionSuccessNotice(null), 3500);
                }}
                className="px-4 py-2 bg-[#C2E8A2] hover:bg-[#A4D67A] text-[#08211C] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Compliance Sign-off</span>
              </button>
              <button
                onClick={() => setSelectedQaSample(null)}
                className="px-4 py-2 bg-sage-100 text-sage-800 rounded-xl text-xs font-semibold hover:bg-sage-200 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-[#08211C]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-[#1E5642] font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#1E5642]" />
              <span>Supervisor Authorization Required</span>
            </div>
            <p className="text-xs text-sage-600 leading-relaxed">
              Unmasking taxpayer SSN and PII is restricted under IRS Pub 1075 and creates an immutable audit event. Enter Supervisor PIN (Demo: <strong>2026</strong>):
            </p>
            <form onSubmit={handleAuthorizeUnmask} className="space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Supervisor PIN (2026)"
                className="w-full px-3 py-2 bg-sage-50 border border-sage-300 rounded-xl text-center text-sm font-mono text-sage-900 font-bold tracking-widest focus:outline-none focus:border-[#1E5642]"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#C2E8A2] hover:bg-[#A4D67A] text-[#08211C] rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Authorize & Unmask
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3.5 py-2 bg-sage-100 text-sage-800 rounded-xl text-xs font-semibold hover:bg-sage-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
