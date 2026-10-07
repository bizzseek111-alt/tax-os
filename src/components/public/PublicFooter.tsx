import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface PublicFooterProps {
  onNavigate: (path: string) => void;
  onStartFiling: () => void;
}

export function PublicFooter({ onNavigate, onStartFiling }: PublicFooterProps) {
  return (
    <footer className="bg-forest-950 text-sage-200 border-t border-forest-900 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Pre-Footer Conversion Strip */}
        <div className="bg-forest-900/60 rounded-3xl p-8 mb-16 border border-forest-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Ready for tax filing without doing taxes?
            </h3>
            <p className="text-sm text-sage-300 mt-1 max-w-xl">
              Upload your documents and let TaxOS organize everything, calculate federal and state obligations, and ask only what it cannot safely determine.
            </p>
          </div>
          <button
            onClick={onStartFiling}
            className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-forest-950 font-extrabold text-sm transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Start My Taxes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5-Column Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-forest-900 text-xs">
          
          {/* Col 1: Filers */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Tax Filers</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/individuals')} className="hover:text-lime-400 transition">Individuals & W-2</button></li>
              <li><button onClick={() => onNavigate('/self-employed')} className="hover:text-lime-400 transition">Self-Employed & 1099</button></li>
              <li><button onClick={() => onNavigate('/business')} className="hover:text-lime-400 transition">Small Business & LLCs</button></li>
              <li><button onClick={() => onNavigate('/business/income-tax')} className="hover:text-lime-400 transition">Corporate Income Tax</button></li>
              <li><button onClick={() => onNavigate('/tax-professionals')} className="hover:text-lime-400 transition">Accounting Firms</button></li>
            </ul>
          </div>

          {/* Col 2: Compliance Domains */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Tax Domains</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/sales-tax')} className="hover:text-lime-400 transition">Sales & Use Tax</button></li>
              <li><button onClick={() => onNavigate('/payroll-tax')} className="hover:text-lime-400 transition">Payroll & Employment</button></li>
              <li><button onClick={() => onNavigate('/expert-review')} className="hover:text-lime-400 transition">Human Expert Review</button></li>
              <li><button onClick={() => onNavigate('/tax-twin')} className="hover:text-lime-400 transition">Tax Twin Simulation</button></li>
              <li><button onClick={() => onNavigate('/how-it-works')} className="hover:text-lime-400 transition">5-Stage Autonomous Engine</button></li>
            </ul>
          </div>

          {/* Col 3: Sovereign States */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Sovereign States</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/states')} className="hover:text-lime-400 transition">All States Overview</button></li>
              <li><button onClick={() => onNavigate('/states/california')} className="hover:text-lime-400 transition">California (FTB 540)</button></li>
              <li><button onClick={() => onNavigate('/states/new-york')} className="hover:text-lime-400 transition">New York (IT-201 / 203)</button></li>
              <li><button onClick={() => onNavigate('/states/new-jersey')} className="hover:text-lime-400 transition">New Jersey (NJ-1040)</button></li>
              <li><button onClick={() => onNavigate('/states/illinois')} className="hover:text-lime-400 transition">Illinois (IL-1040)</button></li>
              <li><button onClick={() => onNavigate('/states/massachusetts')} className="hover:text-lime-400 transition">Massachusetts (Form 1)</button></li>
            </ul>
          </div>

          {/* Col 4: Platform & Trust */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Trust & Pricing</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('/pricing')} className="hover:text-lime-400 transition">Transparent Pricing</button></li>
              <li><button onClick={() => onNavigate('/security')} className="hover:text-lime-400 transition">Security Architecture</button></li>
              <li><button onClick={() => onNavigate('/resources')} className="hover:text-lime-400 transition">2026 Tax Resources</button></li>
              <li><button onClick={() => onNavigate('/about')} className="hover:text-lime-400 transition">About Our Mission</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="hover:text-lime-400 transition">Contact & Support</button></li>
            </ul>
          </div>

          {/* Col 5: Security Badges & Info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Security & Standards</h4>
            <div className="space-y-2 text-[11px] text-sage-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-lime-400" />
                <span>IRS Pub 1075 Standards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-lime-400" />
                <span>AES-256 Client Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-lime-400" />
                <span>Zero AI Training on PII</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/signin')}
                className="w-full py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs transition border border-forest-700 text-center"
              >
                Sign In to Portal
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal Disclosures */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-sage-400">
          <div>
            <p>© 2026 TaxOS Technologies Inc. All rights reserved. Registered Electronic Return Originator (ERO).</p>
            <p className="mt-1 text-sage-500">
              Treasury Circular 230 & IRC § 7216 compliant. Tax advice rendered strictly by authorized CPAs and EAs when Human Verified mode is engaged.
            </p>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <button onClick={() => onNavigate('/security')} className="hover:text-white transition">Privacy Policy</button>
            <button onClick={() => onNavigate('/security')} className="hover:text-white transition">Terms of Service</button>
            <button onClick={() => onNavigate('/security')} className="hover:text-white transition">Security Disclosures</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
