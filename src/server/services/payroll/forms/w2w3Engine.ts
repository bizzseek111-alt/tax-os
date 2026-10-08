/**
 * Autonomous Tax OS — Deterministic W-2 and W-3 Engine
 * 
 * Generates and validates employee Form W-2 records and aggregated Form W-3:
 * - Boxes 1 through 6: Federal wages and tax withholdings
 * - Box 12: Statutory deferral codes (Code D for 401k, Code W for HSA)
 * - Box 13: Retirement plan checkbox
 * - Box 14: State disability (CA SDI, NY PFL, NJ FLI)
 * - Boxes 15-20: State and local wage & withholding schedules
 * - Form W-3 Transmittal compilation & parity checks against quarterly Forms 941
 */

import { W2CalculationResult, W3CalculationResult } from '../types';

export class W2W3Engine {
  /**
   * Generates a normalized W-2 record from an employee's annual payroll totals.
   */
  public static generateW2(params: {
    employeeId: string;
    taxYear: number;
    annualGrossWagesCents: bigint;
    annualFitTaxableWagesCents: bigint;
    annualFitWithheldCents: bigint;
    annualSsWagesCents: bigint;
    annualSsTaxWithheldCents: bigint;
    annualMedWagesCents: bigint;
    annualMedTaxWithheldCents: bigint;
    annual401kCents: bigint;
    annualHsaCents: bigint;
    stateWithholdings: { state: string; stateWagesCents: bigint; stateTaxCents: bigint }[];
    localWithholdings?: { locality: string; localWagesCents: bigint; localTaxCents: bigint }[];
    box14Items?: { label: string; amountCents: bigint }[];
  }): W2CalculationResult {
    const box12Codes: { code: string; amountCents: bigint }[] = [];

    // Code D: Elective deferrals to a section 401(k) cash or deferred arrangement
    if (params.annual401kCents > BigInt(0)) {
      box12Codes.push({ code: 'D', amountCents: params.annual401kCents });
    }

    // Code W: Employer contributions to a health savings account (HSA)
    if (params.annualHsaCents > BigInt(0)) {
      box12Codes.push({ code: 'W', amountCents: params.annualHsaCents });
    }

    const hasRetirementPlan = params.annual401kCents > BigInt(0);

    return {
      employeeId: params.employeeId,
      taxYear: params.taxYear,
      box1WagesCents: params.annualFitTaxableWagesCents,
      box2FitCents: params.annualFitWithheldCents,
      box3SsWagesCents: params.annualSsWagesCents,
      box4SsTaxCents: params.annualSsTaxWithheldCents,
      box5MedWagesCents: params.annualMedWagesCents,
      box6MedTaxCents: params.annualMedTaxWithheldCents,
      box7SsTipsCents: BigInt(0),
      box8AllocatedTipsCents: BigInt(0),
      box10DependentCare: BigInt(0),
      box11NonqualPlans: BigInt(0),
      box12Codes: box12Codes,
      box13StatutoryEmployee: false,
      box13RetirementPlan: hasRetirementPlan,
      box13ThirdPartySickPay: false,
      box14Other: params.box14Items || [],
      stateWithholdings: params.stateWithholdings,
      localWithholdings: params.localWithholdings || []
    };
  }

  /**
   * Compiles Form W-3 Transmittal of Wage and Tax Statements
   * and verifies parity against four quarters of Form 941 returns.
   */
  public static compileW3(params: {
    taxYear: number;
    w2Records: W2CalculationResult[];
    quarterly941Totals?: {
      q1toQ4Line2WagesCents: bigint;
      q1toQ4Line3FitCents: bigint;
      q1toQ4Line5aTaxableSsWagesCents: bigint;
      q1toQ4Line5aTaxCents: bigint;
      q1toQ4Line5cTaxableMedWagesCents: bigint;
      q1toQ4Line5cTaxCents: bigint;
    };
  }): W3CalculationResult {
    let box1TotalWagesCents = BigInt(0);
    let box2TotalFitCents = BigInt(0);
    let box3TotalSsWagesCents = BigInt(0);
    let box4TotalSsTaxCents = BigInt(0);
    let box5TotalMedWagesCents = BigInt(0);
    let box6TotalMedTaxCents = BigInt(0);

    for (const w2 of params.w2Records) {
      box1TotalWagesCents += w2.box1WagesCents;
      box2TotalFitCents += w2.box2FitCents;
      box3TotalSsWagesCents += w2.box3SsWagesCents;
      box4TotalSsTaxCents += w2.box4SsTaxCents;
      box5TotalMedWagesCents += w2.box5MedWagesCents;
      box6TotalMedTaxCents += w2.box6MedTaxCents;
    }

    const discrepancies: string[] = [];

    if (params.quarterly941Totals) {
      // Reconcile FIT Withholding: W-3 Box 2 must equal sum of 941 Line 3
      if (box2TotalFitCents !== params.quarterly941Totals.q1toQ4Line3FitCents) {
        discrepancies.push(
          `FIT_WITHHOLDING_MISMATCH: W-3 Box 2 ($${Number(box2TotalFitCents) / 100}) does not match 941 Line 3 total ($${Number(params.quarterly941Totals.q1toQ4Line3FitCents) / 100})`
        );
      }

      // Reconcile SS Wages: W-3 Box 3 must equal sum of 941 Line 5a
      if (box3TotalSsWagesCents !== params.quarterly941Totals.q1toQ4Line5aTaxableSsWagesCents) {
        discrepancies.push(
          `SS_WAGES_MISMATCH: W-3 Box 3 ($${Number(box3TotalSsWagesCents) / 100}) does not match 941 Line 5a taxable SS wages ($${Number(params.quarterly941Totals.q1toQ4Line5aTaxableSsWagesCents) / 100})`
        );
      }

      // Reconcile Medicare Wages: W-3 Box 5 must equal sum of 941 Line 5c
      if (box5TotalMedWagesCents !== params.quarterly941Totals.q1toQ4Line5cTaxableMedWagesCents) {
        discrepancies.push(
          `MEDICARE_WAGES_MISMATCH: W-3 Box 5 ($${Number(box5TotalMedWagesCents) / 100}) does not match 941 Line 5c taxable Medicare wages ($${Number(params.quarterly941Totals.q1toQ4Line5cTaxableMedWagesCents) / 100})`
        );
      }
    }

    return {
      taxYear: params.taxYear,
      totalW2Count: params.w2Records.length,
      box1TotalWagesCents,
      box2TotalFitCents,
      box3TotalSsWagesCents,
      box4TotalSsTaxCents,
      box5TotalMedWagesCents,
      box6TotalMedTaxCents,
      reconciliationStatus: discrepancies.length === 0 ? 'BALANCED' : 'DISCREPANCY',
      discrepancies
    };
  }
}
