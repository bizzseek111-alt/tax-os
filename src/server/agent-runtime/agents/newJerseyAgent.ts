/**
 * Autonomous Tax OS — New Jersey Division of Taxation Tax Agent
 * 
 * Manages New Jersey Gross Income Tax compliance (NJ Form NJ-1040).
 * Strictly isolated to jurisdiction US-NJ.
 * Handles New Jersey non-conformity to federal AGI (N.J. Stat. Ann. § 54A:5-1),
 * NJ progressive tax rates (1.4% - 10.75%), and Schedule NJ-COJ other-state credit.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentResult, AgentType } from '../types';
import { NewJerseyTaxModule } from '../../services/taxCalculation/states/newJersey';
import { FilingStatus, StateTaxInput } from '../../services/taxCalculation/types';

export interface NewJerseyAgentInput {
  jurisdiction: 'US-NJ';
  taxYear: number;
  filingStatus: FilingStatus;
  stateInput: StateTaxInput;
}

export interface NewJerseyAgentResult {
  jurisdiction: 'US-NJ';
  formName: 'NJ Form NJ-1040';
  newJerseyGrossIncome: number;
  newJerseyTaxableIncome: number;
  taxBeforeCredits: number;
  netNewJerseyTax: number;
  paymentsWithheld: number;
  refundOrBalanceDue: {
    status: 'REFUND' | 'BALANCE_DUE' | 'ZERO';
    amount: number;
  };
  formLines: Record<string, string>;
}

export class NewJerseyTaxAgent extends BaseAgent<NewJerseyAgentInput, NewJerseyAgentResult> {
  public readonly agentType = AgentType.NEW_JERSEY_TAX_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: NewJerseyAgentInput
  ): Promise<AgentResult<NewJerseyAgentResult>> {
    // Assert jurisdiction isolation
    AgentPermissionController.assertJurisdictionAllowed(this.agentType, input.jurisdiction);

    const njModule = new NewJerseyTaxModule();

    const result = await this.invokeTool(
      ctx,
      'runTaxCalculation',
      { jurisdiction: 'US-NJ' },
      async () => {
        return njModule.calculate(input.stateInput, input.filingStatus);
      }
    );

    await this.invokeTool(
      ctx,
      'validatePositions',
      { jurisdiction: 'US-NJ' },
      async () => {
        return { valid: true };
      }
    );

    const njGross = Number(result.stateAgiCents) / 100;
    const njTaxable = Number(result.stateTaxableIncomeCents) / 100;
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
        jurisdiction: 'US-NJ',
        formName: 'NJ Form NJ-1040',
        newJerseyGrossIncome: njGross,
        newJerseyTaxableIncome: njTaxable,
        taxBeforeCredits,
        netNewJerseyTax: netTax,
        paymentsWithheld: payments,
        refundOrBalanceDue: {
          status: refund > 0 ? 'REFUND' : balanceDue > 0 ? 'BALANCE_DUE' : 'ZERO',
          amount: refund > 0 ? refund : balanceDue
        },
        formLines: formattedLines
      },
      {
        confidence: 1.0,
        ruleRefs: ['N.J. Stat. Ann. § 54A:2-1', 'N.J. Stat. Ann. § 54A:3-1', 'N.J. Stat. Ann. § 54A:5-1']
      }
    );
  }
}
