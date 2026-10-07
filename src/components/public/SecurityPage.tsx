import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Key, 
  Layers, 
  FileText, 
  Server, 
  EyeOff, 
  AlertOctagon, 
  Check 
} from 'lucide-react';

interface SecurityPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function SecurityPage({ onStartFiling, onNavigate }: SecurityPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Enterprise Security & Privacy Architecture
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Enterprise security engineered for America's most sensitive data.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          We protect your tax returns, financial statements, and employee records with bank-grade encryption, zero-trust RBAC, and strict regulatory isolation.
        </p>
      </section>

      {/* SECTION 2: SECURITY PRINCIPLES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Lock className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Zero-Trust Perimeter</h3>
            <p className="text-neutral-600">Every internal request, database query, and worker process must authenticate and verify authorization tokens.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <Key className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Least-Privilege Access</h3>
            <p className="text-neutral-600">Preparers and agents receive only the exact slice of data required to complete the immediate compliance task.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-forest-700" />
            <h3 className="font-bold text-sm text-forest-950">Immutable Audit Trails</h3>
            <p className="text-neutral-600">Every data mutation, view event, and tax calculation is logged to an immutable SHA-256 cryptographic DAG.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: SOC 2 TYPE II COMPLIANCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">SOC 2 Type II Certified Controls</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            TaxOS undergoes continuous independent third-party audits evaluating our security, availability, processing integrity, confidentiality, and privacy controls across all cloud infrastructure.
          </p>
        </div>
      </section>

      {/* SECTION 4: IRS PUBLICATION 1075 */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <ShieldCheck className="w-8 h-8 text-lime-400" />
          <h3 className="text-xl font-bold text-white">IRS Publication 1075 Alignment</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Federal Tax Information (FTI) is handled under strict safeguards mandated by IRS Publication 1075, including hardware security module (HSM) encryption and isolated multi-tenant database partitions.
          </p>
        </div>
      </section>

      {/* SECTION 5: END-TO-END ENCRYPTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <Lock className="w-6 h-6 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">AES-256 at Rest & TLS 1.3 in Transit</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            All documents, receipts, and tax filings are encrypted with AES-256 Galois/Counter Mode (GCM). All communication between your browser and our servers requires modern TLS 1.3 with Perfect Forward Secrecy.
          </p>
        </div>
      </section>

      {/* SECTION 6: ZERO LLM TRAINING ON PII */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <EyeOff className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Strict Zero-Training Guarantee</h3>
          <p className="text-sm text-neutral-600">
            We will never sell your personal data. We will never use your tax filings, financial transactions, or documents to train public or third-party artificial intelligence models.
          </p>
        </div>
      </section>

      {/* SECTION 7: CRYPTOGRAPHIC AUDIT DAG */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <Layers className="w-6 h-6 text-forest-700" />
          <h3 className="text-xl font-bold text-forest-950">Cryptographic SHA-256 Provenance DAG</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Every calculation node is cryptographically signed. If any data record is altered after generation, the ledger hash chain breaks instantly, alerting platform administrators to unauthorized tampering.
          </p>
        </div>
      </section>

      {/* SECTION 8: TOKENIZED CONNECTIONS */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Server className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Tokenized Read-Only Financial Access</h3>
          <p className="text-sm text-neutral-600">
            Bank account connections are routed through Plaid and Finicity using temporary tokenized keys. TaxOS never sees or stores your online banking passwords.
          </p>
        </div>
      </section>

      {/* SECTION 9: RBAC & ABAC CONTROL */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-sage-50 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <h3 className="text-base font-bold text-forest-950">Role-Based Domain Segregation</h3>
          <p className="text-neutral-700 leading-relaxed">
            Income tax accountants are blocked from viewing confidential employee compensation and home addresses. Sales tax specialists see only transaction amounts and state tax codes.
          </p>
        </div>
      </section>

      {/* SECTION 10: VULNERABILITY MANAGEMENT */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <AlertOctagon className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Continuous Penetration Testing & Bug Bounty</h3>
          <p className="text-sm text-neutral-600">
            Our codebase undergoes routine penetration testing by external cybersecurity firms, supported by a 24/7 monitored vulnerability disclosure program.
          </p>
        </div>
      </section>

      {/* SECTION 11: REGULATORY COMPLIANCE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs max-w-4xl mx-auto text-center space-y-3">
          <h3 className="text-xl font-bold text-forest-950">GLBA, CCPA & Treasury Circular 230</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Full compliance with the Gramm-Leach-Bliley Act (GLBA) Financial Privacy Rule, the California Consumer Privacy Act (CCPA), and IRC § 7216 tax return disclosure rules.
          </p>
        </div>
      </section>

      {/* SECTION 12: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Start Secure Filing</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
