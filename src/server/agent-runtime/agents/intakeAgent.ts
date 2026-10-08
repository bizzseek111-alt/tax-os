/**
 * Autonomous Tax OS — Intake Agent
 * 
 * Builds taxpayer profile from validated facts and documents.
 * Invariants:
 * - May identify missing profile information (e.g. SSN, filing status, address).
 * - CANNOT guess or hallucinate identity facts.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { prisma } from '../../db';

export interface IntakeProfileOutput {
  taxpayerName?: string;
  hasSsn: boolean;
  filingStatus?: string;
  residentState?: string;
  isComplete: boolean;
  missingProfileFields: string[];
}

export class IntakeAgent extends BaseAgent<any, IntakeProfileOutput> {
  public readonly agentType = AgentType.INTAKE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    _input: any
  ): Promise<AgentResult<IntakeProfileOutput>> {
    const taxCase = await this.invokeTool(ctx, 'readTaxCase', { taxCaseId: ctx.taxCaseId }, async () => {
      return await prisma.taxCase.findUnique({
        where: { id: ctx.taxCaseId },
        include: {
          facts: true,
          owner: {
            include: { taxpayerProfile: true }
          }
        }
      });
    });

    if (!taxCase) {
      throw new Error(`TaxCase '${ctx.taxCaseId}' not found`);
    }

    const missingFields: string[] = [];
    const profile = taxCase.owner?.taxpayerProfile;

    const name = taxCase.owner?.fullName;
    if (!name) missingFields.push('taxpayer.name');

    const ssnEncrypted = profile?.ssnEncrypted;
    if (!ssnEncrypted) missingFields.push('taxpayer.ssn');

    const filingStatusFact = taxCase.facts.find(f => f.key === 'taxpayer.filing_status');
    const filingStatus = filingStatusFact?.valueString || profile?.filingStatus;
    if (!filingStatus) missingFields.push('taxpayer.filing_status');

    const stateFact = taxCase.facts.find(f => f.key === 'taxpayer.resident_state');
    const residentState = stateFact?.valueString || 'US-CA';

    const isComplete = missingFields.length === 0;

    return this.createSuccessResult(ctx, {
      taxpayerName: name,
      hasSsn: Boolean(ssnEncrypted),
      filingStatus: filingStatus || undefined,
      residentState,
      isComplete,
      missingProfileFields: missingFields
    }, {
      confidence: isComplete ? 1.0 : 0.70,
      unresolvedFacts: missingFields,
      requiresUserInput: !isComplete,
      recommendedNextAction: isComplete
        ? 'PROCEED_TO_DOCUMENT_INTAKE'
        : 'REQUEST_TAXPAYER_PROFILE_DETAILS'
    });
  }
}
