/**
 * Autonomous Tax OS — Worker Classification Risk Engine
 * 
 * Evaluates independent contractor (Form 1099-NEC) vs employee (Form W-2) status:
 * - IRS Common Law 3-Pillar Test (Behavioral, Financial, Type of Relationship)
 * - State Statutory ABC Tests (California AB 5 / Dynamex, Massachusetts MGL c.149 § 148B, New Jersey)
 * - Strict Invariant: Outputs 'POTENTIAL_RISK', NEVER unauthorized 'LEGAL CONCLUSION'
 * - Routes material misclassification risks to ReviewTask (CPA / Tax Attorney)
 */

import {
  WorkerClassificationRisk,
  WorkerClassificationStatus,
  WorkerClassificationFactSet,
  WorkerClassificationEvaluation
} from '../types';

export class WorkerClassificationEngine {
  /**
   * Evaluates worker facts against IRS common law and state ABC statutory standards.
   */
  public static evaluateWorker(facts: WorkerClassificationFactSet): WorkerClassificationEvaluation {
    const riskFactors: string[] = [];
    let commonLawRiskScore = 0; // 0 to 100, where higher means higher risk of misclassification (should be employee)

    // 1. Behavioral Control Analysis
    if (!facts.setsOwnHours) {
      riskFactors.push('Hiring entity dictates working hours and schedule');
      commonLawRiskScore += 20;
    }
    if (!facts.usesOwnEquipment) {
      riskFactors.push('Hiring entity provides tools, computer, and equipment');
      commonLawRiskScore += 15;
    }

    // 2. Financial Control Analysis
    if (facts.paidHourlyOrSalary) {
      riskFactors.push('Compensated on time basis (hourly/salary) rather than project milestone');
      commonLawRiskScore += 20;
    }
    if (!facts.worksForOtherClients) {
      riskFactors.push('Exclusively serves single hiring entity (economic dependence)');
      commonLawRiskScore += 20;
    }
    if (!facts.canRealizeProfitOrLoss) {
      riskFactors.push('No risk of financial loss or entrepreneurial profit');
      commonLawRiskScore += 15;
    }

    // 3. Type of Relationship / Business Integration
    if (facts.performsCoreBusinessFunction) {
      riskFactors.push('Performs primary, core service of the hiring entity (vital to core product)');
      commonLawRiskScore += 25;
    }
    if (facts.receivesEmployeeBenefits) {
      riskFactors.push('Receives employee-type benefits (health insurance, PTO, stipends)');
      commonLawRiskScore += 20;
    }
    if (!facts.hasIndependentBusinessEntity) {
      riskFactors.push('No registered business entity (LLC, S-Corp) or separate business EIN');
      commonLawRiskScore += 15;
    }

    // 4. State ABC Test Evaluation
    // Prong A: Control (Free from control)
    const prongAPassed = facts.setsOwnHours && facts.usesOwnEquipment;
    // Prong B: Outside Core Business (Work performed outside usual course of hiring entity's business)
    const prongBPassed = !facts.performsCoreBusinessFunction;
    // Prong C: Independent Trade (Customarily engaged in independently established trade/entity)
    const prongCPassed = facts.worksForOtherClients && facts.hasIndependentBusinessEntity;

    const abcTestPassed = prongAPassed && prongBPassed && prongCPassed;

    if (!abcTestPassed) {
      if (!prongBPassed) {
        riskFactors.push(`STATE ABC TEST FAILED (Prong B): Worker performs core business services in ${facts.stateCode}`);
      }
      if (!prongAPassed) {
        riskFactors.push(`STATE ABC TEST FAILED (Prong A): Hiring entity exercises behavioral control in ${facts.stateCode}`);
      }
      if (!prongCPassed) {
        riskFactors.push(`STATE ABC TEST FAILED (Prong C): Worker lacks independently established business in ${facts.stateCode}`);
      }
    }

    // Determine Risk Level
    let riskLevel: WorkerClassificationRisk;
    let recommendation: 'MAINTAIN_CONTRACTOR' | 'POTENTIAL_RISK_REVIEW_REQUIRED' | 'HIGH_RISK_RECLASSIFICATION_RECOMMENDED';

    const isAbcState = ['US-CA', 'CA', 'US-MA', 'MA', 'US-NJ', 'NJ'].includes(facts.stateCode);

    if (isAbcState && !abcTestPassed && facts.performsCoreBusinessFunction) {
      riskLevel = WorkerClassificationRisk.CRITICAL;
      recommendation = 'HIGH_RISK_RECLASSIFICATION_RECOMMENDED';
    } else if (commonLawRiskScore >= 50 || !abcTestPassed) {
      riskLevel = WorkerClassificationRisk.HIGH;
      recommendation = 'HIGH_RISK_RECLASSIFICATION_RECOMMENDED';
    } else if (commonLawRiskScore >= 25) {
      riskLevel = WorkerClassificationRisk.MEDIUM;
      recommendation = 'POTENTIAL_RISK_REVIEW_REQUIRED';
    } else {
      riskLevel = WorkerClassificationRisk.LOW;
      recommendation = 'MAINTAIN_CONTRACTOR';
    }

    const memo = `Worker Classification Risk Evaluation for ${facts.workerName}: ` +
      `Risk Level is ${riskLevel}. Common law risk score: ${commonLawRiskScore}/100. ` +
      `State ABC Test result for ${facts.stateCode}: ${abcTestPassed ? 'PASSED' : 'FAILED'}. ` +
      `Notice: This output represents an automated risk evaluation, not a binding legal opinion. ` +
      `Review by a credentialed CPA or employment attorney is advised before taking action.`;

    return {
      workerId: facts.workerId,
      riskLevel,
      status: WorkerClassificationStatus.OPEN,
      primaryRiskFactors: riskFactors,
      commonLawScore: commonLawRiskScore,
      abcTestPassed,
      recommendation,
      memo
    };
  }
}
