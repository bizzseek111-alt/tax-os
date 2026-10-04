/**
 * Autonomous Tax OS — Granular Emergency Kill Switch Manager
 * Freezes specific states, rules, models, or agents instantly without taking the platform offline.
 */

import { KillSwitchRule, KillSwitchScope } from './types';

export class KillSwitchActiveError extends Error {
  constructor(public rule: KillSwitchRule) {
    super(`[EMERGENCY KILL SWITCH ACTIVE]: Operation halted on scope '${rule.scope}' for target '${rule.targetIdentifier}'. Reason: ${rule.reason}`);
    this.name = 'KillSwitchActiveError';
  }
}

export class KillSwitchManager {
  private static activeRules: Map<string, KillSwitchRule> = new Map();

  /**
   * Trips an emergency kill switch.
   */
  public static tripKillSwitch(
    scope: KillSwitchScope,
    targetIdentifier: string,
    reason: string,
    trippedBy: string
  ): KillSwitchRule {
    const id = `kill_${scope}_${targetIdentifier}_${Date.now()}`;
    const rule: KillSwitchRule = {
      id,
      scope,
      targetIdentifier,
      active: true,
      reason,
      trippedBy,
      trippedAt: new Date().toISOString()
    };

    const key = `${scope}:${targetIdentifier}`;
    this.activeRules.set(key, rule);
    console.error(`🚨 [KILL SWITCH ACTIVATED]: Scope '${scope}' on '${targetIdentifier}'. Reason: ${reason} (by ${trippedBy})`);
    return rule;
  }

  /**
   * Resets / clears a kill switch.
   */
  public static clearKillSwitch(scope: KillSwitchScope, targetIdentifier: string): boolean {
    const key = `${scope}:${targetIdentifier}`;
    const existed = this.activeRules.delete(key);
    if (existed) {
      console.log(`✅ [KILL SWITCH CLEARED]: Restored scope '${scope}' on '${targetIdentifier}'.`);
    }
    return existed;
  }

  /**
   * Asserts that an operation is permitted under active kill switches.
   */
  public static assertNotKilled(
    agentName?: string,
    jurisdiction?: string,
    modelName?: string,
    ruleId?: string
  ): void {
    // Check Global Platform Kill Switch
    if (this.activeRules.has('GLOBAL_PLATFORM:*')) {
      throw new KillSwitchActiveError(this.activeRules.get('GLOBAL_PLATFORM:*')!);
    }

    // Check Specific Agent
    if (agentName && this.activeRules.has(`SPECIFIC_AGENT:${agentName}`)) {
      throw new KillSwitchActiveError(this.activeRules.get(`SPECIFIC_AGENT:${agentName}`)!);
    }

    // Check Specific Jurisdiction (e.g., California e-filing freeze)
    if (jurisdiction && this.activeRules.has(`SPECIFIC_JURISDICTION:${jurisdiction}`)) {
      throw new KillSwitchActiveError(this.activeRules.get(`SPECIFIC_JURISDICTION:${jurisdiction}`)!);
    }

    // Check Specific Model
    if (modelName && this.activeRules.has(`SPECIFIC_MODEL:${modelName}`)) {
      throw new KillSwitchActiveError(this.activeRules.get(`SPECIFIC_MODEL:${modelName}`)!);
    }

    // Check Specific Tax Rule
    if (ruleId && this.activeRules.has(`SPECIFIC_TAX_RULE:${ruleId}`)) {
      throw new KillSwitchActiveError(this.activeRules.get(`SPECIFIC_TAX_RULE:${ruleId}`)!);
    }
  }

  public static listActiveRules(): KillSwitchRule[] {
    return Array.from(this.activeRules.values());
  }

  public static resetAll(): void {
    this.activeRules.clear();
  }
}
