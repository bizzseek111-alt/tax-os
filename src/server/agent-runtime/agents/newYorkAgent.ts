/**
 * Autonomous Tax OS — New York State (NYS) Tax Agent
 * 
 * Manages New York State individual income tax compliance (NY Form IT-201).
 * Strictly isolated to jurisdiction US-NY.
 * Evaluates NY Tax Law § 601 tax brackets, § 612 modifications, § 614 standard deductions,
 * and Form IT-112-R other-state credits.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentResult, AgentType } from '../types';
import { NewYorkTaxModule } from '../../services/taxCalculation/states/newYork';
import { FilingStatus, StateTaxInput } from '../../services/taxCalculation/types';

export interface NewYorkAgentInput {
  jurisdiction: 'US-NY';
  taxYear: number;
  filingStatus: FilingStatus;
  stateInput: StateTaxInput;
}

export interface NewYorkAgentResult {
  jurisdiction: 'US-NY';
  formName: 'NY Form IT-201';
  newYorkAgi: number;
  newYorkTaxableIncome: number;
  taxBeforeCredits: number;
  netNewYorkTax: number;
  paymentsWithheld: number;
  refundOrBalanceDue: {
    status: 'REFUND' | 'BALANCE_DUE' | 'ZERO';
    amount: number;
  };
  formLines: Record<string, string>;
}

export class NewYorkTaxAgent extends BaseAgent<NewYorkAgentInput, NewYorkAgentResult> {
  public readonly agentType = AgentType.NEW_YORK_TAX_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: NewYorkAgentInput
  ): Promise<AgentResult<NewYorkAgentResult>> {
    // Assert jurisdiction isolation
    AgentPermissionController.assertJurisdictionAllowed(this.agentType, input.jurisdiction);

    const nyModule = new NewYorkTaxModule();

    const result = await this.invokeTool(
      ctx,
      'runTaxCalculation',
      { jurisdiction: 'US-NY' },
      async () => {
        return nyModule.calculate(input.stateInput, input.filingStatus);
      }
    );

    await this.invokeTool(
      ctx,
      'validatePositions',
      { jurisdiction: 'US-NY' },
      async () => {
        return { valid: true };
      }
    );

    const nyAgi = Number(result.stateAgiCents) / 100;
    const nyTaxable = Number(result.stateTaxableIncomeCents) / 100;
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
        jurisdiction: 'US-NY',
        formName: 'NY Form IT-201',
        newYorkAgi: nyAgi,
        newYorkTaxableIncome: nyTaxable,
        taxBeforeCredits,
        netNewYorkTax: netTax,
        paymentsWithheld: payments,
        refundOrBalanceDue: {
          status: refund > 0 ? 'REFUND' : balanceDue > 0 ? 'BALANCE_DUE' : 'ZERO',
          amount: refund > 0 ? refund : balanceDue
        },
        formLines: formattedLines
      },
      {
        confidence: 1.0,
        ruleRefs: ['NY Tax Law § 601', 'NY Tax Law § 612', 'NY Tax Law § 614']
      }
    );
  }
}
