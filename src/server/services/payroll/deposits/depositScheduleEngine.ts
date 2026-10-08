/**
 * Autonomous Tax OS — Deterministic Payroll Deposit Schedule Engine
 * 
 * Enforces authoritative IRS deposit regulations (IRC § 6302, Treas. Reg. § 31.6302-1):
 * - Lookback Period evaluation ($50,000 threshold between Monthly and Semi-Weekly)
 * - Monthly deposit schedule: Due on the 15th of the following calendar month
 * - Semi-Weekly deposit schedule: Wednesday/Friday rules based on payday
 * - Next-Day Deposit Rule ($100,000 Rule): Immediate next-day remittance if liability >= $100k
 * - FUTA Deposit Rule: Quarterly if cumulative liability > $500
 */

import { DepositFrequency, DepositStatus } from '../types';

export class DepositScheduleEngine {
  public static readonly MONTHLY_THRESHOLD_CENTS = BigInt(5000000); // $50,000 lookback liability
  public static readonly NEXT_DAY_THRESHOLD_CENTS = BigInt(10000000); // $100,000 single-day liability
  public static readonly FUTA_DEPOSIT_THRESHOLD_CENTS = BigInt(50000); // $500 quarterly liability

  /**
   * Determines employer deposit frequency based on statutory lookback period liability.
   */
  public static determineDepositFrequency(
    input: bigint | { lookbackLiabilityCents?: bigint; lookbackTotalTaxLiabilityCents?: bigint }
  ): DepositFrequency {
    const amount = typeof input === 'bigint' ? input : (input.lookbackTotalTaxLiabilityCents ?? input.lookbackLiabilityCents ?? BigInt(0));
    if (amount > this.MONTHLY_THRESHOLD_CENTS) {
      return DepositFrequency.SEMI_WEEKLY;
    }
    return DepositFrequency.MONTHLY;
  }

  /**
   * Computes due date for a given federal tax liability and pay date.
   */
  public static calculateFederalDepositDueDate(params: {
    payDate: Date;
    accumulatedLiabilityCents: bigint;
    frequency: DepositFrequency;
  }): {
    dueDate: Date;
    appliedFrequency: DepositFrequency;
    isNextDayRuleTriggered: boolean;
  } {
    const payDate = new Date(params.payDate);

    // 1. $100,000 Next-Day Deposit Rule check
    if (params.accumulatedLiabilityCents >= this.NEXT_DAY_THRESHOLD_CENTS) {
      const dueDate = new Date(payDate);
      dueDate.setDate(dueDate.getDate() + 1);
      // Adjust for weekends (if Saturday -> Monday, if Sunday -> Monday)
      if (dueDate.getDay() === 6) dueDate.setDate(dueDate.getDate() + 2);
      if (dueDate.getDay() === 0) dueDate.setDate(dueDate.getDate() + 1);

      return {
        dueDate,
        appliedFrequency: DepositFrequency.NEXT_DAY,
        isNextDayRuleTriggered: true
      };
    }

    // 2. Semi-Weekly Schedule
    if (params.frequency === DepositFrequency.SEMI_WEEKLY) {
      const dayOfWeek = payDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      const dueDate = new Date(payDate);

      if (dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5) {
        // Wed, Thu, Fri -> Due following Wednesday
        const daysUntilWed = (3 - dayOfWeek + 7) % 7 || 7;
        dueDate.setDate(dueDate.getDate() + daysUntilWed);
      } else {
        // Sat, Sun, Mon, Tue -> Due following Friday
        const daysUntilFri = (5 - dayOfWeek + 7) % 7 || 7;
        dueDate.setDate(dueDate.getDate() + daysUntilFri);
      }

      return {
        dueDate,
        appliedFrequency: DepositFrequency.SEMI_WEEKLY,
        isNextDayRuleTriggered: false
      };
    }

    // 3. Monthly Schedule: Due 15th of the following month
    const dueDate = new Date(payDate.getFullYear(), payDate.getMonth() + 1, 15);
    // If 15th falls on a weekend, push to next Monday
    if (dueDate.getDay() === 6) dueDate.setDate(dueDate.getDate() + 2);
    if (dueDate.getDay() === 0) dueDate.setDate(dueDate.getDate() + 1);

    return {
      dueDate,
      appliedFrequency: DepositFrequency.MONTHLY,
      isNextDayRuleTriggered: false
    };
  }

  /**
   * Computes due date for quarterly FUTA deposit ($500 threshold).
   */
  public static calculateFutaDepositDueDate(taxYear: number, quarter: number): Date {
    switch (quarter) {
      case 1:
        return new Date(taxYear, 3, 30); // April 30
      case 2:
        return new Date(taxYear, 6, 31); // July 31
      case 3:
        return new Date(taxYear, 9, 31); // October 31
      case 4:
      default:
        return new Date(taxYear + 1, 0, 31); // January 31 of following year
    }
  }

  /**
   * Evaluates statutory FUTA quarterly deposit requirement:
   * If cumulative undeposited FUTA liability >= $500, deposit is required by last day of month following quarter.
   * If < $500, liability carries over to next quarter.
   */
  public static evaluateFutaDepositRequirement(params: {
    quarter: number;
    accumulatedFutaLiabilityCents: bigint;
    year?: number;
  }): {
    isDepositRequired: boolean;
    dueDate?: Date;
    carriedOverCents: bigint;
  } {
    const isDepositRequired = params.accumulatedFutaLiabilityCents >= this.FUTA_DEPOSIT_THRESHOLD_CENTS;
    const year = params.year || new Date().getFullYear();
    const dueDate = isDepositRequired ? this.calculateFutaDepositDueDate(year, params.quarter) : undefined;
    const carriedOverCents = isDepositRequired ? BigInt(0) : params.accumulatedFutaLiabilityCents;

    return {
      isDepositRequired,
      dueDate,
      carriedOverCents
    };
  }
}
