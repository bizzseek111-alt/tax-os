import React, { useState } from 'react';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Building2, 
  Receipt, 
  Users, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

interface PublicHeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onStartFiling: () => void;
  onSignIn: () => void;
}

export function PublicHeader({
  currentPath,
  onNavigate,
  onStartFiling,
  onSignIn
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setBusinessDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAF9]/90 backdrop-blur-md border-b border-sage-300/80 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-forest-900 text-lime-400 flex items-center justify-center font-extrabold text-lg shadow-xs group-hover:scale-105 transition-transform">
            T
          </div>
          <div>
            <span className="font-extrabold text-forest-950 text-xl tracking-tight block">TaxOS</span>
            <span className="text-[11px] font-semibold text-forest-700 tracking-wide uppercase block -mt-1">
              Autonomous Tax Operating System
            </span>
          </div>
        </div>

        {/* Desktop Primary Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-neutral-700">
          <button
            onClick={() => handleNav('/individuals')}
            className={`hover:text-forest-900 transition ${currentPath === '/individuals' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            Individuals
          </button>

          <button
            onClick={() => handleNav('/self-employed')}
            className={`hover:text-forest-900 transition ${currentPath === '/self-employed' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            Self-Employed
          </button>

          {/* Businesses with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setBusinessDropdownOpen(true)}
            onMouseLeave={() => setBusinessDropdownOpen(false)}
          >
            <button
              onClick={() => handleNav('/business')}
              className={`flex items-center gap-1 hover:text-forest-900 transition py-2 ${
                currentPath.startsWith('/business') || currentPath === '/sales-tax' || currentPath === '/payroll-tax'
                  ? 'text-forest-900 font-extrabold' 
                  : ''
              }`}
            >
              <span>Businesses</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${businessDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Dropdown Menu */}
            {businessDropdownOpen && (
              <div className="absolute top-full -left-4 w-72 bg-white rounded-2xl shadow-xl border border-sage-200 p-2.5 transition-all animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => handleNav('/business/income-tax')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sage-50 transition flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pine-50 text-forest-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-forest-900 group-hover:text-lime-400 transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 text-xs block">Business Income Tax</span>
                    <span className="text-[11px] text-neutral-500 block">Form 1120, 1120-S, 1065 & K-1s</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('/sales-tax')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sage-50 transition flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pine-50 text-forest-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-forest-900 group-hover:text-lime-400 transition-colors">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 text-xs block">Sales Tax</span>
                    <span className="text-[11px] text-neutral-500 block">Wayfair nexus, taxability & filing</span>
                  </div>
                </button>

                <button
                  onClick={() => handleNav('/payroll-tax')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sage-50 transition flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pine-50 text-forest-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-forest-900 group-hover:text-lime-400 transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 text-xs block">Payroll Tax</span>
                    <span className="text-[11px] text-neutral-500 block">Form 941, state withholding & W-2s</span>
                  </div>
                </button>

                <div className="border-t border-sage-200 mt-1 pt-1.5">
                  <button
                    onClick={() => handleNav('/business')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-sage-50 transition flex items-center justify-between text-xs font-bold text-forest-700 hover:text-forest-950"
                  >
                    <span>Full Business Tax OS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('/tax-professionals')}
            className={`hover:text-forest-900 transition ${currentPath === '/tax-professionals' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            Tax Professionals
          </button>

          <button
            onClick={() => handleNav('/how-it-works')}
            className={`hover:text-forest-900 transition ${currentPath === '/how-it-works' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            How It Works
          </button>

          <button
            onClick={() => handleNav('/pricing')}
            className={`hover:text-forest-900 transition ${currentPath === '/pricing' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            Pricing
          </button>

          <button
            onClick={() => handleNav('/resources')}
            className={`hover:text-forest-900 transition ${currentPath === '/resources' ? 'text-forest-900 font-extrabold' : ''}`}
          >
            Resources
          </button>
        </nav>

        {/* Desktop CTA Group */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={onSignIn}
            className="text-sm font-bold text-neutral-700 hover:text-forest-900 px-3 py-2 transition"
          >
            Sign In
          </button>

          <button
            onClick={onStartFiling}
            className="px-5 py-2.5 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>Start My Taxes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            onClick={onStartFiling}
            className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-lime-400 font-bold text-xs"
          >
            Start
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-sage-200 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-sage-300 px-6 py-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 text-base font-bold text-neutral-800">
            <button onClick={() => handleNav('/individuals')} className="text-left py-1 hover:text-forest-700">Individuals</button>
            <button onClick={() => handleNav('/self-employed')} className="text-left py-1 hover:text-forest-700">Self-Employed</button>
            <button onClick={() => handleNav('/business')} className="text-left py-1 hover:text-forest-700">Business Command Center</button>
            <button onClick={() => handleNav('/business/income-tax')} className="text-left py-1 pl-4 text-sm text-neutral-600 hover:text-forest-700">• Corporate Income Tax</button>
            <button onClick={() => handleNav('/sales-tax')} className="text-left py-1 pl-4 text-sm text-neutral-600 hover:text-forest-700">• Sales Tax</button>
            <button onClick={() => handleNav('/payroll-tax')} className="text-left py-1 pl-4 text-sm text-neutral-600 hover:text-forest-700">• Payroll Tax</button>
            <button onClick={() => handleNav('/tax-professionals')} className="text-left py-1 hover:text-forest-700">Tax Professionals</button>
            <button onClick={() => handleNav('/expert-review')} className="text-left py-1 hover:text-forest-700">Expert Human Review</button>
            <button onClick={() => handleNav('/how-it-works')} className="text-left py-1 hover:text-forest-700">How It Works</button>
            <button onClick={() => handleNav('/tax-twin')} className="text-left py-1 hover:text-forest-700">Tax Twin (Simulation)</button>
            <button onClick={() => handleNav('/states')} className="text-left py-1 hover:text-forest-700">Sovereign States</button>
            <button onClick={() => handleNav('/pricing')} className="text-left py-1 hover:text-forest-700">Pricing</button>
            <button onClick={() => handleNav('/security')} className="text-left py-1 hover:text-forest-700">Security & Privacy</button>
            <button onClick={() => handleNav('/resources')} className="text-left py-1 hover:text-forest-700">2026 Tax Resources</button>
            <button onClick={() => handleNav('/about')} className="text-left py-1 hover:text-forest-700">About TaxOS</button>
            <button onClick={() => handleNav('/contact')} className="text-left py-1 hover:text-forest-700">Contact</button>
          </div>

          <div className="pt-4 border-t border-sage-200 flex flex-col gap-3">
            <button
              onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
              className="w-full py-2.5 rounded-xl border border-sage-300 font-bold text-neutral-800 text-sm hover:bg-sage-50 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onStartFiling(); }}
              className="w-full py-3 rounded-xl bg-forest-900 text-lime-400 font-extrabold text-sm shadow-md"
            >
              Start My Taxes
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
