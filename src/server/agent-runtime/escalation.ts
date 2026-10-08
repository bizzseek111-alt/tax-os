/**
 * Autonomous Tax OS — Human Professional Escalation Router
 * 
 * Routes complex, conflicted, or high-materiality tax issues to the appropriate
 * credentialed human professional:
 * - CPA (Certified Public Accountant)
 * - EA (Enrolled Agent)
 * - Tax Attorney (Legal statutory dispute, civil fraud penalty, residency litigation)
 * - Bookkeeper (Substantiation, receipt collection)
 */

import { BaseAgent } from './agents/base';
import { AgentExecutionContext } from './context';
import { AgentResult, AgentType } from './types';
import { AgentDbHelper } from './dbHelpers';

export interface EscalationItemInput {
  taxCaseId: string;
  issueTitle: string;
  issueCategory: 'STATUTORY_CONFLICT' | 'RESIDENCY_DISPUTE' | 'MISSING_RECEIPTS' | 'HIGH_VALUE_AUDIT_RISK' | 'STANDARD_REVIEW';
  jurisdiction: string;
  dollarMaterialityUsd: number;
  hasAdversarialDissent: boolean;
  legalConflictDetected: boolean;
}

export interface RoutingAssignment {
  requiredRole: 'TAX_ATTORNEY' | 'CPA' | 'ENROLLED_AGENT' | 'BOOKKEEPER';
  assignedSpecialty: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedReviewMinutes: number;
  jurisdiction: string;
  routingRationale: string;
  reviewTaskIdCreated?: string;
}

export class HumanEscalationRouter extends BaseAgent<EscalationItemInput, RoutingAssignment> {
  public readonly agentType = AgentType.HUMAN_ESCALATION_ROUTER;

  protected async run(
    ctx: AgentExecutionContext,
    input: EscalationItemInput
  ): Promise<AgentResult<RoutingAssignment>> {
    const assignment = await this.invokeTool(
      ctx,
      'routeToSpecialist',
      { issueCategory: input.issueCategory, jurisdiction: input.jurisdiction },
      async () => {
        let requiredRole: 'TAX_ATTORNEY' | 'CPA' | 'ENROLLED_AGENT' | 'BOOKKEEPER' = 'CPA';
        let assignedSpecialty = 'Federal & State Individual Income Tax';
        let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
        let estimatedMinutes = 30;
        let rationale = 'Standard human review prior to filing sign-off.';

        if (input.legalConflictDetected || input.issueCategory === 'STATUTORY_CONFLICT' || input.issueCategory === 'HIGH_VALUE_AUDIT_RISK') {
          requiredRole = 'TAX_ATTORNEY';
          assignedSpecialty = 'Tax Controversy & Statutory Interpretation';
          urgency = 'CRITICAL';
          estimatedMinutes = 90;
          rationale = 'Statutory ambiguity or high audit exposure requires formal Tax Attorney legal review.';
        } else if (input.issueCategory === 'RESIDENCY_DISPUTE') {
          requiredRole = 'CPA';
          assignedSpecialty = `${input.jurisdiction} State Residency & Sourcing Specialist`;
          urgency = 'HIGH';
          estimatedMinutes = 60;
          rationale = 'Multi-state statutory presence and domicile dispute requires state-specific CPA determination.';
        } else if (input.issueCategory === 'MISSING_RECEIPTS') {
          requiredRole = 'BOOKKEEPER';
          assignedSpecialty = 'Document Verification & Receipt Intake';
          urgency = 'LOW';
          estimatedMinutes = 20;
          rationale = 'Substantiation collection and bookkeeping categorization.';
        } else if (input.dollarMaterialityUsd > 25000) {
          requiredRole = 'CPA';
          assignedSpecialty = 'Senior Tax Manager';
          urgency = 'HIGH';
          estimatedMinutes = 45;
          rationale = `Materiality exceeds $25,000 threshold ($${input.dollarMaterialityUsd.toLocaleString()}).`;
        } else {
          requiredRole = 'ENROLLED_AGENT';
          assignedSpecialty = 'Standard Return Quality Review';
          urgency = 'MEDIUM';
          estimatedMinutes = 30;
          rationale = 'Routine credentialed sign-off.';
        }

        let reviewTaskId: string | undefined;
        if (ctx.taxCaseId) {
          const task = await AgentDbHelper.createReviewTask({
            taxCaseId: ctx.taxCaseId,
            title: `Professional Routing: ${input.issueTitle} -> ${requiredRole}`,
            reason: rationale,
            priority: urgency === 'CRITICAL' ? 'URGENT' : urgency === 'HIGH' ? 'HIGH' : 'MEDIUM',
            requiredRole,
            jurisdiction: input.jurisdiction,
            materialityUsd: input.dollarMaterialityUsd
          });
          reviewTaskId = task.id;
        }

        return {
          requiredRole,
          assignedSpecialty,
          urgency,
          estimatedReviewMinutes: estimatedMinutes,
          jurisdiction: input.jurisdiction,
          routingRationale: rationale,
          reviewTaskIdCreated: reviewTaskId
        };
      }
    );

    return this.createSuccessResult(
      ctx,
      assignment,
      {
        confidence: 0.99,
        requiresProfessionalReview: true,
        recommendedNextAction: `DISPATCH_TASK_TO_${assignment.requiredRole}`
      }
    );
  }
}
