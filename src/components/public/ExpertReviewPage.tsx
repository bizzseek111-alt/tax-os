import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Scale, 
  Layers, 
  FileCheck, 
  MessageSquare, 
  Check, 
  Lock 
} from 'lucide-react';

interface ExpertReviewPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function ExpertReviewPage({ onStartFiling, onNavigate }: ExpertReviewPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Human-in-the-Loop Architecture
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          The perfect balance of artificial intelligence and licensed human expertise.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          AI does the heavy lifting of document extraction and arithmetic. Certified CPAs, Enrolled Agents, and Tax Attorneys provide the human judgment, exception review, and final sign-off.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Start with Expert Review</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: WHY HUMAN REVIEW MATTERS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold text-forest-950">Why Human Review Matters in Taxation</h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Tax law is not merely math—it is statutory interpretation. Distinguishing between a deductible business meal vs. personal entertainment, or interpreting the "convenience of the employer" rule for a remote worker requires real-world legal context that only licensed human practitioners can provide.
          </p>
        </div>
      </section>

      {/* SECTION 3: THE THREE FILING TIERS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">AI Autopilot</h3>
            <p className="text-neutral-600 mt-2">100% autonomous software preparation for straightforward returns. You review the plain-English summary and authorize filing.</p>
          </div>
          <div className="p-6 rounded-2xl bg-forest-950 text-white border border-forest-900">
            <h3 className="font-bold text-sm text-lime-400">Human Verified</h3>
            <p className="text-sage-300 mt-2">TaxOS prepares the return, and an authorized CPA or EA reviews flagged exceptions and signs off before transmission.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300">
            <h3 className="font-bold text-sm text-forest-950">Full Professional Service</h3>
            <p className="text-neutral-600 mt-2">A dedicated tax partner owns the entire preparation and advisory process for complex corporate groups.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CPA & EA CREDENTIALS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Verified Licenses & Active PTINs</h3>
          <p className="text-sm text-neutral-600">
            Every TaxOS reviewer holds an active state CPA license or federal Enrolled Agent authorization under U.S. Treasury Circular 230.
          </p>
        </div>
      </section>

      {/* SECTION 5: TAX ATTORNEY ESCALATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-900 text-white border border-forest-800 max-w-4xl mx-auto space-y-3">
          <Scale className="w-6 h-6 text-lime-400" />
          <h3 className="text-xl font-bold text-white">IRC § 7525 Confidentiality Privilege</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            When complex worker misclassification or penalty exposure arises, cases are escalated to licensed tax attorneys with statutory confidentiality protections.
          </p>
        </div>
      </section>

      {/* SECTION 6: THE REVIEW PROTOCOL */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <h3 className="text-base font-bold text-forest-950">Our 5-Step Professional Review Protocol</h3>
          <p className="text-neutral-700 leading-relaxed">
            1. Validate source document OCR extractions • 2. Inspect Schedule C deduction substantiation • 3. Verify state statutory conformity • 4. Audit prior-year variances • 5. Execute digital signature on Form 8879.
          </p>
        </div>
      </section>

      {/* SECTION 7: EVIDENCE LINEAGE INSPECTION */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Layers className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Line-by-Line Evidence Inspection</h3>
          <p className="text-sm text-neutral-600">
            Reviewers don't guess. They drill straight from form lines into the underlying receipt images and transaction hashes.
          </p>
        </div>
      </section>

      {/* SECTION 8: INTERACTIVE CLIENT MESSAGING */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <MessageSquare className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Direct In-App Question Cards</h3>
          <p className="text-sm text-neutral-600">
            If your reviewer needs clarification, they push a question straight to your dashboard. Answer in seconds from your phone.
          </p>
        </div>
      </section>

      {/* SECTION 9: ACCURACY & SATISFACTION GUARANTEE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3 text-center">
          <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-xl font-bold text-forest-950">100% Calculation & Accuracy Guarantee</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            If an error occurs due to our calculation engine, TaxOS reimburses any IRS or state penalty and interest charges up to $10,000.
          </p>
        </div>
      </section>

      {/* SECTION 10: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Choose Human Verified Review</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
