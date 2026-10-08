/**
 * Autonomous Tax OS — State Payroll Module Registry
 * 
 * Dispatcher coordinating multi-state payroll withholding across launch states:
 * - California (US-CA)
 * - New York (US-NY)
 * - New Jersey (US-NJ)
 * - Illinois (US-IL)
 * - Massachusetts (US-MA)
 */

import {
  PayFrequency,
  EmployeeWithholdingResult,
  EmployerTaxResult,
  StateWithholdingConfig
} from '../types';
import { CaliforniaPayrollModule } from './californiaPayroll';
import { NewYorkPayrollModule } from './newYorkPayroll';
import { NewJerseyPayrollModule } from './newJerseyPayroll';
import { IllinoisPayrollModule } from './illinoisPayroll';
import { MassachusettsPayrollModule } from './massachusettsPayroll';

export class StatePayrollRegistry {
  public static calculateStatePayroll(params: {
    stateCode: string;
    employeeId: string;
    sitTaxableWageCents: bigint;
    suiTaxableWageCents: bigint;
    grossWageCents: bigint;
    frequency: PayFrequency;
    config?: StateWithholdingConfig;
    isNycResident?: boolean;
    employerSuiRate?: number;
  }): {
    withholdings: EmployeeWithholdingResult[];
    employerTaxes: EmployerTaxResult[];
    totalStateEmployeeCents: bigint;
    totalStateEmployerCents: bigint;
  } {
    let raw: any;
    switch (params.stateCode) {
      case 'US-CA':
      case 'CA':
        raw = CaliforniaPayrollModule.calculateCaliforniaTaxes(params);
        break;

      case 'US-NY':
      case 'NY':
        raw = NewYorkPayrollModule.calculateNewYorkTaxes(params);
        break;

      case 'US-NJ':
      case 'NJ':
        raw = NewJerseyPayrollModule.calculateNewJerseyTaxes(params);
        break;

      case 'US-IL':
      case 'IL':
        raw = IllinoisPayrollModule.calculateIllinoisTaxes(params);
        break;

      case 'US-MA':
      case 'MA':
        raw = MassachusettsPayrollModule.calculateMassachusettsTaxes(params);
        break;

      default:
        throw new Error(
          `UNSUPPORTED_PAYROLL_STATE: State '${params.stateCode}' is not supported in the current TaxOS launch release. Supported states: [US-CA, US-NY, US-NJ, US-IL, US-MA]`
        );
    }

    const totalStateEmployeeCents = raw.withholdings.reduce(
      (sum: bigint, w: EmployeeWithholdingResult) => sum + (w.taxAmountCents ?? BigInt(0)),
      BigInt(0)
    );
    const totalStateEmployerCents = raw.employerTaxes.reduce(
      (sum: bigint, t: EmployerTaxResult) => sum + (t.taxAmountCents ?? BigInt(0)),
      BigInt(0)
    );

    return {
      ...raw,
      totalStateEmployeeCents,
      totalStateEmployerCents
    };
  }
}
