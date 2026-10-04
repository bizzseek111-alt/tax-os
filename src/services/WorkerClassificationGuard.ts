import { WorkerClassification, WorkerType } from '../types/payrollTax';

export interface ClassificationAuditResult {
  workerId: string;
  workerName: string;
  currentDesignation: WorkerType;
  riskAssessment: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_INCONSISTENCY' | 'CRITICAL_DISPUTED';
  inconsistenciesIdentified: string[];
  supportingFacts: string[];
  applicableAuthorities: string[];
  mandatoryProfessionalEscalation: boolean;
  legalDisclaimer: string;
}

export class WorkerClassificationGuard {
  /**
   * Evaluates worker facts without ever casually rendering a binding legal conclusion.
   * Surfaces inconsistencies, cites authoritative legal standards, and escalates to CPAs/Attorneys.
   */
  static analyzeWorker(classification: WorkerClassification): ClassificationAuditResult {
    const inconsistencies: string[] = [];
    const supportingFacts: string[] = [];
    const facts = classification.facts;
    const isContractor = classification.currentDesignation === '1099_CONTRACTOR';

    // 1. Behavioral Control Analysis
    if (isContractor) {
      if (facts.behavioralControl.instructionsGivenLevel === 'HIGH') {
        inconsistencies.push(
          'Contractor receives extensive, detailed instructions regarding how, when, and where work must be executed (Characteristic of W-2 Employment under IRS Common Law Rule).'
        );
      }
      if (facts.behavioralControl.trainingProvidedByEmployer) {
        inconsistencies.push(
          'Employer provides ongoing operational training to the contractor, indicating behavioral control over methods.'
        );
      }
      if (facts.behavioralControl.evaluationSystemsControl) {
        inconsistencies.push(
          'Performance evaluation systems measure process adherence rather than purely end-product acceptance.'
        );
      }
    }

    // 2. Financial Control Analysis
    if (isContractor) {
      if (!facts.financialControl.significantInvestmentInTools) {
        inconsistencies.push(
          'Worker possesses no significant capital investment in professional tools/facilities; company provides core equipment.'
        );
      }
      if (!facts.financialControl.servicesAvailableToOpenMarket) {
        inconsistencies.push(
          'Worker is restricted from marketing similar services to the open marketplace (Non-compete / exclusivity constraint).'
        );
      }
      if (facts.financialControl.methodOfPayment === 'HOURLY_SALARY') {
        inconsistencies.push(
          'Worker is compensated via hourly/salary cadence rather than fixed-fee milestone disbursements.'
        );
      }
      if (!facts.financialControl.opportunityForProfitOrLoss) {
        inconsistencies.push(
          'Worker bears zero financial exposure or risk of loss from operational overhead.'
        );
      }
    }

    // 3. Type of Relationship Analysis
    if (isContractor) {
      if (facts.typeOfRelationship.employeeBenefitsProvided) {
        inconsistencies.push(
          'Contractor receives benefits typically reserved for employees (e.g., healthcare subsidies, paid leave, insurance).'
        );
      }
      if (facts.typeOfRelationship.permanencyOfRelationship === 'INDEFINITE') {
        inconsistencies.push(
          'Contract terms are continuous and indefinite rather than tied to discrete project deliverables.'
        );
      }
      if (facts.typeOfRelationship.servicesCoreToRegularBusiness) {
        inconsistencies.push(
          'Services rendered constitute the core operational product/service of the enterprise (Fails Prong B under California/New Jersey ABC Test).'
        );
      }
    }

    // Determine risk level based on weight of inconsistencies
    let riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK_INCONSISTENCY' | 'CRITICAL_DISPUTED' = 'LOW_RISK';
    let mandatoryProfessionalEscalation = false;

    if (inconsistencies.length >= 4) {
      riskLevel = 'CRITICAL_DISPUTED';
      mandatoryProfessionalEscalation = true;
    } else if (inconsistencies.length >= 2) {
      riskLevel = 'HIGH_RISK_INCONSISTENCY';
      mandatoryProfessionalEscalation = true;
    } else if (inconsistencies.length === 1) {
      riskLevel = 'MODERATE_RISK';
    } else {
      supportingFacts.push('Worker maintains independent business presence, sets own schedule, and provides own equipment.');
    }

    const authorities = [
      'IRS Rev. Rul. 87-41, 1987-1 C.B. 296 (20-Factor Common Law Right-of-Control Test)',
      'IRC § 3121(d)(2) (Statutory Definition of Employee)',
      'Department of Labor (DOL) 29 CFR Part 795 (Economic Reality Test)',
      'Restatement (Third) of Agency § 7.07'
    ];

    if (inconsistencies.some(i => i.includes('ABC Test'))) {
      authorities.push('Dynamex Operations West, Inc. v. Superior Court, 4 Cal. 5th 903 (Prong B ABC Standard)');
    }

    const legalDisclaimer = 
      'SAFEGUARD NOTICE: TaxOS AI identifies factual patterns and potential compliance exposure for review. ' +
      'TaxOS AI DOES NOT render legal advice, nor does it establish legal determinations of worker status. ' +
      'Material classification discrepancies must be reviewed by an Enrolled Agent, CPA, or Labor/Tax Attorney.';

    return {
      workerId: classification.workerId,
      workerName: classification.workerName,
      currentDesignation: classification.currentDesignation,
      riskAssessment: riskLevel,
      inconsistenciesIdentified: inconsistencies,
      supportingFacts,
      applicableAuthorities: authorities,
      mandatoryProfessionalEscalation,
      legalDisclaimer
    };
  }
}
