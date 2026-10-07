import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Send, 
  Lock, 
  Eye, 
  Scale 
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function HowItWorksPage({ onStartFiling, onNavigate }: HowItWorksPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Architectural Transparency
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          From raw documents to IRS e-file acknowledgment in five stages.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          Learn how our deterministic statutory engine, document extraction pipeline, and certified CPA network transform disorganized financial files into an audit-ready tax filing.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Experience the Pipeline</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: 5-STAGE PIPELINE OVERVIEW */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center text-xs">
          <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <span className="text-forest-700 font-bold block mb-1">Stage 1</span>
            <strong className="text-sm font-bold text-forest-950 block">Intake & TaxDrop</strong>
            <span className="text-neutral-500 block mt-1">Universal upload & bank connections</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <span className="text-forest-700 font-bold block mb-1">Stage 2</span>
            <strong className="text-sm font-bold text-forest-950 block">Extraction</strong>
            <span className="text-neutral-500 block mt-1">OCR & transfer deduplication</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <span className="text-forest-700 font-bold block mb-1">Stage 3</span>
            <strong className="text-sm font-bold text-forest-950 block">Deterministic Math</strong>
            <span className="text-neutral-500 block mt-1">IRC & state statutory calculation</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <span className="text-forest-700 font-bold block mb-1">Stage 4</span>
            <strong className="text-sm font-bold text-forest-950 block">Self-Challenge</strong>
            <span className="text-neutral-500 block mt-1">Adversarial audit & evidence check</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-sage-300 shadow-xs">
            <span className="text-forest-700 font-bold block mb-1">Stage 5</span>
            <strong className="text-sm font-bold text-forest-950 block">Review & E-File</strong>
            <span className="text-neutral-500 block mt-1">CPA verification & IRS transmission</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: STAGE 1 INTAKE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <UploadCloud className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">1. Intelligent Ingestion & Account Sync</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Upload PDFs, phone photos, or spreadsheets via TaxDrop. Ingest bank and card transactions via tokenized read-only APIs.
          </p>
        </div>
      </section>

      {/* SECTION 4: STAGE 2 OCR & EXTRACTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <FileText className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">2. Optical Character Recognition (OCR) & Transfer Netting</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            High-fidelity neural models parse numbers, Box codes, and employer EINs with SHA-256 hash anchoring. Internal account transfers are matched and netted to avoid false income counts.
          </p>
        </div>
      </section>

      {/* SECTION 5: STAGE 3 DETERMINISTIC RULE EXECUTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Sparkles className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">3. Zero-Hallucination Deterministic Calculation</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Tax math is never guessed by an LLM. Pure, hard-coded statutory formulas execute every calculation across the Internal Revenue Code and state revenue statutes (e.g. Cal. RTC, NY Tax Law).
          </p>
        </div>
      </section>

      {/* SECTION 6: STAGE 4 CROSS-DOMAIN RECONCILIATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <Layers className="w-8 h-8 text-lime-400" />
          <h3 className="text-xl font-bold text-white">4. Cross-Domain Ledger Reconciliation</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Balances sales tax collections against gross 1099-K sales, matches payroll compensation against general ledger wage lines, and aligns federal AGI with state modifications.
          </p>
        </div>
      </section>

      {/* SECTION 7: STAGE 5 ADVERSARIAL SELF-CHALLENGE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Scale className="w-8 h-8 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">5. Adversarial Self-Challenge & Audit Simulation</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Before presenting the return, our self-challenge agents test deduction claims against IRS audit standards. If documentary proof is incomplete, the system prompts the taxpayer for clarification.
          </p>
        </div>
      </section>

      {/* SECTION 8: PROVE THIS NUMBER BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Eye className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">6. Complete Lineage Inspection</h3>
          <p className="text-sm text-neutral-600">
            Click any form line to view the underlying math, source receipts, and binding legal citations.
          </p>
        </div>
      </section>

      {/* SECTION 9: REVIEW MODE SELECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <h3 className="text-base font-bold text-forest-950">7. Tailored Review Options</h3>
          <p className="text-neutral-700">
            Choose between self-directed AI Autopilot or professional CPA/EA verification before signing.
          </p>
        </div>
      </section>

      {/* SECTION 10: PROFESSIONAL SIGN-OFF */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">8. Certified PTIN Authorization</h3>
          <p className="text-sm text-neutral-600">
            When expert review is selected, a licensed CPA or EA signs off, attaching their credential to the audit trail.
          </p>
        </div>
      </section>

      {/* SECTION 11: E-FILE TRANSMISSION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-900 text-white border border-forest-800 max-w-4xl mx-auto space-y-3">
          <Send className="w-8 h-8 text-lime-400" />
          <h3 className="text-xl font-bold text-white">9. Modernized e-File (MeF) Transmission</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Packages your return into official IRS XML schemas, transmitting directly through federal and state e-file gateways with instant submission tracking.
          </p>
        </div>
      </section>

      {/* SECTION 12: POST-FILING MONITORING & CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-6 pt-4">
        <div className="max-w-2xl mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">10. Year-Round Monitoring & Audit Defense</h3>
          <p className="text-sm text-neutral-600">
            Your return remains archived in your permanent vault, with continuous tracking for IRS acceptance and refund updates.
          </p>
        </div>
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Start Filing Today</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
