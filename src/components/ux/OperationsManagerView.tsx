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
  Key
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
}

export function OperationsManagerView() {
  const [selectedPodFilter, setSelectedPodFilter] = useState<string>('ALL');
  const [isPiiUnmasked, setIsPiiUnmasked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [unmaskAuditLog, setUnmaskAuditLog] = useState<string | null>(null);

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
      slaStatus: 'ON_TRACK'
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
      slaStatus: 'AT_RISK'
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
      slaStatus: 'ON_TRACK'
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
      slaStatus: 'ON_TRACK'
    }
  ]);

  const [showRebalanceSuccess, setShowRebalanceSuccess] = useState(false);

  const handleAutoRebalance = () => {
    setPods(prev => prev.map(p => {
      if (p.id === 'pod-c') return { ...p, capacityPercent: 78, activeCases: 92 };
      if (p.id === 'pod-b') return { ...p, capacityPercent: 79, activeCases: 88 };
      return p;
    }));
    setShowRebalanceSuccess(true);
    setTimeout(() => setShowRebalanceSuccess(false), 3000);
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

  const filteredCases = selectedPodFilter === 'ALL' 
    ? pipelineCases 
    : pipelineCases.filter(c => c.assignedPod === selectedPodFilter);

  return (
    <div className="space-y-6">
      {/* Top Cockpit KPI Bar */}
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
              Tax Operations Cockpit — Firm Velocity & Quality Control
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-200 text-pine-950 border border-lime-300">
                100% SLA Compliance
              </span>
            </h2>
            <p className="text-xs text-sage-600 mt-0.5">
              Throughput metrics, exception velocities, and privacy-masked case allocation queues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoRebalance}
            className="px-4 py-2 rounded-2xl bg-lime-400 hover:bg-lime-500 text-pine-900 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Shuffle className="w-4 h-4" />
            <span>Auto-Rebalance Pod Workload</span>
          </button>
        </div>
      </div>

      {showRebalanceSuccess && (
        <div className="p-3.5 rounded-2xl bg-lime-100 border border-lime-300 text-pine-900 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Workload successfully rebalanced! 20 cases routed from Senior CPA Pod C to Pod B.</span>
        </div>
      )}

      {unmaskAuditLog && (
        <div className="p-3.5 rounded-2xl bg-pine-50 border border-pine-200 text-pine-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pine-700" />
            <span className="font-medium">{unmaskAuditLog}</span>
          </div>
          <button
            onClick={() => {
              setIsPiiUnmasked(false);
              setUnmaskAuditLog(null);
            }}
            className="px-3 py-1 rounded-xl bg-white border border-sage-300 text-sage-800 hover:bg-sage-100 text-[11px] font-bold"
          >
            Re-Mask PII
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Total Active Filings</span>
          <span className="text-xl font-extrabold font-mono text-sage-950 mt-1 block">1,420</span>
          <span className="text-[10px] text-pine-800 font-semibold">98.2% on schedule</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Questions to File (Avg)</span>
          <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">2.4</span>
          <span className="text-[10px] text-sage-500 font-medium">Target ≤ 3.0</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">AI Exception Rate</span>
          <span className="text-xl font-extrabold font-mono text-sage-900 mt-1 block">7.8%</span>
          <span className="text-[10px] text-sage-500 font-medium">92.2% resolved auto</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">Human Override Rate</span>
          <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">2.1%</span>
          <span className="text-[10px] text-sage-500 font-medium">Low review variance</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">SLA Breaches</span>
          <span className="text-xl font-extrabold font-mono text-pine-800 mt-1 block">0</span>
          <span className="text-[10px] text-pine-800 font-semibold">0 overdue cases</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage-300 shadow-xs">
          <span className="text-[10px] text-sage-500 uppercase tracking-wider font-bold block">E-File Rejection Rate</span>
          <span className="text-xl font-extrabold font-mono text-sage-950 mt-1 block">0.12%</span>
          <span className="text-[10px] text-sage-500 font-medium">Industry avg: 1.8%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Capacity Pods */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
              Workload Pods (Click to Filter)
            </span>
            {selectedPodFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedPodFilter('ALL')}
                className="text-[11px] text-pine-800 font-bold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="space-y-3">
            {pods.map((pod) => (
              <div 
                key={pod.id} 
                onClick={() => setSelectedPodFilter(selectedPodFilter === pod.id ? 'ALL' : pod.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 ${
                  selectedPodFilter === pod.id
                    ? 'bg-pine-50 border-pine-600 shadow-xs ring-1 ring-pine-600'
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
                    'bg-lime-200 text-pine-900 border border-lime-300'
                  }`}>
                    {pod.capacityPercent}% Capacity
                  </span>
                </div>

                <div className="w-full bg-sage-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pod.capacityPercent > 90 ? 'bg-rose-600' :
                      pod.capacityPercent > 75 ? 'bg-amber-500' : 'bg-pine-700'
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

        {/* Right Column: Privacy-Masked Case Pipeline Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
                {isPiiUnmasked ? <Unlock className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-pine-700" />}
                <span>Pipeline Queue ({filteredCases.length} Cases)</span>
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
                  <Key className="w-3 h-3 text-pine-700" />
                  <span>{isPiiUnmasked ? 'Mask PII' : 'Reveal PII (Supervisor)'}</span>
                </button>
              </div>
            </div>

            <div className="border border-sage-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                  <tr>
                    <th className="py-2.5 px-4 font-bold">Taxpayer Name</th>
                    <th className="py-2.5 px-4 font-bold">SSN Token</th>
                    <th className="py-2.5 px-4 font-bold">Pod</th>
                    <th className="py-2.5 px-4 font-bold text-center">QtF</th>
                    <th className="py-2.5 px-4 font-bold text-center">Exception Rate</th>
                    <th className="py-2.5 px-4 font-bold text-right">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-200 font-mono">
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-sage-50/50 transition">
                      <td className="py-2.5 px-4 font-sans font-semibold text-sage-900">
                        {isPiiUnmasked ? c.realName : c.maskedName}
                      </td>
                      <td className="py-2.5 px-4 text-sage-600">
                        {isPiiUnmasked ? c.realSsn : c.maskedSsn}
                      </td>
                      <td className="py-2.5 px-4 text-sage-700 font-sans uppercase text-[11px]">{c.assignedPod}</td>
                      <td className="py-2.5 px-4 text-center text-sage-900 font-bold">{c.questionsToFile}</td>
                      <td className="py-2.5 px-4 text-center text-pine-800 font-bold">{c.aiExceptionRate}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                          c.slaStatus === 'ON_TRACK' ? 'bg-lime-200 text-pine-900 border border-lime-300' :
                          c.slaStatus === 'AT_RISK' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}>
                          {c.slaStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-pine-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-pine-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-pine-700" />
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
                className="w-full px-3 py-2 bg-sage-50 border border-sage-300 rounded-xl text-center text-sm font-mono text-sage-900 font-bold tracking-widest focus:outline-none focus:border-pine-700"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-lime-400 hover:bg-lime-500 text-pine-900 rounded-xl text-xs font-bold transition shadow-xs"
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
