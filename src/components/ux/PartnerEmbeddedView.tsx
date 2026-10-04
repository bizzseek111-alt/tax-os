import React, { useState } from 'react';
import { 
  Terminal, 
  Key, 
  Webhook, 
  Layers, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Lock,
  Building,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Plus
} from 'lucide-react';

interface PartnerWebhook {
  id: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'FAILING' | 'DISABLED';
  lastDelivery: string;
  successRate: number;
}

export function PartnerEmbeddedView() {
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'WEBHOOKS' | 'KEYS' | 'BRANDING' | 'DOCS'>('OVERVIEW');
  const [sandboxApiKey, setSandboxApiKey] = useState('tax_sbx_live_9a7d8841fbc80129e01');
  const [prodApiKey, setProdApiKey] = useState('tax_live_sec_58df20a84c718b92d6e');
  const [webhooks, setWebhooks] = useState<PartnerWebhook[]>([
    {
      id: 'wh-001',
      url: 'https://api.fintechpartner.io/v1/tax-webhooks/filing-events',
      events: ['taxcase.ready_to_file', 'return.accepted', 'return.rejected'],
      status: 'ACTIVE',
      lastDelivery: '3 mins ago (200 OK)',
      successRate: 99.98
    },
    {
      id: 'wh-002',
      url: 'https://webhooks.creatorbank.co/events/tax-compliance',
      events: ['document.verified', 'nexus.threshold_breached'],
      status: 'ACTIVE',
      lastDelivery: '14 mins ago (200 OK)',
      successRate: 100.0
    }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [brandColor, setBrandColor] = useState('#2563EB');
  const [partnerDomain, setPartnerDomain] = useState('tax.apexpay.com');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRollKey = () => {
    const newKey = environment === 'SANDBOX' 
      ? 'tax_sbx_live_' + Math.random().toString(36).substring(2, 15)
      : 'tax_live_sec_' + Math.random().toString(36).substring(2, 15);
    if (environment === 'SANDBOX') setSandboxApiKey(newKey);
    else setProdApiKey(newKey);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    const newWh: PartnerWebhook = {
      id: `wh-${Date.now().toString().slice(-4)}`,
      url: newWebhookUrl,
      events: ['taxcase.ready_to_file', 'return.accepted'],
      status: 'ACTIVE',
      lastDelivery: 'Never (Pending trigger)',
      successRate: 100.0
    };
    setWebhooks([...webhooks, newWh]);
    setNewWebhookUrl('');
    setShowAddWebhook(false);
  };

  const activeApiKey = environment === 'SANDBOX' ? sandboxApiKey : prodApiKey;

  return (
    <div className="space-y-6">
      {/* Partner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              B2B2C Embedded Platform
            </span>
            <span className="text-xs text-slate-400">Partner Tenant: <code className="text-indigo-300 font-mono">apex-neobank-882</code></span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Partner & Embedded Integration Portal</h1>
          <p className="text-sm text-slate-400 mt-1">
            Embed autonomous tax filing and real-time compliance workflows into your fintech or banking product.
          </p>
        </div>

        {/* Environment Switcher */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-2 rounded-xl shrink-0">
          <span className="text-xs font-medium text-slate-400">Environment:</span>
          <button
            onClick={() => setEnvironment('SANDBOX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              environment === 'SANDBOX'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sandbox Mode
          </button>
          <button
            onClick={() => setEnvironment('PRODUCTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              environment === 'PRODUCTION'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Production (Live)
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>API Usage & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('KEYS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'KEYS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys & Auth</span>
        </button>

        <button
          onClick={() => setActiveTab('WEBHOOKS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'WEBHOOKS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks & Events</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'BRANDING'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>White-Label Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('DOCS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'DOCS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Interactive SDK & Docs</span>
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Monthly Active Filers</span>
              <div className="text-2xl font-bold text-white mt-1">48,290</div>
              <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <span>↑ 18.4%</span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">API Calls (Last 30d)</span>
              <div className="text-2xl font-bold text-white mt-1">2,841,920</div>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <span className="text-indigo-400">P99 Latency:</span>
                <span className="text-slate-300 font-mono">142ms</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Webhook Success Rate</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">99.98%</div>
              <div className="text-xs text-slate-400 mt-2">
                <span>0 failed deliveries in 24h</span>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium">Revenue Share Tier</span>
              <div className="text-2xl font-bold text-indigo-300 mt-1">Tier 1 (35%)</div>
              <div className="text-xs text-emerald-400 mt-2">
                <span>Next tier at 50,000 filers</span>
              </div>
            </div>
          </div>

          {/* Embedded Customers Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Recent Embedded TaxCases</h3>
              <span className="text-xs text-slate-400">Showing live synchronized end-users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">End-User ID</th>
                    <th className="py-3 px-3">Jurisdiction</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Documents</th>
                    <th className="py-3 px-3">Est. Tax Savings</th>
                    <th className="py-3 px-3">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-indigo-300">usr_apx_991820</td>
                    <td className="py-3 px-3">US-FED + CA</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACCEPTED_BY_IRS
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">18 files</td>
                    <td className="py-3 px-3 text-emerald-400 font-sans font-bold">$3,420</td>
                    <td className="py-3 px-3 text-slate-500 font-sans">2 mins ago</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-indigo-300">usr_apx_991821</td>
                    <td className="py-3 px-3">US-FED + NY + NJ</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        READY_TO_FILE
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">24 files</td>
                    <td className="py-3 px-3 text-emerald-400 font-sans font-bold">$5,180</td>
                    <td className="py-3 px-3 text-slate-500 font-sans">12 mins ago</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-indigo-300">usr_apx_991822</td>
                    <td className="py-3 px-3">US-FED + IL</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PRO_REVIEW_IN_PROGRESS
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">11 files</td>
                    <td className="py-3 px-3 text-emerald-400 font-sans font-bold">$1,950</td>
                    <td className="py-3 px-3 text-slate-500 font-sans">41 mins ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* API KEYS TAB */}
      {activeTab === 'KEYS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div>
            <h3 className="text-base font-semibold text-white">Environment Credentials</h3>
            <p className="text-xs text-slate-400 mt-1">
              Use these secret keys to authenticate HTTP requests to the Autonomous Tax OS REST and GraphQL APIs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {environment === 'SANDBOX' ? 'Sandbox Secret Key' : 'Production Secret Key'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    environment === 'SANDBOX' ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
                  }`}>
                    {environment}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeApiKey}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeApiKey, 'api-key')}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'api-key' ? 'Copied!' : 'Copy Key'}</span>
                </button>
                <button
                  onClick={handleRollKey}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Roll Key</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WEBHOOKS TAB */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Configured Webhook Endpoints</h3>
              <p className="text-xs text-slate-400">Receive real-time push events when filings complete or exceptions trigger.</p>
            </div>
            <button
              onClick={() => setShowAddWebhook(!showAddWebhook)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Endpoint</span>
            </button>
          </div>

          {showAddWebhook && (
            <form onSubmit={handleAddWebhook} className="bg-slate-950 p-4 rounded-xl border border-indigo-900/50 space-y-4">
              <h4 className="text-xs font-semibold text-indigo-300">Register New Webhook URL</h4>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://your-domain.com/webhooks/tax"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{wh.url}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {wh.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {wh.events.map((ev) => (
                      <span key={ev} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 border border-slate-700">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Last delivery: {wh.lastDelivery} • Success rate: {wh.successRate}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(wh.url, wh.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRANDING TAB */}
      {activeTab === 'BRANDING' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div>
            <h3 className="text-base font-semibold text-white">White-Label Partner Branding</h3>
            <p className="text-xs text-slate-400 mt-1">Configure how your embedded tax filing widget appears inside your app.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Custom Domain / CNAME</label>
                <input
                  type="text"
                  value={partnerDomain}
                  onChange={(e) => setPartnerDomain(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Primary Brand Accent Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert('Brand configuration saved.')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
                >
                  Save Brand Settings
                </button>
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Live Embedded Preview</span>
                <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Embedded Taxdrop Widget</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                  </div>
                  <div className="mt-3 p-3 rounded-lg border border-dashed border-slate-700 text-center text-xs text-slate-400">
                    Drop tax documents here to auto-populate your filing
                  </div>
                  <button
                    className="w-full mt-3 py-1.5 rounded-lg text-xs font-semibold text-white transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    Continue Filing
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-4 text-center">
                Powered by Autonomous Tax OS Engine
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCS TAB */}
      {activeTab === 'DOCS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
          <div>
            <h3 className="text-base font-semibold text-white">Interactive REST API & SDK</h3>
            <p className="text-xs text-slate-400 mt-1">Copy and execute code snippets in Node.js, Python, or cURL.</p>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span>POST /v1/tax-cases/create</span>
              <button
                onClick={() => handleCopy(`curl -X POST https://api.tax-os.io/v1/tax-cases/create \\\n  -H "Authorization: Bearer ${activeApiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"taxYear": 2026, "jurisdictions": ["US-FED", "US-CA"]}'`, 'curl')}
                className="hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'curl' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs text-indigo-300 font-mono mt-3 overflow-x-auto p-2">
{`curl -X POST https://api.tax-os.io/v1/tax-cases/create \\
  -H "Authorization: Bearer ${activeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "taxYear": 2026,
    "jurisdictions": ["US-FED", "US-CA"],
    "filingType": "INDIVIDUAL_SCHEDULE_C",
    "connectedSources": ["stripe_acct_8819", "plaid_itm_2091"]
  }'`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
