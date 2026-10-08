/**
 * Autonomous Tax OS — Task Planner Agent
 * 
 * Inspects TaxCase facts, obligations, and evidence to build a dynamically
 * scheduled Directed Acyclic Graph (DAG) of agent tasks:
 * 
 * Phase 1: Intake & Evidence Ingestion (Intake, Prior Return, Missing Document)
 * Phase 2: Transaction Intelligence (Merchant, Classification, Receipt Match, Spend Investigate)
 * Phase 3: Position Generation (Business Purpose, Deduction Hunter, Credit Hunter, Asset, Mileage, Home Office)
 * Phase 4: Adversarial Review & Consensus (IRS Challenger, Evidence Examiner, Confidence, Consensus)
 * Phase 5: Deterministic Computation (Federal Tax, State Modules, Conformity, Allocation)
 * Phase 6: Reconciliation & Audit Brief (Reconciliation, Anomaly, Professional Brief)
 */

import { BaseAgent } from './agents/base';
import { AgentExecutionContext } from './context';
import { AgentResult, AgentType, WorkflowTaskNode } from './types';

export interface TaskPlannerInput {
  taxCaseId: string;
  taxYear: number;
  hasScheduleC: boolean;
  hasInvestments: boolean;
  jurisdictions: string[]; // e.g. ['US-FED', 'US-CA']
}

export interface TaskPlannerResult {
  taxCaseId: string;
  totalTasks: number;
  dagPhases: Array<{
    phaseNumber: number;
    phaseName: string;
    nodes: WorkflowTaskNode[];
  }>;
  executionPlanSummary: string;
}

export class TaskPlanner extends BaseAgent<TaskPlannerInput, TaskPlannerResult> {
  public readonly agentType = AgentType.TASK_PLANNER;

  protected async run(
    ctx: AgentExecutionContext,
    input: TaskPlannerInput
  ): Promise<AgentResult<TaskPlannerResult>> {
    const dag = await this.invokeTool(
      ctx,
      'buildTaskGraph',
      { taxCaseId: input.taxCaseId, jurisdictions: input.jurisdictions },
      async () => {
        const phases: Array<{ phaseNumber: number; phaseName: string; nodes: WorkflowTaskNode[] }> = [];

        // Phase 1: Intake & Documents
        phases.push({
          phaseNumber: 1,
          phaseName: 'INTAKE_AND_DOCUMENTS',
          nodes: [
            { taskId: 'task-intake', phase: 1, phaseName: 'INTAKE', agentType: AgentType.INTAKE_AGENT, dependencies: [], isParallel: true },
            { taskId: 'task-prior', phase: 1, phaseName: 'PRIOR_RETURN', agentType: AgentType.PRIOR_RETURN_AGENT, dependencies: [], isParallel: true },
            { taskId: 'task-missing-docs', phase: 1, phaseName: 'MISSING_DOCS', agentType: AgentType.MISSING_DOCUMENT_AGENT, dependencies: ['task-intake'], isParallel: false }
          ]
        });

        // Phase 2: Transaction Intelligence (if Schedule C)
        if (input.hasScheduleC) {
          phases.push({
            phaseNumber: 2,
            phaseName: 'TRANSACTION_INTELLIGENCE',
            nodes: [
              { taskId: 'task-merchant', phase: 2, phaseName: 'MERCHANT', agentType: AgentType.MERCHANT_INTELLIGENCE_AGENT, dependencies: ['task-missing-docs'], isParallel: true },
              { taskId: 'task-tx-class', phase: 2, phaseName: 'TX_CLASS', agentType: AgentType.TRANSACTION_CLASSIFICATION_AGENT, dependencies: ['task-merchant'], isParallel: false },
              { taskId: 'task-receipt-match', phase: 2, phaseName: 'RECEIPT_MATCH', agentType: AgentType.RECEIPT_MATCHING_AGENT, dependencies: ['task-tx-class'], isParallel: true }
            ]
          });
        }

        // Phase 3: Position Discovery
        const phase3Nodes: WorkflowTaskNode[] = [
          { taskId: 'task-deductions', phase: 3, phaseName: 'DEDUCTION_HUNT', agentType: AgentType.DEDUCTION_HUNTER, dependencies: ['task-missing-docs'], isParallel: true },
          { taskId: 'task-credits', phase: 3, phaseName: 'CREDIT_HUNT', agentType: AgentType.CREDIT_HUNTER, dependencies: ['task-missing-docs'], isParallel: true }
        ];
        if (input.hasScheduleC) {
          phase3Nodes.push(
            { taskId: 'task-business-purpose', phase: 3, phaseName: 'BIZ_PURPOSE', agentType: AgentType.BUSINESS_PURPOSE_AGENT, dependencies: ['task-deductions'], isParallel: true },
            { taskId: 'task-home-office', phase: 3, phaseName: 'HOME_OFFICE', agentType: AgentType.HOME_OFFICE_AGENT, dependencies: ['task-deductions'], isParallel: true },
            { taskId: 'task-mileage', phase: 3, phaseName: 'MILEAGE', agentType: AgentType.VEHICLE_MILEAGE_AGENT, dependencies: ['task-deductions'], isParallel: true }
          );
        }
        phases.push({
          phaseNumber: 3,
          phaseName: 'POSITION_DISCOVERY',
          nodes: phase3Nodes
        });

        // Phase 4: Adversarial Review & Consensus
        phases.push({
          phaseNumber: 4,
          phaseName: 'ADVERSARIAL_REVIEW_AND_CONSENSUS',
          nodes: [
            { taskId: 'task-evidence-exam', phase: 4, phaseName: 'EVIDENCE_EXAM', agentType: AgentType.EVIDENCE_EXAMINER, dependencies: ['task-deductions'], isParallel: true },
            { taskId: 'task-irs-challenge', phase: 4, phaseName: 'IRS_CHALLENGE', agentType: AgentType.IRS_CHALLENGER_AGENT, dependencies: ['task-deductions'], isParallel: true },
            { taskId: 'task-confidence', phase: 4, phaseName: 'CONFIDENCE', agentType: AgentType.CONFIDENCE_ENGINE, dependencies: ['task-evidence-exam', 'task-irs-challenge'], isParallel: false },
            { taskId: 'task-consensus', phase: 4, phaseName: 'CONSENSUS', agentType: AgentType.CONSENSUS_ENGINE, dependencies: ['task-confidence'], isParallel: false }
          ]
        });

        // Phase 5: Deterministic Computation
        const phase5Nodes: WorkflowTaskNode[] = [
          { taskId: 'task-fed-calc', phase: 5, phaseName: 'FED_CALC', agentType: AgentType.FEDERAL_TAX_AGENT, dependencies: ['task-consensus'], isParallel: false }
        ];
        for (const juris of input.jurisdictions) {
          if (juris === 'US-CA') {
            phase5Nodes.push({ taskId: 'task-ca-calc', phase: 5, phaseName: 'CA_CALC', agentType: AgentType.CALIFORNIA_TAX_AGENT, dependencies: ['task-fed-calc'], isParallel: true, jurisdiction: 'US-CA' });
          } else if (juris === 'US-NY') {
            phase5Nodes.push({ taskId: 'task-ny-calc', phase: 5, phaseName: 'NY_CALC', agentType: AgentType.NEW_YORK_TAX_AGENT, dependencies: ['task-fed-calc'], isParallel: true, jurisdiction: 'US-NY' });
          } else if (juris === 'US-NJ') {
            phase5Nodes.push({ taskId: 'task-nj-calc', phase: 5, phaseName: 'NJ_CALC', agentType: AgentType.NEW_JERSEY_TAX_AGENT, dependencies: ['task-fed-calc'], isParallel: true, jurisdiction: 'US-NJ' });
          } else if (juris === 'US-IL') {
            phase5Nodes.push({ taskId: 'task-il-calc', phase: 5, phaseName: 'IL_CALC', agentType: AgentType.ILLINOIS_TAX_AGENT, dependencies: ['task-fed-calc'], isParallel: true, jurisdiction: 'US-IL' });
          } else if (juris === 'US-MA') {
            phase5Nodes.push({ taskId: 'task-ma-calc', phase: 5, phaseName: 'MA_CALC', agentType: AgentType.MASSACHUSETTS_TAX_AGENT, dependencies: ['task-fed-calc'], isParallel: true, jurisdiction: 'US-MA' });
          }
        }
        phases.push({
          phaseNumber: 5,
          phaseName: 'DETERMINISTIC_COMPUTATION',
          nodes: phase5Nodes
        });

        // Phase 6: Professional Review & Audit Brief
        phases.push({
          phaseNumber: 6,
          phaseName: 'AUDIT_BRIEF_AND_SIGNOFF',
          nodes: [
            { taskId: 'task-reconciliation', phase: 6, phaseName: 'RECONCILIATION', agentType: AgentType.RECONCILIATION_AGENT, dependencies: ['task-fed-calc'], isParallel: true },
            { taskId: 'task-anomaly', phase: 6, phaseName: 'ANOMALY', agentType: AgentType.ANOMALY_AGENT, dependencies: ['task-fed-calc'], isParallel: true },
            { taskId: 'task-brief', phase: 6, phaseName: 'PRO_BRIEF', agentType: AgentType.PROFESSIONAL_REVIEW_BRIEF_AGENT, dependencies: ['task-reconciliation', 'task-anomaly'], isParallel: false }
          ]
        });

        return phases;
      }
    );

    const totalTasks = dag.reduce((sum, p) => sum + p.nodes.length, 0);

    return this.createSuccessResult(
      ctx,
      {
        taxCaseId: input.taxCaseId,
        totalTasks,
        dagPhases: dag,
        executionPlanSummary: `Scheduled ${totalTasks} tasks across ${dag.length} deterministic workflow phases for case ${input.taxCaseId}.`
      },
      {
        confidence: 1.0,
        recommendedNextAction: 'SUPERVISOR_DISPATCH_DAG'
      }
    );
  }
}
