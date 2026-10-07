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
      <div className="bg-pine-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-pine-600/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-400 text-pine-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              B2B2C Embedded Platform
            </span>
            <span className="text-xs text-white/80">Partner Tenant: <code className="text-lime-300 font-mono font-bold">apex-neobank-882</code></span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Partner & Embedded Integration Portal</h1>
          <p className="text-sm text-white/85 mt-1 max-w-2xl">
            Embed autonomous tax filing and real-time compliance workflows into your fintech or banking product.
          </p>
        </div>

        {/* Environment Switcher */}
        <div className="flex items-center gap-2 bg-pine-800/80 border border-pine-600/50 p-2 rounded-2xl shrink-0">
          <span className="text-xs font-bold text-white/80 pl-2">Environment:</span>
          <button
            onClick={() => setEnvironment('SANDBOX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              environment === 'SANDBOX'
                ? 'bg-lime-400 text-pine-900 shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Sandbox Mode
          </button>
          <button
            onClick={() => setEnvironment('PRODUCTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              environment === 'PRODUCTION'
                ? 'bg-lime-400 text-pine-900 shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Production (Live)
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-sage-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'text-sage-700 hover:text-sage-900 bg-white border border-sage-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>API Usage & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('KEYS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'KEYS'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'text-sage-700 hover:text-sage-900 bg-white border border-sage-300'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys & Auth</span>
        </button>

        <button
          onClick={() => setActiveTab('WEBHOOKS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'WEBHOOKS'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'text-sage-700 hover:text-sage-900 bg-white border border-sage-300'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks & Events</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'BRANDING'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'text-sage-700 hover:text-sage-900 bg-white border border-sage-300'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>White-Label Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('DOCS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === 'DOCS'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'text-sage-700 hover:text-sage-900 bg-white border border-sage-300'
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
            <div className="bg-white border border-sage-300 p-5 rounded-3xl shadow-xs">
              <span className="text-xs text-sage-600 font-medium">Monthly Active Filers</span>
              <div className="text-2xl font-extrabold text-sage-950 mt-1 font-mono">48,290</div>
              <div className="text-xs text-pine-800 mt-2 flex items-center gap-1 font-bold">
                <span>↑ 18.4%</span>
                <span className="text-sage-500 font-normal">vs last month</span>
              </div>
            </div>

            <div className="bg-white border border-sage-300 p-5 rounded-3xl shadow-xs">
              <span className="text-xs text-sage-600 font-medium">API Calls (Last 30d)</span>
              <div className="text-2xl font-extrabold text-sage-950 mt-1 font-mono">2,841,920</div>
              <div className="text-xs text-sage-600 mt-2 flex items-center gap-1">
                <span className="text-pine-800 font-bold">P99 Latency:</span>
                <span className="text-sage-900 font-mono font-bold">142ms</span>
              </div>
            </div>

            <div className="bg-white border border-sage-300 p-5 rounded-3xl shadow-xs">
              <span className="text-xs text-sage-600 font-medium">Webhook Success Rate</span>
              <div className="text-2xl font-extrabold text-pine-800 mt-1 font-mono">99.98%</div>
              <div className="text-xs text-sage-500 mt-2">
                <span>0 failed deliveries in 24h</span>
              </div>
            </div>

            <div className="bg-white border border-sage-300 p-5 rounded-3xl shadow-xs">
              <span className="text-xs text-sage-600 font-medium">Revenue Share Tier</span>
              <div className="text-2xl font-extrabold text-sage-950 mt-1 font-mono">Tier 1 (35%)</div>
              <div className="text-xs text-pine-800 mt-2 font-bold">
                <span>Next tier at 50,000 filers</span>
              </div>
            </div>
          </div>

          {/* Embedded Customers Table */}
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-sage-900">Recent Embedded TaxCases</h3>
              <span className="text-xs text-sage-600 font-medium">Showing live synchronized end-users</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sage-200 text-sage-700 font-bold">
                    <th className="py-3 px-3">End-User ID</th>
                    <th className="py-3 px-3">Jurisdiction</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Documents</th>
                    <th className="py-3 px-3">Est. Tax Savings</th>
                    <th className="py-3 px-3">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-200 font-mono text-sage-800">
                  <tr className="hover:bg-sage-50/50 transition">
                    <td className="py-3 px-3 font-bold text-pine-800">usr_apx_991820</td>
                    <td className="py-3 px-3">US-FED + CA</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-lime-200 text-pine-950 border border-lime-300 font-bold">
                        ACCEPTED_BY_IRS
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">18 files</td>
                    <td className="py-3 px-3 text-pine-800 font-sans font-extrabold">$3,420</td>
                    <td className="py-3 px-3 text-sage-500 font-sans">2 mins ago</td>
                  </tr>
                  <tr className="hover:bg-sage-50/50 transition">
                    <td className="py-3 px-3 font-bold text-pine-800">usr_apx_991821</td>
                    <td className="py-3 px-3">US-FED + NY + NJ</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-pine-100 text-pine-900 border border-pine-200 font-bold">
                        READY_TO_FILE
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">24 files</td>
                    <td className="py-3 px-3 text-pine-800 font-sans font-extrabold">$5,180</td>
                    <td className="py-3 px-3 text-sage-500 font-sans">12 mins ago</td>
                  </tr>
                  <tr className="hover:bg-sage-50/50 transition">
                    <td className="py-3 px-3 font-bold text-pine-800">usr_apx_991822</td>
                    <td className="py-3 px-3">US-FED + IL</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                        PRO_REVIEW_IN_PROGRESS
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans">11 files</td>
                    <td className="py-3 px-3 text-pine-800 font-sans font-extrabold">$1,950</td>
                    <td className="py-3 px-3 text-sage-500 font-sans">41 mins ago</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* API KEYS TAB */}
      {activeTab === 'KEYS' && (
        <div className="bg-white border border-sage-300 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-sage-900">Environment Credentials</h3>
            <p className="text-xs text-sage-600 mt-1">
              Use these secret keys to authenticate HTTP requests to the Autonomous Tax OS REST and GraphQL APIs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-sage-50 p-4 rounded-2xl border border-sage-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sage-900">
                    {environment === 'SANDBOX' ? 'Sandbox Secret Key' : 'Production Secret Key'}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    environment === 'SANDBOX' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-lime-200 text-pine-900 border border-lime-300'
                  }`}>
                    {environment}
                  </span>
                </div>
                <div className="text-xs font-mono text-sage-900 mt-2 bg-white px-3 py-1.5 rounded-xl border border-sage-200 flex items-center gap-2 font-bold">
                  <Lock className="w-3.5 h-3.5 text-sage-500" />
                  <span>{activeApiKey}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(activeApiKey, 'api-key')}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-lime-400 hover:bg-lime-500 text-pine-900 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'api-key' ? 'Copied!' : 'Copy Key'}</span>
                </button>
                <button
                  onClick={handleRollKey}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-white hover:bg-sage-100 text-sage-800 transition flex items-center gap-1.5 border border-sage-300"
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
              <h3 className="text-base font-bold text-sage-900">Configured Webhook Endpoints</h3>
              <p className="text-xs text-sage-600">Receive real-time push events when filings complete or exceptions trigger.</p>
            </div>
            <button
              onClick={() => setShowAddWebhook(!showAddWebhook)}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-lime-400 hover:bg-lime-500 text-pine-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Endpoint</span>
            </button>
          </div>

          {showAddWebhook && (
            <form onSubmit={handleAddWebhook} className="bg-sage-50 p-4 rounded-2xl border border-sage-300 space-y-4">
              <h4 className="text-xs font-bold text-pine-800">Register New Webhook URL</h4>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://your-domain.com/webhooks/tax"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="flex-1 bg-white border border-sage-300 rounded-xl px-3 py-2 text-xs text-sage-900 placeholder-sage-500 focus:outline-none focus:border-pine-700"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-pine-700 hover:bg-pine-800 text-white rounded-xl text-xs font-bold"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="bg-white border border-sage-300 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sage-900">{wh.url}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-lime-200 text-pine-900 border border-lime-300 font-bold">
                      {wh.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {wh.events.map((ev) => (
                      <span key={ev} className="px-2 py-0.5 rounded-md text-[10px] bg-sage-50 text-pine-800 border border-sage-200 font-semibold font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-sage-500 mt-2 font-medium">
                    Last delivery: {wh.lastDelivery} • Success rate: {wh.successRate}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(wh.url, wh.id)}
                    className="p-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 transition border border-sage-200"
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
        <div className="bg-white border border-sage-300 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-sage-900">White-Label Partner Branding</h3>
            <p className="text-xs text-sage-600 mt-1">Configure how your embedded tax filing widget appears inside your app.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-sage-700">Custom Domain / CNAME</label>
                <input
                  type="text"
                  value={partnerDomain}
                  onChange={(e) => setPartnerDomain(e.target.value)}
                  className="w-full mt-1 bg-sage-50 border border-sage-300 rounded-xl px-3 py-2 text-xs text-sage-900 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sage-700">Primary Brand Accent Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 bg-sage-50 border border-sage-300 rounded-xl px-3 py-2 text-xs text-sage-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert('Brand configuration saved.')}
                  className="px-5 py-2.5 bg-lime-400 hover:bg-lime-500 text-pine-900 rounded-2xl text-xs font-bold shadow-xs"
                >
                  Save Brand Settings
                </button>
              </div>
            </div>

            {/* Widget Preview */}
            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-sage-600 uppercase tracking-wider font-bold">Live Embedded Preview</span>
                <div className="mt-3 p-4 rounded-2xl border border-sage-300 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sage-900">Embedded Taxdrop Widget</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                  </div>
                  <div className="mt-3 p-3 rounded-xl border border-dashed border-sage-300 text-center text-xs text-sage-600 font-medium">
                    Drop tax documents here to auto-populate your filing
                  </div>
                  <button
                    className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    Continue Filing
                  </button>
                </div>
              </div>
              <div className="text-[10px] text-sage-500 mt-4 text-center font-medium">
                Powered by Autonomous Tax OS Engine
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCS TAB */}
      {activeTab === 'DOCS' && (
        <div className="bg-white border border-sage-300 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-sage-900">Interactive REST API & SDK</h3>
            <p className="text-xs text-sage-600 mt-1">Copy and execute code snippets in Node.js, Python, or cURL.</p>
          </div>

          <div className="bg-sage-900 rounded-2xl border border-sage-800 p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-sage-800 text-xs text-sage-400 font-mono">
              <span className="text-lime-300 font-bold">POST /v1/tax-cases/create</span>
              <button
                onClick={() => handleCopy(`curl -X POST https://api.tax-os.io/v1/tax-cases/create \\\n  -H "Authorization: Bearer ${activeApiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"taxYear": 2026, "jurisdictions": ["US-FED", "US-CA"]}'`, 'curl')}
                className="hover:text-white flex items-center gap-1 font-bold text-xs text-lime-400"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedKey === 'curl' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs text-lime-200 font-mono mt-3 overflow-x-auto p-2">
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
