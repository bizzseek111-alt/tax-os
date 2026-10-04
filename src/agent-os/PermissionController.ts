/**
 * Autonomous Tax OS — Agent Permission Controller
 * Cryptographically enforces least-privilege security boundaries and PII protection for agents.
 */

import { AgentPermissionGrant } from './types';

export class PermissionViolationError extends Error {
  constructor(public code: string, message: string) {
    super(`[PERMISSION VIOLATION - ${code}]: ${message}`);
    this.name = 'PermissionViolationError';
  }
}

export class AgentPermissionController {
  /**
   * Validates tool invocation against agent's authorized tool whitelist.
   */
  public static assertToolAllowed(grant: AgentPermissionGrant, toolName: string): void {
    if (!grant.allowedTools.includes(toolName) && !grant.allowedTools.includes('*')) {
      throw new PermissionViolationError(
        'TOOL_UNAUTHORIZED',
        `Agent '${grant.agentName}' is not authorized to invoke tool '${toolName}'. Whitelist: [${grant.allowedTools.join(', ')}]`
      );
    }
  }

  /**
   * Validates target jurisdiction against agent's allowed jurisdictions.
   */
  public static assertJurisdictionAllowed(grant: AgentPermissionGrant, jurisdiction: string): void {
    if (!grant.allowedJurisdictions.includes(jurisdiction) && !grant.allowedJurisdictions.includes('*')) {
      throw new PermissionViolationError(
        'JURISDICTION_UNAUTHORIZED',
        `Agent '${grant.agentName}' cannot operate on jurisdiction '${jurisdiction}'. Scope: [${grant.allowedJurisdictions.join(', ')}]`
      );
    }
  }

  /**
   * Validates write access path against agent's allowed mutations.
   */
  public static assertWritePathAllowed(grant: AgentPermissionGrant, writePath: string): void {
    const isAllowed = grant.allowedWritePaths.some(allowed => 
      allowed === '*' || writePath === allowed || writePath.startsWith(`${allowed}.`)
    );

    if (!isAllowed) {
      throw new PermissionViolationError(
        'WRITE_PATH_FORBIDDEN',
        `Agent '${grant.agentName}' attempted unauthorized write to path '${writePath}'. Allowed: [${grant.allowedWritePaths.join(', ')}]`
      );
    }
  }

  /**
   * Filters payload to ensure raw SSNs and bank numbers are scrubbed if clearance is missing.
   */
  public static sanitizeDataForAgent(grant: AgentPermissionGrant, payload: any): any {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const cloned = JSON.parse(JSON.stringify(payload));

    const maskFields = (obj: any) => {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          maskFields(val);
        } else if (typeof val === 'string') {
          // If agent cannot access raw SSN, mask any SSN field
          if (!grant.canAccessRawSsn && (key.toLowerCase().includes('ssn') || key.toLowerCase().includes('tin'))) {
            obj[key] = val.replace(/\d{3}-\d{2}-\d{4}/g, '***-**-****');
          }
          // If agent cannot access raw bank account numbers, mask
          if (!grant.canAccessRawBankNumbers && (key.toLowerCase().includes('accountnumber') || key.toLowerCase().includes('routing'))) {
            obj[key] = `***${val.slice(-4)}`;
          }
        }
      }
    };

    maskFields(cloned);
    return cloned;
  }
}
