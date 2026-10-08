/**
 * Autonomous Tax OS — Phase 9 Electronic Filing REST API Router
 * 
 * Exposes endpoints for filing readiness gates, customer review presentations,
 * Form 8879 PIN signatures, MeF package generation, state & federal transmissions,
 * payment authorizations, rejections, amendments, and webhook verification.
 */

import http from 'http';
import { URL } from 'url';
import { prisma } from '../db';
import { AuthContext } from '../services/auth';
import {
  FilingReadinessService,
  TaxpayerReviewService,
  ReturnVersionService,
  SignatureService,
  ReturnPackageBuilder,
  TransmissionQueueService,
  RejectionEngine,
  FilingPaymentService,
  AmendmentEngine,
  FilingSecurityService,
  SandboxESignProvider
} from '../services/filing';

function sendJson(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-TaxOS-Signature, X-TaxOS-Timestamp, X-TaxOS-Event-Id'
  });
  res.end(
    JSON.stringify(data, (key, value) => {
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

export async function handleFilingApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  auth: AuthContext
): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';
  const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  try {
    // 1. Environment Banner Metadata
    if (pathname === '/api/v1/filing/environment' && method === 'GET') {
      const banner = FilingSecurityService.getEnvironmentBanner();
      sendJson(res, 200, { success: true, banner });
      return true;
    }

    // 2. Filing Readiness Evaluation (8 Gates)
    if (pathname.startsWith('/api/v1/filing/readiness/') && method === 'GET') {
      const taxCaseId = pathname.split('/').pop()!;
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId
      });
      const readiness = await FilingReadinessService.evaluateReadiness(taxCaseId);
      sendJson(res, 200, { success: true, readiness });
      return true;
    }

    // 3. Taxpayer Review Summary Presentation
    if (pathname.startsWith('/api/v1/filing/summary/') && method === 'GET') {
      const taxCaseId = pathname.split('/').pop()!;
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId
      });
      const summary = await TaxpayerReviewService.generateReviewSummary(taxCaseId);
      sendJson(res, 200, { success: true, summary });
      return true;
    }

    // 4. Taxpayer Acknowledges Review
    if (pathname === '/api/v1/filing/review/acknowledge' && method === 'POST') {
      const body = await parseBody(req);
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId: body.taxCaseId
      });
      const result = await TaxpayerReviewService.markCustomerReviewed({
        taxCaseId: body.taxCaseId,
        userId: auth.user.id,
        ipAddress: req.socket.remoteAddress
      });
      sendJson(res, 200, { success: true, result });
      return true;
    }

    // 5. Create Immutable ReturnVersion
    if (pathname === '/api/v1/filing/version/create' && method === 'POST') {
      const body = await parseBody(req);
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId: body.taxCaseId
      });
      const returnVersion = await ReturnVersionService.createReturnVersion({
        ...body,
        actorUserId: auth.user.id
      });
      sendJson(res, 201, { success: true, returnVersion });
      return true;
    }

    // 6. Form 8879 PIN Electronic Signature
    if (pathname === '/api/v1/filing/signature/pin' && method === 'POST') {
      const body = await parseBody(req);
      const result = await SignatureService.signWithPin({
        signatureRequestId: body.signatureRequestId,
        pin: body.pin,
        ipAddress: req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent']
      });
      sendJson(res, 200, { success: true, result });
      return true;
    }

    // 7. Complete Form 8879 Jurat Authorization
    if (pathname === '/api/v1/filing/signature/form8879' && method === 'POST') {
      const body = await parseBody(req);
      const authRecord = await SignatureService.executeForm8879Authorization({
        ...body,
        taxpayerIpAddress: req.socket.remoteAddress || '127.0.0.1'
      });
      sendJson(res, 200, { success: true, authorization: authRecord });
      return true;
    }

    // 8. Build Return Package & MeF XML
    if (pathname === '/api/v1/filing/package/build' && method === 'POST') {
      const body = await parseBody(req);
      const pkg = await ReturnPackageBuilder.buildReturnPackage(body);
      sendJson(res, 200, { success: true, package: pkg });
      return true;
    }

    // 9. Enqueue Submission
    if (pathname === '/api/v1/filing/transmission/enqueue' && method === 'POST') {
      const body = await parseBody(req);
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId: body.taxCaseId
      });
      const submission = await TransmissionQueueService.enqueueSubmission(body);
      sendJson(res, 202, { success: true, submission });
      return true;
    }

    // 10. Process Submission through Transmission & Acknowledgment
    if (pathname === '/api/v1/filing/transmission/process' && method === 'POST') {
      const body = await parseBody(req);
      const result = await TransmissionQueueService.processSubmission(body.submissionId);
      sendJson(res, 200, { success: true, submission: result });
      return true;
    }

    // 11. Authorize Payment (Electronic Funds Withdrawal)
    if (pathname === '/api/v1/filing/payment/authorize' && method === 'POST') {
      const body = await parseBody(req);
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId: body.taxCaseId
      });
      const payment = await FilingPaymentService.authorizePayment({
        ...body,
        amountCents: BigInt(body.amountCents),
        actorUserId: auth.user.id
      });
      sendJson(res, 201, { success: true, payment });
      return true;
    }

    // 12. Refund Tracking Information
    if (pathname.startsWith('/api/v1/filing/refund/') && method === 'GET') {
      const taxCaseId = pathname.split('/').pop()!;
      const taxCase = await prisma.taxCase.findUnique({ where: { id: taxCaseId } });
      if (!taxCase) {
        sendJson(res, 404, { error: 'TaxCase not found' });
        return true;
      }
      const refundInfo = FilingPaymentService.getRefundTrackingInfo({
        taxYear: taxCase.taxYear,
        expectedRefundCents: taxCase.federalRefundOrDueCents < BigInt(0) ? -taxCase.federalRefundOrDueCents : BigInt(0),
        filingStatus: taxCase.status
      });
      sendJson(res, 200, { success: true, refundInfo });
      return true;
    }

    // 13. File Automatic Extension
    if (pathname === '/api/v1/filing/extension/file' && method === 'POST') {
      const body = await parseBody(req);
      await FilingSecurityService.assertCanSubmitFiling({
        userId: auth.user.id,
        userRole: auth.user.role,
        organizationId: auth.organizationId,
        taxCaseId: body.taxCaseId
      });
      const extension = await AmendmentEngine.fileExtension({
        ...body,
        estimatedTotalTaxCents: body.estimatedTotalTaxCents ? BigInt(body.estimatedTotalTaxCents) : undefined,
        paymentWithExtensionCents: body.paymentWithExtensionCents ? BigInt(body.paymentWithExtensionCents) : undefined
      });
      sendJson(res, 201, { success: true, extension });
      return true;
    }

    // 14. Statutory Filing Deadlines
    if (pathname === '/api/v1/filing/deadlines' && method === 'GET') {
      const jurisdiction = urlObj.searchParams.get('jurisdiction') || 'US-FED';
      const taxYear = parseInt(urlObj.searchParams.get('taxYear') || '2026', 10);
      const formType = (urlObj.searchParams.get('formType') as any) || 'FORM_1040';
      const hasExtension = urlObj.searchParams.get('hasExtension') === 'true';

      const deadline = AmendmentEngine.calculateFilingDeadline({
        jurisdiction,
        taxYear,
        formType,
        hasExtension
      });
      sendJson(res, 200, { success: true, deadline });
      return true;
    }

    return false;
  } catch (err: any) {
    sendJson(res, 400, { success: false, error: err.message });
    return true;
  }
}
