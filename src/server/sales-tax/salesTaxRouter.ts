/**
 * Autonomous Tax OS — Phase 7: Sales & Use Tax REST API Router
 * 
 * Exposes multi-state nexus monitoring, registrations, transaction ingestion,
 * taxability overrides, resale exemptions, consumer use tax, 4-way reconciliation,
 * return preparation, human review approvals, and filing workflows.
 */

import http from 'http';
import { prisma } from '../db';
import { AuthContext } from '../services/auth';
import {
  NexusEngine,
  RegistrationService,
  TaxabilityEngine,
  SourcingEngine,
  RateService,
  MarketplaceService,
  ExemptionService,
  UseTaxService,
  ReconciliationEngine,
  ReturnEngine,
  FilingProvider,
  NoticeService,
  DefaultAddressProvider
} from '../services/salesTax';
import { SalesTransactionType, SourcingRule, UserRole } from '@prisma/client';

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

// Service instances
const addressProvider = new DefaultAddressProvider();
const rateService = new RateService(addressProvider);
const nexusEngine = new NexusEngine();
const registrationService = new RegistrationService();
const taxabilityEngine = new TaxabilityEngine();
const sourcingEngine = new SourcingEngine();
const marketplaceService = new MarketplaceService();
const exemptionService = new ExemptionService();
const useTaxService = new UseTaxService();
const reconciliationEngine = new ReconciliationEngine();
const returnEngine = new ReturnEngine();
const filingProvider = new FilingProvider();
const noticeService = new NoticeService();

export async function handleSalesTaxApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  auth: AuthContext
): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  if (!url.startsWith('/api/v1/sales-tax')) {
    return false;
  }

  try {
    // ------------------------------------------------------------------------
    // 1. NEXUS MONITORING & EVALUATION
    // ------------------------------------------------------------------------

    // GET /api/v1/sales-tax/cases/:taxCaseId/nexus
    const getCaseNexusMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/nexus$/);
    if (getCaseNexusMatch && method === 'GET') {
      const taxCaseId = getCaseNexusMatch[1];
      const measurements = await prisma.economicNexusMeasurement.findMany({
        where: { taxCaseId },
        orderBy: { stateCode: 'asc' }
      });
      const physicalFacts = await prisma.physicalNexusFact.findMany({
        where: { taxCaseId },
        orderBy: { stateCode: 'asc' }
      });
      const events = await prisma.nexusEvent.findMany({
        where: { taxCaseId },
        orderBy: { triggeredAt: 'desc' },
        take: 20
      });

      sendJson(res, 200, {
        taxCaseId,
        measurements,
        physicalFacts,
        recentEvents: events
      });
      return true;
    }

    // POST /api/v1/sales-tax/cases/:taxCaseId/nexus/evaluate
    const evalNexusMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/nexus\/evaluate$/);
    if (evalNexusMatch && method === 'POST') {
      const taxCaseId = evalNexusMatch[1];
      const body = await parseJsonBody(req);
      const states = body.states || ['CA', 'NY', 'NJ', 'IL', 'MA'];

      const results = [];
      for (const st of states) {
        const r = await nexusEngine.evaluateEconomicNexus(taxCaseId, st);
        results.push(r);
      }

      sendJson(res, 200, {
        taxCaseId,
        evaluatedStates: states,
        results
      });
      return true;
    }

    // POST /api/v1/sales-tax/cases/:taxCaseId/nexus/physical-fact
    const physicalFactMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/nexus\/physical-fact$/);
    if (physicalFactMatch && method === 'POST') {
      const taxCaseId = physicalFactMatch[1];
      const body = await parseJsonBody(req);

      const fact = await nexusEngine.recordPhysicalNexusFact({
        taxCaseId,
        stateCode: body.stateCode,
        factType: body.factType,
        description: body.description,
        locationAddress: body.locationAddress,
        activeFrom: new Date(body.activeFrom),
        activeTo: body.activeTo ? new Date(body.activeTo) : undefined,
        payrollCount: body.payrollCount,
        propertyValueCents: body.propertyValueCents ? BigInt(body.propertyValueCents) : undefined,
        evidenceId: body.evidenceId
      });

      sendJson(res, 201, { success: true, physicalFact: fact });
      return true;
    }

    // ------------------------------------------------------------------------
    // 2. REGISTRATIONS
    // ------------------------------------------------------------------------

    // GET /api/v1/sales-tax/organizations/:orgId/registrations
    const getRegsMatch = url.match(/^\/api\/v1\/sales-tax\/organizations\/([^\/]+)\/registrations$/);
    if (getRegsMatch && method === 'GET') {
      const orgId = getRegsMatch[1];
      const regs = await registrationService.getRegistrations(orgId);
      sendJson(res, 200, { organizationId: orgId, registrations: regs });
      return true;
    }

    // POST /api/v1/sales-tax/organizations/:orgId/registrations
    const postRegMatch = url.match(/^\/api\/v1\/sales-tax\/organizations\/([^\/]+)\/registrations$/);
    if (postRegMatch && method === 'POST') {
      const orgId = postRegMatch[1];
      const body = await parseJsonBody(req);

      const reg = await registrationService.registerState({
        organizationId: orgId,
        stateCode: body.stateCode,
        registrationNumber: body.registrationNumber,
        filingFrequency: body.filingFrequency,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
        notes: body.notes
      });

      sendJson(res, 201, { success: true, registration: reg });
      return true;
    }

    // ------------------------------------------------------------------------
    // 3. TRANSACTIONS & SOURCING & CALCULATION
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/cases/:taxCaseId/transactions
    const postTxnMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/transactions$/);
    if (postTxnMatch && method === 'POST') {
      const taxCaseId = postTxnMatch[1];
      const body = await parseJsonBody(req);

      const taxCase = await prisma.taxCase.findUnique({ where: { id: taxCaseId } });
      if (!taxCase) {
        sendJson(res, 404, { error: 'TaxCase not found' });
        return true;
      }

      // Normalize origin and destination
      const normOrigin = await addressProvider.normalizeAddress(body.originAddress || {
        street1: '100 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105'
      });
      const normDest = await addressProvider.normalizeAddress(body.destinationAddress);

      // Determine sourcing rule
      const sourcing = sourcingEngine.resolveSourcing(normOrigin, normDest, body.productCategory || 'TPP');
      const targetAddress = sourcing.sourcingLocation === 'ORIGIN' ? normOrigin : normDest;

      // Determine rate quote
      const rateQuote = await rateService.getRateForAddress(targetAddress);

      // Check customer exemption
      let isCustomerExempt = false;
      if (body.customerId) {
        const exemptCheck = await exemptionService.validateExemption(
          body.customerId,
          normDest.state,
          body.transactionDate ? new Date(body.transactionDate) : new Date()
        );
        isCustomerExempt = exemptCheck.isExempt;
      }

      // Check product taxability
      const taxability = await taxabilityEngine.determineTaxability({
        taxCaseId,
        organizationId: taxCase.organizationId,
        productCategoryCode: body.productCategory || 'TPP',
        stateCode: normDest.state,
        isCustomerExempt
      });

      const isTaxable = taxability.isTaxable;
      const grossAmountCents = BigInt(body.grossAmountCents || 0);
      const nonTaxableAmountCents = isTaxable ? BigInt(0) : grossAmountCents;
      const taxableAmountCents = isTaxable ? grossAmountCents : BigInt(0);

      const calculatedTaxCents = isTaxable
        ? BigInt(Math.round(Number(taxableAmountCents) * rateQuote.compositeRate))
        : BigInt(0);

      const isMarketplace = body.isMarketplaceFacilitated || marketplaceService.isMarketplaceFacilitator(body.sourceChannel || '');

      const txn = await prisma.salesTransaction.create({
        data: {
          organizationId: taxCase.organizationId,
          taxCaseId,
          sourceChannel: body.sourceChannel || 'DIRECT_STORE',
          externalTransactionId: body.externalTransactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          transactionType: body.transactionType || SalesTransactionType.SALE,
          transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
          originalTransactionId: body.originalTransactionId,
          customerId: body.customerId,
          originAddress: normOrigin as any,
          destinationAddress: normDest as any,
          isMarketplaceFacilitated: isMarketplace,
          marketplaceName: body.marketplaceName || (isMarketplace ? body.sourceChannel : undefined),
          grossAmountCents,
          nonTaxableAmountCents,
          taxableAmountCents,
          taxCollectedCents: BigInt(body.taxCollectedCents || 0),
          calculatedTaxCents,
          sourcingMethod: sourcing.rule,
          destinationState: normDest.state,
          destinationZip: normDest.postalCode,
          reconciledStatus: 'UNRECONCILED',
          lines: {
            create: [
              {
                lineNumber: 1,
                productSku: body.productSku || 'SKU-001',
                productDescription: body.productDescription || 'Item description',
                quantity: body.quantity || 1,
                unitPriceCents: grossAmountCents,
                grossAmountCents,
                isTaxable,
                stateRate: rateQuote.stateRate,
                countyRate: rateQuote.countyRate,
                cityRate: rateQuote.cityRate,
                specialDistrictRate: rateQuote.specialDistrictRate,
                compositeRate: rateQuote.compositeRate,
                calculatedTaxCents,
                taxCollectedCents: BigInt(body.taxCollectedCents || 0),
                jurisdictionCode: rateQuote.jurisdictionCode
              }
            ]
          }
        },
        include: { lines: true }
      });

      sendJson(res, 201, {
        success: true,
        transaction: txn,
        rateQuote,
        sourcing,
        taxability
      });
      return true;
    }

    // GET /api/v1/sales-tax/cases/:taxCaseId/transactions
    const getTxnsMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/transactions$/);
    if (getTxnsMatch && method === 'GET') {
      const taxCaseId = getTxnsMatch[1];
      const txns = await prisma.salesTransaction.findMany({
        where: { taxCaseId },
        include: { lines: true },
        orderBy: { transactionDate: 'desc' },
        take: 100
      });
      sendJson(res, 200, { taxCaseId, count: txns.length, transactions: txns });
      return true;
    }

    // ------------------------------------------------------------------------
    // 4. TAXABILITY OVERRIDES
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/cases/:taxCaseId/taxability/override
    const overrideMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/taxability\/override$/);
    if (overrideMatch && method === 'POST') {
      const taxCaseId = overrideMatch[1];
      const body = await parseJsonBody(req);

      const decision = await taxabilityEngine.overrideTaxability({
        taxCaseId,
        productCategoryId: body.productCategoryId,
        stateCode: body.stateCode,
        decision: body.decision,
        ruleCitation: body.ruleCitation,
        determinationReason: body.determinationReason,
        reviewerUserId: auth.user.id
      });

      sendJson(res, 201, { success: true, decision });
      return true;
    }

    // ------------------------------------------------------------------------
    // 5. EXEMPTION CERTIFICATES
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/organizations/:orgId/exemptions
    const postExemptMatch = url.match(/^\/api\/v1\/sales-tax\/organizations\/([^\/]+)\/exemptions$/);
    if (postExemptMatch && method === 'POST') {
      const orgId = postExemptMatch[1];
      const body = await parseJsonBody(req);

      const cert = await exemptionService.registerCertificate({
        organizationId: orgId,
        customerId: body.customerId,
        stateCode: body.stateCode,
        certificateNumber: body.certificateNumber,
        certificateType: body.certificateType,
        issuedDate: new Date(body.issuedDate),
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
        verifiedByReviewerId: auth.user.role === UserRole.CPA ? auth.user.id : undefined
      });

      sendJson(res, 201, { success: true, certificate: cert });
      return true;
    }

    // ------------------------------------------------------------------------
    // 6. CONSUMER USE TAX
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/cases/:taxCaseId/use-tax
    const postUseTaxMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/use-tax$/);
    if (postUseTaxMatch && method === 'POST') {
      const taxCaseId = postUseTaxMatch[1];
      const body = await parseJsonBody(req);

      const result = await useTaxService.assessUseTax({
        taxCaseId,
        vendorName: body.vendorName,
        description: body.description,
        purchaseAmountCents: BigInt(body.purchaseAmountCents),
        taxPaidToOtherStateCents: body.taxPaidToOtherStateCents ? BigInt(body.taxPaidToOtherStateCents) : undefined,
        deliveryAddress: body.deliveryAddress,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined
      });

      sendJson(res, 201, { success: true, ...result });
      return true;
    }

    // ------------------------------------------------------------------------
    // 7. RECONCILIATION
    // ------------------------------------------------------------------------

    // GET /api/v1/sales-tax/cases/:taxCaseId/reconciliation
    const reconMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/reconciliation$/);
    if (reconMatch && method === 'GET') {
      const taxCaseId = reconMatch[1];
      const report = await reconciliationEngine.reconcile({ taxCaseId });
      sendJson(res, 200, { report });
      return true;
    }

    // ------------------------------------------------------------------------
    // 8. RETURN GENERATION & APPROVAL & FILING
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/cases/:taxCaseId/returns/generate
    const genReturnMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/returns\/generate$/);
    if (genReturnMatch && method === 'POST') {
      const taxCaseId = genReturnMatch[1];
      const body = await parseJsonBody(req);
      const taxCase = await prisma.taxCase.findUnique({ where: { id: taxCaseId } });
      if (!taxCase) {
        sendJson(res, 404, { error: 'TaxCase not found' });
        return true;
      }

      const taxReturn = await returnEngine.generateReturn({
        organizationId: taxCase.organizationId,
        taxCaseId,
        stateCode: body.stateCode,
        periodYear: body.periodYear || 2026,
        periodQuarter: body.periodQuarter || 1,
        periodMonth: body.periodMonth,
        filingFrequency: body.filingFrequency,
        startDate: new Date(body.startDate || '2026-01-01T00:00:00.000Z'),
        endDate: new Date(body.endDate || '2026-03-31T23:59:59.999Z'),
        dueDate: new Date(body.dueDate || '2026-04-30T23:59:59.999Z')
      });

      sendJson(res, 201, { success: true, taxReturn });
      return true;
    }

    // GET /api/v1/sales-tax/cases/:taxCaseId/returns
    const getReturnsMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/returns$/);
    if (getReturnsMatch && method === 'GET') {
      const taxCaseId = getReturnsMatch[1];
      const returns = await prisma.salesTaxReturn.findMany({
        where: { taxCaseId },
        include: { returnPeriod: true, payments: true },
        orderBy: { createdAt: 'desc' }
      });
      sendJson(res, 200, { taxCaseId, returns });
      return true;
    }

    // POST /api/v1/sales-tax/returns/:returnId/approve
    const approveReturnMatch = url.match(/^\/api\/v1\/sales-tax\/returns\/([^\/]+)\/approve$/);
    if (approveReturnMatch && method === 'POST') {
      const returnId = approveReturnMatch[1];
      const updated = await filingProvider.approveReturn(returnId, auth.user.id);
      sendJson(res, 200, { success: true, taxReturn: updated });
      return true;
    }

    // POST /api/v1/sales-tax/returns/:returnId/authorize
    const authorizeReturnMatch = url.match(/^\/api\/v1\/sales-tax\/returns\/([^\/]+)\/authorize$/);
    if (authorizeReturnMatch && method === 'POST') {
      const returnId = authorizeReturnMatch[1];
      const body = await parseJsonBody(req);
      const updated = await filingProvider.authorizeReturn(returnId, {
        taxpayerUserId: auth.user.id,
        signatureText: body.signatureText || auth.user.fullName,
        ipAddress: req.socket.remoteAddress || '127.0.0.1',
        authorizedAt: new Date()
      });
      sendJson(res, 200, { success: true, taxReturn: updated });
      return true;
    }

    // POST /api/v1/sales-tax/returns/:returnId/submit
    const submitReturnMatch = url.match(/^\/api\/v1\/sales-tax\/returns\/([^\/]+)\/submit$/);
    if (submitReturnMatch && method === 'POST') {
      const returnId = submitReturnMatch[1];
      const result = await filingProvider.submitReturn(returnId);
      sendJson(res, 200, result);
      return true;
    }

    // POST /api/v1/sales-tax/returns/:returnId/payments
    const payReturnMatch = url.match(/^\/api\/v1\/sales-tax\/returns\/([^\/]+)\/payments$/);
    if (payReturnMatch && method === 'POST') {
      const returnId = payReturnMatch[1];
      const body = await parseJsonBody(req);
      const payment = await filingProvider.schedulePayment({
        salesTaxReturnId: returnId,
        paymentAmountCents: BigInt(body.paymentAmountCents),
        paymentMethod: body.paymentMethod,
        bankAccountId: body.bankAccountId,
        scheduledDate: new Date(body.scheduledDate || Date.now())
      });
      sendJson(res, 201, { success: true, payment });
      return true;
    }

    // ------------------------------------------------------------------------
    // 9. NOTICES
    // ------------------------------------------------------------------------

    // POST /api/v1/sales-tax/organizations/:orgId/notices
    const postNoticeMatch = url.match(/^\/api\/v1\/sales-tax\/organizations\/([^\/]+)\/notices$/);
    if (postNoticeMatch && method === 'POST') {
      const orgId = postNoticeMatch[1];
      const body = await parseJsonBody(req);
      const notice = await noticeService.ingestNotice({
        organizationId: orgId,
        taxCaseId: body.taxCaseId,
        stateCode: body.stateCode,
        noticeDate: new Date(body.noticeDate),
        noticeType: body.noticeType,
        noticeNumber: body.noticeNumber,
        agencyName: body.agencyName,
        periodCovered: body.periodCovered,
        assessedTaxCents: body.assessedTaxCents ? BigInt(body.assessedTaxCents) : undefined,
        assessedPenaltyCents: body.assessedPenaltyCents ? BigInt(body.assessedPenaltyCents) : undefined,
        assessedInterestCents: body.assessedInterestCents ? BigInt(body.assessedInterestCents) : undefined,
        responseDueDate: body.responseDueDate ? new Date(body.responseDueDate) : undefined,
        severity: body.severity,
        documentId: body.documentId
      });
      sendJson(res, 201, { success: true, notice });
      return true;
    }

    // ------------------------------------------------------------------------
    // 10. EXECUTIVE & PROFESSIONAL DASHBOARD
    // ------------------------------------------------------------------------

    // GET /api/v1/sales-tax/cases/:taxCaseId/dashboard
    const dashboardMatch = url.match(/^\/api\/v1\/sales-tax\/cases\/([^\/]+)\/dashboard$/);
    if (dashboardMatch && method === 'GET') {
      const taxCaseId = dashboardMatch[1];
      const taxCase = await prisma.taxCase.findUnique({
        where: { id: taxCaseId },
        include: {
          organization: {
            include: { salesTaxRegistrations: true }
          },
          economicNexusMeasurements: true,
          salesTaxReturns: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!taxCase) {
        sendJson(res, 404, { error: 'TaxCase not found' });
        return true;
      }

      const segregation = await marketplaceService.segregateSales({ taxCaseId });
      const recon = await reconciliationEngine.reconcile({ taxCaseId });

      sendJson(res, 200, {
        taxCaseId,
        organizationName: taxCase.organization.name,
        nexusMeasurements: taxCase.economicNexusMeasurements,
        registrations: taxCase.organization.salesTaxRegistrations,
        salesSummary: {
          grossSalesCents: segregation.totalGrossSalesCents,
          directSalesCents: segregation.directSalesCents,
          marketplaceSalesCents: segregation.marketplaceSalesCents,
          taxCollectedCents: segregation.directTaxCollectedCents
        },
        reconciliation: {
          isReconciled: recon.isReconciled,
          discrepancyCount: recon.discrepancies.length,
          netTaxVarianceCents: recon.netTaxDiscrepancyCents
        },
        recentReturns: taxCase.salesTaxReturns
      });
      return true;
    }

    // If matches /api/v1/sales-tax but unknown subpath
    sendJson(res, 404, { error: `Sales tax endpoint '${url}' not found` });
    return true;
  } catch (err: any) {
    console.error(`[SalesTax Router Error] ${method} ${url}:`, err);
    sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
    return true;
  }
}
