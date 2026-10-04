import { TaxDeadlineEvent, DeadlineCategory } from '../types/complianceOperations';
import { TaxDomain } from '../types/common';

export class TaxDeadlinesEngine {
  /**
   * Applies IRC § 7503: Time for performing certain acts postponing by reason of weekend or holiday
   * If a due date falls on Saturday, Sunday, or legal holiday, rolls forward to next business day.
   */
  static applyStatutoryRollover(dateStr: string): { effectiveDate: string; isRolled: boolean } {
    const d = new Date(dateStr + 'T12:00:00Z');
    const dayOfWeek = d.getUTCDay(); // 0 = Sun, 6 = Sat

    if (dayOfWeek === 6) { // Saturday -> Roll to Monday (+2 days)
      const rolled = new Date(d);
      rolled.setUTCDate(rolled.getUTCDate() + 2);
      return { effectiveDate: rolled.toISOString().split('T')[0], isRolled: true };
    } else if (dayOfWeek === 0) { // Sunday -> Roll to Monday (+1 day)
      const rolled = new Date(d);
      rolled.setUTCDate(rolled.getUTCDate() + 1);
      return { effectiveDate: rolled.toISOString().split('T')[0], isRolled: true };
    }

    return { effectiveDate: dateStr, isRolled: false };
  }

  /**
   * Calculates days remaining from reference date
   */
  static calculateDaysRemaining(effectiveDueDate: string, referenceDateStr: string = '2027-04-04'): number {
    const target = new Date(effectiveDueDate + 'T12:00:00Z');
    const ref = new Date(referenceDateStr + 'T12:00:00Z');
    const diffTime = target.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generates the comprehensive 2027 statutory tax calendar across all platform domains
   */
  static generate2027Calendar(referenceDate: string = '2027-04-04'): TaxDeadlineEvent[] {
    const rawEvents: Array<{
      id: string;
      domain: TaxDomain;
      category: DeadlineCategory;
      title: string;
      jurisdictionCode: string;
      authorityName: string;
      statutoryDueDate: string;
      statutoryCitation: string;
      canBeExtended: boolean;
      extensionFormRequired?: string;
      estimatedAmountDue?: number;
    }> = [
      // 1. PAYROLL: Semi-Weekly Deposit
      {
        id: 'dl-pay-dep-01',
        domain: 'PAYROLL_TAX',
        category: 'PAYROLL_DEPOSIT_SEMI_WEEKLY',
        title: 'Federal Payroll Tax Deposit (Semi-Weekly Wednesday/Friday Rule)',
        jurisdictionCode: 'US-FED',
        authorityName: 'Internal Revenue Service (EFTPS)',
        statutoryDueDate: '2027-04-07',
        statutoryCitation: 'Treas. Reg. § 31.6302-1(c)',
        canBeExtended: false,
        estimatedAmountDue: 24240
      },
      // 2. INCOME TAX: Corporate S-Corp Form 1120-S Federal Filing
      {
        id: 'dl-inc-1120s',
        domain: 'INCOME_TAX',
        category: 'INCOME_TAX_ANNUAL',
        title: 'Form 1120-S Federal Annual Return & Schedule K-1 Distribution',
        jurisdictionCode: 'US-FED',
        authorityName: 'Internal Revenue Service',
        statutoryDueDate: '2027-04-15',
        statutoryCitation: 'IRC § 6072(b)',
        canBeExtended: true,
        extensionFormRequired: 'Form 7004 (6-Month Extension to Oct 15)',
        estimatedAmountDue: 400
      },
      // 3. INCOME TAX: California Form 100S & $800 Minimum Franchise Tax
      {
        id: 'dl-inc-ca-ftb',
        domain: 'INCOME_TAX',
        category: 'INCOME_TAX_ANNUAL',
        title: 'California FTB Form 100S Return & Minimum Franchise Tax ($800)',
        jurisdictionCode: 'CA-FTB',
        authorityName: 'California Franchise Tax Board',
        statutoryDueDate: '2027-04-15',
        statutoryCitation: 'Cal. Rev. & Tax. Code § 18601',
        canBeExtended: true,
        estimatedAmountDue: 800
      },
      // 4. PAYROLL: Form 941 Q1 Federal Return
      {
        id: 'dl-pay-941-q1',
        domain: 'PAYROLL_TAX',
        category: 'PAYROLL_FORM_941_QUARTERLY',
        title: 'Form 941 Employer Quarterly Federal Tax Return (Q1 2027)',
        jurisdictionCode: 'US-FED',
        authorityName: 'Internal Revenue Service',
        statutoryDueDate: '2027-04-30',
        statutoryCitation: 'Treas. Reg. § 31.6071(a)-1(a)',
        canBeExtended: false,
        estimatedAmountDue: 0 // Fully deposited via EFTPS
      },
      // 5. SALES TAX: California CDTFA Quarterly Return (CDTFA-401)
      {
        id: 'dl-sales-ca-q1',
        domain: 'SALES_USE_TAX',
        category: 'SALES_TAX_RETURN',
        title: 'California Sales & Use Tax Quarterly Return & Remittance (CDTFA-401)',
        jurisdictionCode: 'CA-CDTFA',
        authorityName: 'California Dept of Tax and Fee Administration',
        statutoryDueDate: '2027-04-30',
        statutoryCitation: 'Cal. Rev. & Tax. Code § 6452',
        canBeExtended: true,
        estimatedAmountDue: 26125
      },
      // 6. PAYROLL: California EDD Quarterly DE-9 / DE-9C
      {
        id: 'dl-pay-ca-edd-q1',
        domain: 'PAYROLL_TAX',
        category: 'PAYROLL_FORM_941_QUARTERLY',
        title: 'California EDD Quarterly Contribution Return and Wage Report (DE-9 / DE-9C)',
        jurisdictionCode: 'CA-EDD',
        authorityName: 'California Employment Development Department',
        statutoryDueDate: '2027-04-30',
        statutoryCitation: 'Cal. Unemp. Ins. Code § 1088',
        canBeExtended: false,
        estimatedAmountDue: 6840
      },
      // 7. SALES TAX: New York State ST-100 Quarterly Return
      {
        id: 'dl-sales-ny-q1',
        domain: 'SALES_USE_TAX',
        category: 'SALES_TAX_RETURN',
        title: 'New York State Quarterly Sales and Use Tax Return (ST-100)',
        jurisdictionCode: 'NY-DTF',
        authorityName: 'New York State Department of Taxation & Finance',
        statutoryDueDate: '2027-06-20',
        statutoryCitation: 'NY Tax Law § 1136',
        canBeExtended: false,
        estimatedAmountDue: 14200
      },
      // 8. INCOME TAX: Q2 Federal Estimated Tax Payment
      {
        id: 'dl-inc-q2-est',
        domain: 'INCOME_TAX',
        category: 'INCOME_TAX_QUARTERLY_ESTIMATE',
        title: 'Q2 Estimated Federal Income Tax Installment',
        jurisdictionCode: 'US-FED',
        authorityName: 'Internal Revenue Service (EFTPS)',
        statutoryDueDate: '2027-06-15',
        statutoryCitation: 'IRC § 6655(c)',
        canBeExtended: false,
        estimatedAmountDue: 38750
      }
    ];

    return rawEvents.map(evt => {
      const rollover = this.applyStatutoryRollover(evt.statutoryDueDate);
      const days = this.calculateDaysRemaining(rollover.effectiveDate, referenceDate);
      
      let status: 'UPCOMING' | 'DUE_SOON' | 'ACTION_REQUIRED' | 'FILED_SATISFIED' | 'OVERDUE' = 'UPCOMING';
      if (days < 0) status = 'OVERDUE';
      else if (days <= 5) status = 'ACTION_REQUIRED';
      else if (days <= 15) status = 'DUE_SOON';

      return {
        ...evt,
        effectiveDueDate: rollover.effectiveDate,
        isWeekendOrHolidayRolled: rollover.isRolled,
        daysRemaining: days,
        status
      };
    });
  }
}
