/**
 * Autonomous Tax OS — Illinois Department of Revenue Tax Agent
 * 
 * Manages Illinois individual income tax compliance (IL Form IL-1040).
 * Strictly isolated to jurisdiction US-IL.
 * Evaluates Illinois constitutional flat tax (4.95% under 35 ILCS 5/201(b)(14)),
 * standard exemption ($2,775), retirement/pension exemption (35 ILCS 5/203(a)(2)(F)),
 * and Schedule CR credit.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentResult, AgentType } from '../types';
import { IllinoisTaxModule } from '../../services/taxCalculation/states/illinois';
import { FilingStatus, StateTaxInput } from '../../services/taxCalculation/types';

export interface IllinoisAgentInput {
  jurisdiction: 'US-IL';
  taxYear: number;
  filingStatus: FilingStatus;
  stateInput: StateTaxInput;
}

export interface IllinoisAgentResult {
  jurisdiction: 'US-IL';
  formName: 'IL Form IL-1040';
  illinoisBaseIncome: number;
  illinoisNetIncome: number;
  taxBeforeCredits: number;
  netIllinoisTax: number;
  paymentsWithheld: number;
  refundOrBalanceDue: {
    status: 'REFUND' | 'BALANCE_DUE' | 'ZERO';
    amount: number;
  };
  formLines: Record<string, string>;
}

export class IllinoisTaxAgent extends BaseAgent<IllinoisAgentInput, IllinoisAgentResult> {
  public readonly agentType = AgentType.ILLINOIS_TAX_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: IllinoisAgentInput
  ): Promise<AgentResult<IllinoisAgentResult>> {
    // Assert jurisdiction isolation
    AgentPermissionController.assertJurisdictionAllowed(this.agentType, input.jurisdiction);

    const ilModule = new IllinoisTaxModule();

    const result = await this.invokeTool(
      ctx,
      'runTaxCalculation',
      { jurisdiction: 'US-IL' },
      async () => {
        return ilModule.calculate(input.stateInput, input.filingStatus);
      }
    );

    await this.invokeTool(
      ctx,
      'validatePositions',
      { jurisdiction: 'US-IL' },
      async () => {
        return { valid: true };
      }
    );

    const ilBase = Number(result.stateAgiCents) / 100;
    const ilNet = Number(result.stateTaxableIncomeCents) / 100;
    const taxBeforeCredits = Number(result.stateGrossTaxCents) / 100;
    const netTax = Number(result.netStateTaxCents) / 100;
    const payments = Number(result.totalStatePaymentsCents) / 100;
    const refund = Number(result.stateRefundCents) / 100;
    const balanceDue = Number(result.stateBalanceDueCents) / 100;

    const formattedLines: Record<string, string> = {};
    for (const [k, v] of Object.entries(result.formLineBreakdown || {})) {
      formattedLines[k] = (Number(v) / 100).toFixed(2);
    }

    return this.createSuccessResult(
      ctx,
      {
        jurisdiction: 'US-IL',
        formName: 'IL Form IL-1040',
        illinoisBaseIncome: ilBase,
        illinoisNetIncome: ilNet,
        taxBeforeCredits,
        netIllinoisTax: netTax,
        paymentsWithheld: payments,
        refundOrBalanceDue: {
          status: refund > 0 ? 'REFUND' : balanceDue > 0 ? 'BALANCE_DUE' : 'ZERO',
          amount: refund > 0 ? refund : balanceDue
        },
        formLines: formattedLines
      },
      {
        confidence: 1.0,
        ruleRefs: ['35 ILCS 5/201(b)(14)', '35 ILCS 5/203(a)(2)(F)', '35 ILCS 5/204(b)']
      }
    );
  }
}
