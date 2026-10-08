/**
 * Autonomous Tax OS — Vehicle & Mileage Expense Agent
 * 
 * Evaluates business vehicle deductions under IRC § 162 and strict substantiation
 * under IRC § 274(d). Compares standard mileage rate ($0.67/mile in 2024) vs actual vehicle expenses.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface VehicleMileageInput {
  taxYear: number;
  totalMiles: number;
  businessMiles: number;
  commutingMiles?: number;
  personalMiles?: number;
  hasWrittenLog: boolean;
  actualExpenses?: {
    gasAndOil: number;
    repairs: number;
    insurance: number;
    leaseOrDepreciation: number;
  };
}

export interface VehicleMileageResult {
  qualifies: boolean;
  standardRatePerMile: number;
  businessMiles: number;
  businessPercentage: number;
  standardMileageDeduction: number;
  actualExpensesDeduction?: number;
  recommendedMethod: 'STANDARD_MILEAGE' | 'ACTUAL_EXPENSES';
  calculatedDeduction: number;
  statutoryBasis: string;
  substantiationWarning?: string;
  recommendedPositionId?: string;
}

export class VehicleMileageAgent extends BaseAgent<VehicleMileageInput, VehicleMileageResult> {
  public readonly agentType = AgentType.VEHICLE_MILEAGE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: VehicleMileageInput
  ): Promise<AgentResult<VehicleMileageResult>> {
    const standardRate = input.taxYear === 2024 ? 0.67 : 0.655;
    const totalMiles = Math.max(input.totalMiles, input.businessMiles);
    const businessMiles = Math.max(0, input.businessMiles);
    const businessPercentage = totalMiles > 0 ? (businessMiles / totalMiles) * 100 : 0;

    const standardDeduction = Math.round(businessMiles * standardRate * 100) / 100;

    let actualDeduction = 0;
    if (input.actualExpenses) {
      const totalActual =
        (input.actualExpenses.gasAndOil || 0) +
        (input.actualExpenses.repairs || 0) +
        (input.actualExpenses.insurance || 0) +
        (input.actualExpenses.leaseOrDepreciation || 0);
      actualDeduction = Math.round(totalActual * (businessPercentage / 100) * 100) / 100;
    }

    const recommendedMethod: 'STANDARD_MILEAGE' | 'ACTUAL_EXPENSES' =
      actualDeduction > standardDeduction ? 'ACTUAL_EXPENSES' : 'STANDARD_MILEAGE';

    const deduction = recommendedMethod === 'ACTUAL_EXPENSES' ? actualDeduction : standardDeduction;

    let substantiationWarning: string | undefined;
    if (!input.hasWrittenLog) {
      substantiationWarning =
        'IRC § 274(d) requires adequate records or sufficient corroborating evidence (contemporaneous mileage log). Without a log, deduction is subject to disallowance upon audit.';
    }

    // Persist tax fact
    await this.invokeTool(
      ctx,
      'createTaxFact',
      { type: 'VEHICLE_MILEAGE_DEDUCTION', amount: deduction, method: recommendedMethod },
      async () => {
        if (ctx.taxCaseId) {
          return await AgentDbHelper.createTaxFact({
            taxCaseId: ctx.taxCaseId,
            category: 'DEDUCTION',
            factType: 'VEHICLE_MILEAGE_DEDUCTION',
            amount: deduction,
            confidence: input.hasWrittenLog ? 0.95 : 0.70,
            normalizedValue: {
              businessMiles,
              totalMiles,
              businessPercentage,
              method: recommendedMethod,
              amount: deduction,
              hasWrittenLog: input.hasWrittenLog
            }
          });
        }
        return null;
      }
    );

    // Create candidate TaxPosition
    const position = await this.invokeTool(
      ctx,
      'createTaxPositionCandidate',
      {
        title: `Vehicle Expense (${recommendedMethod})`,
        amount: deduction,
        rule: 'IRC § 162(a) / Rev. Proc. 2023-34'
      },
      async () => {
        let posId: string | undefined;
        if (ctx.taxCaseId) {
          const rec = await AgentDbHelper.createTaxPosition({
            taxCaseId: ctx.taxCaseId,
            category: 'BUSINESS_DEDUCTION',
            title: `Car & Truck Expenses (${recommendedMethod}: ${businessMiles} miles)`,
            amount: deduction,
            statutoryCitation: 'IRC § 162(a)',
            confidence: input.hasWrittenLog ? 0.95 : 0.70,
            status: input.hasWrittenLog ? TaxPositionStatus.PROPOSED : TaxPositionStatus.AWAITING_FACT,
            sourceAgent: this.agentType,
            ruleRefs: ['IRC § 162(a)', 'IRC § 274(d)', 'Rev. Proc. 2023-34'],
            evidenceRefs: []
          });
          posId = rec.id;
        }
        return { posId };
      }
    );

    return this.createSuccessResult(
      ctx,
      {
        qualifies: true,
        standardRatePerMile: standardRate,
        businessMiles,
        businessPercentage,
        standardMileageDeduction: standardDeduction,
        actualExpensesDeduction: actualDeduction > 0 ? actualDeduction : undefined,
        recommendedMethod,
        calculatedDeduction: deduction,
        statutoryBasis: 'IRC § 162(a) / IRC § 274(d) Substantiation',
        substantiationWarning,
        recommendedPositionId: position.posId
      },
      {
        confidence: input.hasWrittenLog ? 0.95 : 0.70,
        ruleRefs: ['IRC § 162(a)', 'IRC § 274(d)'],
        warnings: substantiationWarning ? [substantiationWarning] : [],
        requiresUserInput: !input.hasWrittenLog
      }
    );
  }
}
