/**
 * Autonomous Tax OS — Sales Tax Notice Agent
 * 
 * Ingests, parses, and classifies state agency sales tax notices
 * (audits, assessments, deficiencies) and routes to specialized CPA reviewers.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType, ExecutionStatus } from '../types';
import { NoticeService, IngestNoticeParams } from '../../services/salesTax/notices/noticeService';
import { prisma } from '../../db';

export interface NoticeAgentOutput {
  noticeId: string;
  stateCode: string;
  agencyName: string;
  totalAssessmentCents: string;
  reviewTaskId?: string;
  status: string;
}

export class SalesTaxNoticeAgent extends BaseAgent<any, NoticeAgentOutput> {
  public readonly agentType = AgentType.SALES_TAX_NOTICE_AGENT;
  private noticeService = new NoticeService();

  protected async run(
    ctx: AgentExecutionContext,
    input: Omit<IngestNoticeParams, 'organizationId' | 'taxCaseId'>
  ): Promise<AgentResult<NoticeAgentOutput>> {
    const taxCase = await prisma.taxCase.findUnique({ where: { id: ctx.taxCaseId } });
    if (!taxCase) throw new Error(`TaxCase '${ctx.taxCaseId}' not found`);

    const notice = await this.invokeTool(ctx, 'ingestNotice', { state: input.stateCode }, async () => {
      return await this.noticeService.ingestNotice({
        ...input,
        organizationId: taxCase.organizationId,
        taxCaseId: ctx.taxCaseId
      });
    });

    return this.createSuccessResult(
      ctx,
      {
        noticeId: notice.id,
        stateCode: notice.stateCode,
        agencyName: notice.agencyName,
        totalAssessmentCents: notice.totalAssessmentCents.toString(),
        reviewTaskId: notice.reviewTaskId || undefined,
        status: notice.status
      },
      {
        confidence: 0.98,
        warnings: [`State sales tax notice received with assessment $${(Number(notice.totalAssessmentCents) / 100).toFixed(2)}`],
        requiresProfessionalReview: true,
        recommendedNextAction: 'ESCALATE_TO_CPA_NOTICE_DEFENSE'
      }
    );
  }
}
