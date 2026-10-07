import React from 'react';
import { 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Lock, 
  Clock, 
  Eye, 
  Check, 
  Server, 
  Building2,
  FileCheck2
} from 'lucide-react';

interface TaxProfessionalsPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function TaxProfessionalsPage({ onStartFiling, onNavigate }: TaxProfessionalsPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          TaxOS for Accounting Firms, CPAs & Enrolled Agents
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Let AI prepare the work. Your team reviews what matters.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Eliminate 80% of manual tax preparation time. TaxOS autonomously ingests client documents, reconciles transactions, generates workpapers, and surfaces prepared exception briefs for licensed reviewer sign-off.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => onNavigate('/signin')}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Access Professional Portal</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: AI INTAKE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Sparkles className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Frictionless Client Intake</h3>
            <p className="text-neutral-600">Clients upload files or snap smartphone photos without navigating clunky 50-page PDF organizers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <FileText className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Multi-Pass OCR Extraction</h3>
            <p className="text-neutral-600">Extracts 100% of W-2, 1099, K-1, and 1098 box values with cryptographic mathematical cross-checks.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Layers className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Bank Transfer Deduplication</h3>
            <p className="text-neutral-600">Pairs debits and credits across multiple bank accounts to eliminate false duplicate revenue claims.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: DOCUMENT AUTOMATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Universal Document Ingestion & Vaulting</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Stop chasing clients for missing pages. TaxOS verifies document completeness on upload, alerting clients immediately if Box 12 codes are clipped or second pages of Schedule K-1s are missing.
          </p>
        </div>
      </section>

      {/* SECTION 4: TRANSACTION RECONCILIATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Automated Schedule C & General Ledger Grouping</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Reconciles thousands of business debit card transactions against uploaded receipt images, grouping them into ordinary and necessary expense categories under 26 U.S.C. § 162.
          </p>
        </div>
      </section>

      {/* SECTION 5: STANDARDIZED DIGITAL WORKPAPERS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <FileCheck2 className="w-6 h-6 text-lime-400" />
          <h3 className="text-xl font-bold text-white">Audit-Ready Digital Workpaper Packets</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Every return draft is supported by standardized digital workpapers featuring one-click drill downs to underlying source transactions, receipt images, and statutory citations.
          </p>
        </div>
      </section>

      {/* SECTION 6: EXCEPTION-DRIVEN REVIEW QUEUE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">Exception Management</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Review what matters. Ignore what's already verified.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              Your professional queue prioritizes returns by risk score, statutory ambiguity, and client response status. Spend billable hours on high-value advisory rather than routine data entry.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between font-bold text-forest-950 pb-2 border-b border-sage-200">
              <span>Client: Alex Rivera</span>
              <span className="text-forest-700">98% AI Confidence</span>
            </div>
            <div className="text-neutral-600 space-y-1">
              <p>• 142 of 144 Schedule C expenses matched to verified receipts</p>
              <p>• 1 flagged exception: Client meals 50% statutory disallowance review (§ 274(n))</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: THE AI REVIEW BRIEF */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <Eye className="w-6 h-6 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">The 1-Page AI Review Brief</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Every TaxCase opens with an executive brief highlighting: Gross tax base, year-over-year variances, non-standard tax positions taken, statutory code citations, and outstanding client clarification items.
          </p>
        </div>
      </section>

      {/* SECTION 8: EVIDENCE LINEAGE & PROVENANCE */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Immutable SHA-256 Provenance</h3>
          <p className="text-sm text-neutral-600">
            Never wonder where a deduction came from. Every return line connects through a cryptographic directed acyclic graph (DAG) to source transaction hashes.
          </p>
        </div>
      </section>

      {/* SECTION 9: EXCEPTION WORKFLOW & OVERRIDES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Seamless Professional Overrides</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Need to disallow an expense or reclassify an item? CPAs can override any AI recommendation with a single click, recording the professional rationale in the permanent audit ledger.
          </p>
        </div>
      </section>

      {/* SECTION 10: DIRECT CLIENT CLARIFICATION QUEUE */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Users className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">In-App Client Requests</h3>
          <p className="text-sm text-neutral-600">
            Send structured clarification requests straight to the client's "Needs You" mobile dashboard without endless back-and-forth emails.
          </p>
        </div>
      </section>

      {/* SECTION 11: FIRM ADMIN & PREPARER MANAGEMENT */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <Building2 className="w-6 h-6 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">Firm-Wide Preparer Seat Management</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Assign cases to junior staff accountants for preliminary data verification, routing completed work to partner-level CPAs for final sign-off.
          </p>
        </div>
      </section>

      {/* SECTION 12: GRANULAR TEAM PERMISSIONS (RBAC) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <Lock className="w-4 h-4 text-forest-700" />
            <span>Zero-Trust Client Data Isolation</span>
          </div>
          <p>
            Configure granular role permissions restricting junior staff from accessing sensitive client banking credentials or confidential legal workpapers.
          </p>
        </div>
      </section>

      {/* SECTION 13: SOFTWARE & MEF INTEGRATIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Server className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Direct IRS MeF XML & Tax Software Exports</h3>
          <p className="text-sm text-neutral-600">
            Transmit directly via IRS Modernized e-File (MeF) or export standard workpaper files to Drake, UltraTax, ProConnect, and Lacerte.
          </p>
        </div>
      </section>

      {/* SECTION 14: ENTERPRISE SECURITY */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">GLBA & IRS Pub 1075 Compliance</h3>
          <p className="text-sm text-neutral-600">
            Engineered to safeguard Federal Tax Information (FTI) with SOC 2 Type II certified controls and hardware-level encryption.
          </p>
        </div>
      </section>

      {/* SECTION 15: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={() => onNavigate('/signin')}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Partner with TaxOS</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
