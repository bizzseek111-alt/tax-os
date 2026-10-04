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
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tax Operations Cockpit — Firm Velocity & Quality Control
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% SLA Compliance
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Throughput metrics, exception velocities, and privacy-masked case allocation queues.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoRebalance}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Shuffle className="w-4 h-4" />
            <span>Auto-Rebalance Pod Workload</span>
          </button>
        </div>
      </div>

      {showRebalanceSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Workload successfully rebalanced! 20 cases routed from Senior CPA Pod C to Pod B.</span>
        </div>
      )}

      {unmaskAuditLog && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>{unmaskAuditLog}</span>
          </div>
          <button
            onClick={() => {
              setIsPiiUnmasked(false);
              setUnmaskAuditLog(null);
            }}
            className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold"
          >
            Re-Mask PII
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Active Filings</span>
          <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">1,420</span>
          <span className="text-[10px] text-emerald-400">98.2% on schedule</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Questions to File (Avg)</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">2.4</span>
          <span className="text-[10px] text-slate-500">Target ≤ 3.0</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Exception Rate</span>
          <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">7.8%</span>
          <span className="text-[10px] text-slate-500">92.2% resolved auto</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Human Override Rate</span>
          <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">2.1%</span>
          <span className="text-[10px] text-slate-500">Low review variance</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SLA Breaches</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">0</span>
          <span className="text-[10px] text-emerald-400">0 overdue cases</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">E-File Rejection Rate</span>
          <span className="text-xl font-bold font-mono text-slate-100 mt-1 block">0.12%</span>
          <span className="text-[10px] text-slate-500">Industry avg: 1.8%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Team Capacity Pods */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Workload Pods (Click to Filter)
            </span>
            {selectedPodFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedPodFilter('ALL')}
                className="text-[11px] text-blue-400 hover:underline"
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
                className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                  selectedPodFilter === pod.id
                    ? 'bg-slate-900 border-blue-500/60 ring-1 ring-blue-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{pod.name}</h4>
                    <span className="text-[11px] text-slate-400">Lead: {pod.lead}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    pod.capacityPercent > 90 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    pod.capacityPercent > 75 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {pod.capacityPercent}% Capacity
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      pod.capacityPercent > 90 ? 'bg-rose-500' :
                      pod.capacityPercent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pod.capacityPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{pod.activeCases} active returns</span>
                  <span className="font-mono text-slate-500">{pod.specialization}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Privacy-Masked Case Pipeline Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              {isPiiUnmasked ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-blue-400" />}
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
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition"
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>{isPiiUnmasked ? 'Mask PII' : 'Reveal PII (Supervisor)'}</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Taxpayer Name</th>
                  <th className="py-2.5 px-4 font-semibold">SSN Token</th>
                  <th className="py-2.5 px-4 font-semibold">Pod</th>
                  <th className="py-2.5 px-4 font-semibold text-center">QtF</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Exception Rate</th>
                  <th className="py-2.5 px-4 font-semibold text-right">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200">
                      {isPiiUnmasked ? c.realName : c.maskedName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {isPiiUnmasked ? c.realSsn : c.maskedSsn}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans uppercase text-[11px]">{c.assignedPod}</td>
                    <td className="py-2.5 px-4 text-center text-slate-200 font-bold">{c.questionsToFile}</td>
                    <td className="py-2.5 px-4 text-center text-blue-400">{c.aiExceptionRate}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${
                        c.slaStatus === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-400' :
                        c.slaStatus === 'AT_RISK' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
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

      {/* Supervisor PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Supervisor Authorization Required</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unmasking taxpayer SSN and PII is restricted under IRS Pub 1075 and creates an immutable audit event. Enter Supervisor PIN (Demo: <strong>2026</strong>):
            </p>
            <form onSubmit={handleAuthorizeUnmask} className="space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Supervisor PIN (2026)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-center text-sm font-mono text-slate-100 tracking-widest focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Authorize & Unmask
                </button>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
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
