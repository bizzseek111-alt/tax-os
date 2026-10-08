/**
 * Autonomous Tax OS — Sales Tax Registration Service
 * 
 * Manages state sales tax permits, registration numbers, filing frequencies,
 * and state agency interactions across CA, NY, NJ, IL, MA.
 */

import { prisma } from '../../../db';
import { FilingFrequency, RegistrationStatus } from '@prisma/client';

export interface StateAgencyInfo {
  stateCode: string;
  agencyName: string;
  portalName: string;
  defaultFrequency: FilingFrequency;
  monthlyThresholdAnnualLiabilityCents: bigint;
}

export const STATE_TAX_AGENCIES: Record<string, StateAgencyInfo> = {
  CA: {
    stateCode: 'CA',
    agencyName: 'California Department of Tax and Fee Administration (CDTFA)',
    portalName: 'CDTFA Online Services',
    defaultFrequency: FilingFrequency.QUARTERLY,
    monthlyThresholdAnnualLiabilityCents: BigInt(20400000) // $204,000/yr ($17k/mo)
  },
  NY: {
    stateCode: 'NY',
    agencyName: 'New York State Department of Taxation and Finance',
    portalName: 'NYS Tax Online Services',
    defaultFrequency: FilingFrequency.QUARTERLY,
    monthlyThresholdAnnualLiabilityCents: BigInt(30000000) // $300,000
  },
  NJ: {
    stateCode: 'NJ',
    agencyName: 'New Jersey Division of Taxation',
    portalName: 'NJ Premier Business Services',
    defaultFrequency: FilingFrequency.QUARTERLY,
    monthlyThresholdAnnualLiabilityCents: BigInt(3000000) // $30,000
  },
  IL: {
    stateCode: 'IL',
    agencyName: 'Illinois Department of Revenue (IDOR)',
    portalName: 'MyTax Illinois',
    defaultFrequency: FilingFrequency.QUARTERLY,
    monthlyThresholdAnnualLiabilityCents: BigInt(240000) // $2,400 ($200/mo)
  },
  MA: {
    stateCode: 'MA',
    agencyName: 'Massachusetts Department of Revenue (Mass DOR)',
    portalName: 'MassTaxConnect',
    defaultFrequency: FilingFrequency.QUARTERLY,
    monthlyThresholdAnnualLiabilityCents: BigInt(120000) // $1,200/yr
  }
};

export class RegistrationService {
  /**
   * Registers or updates a state sales tax permit
   */
  public async registerState(params: {
    organizationId: string;
    stateCode: string;
    registrationNumber: string;
    filingFrequency?: FilingFrequency;
    effectiveDate?: Date;
    notes?: string;
  }) {
    const state = params.stateCode.toUpperCase();
    const agency = STATE_TAX_AGENCIES[state];
    if (!agency) {
      throw new Error(`Unsupported state for registration: ${params.stateCode}`);
    }

    const reg = await prisma.salesTaxRegistration.upsert({
      where: {
        organizationId_stateCode: {
          organizationId: params.organizationId,
          stateCode: state
        }
      },
      update: {
        registrationNumber: params.registrationNumber,
        status: RegistrationStatus.REGISTERED,
        filingFrequency: params.filingFrequency || agency.defaultFrequency,
        effectiveDate: params.effectiveDate || new Date(),
        stateTaxAgency: agency.agencyName,
        notes: params.notes
      },
      create: {
        organizationId: params.organizationId,
        stateCode: state,
        registrationNumber: params.registrationNumber,
        status: RegistrationStatus.REGISTERED,
        filingFrequency: params.filingFrequency || agency.defaultFrequency,
        effectiveDate: params.effectiveDate || new Date(),
        stateTaxAgency: agency.agencyName,
        notes: params.notes
      }
    });

    return reg;
  }

  /**
   * Calculates filing frequency dynamically based on annual tax liability
   */
  public determineFilingFrequency(stateCode: string, annualTaxLiabilityCents: bigint): FilingFrequency {
    const state = stateCode.toUpperCase();
    const agency = STATE_TAX_AGENCIES[state];
    if (!agency) return FilingFrequency.QUARTERLY;

    if (annualTaxLiabilityCents >= agency.monthlyThresholdAnnualLiabilityCents) {
      return FilingFrequency.MONTHLY;
    }
    if (annualTaxLiabilityCents < BigInt(100000)) { // < $1,000/yr
      return FilingFrequency.ANNUALLY;
    }
    return FilingFrequency.QUARTERLY;
  }

  /**
   * Retrieves all active registrations for an organization
   */
  public async getRegistrations(organizationId: string) {
    return await prisma.salesTaxRegistration.findMany({
      where: { organizationId },
      orderBy: { stateCode: 'asc' }
    });
  }

  /**
   * Checks if an organization is registered in a specific state
   */
  public async isRegistered(organizationId: string, stateCode: string): Promise<boolean> {
    const reg = await prisma.salesTaxRegistration.findUnique({
      where: {
        organizationId_stateCode: {
          organizationId,
          stateCode: stateCode.toUpperCase()
        }
      }
    });

    return reg?.status === RegistrationStatus.REGISTERED;
  }
}
