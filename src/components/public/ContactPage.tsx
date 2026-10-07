import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2 
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (path: string) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Client Support & Enterprise Solutions
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          How can our tax operations team assist you?
        </h1>
        <p className="text-lg text-neutral-700 max-w-2xl mx-auto mt-6 font-normal">
          Whether you have an inquiry about an active filing, need custom enterprise sales assistance, or want to partner your CPA firm with TaxOS.
        </p>
      </section>

      {/* SECTION 2: SUPPORT TRIAGE ROUTING & CONTACT FORM */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-forest-700 mx-auto" />
              <h3 className="text-2xl font-bold text-forest-950">Inquiry Dispatched Successfully</h3>
              <p className="text-xs text-neutral-600">Our regulatory support team will respond within 2 business hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-forest-950 block mb-1">Your Full Name</label>
                  <input required type="text" placeholder="Alex Rivera" className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-neutral-800" />
                </div>
                <div>
                  <label className="font-bold text-forest-950 block mb-1">Work Email</label>
                  <input required type="email" placeholder="alex@company.com" className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-neutral-800" />
                </div>
              </div>

              <div>
                <label className="font-bold text-forest-950 block mb-1">Inquiry Category</label>
                <select className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-neutral-800 font-medium">
                  <option>Individual Tax Filing Support</option>
                  <option>Small Business & LLC Multi-Domain Tax</option>
                  <option>CPA / Accounting Firm Partnership</option>
                  <option>Enterprise Sales & API Licensing</option>
                  <option>Responsible Security Disclosure</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-forest-950 block mb-1">Message Details</label>
                <textarea required rows={4} placeholder="Please describe how our team can help..." className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-neutral-800" />
              </div>

              <button type="submit" className="w-full py-4 rounded-2xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-md hover:bg-forest-950 transition flex items-center justify-center gap-2">
                <span>Send Message to Tax Operations</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* SECTION 3: ENTERPRISE SALES ASSISTANCE */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-sage-100 border border-sage-300 space-y-3 text-xs">
          <strong className="text-sm font-bold text-forest-950 block">Dedicated Enterprise Account Directors</strong>
          <p className="text-neutral-700 leading-relaxed">
            For companies with over $10M in annual revenue, multi-tier partnership entities, or high-volume marketplace facilitator operations, our enterprise sales team provides custom volume billing and dedicated CPA onboarding managers.
          </p>
        </div>
      </section>

      {/* SECTION 4: RESPONSIBLE SECURITY DISCLOSURE */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 space-y-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime-400" />
            <h3 className="text-base font-bold text-white">Responsible Security Vulnerability Disclosure</h3>
          </div>
          <p className="text-sage-200 leading-relaxed">
            Security researchers can report findings directly to our security operations center at <span className="font-mono text-lime-400">security@taxos.com</span>. We provide PGP encryption keys and respect standard safe harbor vulnerability disclosures.
          </p>
        </div>
      </section>

      {/* SECTION 5: HEADQUARTERS & JURISDICTION */}
      <section className="max-w-4xl mx-auto px-6 text-center text-xs space-y-2">
        <MapPin className="w-6 h-6 text-forest-700 mx-auto" />
        <h3 className="font-bold text-forest-950 text-sm">TaxOS Technologies Inc.</h3>
        <p className="text-neutral-600">548 Market Street, Suite 89201 • San Francisco, CA 94104</p>
      </section>

      {/* SECTION 6: SLA COMMITMENTS */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs flex items-center justify-between text-xs text-neutral-700">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-forest-700" />
            <span>Guaranteed 2-Hour Response Time for Active Tax Return Inquiries</span>
          </div>
          <span className="font-bold text-forest-900">24/7 Season Coverage</span>
        </div>
      </section>

    </div>
  );
}
