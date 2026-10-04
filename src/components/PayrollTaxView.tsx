import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_WORKER_CLASSIFICATIONS, MOCK_FORM_941_Q1 } from '../services/MockData';
import { PayrollEngine } from '../services/PayrollEngine';
import { WorkerClassificationGuard } from '../services/WorkerClassificationGuard';
import { ReconciliationEngine } from '../services/ReconciliationEngine';
import { EntitlementsGuard } from '../services/EntitlementsGuard';
import { UserContext } from '../types/security';
import { 
  Users, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  FileCheck, 
  Scale, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface PayrollTaxViewProps {
  currentUser: UserContext;
}

export const PayrollTaxView: React.FC<PayrollTaxViewProps> = ({ currentUser }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('cont-01');
  const [calcGrossWages, setCalcGrossWages] = useState<number>(8500);
  const [calcYtdWages, setCalcYtdWages] = useState<number>(195000); // Exceeds both SS cap and near Add'l Medicare

  // Permission flags
  const canViewPii = EntitlementsGuard.hasPermission(currentUser, 'payroll:read_pii');
  const canViewCompensation = EntitlementsGuard.hasPermission(currentUser, 'payroll:read_compensation');

  // Calculation for simulator
  const simWithholding = PayrollEngine.calculateEmployeeWithholding({
    grossWages: calcGrossWages,
    ytdGrossWages: calcYtdWages,
    preTaxDeductions: [
      { deductionType: 'TRADITIONAL_401K', amount: 500, isFicaExempt: false, isFederalIncomeTaxExempt: true },
      { deductionType: 'SECTION_125_HEALTH', amount: 250, isFicaExempt: true, isFederalIncomeTaxExempt: true }
    ],
    filingStatus: 'SINGLE_OR_SEPARATE',
    stateCode: 'CA',
    extraWithholding: 0
  });

  const simEmployerTax = PayrollEngine.calculateEmployerTaxes({
    grossWages: calcGrossWages,
    ytdGrossWages: calcYtdWages,
    sutaRate: 0.027,
    stateWageBase: 7000
  });

  // Worker Classification Analysis
  const classificationRecord = MOCK_WORKER_CLASSIFICATIONS[0];
  const auditResult = WorkerClassificationGuard.analyzeWorker(classificationRecord);

  // Reconciliation summary
  const reconciliation = ReconciliationEngine.reconcilePayroll({
    taxYear: 2027,
    providerWagesYTD: 1280000,
    quarterly941TotalWages: 1280000,
    w3Box1Wages: 1280000,
    glPayrollExpense: 1412000,
    bankPayrollDisbursements: 1412000
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Payroll & Employment Tax Workstation</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FOUNDATION STAGE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Federal/State payroll withholding, IRC § 6302 deposit schedules, Form 941/W-2 reconciliation & AI-assisted worker classification safeguards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Payroll Provider Interface:</span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            PayrollDataProvider (Gusto / ADP / Rippling Adapter)
          </span>
        </div>
      </div>

      {/* RBAC ISOLATION NOTICE BANNER */}
      {!canViewPii || !canViewCompensation ? (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-300">Security Segmentation Active: Restricted Payroll PII</div>
            <p className="text-slate-300 mt-0.5">
              Current role <strong className="text-white">{currentUser.role}</strong> does not possess full payroll clearance. 
              Employee Social Security Numbers and individual base salary rates are strictly masked to protect employee privacy. 
              Only aggregate wage expense totals needed for income tax deduction returns are exposed.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>Authorized Payroll Clearance: Full compensation & SSN unmasked for <strong>{currentUser.role}</strong></span>
          </div>
          <span className="font-mono text-emerald-400">ABAC Policy: payroll:admin</span>
        </div>
      )}

      {/* SECTION 1: DEPOSIT SCHEDULE & FORM 941 COCKPIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Deposit Schedule Monitor */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Federal Deposit Schedule Monitor
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800 font-bold">
                SEMI-WEEKLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Determined pursuant to IRC § 6302 lookback period. 4-quarter lookback liability exceeded $50,000.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Lookback Period Liability:</span>
                <span className="font-mono font-bold text-white">$142,500 (&gt; $50k threshold)</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Current Deposit Schedule:</span>
                <span className="font-semibold text-emerald-400">Semi-Weekly (Wed / Fri rule)</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">One-Day $100,000 Rule:</span>
                <span className="text-slate-200">Not Triggered (Max daily: $24,240)</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Next Deposit Due Date:</span>
                <span className="text-amber-400 font-bold">Wednesday, April 7, 2027</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            IRC Rule Citation: Treas. Reg. § 31.6302-1(b)
          </div>
        </div>

        {/* Form 941 Quarterly Status */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Form 941 (Q1 2027 Return)</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  DRAFT APPROVED
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">IRS Form 941</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 mb-4 text-xs">
              <div>
                <div className="text-[11px] text-slate-400">Covered Employees</div>
                <div className="text-base font-bold text-white mt-0.5">{MOCK_FORM_941_Q1.numberOfEmployees}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Box 2 Gross Wages</div>
                <div className="text-base font-bold text-white mt-0.5">${MOCK_FORM_941_Q1.wagesTipsOtherCompensation.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Box 10 Total Taxes</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">${MOCK_FORM_941_Q1.totalTaxesBeforeAdjustments.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Balance Due</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">$0.00 (Paid)</div>
              </div>
            </div>

            {/* Professional Reviewer Signoff */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Professional Review Signoff
                </span>
                <span className="text-emerald-400 font-medium">Rachel Green, EA</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {MOCK_FORM_941_Q1.filing.professionalReview?.findings[0]}
              </p>
              <div className="mt-2 text-[11px] text-amber-400 font-medium">
                Recommendation: {MOCK_FORM_941_Q1.filing.professionalReview?.recommendations[0]}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800">
            <span className="text-slate-400">Electronic Filing Deadline: <strong className="text-white">April 30, 2027</strong></span>
            <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition text-xs">
              Prepare Form 941 e-File Package
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 2: WORKER CLASSIFICATION SAFEGUARD SCANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-bold text-white">AI Worker Classification Safeguard Engine</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                AUDIT RISK DETECTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI evaluates facts and highlights inconsistencies without casually declaring a legal verdict. Disputed issues trigger mandatory CPA/Attorney escalation.
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            Status: {classificationRecord.escalationStatus}
          </span>
        </div>

        {/* Safeguard Legal Notice Banner */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3.5 mb-5 text-xs text-slate-300">
          <strong className="text-red-400 block mb-1">LEGAL AND COMPLIANCE SAFEGUARD:</strong>
          {auditResult.legalDisclaimer}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Worker Profile & Facts */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Worker Name:</span>
              <span className="font-bold text-white">{classificationRecord.workerName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Current Tax Designation:</span>
              <span className="font-mono text-amber-400 font-bold">1099-NEC Independent Contractor</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Behavioral Instructions Level:</span>
              <span className="text-red-400 font-semibold">{classificationRecord.facts.behavioralControl.instructionsGivenLevel} (Employee Indicator)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Core Business Integration:</span>
              <span className="text-red-400 font-semibold">Yes (Fails California ABC Test Prong B)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Open Market Availability:</span>
              <span className="text-red-400 font-semibold">Restricted (Non-Compete active)</span>
            </div>

            <div className="pt-2 text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Applicable Statutory Authorities:</span>
              <ul className="list-disc list-inside text-[11px] space-y-0.5">
                {auditResult.applicableAuthorities.map((auth, i) => (
                  <li key={i}>{auth}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Fact Inconsistencies & CPA Escalation */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Inconsistencies Identified by AI Fact Engine:
              </div>

              <div className="space-y-2 mb-4">
                {auditResult.inconsistenciesIdentified.map((issue, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-slate-300 text-[11px] flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>

              {/* CPA Escalation Findings */}
              {classificationRecord.review && (
                <div className="bg-slate-900 border border-purple-900/40 rounded-xl p-3.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-purple-300">CPA Review Assessment:</span>
                    <span className="text-purple-400 font-medium">{classificationRecord.review.reviewerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p>• {classificationRecord.review.findings[0]}</p>
                    <p>• {classificationRecord.review.findings[1]}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-purple-950 text-[11px] text-amber-300">
                    <strong>Action Required:</strong> {classificationRecord.review.recommendations[0]}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition text-xs">
                Export Audit Dossier
              </button>
              <button className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 rounded-lg font-medium transition text-xs">
                Escalate to Tax Attorney
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: EMPLOYEE COMPENSATION & WITHHOLDING ENGINE (WITH RBAC MASKING) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Employee Roster with RBAC Masking */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Employee Roster & PII Isolation
              </h3>
              <p className="text-xs text-slate-400">
                Notice how SSNs and salaries are masked if viewing as Income Tax Preparer.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{MOCK_EMPLOYEES.length} Active Records</span>
          </div>

          <div className="space-y-3">
            {MOCK_EMPLOYEES.map((emp) => {
              const maskedSSN = EntitlementsGuard.maskSSN(emp.ssnMasked, currentUser);
              const maskedComp = EntitlementsGuard.maskCompensation(emp.compensation.baseRate, currentUser);

              return (
                <div key={emp.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{emp.firstName} {emp.lastName}</span>
                      <span className="text-slate-500">({emp.employeeNumber})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                      Work: {emp.workLocationState}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                    <div>
                      <span>SSN: </span>
                      <span className="text-slate-200">{maskedSSN}</span>
                    </div>
                    <div>
                      <span>Compensation: </span>
                      <span className={canViewCompensation ? "text-emerald-400 font-bold" : "text-amber-400 font-medium"}>
                        {maskedComp}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    W-4 Status: {emp.w4Status.filingStatus} • Frequency: {emp.compensation.payFrequency}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Payroll Calculation & FICA Simulator */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Live Payroll Withholding & Tax Match Simulator
              </h3>
              <span className="text-xs font-mono text-sky-400">2027 IRS Tables</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Current Gross Paycheck ($)</label>
                <input
                  type="number"
                  value={calcGrossWages}
                  onChange={(e) => setCalcGrossWages(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Prior YTD Wages ($)</label>
                <input
                  type="number"
                  value={calcYtdWages}
                  onChange={(e) => setCalcYtdWages(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500">SS Cap: $168,600 | Add'l Med: $200k</span>
              </div>
            </div>

            {/* Withholding Breakdown */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Federal Income Tax Withholding:</span>
                <span className="text-white">${simWithholding.withholding.federalIncomeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Social Security Employee (6.2%):</span>
                <span className="text-white">${simWithholding.withholding.socialSecurityEmployee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Medicare Employee (1.45%):</span>
                <span className="text-white">${simWithholding.withholding.medicareEmployee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Additional Medicare (0.9% &gt; $200k):</span>
                <span className="text-amber-400">${simWithholding.withholding.additionalMedicareEmployee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>California State Withholding (~6%):</span>
                <span className="text-white">${simWithholding.withholding.stateIncomeTax.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-slate-200">Total Employee Withholding:</span>
                <span className="text-sky-400">${simWithholding.withholding.totalEmployeeWithholdings.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-slate-200">Employer Taxes Match:</span>
                <span className="text-emerald-400">${simEmployerTax.totalEmployerTax.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            Citations: {simWithholding.provenance.citations.join(' • ')}
          </div>
        </div>

      </div>

      {/* SECTION 4: PAYROLL RECONCILIATION SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Annual Payroll Reconciliation (W-2 vs Form 941 vs General Ledger)
            </h3>
            <p className="text-xs text-slate-400">
              Cross-verifying: Payroll wages → 4 quarterly Form 941 returns → Annual Form W-3 totals → General Ledger.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            Reconciled: $0.00 Variance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4 text-xs font-mono">
          <div>
            <div className="text-slate-400">Gusto / ADP Total Wages</div>
            <div className="text-base font-bold text-white mt-0.5">${reconciliation.payrollProviderReportedWages.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">Sum of 4 x Form 941 (Box 2)</div>
            <div className="text-base font-bold text-white mt-0.5">${reconciliation.sumOfQuarterly941Wages.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">Form W-3 Annual Box 1</div>
            <div className="text-base font-bold text-white mt-0.5">${reconciliation.annualW3Box1Wages.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-slate-400">GL Net Payroll Expense</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">${reconciliation.generalLedgerPayrollExpense.toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300">
          {reconciliation.reconciliationAuditNotes.map((note, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
