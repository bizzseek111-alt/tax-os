import React from 'react';
import { 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Calendar, 
  DollarSign, 
  Lock, 
  AlertTriangle, 
  Check, 
  Scale, 
  Server 
} from 'lucide-react';

interface PayrollTaxPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function PayrollTaxPage({ onStartFiling, onNavigate }: PayrollTaxPageProps) {
  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Federal Form 941/940 & Multi-State Employment Tax
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-5xl mx-auto leading-tight">
          Autonomous payroll tax and employer compliance.
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          From federal withholding reconciliations to state unemployment (SUI) schedules, year-end W-2/W-3 generation, and worker classification protection.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onStartFiling}
            className="px-8 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-lg flex items-center gap-2"
          >
            <span>Audit Payroll Compliance</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* SECTION 2: PAYROLL PROVIDER INTEGRATIONS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="font-bold text-sm text-forest-950">Gusto & Rippling</span>
            <p className="text-neutral-600">Direct API sync for employee runs, wage allocations, and tax liability remittances.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="font-bold text-sm text-forest-950">ADP Workforce Now</span>
            <p className="text-neutral-600">Automated journal entry mapping and quarterly tax deposit ledger reconciliation.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="font-bold text-sm text-forest-950">Paychex & QuickBooks</span>
            <p className="text-neutral-600">Two-way synchronization of gross wages, employer payroll taxes, and worker 1099 payments.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs space-y-2">
            <span className="font-bold text-sm text-forest-950">Custom Payroll CSVs</span>
            <p className="text-neutral-600">Universal CSV parser with automated column mapping for custom PEO and payroll platforms.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEDERAL PAYROLL TAXES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">FICA & Federal Withholding</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight mt-2">
              Every federal tax component balanced.
            </h2>
            <p className="text-sm text-neutral-700 mt-3 leading-relaxed">
              TaxOS verifies Social Security tax (6.2% employer + 6.2% employee up to the 2026 wage base), Medicare tax (1.45% + 0.9% additional Medicare over $200k), and employee federal income tax withholding.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-2">
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Gross Taxable Payroll:</span>
              <span className="font-bold text-forest-950">$680,000.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Employer FICA Share (6.2%):</span>
              <span className="font-bold text-forest-700">$42,160.00</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sage-200 font-semibold">
              <span>Employer Medicare Share (1.45%):</span>
              <span className="font-bold text-forest-700">$9,860.00</span>
            </div>
            <div className="flex justify-between py-1.5 font-bold text-forest-900">
              <span>Total Federal Remittance Verified:</span>
              <span>$52,020.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: STATE WITHHOLDING */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">Multi-State Withholding Tables</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Remote employees working across state lines? TaxOS maintains up-to-date state withholding tax formulas across all 50 states and municipal entities (such as NYC local taxes and California SDI).
          </p>
        </div>
      </section>

      {/* SECTION 5: STATE UNEMPLOYMENT (SUI) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-forest-950">State Unemployment Insurance (SUI) Tracking</h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Tracks individual company experience rates and applies state-specific wage caps (e.g., California $7,000, New York $12,800, Illinois $13,590) to prevent overpayment of quarterly state unemployment taxes.
          </p>
        </div>
      </section>

      {/* SECTION 6: DEPOSIT SCHEDULES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 rounded-3xl bg-forest-950 text-white border border-forest-900 max-w-4xl mx-auto space-y-3">
          <Calendar className="w-6 h-6 text-lime-400" />
          <h3 className="text-xl font-bold text-white">EFTPS Deposit Schedule Management</h3>
          <p className="text-sm text-sage-200 leading-relaxed">
            Monitors lookback period tax liabilities to determine whether your business is required to remit on a Monthly or Semi-Weekly deposit schedule, preventing costly failure-to-deposit penalties under IRC § 6656.
          </p>
        </div>
      </section>

      {/* SECTION 7: FORM 941 QUARTERLY FILING */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <FileText className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Automated Form 941 Preparation</h3>
          <p className="text-sm text-neutral-600">
            Prepares Employer's Quarterly Federal Tax Return with automated Schedule B liability day allocation, ready for electronic transmission to the IRS.
          </p>
        </div>
      </section>

      {/* SECTION 8: FORM 940 ANNUAL FUTA */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <Layers className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Form 940 Federal Unemployment Return</h3>
          <p className="text-sm text-neutral-600">
            Calculates annual FUTA liabilities, factoring in the maximum 5.4% state credit reduction against the 6.0% gross federal rate.
          </p>
        </div>
      </section>

      {/* SECTION 9: YEAR-END W-2 & W-3 */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <CheckCircle2 className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Year-End W-2 & W-3 Electronic Filing</h3>
          <p className="text-sm text-neutral-600">
            Generates compliant employee wage statements, handles electronic SSA e-filing, and securely delivers digital W-2 PDFs to your team.
          </p>
        </div>
      </section>

      {/* SECTION 10: PAYROLL RECONCILIATION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-sage-50 rounded-3xl p-8 border border-sage-300 max-w-4xl mx-auto space-y-3 text-xs">
          <strong className="text-sm font-bold text-forest-950 block">General Ledger vs. Form 941 Reconciliation</strong>
          <p className="text-neutral-700">
            TaxOS cross-references accounting ledger payroll expense lines with cumulative 941 returns to eliminate discrepancies before corporate income tax filing.
          </p>
        </div>
      </section>

      {/* SECTION 11: WORKER CLASSIFICATION RISK */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">Worker Classification Risk Guard</h3>
          </div>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Misclassifying employees as 1099 independent contractors is one of the highest audit liabilities facing growing businesses. TaxOS audits worker profiles against the IRS 20-Factor Common Law test and California AB 5 ABC standard.
          </p>
        </div>
      </section>

      {/* SECTION 12: EMPLOYEE PII PROTECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <Lock className="w-4 h-4 text-forest-700" />
            <span>Strict Role-Based Wage & PII Segregation</span>
          </div>
          <p>
            Zero-trust architecture isolates employee Social Security numbers, banking details, and individual salaries. Corporate income tax accountants see only aggregate wage lines necessary for Form 1120-S deductions.
          </p>
        </div>
      </section>

      {/* SECTION 13: HUMAN PAYROLL REVIEWER */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-3">
          <ShieldCheck className="w-10 h-10 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-bold text-forest-950">Certified Payroll Specialist Review</h3>
          <p className="text-sm text-neutral-600">
            Every quarterly 941 filing is verified by a certified payroll compliance specialist prior to submission.
          </p>
        </div>
      </section>

      {/* SECTION 14: TAX NOTICE MANAGEMENT */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-6 rounded-2xl bg-white border border-sage-300 shadow-xs max-w-4xl mx-auto text-xs text-neutral-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-forest-950 text-sm">
            <AlertTriangle className="w-4 h-4 text-forest-700" />
            <span>Automated SUI Rate Change & Notice Intake</span>
          </div>
          <p>
            State revenue departments frequently update employer unemployment experience rates via mail notices. TaxOS parses these notices and updates payroll withholding calculations instantly.
          </p>
        </div>
      </section>

      {/* SECTION 15: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Automate Payroll Compliance</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
