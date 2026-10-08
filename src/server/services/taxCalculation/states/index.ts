/**
 * Autonomous TaxOS — State Tax Modules Registry
 * Workstream 3: Phase 3
 */

import { SupportedJurisdiction } from '../types';
import { StateTaxModule } from './types';
import { CaliforniaTaxModule } from './california';
import { NewYorkTaxModule } from './newYork';
import { NewJerseyTaxModule } from './newJersey';
import { IllinoisTaxModule } from './illinois';
import { MassachusettsTaxModule } from './massachusetts';

export * from './types';
export * from './california';
export * from './newYork';
export * from './newJersey';
export * from './illinois';
export * from './massachusetts';
export * from './multiState';

const modules: Partial<Record<SupportedJurisdiction, StateTaxModule>> = {
  'US-CA': new CaliforniaTaxModule(),
  'US-NY': new NewYorkTaxModule(),
  'US-NJ': new NewJerseyTaxModule(),
  'US-IL': new IllinoisTaxModule(),
  'US-MA': new MassachusettsTaxModule(),
};

export function getStateTaxModule(jurisdiction: SupportedJurisdiction): StateTaxModule | null {
  return modules[jurisdiction] || null;
}
