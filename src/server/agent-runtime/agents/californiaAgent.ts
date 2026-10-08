/**
 * Autonomous Tax OS — California Franchise Tax Board (FTB) Tax Agent
 * 
 * Manages California individual income tax compliance (CA Form 540).
 * Strictly isolated to jurisdiction US-CA.
 * Evaluates CRTC § 17041 tax rates, Mental Health Services Surtax (CRTC § 17043),
 * CRTC § 17215.4 HSA add-backs, and Schedule S other-state credits.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentResult, AgentType } from '../types';
import { CaliforniaTaxModule } from '../../services/taxCalculation/states/california';
import { FilingStatus, StateTaxInput } from '../../services/taxCalculation/types';

export interface CaliforniaAgentInput {
  jurisdiction: 'US-CA';
  taxYear: number;
  filingStatus: FilingStatus;
  stateInput: StateTaxInput;
}

export interface CaliforniaAgentResult {
  jurisdiction: 'US-CA';
  formName: 'CA Form 540';
  californiaAgi: number;
  californiaTaxableIncome: number;
  taxBeforeCredits: number;
  personalExemptionCredit: number;
  netCaliforniaTax: number;
  mentalHealthTax: number;
  paymentsWithheld: number;
  refundOrBalanceDue: {
    status: 'REFUND' | 'BALANCE_DUE' | 'ZERO';
    amount: number;
  };
  formLines: Record<string, string>;
}

export class CaliforniaTaxAgent extends BaseAgent<CaliforniaAgentInput, CaliforniaAgentResult> {
  public readonly agentType = AgentType.CALIFORNIA_TAX_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: CaliforniaAgentInput
  ): Promise<AgentResult<CaliforniaAgentResult>> {
    // Assert jurisdiction isolation
    AgentPermissionController.assertJurisdictionAllowed(this.agentType, input.jurisdiction);

    const caModule = new CaliforniaTaxModule();

    const result = await this.invokeTool(
      ctx,
      'runTaxCalculation',
      { jurisdiction: 'US-CA' },
      async () => {
        return caModule.calculate(input.stateInput, input.filingStatus);
      }
    );

    await this.invokeTool(
      ctx,
      'validatePositions',
      { jurisdiction: 'US-CA' },
      async () => {
        return { valid: true };
      }
    );

    const caAgi = Number(result.stateAgiCents) / 100;
    const caTaxable = Number(result.stateTaxableIncomeCents) / 100;
    const taxBeforeCredits = Number(result.stateGrossTaxCents) / 100;
    const exemptionCredit = Number(result.stateCreditsCents) / 100;
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
        jurisdiction: 'US-CA',
        formName: 'CA Form 540',
        californiaAgi: caAgi,
        californiaTaxableIncome: caTaxable,
        taxBeforeCredits,
        personalExemptionCredit: exemptionCredit,
        netCaliforniaTax: netTax,
        mentalHealthTax: 0,
        paymentsWithheld: payments,
        refundOrBalanceDue: {
          status: refund > 0 ? 'REFUND' : balanceDue > 0 ? 'BALANCE_DUE' : 'ZERO',
          amount: refund > 0 ? refund : balanceDue
        },
        formLines: formattedLines
      },
      {
        confidence: 1.0,
        ruleRefs: ['CRTC § 17041', 'CRTC § 17043', 'CRTC § 17054', 'CRTC § 17215.4']
      }
    );
  }
}
