/**
 * Autonomous Tax OS — Travel & Entertainment Expense Agent
 * 
 * Evaluates business travel expenses under IRC § 162(a)(2) (away from tax home overnight),
 * verifies primary business purpose, enforces 50% meal limitation under IRC § 274(n),
 * and disallows entertainment under IRC § 274(a)(1).
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, TaxPositionStatus } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface TravelExpenseItem {
  id: string;
  type: 'LODGING' | 'AIRFARE' | 'GROUND_TRANSPORT' | 'MEALS' | 'ENTERTAINMENT' | 'OTHER';
  destination: string;
  amount: number;
  dates: { start: string; end: string };
  businessPurpose: string;
}

export interface TravelInput {
  tripTitle: string;
  destination: string;
  primaryPurposeIsBusiness: boolean;
  isOvernightAwayFromTaxHome: boolean;
  expenses: TravelExpenseItem[];
}

export interface TravelResult {
  qualifiesForDeduction: boolean;
  totalLodging: number;
  totalTransportation: number;
  grossMeals: number;
  allowableMeals: number; // 50% limitation
  disallowedEntertainment: number;
  totalAllowableDeduction: number;
  statutoryBasis: string;
  disallowanceFlags: string[];
}

export class TravelAgent extends BaseAgent<TravelInput, TravelResult> {
  public readonly agentType = AgentType.TRAVEL_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: TravelInput
  ): Promise<AgentResult<TravelResult>> {
    const disallowanceFlags: string[] = [];

    if (!input.isOvernightAwayFromTaxHome) {
      disallowanceFlags.push('Travel is not away from tax home overnight (IRC § 162(a)(2) sleeper-or-rest rule)');
    }
    if (!input.primaryPurposeIsBusiness) {
      disallowanceFlags.push('Primary purpose of trip is personal (Treas. Reg. § 1.162-2(b))');
    }

    let totalLodging = 0;
    let totalTransportation = 0;
    let grossMeals = 0;
    let disallowedEntertainment = 0;

    for (const exp of input.expenses) {
      switch (exp.type) {
        case 'LODGING':
          totalLodging += exp.amount;
          break;
        case 'AIRFARE':
        case 'GROUND_TRANSPORT':
          totalTransportation += exp.amount;
          break;
        case 'MEALS':
          grossMeals += exp.amount;
          break;
        case 'ENTERTAINMENT':
          disallowedEntertainment += exp.amount;
          disallowanceFlags.push(`Entertainment item (${exp.destination}) strictly non-deductible under IRC § 274(a)(1)`);
          break;
        default:
          totalTransportation += exp.amount;
      }
    }

    const allowableMeals = Math.round(grossMeals * 0.50 * 100) / 100;
    const qualifies = input.isOvernightAwayFromTaxHome && input.primaryPurposeIsBusiness;
    const totalAllowable = qualifies ? totalLodging + totalTransportation + allowableMeals : 0;

    // Create candidate position if qualifying
    if (qualifies && totalAllowable > 0) {
      await this.invokeTool(
        ctx,
        'createTaxPositionCandidate',
        {
          title: `Travel: ${input.tripTitle} (${input.destination})`,
          amount: totalAllowable,
          rule: 'IRC § 162(a)(2) / IRC § 274(n)'
        },
        async () => {
          if (ctx.taxCaseId) {
            await AgentDbHelper.createTaxPosition({
              taxCaseId: ctx.taxCaseId,
              category: 'BUSINESS_DEDUCTION',
              title: `Travel Expenses (${input.destination})`,
              amount: totalAllowable,
              statutoryCitation: 'IRC § 162(a)(2)',
              confidence: 0.94,
              status: TaxPositionStatus.PROPOSED,
              sourceAgent: this.agentType,
              ruleRefs: ['IRC § 162(a)(2)', 'IRC § 274(d)', 'IRC § 274(n)'],
              evidenceRefs: input.expenses.map(e => e.id)
            });
          }
          return null;
        }
      );
    }

    return this.createSuccessResult(
      ctx,
      {
        qualifiesForDeduction: qualifies,
        totalLodging,
        totalTransportation,
        grossMeals,
        allowableMeals,
        disallowedEntertainment,
        totalAllowableDeduction: totalAllowable,
        statutoryBasis: 'IRC § 162(a)(2) Travel expenses / IRC § 274(n) 50% Meal Limitation',
        disallowanceFlags
      },
      {
        confidence: qualifies ? 0.94 : 0.98,
        ruleRefs: ['IRC § 162(a)(2)', 'IRC § 274(n)', 'IRC § 274(a)(1)'],
        warnings: disallowanceFlags
      }
    );
  }
}
