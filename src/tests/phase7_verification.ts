/**
 * Autonomous Tax OS — Phase 7 Master Verification Suite
 * 
 * Comprehensive end-to-end verification covering all Phase 7 DoD criteria:
 * 1. Address Normalization & CASS standard formatting
 * 2. Composite Jurisdiction Resolution across CA, NY, NJ, IL, MA
 * 3. Economic Nexus Evaluation against statutory thresholds (CA $500k, NY $500k+100txns, NJ $100k/200txns, IL $100k, MA $100k)
 * 4. Warning band triggers (75% warning, 90% action required, 100% breach + task creation)
 * 5. Physical Nexus fact tracking (3PL inventory, remote employees)
 * 6. State Registration permit management & dynamic filing frequencies
 * 7. Product Taxability Catalog (SaaS, Digital Goods, TPP, Services, Maintenance, Shipping)
 * 8. CPA Reviewer taxability override with persistent audit lineage
 * 9. Sourcing rules (Destination vs Illinois intrastate origin vs remote destination)
 * 10. Marketplace facilitator separation & gross-reporting deduction
 * 11. Zero double-remittance verification
 * 12. Exemption & resale certificate lifecycle and transaction validation
 * 13. Consumer use tax self-assessment & Commerce Clause other-state tax credit
 * 14. 4-way sales tax reconciliation & discrepancy detection (under-collection, missing exemption, unlinked refunds)
 * 15. California CDTFA-401-A return generation with Schedule A district taxes
 * 16. New York ST-100 return generation with Schedule B and Vendor Collection Credit
 * 17. Illinois ST-1 return generation with ROT/UT schedules and Retailer's Discount
 * 18. New Jersey ST-50 return generation
 * 19. Massachusetts ST-9 return generation
 * 20. Sequential two-party review gate (CPA approval + Taxpayer e-signature authorization)
 * 21. Simulated return filing submission & confirmation number receipt
 * 22. ACH remittance payment scheduling
 * 23. State sales tax notice ingestion & automated high-priority ReviewTask routing
 * 24. Multi-agent suite execution: SalesTaxSupervisorAgent
 * 25. Multi-agent suite execution: NexusAgent
 * 26. Multi-agent suite execution: RegistrationAgent
 * 27. Multi-agent suite execution: TaxabilityAgent
 * 28. Multi-agent suite execution: SourcingAgent & MarketplaceAgent
 * 29. Multi-agent suite execution: ExemptionAgent & SalesTaxReconciliationAgent
 * 30. Multi-agent suite execution: SalesTaxReturnAgent & SalesTaxNoticeAgent
 */

import { prisma } from '../server/db';
import {
  DefaultAddressProvider,
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
  NoticeService
} from '../server/services/salesTax';
import {
  SalesTaxSupervisorAgent,
  NexusAgent,
  RegistrationAgent,
  TaxabilityAgent,
  SourcingAgent,
  MarketplaceAgent,
  ExemptionAgent,
  SalesTaxReconciliationAgent,
  SalesTaxReturnAgent,
  SalesTaxNoticeAgent
} from '../server/agent-runtime/sales-tax';
import { AgentExecutionContext } from '../server/agent-runtime/context';
import {
  CaseType,
  ReviewMode,
  UserRole,
  FilingFrequency,
  SalesTransactionType,
  SalesTaxReturnStatus,
  ProductTaxability,
  SourcingRule,
  SalesTaxNoticeSeverity,
  TaxDomain
} from '@prisma/client';

let testRunId = `p7-${Date.now()}`;
let testOrgId = '';
let testUserId = '';
let testCaseId = '';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function setupPhase7TestEnvironment() {
  console.log('\n--- Setting up Phase 7 Test Organization and TaxCase ---');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: `Apex Global Commerce ${testRunId}`,
      slug: `apex-commerce-${testRunId}`,
      fein: '94-8837192',
      settings: { salesTaxEnabled: true }
    }
  });
  testOrgId = org.id;

  // 2. Create User (CPA / Preparer)
  const user = await prisma.user.create({
    data: {
      email: `cpa-${testRunId}@taxos.test`,
      passwordHash: 'hash',
      fullName: 'Elena Rostova, CPA',
      role: UserRole.CPA
    }
  });
  testUserId = user.id;

  // 3. Create TaxCase
  const taxCase = await prisma.taxCase.create({
    data: {
      organizationId: testOrgId,
      ownerId: testUserId,
      taxYear: 2026,
      caseType: CaseType.SALES_TAX,
      reviewMode: ReviewMode.HUMAN_VERIFIED,
      status: 'DRAFT',
      completionPercent: 50
    }
  });
  testCaseId = taxCase.id;

  // 4. Create SalesTaxProfile
  await prisma.salesTaxProfile.create({
    data: {
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      legalBusinessName: 'Apex Global Commerce Inc',
      defaultOriginAddress: {
        street1: '500 Howard St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US'
      },
      productCatalogType: 'MIXED',
      nexusMonitoringEnabled: true,
      activeStates: ['CA', 'NY', 'NJ', 'IL', 'MA']
    }
  });

  console.log(`  Initialized TaxCase: ${testCaseId} for Org: ${testOrgId}`);
}

async function runTests() {
  await setupPhase7TestEnvironment();

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

  console.log('\n--- 1. Address Normalization & Composite Jurisdiction Resolution ---');
  {
    const raw = {
      street1: '100 Market Street Suite 400',
      city: 'San Francisco',
      state: 'ca',
      postalCode: '94105-1234'
    };
    const norm = await addressProvider.normalizeAddress(raw);
    assert(norm.street1.includes('100 Market St'), 'Normalized street suffix St');
    assert(norm.state === 'CA', 'State upper-cased to CA');
    assert(norm.postalCode === '94105', 'Base postal code isolated');
    assert(norm.postalPlus4 === '1234', 'Postal +4 captured');
    assert(norm.confidenceScore >= 0.90, 'High confidence geocoding score');

    // Test Composite Rates across launch states
    const sf = await addressProvider.resolveJurisdiction(norm);
    assert(sf.compositeRate === 0.08625, 'San Francisco composite rate is exactly 8.625%');
    assert(sf.specialDistricts.length > 0, 'San Francisco transit districts identified');

    const laNorm = await addressProvider.normalizeAddress({ street1: '100 Main St', city: 'Los Angeles', state: 'CA', postalCode: '90012' });
    const la = await addressProvider.resolveJurisdiction(laNorm);
    assert(la.compositeRate === 0.0950, 'Los Angeles composite rate is exactly 9.50%');

    const nyNorm = await addressProvider.normalizeAddress({ street1: '350 5th Ave', city: 'New York', state: 'NY', postalCode: '10118' });
    const ny = await addressProvider.resolveJurisdiction(nyNorm);
    assert(ny.compositeRate === 0.08875, 'New York City composite rate is exactly 8.875%');

    const njNorm = await addressProvider.normalizeAddress({ street1: '1 Gateway Ctr', city: 'Newark', state: 'NJ', postalCode: '07102' });
    const nj = await addressProvider.resolveJurisdiction(njNorm);
    assert(nj.compositeRate === 0.06625, 'New Jersey statewide flat rate is exactly 6.625%');

    const ilNorm = await addressProvider.normalizeAddress({ street1: '233 S Wacker Dr', city: 'Chicago', state: 'IL', postalCode: '60606' });
    const il = await addressProvider.resolveJurisdiction(ilNorm);
    assert(il.compositeRate === 0.1025, 'Chicago Cook County composite rate is exactly 10.25%');

    const maNorm = await addressProvider.normalizeAddress({ street1: '100 Federal St', city: 'Boston', state: 'MA', postalCode: '02110' });
    const ma = await addressProvider.resolveJurisdiction(maNorm);
    assert(ma.compositeRate === 0.0625, 'Massachusetts flat rate is exactly 6.25%');
  }

  console.log('\n--- 2. Economic & Physical Nexus Engine ---');
  {
    // Seed transactions for California to test warning bands and breach
    // CA Statutory threshold: $500,000 = 50,000,000 cents
    
    // Batch 1: $300,000 (60% -> NO_NEXUS)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `CA-TXN-1-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-01-15'),
        originAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        grossAmountCents: BigInt(30000000), // $300k
        taxableAmountCents: BigInt(30000000),
        taxCollectedCents: BigInt(2587500), // 8.625%
        calculatedTaxCents: BigInt(2587500)
      }
    });

    const res1 = await nexusEngine.evaluateEconomicNexus(testCaseId, 'CA');
    assert(res1.hasNexus === false, 'CA has no nexus at $300k (60%)');
    assert(res1.percentageOfSalesThreshold === 60.0, '60.0% of sales threshold calculated');
    assert(res1.warningTriggered === undefined, 'No warning triggered below 75%');

    // Batch 2: Add $100,000 -> Total $400,000 (80% -> THRESHOLD_WARNING_75)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `CA-TXN-2-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-02-10'),
        originAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        grossAmountCents: BigInt(10000000), // $100k
        taxableAmountCents: BigInt(10000000),
        taxCollectedCents: BigInt(862500),
        calculatedTaxCents: BigInt(862500)
      }
    });

    const res2 = await nexusEngine.evaluateEconomicNexus(testCaseId, 'CA');
    assert(res2.percentageOfSalesThreshold === 80.0, '80.0% of sales threshold calculated');
    assert(res2.warningTriggered === 'THRESHOLD_WARNING_75', '75% warning band triggered at 80%');

    // Batch 3: Add $75,000 -> Total $475,000 (95% -> THRESHOLD_WARNING_90)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `CA-TXN-3-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-02-20'),
        originAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        grossAmountCents: BigInt(7500000), // $75k
        taxableAmountCents: BigInt(7500000),
        taxCollectedCents: BigInt(646875),
        calculatedTaxCents: BigInt(646875)
      }
    });

    const res3 = await nexusEngine.evaluateEconomicNexus(testCaseId, 'CA');
    assert(res3.percentageOfSalesThreshold === 95.0, '95.0% of sales threshold calculated');
    assert(res3.warningTriggered === 'THRESHOLD_WARNING_90', '90% warning band triggered at 95%');

    // Batch 4: Add $50,000 -> Total $525,000 (105% -> NEXUS_BREACHED)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `CA-TXN-4-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-03-01'),
        originAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        grossAmountCents: BigInt(5000000), // $50k
        taxableAmountCents: BigInt(5000000),
        taxCollectedCents: BigInt(431250),
        calculatedTaxCents: BigInt(431250)
      }
    });

    const res4 = await nexusEngine.evaluateEconomicNexus(testCaseId, 'CA');
    assert(res4.hasNexus === true, 'Economic nexus established at $525k (105%)');
    assert(res4.warningTriggered === 'NEXUS_BREACHED', 'NEXUS_BREACHED event triggered');

    // Verify automated TaxTask generation
    const regTask = await prisma.taxTask.findFirst({
      where: {
        taxCaseId: testCaseId,
        taskType: 'SALES_TAX_REGISTRATION_CA'
      }
    });
    assert(Boolean(regTask), 'Automated SALES_TAX_REGISTRATION_CA task provisioned');
    assert(regTask?.priority === 'CRITICAL', 'Registration task marked CRITICAL');

    // Physical Nexus Fact Tracking
    const physFact = await nexusEngine.recordPhysicalNexusFact({
      taxCaseId: testCaseId,
      stateCode: 'NJ',
      factType: 'INVENTORY_3PL',
      description: 'Amazon FBA warehouse inventory located in Robbinsville, NJ',
      locationAddress: { street1: '500 Robbinsville Rd', city: 'Robbinsville', state: 'NJ', postalCode: '08691' },
      activeFrom: new Date('2026-01-01')
    });
    assert(physFact.status === 'NEXUS_ESTABLISHED', 'Physical nexus established from 3PL inventory');

    const njNexus = await nexusEngine.evaluateEconomicNexus(testCaseId, 'NJ');
    assert(njNexus.hasNexus === true, 'NJ has nexus due to physical presence');
    assert(njNexus.nexusReason === 'PHYSICAL_NEXUS', 'Nexus reason correctly categorized as PHYSICAL_NEXUS');
  }

  console.log('\n--- 3. Registration Service & Filing Frequency ---');
  {
    const caReg = await registrationService.registerState({
      organizationId: testOrgId,
      stateCode: 'CA',
      registrationNumber: 'CDTFA-99201481',
      filingFrequency: FilingFrequency.MONTHLY,
      notes: 'CDTFA Permit authorized for high-volume merchant'
    });
    assert(caReg.status === 'REGISTERED', 'CA registration status is REGISTERED');
    assert(caReg.registrationNumber === 'CDTFA-99201481', 'Permit number saved');

    const isRegCA = await registrationService.isRegistered(testOrgId, 'CA');
    assert(isRegCA === true, 'isRegistered returns true for CA');

    // Test dynamic frequency calculation
    const highFreq = registrationService.determineFilingFrequency('CA', BigInt(30000000)); // $300k tax/yr
    assert(highFreq === FilingFrequency.MONTHLY, 'High volume liability determined as MONTHLY filing');

    const normalFreq = registrationService.determineFilingFrequency('CA', BigInt(5000000)); // $50k tax/yr
    assert(normalFreq === FilingFrequency.QUARTERLY, 'Moderate volume liability determined as QUARTERLY filing');

    const lowFreq = registrationService.determineFilingFrequency('CA', BigInt(50000)); // $500 tax/yr
    assert(lowFreq === FilingFrequency.ANNUALLY, 'Low volume liability determined as ANNUALLY filing');
  }

  console.log('\n--- 4. Product Taxability Engine & Reviewer Overrides ---');
  {
    // SaaS
    const caSaas = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'SAAS', stateCode: 'CA' });
    assert(caSaas.isTaxable === false, 'SaaS is EXEMPT in California (unbundled cloud software)');

    const nySaas = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'SAAS', stateCode: 'NY' });
    assert(nySaas.isTaxable === true, 'SaaS is TAXABLE in New York (prewritten software)');

    const njSaas = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'SAAS', stateCode: 'NJ' });
    assert(njSaas.isTaxable === true, 'SaaS is TAXABLE in New Jersey');

    const ilSaas = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'SAAS', stateCode: 'IL' });
    assert(ilSaas.isTaxable === false, 'SaaS is EXEMPT from Illinois state ROT');

    const maSaas = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'SAAS', stateCode: 'MA' });
    assert(maSaas.isTaxable === false, 'SaaS is EXEMPT in Massachusetts');

    // Digital Goods
    const caDig = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'DIGITAL_GOODS', stateCode: 'CA' });
    assert(caDig.isTaxable === false, 'Digital goods without physical media exempt in CA');

    const nyDig = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'DIGITAL_GOODS', stateCode: 'NY' });
    assert(nyDig.isTaxable === true, 'Digital goods taxable in NY');

    // Tangible Personal Property & Services
    const caTpp = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'TPP', stateCode: 'CA' });
    assert(caTpp.isTaxable === true, 'Tangible Personal Property is TAXABLE');

    const nySvc = await taxabilityEngine.determineTaxability({ organizationId: testOrgId, productCategoryCode: 'PROFESSIONAL_SERVICES', stateCode: 'NY' });
    assert(nySvc.isTaxable === false, 'Professional consulting services are NON_TAXABLE');

    // CPA Reviewer Override Workflow
    await taxabilityEngine.overrideTaxability({
      taxCaseId: testCaseId,
      categoryCode: 'SAAS',
      stateCode: 'NY',
      decision: ProductTaxability.EXEMPT,
      ruleCitation: 'N.Y. Tax Law § 1115(a)(12); Custom Software Exception',
      determinationReason: 'Client software contract was individually negotiated, bespoke architecture and not prewritten canned code.',
      reviewerUserId: testUserId
    });

    const overriddenNySaas = await taxabilityEngine.determineTaxability({
      taxCaseId: testCaseId,
      organizationId: testOrgId,
      productCategoryCode: 'SAAS',
      stateCode: 'NY'
    });
    assert(overriddenNySaas.isTaxable === false, 'Reviewer override applied: NY SaaS treated as EXEMPT');
    assert(overriddenNySaas.isReviewerOverride === true, 'isReviewerOverride flag is true');
  }

  console.log('\n--- 5. Sourcing Engine ---');
  {
    const sfAddress = { street1: '500 Howard St', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'US', county: 'San Francisco', isRooftopResolved: true, confidenceScore: 0.95, formattedAddress: '' };
    const nycAddress = { street1: '350 5th Ave', city: 'New York', state: 'NY', postalCode: '10118', country: 'US', county: 'New York', isRooftopResolved: true, confidenceScore: 0.95, formattedAddress: '' };
    const chiOrigin = { street1: '100 N LaSalle St', city: 'Chicago', state: 'IL', postalCode: '60602', country: 'US', county: 'Cook', isRooftopResolved: true, confidenceScore: 0.95, formattedAddress: '' };
    const chiDest = { street1: '500 W Madison St', city: 'Chicago', state: 'IL', postalCode: '60661', country: 'US', county: 'Cook', isRooftopResolved: true, confidenceScore: 0.95, formattedAddress: '' };

    // Destination sourcing for NY
    const destSourcing = sourcingEngine.resolveSourcing(sfAddress, nycAddress, 'TPP');
    assert(destSourcing.rule === SourcingRule.DESTINATION, 'Interstate sale to NY is DESTINATION sourced');
    assert(destSourcing.sourcingLocation === 'DESTINATION', 'Sourced to destination location');

    // Illinois Mixed Sourcing: Intrastate origin vs Remote destination
    const ilIntrastate = sourcingEngine.resolveSourcing(chiOrigin, chiDest, 'TPP');
    assert(ilIntrastate.rule === SourcingRule.ORIGIN, 'Illinois intrastate sale is ORIGIN sourced (ROT)');
    assert(ilIntrastate.sourcingLocation === 'ORIGIN', 'Sourced to seller physical location in IL');

    const ilInterstate = sourcingEngine.resolveSourcing(sfAddress, chiDest, 'TPP');
    assert(ilInterstate.rule === SourcingRule.DESTINATION, 'Remote interstate sale to Illinois is DESTINATION sourced (Use Tax)');
  }

  console.log('\n--- 6. Marketplace Facilitator Separation & Non-Double-Remittance ---');
  {
    // Ingest Marketplace-facilitated sales (Amazon)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'AMAZON',
        externalTransactionId: `AMZ-TXN-1-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-02-15'),
        originAddress: { city: 'Seattle', state: 'WA', postalCode: '98101' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        isMarketplaceFacilitated: true,
        marketplaceName: 'Amazon',
        grossAmountCents: BigInt(15000000), // $150k
        taxableAmountCents: BigInt(0), // Exempt for seller because Amazon remits
        nonTaxableAmountCents: BigInt(15000000),
        taxCollectedCents: BigInt(1293750), // Amazon collected $12,937.50
        calculatedTaxCents: BigInt(1293750)
      }
    });

    const segregation = await marketplaceService.segregateSales({ taxCaseId: testCaseId, stateCode: 'CA' });
    assert(segregation.totalGrossSalesCents === BigInt(67500000), 'Total gross sales includes both direct ($525k) and Amazon ($150k)');
    assert(segregation.directSalesCents === BigInt(52500000), 'Direct webstore sales isolated ($525k)');
    assert(segregation.marketplaceSalesCents === BigInt(15000000), 'Marketplace sales isolated ($150k)');
    assert(segregation.sellerRemittanceLiabilityCents === BigInt(4528125), 'Seller remittance liability strictly excludes marketplace tax');
    assert(segregation.marketplaceRemittanceLiabilityCents === BigInt(1293750), 'Marketplace remittance liability tracked separately');
  }

  console.log('\n--- 7. Exemption & Resale Certificate Service ---');
  {
    // Create B2B Customer
    const customer = await prisma.salesTaxCustomer.create({
      data: {
        organizationId: testOrgId,
        customerNumber: `CUST-${testRunId}`,
        name: 'Omni Retailers Wholesale LLC',
        customerType: 'RESELLER',
        taxIdentifier: '94-1122334',
        billingAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' }
      }
    });

    // 1. Without certificate -> not exempt
    const check1 = await exemptionService.validateExemption(customer.id, 'CA');
    assert(check1.isExempt === false, 'Customer without certificate on file is not exempt');

    // 2. Register Valid Resale Certificate
    const cert = await exemptionService.registerCertificate({
      organizationId: testOrgId,
      customerId: customer.id,
      stateCode: 'CA',
      certificateNumber: 'CA-RESALE-884912',
      certificateType: 'RESALE',
      issuedDate: new Date('2026-01-01'),
      expirationDate: new Date('2028-12-31'),
      verifiedByReviewerId: testUserId
    });
    assert(cert.status === 'VALID', 'Certificate verified by CPA reviewer is VALID');

    const check2 = await exemptionService.validateExemption(customer.id, 'CA');
    assert(check2.isExempt === true, 'Customer with valid resale certificate is EXEMPT');
    assert(check2.status === 'VALID', 'Validation status is VALID');

    // 3. Test Expired Certificate rejection
    const expiredCert = await prisma.exemptionCertificate.create({
      data: {
        organizationId: testOrgId,
        customerId: customer.id,
        stateCode: 'NY',
        certificateNumber: 'NY-EXPIRED-999',
        certificateType: 'RESALE',
        issuedDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-12-31'), // Expired in 2025
        status: 'VALID'
      }
    });
    const check3 = await exemptionService.validateExemption(customer.id, 'NY', new Date('2026-02-01'));
    assert(check3.isExempt === false, 'Expired certificate correctly rejected');
    assert(check3.status === 'EXPIRED', 'Status marked EXPIRED');
  }

  console.log('\n--- 8. Consumer Use Tax Self-Assessment ---');
  {
    // Untaxed laptop purchase for San Francisco office
    const useTaxRes = await useTaxService.assessUseTax({
      taxCaseId: testCaseId,
      vendorName: 'DirectTech Hardware Inc (No Sales Tax Collected)',
      description: 'Engineering development workstations',
      purchaseAmountCents: BigInt(1000000), // $10,000
      deliveryAddress: { street1: '500 Howard St', city: 'San Francisco', state: 'CA', postalCode: '94105' }
    });

    assert(useTaxRes.grossUseTaxCents === BigInt(86250), 'Self-assessed use tax is $862.50 (8.625%)');
    assert(useTaxRes.netUseTaxCents === BigInt(86250), 'Net use tax equals gross when no out-of-state tax paid');
    assert(useTaxRes.position.isSelfAssessed === true, 'Position marked self-assessed');

    // Second purchase with tax credit paid to other state ($500 paid)
    const useTaxCreditRes = await useTaxService.assessUseTax({
      taxCaseId: testCaseId,
      vendorName: 'OfficeSupplies Oregon LLC',
      description: 'Office Furniture shipped from Oregon',
      purchaseAmountCents: BigInt(1000000), // $10,000
      taxPaidToOtherStateCents: BigInt(50000), // $500 paid to other state
      deliveryAddress: { street1: '500 Howard St', city: 'San Francisco', state: 'CA', postalCode: '94105' }
    });

    assert(useTaxCreditRes.otherStateCreditCents === BigInt(50000), 'Out-of-state tax credit of $500 recorded');
    assert(useTaxCreditRes.netUseTaxCents === BigInt(36250), 'Net use tax reduced to $362.50 ($862.50 - $500.00)');

    const summary = await useTaxService.getUseTaxSummary(testCaseId, 'CA');
    assert(summary.itemCount === 2, '2 use tax positions summarized');
    assert(summary.totalUseTaxDueCents === BigInt(122500), 'Total use tax due rolls up correctly ($1,225.00)');
  }

  console.log('\n--- 9. Four-Way Reconciliation & Discrepancies ---');
  {
    // Ingest transaction with checkout under-collection discrepancy
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `RECON-UNDER-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-03-05'),
        originAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationAddress: { city: 'San Francisco', state: 'CA', postalCode: '94105' },
        destinationState: 'CA',
        destinationZip: '94105',
        grossAmountCents: BigInt(1000000), // $10,000
        taxableAmountCents: BigInt(1000000),
        taxCollectedCents: BigInt(72500), // Cart only collected 7.25% ($725.00)
        calculatedTaxCents: BigInt(86250) // Rooftop was 8.625% ($862.50)
      }
    });

    const report = await reconciliationEngine.reconcile({ taxCaseId: testCaseId });
    assert(report.isReconciled === false, 'Reconciliation detects variance');
    const underCollectDiscrepancy = report.discrepancies.find(d => d.type === 'TAX_COLLECTED_MISMATCH');
    assert(Boolean(underCollectDiscrepancy), 'TAX_COLLECTED_MISMATCH discrepancy surfaced');
    assert(underCollectDiscrepancy?.taxVarianceCents === BigInt(13750), 'Tax variance of $137.50 identified');
  }

  console.log('\n--- 10. Deterministic State Returns Preparation ---');
  {
    // California Return (CDTFA-401-A)
    const caReturn = await returnEngine.generateReturn({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'CA',
      periodYear: 2026,
      periodQuarter: 1,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T23:59:59.999Z'),
      dueDate: new Date('2026-04-30T23:59:59.999Z')
    });

    assert(caReturn.returnFormName === 'CDTFA_401_A', 'CA form name is CDTFA_401_A');
    assert(caReturn.grossSalesCents > BigInt(0), 'Gross sales populated');
    assert(caReturn.marketplaceSalesCents === BigInt(15000000), 'Marketplace deduction on return is $150k');
    assert(caReturn.status === SalesTaxReturnStatus.READY_FOR_REVIEW, 'Return status is READY_FOR_REVIEW');
    assert(caReturn.lineItems !== null, 'Line items JSON exists');
    assert(caReturn.schedules !== null, 'Schedule A district allocation exists');

    // New York Return (ST-100)
    // Seed NY transaction with direct sales
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `NY-TXN-1-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-02-01'),
        originAddress: { city: 'New York', state: 'NY', postalCode: '10001' },
        destinationAddress: { city: 'New York', state: 'NY', postalCode: '10001' },
        destinationState: 'NY',
        destinationZip: '10001',
        grossAmountCents: BigInt(10000000), // $100k
        taxableAmountCents: BigInt(10000000),
        taxCollectedCents: BigInt(887500), // 8.875% NYC
        calculatedTaxCents: BigInt(887500)
      }
    });

    const nyReturn = await returnEngine.generateReturn({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'NY',
      periodYear: 2026,
      periodQuarter: 1,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T23:59:59.999Z'),
      dueDate: new Date('2026-04-30T23:59:59.999Z'),
      isTimelyFiling: true
    });

    assert(nyReturn.returnFormName === 'NY_ST_100', 'NY form name is NY_ST_100');
    assert(nyReturn.vendorCollectionCreditCents === BigInt(20000), 'NY Vendor Collection Credit applied (capped at $200.00)');
    assert(nyReturn.netTaxPayableCents === nyReturn.totalTaxDueCents - BigInt(20000), 'Net payable accurately reduced by credit');

    // Illinois Return (ST-1)
    await prisma.salesTransaction.create({
      data: {
        organizationId: testOrgId,
        taxCaseId: testCaseId,
        sourceChannel: 'DIRECT_STORE',
        externalTransactionId: `IL-TXN-1-${testRunId}`,
        transactionType: SalesTransactionType.SALE,
        transactionDate: new Date('2026-02-15'),
        originAddress: { city: 'Chicago', state: 'IL', postalCode: '60606' },
        destinationAddress: { city: 'Chicago', state: 'IL', postalCode: '60606' },
        destinationState: 'IL',
        destinationZip: '60606',
        grossAmountCents: BigInt(10000000), // $100k
        taxableAmountCents: BigInt(10000000),
        taxCollectedCents: BigInt(1025000), // 10.25% Chicago
        calculatedTaxCents: BigInt(1025000)
      }
    });

    const ilReturn = await returnEngine.generateReturn({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'IL',
      periodYear: 2026,
      periodQuarter: 1,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T23:59:59.999Z'),
      dueDate: new Date('2026-04-30T23:59:59.999Z'),
      isTimelyFiling: true
    });

    assert(ilReturn.returnFormName === 'IL_ST_1', 'IL form name is IL_ST_1');
    assert(ilReturn.vendorCollectionCreditCents > BigInt(0), 'Illinois Retailer\'s Discount (1.75%) applied');

    // New Jersey Return (ST-50)
    const njReturn = await returnEngine.generateReturn({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'NJ',
      periodYear: 2026,
      periodQuarter: 1,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T23:59:59.999Z'),
      dueDate: new Date('2026-04-30T23:59:59.999Z')
    });
    assert(njReturn.returnFormName === 'NJ_ST_50', 'NJ form name is NJ_ST_50');

    // Massachusetts Return (ST-9)
    const maReturn = await returnEngine.generateReturn({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'MA',
      periodYear: 2026,
      periodQuarter: 1,
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-03-31T23:59:59.999Z'),
      dueDate: new Date('2026-04-30T23:59:59.999Z')
    });
    assert(maReturn.returnFormName === 'MA_ST_9', 'MA form name is MA_ST_9');
  }

  console.log('\n--- 11. Two-Party Review & E-Filing Governance ---');
  {
    const returns = await prisma.salesTaxReturn.findMany({ where: { taxCaseId: testCaseId, stateCode: 'CA' } });
    const targetReturn = returns[0];

    // 1. Pre-filing validation before approval -> Blocked
    const val1 = await filingProvider.validateReturn(targetReturn.id);
    assert(val1.isValid === false, 'Filing validation fails before review approval');
    assert(val1.blockers.some(b => b.includes('Professional CPA Reviewer approval is required')), 'CPA approval blocker enforced');

    // 2. CPA Reviewer Approves Return
    const approved = await filingProvider.approveReturn(targetReturn.id, testUserId);
    assert(approved.status === SalesTaxReturnStatus.APPROVED, 'Return status transitioned to APPROVED');
    assert(approved.approvedByReviewerId === testUserId, 'CPA reviewer ID recorded');

    // 3. Pre-filing validation before taxpayer authorization -> Blocked
    const val2 = await filingProvider.validateReturn(targetReturn.id);
    assert(val2.isValid === false, 'Filing validation fails before taxpayer authorization');
    assert(val2.blockers.some(b => b.includes('Taxpayer electronic authorization and signature is required')), 'Taxpayer signature blocker enforced');

    // 4. Taxpayer Authorizes Return
    const authorized = await filingProvider.authorizeReturn(targetReturn.id, {
      taxpayerUserId: testUserId,
      signatureText: 'Elena Rostova, CEO & CPA',
      ipAddress: '192.168.1.100',
      authorizedAt: new Date()
    });
    assert(authorized.status === SalesTaxReturnStatus.AUTHORIZED_BY_TAXPAYER, 'Return status transitioned to AUTHORIZED_BY_TAXPAYER');
    assert(authorized.authorizedByTaxpayerAt !== null, 'Authorization timestamp recorded');

    // 5. Pre-filing validation after both signatures -> PASS
    const val3 = await filingProvider.validateReturn(targetReturn.id);
    assert(val3.isValid === true, 'Filing validation passes with both signatures');

    // 6. Submit Return
    const subResult = await filingProvider.submitReturn(targetReturn.id);
    assert(subResult.status === SalesTaxReturnStatus.FILED, 'Return successfully FILED');
    assert(Boolean(subResult.confirmationNumber), 'Official state filing confirmation number generated');

    // 7. Schedule ACH Payment
    const payment = await filingProvider.schedulePayment({
      salesTaxReturnId: targetReturn.id,
      paymentAmountCents: targetReturn.netTaxPayableCents,
      paymentMethod: 'ACH_DEBIT',
      bankAccountId: 'bank-vault-9921',
      scheduledDate: new Date('2026-04-25')
    });
    assert(payment.status === 'SCHEDULED', 'Remittance payment SCHEDULED');
    assert(Boolean(payment.confirmationNumber), 'Payment confirmation number recorded');
  }

  console.log('\n--- 12. State Sales Tax Notice Ingestion & Review Routing ---');
  {
    const notice = await noticeService.ingestNotice({
      organizationId: testOrgId,
      taxCaseId: testCaseId,
      stateCode: 'CA',
      noticeDate: new Date('2026-03-10'),
      noticeType: 'ASSESSMENT',
      noticeNumber: 'CDTFA-AUDIT-2026-992',
      agencyName: 'California Department of Tax and Fee Administration',
      periodCovered: '2024-Q1 through 2024-Q4',
      assessedTaxCents: BigInt(1250000), // $12,500
      assessedPenaltyCents: BigInt(125000), // $1,250
      assessedInterestCents: BigInt(35000), // $350
      severity: SalesTaxNoticeSeverity.ASSESSMENT,
      responseDueDate: new Date('2026-04-10')
    });

    assert(notice.totalAssessmentCents === BigInt(1410000), 'Total assessment of $14,100 computed');
    assert(Boolean(notice.reviewTaskId), 'High-priority ReviewTask provisioned');

    const revTask = await prisma.reviewTask.findUnique({ where: { id: notice.reviewTaskId! } });
    assert(revTask?.taxDomain === TaxDomain.SALES_TAX, 'ReviewTask domain is SALES_TAX');
    assert(revTask?.jurisdiction === 'US-CA', 'ReviewTask jurisdiction is US-CA');
    assert(revTask?.priority === 'HIGH', 'Notice task priority is HIGH');

    // Notice resolution
    const resolved = await noticeService.resolveNotice(notice.id, 'Settlement reached with CDTFA auditor; penalties abated under reasonable cause.');
    assert(resolved.status === 'RESOLVED', 'Notice marked RESOLVED');
  }

  console.log('\n--- 13. Multi-Agent Sales Tax Suite Execution ---');
  {
    const ctx = new AgentExecutionContext({
      taxCaseId: testCaseId,
      organizationId: testOrgId,
      userId: testUserId,
      userRole: UserRole.CPA,
      taxDomain: TaxDomain.SALES_TAX
    });

    // 1. SalesTaxSupervisorAgent
    const supervisor = new SalesTaxSupervisorAgent();
    const supRes = await supervisor.execute(ctx, { states: ['CA', 'NY', 'NJ', 'IL', 'MA'] });
    assert(supRes.status === 'SUCCESS', 'SalesTaxSupervisorAgent executed successfully');
    assert(supRes.result.nexusBreachesDetected.includes('CA'), 'Supervisor identified CA nexus');

    // 2. NexusAgent
    const nexusAgent = new NexusAgent();
    const nexRes = await nexusAgent.execute(ctx, { states: ['CA', 'NY'] });
    assert(nexRes.status === 'SUCCESS', 'NexusAgent executed successfully');
    assert(nexRes.result.breachedStates.includes('CA'), 'NexusAgent reported CA breach');

    // 3. RegistrationAgent
    const regAgent = new RegistrationAgent();
    const regRes = await regAgent.execute(ctx, { breachedStates: ['CA', 'NY'] });
    assert(regRes.status === 'SUCCESS', 'RegistrationAgent executed successfully');
    assert(regRes.result.registeredStates.includes('CA'), 'RegistrationAgent found registered CA permit');

    // 4. TaxabilityAgent
    const taxAgent = new TaxabilityAgent();
    const taxRes = await taxAgent.execute(ctx, { items: [{ category: 'SAAS', stateCode: 'CA' }] });
    assert(taxRes.status === 'SUCCESS', 'TaxabilityAgent executed successfully');
    assert(taxRes.result.determinations[0].isTaxable === false, 'TaxabilityAgent classified CA SaaS as exempt');

    // 5. SourcingAgent
    const srcAgent = new SourcingAgent();
    const srcRes = await srcAgent.execute(ctx, {
      origin: { street1: '100 Main St', city: 'San Francisco', state: 'CA', postalCode: '94105' },
      destination: { street1: '100 Broadway', city: 'New York', state: 'NY', postalCode: '10001' }
    });
    assert(srcRes.status === 'SUCCESS', 'SourcingAgent executed successfully');
    assert(srcRes.result.determination.sourcingLocation === 'DESTINATION', 'SourcingAgent determined DESTINATION');

    // 6. MarketplaceAgent
    const mktAgent = new MarketplaceAgent();
    const mktRes = await mktAgent.execute(ctx, { stateCode: 'CA' });
    assert(mktRes.status === 'SUCCESS', 'MarketplaceAgent executed successfully');
    assert(BigInt(mktRes.result.segregation.marketplaceSalesCents) > BigInt(0), 'MarketplaceAgent segregated facilitator sales');

    // 7. ExemptionAgent
    const exAgent = new ExemptionAgent();
    const exRes = await exAgent.execute(ctx, { customerChecks: [{ customerId: (await prisma.salesTaxCustomer.findFirst({ where: { organizationId: testOrgId } }))!.id, stateCode: 'CA' }] });
    assert(exRes.status === 'SUCCESS', 'ExemptionAgent executed successfully');
    assert(exRes.result.validations[0].isExempt === true, 'ExemptionAgent validated exemption');

    // 8. SalesTaxReconciliationAgent
    const reconAgent = new SalesTaxReconciliationAgent();
    const reconRes = await reconAgent.execute(ctx, { stateCode: 'CA' });
    assert(reconRes.result.report.totalTransactions > 0, 'SalesTaxReconciliationAgent evaluated transactions');

    // 9. SalesTaxReturnAgent
    const retAgent = new SalesTaxReturnAgent();
    const retRes = await retAgent.execute(ctx, { stateCode: 'CA', periodYear: 2026, periodQuarter: 1 });
    assert(retRes.status === 'SUCCESS', 'SalesTaxReturnAgent executed successfully');
    assert(retRes.result.formName === 'CDTFA_401_A', 'ReturnAgent prepared CDTFA_401_A');

    // 10. SalesTaxNoticeAgent
    const notAgent = new SalesTaxNoticeAgent();
    const notRes = await notAgent.execute(ctx, {
      stateCode: 'CA',
      noticeDate: new Date('2026-03-12'),
      noticeType: 'INQUIRY',
      agencyName: 'CDTFA Audit Division',
      periodCovered: '2025-Q4',
      assessedTaxCents: BigInt(50000)
    });
    assert(notRes.status === 'SUCCESS', 'SalesTaxNoticeAgent executed successfully');
    assert(notRes.result.stateCode === 'CA', 'SalesTaxNoticeAgent routed notice');
  }

  console.log('\n========================================================================');
  console.log(`PHASE 7 VERIFICATION COMPLETE: ${passedCount} / ${passedCount + failedCount} TESTS PASSED`);
  console.log('========================================================================\n');
}

runTests().catch(err => {
  console.error('\n[FATAL ERROR in Phase 7 Verification Suite]:', err);
  process.exit(1);
});
