/**
 * Autonomous Tax OS — Registration Agent
 * 
 * Verifies state sales tax registration permits, calculates statutory filing
 * frequencies, and alerts human reviewers when new registrations are legally required.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { RegistrationService } from '../../services/salesTax/registration/registrationService';
import { prisma } from '../../db';

export interface RegistrationAgentOutput {
  registeredStates: string[];
  unregisteredBreachedStates: string[];
  recommendations: Array<{ state: string; action: string; frequency: string }>;
}

export class RegistrationAgent extends BaseAgent<any, RegistrationAgentOutput> {
  public readonly agentType = AgentType.REGISTRATION_AGENT;
  private regService = new RegistrationService();

  protected async run(
    ctx: AgentExecutionContext,
    input: { breachedStates?: string[] }
  ): Promise<AgentResult<RegistrationAgentOutput>> {
    const taxCase = await prisma.taxCase.findUnique({
      where: { id: ctx.taxCaseId },
      include: { organization: true }
    });

    if (!taxCase) throw new Error(`TaxCase '${ctx.taxCaseId}' not found`);

    const existingRegistrations = await this.invokeTool(ctx, 'checkRegistration', {}, async () => {
      return await this.regService.getRegistrations(taxCase.organizationId);
    });

    const registeredStates = existingRegistrations
      .filter(r => r.status === 'REGISTERED')
      .map(r => r.stateCode);

    const breachedStates = input?.breachedStates || [];
    const unregisteredBreached = breachedStates.filter(s => !registeredStates.includes(s));
    const recommendations = unregisteredBreached.map(state => ({
      state,
      action: 'INITIATE_STATE_REGISTRATION',
      frequency: this.regService.determineFilingFrequency(state, BigInt(15000000))
    }));

    return this.createSuccessResult(
      ctx,
      {
        registeredStates,
        unregisteredBreachedStates: unregisteredBreached,
        recommendations
      },
      {
        confidence: 0.95,
        warnings: unregisteredBreached.map(s => `Unregistered in breached state ${s}`),
        recommendedNextAction: unregisteredBreached.length > 0 ? 'OBTAIN_SALES_TAX_PERMITS' : 'ALL_PERMITS_VALID'
      }
    );
  }
}
