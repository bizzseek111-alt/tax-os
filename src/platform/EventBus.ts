/**
 * Autonomous Tax OS — Platform Event Bus
 * Workstream 1: Distributed event system with audit tracking and subscriber error boundaries.
 */

import { AuditLedger } from './AuditLedger';

export interface TaxPlatformEvent<T = any> {
  id: string;
  type: string;
  timestamp: string;
  sourceAgent?: string;
  tenantId: string;
  caseId?: string;
  payload: T;
}

export type EventHandler<T = any> = (event: TaxPlatformEvent<T>) => Promise<void> | void;

export class PlatformEventBus {
  private static subscribers: Map<string, EventHandler[]> = new Map();

  public static subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    const list = this.subscribers.get(eventType) || [];
    list.push(handler);
    this.subscribers.set(eventType, list);

    return () => {
      const current = this.subscribers.get(eventType) || [];
      this.subscribers.set(eventType, current.filter(h => h !== handler));
    };
  }

  public static async publish<T>(
    eventType: string,
    payload: T,
    tenantId: string,
    caseId?: string,
    sourceAgent = 'SYSTEM'
  ): Promise<TaxPlatformEvent<T>> {
    const event: TaxPlatformEvent<T> = {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      sourceAgent,
      tenantId,
      caseId,
      payload
    };

    // Record immutable audit entry for platform events
    AuditLedger.record(
      sourceAgent,
      'AGENT_RUNTIME',
      `EVENT_PUBLISHED:${eventType}`,
      event.id,
      'PLATFORM_EVENT',
      { caseId, tenantId, payloadKeys: Object.keys(payload || {}) }
    );

    const handlers = this.subscribers.get(eventType) || [];
    const wildcards = this.subscribers.get('*') || [];
    const allHandlers = [...handlers, ...wildcards];

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (err: any) {
        console.error(`[EventBus] Error executing subscriber for ${eventType}:`, err?.message || err);
      }
    }

    return event;
  }

  public static clearSubscribersForTesting(): void {
    this.subscribers.clear();
  }
}
