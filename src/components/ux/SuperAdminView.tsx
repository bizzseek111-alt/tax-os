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
  BookOpen,
  Building2,
  Users,
  Bot,
  Scale,
  Send,
  Plug,
  ShieldCheck,
  CreditCard,
  Flag,
  GitBranch,
  Bell,
  Hash,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';

type AdminModule = 
  | 'overview' 
  | 'platform' 
  | 'organizations' 
  | 'users' 
  | 'agents' 
  | 'rules' 
  | 'filing' 
  | 'integrations' 
  | 'models' 
  | 'security' 
  | 'billing' 
  | 'flags' 
  | 'releases' 
  | 'incidents' 
  | 'audit';

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

interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  canaryPercent: number;
}

export function SuperAdminView() {
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  
  // Step-Up MFA Modal State (Part 26)
  const [mfaActionPending, setMfaActionPending] = useState<{
    type: 'KILL_SWITCH' | 'RULE_DEPLOY' | 'CACHE_PURGE';
    targetId: string;
    title: string;
    description: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [ticketReason, setTicketReason] = useState('');
  const [confirmRiskChecked, setConfirmRiskChecked] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

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
      statutes: ['Cal. RTC § 17215.4 (HSA Addition)', 'Cal. RTC § 17255 (Sec 179 $25k Cap)', 'Cal. Lab. Code § 2775 (AB 5)'],
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

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 'ff-01',
      key: 'enable_california_ab5_ml_classifier',
      description: 'Autonomous worker classification agent with 20-factor California court precedent model',
      enabled: true,
      canaryPercent: 100
    },
    {
      id: 'ff-02',
      key: 'enable_instant_mef_ack_stream',
      description: 'IRS A2A streaming WebSocket listener for sub-second electronic filing transmission acknowledgments',
      enabled: true,
      canaryPercent: 50
    },
    {
      id: 'ff-03',
      key: 'enable_tax_twin_monte_carlo',
      description: 'Predictive entity restructuring simulator (S-Corp payroll salary optimization)',
      enabled: true,
      canaryPercent: 100
    },
    {
      id: 'ff-04',
      key: 'enable_wayfair_sales_tax_heatmaps',
      description: 'Multi-jurisdiction economic nexus threshold live tracker and liability heatmaps',
      enabled: true,
      canaryPercent: 100
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<Array<{ timestamp: string; event: string; user: string; blockHash: string }>>([
    { timestamp: '14:20:12', event: 'Rule Set US-FED-2026.1.4 verified by Regression Engine (100% pass)', user: 'sys_release_bot', blockHash: '0x8f4b291a' },
    { timestamp: '14:15:00', event: 'ModelRouter budget audit: avg case cost $1.84 (under $4.50 cap)', user: 'sys_telemetry', blockHash: '0x3c7e108d' },
    { timestamp: '13:58:44', event: 'IRS MeF A2A transmission queue flushed 318 Form 1040 returns', user: 'mef_daemon', blockHash: '0x5a2d991b' },
    { timestamp: '13:30:11', event: 'Step-Up MFA auth granted for supervisor PII inspection (#SEC-9821)', user: 'ops_supervisor', blockHash: '0x1e8c442a' }
  ]);

  const initiateKillSwitchToggle = (ks: KillSwitchItem) => {
    setMfaActionPending({
      type: 'KILL_SWITCH',
      targetId: ks.id,
      title: `Emergency Action: ${ks.name}`,
      description: ks.active 
        ? `You are about to DISENGAGE ${ks.name}. Normal automated calculations will resume.` 
        : `You are about to ENGAGE ${ks.name}. ${ks.description}`
    });
    setTotpCode('');
    setTicketReason('');
    setConfirmRiskChecked(false);
  };

  const handleConfirmMfaAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaActionPending) return;

    if (totpCode !== '749201' && totpCode.length < 6) {
      alert("Invalid TOTP Code. Enter '749201' for demo authorization.");
      return;
    }
    if (!ticketReason) {
      alert("An incident or change ticket number is strictly required by SOC 2 compliance.");
      return;
    }
    if (!confirmRiskChecked) {
      alert("Please check the risk confirmation acknowledgement.");
      return;
    }

    if (mfaActionPending.type === 'KILL_SWITCH') {
      setKillSwitches(prev => prev.map(ks => {
        if (ks.id === mfaActionPending.targetId) {
          const nextState = !ks.active;
          const newBlock = {
            timestamp: new Date().toLocaleTimeString(),
            event: `KILL SWITCH [${ks.name}] ${nextState ? 'ENGAGED (ACTIVE)' : 'DISENGAGED (NORMAL)'} (Ticket: ${ticketReason})`,
            user: 'super_admin_fido2',
            blockHash: '0x' + Math.random().toString(16).substring(2, 10)
          };
          setAuditLogs(logs => [newBlock, ...logs]);
          setNotificationBanner(`Emergency action verified! ${ks.name} is now ${nextState ? 'ENGAGED' : 'DISENGAGED'}.`);
          return { ...ks, active: nextState };
        }
        return ks;
      }));
    }

    setMfaActionPending(null);
    setTimeout(() => setNotificationBanner(null), 4000);
  };

  const toggleFlag = (id: string) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === id) {
        const next = !f.enabled;
        const newBlock = {
          timestamp: new Date().toLocaleTimeString(),
          event: `FEATURE FLAG [${f.key}] set to ${next ? 'ENABLED' : 'DISABLED'}`,
          user: 'super_admin',
          blockHash: '0x' + Math.random().toString(16).substring(2, 10)
        };
        setAuditLogs(logs => [newBlock, ...logs]);
        return { ...f, enabled: next };
      }
      return f;
    }));
  };

  const navModules: Array<{ id: AdminModule; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'platform', label: 'Platform & Compute', icon: <Server className="w-4 h-4" /> },
    { id: 'organizations', label: 'Organizations & Firms', icon: <Building2 className="w-4 h-4" /> },
    { id: 'users', label: 'Users & RBAC', icon: <Users className="w-4 h-4" /> },
    { id: 'agents', label: 'Agent Fleet', icon: <Bot className="w-4 h-4" /> },
    { id: 'rules', label: 'Tax Rules Engine', icon: <Scale className="w-4 h-4" /> },
    { id: 'filing', label: 'Filing & MeF Gateways', icon: <Send className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Plug className="w-4 h-4" /> },
    { id: 'models', label: 'Model Telemetry', icon: <Cpu className="w-4 h-4" /> },
    { id: 'security', label: 'Security & HSM', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & MRR', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'flags', label: 'Feature Flags', icon: <Flag className="w-4 h-4" /> },
    { id: 'releases', label: 'Releases & Deploys', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents & Alerts', icon: <Bell className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Ledger', icon: <Hash className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Platform Control Center — Enterprise Super Admin
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" />
                <span>WebAuthn FIDO2 Enforced</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule releases, multi-tenant fleet health, token budgeting, and emergency kill switches.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Engine Uptime</span>
            <span className="font-extrabold text-emerald-400 font-mono">99.99%</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">L1 Latency</span>
            <span className="font-extrabold text-emerald-400 font-mono">1.2 ms</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost / Case</span>
            <span className="font-extrabold text-emerald-400 font-mono">$1.84</span>
          </div>
        </div>
      </div>

      {notificationBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationBanner}</span>
        </div>
      )}

      {/* 15-Module Navigation Tabs (Part 25) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navModules.map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeModule === mod.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {mod.icon}
              <span>{mod.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          MODULE 1: OVERVIEW & KILL SWITCHES
         ============================================================ */}
      {activeModule === 'overview' && (
        <div className="space-y-6">
          {/* Emergency Kill Switches Panel */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-rose-900/60 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertOctagon className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-200">
                  Emergency Jurisdiction & Runtime Kill Switches
                </h3>
              </div>
              <span className="text-xs font-mono text-rose-400 bg-rose-950 px-2.5 py-1 rounded-xl border border-rose-800 font-bold">
                Step-Up MFA Required for Toggle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {killSwitches.map((ks) => (
                <div
                  key={ks.id}
                  className={`p-4 rounded-2xl border transition space-y-3 ${
                    ks.active
                      ? 'bg-rose-950/80 border-rose-600 text-rose-100 ring-1 ring-rose-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{ks.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      ks.severity === 'CRITICAL' ? 'bg-rose-900 text-rose-200' : 'bg-amber-900 text-amber-200'
                    }`}>
                      {ks.severity}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-400">
                    {ks.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400">
                      State: <strong className={ks.active ? 'text-rose-400 font-bold' : 'text-slate-400'}>{ks.active ? 'ENGAGED' : 'DISENGAGED'}</strong>
                    </span>
                    <button
                      onClick={() => initiateKillSwitchToggle(ks)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        ks.active
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{ks.active ? 'Disengage' : 'Engage'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Total Active Filings</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">1,428</div>
              <div className="text-[11px] text-emerald-400 mt-1">98.2% on SLA track</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">IRS MeF A2A Status</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">HEALTHY</div>
              <div className="text-[11px] text-slate-400 mt-1">Direct Gateway connected</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Deterministic Engine Runs</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">842,000</div>
              <div className="text-[11px] text-emerald-400 mt-1">$0.00 token cost (Pure Math)</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block">Avg Cost / Case</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">$1.84</div>
              <div className="text-[11px] text-emerald-400 mt-1">Well below $4.50 cap</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 2: PLATFORM & COMPUTE
         ============================================================ */}
      {activeModule === 'platform' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Compute Infrastructure & Shard Health</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold">PostgreSQL Aurora Shards</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">Primary + 3 Replicas</div>
              <p className="text-slate-400 text-[11px] mt-1">Replication lag: 1.1ms • Connection pool: 24% utilized</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold">Redis Distributed Cache</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">98.4% Hit Rate</div>
              <p className="text-slate-400 text-[11px] mt-1">Statutory rule hash cache • Memory usage: 4.2 GB / 16 GB</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold">Worker Thread Pools (BullMQ)</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">0 Backpressure</div>
              <p className="text-slate-400 text-[11px] mt-1">64 concurrent calculation workers • 0 stalled jobs</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 3: ORGANIZATIONS & TENANTS
         ============================================================ */}
      {activeModule === 'organizations' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Multi-Tenant Organizations</span>
          </h3>
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Organization Name</th>
                  <th className="py-2.5 px-3">Tenant ID</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Active TaxCases</th>
                  <th className="py-2.5 px-3 text-right">Isolation Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-semibold text-white">Apex Dynamics LLC</td>
                  <td className="py-3 px-3 font-mono text-slate-400">tenant-apex-2027</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">FULL_TAX_OS</span></td>
                  <td className="py-3 px-3 font-mono text-white">340 cases</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-mono text-[10px]">Row-Level Security (RLS)</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-semibold text-white">Vanguard Tax Partners LLP</td>
                  <td className="py-3 px-3 font-mono text-slate-400">tenant-vanguard-902</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">ENTERPRISE_FIRM</span></td>
                  <td className="py-3 px-3 font-mono text-white">780 cases</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-mono text-[10px]">Dedicated Tenant Schema</td>
                </tr>
                <tr className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-semibold text-white">Pacific Financial Advisory</td>
                  <td className="py-3 px-3 font-mono text-slate-400">tenant-pac-410</td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">STANDARD_FIRM</span></td>
                  <td className="py-3 px-3 font-mono text-white">308 cases</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-mono text-[10px]">Row-Level Security (RLS)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 4: USERS & RBAC
         ============================================================ */}
      {activeModule === 'users' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>26 Granular User Roles & Privilege Matrix</span>
          </h3>
          <p className="text-xs text-slate-400">
            Enforces strict boundaries: Tax Knowledge Admins cannot view PII; Security Admins cannot alter tax code.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">TAX_ATTORNEY</span>
              <p className="text-slate-400 text-[11px] mt-0.5">IRC § 7525 privilege escalation grants, legal memo encryption</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">OPERATIONS_MANAGER</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Queue reallocation, SLA management, masked PII by default</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">TAX_KNOWLEDGE_ADMINISTRATOR</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Statutory rule authoring only. 100% blocked from customer TaxCases</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">SUPER_ADMINISTRATOR</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Emergency kill switches & platform routing with Step-Up MFA</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 5: AGENTS & MODELS
         ============================================================ */}
      {activeModule === 'agents' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Agent Fleet & Consensus Engine</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Nexus Agent</span>
              <div className="text-emerald-400 font-mono mt-1 font-bold">100% Accuracy</div>
              <p className="text-slate-400 text-[11px] mt-0.5">Wayfair economic thresholds across all 45 sales tax states</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Worker Classification Agent</span>
              <div className="text-emerald-400 font-mono mt-1 font-bold">99.4% Consensus</div>
              <p className="text-slate-400 text-[11px] mt-0.5">California AB 5 three-prong ABC test analysis</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white">Depreciation & Sec 179 Agent</span>
              <div className="text-emerald-400 font-mono mt-1 font-bold">100% Deterministic</div>
              <p className="text-slate-400 text-[11px] mt-0.5">MACRS tables, luxury auto caps § 280F</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 6: TAX RULES ENGINE
         ============================================================ */}
      {activeModule === 'rules' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Statutory Rule Releases (Cryptographic Hashes)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              100% Regression Suite Passing
            </span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Jurisdiction</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Cryptographic SHA-256</th>
                  <th className="py-2.5 px-3">Statutory Authorities</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {activeRuleReleases.map(rule => (
                  <tr key={rule.jurisdiction} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-bold text-white font-sans">{rule.jurisdiction}</td>
                    <td className="py-3 px-3 text-slate-300">{rule.version}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">{rule.hash}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">{rule.statutes.join(', ')}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {rule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 7: FILING & MEF
         ============================================================ */}
      {activeModule === 'filing' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            <span>IRS MeF & State Gateway Transmissions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">IRS A2A Transmission Gateway</span>
                <span className="text-emerald-400 font-bold font-mono">ONLINE</span>
              </div>
              <p className="text-slate-400 text-[11px]">Direct MeF SOAP/XML pipe with SHA-256 digital signature</p>
              <div className="font-mono text-[10px] text-slate-400">Queue Depth: 0 • Rejection Rate: 0.12%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">California FTB Direct Gateway</span>
                <span className="text-emerald-400 font-bold font-mono">ONLINE</span>
              </div>
              <p className="text-slate-400 text-[11px]">e-File Form 540 transmission service</p>
              <div className="font-mono text-[10px] text-slate-400">ACK Latency: 1.4s • Pass Rate: 99.8%</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 8: INTEGRATIONS
         ============================================================ */}
      {activeModule === 'integrations' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plug className="w-4 h-4 text-emerald-400" />
            <span>Third-Party Partner Webhooks & API Connectors</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block">Plaid OAuth</span>
              <span className="text-emerald-400 font-bold text-[11px]">Connected • 100% Up</span>
              <p className="text-slate-400 text-[10px] mt-1">Direct bank feed transaction streaming</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block">Gusto Payroll API</span>
              <span className="text-emerald-400 font-bold text-[11px]">Connected • 100% Up</span>
              <p className="text-slate-400 text-[10px] mt-1">Form 941 & W-2 automated reconciliation</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block">Stripe Tax Gateway</span>
              <span className="text-emerald-400 font-bold text-[11px]">Connected • 100% Up</span>
              <p className="text-slate-400 text-[10px] mt-1">Sales transaction sourcing & nexus trigger</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 9: MODELS & TELEMETRY
         ============================================================ */}
      {activeModule === 'models' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Model Routing Telemetry ($4.50 Cap Enforcement)</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Avg Cost: $1.84</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">Deterministic Math Engine</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">842,000 runs</div>
              <div className="text-[11px] text-slate-400 mt-1">$0.00 Token Spend</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">Claude 3.5 Sonnet (Tier 1)</span>
              <div className="text-xl font-bold font-mono text-white mt-1">42,100 calls</div>
              <div className="text-[11px] text-slate-400 mt-1">$612.40 Total Spend</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">GPT-4o (Fallback Tier)</span>
              <div className="text-xl font-bold font-mono text-white mt-1">3,420 calls</div>
              <div className="text-[11px] text-slate-400 mt-1">$48.10 Total Spend</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 10: SECURITY & HSM
         ============================================================ */}
      {activeModule === 'security' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Architecture & Hardware Security Modules (HSM)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white">IRS Pub 1075 Safeguards</span>
              <p className="text-slate-400 text-[11px]">SSN encryption at rest with AES-256-GCM. Salted hashing on PII fields.</p>
              <div className="text-emerald-400 font-mono text-[10px] pt-1">Status: COMPLIANT</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="font-bold text-white">KMS Key Rotation</span>
              <p className="text-slate-400 text-[11px]">Automatic 90-day HSM rotation cycle. Current key age: 14 days.</p>
              <div className="text-emerald-400 font-mono text-[10px] pt-1">Last Rotated: 2026-09-24</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 11: BILLING & MRR
         ============================================================ */}
      {activeModule === 'billing' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>B2B SaaS Revenue & Consumption Metering</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">Monthly Recurring Revenue</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">$384,200</div>
              <div className="text-[10px] text-slate-400 mt-1">+14.2% MoM growth</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">Active Enterprise Firms</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">48 Firms</div>
              <div className="text-[10px] text-slate-400 mt-1">Avg 24 preparer seats / firm</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 font-semibold block">Gross Platform Margin</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">88.4%</div>
              <div className="text-[10px] text-slate-400 mt-1">Zero LLM waste due to deterministic first-pass</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 12: FEATURE FLAGS
         ============================================================ */}
      {activeModule === 'flags' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Flag className="w-4 h-4 text-emerald-400" />
            <span>Dynamic Feature Flags & Canary Rollouts</span>
          </h3>
          <div className="space-y-3">
            {featureFlags.map(flag => (
              <div key={flag.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{flag.key}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {flag.canaryPercent}% Canary
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{flag.description}</p>
                </div>
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    flag.enabled 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 13: RELEASES & DEPLOYS
         ============================================================ */}
      {activeModule === 'releases' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Platform Semantic Release History</span>
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">v2026.1.4 — Multi-Domain Production Release</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Commit: 7a94b81 • 0 compiler errors • All 21 public routes deployed</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                CURRENT LIVE
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-sm">v2026.1.3 — California AB 5 & New York Convenience Update</span>
                <p className="text-slate-400 text-[11px] mt-0.5">Commit: 3d12c89 • Authority engine regression verified</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800">
                ARCHIVED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 14: INCIDENTS & ALERTS
         ============================================================ */}
      {activeModule === 'incidents' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Active Platform Incidents & PagerDuty Health</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-bold">
              All Systems Operational
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>0 Open P1/P2 Incidents</span>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              Automated circuit breakers active across IRS MeF gateway, Plaid sync webhooks, and LLM inference clusters.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          MODULE 15: AUDIT LOGS & PROVENANCE
         ============================================================ */}
      {activeModule === 'audit' && (
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Audit Ledger (SHA-256 Provenance Chain)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Block Height: #84,912</span>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 font-sans">Audit Event</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3 text-right">Block Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                    <td className="py-2.5 px-3 text-white font-sans">{log.event}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.user}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{log.blockHash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================
          PART 26: STEP-UP MFA CONFIRMATION MODAL
         ============================================================ */}
      {mfaActionPending && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-rose-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl text-slate-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span>Step-Up MFA Authorization (Part 26)</span>
              </div>
              <button
                onClick={() => setMfaActionPending(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">{mfaActionPending.title}</h4>
              <p className="text-slate-300 leading-relaxed">{mfaActionPending.description}</p>
            </div>

            <form onSubmit={handleConfirmMfaAction} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Incident or Change Ticket # (Required)</label>
                <input
                  type="text"
                  value={ticketReason}
                  onChange={(e) => setTicketReason(e.target.value)}
                  placeholder="e.g. INC-8942 / CHG-2026-04"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Hardware Token or TOTP (Demo: <strong>749201</strong>)</label>
                <input
                  type="password"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="Enter 6-digit TOTP (749201)"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-mono text-white font-bold tracking-widest focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={confirmRiskChecked}
                  onChange={(e) => setConfirmRiskChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-rose-600 focus:ring-0"
                />
                <span className="text-[11px] text-slate-300 leading-snug">
                  I understand this action modifies production system controls and creates an immutable entry in the cryptographic audit ledger.
                </span>
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Authorize & Execute Action</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMfaActionPending(null)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition"
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
