/**
 * Autonomous Tax OS — State Residency & Domicile Agent
 * 
 * Determines taxpayer residency status across jurisdictions:
 * - Resident, Nonresident, or Part-Year Resident
 * - Domicile test vs Statutory Resident test (183-day rule + permanent place of abode)
 * Identifies dual-residency risk and triggers review tasks when statutory conflict occurs.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { AgentDbHelper } from '../dbHelpers';

export interface StatePresence {
  state: string;
  daysPresent: number;
  hasPermanentAbode: boolean;
  domicileClaimed: boolean;
  moveInDate?: string;
  moveOutDate?: string;
}

export interface ResidencyInput {
  taxYear: number;
  primaryState: string;
  presences: StatePresence[];
}

export interface StateResidencyDetermination {
  state: string;
  residencyType: 'RESIDENT' | 'NONRESIDENT' | 'PART_YEAR_RESIDENT' | 'STATUTORY_RESIDENT';
  statutoryBasis: string;
  daysInState: number;
  riskFlags: string[];
}

export interface ResidencyResult {
  determinations: StateResidencyDetermination[];
  hasMultiStateFilingObligation: boolean;
  dualResidencyConflict: boolean;
  recommendedReviewTaskId?: string;
}

export class ResidencyAgent extends BaseAgent<ResidencyInput, ResidencyResult> {
  public readonly agentType = AgentType.RESIDENCY_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: ResidencyInput
  ): Promise<AgentResult<ResidencyResult>> {
    const determinations: StateResidencyDetermination[] = [];
    let residentCount = 0;
    let dualResidencyConflict = false;

    for (const p of input.presences) {
      const riskFlags: string[] = [];
      let residencyType: 'RESIDENT' | 'NONRESIDENT' | 'PART_YEAR_RESIDENT' | 'STATUTORY_RESIDENT' = 'NONRESIDENT';
      let statutoryBasis = '';

      if (p.moveInDate || p.moveOutDate) {
        residencyType = 'PART_YEAR_RESIDENT';
        statutoryBasis = `${p.state} Part-Year Resident Allocation`;
      } else if (p.domicileClaimed) {
        residencyType = 'RESIDENT';
        residentCount++;
        statutoryBasis = `${p.state} Common Law Domicile`;
      } else if (p.daysPresent > 183 && p.hasPermanentAbode) {
        // Statutory resident test
        residencyType = 'STATUTORY_RESIDENT';
        residentCount++;
        riskFlags.push(`${p.state} 183-day statutory resident rule triggered with permanent place of abode`);
        statutoryBasis = `${p.state} Statutory Resident (183+ days with permanent abode)`;
      } else {
        residencyType = 'NONRESIDENT';
        statutoryBasis = `${p.state} Nonresident (under 183 days or lack of permanent abode)`;
      }

      determinations.push({
        state: p.state,
        residencyType,
        statutoryBasis,
        daysInState: p.daysPresent,
        riskFlags
      });
    }

    if (residentCount > 1) {
      dualResidencyConflict = true;
    }

    // Persist tax facts for residency
    await this.invokeTool(
      ctx,
      'createTaxFact',
      { determinations },
      async () => {
        if (ctx.taxCaseId) {
          return await AgentDbHelper.createTaxFact({
            taxCaseId: ctx.taxCaseId,
            category: 'PROFILE',
            factType: 'RESIDENCY_DETERMINATION',
            confidence: dualResidencyConflict ? 0.75 : 0.98,
            normalizedValue: { determinations, dualResidencyConflict }
          });
        }
        return null;
      }
    );

    let reviewTaskId: string | undefined;
    if (dualResidencyConflict) {
      const reviewTask = await this.invokeTool(
        ctx,
        'createReviewTask',
        { title: 'Resolve Dual-State Residency Conflict' },
        async () => {
          if (ctx.taxCaseId) {
            const t = await AgentDbHelper.createReviewTask({
              taxCaseId: ctx.taxCaseId,
              title: 'Dual State Statutory Residency Conflict',
              reason: 'Taxpayer meets resident tests in multiple states simultaneously.',
              priority: 'HIGH',
              requiredRole: 'CPA'
            });
            return t.id;
          }
          return undefined;
        }
      );
      reviewTaskId = reviewTask;
    }

    return this.createSuccessResult(
      ctx,
      {
        determinations,
        hasMultiStateFilingObligation: determinations.filter(d => d.residencyType !== 'NONRESIDENT' || d.daysInState > 0).length > 1,
        dualResidencyConflict,
        recommendedReviewTaskId: reviewTaskId
      },
      {
        confidence: dualResidencyConflict ? 0.75 : 0.98,
        contradictions: dualResidencyConflict ? ['Dual residency conflict between states'] : [],
        requiresProfessionalReview: dualResidencyConflict
      }
    );
  }
}
