import React, { useState } from 'react';
import { 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  User, 
  Scale, 
  BarChart3, 
  ShieldAlert 
} from 'lucide-react';

interface SignInPageProps {
  onSignIn: (targetRole?: string) => void;
  onNavigate: (path: string) => void;
}

export function SignInPage({ onSignIn, onNavigate }: SignInPageProps) {
  const [selectedRole, setSelectedRole] = useState<string>('TAXPAYER');
  const [email, setEmail] = useState('alex@rivera-consulting.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(selectedRole);
  };

  return (
    <div className="py-12 px-6 max-w-xl mx-auto space-y-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-900 text-lime-400 flex items-center justify-center font-extrabold text-xl mx-auto shadow-md">
          T
        </div>
        <h1 className="text-3xl font-extrabold text-forest-950 tracking-tight">
          Sign In to TaxOS
        </h1>
        <p className="text-xs text-neutral-600">
          Enter your credentials to access your secure tax portal
        </p>
      </div>

      {/* Role Destination Selector */}
      <div className="bg-white rounded-3xl p-6 border border-sage-300 shadow-sm space-y-6">
        <div>
          <label className="text-xs font-bold text-forest-950 block mb-2">Select Your Portal / Role</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setSelectedRole('TAXPAYER'); setEmail('alex@rivera-consulting.com'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'TAXPAYER'
                  ? 'bg-forest-900 text-lime-400 border-forest-900'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Taxpayer (Individual)</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('BUSINESS'); setEmail('founder@apex-dynamics.com'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'BUSINESS'
                  ? 'bg-forest-900 text-lime-400 border-forest-900'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Business Owner</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('CPA'); setEmail('sarah.chen@partnercpa.com'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'CPA'
                  ? 'bg-forest-900 text-lime-400 border-forest-900'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>CPA / Enrolled Agent</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('ATTORNEY'); setEmail('legal.counsel@taxlaw.com'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'ATTORNEY'
                  ? 'bg-purple-900 text-purple-200 border-purple-900'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>Tax Attorney (Privilege)</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('OPS'); setEmail('ops.manager@taxos.internal'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'OPS'
                  ? 'bg-amber-800 text-amber-200 border-amber-800'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Operations Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('ADMIN'); setEmail('root.admin@taxos.internal'); }}
              className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                selectedRole === 'ADMIN'
                  ? 'bg-slate-900 text-rose-300 border-slate-900'
                  : 'bg-sage-50 text-neutral-700 border-sage-200 hover:bg-sage-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-forest-950 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-forest-950 font-medium"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-forest-950">Password</label>
              <a href="#reset" className="text-forest-700 hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-sage-300 bg-sage-50 text-forest-950"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Authorize & Enter Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-neutral-500 text-xs">Don't have an account yet? </span>
          <button
            onClick={() => onNavigate('/start')}
            className="text-forest-700 font-bold text-xs hover:underline"
          >
            Start My Taxes
          </button>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-sage-100 border border-sage-300 text-center text-[11px] text-neutral-600 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4 text-forest-700 shrink-0" />
        <span>Hardware-backed Multi-Factor Authentication (MFA) & TLS 1.3 enforced.</span>
      </div>

    </div>
  );
}
