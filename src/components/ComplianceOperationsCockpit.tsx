import React, { useState } from 'react';
import { TaxDeadlinesEngine } from '../services/TaxDeadlinesEngine';
import { TaxRegistrationsEngine } from '../services/TaxRegistrationsEngine';
import { TaxPaymentsEngine } from '../services/TaxPaymentsEngine';
import { EmployerComplianceEngine } from '../services/EmployerComplianceEngine';
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Briefcase,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const ComplianceOperationsCockpit: React.FC = () => {
  const [subTab, setSubTab] = useState<'DEADLINES' | 'REGISTRATIONS' | 'PAYMENTS' | 'EMPLOYER'>('DEADLINES');

  // Engines Data
  const deadlines = TaxDeadlinesEngine.generate2027Calendar('2027-04-04');
  const registrations = TaxRegistrationsEngine.getBusinessRegistrations();
  const employer = EmployerComplianceEngine.getEmployerComplianceProfile();
  const business = EmployerComplianceEngine.getBusinessTaxComplianceProfile();

  // Sample remittance for NACHA TXP demonstration
  const sampleRemittance = TaxPaymentsEngine.createPaymentRemittance({
    id: 'remit-sample-01',
    domain: 'PAYROLL_TAX',
    periodId: 'period-2027-q1',
    jurisdictionId: 'US-FED',
    jurisdictionName: 'United States Federal',
    agencyName: 'Internal Revenue Service (EFTPS)',
    paymentType: 'TAX_DEPOSIT',
    paymentMethod: 'FEDERAL_EFTPS',
    amount: 24240,
    requiredLiability: 24240,
    routingNumber: '121000358',
    accountNumber: '891048201',
    ein: '884928172',
    taxTypeCode: '94101',
    periodEndDate: '2027-03-31',
    scheduledInitiationDate: '2027-04-06',
    statutoryDeadlineDate: '2027-04-07'
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Compliance Operations & Remittances</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OPERATIONAL CORE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statutory tax deadlines (IRC § 7503), multi-state registrations, NACHA TXP electronic payments & employer onboarding compliance.
          </p>
        </div>

        {/* Operational Sub-Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('DEADLINES')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'DEADLINES' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tax Deadlines ({deadlines.length})
          </button>
          <button
            onClick={() => setSubTab('REGISTRATIONS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'REGISTRATIONS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setSubTab('PAYMENTS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'PAYMENTS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Payments & EFTPS
          </button>
          <button
            onClick={() => setSubTab('EMPLOYER')}
            className={`px-3 py-1.5 rounded-lg transition ${
              subTab === 'EMPLOYER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Employer Compliance
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: TAX DEADLINES CALENDAR */}
      {/* ============================================================== */}
      {subTab === 'DEADLINES' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Statutory Tax Deadlines Calendar (IRC § 7503 Compliant)
                </h3>
                <p className="text-xs text-slate-400">
                  Dynamic statutory tracking. Weekend/legal holiday due dates are automatically rolled to the next business day pursuant to IRC § 7503.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                Current Date: April 4, 2027
              </span>
            </div>

            <div className="space-y-3">
              {deadlines.map((dl) => {
                const isUrgent = dl.daysRemaining <= 5;
                const isMedium = dl.daysRemaining <= 15;

                return (
                  <div key={dl.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          dl.domain === 'INCOME_TAX' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          dl.domain === 'SALES_USE_TAX' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {dl.domain.replace('_', ' ')}
                        </span>
                        <span className="font-bold text-white text-sm">{dl.title}</span>
                      </div>
                      <div className="text-slate-400 flex flex-wrap items-center gap-2 text-[11px]">
                        <span>Authority: <strong className="text-slate-300">{dl.authorityName}</strong></span>
                        <span>•</span>
                        <span>Citation: <code className="text-slate-300 font-mono">{dl.statutoryCitation}</code></span>
                        {dl.isWeekendOrHolidayRolled && (
                          <span className="text-amber-400 font-medium">
                            (Rolled from {dl.statutoryDueDate} via IRC § 7503)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {dl.estimatedAmountDue !== undefined && (
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px]">Estimated Due</span>
                          <span className="font-mono text-white font-bold">${dl.estimatedAmountDue.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="text-right min-w-[120px]">
                        <span className="text-slate-500 block text-[10px]">Effective Due Date</span>
                        <span className="font-bold text-white block">{dl.effectiveDueDate}</span>
                        <span className={`text-[11px] font-semibold ${
                          isUrgent ? 'text-red-400' : isMedium ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {dl.daysRemaining === 0 ? 'Due Today' : `${dl.daysRemaining} days remaining`}
                        </span>
                      </div>

                      {dl.canBeExtended && (
                        <button className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition">
                          File Extension
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: TAX REGISTRATIONS MANAGER */}
      {/* ============================================================== */}
      {subTab === 'REGISTRATIONS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  State Tax Registrations & Permits Lifecycle
                </h3>
                <p className="text-xs text-slate-400">
                  Unified registry managing Sales Tax Permits, State Withholding Accounts, State Unemployment (SUTA) Accounts & Foreign Qualifications.
                </p>
              </div>
              <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition">
                + Register New State
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {registrations.map((reg) => (
                <div key={reg.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-black font-mono text-xs bg-slate-800 text-white">
                          {reg.stateCode}
                        </span>
                        <span className="font-bold text-white text-sm">{reg.registrationType.replace(/_/g, ' ')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        reg.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {reg.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px] mb-3">
                      <div>Agency: <strong className="text-slate-300">{reg.agencyName}</strong></div>
                      <div>Account / Permit: <code className="text-white font-mono">{reg.accountNumberMasked}</code></div>
                      <div>Effective Date: <span className="text-slate-300">{reg.effectiveDate}</span></div>
                      <div>Frequency: <span className="text-slate-300 font-semibold">{reg.filingFrequency}</span></div>
                      {reg.notes && (
                        <div className="mt-1 text-slate-400 italic">Note: {reg.notes}</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
                    <a href={reg.portalLoginUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
                      <span>Agency Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-500">ID: {reg.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: PAYMENTS & EFTPS REMITTANCES */}
      {/* ============================================================== */}
      {subTab === 'PAYMENTS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Tax Payments & Electronic Remittance Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Federal EFTPS batch transmission, State ACH payments, and standardized NACHA CCD+ TXP banking records.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                Safe Harbor: Active
              </span>
            </div>

            {/* Live Remittance Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">Federal Payroll Deposit (EFTPS)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      AUTHORIZED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Agency: {sampleRemittance.agencyName} • Method: {sampleRemittance.paymentMethod}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Remittance Amount</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ${sampleRemittance.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Safe Harbor Verification Box */}
              <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-lg p-3 text-xs text-emerald-300">
                <div className="font-bold mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Treas. Reg. § 31.6302-1(f) Safe Harbor Compliance:
                </div>
                <div>{sampleRemittance.safeHarborRuleDescription}</div>
              </div>

              {/* NACHA CCD+ TXP Banking Addenda Record */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 text-xs font-mono">
                <div className="text-slate-400 font-bold mb-1 flex items-center justify-between">
                  <span>// NACHA CCD+ TXP Banking Addenda Record:</span>
                  <span className="text-[10px] text-slate-500 font-sans">Bank Standard ACH Credit</span>
                </div>
                <div className="text-sky-300 bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto">
                  {sampleRemittance.nachaTxpRecord?.formattedAddendaRecord}
                </div>
                <div className="text-slate-400 text-[11px] mt-2 font-sans space-y-0.5">
                  <div>Routing: <strong className="text-slate-300">{sampleRemittance.nachaTxpRecord?.routingNumber}</strong> (Federal Reserve)</div>
                  <div>Account: <strong className="text-slate-300">{sampleRemittance.nachaTxpRecord?.accountNumberMasked}</strong></div>
                  <div>Trace / Batch: <code className="text-emerald-400 font-mono">{sampleRemittance.confirmationTraceNumber}</code> • <code className="text-emerald-400 font-mono">{sampleRemittance.eftpsBatchNumber}</code></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition">
                  Download NACHA File (.ach)
                </button>
                <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition">
                  Transmit to EFTPS Gateway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: EMPLOYER & BUSINESS COMPLIANCE */}
      {/* ============================================================== */}
      {subTab === 'EMPLOYER' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              Employer Onboarding & Business Entity Compliance
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Audits employee/contractor tax documentation, workers' compensation insurance, and statutory business entity compliance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Onboarding Documentation Audit */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Worker Documentation Onboarding Audit</span>
                  <span className="text-emerald-400 text-xs font-bold">100% Compliant</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">IRS Form W-4 (Employees):</span>
                    <span className="text-emerald-400 font-bold">18 of 18 on file (100%)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">State Allowance Certs (CA DE-4 / NY IT-2104):</span>
                    <span className="text-emerald-400 font-bold">18 of 18 on file (100%)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Form W-9 (Independent Contractors):</span>
                    <span className="text-emerald-400 font-bold">4 of 4 on file (100%)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Form I-9 Employment Verification:</span>
                    <span className="text-emerald-400 font-bold">E-Verify Completed</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  ✓ Mandatory labor law workplace posters verified current across California and New York remote worker locations.
                </div>
              </div>

              {/* Business Entity Compliance (Franchise Tax, FinCEN BOIR) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Business Entity & Franchise Tax Compliance</span>
                  <span className="text-sky-400 text-xs font-bold">In Good Standing</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Delaware Franchise Tax Method:</span>
                    <span className="text-white font-semibold">Assumed Par Value Capital Method</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Next Delaware Annual Report:</span>
                    <span className="text-slate-200">March 1, 2028 (Estimated: $450)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Foreign Qualifications (SOS):</span>
                    <span className="text-emerald-400 font-bold">CA (Good Standing) • NY (Good Standing)</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">FinCEN BOIR (Corporate Transparency Act):</span>
                    <span className="text-emerald-400 font-bold">Initial Report Filed (ID: US-8910482)</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  Workers' Compensation Coverage: Active with The Hartford (CA) & Travelers (NY).
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
