/**
 * Autonomous Tax OS — Payroll Notice Agent
 * 
 * Ingests IRS and state agency payroll notices and escalates to priority ReviewTasks.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { PayrollNoticeService } from '../../services/payroll/notices/payrollNoticeService';
import { SalesTaxNoticeSeverity } from '@prisma/client';

export interface PayrollNoticeOutput {
  noticeId: string;
  agencyName: string;
  assessedAmountCents: bigint;
  status: string;
}

export class PayrollNoticeAgent extends BaseAgent<any, PayrollNoticeOutput> {
  public readonly agentType = AgentType.PAYROLL_NOTICE_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      employerId: string;
      agencyName: string;
      jurisdiction: string;
      noticeType: string;
      noticeNumber?: string;
      periodCovered?: string;
      assessedAmountCents: bigint;
      responseDueDate?: Date;
      severity?: SalesTaxNoticeSeverity;
      documentId?: string;
    }
  ): Promise<AgentResult<PayrollNoticeOutput>> {
    const notice = await this.invokeTool(ctx, 'ingestPayrollNotice', input, async () => {
      return await PayrollNoticeService.ingestPayrollNotice({
        ...input,
        organizationId: ctx.organizationId,
        taxCaseId: ctx.taxCaseId
      });
    });

    return this.createSuccessResult(
      ctx,
      {
        noticeId: notice.id,
        agencyName: notice.agencyName,
        assessedAmountCents: notice.assessedAmountCents,
        status: notice.status
      },
      {
        confidence: 1.0,
        warnings: [`Urgent agency notice received from ${notice.agencyName}: $${Number(notice.assessedAmountCents) / 100}`],
        recommendedNextAction: 'PREPARE_NOTICE_DEFENSE'
      }
    );
  }
}
