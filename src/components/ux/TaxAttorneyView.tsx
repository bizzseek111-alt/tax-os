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
  Check,
  Award
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
  defaultAssessment: string;
  workpapers: string[];
  memoDraft: string;
}

export function TaxAttorneyView() {
  const [selectedMatterId, setSelectedMatterId] = useState<string>('matter-01');
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'WORKPAPERS' | 'MEMO'>('ANALYSIS');
  const [assessments, setAssessments] = useState<Record<string, string>>({
    'matter-01': 'Under Zelinsky v. Tax Appeals Tribunal and New York Regulation 20 NYCRR § 131.18, New York asserts sovereign taxing jurisdiction over wage income earned while working remotely for an NYC employer unless the remote office was established for the employer\'s bona fide necessity rather than employee convenience. However, under N.J.S.A. 54A:4-1 and recent 2023 retaliatory convenience legislation, New Jersey provides a resident credit offset. Recommend filing NY Form IT-203 Nonresident return reporting NYC-sourced wages while attaching Form 8275 to preserve substantive position and eliminate negligence penalties under IRC § 6662.',
    'matter-02': 'Under California Labor Code § 2775 (AB 5) and Dynamex Operations West v. Superior Court, worker classification is presumptively employment unless all three prongs of the ABC test are satisfied. However, taxpayer satisfies the Business-to-Business statutory exemption under Cal. Labor Code § 2776: maintaining independent business licensing, separate commercial premises, distinct contracts with multiple clients, and substantial equipment capital investment ($65,000 server infrastructure). Recommend defending 1099 independent contractor classification under the Borello multi-factor standard.'
  });
  const [sealedMatters, setSealedMatters] = useState<Record<string, boolean>>({});

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
      defaultAssessment: 'Under Zelinsky v. Tax Appeals Tribunal and New York Regulation 20 NYCRR § 131.18...',
      workpapers: [
        '[2026-10-02 14:15] Initial interview conducted regarding telecommuter employer domicile.',
        '[2026-10-03 09:30] Client confirmed employer does not maintain a registered office in NJ.',
        '[2026-10-04 11:00] Recommended attaching Form 8275 to Form IT-203 with full disclosure statement.'
      ],
      memoDraft: 'MEMORANDUM OF SUBSTANTIAL AUTHORITY & TAX POSITION DISCLOSURE\nTO: Case File CASE-2026-NY-NJ-ROSTOVA\nRE: Position under 20 NYCRR § 131.18 and IRC § 6662 Penalty Defense\n\nTaxpayer takes the position that wage compensation earned while physically situated outside New York State is properly apportioned based on working days outside the state in accordance with the Due Process and Dormant Commerce Clauses of the United States Constitution.'
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
          citation: 'Cal. Labor Code § 2776',
          description: 'B2B Statutory Contracting Exemption to Dynamex ABC Test',
          jurisdiction: 'US-CA'
        }
      ],
      legalQuestion: 'Does the taxpayer qualify under the Business-to-Business statutory contracting exemption under Cal. Labor Code § 2776?',
      defaultAssessment: 'Under California Labor Code § 2775 (AB 5) and Dynamex...',
      workpapers: [
        '[2026-10-01 10:00] FTB desk audit inquiry received regarding contractor 1099 expense reclassification.',
        '[2026-10-03 16:20] Verified client LLC registration with CA Secretary of State and separate commercial lease.',
        '[2026-10-04 13:45] Compiled Borello 12-factor independence questionnaire.'
      ],
      memoDraft: 'CALIFORNIA FRANCHISE TAX BOARD DEFENSE MEMORANDUM\nTO: FTB Audit Division\nRE: Worker Classification Defense under Cal. Labor Code § 2776 (B2B Exemption)\n\nTaxpayer Vance Tech Holdings operates as an independent business entity providing specialized systems architecture. All services are governed by written contracts meeting each requirement of California Labor Code Section 2776.'
    }
  ];

  const currentMatter = matters.find(m => m.id === selectedMatterId) || matters[0];
  const isMatterSealed = !!sealedMatters[currentMatter.id];
  const currentAssessment = assessments[currentMatter.id] || currentMatter.defaultAssessment;

  const handleDownloadMemo = () => {
    const blob = new Blob([currentMatter.memoDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentMatter.caseRef}_Legal_Defense_Memo.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSealMemo = () => {
    setSealedMatters(prev => ({ ...prev, [currentMatter.id]: true }));
  };

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
            <span className="font-bold text-purple-300 font-mono">{matters.length} Matters</span>
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
                  {sealedMatters[m.id] ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">
                      <Award className="w-3 h-3" /> Sealed
                    </span>
                  ) : (
                    <span className="text-purple-400 font-medium">Review Legal Brief</span>
                  )}
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
                  Privileged Notes ({currentMatter.workpapers.length})
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
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Attorney Legal Assessment & Strategy</span>
                    <span className="text-[10px] text-purple-400 font-mono">Privileged Work Product</span>
                  </div>
                  <textarea
                    value={currentAssessment}
                    onChange={(e) => setAssessments(prev => ({ ...prev, [currentMatter.id]: e.target.value }))}
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
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5">
                  {currentMatter.workpapers.map((wp, idx) => (
                    <div key={idx}>{wp}</div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'MEMO' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Form 8275 / State Protest Defense Memo</span>
                  <button 
                    onClick={handleDownloadMemo}
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 hover:underline px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    <span>Download Formal Memo (.txt)</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentMatter.memoDraft}
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
                  onClick={handleSealMemo}
                  disabled={isMatterSealed}
                  className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    isMatterSealed
                      ? 'bg-emerald-600 text-white cursor-default shadow-md shadow-emerald-500/20'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isMatterSealed ? 'Legal Position Sealed (Bar #CA-294812)' : 'Approve Legal Position & Seal Memo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
