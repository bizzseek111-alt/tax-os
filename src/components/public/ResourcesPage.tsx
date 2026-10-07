import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Calendar, 
  FileText, 
  DollarSign, 
  Scale, 
  CheckCircle2 
} from 'lucide-react';

interface ResourcesPageProps {
  onStartFiling: () => void;
  onNavigate: (path: string) => void;
}

export function ResourcesPage({ onStartFiling, onNavigate }: ResourcesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const statutoryReferences = [
    { code: '26 U.S.C. § 1', title: 'Tax Imposed', summary: 'Federal graduated income tax brackets for individuals and estates.' },
    { code: '26 U.S.C. § 61', title: 'Gross Income Defined', summary: 'All income from whatever source derived unless specifically excluded by law.' },
    { code: '26 U.S.C. § 62', title: 'Adjusted Gross Income', summary: 'Defines above-the-line deductions subtracting from gross income to establish AGI.' },
    { code: '26 U.S.C. § 162', title: 'Trade or Business Expenses', summary: 'Deductions for ordinary and necessary expenses incurred in carrying on a business.' },
    { code: '26 U.S.C. § 179', title: 'Election to Expense Assets', summary: 'First-year write-off for qualifying tangible business personal property.' },
    { code: '26 U.S.C. § 199A', title: 'Qualified Business Income', summary: '20% deduction on qualified business income for pass-through entities.' },
    { code: '26 U.S.C. § 274(n)', title: 'Meal Expense Limitation', summary: 'Mandatory 50% statutory disallowance on trade or business meals.' },
    { code: '26 U.S.C. § 280A', title: 'Home Office Deduction', summary: 'Strict exclusive and regular business use test for dwelling unit write-offs.' },
    { code: 'Cal. RTC § 17215.4', title: 'California HSA Add-Back', summary: 'Mandatory add-back of federal HSA deductions to California taxable income.' },
    { code: '20 NYCRR § 131.18', title: 'NY Convenience Rule', summary: 'Sourcing remote telecommuting wages to New York unless employer-mandated.' }
  ];

  const filteredReferences = statutoryReferences.filter(
    r => r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
         r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-24 py-6">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-forest-900/10 border border-forest-900/20 text-forest-900 text-xs font-bold inline-block mb-6">
          Official Tax Knowledge Base
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-forest-950 tracking-tight max-w-4xl mx-auto leading-tight">
          2026 U.S. Tax Law & Inflation Parameters
        </h1>
        <p className="text-lg text-neutral-700 max-w-3xl mx-auto mt-6 font-normal">
          IRS inflation adjustments, standard deduction schedules, statutory rate tables, and codified tax law citations.
        </p>
      </section>

      {/* SECTION 2: 2026 STANDARD DEDUCTION SCHEDULES */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-extrabold text-forest-950">2026 Federal Standard Deduction Thresholds</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-sage-50 border border-sage-200">
              <span className="text-neutral-500 block">Single Filers</span>
              <strong className="text-xl font-bold text-forest-950 block mt-1">$15,750</strong>
              <span className="text-[11px] text-neutral-600 block mt-0.5">+$750 over 2025</span>
            </div>
            <div className="p-4 rounded-xl bg-sage-50 border border-sage-200">
              <span className="text-neutral-500 block">Married Filing Jointly</span>
              <strong className="text-xl font-bold text-forest-950 block mt-1">$31,500</strong>
              <span className="text-[11px] text-neutral-600 block mt-0.5">+$1,500 over 2025</span>
            </div>
            <div className="p-4 rounded-xl bg-sage-50 border border-sage-200">
              <span className="text-neutral-500 block">Head of Household</span>
              <strong className="text-xl font-bold text-forest-950 block mt-1">$23,625</strong>
              <span className="text-[11px] text-neutral-600 block mt-0.5">+$1,125 over 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 2026 FEDERAL TAX BRACKETS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-300 shadow-xs max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-extrabold text-forest-950">2026 Marginal Ordinary Income Tax Brackets</h2>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-sage-200 font-bold text-forest-950">
                  <th className="py-2.5">Tax Rate</th>
                  <th className="py-2.5">Single Filers</th>
                  <th className="py-2.5">Married Filing Jointly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                <tr><td className="py-2 font-bold text-forest-700">10%</td><td>$0 to $11,925</td><td>$0 to $23,850</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">12%</td><td>$11,926 to $48,475</td><td>$23,851 to $96,950</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">22%</td><td>$48,476 to $103,350</td><td>$96,951 to $206,700</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">24%</td><td>$103,351 to $197,300</td><td>$206,701 to $394,600</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">32%</td><td>$197,301 to $250,525</td><td>$394,601 to $501,050</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">35%</td><td>$250,526 to $626,350</td><td>$501,051 to $751,600</td></tr>
                <tr><td className="py-2 font-bold text-forest-700">37%</td><td>Over $626,350</td><td>Over $751,600</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 4: STATUTORY CITATION DIRECTORY */}
      <section className="max-w-4xl mx-auto px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-forest-950">Statutory Tax Law Citations</h2>
            <p className="text-xs text-neutral-600 mt-1">Search authoritative tax codes referenced by our deterministic engine.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search code or statute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-sage-300 text-xs text-forest-950 focus:outline-forest-700"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredReferences.map((ref, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-sage-200 text-xs space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-forest-900">{ref.code}</span>
                <span className="text-neutral-500 font-normal">{ref.title}</span>
              </div>
              <p className="text-neutral-600">{ref.summary}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: 2026 FILING DEADLINE CALENDAR */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-sage-100 rounded-3xl p-8 border border-sage-300 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-forest-700" />
            <h3 className="text-xl font-bold text-forest-950">2027 Filing Season Deadlines</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-sage-200">
              <strong className="font-bold text-forest-950 block">March 15, 2027</strong>
              <p className="text-neutral-600 mt-1">S-Corporations (Form 1120-S) & Partnerships (Form 1065) annual returns.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-sage-200">
              <strong className="font-bold text-forest-950 block">April 15, 2027</strong>
              <p className="text-neutral-600 mt-1">Individuals (Form 1040), C-Corps (Form 1120), and Q1 2027 estimated tax payments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: RETIREMENT & HSA CONTRIBUTION LIMITS */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 border border-sage-300 shadow-xs space-y-4">
          <h3 className="text-xl font-bold text-forest-950">2026 Retirement & HSA Contribution Caps</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-sage-50 rounded-xl">
              <span className="text-neutral-500 block">401(k) / 403(b)</span>
              <strong className="font-bold text-forest-950 text-base">$23,500</strong>
            </div>
            <div className="p-3 bg-sage-50 rounded-xl">
              <span className="text-neutral-500 block">Traditional / Roth IRA</span>
              <strong className="font-bold text-forest-950 text-base">$7,000</strong>
            </div>
            <div className="p-3 bg-sage-50 rounded-xl">
              <span className="text-neutral-500 block">HSA (Self-Only)</span>
              <strong className="font-bold text-forest-950 text-base">$4,300</strong>
            </div>
            <div className="p-3 bg-sage-50 rounded-xl">
              <span className="text-neutral-500 block">HSA (Family)</span>
              <strong className="font-bold text-forest-950 text-base">$8,550</strong>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: DOWNLOADABLE TAX GUIDES */}
      <section className="max-w-4xl mx-auto px-6 text-center space-y-3">
        <FileText className="w-10 h-10 text-forest-700 mx-auto" />
        <h3 className="text-xl font-bold text-forest-950">Free Comprehensive 2026 Tax Reference PDF</h3>
        <p className="text-xs text-neutral-600 max-w-md mx-auto">
          Download our complete 48-page statutory reference manual covering multi-state nexus, deduction checklists, and depreciation tables.
        </p>
      </section>

      {/* SECTION 8: CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center pt-8">
        <button
          onClick={onStartFiling}
          className="px-10 py-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-lime-400 font-extrabold text-base transition-all shadow-xl inline-flex items-center gap-2"
        >
          <span>Calculate Your 2026 Return</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
}
