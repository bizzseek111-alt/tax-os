import React, { useState } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Lock, 
  Calendar,
  ExternalLink,
  Download,
  Check
} from 'lucide-react';

interface LegalMatter {
  id: string;
  caseRef: string;
  clientName: string;
  title: string;
  category: 'STATUTORY_CONFLICT' | 'AUDIT_DEFENSE' | 'NOTICE_RESPONSE' | 'PRIVILEGE_WORKPAPER';
  jurisdictions: string[];
  exposureAmount: number;
  clashingAuthorities: Array<{
    citation: string;
    description: string;
    jurisdiction: string;
  }>;
  legalQuestion: string;
  status: 'UNDER_LEGAL_ASSESSMENT' | 'MEMO_PREPARED' | 'APPROVED_WITH_DISCLOSURE';
}

export function TaxAttorneyView() {
  const [selectedMatterId, setSelectedMatterId] = useState<string>('matter-01');
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'WORKPAPERS' | 'MEMO'>('ANALYSIS');
  const [attorneyAssessment, setAttorneyAssessment] = useState(
    'Under Zelinsky v. Tax Appeals Tribunal and New York Regulation 20 NYCRR § 131.18, New York asserts sovereign taxing jurisdiction over wage income earned while working remotely for an NYC employer unless the remote office was established for the employer\'s bona fide necessity rather than employee convenience. However, under N.J.S.A. 54A:4-1 and recent 2023 retaliatory convenience legislation, New Jersey provides a resident credit offset. Recommend filing NY Form IT-203 Nonresident return reporting NYC-sourced wages while attaching Form 8275 to preserve substantive position and eliminate negligence penalties under IRC § 6662.'
  );
  const [memoApproved, setMemoApproved] = useState(false);

  const matters: LegalMatter[] = [
    {
      id: 'matter-01',
      caseRef: 'CASE-2026-NY-NJ-ROSTOVA',
      clientName: 'Elena Rostova (Remote Consultant)',
      title: 'NY Convenience Rule vs NJ Resident Telecommuter Credit Conflict',
      category: 'STATUTORY_CONFLICT',
      jurisdictions: ['US-FED', 'US-NY', 'US-NJ'],
      exposureAmount: 3450,
      clashingAuthorities: [
        {
          citation: '20 NYCRR § 131.18',
          description: 'New York Convenience of the Employer Doctrine (Treats telecommuting days as NY-source wages)',
          jurisdiction: 'US-NY'
        },
        {
          citation: 'N.J.S.A. 54A:4-1 / P.L. 2023 c.125',
          description: 'New Jersey Resident Credit for Taxes Paid & Retaliatory Convenience Standard',
          jurisdiction: 'US-NJ'
        }
      ],
      legalQuestion: 'Does the taxpayer\'s 42 remote workdays in Jersey City for a Manhattan financial consulting firm trigger double taxation, or does the NJ resident credit fully mitigate exposure?',
      status: 'UNDER_LEGAL_ASSESSMENT'
    },
    {
      id: 'matter-02',
      caseRef: 'CASE-2026-CA-AB5-VANCE',
      clientName: 'Marcus Vance Tech Holdings',
      title: 'California FTB Independent Contractor Reclassification Defense',
      category: 'AUDIT_DEFENSE',
      jurisdictions: ['US-CA'],
      exposureAmount: 14200,
      clashingAuthorities: [
        {
          citation: 'Cal. Labor Code § 2775 (AB 5)',
          description: 'Dynamex ABC Worker Classification Test',
          jurisdiction: 'US-CA'
        },
        {
          citation: 'Cal. RTC § 18622',
          description: 'California Assessment and Audit Powers',
          jurisdiction: 'US-CA'
        }
      ],
      legalQuestion: 'Does the taxpayer qualify under the Business-to-Business statutory contracting exemption under Cal. Labor Code § 2776?',
      status: 'UNDER_LEGAL_ASSESSMENT'
    }
  ];

  const currentMatter = matters.find(m => m.id === selectedMatterId) || matters[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tax Controversy & Legal Counsel Workspace
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Privileged & Confidential</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Restricted to escalated legal controversies, statutory clashes, and IRS/state notice defenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">Active Matters</span>
            <span className="font-bold text-purple-300 font-mono">2 Matters</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-rose-400 block text-[10px] uppercase">Controversy Exposure</span>
            <span className="font-bold text-rose-300 font-mono">$17,650</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Legal Matters Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Escalated Legal Controversy Matters
          </div>

          <div className="space-y-2">
            {matters.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMatterId(m.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedMatterId === m.id
                    ? 'bg-slate-900 border-purple-500/50 shadow-md ring-1 ring-purple-500/20'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{m.caseRef}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    ${m.exposureAmount.toLocaleString()} Exposure
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-200 mb-1.5">{m.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mb-3">{m.clientName}</div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1">
                    {m.jurisdictions.map(j => (
                      <span key={j} className="px-1 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300">
                        {j}
                      </span>
                    ))}
                  </div>
                  <span className="text-purple-400 font-medium">Review Legal Brief</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Matter Analysis & Workpapers */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-bold">
                  {currentMatter.caseRef} • {currentMatter.clientName}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                  {currentMatter.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('ANALYSIS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'ANALYSIS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Statutory Clash
                </button>
                <button
                  onClick={() => setActiveTab('WORKPAPERS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'WORKPAPERS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Privileged Notes
                </button>
                <button
                  onClick={() => setActiveTab('MEMO')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'MEMO' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Form 8275 Memo
                </button>
              </div>
            </div>

            {/* Core Legal Issue */}
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Primary Legal Controversy Question</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
                "{currentMatter.legalQuestion}"
              </p>
            </div>

            {/* Statutory Clash Grid */}
            {activeTab === 'ANALYSIS' && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conflicting Sovereign Legal Standards
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMatter.clashingAuthorities.map((auth, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-200">{auth.citation}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {auth.jurisdiction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {auth.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Attorney Legal Assessment & Strategy
                  </div>
                  <textarea
                    value={attorneyAssessment}
                    onChange={(e) => setAttorneyAssessment(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500 font-sans"
                  />
                </div>
              </div>
            )}

            {activeTab === 'WORKPAPERS' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Attorney-Client Privileged Workpapers</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  These records are protected under Federal Rule of Evidence 502 and state professional conduct rules. They are excluded from standard preparer exports and IRS e-file staging schemas.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div>[2026-10-02 14:15] Initial interview conducted regarding telecommuter employer domicile.</div>
                  <div>[2026-10-03 09:30] Client confirmed employer does not maintain a registered office in NJ.</div>
                  <div>[2026-10-04 11:00] Recommended attaching Form 8275 to Form IT-203 with full disclosure statement.</div>
                </div>
              </div>
            )}

            {activeTab === 'MEMO' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Form 8275 / State Protest Defense Memo</span>
                  <button className="flex items-center gap-1 text-xs text-purple-400 hover:underline">
                    <Download className="w-3.5 h-3.5" /> Download PDF Packet
                  </button>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 font-serif text-xs text-slate-300 leading-relaxed space-y-2">
                  <p className="font-bold font-sans">MEMORANDUM OF SUBSTANTIAL AUTHORITY & TAX POSITION DISCLOSURE</p>
                  <p>TO: Case File {currentMatter.caseRef}</p>
                  <p>RE: Position under 20 NYCRR § 131.18 and IRC § 6662 Penalty Defense</p>
                  <p className="pt-2">
                    Taxpayer takes the position that wage compensation earned while physically situated outside New York State is properly apportioned based on working days outside the state in accordance with the Due Process and Dormant Commerce Clauses of the United States Constitution.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Jurisdictional Legal Review Complete</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMemoApproved(true)}
                  disabled={memoApproved}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    memoApproved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{memoApproved ? 'Legal Position Approved & Sealed' : 'Approve Legal Position & Seal Memo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
