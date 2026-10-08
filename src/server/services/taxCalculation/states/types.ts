/**
 * Autonomous TaxOS — State Tax Module Interface
 * Workstream 3: Phase 3
 */

import { FilingStatus, StateTaxInput, StateTaxResult } from '../types';

export interface StateTaxModule {
  jurisdiction: string;
  stateName: string;
  formName: string;
  calculate(input: StateTaxInput, filingStatus: FilingStatus): StateTaxResult;
}
