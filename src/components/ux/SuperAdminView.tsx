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
  Database,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface KillSwitchItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

interface RuleRelease {
  jurisdiction: string;
  version: string;
  status: string;
  hash: string;
  statutes: string[];
  effectiveDate: string;
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

  const [activeRuleReleases] = useState<RuleRelease[]>([
    { 
      jurisdiction: 'US-FED', 
      version: 'v2026.1.4', 
      status: 'ACTIVE', 
      hash: 'sha256:fed1040a1b2c3d4e5f6',
      statutes: ['26 U.S.C. § 162(a)', '26 U.S.C. § 199A', '26 U.S.C. § 274(n)', '26 U.S.C. § 280A'],
      effectiveDate: '2026-01-01'
    },
    { 
      jurisdiction: 'US-CA', 
      version: 'v2026.0.8', 
      status: 'ACTIVE', 
      hash: 'sha256:ca540f6e5d4c3b2a109',
      statutes: ['Cal. RTC § 17215.4 (HSA Addition)', 'Cal. RTC § 17255 (Sec 179 $25k Cap)'],
      effectiveDate: '2026-01-01'
    },
    { 
      jurisdiction: 'US-NY', 
      version: 'v2026.2.0', 
      status: 'ACTIVE', 
      hash: 'sha256:nyit2017a8b9c0d1e2f',
      statutes: ['20 NYCRR § 131.18 (Convenience Rule)', 'NY Tax Law § 605(b)(1)(B) (183-Day Rule)'],
      effectiveDate: '2026-01-01'
    },
    { 
      jurisdiction: 'US-NJ', 
      version: 'v2026.1.1', 
      status: 'ACTIVE', 
      hash: 'sha256:nj10403f2e1d0c9b8a7',
      statutes: ['N.J.S.A. § 54A:5-2 (No Netting Ban)', 'N.J.S.A. § 54A:4-1 (Convenience Credit)'],
      effectiveDate: '2026-01-01'
    },
    { 
      jurisdiction: 'US-IL', 
      version: 'v2026.0.4', 
      status: 'ACTIVE', 
      hash: 'sha256:il10409a8b7c6d5e4f3',
      statutes: ['35 ILCS 5/203(a)(2)(F) (100% Pension Subtraction)'],
      effectiveDate: '2026-01-01'
    },
    { 
      jurisdiction: 'US-MA', 
      version: 'v2026.1.0', 
      status: 'ACTIVE', 
      hash: 'sha256:maform14b5c6d7e8f9a',
      statutes: ['Mass. Gen. Laws ch. 62, § 4(d) (4% Fair Share Surtax >$1,053,750)'],
      effectiveDate: '2026-01-01'
    }
  ]);

  const [selectedRule, setSelectedRule] = useState<RuleRelease | null>(null);
  const [auditLogs, setAuditLogs] = useState<Array<{ timestamp: string; event: string; user: string }>>([
    { timestamp: '14:20:12', event: 'Rule Set US-FED-2026.1.4 verified by Regression Engine (100% pass)', user: 'sys_release_bot' },
    { timestamp: '14:15:00', event: 'ModelRouter budget audit: avg case cost $1.84 (under $4.50 cap)', user: 'sys_telemetry' }
  ]);

  const toggleKillSwitch = (id: string) => {
    setKillSwitches(prev => prev.map(ks => {
      if (ks.id === id) {
        const nextState = !ks.active;
        const newLog = {
          timestamp: new Date().toLocaleTimeString(),
          event: `KILL SWITCH [${ks.name}] ${nextState ? 'ENGAGED (ACTIVE)' : 'DISENGAGED (NORMAL)'}`,
          user: 'super_admin_fido2'
        };
        setAuditLogs(logs => [newLog, ...logs]);
        return { ...ks, active: nextState };
      }
      return ks;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
              Super Admin — Platform Health & Master Controls
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>WebAuthn FIDO2 Protected</span>
              </span>
            </h2>
            <p className="text-xs text-sage-600 mt-0.5">
              Deterministic rule releases, multi-tenant fleet health, token budgeting, and emergency kill switches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-sage-50 border border-sage-200 text-center">
            <span className="text-sage-500 block text-[10px] uppercase font-bold">Engine Uptime</span>
            <span className="font-extrabold text-pine-800 font-mono">99.99%</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-sage-50 border border-sage-200 text-center">
            <span className="text-sage-500 block text-[10px] uppercase font-bold">L1 Latency</span>
            <span className="font-extrabold text-pine-800 font-mono">1.2 ms</span>
          </div>
        </div>
      </div>

      {/* Model Usage & Cost Attribution Panel */}
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-pine-700" />
            <h3 className="text-sm font-bold text-sage-900">
              Model Routing Telemetry & Budgeting ($4.50 Case Cap)
            </h3>
          </div>
          <span className="text-xs font-mono text-pine-800 font-bold">
            Avg Cost / Case: $1.84 (Well below budget cap)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
            <div className="flex items-center justify-between text-xs text-sage-600 mb-1">
              <span className="font-semibold">Deterministic Math</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-200 text-pine-900 border border-lime-300">Zero Cost</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-sage-950">842,000 runs</div>
            <div className="text-[11px] font-mono text-pine-800 font-bold mt-1">$0.00 Token Spend</div>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
            <div className="flex items-center justify-between text-xs text-sage-600 mb-1">
              <span className="font-semibold">Claude 3.5 Sonnet</span>
              <span className="text-[10px] text-sage-700 font-mono font-semibold">Tier 1 Reasoning</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-sage-950">42,100 calls</div>
            <div className="text-[11px] font-mono text-sage-600 mt-1">$612.40 Total Spend</div>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
            <div className="flex items-center justify-between text-xs text-sage-600 mb-1">
              <span className="font-semibold">Gemini 1.5 Flash</span>
              <span className="text-[10px] text-sage-700 font-mono font-semibold">OCR & Extraction</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-sage-950">184,000 calls</div>
            <div className="text-[11px] font-mono text-sage-600 mt-1">$74.20 Total Spend</div>
          </div>

          <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200">
            <div className="flex items-center justify-between text-xs text-sage-600 mb-1">
              <span className="font-semibold">GPT-4o Mini</span>
              <span className="text-[10px] text-sage-700 font-mono font-semibold">Lightweight Match</span>
            </div>
            <div className="text-xl font-extrabold font-mono text-sage-950">91,200 calls</div>
            <div className="text-[11px] font-mono text-sage-600 mt-1">$36.50 Total Spend</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Emergency Safety Kill Switches */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              <span>Emergency Safety Kill Switches</span>
            </div>
            <span className="text-[11px] text-sage-500 font-semibold">Instant Execution</span>
          </div>

          <div className="space-y-3">
            {killSwitches.map((ks) => (
              <div 
                key={ks.id} 
                className={`p-4 rounded-2xl border transition space-y-3 ${
                  ks.active 
                    ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400' 
                    : 'bg-white border-sage-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sage-900">{ks.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                      ks.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {ks.severity}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleKillSwitch(ks.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      ks.active
                        ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                        : 'bg-sage-100 hover:bg-sage-200 text-sage-800 border border-sage-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{ks.active ? 'ACTIVE (FROZEN)' : 'Engage'}</span>
                  </button>
                </div>

                <p className="text-xs text-sage-600 leading-relaxed">
                  {ks.description}
                </p>
              </div>
            ))}
          </div>

          {/* Real-time Audit Stream */}
          <div className="p-4 rounded-2xl bg-white border border-sage-300 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-pine-700" />
                <span>Security Audit Event Log</span>
              </span>
              <span className="text-[10px] text-pine-800 font-mono font-bold">Immutable Stream</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] max-h-32 overflow-y-auto">
              {auditLogs.map((log, i) => (
                <div key={i} className="text-sage-700 flex items-start gap-2 bg-sage-50 p-2 rounded-xl">
                  <span className="text-sage-500 shrink-0">[{log.timestamp}]</span>
                  <span className="text-sage-900 font-semibold flex-1">{log.event}</span>
                  <span className="text-pine-800 font-bold text-[10px] shrink-0">@{log.user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sovereign Five-State Rule Releases */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-sage-900 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-pine-700" />
              <span>Sovereign Five-State Rule Releases</span>
            </div>
            <span className="text-[11px] text-pine-800 font-mono font-bold">100% In Effect</span>
          </div>

          <div className="border border-sage-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-sage-50 text-sage-700 border-b border-sage-200 font-bold">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Jurisdiction</th>
                  <th className="py-2.5 px-4 font-bold">Rule Version</th>
                  <th className="py-2.5 px-4 font-bold">Digest Fingerprint</th>
                  <th className="py-2.5 px-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-200 font-mono">
                {activeRuleReleases.map((rule) => (
                  <tr 
                    key={rule.jurisdiction} 
                    onClick={() => setSelectedRule(rule)}
                    className="hover:bg-sage-50/50 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-4 text-sage-900 font-sans font-bold flex items-center gap-2">
                      <span>{rule.jurisdiction}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-lime-200 text-pine-900 border border-lime-300 font-bold">
                        {rule.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-pine-800 font-bold">{rule.version}</td>
                    <td className="py-2.5 px-4 text-sage-500">{rule.hash}</td>
                    <td className="py-2.5 px-4 text-right text-pine-800 font-sans font-bold">
                      Inspect 🔍
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Rule Inspection Card */}
          {selectedRule && (
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-pine-700" />
                  <h4 className="text-xs font-bold text-sage-900">
                    Rule Package Details: {selectedRule.jurisdiction} ({selectedRule.version})
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-sage-600 font-semibold">Effective: {selectedRule.effectiveDate}</span>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-sage-600 block text-[11px] font-medium">Primary Statutory Authorities Grounded:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedRule.statutes.map((st, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white text-sage-900 border border-sage-200 font-bold">
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[11px] font-mono text-sage-600 pt-2 border-t border-sage-200 flex items-center justify-between">
                <span>Release Digest: {selectedRule.hash}</span>
                <span className="text-pine-800 font-bold">100% Deterministic Lineage</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
