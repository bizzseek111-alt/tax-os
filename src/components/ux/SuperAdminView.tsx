import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Server, 
  Cpu, 
  DollarSign, 
  Flame, 
  Power, 
  CheckCircle2, 
  AlertOctagon, 
  Lock, 
  Activity,
  Layers,
  Terminal,
  Database
} from 'lucide-react';

interface KillSwitchItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export function SuperAdminView() {
  const [killSwitches, setKillSwitches] = useState<KillSwitchItem[]>([
    {
      id: 'ks-01',
      name: 'FREEZE_JURISDICTION_US_NY',
      description: 'Immediately halts automatic calculation and e-filing for New York Form IT-201/203 pending state guidance update.',
      active: false,
      severity: 'HIGH'
    },
    {
      id: 'ks-02',
      name: 'FORCE_HUMAN_REVIEW_ALL',
      description: 'Enforces mandatory CPA/EA manual sign-off on 100% of cases regardless of AI confidence score.',
      active: false,
      severity: 'MEDIUM'
    },
    {
      id: 'ks-03',
      name: 'GLOBAL_AGENT_RUNTIME_HALT',
      description: 'Emergency master kill switch: freezes all LLM background agents across all tenants. Deterministic calculations continue.',
      active: false,
      severity: 'CRITICAL'
    }
  ]);

  const [activeRuleReleases] = useState([
    { jurisdiction: 'US-FED', version: 'v2026.1.4', status: 'ACTIVE', hash: 'sha256:fed1040...' },
    { jurisdiction: 'US-CA', version: 'v2026.0.8', status: 'ACTIVE', hash: 'sha256:ca540...' },
    { jurisdiction: 'US-NY', version: 'v2026.2.0', status: 'ACTIVE', hash: 'sha256:nyit201...' },
    { jurisdiction: 'US-NJ', version: 'v2026.1.1', status: 'ACTIVE', hash: 'sha256:nj1040...' },
    { jurisdiction: 'US-IL', version: 'v2026.0.4', status: 'ACTIVE', hash: 'sha256:il1040...' },
    { jurisdiction: 'US-MA', version: 'v2026.1.0', status: 'ACTIVE', hash: 'sha256:maform1...' }
  ]);

  const toggleKillSwitch = (id: string) => {
    setKillSwitches(prev => prev.map(ks => ks.id === id ? { ...ks, active: !ks.active } : ks));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Super Admin — Platform Health & Master Controls
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>WebAuthn FIDO2 Protected</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic rule releases, multi-tenant fleet health, token budgeting, and emergency kill switches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Engine Uptime</span>
            <span className="font-bold text-emerald-400 font-mono">99.99%</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">L1 Latency</span>
            <span className="font-bold text-blue-400 font-mono">1.2 ms</span>
          </div>
        </div>
      </div>

      {/* Model Usage & Cost Attribution Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Model Routing Telemetry & Budgeting ($4.50 Case Cap)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Avg Cost / Case: $1.84 (Well below budget cap)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Deterministic Math</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400">Zero Cost</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">842,000 runs</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">$0.00 Token Spend</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Claude 3.5 Sonnet</span>
              <span className="text-[10px] text-purple-400 font-mono">Tier 1 Reasoning</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">42,100 calls</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">$612.40 Total Spend</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Gemini 1.5 Flash</span>
              <span className="text-[10px] text-blue-400 font-mono">OCR & Extraction</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">184,000 calls</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">$74.20 Total Spend</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>GPT-4o Mini</span>
              <span className="text-[10px] text-slate-400 font-mono">Lightweight Match</span>
            </div>
            <div className="text-xl font-bold font-mono text-slate-100">91,200 calls</div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">$36.50 Total Spend</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Emergency Safety Kill Switches */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Emergency Safety Kill Switches</span>
            </div>
            <span className="text-[11px] text-slate-500">Instant Execution</span>
          </div>

          <div className="space-y-3">
            {killSwitches.map((ks) => (
              <div 
                key={ks.id} 
                className={`p-4 rounded-xl border transition space-y-3 ${
                  ks.active 
                    ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30' 
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-200">{ks.name}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      ks.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ks.severity}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleKillSwitch(ks.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      ks.active
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{ks.active ? 'ACTIVE (FROZEN)' : 'Engage'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {ks.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sovereign Five-State Rule Releases */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Sovereign Five-State Rule Engine Releases</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">100% In Effect</span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Jurisdiction</th>
                  <th className="py-2.5 px-4 font-semibold">Rule Version</th>
                  <th className="py-2.5 px-4 font-semibold">Digest Fingerprint</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {activeRuleReleases.map((rule) => (
                  <tr key={rule.jurisdiction} className="hover:bg-slate-950/40 transition">
                    <td className="py-2.5 px-4 text-slate-200 font-sans font-bold">{rule.jurisdiction}</td>
                    <td className="py-2.5 px-4 text-purple-400">{rule.version}</td>
                    <td className="py-2.5 px-4 text-slate-500">{rule.hash}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {rule.status}
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
  );
}
