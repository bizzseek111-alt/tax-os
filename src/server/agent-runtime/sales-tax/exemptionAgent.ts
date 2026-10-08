/**
 * Autonomous Tax OS — Exemption Certificate Agent
 * 
 * Verifies validity, state-applicability, and expiration of customer resale
 * and tax exemption certificates. Prevents unverified exempt tax classifications.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { ExemptionService, ExemptionValidationResult } from '../../services/salesTax/exemptions/exemptionService';

export interface ExemptionAgentOutput {
  validations: Array<{
    customerId: string;
    stateCode: string;
    isExempt: boolean;
    status: string;
    reason: string;
  }>;
  unverifiedCount: number;
}

export class ExemptionAgent extends BaseAgent<any, ExemptionAgentOutput> {
  public readonly agentType = AgentType.EXEMPTION_AGENT;
  private exemptionService = new ExemptionService();

  protected async run(
    ctx: AgentExecutionContext,
    input: { customerChecks: Array<{ customerId: string; stateCode: string }> }
  ): Promise<AgentResult<ExemptionAgentOutput>> {
    const validations: ExemptionAgentOutput['validations'] = [];
    let unverified = 0;

    for (const check of input?.customerChecks || []) {
      const res: ExemptionValidationResult = await this.invokeTool(ctx, 'verifyExemptionCertificate', check, async () => {
        return await this.exemptionService.validateExemption(check.customerId, check.stateCode);
      });

      if (!res.isExempt) unverified++;
      validations.push({
        customerId: check.customerId,
        stateCode: check.stateCode,
        isExempt: res.isExempt,
        status: res.status,
        reason: res.reason
      });
    }

    return this.createSuccessResult(
      ctx,
      {
        validations,
        unverifiedCount: unverified
      },
      {
        confidence: 0.97,
        warnings: unverified > 0 ? [`${unverified} customers have missing or invalid exemption certificates`] : [],
        recommendedNextAction: unverified > 0 ? 'REQUEST_CUSTOMER_EXEMPTION_CERTIFICATES' : 'ALL_CERTIFICATES_VALID'
      }
    );
  }
}
