import { TaxRegistrationRecord, RegistrationType } from '../types/complianceOperations';
import { TaxDomain } from '../types/common';

export class TaxRegistrationsEngine {
  /**
   * Pre-loads the business registration state records across Sales, Payroll, and Corporate nexus
   */
  static getBusinessRegistrations(): TaxRegistrationRecord[] {
    return [
      // 1. California Sales Tax Permit
      {
        id: 'reg-ca-sales',
        domain: 'SALES_USE_TAX',
        registrationType: 'SALES_TAX_PERMIT',
        jurisdictionId: 'CA-CDTFA',
        stateCode: 'CA',
        agencyName: 'California Dept of Tax & Fee Administration (CDTFA)',
        accountNumberMasked: 'SR-KHE-***-8419',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2026-03-15',
        status: 'ACTIVE',
        filingFrequency: 'QUARTERLY',
        portalLoginUrl: 'https://onlineservices.cdtfa.ca.gov',
        associatedNexusTriggerId: 'nexus-ca',
        notes: 'Physical nexus established via San Francisco office.'
      },
      // 2. California EDD (Payroll Withholding & Unemployment)
      {
        id: 'reg-ca-payroll',
        domain: 'PAYROLL_TAX',
        registrationType: 'STATE_UNEMPLOYMENT_SUTA_ACCOUNT',
        jurisdictionId: 'CA-EDD',
        stateCode: 'CA',
        agencyName: 'California Employment Development Department (EDD)',
        accountNumberMasked: '942-****-3',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2025-06-01',
        status: 'ACTIVE',
        filingFrequency: 'QUARTERLY',
        portalLoginUrl: 'https://edd.ca.gov/Payroll_Taxes',
        notes: 'SUTA Rate assigned: 2.7% • Wage base: $7,000'
      },
      // 3. New York Sales Tax Certificate of Authority
      {
        id: 'reg-ny-sales',
        domain: 'SALES_USE_TAX',
        registrationType: 'SALES_TAX_PERMIT',
        jurisdictionId: 'NY-DTF',
        stateCode: 'NY',
        agencyName: 'NYS Dept of Taxation & Finance',
        accountNumberMasked: 'NY-COA-****-9124',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2027-02-10',
        status: 'ACTIVE',
        filingFrequency: 'QUARTERLY',
        portalLoginUrl: 'https://www.tax.ny.gov/online',
        associatedNexusTriggerId: 'nexus-ny',
        notes: 'Economic nexus breached in trailing 12 months.'
      },
      // 4. New York State Employer Withholding & UI Account
      {
        id: 'reg-ny-payroll',
        domain: 'PAYROLL_TAX',
        registrationType: 'STATE_WITHHOLDING_ACCOUNT',
        jurisdictionId: 'NY-DTF',
        stateCode: 'NY',
        agencyName: 'New York Department of Labor & Tax',
        accountNumberMasked: 'NY-WTH-****-4412',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2026-01-15',
        status: 'ACTIVE',
        filingFrequency: 'QUARTERLY',
        portalLoginUrl: 'https://www.tax.ny.gov',
        notes: 'Remote employee David Miller residing in NY.'
      },
      // 5. Washington DOR Sales & Business Tax Registration
      {
        id: 'reg-wa-sales',
        domain: 'SALES_USE_TAX',
        registrationType: 'SALES_TAX_PERMIT',
        jurisdictionId: 'WA-DOR',
        stateCode: 'WA',
        agencyName: 'Washington Department of Revenue',
        accountNumberMasked: 'UBI-604-***-812',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2027-01-20',
        status: 'ACTIVE',
        filingFrequency: 'MONTHLY',
        portalLoginUrl: 'https://secure.dor.wa.gov',
        associatedNexusTriggerId: 'nexus-wa',
        notes: 'SaaS digital automated services crossed $100k threshold.'
      },
      // 6. Texas Pending Nexus Watchlist Registration
      {
        id: 'reg-tx-pending',
        domain: 'SALES_USE_TAX',
        registrationType: 'SALES_TAX_PERMIT',
        jurisdictionId: 'TX-COMPTROLLER',
        stateCode: 'TX',
        agencyName: 'Texas Comptroller of Public Accounts',
        accountNumberMasked: 'PENDING_APPLICATION',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2027-04-01',
        status: 'ACTION_REQUIRED',
        filingFrequency: 'OCCASIONAL',
        portalLoginUrl: 'https://mycpa.cpa.state.tx.us',
        associatedNexusTriggerId: 'nexus-tx',
        notes: 'Approaching $500,000 threshold (at 88%). Pre-registration recommended.'
      },
      // 7. Delaware SOS Incorporation Good Standing
      {
        id: 'reg-de-sos',
        domain: 'INCOME_TAX',
        registrationType: 'FOREIGN_QUALIFICATION_SOS',
        jurisdictionId: 'DE-SOS',
        stateCode: 'DE',
        agencyName: 'Delaware Division of Corporations',
        accountNumberMasked: 'DE-FILE-7491823',
        legalEntityName: 'Apex Dynamics, Inc.',
        effectiveDate: '2024-01-10',
        renewalDate: '2028-03-01',
        status: 'ACTIVE',
        filingFrequency: 'ANNUAL',
        portalLoginUrl: 'https://corp.delaware.gov',
        notes: 'Domestic entity in good standing.'
      }
    ];
  }

  /**
   * Evaluates if a physical or economic fact requires a new state registration
   */
  static evaluateRegistrationMandate(params: {
    eventType: 'REMOTE_EMPLOYEE_HIRED' | 'ECONOMIC_NEXUS_BREACHED' | 'INVENTORY_STORED';
    stateCode: string;
    existingRegistrations: TaxRegistrationRecord[];
  }): {
    requiresSalesPermit: boolean;
    requiresWithholdingAccount: boolean;
    requiresSutaAccount: boolean;
    requiresForeignQualification: boolean;
    actionSummary: string;
  } {
    const hasSales = params.existingRegistrations.some(
      r => r.stateCode === params.stateCode && r.registrationType === 'SALES_TAX_PERMIT'
    );
    const hasWth = params.existingRegistrations.some(
      r => r.stateCode === params.stateCode && r.registrationType === 'STATE_WITHHOLDING_ACCOUNT'
    );
    const hasSuta = params.existingRegistrations.some(
      r => r.stateCode === params.stateCode && r.registrationType === 'STATE_UNEMPLOYMENT_SUTA_ACCOUNT'
    );
    const hasForeignQual = params.existingRegistrations.some(
      r => r.stateCode === params.stateCode && r.registrationType === 'FOREIGN_QUALIFICATION_SOS'
    );

    let reqSales = false;
    let reqWth = false;
    let reqSuta = false;
    let reqQual = false;
    let summary = '';

    if (params.eventType === 'REMOTE_EMPLOYEE_HIRED') {
      reqWth = !hasWth;
      reqSuta = !hasSuta;
      reqQual = !hasForeignQual;
      summary = `Hiring an employee in ${params.stateCode} triggers physical presence nexus: Mandatory State Income Tax Withholding, State Unemployment (SUTA) account, and Secretary of State Foreign Qualification.`;
    } else if (params.eventType === 'ECONOMIC_NEXUS_BREACHED') {
      reqSales = !hasSales;
      summary = `Economic nexus threshold reached in ${params.stateCode}: Mandatory Sales Tax Permit registration before first statutory remittance cycle.`;
    }

    return {
      requiresSalesPermit: reqSales,
      requiresWithholdingAccount: reqWth,
      requiresSutaAccount: reqSuta,
      requiresForeignQualification: reqQual,
      actionSummary: summary
    };
  }
}
