/**
 * Autonomous Tax OS — Agent Circuit Breaker & Resiliency Controller
 * 
 * Protects runtime against runaway cascades, failing external APIs, and model downtime.
 * Integrates with KillSwitchManager to provide instant operational circuit opening.
 */

import { KillSwitchManager } from '../../agent-os/KillSwitchManager';
import { AgentType } from './types';

export interface CircuitState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export class AgentCircuitBreaker {
  private static readonly MAX_FAILURES = 3;
  private static readonly RESET_TIMEOUT_MS = 30000; // 30 seconds
  private static readonly circuits: Map<string, CircuitState> = new Map();

  /**
   * Asserts that execution is permitted through both KillSwitch and CircuitBreaker.
   */
  public static assertAllowed(params: {
    agentType: AgentType;
    jurisdiction?: string;
    modelProvider?: string;
    ruleId?: string;
  }): void {
    // 1. Check KillSwitchManager
    KillSwitchManager.assertNotKilled(
      params.agentType,
      params.jurisdiction,
      params.modelProvider,
      params.ruleId
    );

    // 2. Check Circuit Breaker
    const key = `circuit:${params.agentType}`;
    const circuit = this.circuits.get(key);
    if (circuit && circuit.isOpen) {
      const now = Date.now();
      if (now - circuit.lastFailureTime > this.RESET_TIMEOUT_MS) {
        // Half-open attempt: reset circuit
        circuit.isOpen = false;
        circuit.failureCount = 0;
      } else {
        throw new Error(
          `CIRCUIT_BREAKER_OPEN: Agent '${params.agentType}' is temporarily halted due to consecutive failures. Cooling down for ${Math.round((this.RESET_TIMEOUT_MS - (now - circuit.lastFailureTime)) / 1000)}s`
        );
      }
    }
  }

  /**
   * Returns true if execution is permitted, false if tripped or killed.
   */
  public static isExecutionAllowed(agentType: AgentType): boolean {
    try {
      this.assertAllowed({ agentType });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Records a successful execution (resets failure count).
   */
  public static recordSuccess(agentType: AgentType): void {
    const key = `circuit:${agentType}`;
    const circuit = this.circuits.get(key);
    if (circuit) {
      circuit.failureCount = 0;
      circuit.isOpen = false;
    }
  }

  /**
   * Records a failure and trips the circuit if threshold exceeded.
   */
  public static recordFailure(agentType: AgentType, error: string): void {
    const key = `circuit:${agentType}`;
    let circuit = this.circuits.get(key);
    if (!circuit) {
      circuit = { failureCount: 0, lastFailureTime: 0, isOpen: false };
      this.circuits.set(key, circuit);
    }

    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failureCount >= this.MAX_FAILURES) {
      circuit.isOpen = true;
      console.error(
        `🚨 [CIRCUIT BREAKER TRIPPED]: Agent '${agentType}' opened after ${circuit.failureCount} failures. Error: ${error}`
      );
    }
  }

  /**
   * Manually resets circuit breaker for testing or manual recovery.
   */
  public static reset(agentType?: AgentType): void {
    if (agentType) {
      this.circuits.delete(`circuit:${agentType}`);
    } else {
      this.circuits.clear();
    }
  }

  public static resetAll(): void {
    this.circuits.clear();
  }
}
