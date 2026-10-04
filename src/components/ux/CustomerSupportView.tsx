import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Search, 
  Filter, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Send, 
  ArrowUpRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  FileText, 
  Lock,
  Headphones,
  CreditCard,
  Wrench,
  Scale
} from 'lucide-react';

export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'TAX_QUESTION' | 'PRO_ESCALATION' | 'SECURITY';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CLIENT' | 'RESOLVED';

interface SupportTicket {
  id: string;
  category: TicketCategory;
  title: string;
  clientName: string;
  clientEmail: string;
  maskedSsn: string;
  rawSsn: string;
  maskedIncome: string;
  rawIncome: string;
  taxYear: number;
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  assignedTo: string;
  messages: Array<{
    sender: 'CLIENT' | 'SUPPORT' | 'SYSTEM';
    text: string;
    timestamp: string;
  }>;
}

export function CustomerSupportView() {
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('TICK-1092');
  const [isPiiUnmasked, setIsPiiUnmasked] = useState<Record<string, boolean>>({});
  const [unmaskReason, setUnmaskReason] = useState('');
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-1092',
      category: 'TAX_QUESTION',
      title: 'Dispute over Schedule C home office square footage',
      clientName: 'Alex Rivera',
      clientEmail: 'alex.rivera@techstudio.io',
      maskedSsn: '•••-••-4819',
      rawSsn: '482-19-4819',
      maskedIncome: '$••••••',
      rawIncome: '$142,500.00',
      taxYear: 2026,
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: '18 mins ago',
      assignedTo: 'Tier 2 Tax Support',
      messages: [
        {
          sender: 'CLIENT',
          text: 'I used 300 sq ft for my recording studio, but the Tax Inbox card defaulted to simplified 250 sq ft.',
          timestamp: '18 mins ago'
        },
        {
          sender: 'SUPPORT',
          text: 'Hello Alex, checking your uploaded floor plan and Form 8829 calculations now.',
          timestamp: '10 mins ago'
        }
      ]
    },
    {
      id: 'TICK-1093',
      category: 'TECHNICAL',
      title: 'Plaid bank sync timed out during Chase ingestion',
      clientName: 'Elena Rostova',
      clientEmail: 'elena.rostova@designworks.com',
      maskedSsn: '•••-••-9932',
      rawSsn: '519-82-9932',
      maskedIncome: '$••••••',
      rawIncome: '$210,000.00',
      taxYear: 2026,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: '42 mins ago',
      assignedTo: 'Integration Eng',
      messages: [
        {
          sender: 'CLIENT',
          text: 'The connection spinner kept running after 2FA sms confirmation.',
          timestamp: '42 mins ago'
        }
      ]
    },
    {
      id: 'TICK-1094',
      category: 'PRO_ESCALATION',
      title: 'Request CPA consultation for NY/NJ convenience rule',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus.vance@vancemgmt.com',
      maskedSsn: '•••-••-2281',
      rawSsn: '601-34-2281',
      maskedIncome: '$••••••',
      rawIncome: '$340,000.00',
      taxYear: 2026,
      status: 'OPEN',
      priority: 'CRITICAL',
      createdAt: '1 hour ago',
      assignedTo: 'Assigned EA Pod B',
      messages: [
        {
          sender: 'CLIENT',
          text: 'I need to speak with Sarah Jenkins CPA regarding the telecommuter credit calculation.',
          timestamp: '1 hour ago'
        }
      ]
    },
    {
      id: 'TICK-1095',
      category: 'SECURITY',
      title: 'Login attempt from unrecognized IP address in Singapore',
      clientName: 'David K. Thorne',
      clientEmail: 'david.thorne@thorneanalytics.io',
      maskedSsn: '•••-••-7714',
      rawSsn: '198-44-7714',
      maskedIncome: '$••••••',
      rawIncome: '$95,000.00',
      taxYear: 2026,
      status: 'OPEN',
      priority: 'CRITICAL',
      createdAt: '2 hours ago',
      assignedTo: 'Security Response',
      messages: [
        {
          sender: 'SYSTEM',
          text: 'Security alert triggered: Cross-border IP geo mismatch. Session challenged with FIDO2.',
          timestamp: '2 hours ago'
        }
      ]
    },
    {
      id: 'TICK-1096',
      category: 'BILLING',
      title: 'Invoice inquiry for B2B multi-member add-on',
      clientName: 'Claire Beauchamp',
      clientEmail: 'c.beauchamp@crestadvisors.com',
      maskedSsn: '•••-••-3041',
      rawSsn: '320-11-3041',
      maskedIncome: '$••••••',
      rawIncome: '$180,000.00',
      taxYear: 2026,
      status: 'RESOLVED',
      priority: 'LOW',
      createdAt: '1 day ago',
      assignedTo: 'Billing Team',
      messages: [
        {
          sender: 'CLIENT',
          text: 'Can I add 3 more client seats to our current tier?',
          timestamp: '1 day ago'
        },
        {
          sender: 'SUPPORT',
          text: 'Yes Claire, seats updated and prorated for current billing cycle.',
          timestamp: '22 hours ago'
        }
      ]
    }
  ]);

  const filteredTickets = tickets.filter(t => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setTickets(tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'WAITING_ON_CLIENT',
          messages: [
            ...t.messages,
            {
              sender: 'SUPPORT',
              text: replyText,
              timestamp: 'Just now'
            }
          ]
        };
      }
      return t;
    }));
    setReplyText('');
  };

  const handleEscalateToCpa = () => {
    setTickets(tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          category: 'PRO_ESCALATION',
          priority: 'CRITICAL',
          assignedTo: 'Senior Tax Reviewer Pod A',
          messages: [
            ...t.messages,
            {
              sender: 'SYSTEM',
              text: 'Ticket escalated to Senior EA/CPA reviewer with priority SLA (under 2 hours).',
              timestamp: 'Just now'
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleConfirmUnmask = () => {
    if (!unmaskReason.trim()) {
      alert('A valid operational business justification is mandatory to unmask PII.');
      return;
    }
    setIsPiiUnmasked(prev => ({ ...prev, [selectedTicket.id]: true }));
    setShowUnmaskModal(false);
    setUnmaskReason('');
  };

  const isCurrentUnmasked = !!isPiiUnmasked[selectedTicket.id];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              Support Operations Cockpit
            </span>
            <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> Default PII Masking Active
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-2">Customer Support & Escalations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Role-gated tier support with strict privacy boundary enforcement and seamless CPA escalation.
          </p>
        </div>

        {/* Quick Category Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700">
            Open: <strong className="text-white">3</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs bg-rose-950/60 text-rose-300 border border-rose-800/40">
            Critical: <strong className="text-rose-200">2</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
            Resolved (24h): <strong className="text-emerald-200">14</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Ticket List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Tickets Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search ticket, client, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(['ALL', 'TAX_QUESTION', 'TECHNICAL', 'PRO_ESCALATION', 'SECURITY', 'BILLING'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap text-[11px] ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Cards */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredTickets.map((t) => {
              const isSelected = t.id === selectedTicket.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-blue-400">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      t.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">{t.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {t.clientName}
                    </span>
                    <span className="text-slate-500">{t.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      Assigned: {t.assignedTo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ticket Detail Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400">{selectedTicket.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs text-slate-400">Tax Year: {selectedTicket.taxYear}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{selectedTicket.title}</h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEscalateToCpa}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate to CPA</span>
                </button>
              </div>
            </div>

            {/* PII & Client Identity Box (Default Masked) */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Taxpayer Identity & PII Guard
                </span>
                <button
                  onClick={() => isCurrentUnmasked ? setIsPiiUnmasked(prev => ({ ...prev, [selectedTicket.id]: false })) : setShowUnmaskModal(true)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {isCurrentUnmasked ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Mask PII
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Unmask (Requires Justification)
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Client Name:</span>
                  <div className="font-medium text-white">{selectedTicket.clientName}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Email:</span>
                  <div className="font-medium text-white truncate">{selectedTicket.clientEmail}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">SSN / ITIN:</span>
                  <div className="font-mono text-white">
                    {isCurrentUnmasked ? selectedTicket.rawSsn : selectedTicket.maskedSsn}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Verified Income:</span>
                  <div className="font-mono text-emerald-400">
                    {isCurrentUnmasked ? selectedTicket.rawIncome : selectedTicket.maskedIncome}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Communication History</span>
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                {selectedTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs ${
                      m.sender === 'CLIENT'
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 mr-8'
                        : m.sender === 'SUPPORT'
                        ? 'bg-blue-950/40 border border-blue-900/40 text-blue-100 ml-8'
                        : 'bg-amber-950/30 border border-amber-900/30 text-amber-200 text-center text-[11px]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold">{m.sender}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <div>{m.text}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type response to taxpayer or add internal note..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Quick macros:</span>
              <button
                type="button"
                onClick={() => setReplyText('Please upload your Form 1098 or 8829 supporting workpaper via TaxDrop.')}
                className="hover:text-blue-400 underline"
              >
                Request Evidence
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setReplyText('Your tax case has been assigned to our licensed CPA pod for expedited review.')}
                className="hover:text-blue-400 underline"
              >
                Assigned to CPA
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Unmask Modal */}
      {showUnmaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Privilege Escalation: Unmask PII</h3>
            </div>
            <p className="text-xs text-slate-300">
              Under Section 7216 and zero-trust policies, accessing raw SSN/EIN or unmasked financials will record an immutable audit entry with your staff ID and timestamp.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300">Business Justification Reason Code:</label>
              <select
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Select reason...</option>
                <option value="IRS_NOTICE_RECONCILIATION">IRS Notice / State Letter Reconciliation</option>
                <option value="DIRECT_IDENTITY_CONFIRMATION">Taxpayer Identity Voice Verification</option>
                <option value="FORM_W2_BOX_MISMATCH">Form W-2 Box 14 vs State Wage Collision</option>
                <option value="SUPERVISOR_AUDIT">Supervisor Quality Assurance Audit</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUnmaskModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnmask}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white"
              >
                Authorize & Unmask
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
