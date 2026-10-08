/**
 * Autonomous Tax OS — Payroll Import Agent
 * 
 * Ingests and normalizes payroll earnings, deductions, and employee pay history.
 */

import { BaseAgent } from '../agents/base';
import { AgentExecutionContext } from '../context';
import { AgentResult, AgentType } from '../types';
import { PayrollIngestionService, IngestionEmployeePayload } from '../../services/payroll/ingestion/payrollIngestionService';
import { PayFrequency } from '@prisma/client';

export interface PayrollImportOutput {
  runId: string;
  grossWagesCents: bigint;
  employeeWithholdingsCents: bigint;
  employerTaxesCents: bigint;
  totalTaxLiabilityCents: bigint;
  netPayCents: bigint;
}

export class PayrollImportAgent extends BaseAgent<any, PayrollImportOutput> {
  public readonly agentType = AgentType.PAYROLL_IMPORT_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: {
      employerId: string;
      payDate: Date;
      payFrequency: PayFrequency;
      employees: IngestionEmployeePayload[];
    }
  ): Promise<AgentResult<PayrollImportOutput>> {
    const result = await this.invokeTool(ctx, 'importPayrollData', input, async () => {
      return await PayrollIngestionService.processPayrollRun({
        employerId: input.employerId,
        taxCaseId: ctx.taxCaseId,
        payDate: input.payDate,
        payFrequency: input.payFrequency,
        employees: input.employees
      });
    });

    return this.createSuccessResult(ctx, result, {
      confidence: 1.0,
      recommendedNextAction: 'CALCULATE_DEPOSITS_AND_LIABILITIES'
    });
  }
}
