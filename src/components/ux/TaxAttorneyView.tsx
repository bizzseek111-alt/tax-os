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
      <div className="p-6 rounded-3xl bg-white border border-sage-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-pine-100 text-pine-800 border border-pine-200">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-sage-900 flex items-center gap-2">
              Tax Controversy & Legal Counsel Workspace
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pine-100 text-pine-800 border border-pine-200 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Privileged & Confidential</span>
              </span>
            </h2>
            <p className="text-xs text-sage-600 mt-0.5">
              Restricted to escalated legal controversies, statutory clashes, and IRS/state notice defenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-2xl bg-sage-50 border border-sage-200 text-center">
            <span className="text-sage-500 block text-[10px] uppercase font-bold">Active Matters</span>
            <span className="font-extrabold text-sage-900 font-mono">{matters.length} Matters</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-rose-700 block text-[10px] uppercase font-bold">Controversy Exposure</span>
            <span className="font-extrabold text-rose-800 font-mono">$17,650</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Legal Matters Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-sage-600 uppercase tracking-wider px-1">
            Escalated Legal Controversy Matters
          </div>

          <div className="space-y-2">
            {matters.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMatterId(m.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  selectedMatterId === m.id
                    ? 'bg-pine-50 border-pine-600 shadow-xs ring-1 ring-pine-600'
                    : 'bg-white border-sage-200 hover:border-sage-300 hover:bg-sage-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-pine-800 font-bold">{m.caseRef}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    ${m.exposureAmount.toLocaleString()} Exposure
                  </span>
                </div>

                <div className="font-bold text-xs text-sage-900 mb-1.5">{m.title}</div>
                <div className="text-[11px] text-sage-600 line-clamp-2 mb-3">{m.clientName}</div>

                <div className="flex items-center justify-between text-[11px] text-sage-500 pt-2 border-t border-sage-200">
                  <div className="flex items-center gap-1">
                    {m.jurisdictions.map(j => (
                      <span key={j} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sage-100 text-sage-700 font-semibold">
                        {j}
                      </span>
                    ))}
                  </div>
                  {sealedMatters[m.id] ? (
                    <span className="text-pine-800 font-bold flex items-center gap-1 text-[10px]">
                      <Award className="w-3.5 h-3.5 text-pine-700" /> Sealed
                    </span>
                  ) : (
                    <span className="text-pine-800 font-bold text-[10px]">Review Legal Brief</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Matter Analysis & Workpapers */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-sage-300 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sage-200">
              <div>
                <span className="text-[10px] font-mono text-pine-800 uppercase tracking-wider block font-bold">
                  {currentMatter.caseRef} • {currentMatter.clientName}
                </span>
                <h3 className="text-lg font-bold text-sage-900 mt-0.5">
                  {currentMatter.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-sage-100 p-1 rounded-2xl border border-sage-200">
                <button
                  onClick={() => setActiveTab('ANALYSIS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'ANALYSIS' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
                  }`}
                >
                  Statutory Clash
                </button>
                <button
                  onClick={() => setActiveTab('WORKPAPERS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'WORKPAPERS' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
                  }`}
                >
                  Privileged Notes ({currentMatter.workpapers.length})
                </button>
                <button
                  onClick={() => setActiveTab('MEMO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeTab === 'MEMO' ? 'bg-pine-700 text-white shadow-xs' : 'text-sage-700 hover:text-sage-900'
                  }`}
                >
                  Form 8275 Memo
                </button>
              </div>
            </div>

            {/* Core Legal Issue */}
            <div className="p-4 rounded-2xl bg-pine-50 border border-pine-200 space-y-2">
              <div className="text-xs font-bold text-pine-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Primary Legal Controversy Question</span>
              </div>
              <p className="text-sm text-sage-900 leading-relaxed font-serif italic">
                "{currentMatter.legalQuestion}"
              </p>
            </div>

            {/* Statutory Clash Grid */}
            {activeTab === 'ANALYSIS' && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-sage-600 uppercase tracking-wider">
                  Conflicting Sovereign Legal Standards
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMatter.clashingAuthorities.map((auth, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sage-900">{auth.citation}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sage-200 text-sage-800 font-semibold">
                          {auth.jurisdiction}
                        </span>
                      </div>
                      <p className="text-xs text-sage-600 leading-relaxed">
                        {auth.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2">
                  <div className="text-xs font-bold text-sage-900 flex items-center justify-between">
                    <span>Attorney Legal Assessment & Strategy</span>
                    <span className="text-[10px] text-pine-800 font-mono font-bold">Privileged Work Product</span>
                  </div>
                  <textarea
                    value={currentAssessment}
                    onChange={(e) => setAssessments(prev => ({ ...prev, [currentMatter.id]: e.target.value }))}
                    rows={4}
                    className="w-full p-3 bg-white border border-sage-300 rounded-xl text-xs text-sage-900 leading-relaxed focus:outline-none focus:border-pine-700 font-sans font-medium"
                  />
                </div>
              </div>
            )}

            {activeTab === 'WORKPAPERS' && (
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-3">
                <div className="flex items-center gap-2 text-pine-800 text-xs font-bold uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Attorney-Client Privileged Workpapers</span>
                </div>
                <p className="text-xs text-sage-600 leading-relaxed">
                  These records are protected under Federal Rule of Evidence 502 and state professional conduct rules. They are excluded from standard preparer exports and IRS e-file staging schemas.
                </p>
                <div className="p-3 bg-white rounded-xl border border-sage-200 font-mono text-xs text-sage-800 space-y-1.5 font-semibold">
                  {currentMatter.workpapers.map((wp, idx) => (
                    <div key={idx}>{wp}</div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'MEMO' && (
              <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sage-900">Form 8275 / State Protest Defense Memo</span>
                  <button 
                    onClick={handleDownloadMemo}
                    className="flex items-center gap-1.5 text-xs text-sage-800 font-semibold hover:bg-sage-100 px-3 py-1.5 rounded-xl bg-white border border-sage-300 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-pine-700" /> 
                    <span>Download Formal Memo (.txt)</span>
                  </button>
                </div>
                <div className="p-4 bg-white rounded-xl border border-sage-200 font-mono text-xs text-sage-900 leading-relaxed whitespace-pre-wrap font-medium">
                  {currentMatter.memoDraft}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-sage-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-sage-600 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                <span>Jurisdictional Legal Review Complete</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSealMemo}
                  disabled={isMatterSealed}
                  className={`px-4 py-2 rounded-2xl font-bold transition flex items-center gap-1.5 ${
                    isMatterSealed
                      ? 'bg-pine-700 text-white cursor-default shadow-xs'
                      : 'bg-lime-400 hover:bg-lime-500 text-pine-900 shadow-xs'
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
