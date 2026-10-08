/**
 * Autonomous Tax OS — Phase 6: Review Operations REST API Router
 * 
 * Exposes professional review workflows, assignment routing, position adjustments,
 * customer collaboration, legal escalations, QA governance, and operations metrics.
 */

import http from 'http';
import { prisma } from '../db';
import { AuthContext } from '../services/auth';
import {
  ReviewTaskStateMachine,
  ReviewAssignmentService,
  PositionReviewService,
  CustomerCollaborationService,
  TaxCaseMessagingService,
  FinalReturnReviewService,
  AttorneyEscalationService,
  QualityAssuranceService,
  ServiceLevelAgreementEngine,
  ReviewOperationsDashboardService,
  CaseLockService,
  ReviewTaskStatus,
  MessageRecipientScope,
  QaAction,
  QaSamplingReason
} from './index';

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  const serialized = JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2
  );
  res.end(serialized);
}

function parseJsonBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export async function handleReviewApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  auth: AuthContext
): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  if (!url.startsWith('/api/review')) {
    return false;
  }

  const parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  try {
    // ------------------------------------------------------------------------
    // 1. QUEUE & TASK MANAGEMENT
    // ------------------------------------------------------------------------
    if (pathname === '/api/review/queue' && method === 'GET') {
      const status = parsedUrl.searchParams.get('status') || undefined;
      const jurisdiction = parsedUrl.searchParams.get('jurisdiction') || undefined;
      const domain = parsedUrl.searchParams.get('domain') || undefined;
      const priority = parsedUrl.searchParams.get('priority') || undefined;

      const tasks = await prisma.reviewTask.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(jurisdiction ? { jurisdiction } : {}),
          ...(domain ? { taxDomain: domain as any } : {}),
          ...(priority ? { priority } : {})
        },
        include: {
          assignedUser: { select: { id: true, fullName: true, role: true, email: true } },
          taxCase: { select: { id: true, taxYear: true, caseType: true, status: true, ownerId: true } }
        },
        orderBy: [{ priority: 'asc' }, { deadline: 'asc' }]
      });

      sendJson(res, 200, { success: true, count: tasks.length, tasks });
      return true;
    }

    // Candidate Match Evaluation
    const candidatesMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/candidates$/);
    if (candidatesMatch && method === 'GET') {
      const taskId = candidatesMatch[1];
      const candidates = await ReviewAssignmentService.findEligibleReviewers(taskId);
      sendJson(res, 200, { success: true, taskId, count: candidates.length, candidates });
      return true;
    }

    // Auto-Assign
    const autoAssignMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/auto-assign$/);
    if (autoAssignMatch && method === 'POST') {
      const taskId = autoAssignMatch[1];
      const assigned = await ReviewAssignmentService.autoAssignTask(taskId, auth.user.id);
      sendJson(res, 200, { success: true, task: assigned });
      return true;
    }

    // Manual Assign
    const assignMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/assign$/);
    if (assignMatch && method === 'POST') {
      const taskId = assignMatch[1];
      const body = await parseJsonBody(req);
      const assigned = await ReviewAssignmentService.manualAssignTask(taskId, body.targetUserId, auth.user.id);
      sendJson(res, 200, { success: true, task: assigned });
      return true;
    }

    // State Machine Transition
    const transitionMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/transition$/);
    if (transitionMatch && method === 'POST') {
      const taskId = transitionMatch[1];
      const body = await parseJsonBody(req);
      const result = await ReviewTaskStateMachine.transition({
        taskId,
        targetStatus: body.targetStatus,
        actorId: auth.user.id,
        reason: body.reason,
        metadata: body.metadata
      });
      sendJson(res, 200, { success: true, transition: result });
      return true;
    }

    // Task SLA Evaluation
    const slaMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/sla$/);
    if (slaMatch && method === 'GET') {
      const taskId = slaMatch[1];
      const sla = await ServiceLevelAgreementEngine.evaluateTaskSla(taskId);
      sendJson(res, 200, { success: true, sla });
      return true;
    }

    // ------------------------------------------------------------------------
    // 2. POSITION REVIEW ACTIONS
    // ------------------------------------------------------------------------
    const approvePosMatch = pathname.match(/^\/api\/review\/positions\/([a-zA-Z0-9_-]+)\/approve$/);
    if (approvePosMatch && method === 'POST') {
      const positionId = approvePosMatch[1];
      const body = await parseJsonBody(req);
      const position = await PositionReviewService.approvePosition(positionId, auth.user.id, body.notes);
      sendJson(res, 200, { success: true, position });
      return true;
    }

    const modifyPosMatch = pathname.match(/^\/api\/review\/positions\/([a-zA-Z0-9_-]+)\/modify$/);
    if (modifyPosMatch && method === 'POST') {
      const positionId = modifyPosMatch[1];
      const body = await parseJsonBody(req);
      const result = await PositionReviewService.modifyPosition(
        positionId,
        auth.user.id,
        {
          amountCents: body.amountCents ? BigInt(body.amountCents) : undefined,
          rationale: body.rationale,
          statutoryCitation: body.statutoryCitation,
          category: body.category,
          notes: body.notes
        },
        body.reason || 'Professional modification'
      );
      sendJson(res, 200, { success: true, ...result });
      return true;
    }

    const rejectPosMatch = pathname.match(/^\/api\/review\/positions\/([a-zA-Z0-9_-]+)\/reject$/);
    if (rejectPosMatch && method === 'POST') {
      const positionId = rejectPosMatch[1];
      const body = await parseJsonBody(req);
      const result = await PositionReviewService.rejectPosition(
        positionId,
        auth.user.id,
        body.reason || 'Disallowed by professional reviewer'
      );
      sendJson(res, 200, { success: true, ...result });
      return true;
    }

    const reqInfoPosMatch = pathname.match(/^\/api\/review\/positions\/([a-zA-Z0-9_-]+)\/request-info$/);
    if (reqInfoPosMatch && method === 'POST') {
      const positionId = reqInfoPosMatch[1];
      const body = await parseJsonBody(req);
      const customerReq = await PositionReviewService.requestInfoForPosition({
        positionId,
        reviewerId: auth.user.id,
        prompt: body.prompt,
        reason: body.reason,
        expectedAnswerType: body.expectedAnswerType,
        options: body.options
      });
      sendJson(res, 200, { success: true, customerRequest: customerReq });
      return true;
    }

    // ------------------------------------------------------------------------
    // 3. CUSTOMER COLLABORATION ("Needs You" Queue)
    // ------------------------------------------------------------------------
    if (pathname === '/api/review/customer-requests' && method === 'GET') {
      const taxCaseId = parsedUrl.searchParams.get('taxCaseId');
      if (taxCaseId) {
        const requests = await CustomerCollaborationService.getPendingRequestsForCase(taxCaseId);
        sendJson(res, 200, { success: true, requests });
      } else {
        const requests = await CustomerCollaborationService.getPendingRequestsForUser(auth.user.id);
        sendJson(res, 200, { success: true, requests });
      }
      return true;
    }

    if (pathname === '/api/review/customer-requests' && method === 'POST') {
      const body = await parseJsonBody(req);
      const created = await CustomerCollaborationService.createRequest({
        taxCaseId: body.taxCaseId,
        reviewTaskId: body.reviewTaskId,
        taxPositionId: body.taxPositionId,
        requestType: body.requestType,
        prompt: body.prompt,
        reason: body.reason,
        expectedAnswerType: body.expectedAnswerType,
        options: body.options,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        requestedByUserId: auth.user.id
      });
      sendJson(res, 201, { success: true, request: created });
      return true;
    }

    const respondReqMatch = pathname.match(/^\/api\/review\/customer-requests\/([a-zA-Z0-9_-]+)\/respond$/);
    if (respondReqMatch && method === 'POST') {
      const requestId = respondReqMatch[1];
      const body = await parseJsonBody(req);
      const updated = await CustomerCollaborationService.respondToRequest({
        requestId,
        userId: auth.user.id,
        responsePayload: body.responsePayload,
        responseDocumentId: body.responseDocumentId
      });
      sendJson(res, 200, { success: true, request: updated });
      return true;
    }

    // ------------------------------------------------------------------------
    // 4. CASE MESSAGING & LEGAL PRIVILEGE
    // ------------------------------------------------------------------------
    if (pathname === '/api/review/messages' && method === 'GET') {
      const taxCaseId = parsedUrl.searchParams.get('taxCaseId');
      if (!taxCaseId) {
        sendJson(res, 400, { error: 'taxCaseId parameter required' });
        return true;
      }
      const messages = await TaxCaseMessagingService.getMessagesForCase(taxCaseId, auth.user.id);
      sendJson(res, 200, { success: true, count: messages.length, messages });
      return true;
    }

    if (pathname === '/api/review/messages' && method === 'POST') {
      const body = await parseJsonBody(req);
      const message = await TaxCaseMessagingService.postMessage({
        taxCaseId: body.taxCaseId,
        senderUserId: auth.user.id,
        content: body.content,
        recipientScope: body.recipientScope || MessageRecipientScope.ALL,
        isPrivilegedLegal: body.isPrivilegedLegal || false,
        attachments: body.attachments
      });
      sendJson(res, 201, { success: true, message });
      return true;
    }

    // ------------------------------------------------------------------------
    // 5. FINAL RETURN REVIEW & READINESS GATE
    // ------------------------------------------------------------------------
    const readinessMatch = pathname.match(/^\/api\/review\/cases\/([a-zA-Z0-9_-]+)\/readiness$/);
    if (readinessMatch && method === 'GET') {
      const caseId = readinessMatch[1];
      const readiness = await FinalReturnReviewService.evaluateReadiness(caseId);
      sendJson(res, 200, { success: true, caseId, readiness });
      return true;
    }

    const signoffMatch = pathname.match(/^\/api\/review\/cases\/([a-zA-Z0-9_-]+)\/signoff$/);
    if (signoffMatch && method === 'POST') {
      const caseId = signoffMatch[1];
      const body = await parseJsonBody(req);
      const signoff = await FinalReturnReviewService.executeFinalSignoff({
        taxCaseId: caseId,
        reviewerUserId: auth.user.id,
        checklist: body.checklist,
        certificationNotes: body.certificationNotes || 'Certified compliant by credentialed professional'
      });
      sendJson(res, 200, { success: true, signoff });
      return true;
    }

    // ------------------------------------------------------------------------
    // 6. ATTORNEY ESCALATIONS
    // ------------------------------------------------------------------------
    const attorneyEscMatch = pathname.match(/^\/api\/review\/cases\/([a-zA-Z0-9_-]+)\/escalate-attorney$/);
    if (attorneyEscMatch && method === 'POST') {
      const caseId = attorneyEscMatch[1];
      const body = await parseJsonBody(req);
      const task = await AttorneyEscalationService.escalateToAttorney({
        taxCaseId: caseId,
        referredByUserId: auth.user.id,
        escalationReason: body.escalationReason,
        controversyType: body.controversyType || 'FRAUD_RISK',
        materialityCents: body.materialityCents ? BigInt(body.materialityCents) : undefined
      });
      sendJson(res, 201, { success: true, task });
      return true;
    }

    const attorneyOpMatch = pathname.match(/^\/api\/review\/tasks\/([a-zA-Z0-9_-]+)\/attorney-opinion$/);
    if (attorneyOpMatch && method === 'POST') {
      const taskId = attorneyOpMatch[1];
      const body = await parseJsonBody(req);
      const opinion = await AttorneyEscalationService.submitLegalOpinion({
        taskId,
        attorneyUserId: auth.user.id,
        legalOpinionSummary: body.legalOpinionSummary,
        recommendation: body.recommendation,
        privilegedNotes: body.privilegedNotes
      });
      sendJson(res, 200, { success: true, task: opinion });
      return true;
    }

    // ------------------------------------------------------------------------
    // 7. QUALITY ASSURANCE (QA)
    // ------------------------------------------------------------------------
    const qaSampleMatch = pathname.match(/^\/api\/review\/cases\/([a-zA-Z0-9_-]+)\/qa-sample$/);
    if (qaSampleMatch && method === 'POST') {
      const caseId = qaSampleMatch[1];
      const body = await parseJsonBody(req);
      const evaluation = await QualityAssuranceService.evaluateSamplingPolicy(caseId, body.primaryReviewerId || auth.user.id);
      let qaRecord = null;
      if (evaluation.shouldSample && evaluation.reason) {
        qaRecord = await QualityAssuranceService.createQualityReview({
          taxCaseId: caseId,
          qaReviewerId: auth.user.id,
          samplingReason: evaluation.reason
        });
      }
      sendJson(res, 200, { success: true, evaluation, qaRecord });
      return true;
    }

    const completeQaMatch = pathname.match(/^\/api\/review\/quality\/([a-zA-Z0-9_-]+)\/complete$/);
    if (completeQaMatch && method === 'POST') {
      const qaId = completeQaMatch[1];
      const body = await parseJsonBody(req);
      const completed = await QualityAssuranceService.completeQualityReview({
        qaReviewId: qaId,
        qaReviewerUserId: auth.user.id,
        action: body.action as QaAction,
        score: body.score,
        findings: body.findings,
        correctiveActions: body.correctiveActions
      });
      sendJson(res, 200, { success: true, qualityReview: completed });
      return true;
    }

    // ------------------------------------------------------------------------
    // 8. OPERATIONS DASHBOARD & CUSTOMER SUPPORT SCOPING
    // ------------------------------------------------------------------------
    if (pathname === '/api/review/operations/dashboard' && method === 'GET') {
      const metrics = await ReviewOperationsDashboardService.getOperationsDashboard();
      sendJson(res, 200, { success: true, ...metrics });
      return true;
    }

    if (pathname === '/api/review/support/case-summary' && method === 'GET') {
      const caseId = parsedUrl.searchParams.get('taxCaseId');
      if (!caseId) {
        sendJson(res, 400, { error: 'taxCaseId parameter required' });
        return true;
      }
      const summary = await ReviewOperationsDashboardService.getCustomerSupportCaseSummary(caseId, auth.user.id);
      sendJson(res, 200, { success: true, summary });
      return true;
    }

    // ------------------------------------------------------------------------
    // 9. CASE CONCURRENCY LOCKS
    // ------------------------------------------------------------------------
    if (pathname === '/api/review/locks/acquire' && method === 'POST') {
      const body = await parseJsonBody(req);
      const lock = await CaseLockService.acquireLock(body.taxCaseId, auth.user.id, body.reason, body.durationMinutes);
      sendJson(res, 200, { success: true, lock });
      return true;
    }

    if (pathname === '/api/review/locks/release' && method === 'POST') {
      const body = await parseJsonBody(req);
      await CaseLockService.releaseLock(body.taxCaseId, auth.user.id);
      sendJson(res, 200, { success: true, released: true });
      return true;
    }

    if (pathname === '/api/review/locks/check' && method === 'GET') {
      const caseId = parsedUrl.searchParams.get('taxCaseId');
      if (!caseId) {
        sendJson(res, 400, { error: 'taxCaseId parameter required' });
        return true;
      }
      const lockStatus = await CaseLockService.checkLock(caseId);
      sendJson(res, 200, { success: true, lockStatus });
      return true;
    }

    // No matching /api/review endpoint
    return false;
  } catch (err: any) {
    console.error(`[Review Router Error] ${method} ${url}:`, err);
    sendJson(res, 400, { error: err.message });
    return true;
  }
}
