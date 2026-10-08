/**
 * Autonomous TaxOS — Phase 10 Security, Operations & Launch Governance Router
 * 
 * Exposes endpoints for:
 * - Launch Readiness Scorecard
 * - Operational Kill Switches & Emergency Rule Rollback
 * - Scoped Feature Flags & Private Beta Gating
 * - Statutory Data Retention & Controlled Deletion
 * - Disaster Recovery & Restore Verification Drills
 * - PII Masking & Sanitization
 */

import http from 'http';
import { URL } from 'url';
import { AuthContext } from '../services/auth';
import {
  LaunchReadinessService,
  KillSwitchService,
  FeatureFlagService,
  DataRetentionService,
  DisasterRecoveryService,
  PiiRedactionService
} from '../services/security';
import { KillSwitchTargetType } from '@prisma/client';

function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(
    JSON.stringify(data, (_key, value) => {
      if (typeof value === 'bigint') return value.toString();
      return value;
    })
  );
}

async function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

export async function handleSecurityApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  auth?: AuthContext | null
): Promise<boolean> {
  const method = req.method || 'GET';
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (method === 'OPTIONS') {
    sendJson(res, 204, {});
    return true;
  }

  // 1. GET /api/v1/security/scorecard
  if (method === 'GET' && pathname === '/api/v1/security/scorecard') {
    const report = await LaunchReadinessService.evaluateLaunchReadiness();
    sendJson(res, 200, { success: true, report });
    return true;
  }

  // 2. GET /api/v1/security/kill-switches/status?targetType=...&targetKey=...
  if (method === 'GET' && pathname === '/api/v1/security/kill-switches/status') {
    const targetType = parsedUrl.searchParams.get('targetType');
    const targetKey = parsedUrl.searchParams.get('targetKey');
    if (!targetType || !targetKey) {
      sendJson(res, 400, { success: false, error: 'targetType and targetKey required' });
      return true;
    }
    const isKilled = await KillSwitchService.isTargetKilled(
      targetType as KillSwitchTargetType,
      targetKey
    );
    sendJson(res, 200, { success: true, targetType, targetKey, isKilled });
    return true;
  }

  // 3. POST /api/v1/security/kill-switches/trip
  if (method === 'POST' && pathname === '/api/v1/security/kill-switches/trip') {
    const body = await parseBody(req);
    const result = await KillSwitchService.tripKillSwitch({
      targetType: body.targetType,
      targetKey: body.targetKey,
      reason: body.reason,
      trippedByUserId: auth?.user?.id || body.userId || 'system_admin',
      metadata: body.metadata
    });
    sendJson(res, 200, { success: true, killSwitch: result });
    return true;
  }

  // 4. POST /api/v1/security/kill-switches/recover
  if (method === 'POST' && pathname === '/api/v1/security/kill-switches/recover') {
    const body = await parseBody(req);
    const recovered = await KillSwitchService.recoverKillSwitch({
      targetType: body.targetType,
      targetKey: body.targetKey,
      recoveredByUserId: auth?.user?.id || body.userId || 'system_admin',
      recoveryNotes: body.notes || 'Remediation verified.'
    });
    sendJson(res, 200, { success: true, recovered });
    return true;
  }

  // 5. POST /api/v1/security/rollback/rule
  if (method === 'POST' && pathname === '/api/v1/security/rollback/rule') {
    const body = await parseBody(req);
    const result = await KillSwitchService.executeEmergencyRuleRollback({
      ruleId: body.ruleId,
      defectiveRuleVersion: body.defectiveRuleVersion,
      fallbackRuleVersion: body.fallbackRuleVersion,
      reason: body.reason,
      actorUserId: auth?.user?.id || body.userId || 'system_admin'
    });
    sendJson(res, 200, { success: true, rollback: result });
    return true;
  }

  // 6. POST /api/v1/security/feature-flags/evaluate
  if (method === 'POST' && pathname === '/api/v1/security/feature-flags/evaluate') {
    const body = await parseBody(req);
    const isEnabled = await FeatureFlagService.isEnabled({
      key: body.key,
      organizationId: body.organizationId || auth?.user?.organizationId,
      userRole: body.userRole || auth?.user?.role,
      jurisdiction: body.jurisdiction,
      taxDomain: body.taxDomain
    });
    sendJson(res, 200, { success: true, key: body.key, isEnabled });
    return true;
  }

  // 7. POST /api/v1/security/beta/check-eligibility
  if (method === 'POST' && pathname === '/api/v1/security/beta/check-eligibility') {
    const body = await parseBody(req);
    const eligibility = FeatureFlagService.evaluateBetaSupportEligibility({
      taxYear: parseInt(body.taxYear, 10) || 2026,
      filingStatus: body.filingStatus || 'SINGLE',
      jurisdictions: body.jurisdictions || ['US-FED'],
      formsRequested: body.formsRequested || ['FORM_1040']
    });
    sendJson(res, 200, { success: true, eligibility });
    return true;
  }

  // 8. POST /api/v1/security/retention/request-deletion
  if (method === 'POST' && pathname === '/api/v1/security/retention/request-deletion') {
    const body = await parseBody(req);
    const result = await DataRetentionService.requestDataDeletion({
      taxCaseId: body.taxCaseId,
      requestedByUserId: auth?.user?.id || body.userId || 'taxpayer_user',
      reason: body.reason || 'Customer requested account closure'
    });
    sendJson(res, 200, { success: true, deletionRequest: result });
    return true;
  }

  // 9. POST /api/v1/security/disaster-recovery/restore-drill
  if (method === 'POST' && pathname === '/api/v1/security/disaster-recovery/restore-drill') {
    const drillResult = await DisasterRecoveryService.executeRestoreDrill();
    sendJson(res, 200, { success: true, drillResult });
    return true;
  }

  // 10. POST /api/v1/security/pii/sanitize
  if (method === 'POST' && pathname === '/api/v1/security/pii/sanitize') {
    const body = await parseBody(req);
    if (body.text) {
      const sanitized = PiiRedactionService.sanitizeText(body.text);
      sendJson(res, 200, { success: true, sanitized });
      return true;
    }
    if (body.payload) {
      const sanitized = PiiRedactionService.sanitizeObject(body.payload);
      sendJson(res, 200, { success: true, sanitized });
      return true;
    }
    sendJson(res, 400, { success: false, error: 'Provide text or payload to sanitize' });
    return true;
  }

  return false;
}
