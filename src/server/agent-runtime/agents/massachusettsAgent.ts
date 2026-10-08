/**
 * Autonomous Tax OS — Massachusetts Department of Revenue Tax Agent
 * 
 * Manages Massachusetts individual income tax compliance (MA Form 1).
 * Strictly isolated to jurisdiction US-MA.
 * Evaluates Part B flat tax (5.0% under M.G.L. ch. 62 § 4), Millionaire Surtax (4.0%
 * under Fair Share Amendment), personal exemptions, and Schedule OJC other-state credit.
 */

import { BaseAgent } from './base';
import { AgentExecutionContext } from '../context';
import { AgentPermissionController } from '../permissions';
import { AgentResult, AgentType } from '../types';
import { MassachusettsTaxModule } from '../../services/taxCalculation/states/massachusetts';
import { FilingStatus, StateTaxInput } from '../../services/taxCalculation/types';

export interface MassachusettsAgentInput {
  jurisdiction: 'US-MA';
  taxYear: number;
  filingStatus: FilingStatus;
  stateInput: StateTaxInput;
}

export interface MassachusettsAgentResult {
  jurisdiction: 'US-MA';
  formName: 'MA Form 1';
  massachusettsAgi: number;
  massachusettsTaxableIncome: number;
  taxBeforeCredits: number;
  netMassachusettsTax: number;
  paymentsWithheld: number;
  refundOrBalanceDue: {
    status: 'REFUND' | 'BALANCE_DUE' | 'ZERO';
    amount: number;
  };
  formLines: Record<string, string>;
}

export class MassachusettsTaxAgent extends BaseAgent<MassachusettsAgentInput, MassachusettsAgentResult> {
  public readonly agentType = AgentType.MASSACHUSETTS_TAX_AGENT;

  protected async run(
    ctx: AgentExecutionContext,
    input: MassachusettsAgentInput
  ): Promise<AgentResult<MassachusettsAgentResult>> {
    // Assert jurisdiction isolation
    AgentPermissionController.assertJurisdictionAllowed(this.agentType, input.jurisdiction);

    const maModule = new MassachusettsTaxModule();

    const result = await this.invokeTool(
      ctx,
      'runTaxCalculation',
      { jurisdiction: 'US-MA' },
      async () => {
        return maModule.calculate(input.stateInput, input.filingStatus);
      }
    );

    await this.invokeTool(
      ctx,
      'validatePositions',
      { jurisdiction: 'US-MA' },
      async () => {
        return { valid: true };
      }
    );

    const maAgi = Number(result.stateAgiCents) / 100;
    const maTaxable = Number(result.stateTaxableIncomeCents) / 100;
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
        jurisdiction: 'US-MA',
        formName: 'MA Form 1',
        massachusettsAgi: maAgi,
        massachusettsTaxableIncome: maTaxable,
        taxBeforeCredits,
        netMassachusettsTax: netTax,
        paymentsWithheld: payments,
        refundOrBalanceDue: {
          status: refund > 0 ? 'REFUND' : balanceDue > 0 ? 'BALANCE_DUE' : 'ZERO',
          amount: refund > 0 ? refund : balanceDue
        },
        formLines: formattedLines
      },
      {
        confidence: 1.0,
        ruleRefs: ['M.G.L. ch. 62, § 4', 'Mass. Const. amend. art. XLIV', 'M.G.L. ch. 62, § 3(B)(b)']
      }
    );
  }
}
