/**
 * Autonomous Tax OS — Tax Case Supervisor & Domain Orchestrator
 * High-level orchestration engine governing state machine gates and hierarchical delegation.
 */

import {
  AgentResult,
  AgentPermissionGrant,
  ConsensusProposal,
  AdversarialChallenge,
  ConsensusVerdict
} from './types';
import { AgentPermissionController } from './PermissionController';
import { ModelRouter } from './ModelRouter';
import { ConsensusEngine } from './ConsensusEngine';
import { KillSwitchManager } from './KillSwitchManager';

export abstract class DomainSupervisor {
  constructor(
    public readonly domainName: string,
    public readonly authorizedAgents: string[]
  ) {}

  public abstract executePhase(caseId: string, grant: AgentPermissionGrant): Promise<AgentResult<any>>;

  protected checkKillSwitch(jurisdiction?: string): void {
    KillSwitchManager.assertNotKilled(this.domainName, jurisdiction);
  }
}

export class TaxCaseSupervisor {
  private static domainSupervisors: Map<string, DomainSupervisor> = new Map();

  public static registerSupervisor(supervisor: DomainSupervisor): void {
    this.domainSupervisors.set(supervisor.domainName, supervisor);
  }

  /**
   * Dispatches a phase execution to the authorized domain supervisor.
   */
  public static async dispatchDomain(
    domainName: string,
    caseId: string,
    grant: AgentPermissionGrant
  ): Promise<AgentResult<any>> {
    // 1. Assert platform safety kill switch
    KillSwitchManager.assertNotKilled(domainName, grant.allowedJurisdictions[0]);

    // 2. Locate supervisor
    const supervisor = this.domainSupervisors.get(domainName);
    if (!supervisor) {
      throw new Error(`Domain supervisor '${domainName}' is not registered with the TaxCaseSupervisor.`);
    }

    // 3. Execute domain phase
    const startTime = Date.now();
    const result = await supervisor.executePhase(caseId, grant);
    result.auditMetadata.executionDurationMs = Date.now() - startTime;

    return result;
  }

  /**
   * Executes a full consensus loop between a proposing agent and the IRS Challenger.
   */
  public static runConsensus(
    proposal: ConsensusProposal,
    challenge: AdversarialChallenge | null,
    hasProof: boolean,
    hasCitation: boolean
  ): ConsensusVerdict {
    // Assert kill switch on the proposing agent
    KillSwitchManager.assertNotKilled(proposal.proposedByAgent);

    return ConsensusEngine.arbitrate(proposal, challenge, hasProof, hasCitation);
  }
}
