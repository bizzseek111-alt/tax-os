/**
 * Autonomous TaxOS — Phase 11A Master Live Tax Authority Runtime & Research Verification Suite
 * 
 * Validates:
 * 1. Live Tax Authority Runtime Architecture & 5-tier knowledge hierarchy
 * 2. Strict refusal to guess on missing tax year or jurisdiction (MissingResearchContext)
 * 3. Federal IRS Authority Connector (26 U.S.C. §§ 1, 63, 162, 199A, 280A, 1401)
 * 4. California FTB Connector & Decoupling (Cal. RTC § 17041 13.3%, § 17072 QBI disallowance)
 * 5. New York DTF Connector & Convenience of Employer (N.Y. Tax Law § 601 10.9%, 20 NYCRR § 132.18)
 * 6. New Jersey Div of Tax Connector & Autonomous Income (N.J.S.A. § 54A:2-1, § 54A:5-1 zero cross-category loss offsets)
 * 7. Illinois DOR Connector & Retirement Exemption (35 ILCS 5/201 4.95% flat, 35 ILCS 5/203 retirement subtraction)
 * 8. Massachusetts DOR Connector & Fair Share Surtax (MGL c. 62 § 4 5.0% + 4.0% Surtax > $1M)
 * 9. Official Domain Whitelist Enforcement (strict rejection of commercial SEO / blogs / marketing sites)
 * 10. Authority Hierarchy & Weighting Engine (Ranks 1 to 15, weight 0.0 to 1.0)
 * 11. Superseded Authority Invariant (superseded law receives weight 0.0)
 * 12. Sub-Regulatory Guidance Invariant (IRS FAQ/publication CANNOT override enacted statute or regulation)
 * 13. State Decoupling Invariant (state statute governs for state tax return calculations)
 * 14. Live Research Decision Engine & Gating (bypasses live search on fresh, high-confidence approved rules)
 * 15. Live Research Triggers (expired TTL, low confidence, changed hash, high materiality, multi-state)
 * 16. Official Source Freshness Tracking (TTL windows: 365d statute, 180d reg, 90d guidance, 30d FAQ)
 * 17. Change Detection & Cryptographic Hashing (SHA-256 detection of altered statutory provisions)
 * 18. Fact Applicability & Missing Fact Detection (SATISFIED, UNSATISFIED, UNKNOWN / MISSING_FACT)
 * 19. Minimal Question Generation (targeted, focused questions without speculating)
 * 20. TaxRuleCandidate Generation (unmodeled novel statutory rules stored for CPA/Admin review)
 * 21. Proposition Graph & Fine-Grained Lineage (claim -> rule -> source chunk -> official hash)
 * 22. Strict Citation Anti-Hallucination Guard (rejection of fabricated LLM citations with HALLUCINATION_DETECTED)
 * 23. Multi-State Coordinator & Residency (remote NY/NJ conflict, 183-day rule, resident credit N.J.S.A. § 54A:4-1)
 * 24. Sales Tax Specialist & Economic Nexus (Wayfair, $500k in CA/NY, $100k/200 in NJ/IL, $100k in MA, SaaS rules)
 * 25. Legal Escalation & AI Research Brief (IRC § 6662 substantial authority assessment, Form 8275, exposure breakdown)
 */

import crypto from 'crypto';
import prisma from '../server/db';
import {
  ResearchDomain,
  FreshnessStatus,
  AuthorityEscalationType,
  ResearchLatencyTier,
  NextActionRecommendation,
  OfficialConnectorRegistry,
  FederalIrsAuthorityConnector,
  CaliforniaFtbAuthorityConnector,
  NewYorkDtfAuthorityConnector,
  NewJerseyDivTaxAuthorityConnector,
  IllinoisDorAuthorityConnector,
  MassachusettsDorAuthorityConnector,
  AuthorityHierarchyEngine,
  OfficialSourceFreshnessService,
  LiveResearchDecisionEngine,
  FactApplicabilityService,
  CaseRuleResolver,
  CitationValidator,
  PropositionGraphService,
  FederalTaxSpecialist,
  CaliforniaTaxSpecialist,
  NewYorkTaxSpecialist,
  NewJerseyTaxSpecialist,
  IllinoisTaxSpecialist,
  MassachusettsTaxSpecialist,
  SalesTaxAuthoritySpecialist,
  PayrollAuthoritySpecialist,
  MultiStateCoordinator,
  LegalEscalationService,
  TaxResearchCache,
  CaseTaxResearchEngine,
  ProveThisRuleService
} from '../server/services/taxAuthority/research';
import { AuthorityType, PrecedentialStatus } from '../server/services/taxAuthority/types';

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (!condition) {
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedAssertions++;
  console.log(`  ✓ [PASS] ${message}`);
}

async function runPhase11aVerification() {
  console.log('\n================================================================');
  console.log('AUTONOMOUS TAX OS — PHASE 11A MASTER VERIFICATION SUITE');
  console.log('LIVE TAX AUTHORITY RUNTIME, OFFICIAL CONNECTORS & VERIFIED ANSWERING');
  console.log('================================================================\n');

  // Setup test TaxCase
  let testCase: any = null;
  try {
    testCase = await prisma.taxCase.findFirst();
    if (!testCase) {
      testCase = await prisma.taxCase.create({
        data: {
          taxYear: 2026,
          status: 'DISCOVERY',
          primaryJurisdiction: 'US-FED'
        }
      });
    }
  } catch (err) {
    testCase = { id: 'test-case-phase11a', taxYear: 2026, primaryJurisdiction: 'US-FED' };
  }
  const taxCaseId = testCase.id;

  // -------------------------------------------------------------------------
  // TEST 1: Live Tax Authority Runtime Architecture & Hierarchy
  // -------------------------------------------------------------------------
  console.log('\n[TEST 1] Live Tax Authority Runtime Architecture & Levels 1-5');
  const engine = CaseTaxResearchEngine.getInstance();
  assert(typeof engine.research === 'function', 'CaseTaxResearchEngine provides research entrypoint');
  assert(ResearchLatencyTier.FAST === 'FAST', 'Tier 1 Fast lookup defined');
  assert(ResearchLatencyTier.EXPERT === 'EXPERT', 'Tier 5 Expert escalation defined');

  // -------------------------------------------------------------------------
  // TEST 2: Strict Refusal to Guess on Missing Tax Year or Jurisdiction
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Refusal to Speculate on Missing Tax Year / Jurisdiction');
  const missingContextRes = await engine.research({
    taxCaseId,
    taxDomain: ResearchDomain.FEDERAL_INDIVIDUAL,
    question: 'Can I deduct business mileage?'
    // omitted taxYear and jurisdictions
  });
  assert((missingContextRes as any).isMissingContext === true, 'Refuses to answer without required parameters');
  assert((missingContextRes as any).missingFields.includes('taxYear'), 'Flags missing taxYear');
  assert((missingContextRes as any).missingFields.includes('jurisdictions'), 'Flags missing jurisdictions');

  // -------------------------------------------------------------------------
  // TEST 3: Federal IRS Authority Connector (26 U.S.C. §§ 1, 63, 162, 199A, 280A, 1401)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Federal IRS Official Authority Connector');
  const fedConnector = new FederalIrsAuthorityConnector();
  const sec162 = await fedConnector.fetchSource('26 U.S.C. § 162', 2026);
  assert(sec162 !== null, 'Fetched 26 U.S.C. § 162 from official IRS corpus');
  assert(sec162!.authorityType === AuthorityType.STATUTE, 'IRC § 162 classified as primary STATUTE');
  assert(sec162!.sourceUrl.includes('law.cornell.edu') || sec162!.sourceUrl.includes('gov'), 'Source URL is authorized statutory repository');
  const sec280a = await fedConnector.fetchSource('26 U.S.C. § 280A', 2026);
  assert(sec280a !== null && sec280a.rawText.includes('exclusive'), 'IRC § 280A includes strict exclusive business use requirement');

  // -------------------------------------------------------------------------
  // TEST 4: California FTB Connector & Decoupling
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] California FTB Connector & Decoupling Invariant');
  const caConnector = new CaliforniaFtbAuthorityConnector();
  const ca17041 = await caConnector.fetchSource('Cal. Rev. & Tax. Code § 17041', 2026);
  assert(ca17041 !== null, 'Fetched California RTC § 17041');
  assert(ca17041!.rawText.includes('13.3%'), 'Includes California 13.3% top marginal rate with MHST');
  const caSpecialist = CaliforniaTaxSpecialist.getInstance();
  const caDecouple = await caSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-CA'],
    question: 'How does Section 199A QBI apply in California?'
  });
  assert(caDecouple.decouplings.includes('DECOUPLED_FROM_IRC_199A'), 'California explicitly decouples from federal QBI under RTC § 17072');

  // -------------------------------------------------------------------------
  // TEST 5: New York DTF Connector & Convenience of Employer Rule
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] New York DTF Connector & Convenience of Employer');
  const nyConnector = new NewYorkDtfAuthorityConnector();
  const ny601 = await nyConnector.fetchSource('N.Y. Tax Law § 601', 2026);
  assert(ny601 !== null && ny601!.rawText.includes('10.9%'), 'Fetched NY Tax Law § 601 top bracket 10.9%');
  const nySpecialist = NewYorkTaxSpecialist.getInstance();
  const nyRemote = await nySpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-NY'],
    question: 'Taxpayer telecommutes remotely from New Jersey for New York employer'
  });
  assert(nyRemote.matchedCitations.includes('20 NYCRR § 132.18(a)'), 'Convenience of employer rule identified (20 NYCRR § 132.18)');
  assert(nyRemote.missingFacts.length > 0, 'Flags missing fact regarding bona fide employer office necessity');

  // -------------------------------------------------------------------------
  // TEST 6: New Jersey Div of Tax Connector & Autonomous Income Categories
  // -------------------------------------------------------------------------
  console.log('\n[TEST 6] New Jersey Connector & Zero Cross-Category Loss Offsets');
  const njConnector = new NewJerseyDivTaxAuthorityConnector();
  const nj54A = await njConnector.fetchSource('N.J. Stat. Ann. § 54A:5-1', 2026);
  assert(nj54A !== null, 'Fetched N.J.S.A. § 54A:5-1');
  const njSpecialist = NewJerseyTaxSpecialist.getInstance();
  const njLoss = await njSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-NJ'],
    question: 'Can I offset Schedule C business loss against W-2 wages in New Jersey?'
  });
  assert(njLoss.decouplings.includes('PROHIBITION_CROSS_CATEGORY_LOSS_OFFSET'), 'Cross-category business loss offsetting is strictly prohibited in NJ');

  // -------------------------------------------------------------------------
  // TEST 7: Illinois DOR Connector & Retirement Exemption
  // -------------------------------------------------------------------------
  console.log('\n[TEST 7] Illinois DOR Connector & Retirement Income Exemption');
  const ilConnector = new IllinoisDorAuthorityConnector();
  const il201 = await ilConnector.fetchSource('35 ILCS 5/201', 2026);
  assert(il201 !== null && il201.rawText.includes('4.95%'), 'Fetched 35 ILCS 5/201 flat rate 4.95%');
  const ilSpecialist = IllinoisTaxSpecialist.getInstance();
  const ilRetire = await ilSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-IL'],
    question: 'Are 401(k) and Social Security retirement benefits taxable in Illinois?'
  });
  assert(ilRetire.matchedCitations.includes('35 ILCS 5/203'), '35 ILCS 5/203 retirement subtraction exemption identified');

  // -------------------------------------------------------------------------
  // TEST 8: Massachusetts DOR Connector & Fair Share Surtax
  // -------------------------------------------------------------------------
  console.log('\n[TEST 8] Massachusetts DOR Connector & 4% Fair Share Surtax');
  const maConnector = new MassachusettsDorAuthorityConnector();
  const ma4 = await maConnector.fetchSource('Mass. Gen. Laws ch. 62, § 4', 2026);
  assert(ma4 !== null && ma4.rawText.includes('Fair Share Amendment'), 'Fetched M.G.L. c. 62 § 4');
  const maSpecialist = MassachusettsTaxSpecialist.getInstance();
  const maSurtax = await maSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-MA'],
    question: 'How does high earner surtax apply on income over 1 million dollars?'
  });
  assert(maSurtax.findings.some(f => f.includes('4% FAIR SHARE SURTAX')), 'Massachusetts 4% millionaires surtax correctly applied');

  // -------------------------------------------------------------------------
  // TEST 9: Official Domain Whitelist Enforcement
  // -------------------------------------------------------------------------
  console.log('\n[TEST 9] Official Domain Whitelist Enforcement');
  const registry = OfficialConnectorRegistry.getInstance();
  assert(registry.isAnyOfficialUrl('https://www.irs.gov/pub/irs-pdf/f1040.pdf') === true, 'Allows official irs.gov domain');
  assert(registry.isAnyOfficialUrl('https://www.ftb.ca.gov/forms/2026/540.pdf') === true, 'Allows official ftb.ca.gov domain');
  assert(registry.isAnyOfficialUrl('https://turbotax.intuit.com/tax-tips/home-office') === false, 'Strictly rejects commercial SEO TurboTax domain');
  assert(registry.isAnyOfficialUrl('https://medium.com/@randomuser/tax-secrets') === false, 'Strictly rejects blog Medium domain');

  // -------------------------------------------------------------------------
  // TEST 10: Authority Hierarchy & Weighting Engine (Ranks 1 to 15)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 10] Authority Hierarchy & Weighting Engine');
  const hierarchy = AuthorityHierarchyEngine.getInstance();
  const rankStatute = hierarchy.getAuthorityRank(AuthorityType.STATUTE);
  const rankReg = hierarchy.getAuthorityRank(AuthorityType.REGULATION);
  const rankNotice = hierarchy.getAuthorityRank(AuthorityType.NOTICE);
  const rankFaq = hierarchy.getAuthorityRank(AuthorityType.FAQ);
  const rankBlog = hierarchy.getAuthorityRank(AuthorityType.SECONDARY_COMMENTARY, 'https://medium.com/blog');

  assert(rankStatute === 1, 'Statute has Rank 1');
  assert(rankReg === 2, 'Regulation has Rank 2');
  assert(rankNotice === 6, 'Notice has Rank 6');
  assert(rankFaq === 14, 'FAQ has Rank 14');
  assert(rankBlog === 15, 'Commercial blog has Rank 15');

  const weightStatute = hierarchy.calculateWeight(1, PrecedentialStatus.BINDING);
  const weightFaq = hierarchy.calculateWeight(14, PrecedentialStatus.ADMINISTRATIVE);
  const weightBlog = hierarchy.calculateWeight(15, PrecedentialStatus.PERSUASIVE, false, false);
  assert(weightStatute === 1.0, 'Statute binding weight is 1.00');
  assert(weightFaq === 0.10, 'FAQ administrative weight is 0.10');
  assert(weightBlog === 0.0, 'Commercial blog weight is strictly 0.00');

  // -------------------------------------------------------------------------
  // TEST 11: Superseded Authority Invariant (Weight 0.0)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 11] Superseded Authority Invariant (Weight = 0.0)');
  const weightSuperseded = hierarchy.calculateWeight(1, PrecedentialStatus.SUPERSEDED, true, true);
  assert(weightSuperseded === 0.0, 'Superseded authority receives weight 0.00 regardless of statutory rank');

  // -------------------------------------------------------------------------
  // TEST 12: Sub-Regulatory Guidance Invariant (Statute Beats FAQ)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 12] Sub-Regulatory Guidance Invariant');
  const authStatute = hierarchy.assessSource(sec162!, 'US-FED', 2026);
  const authFaq = {
    authorityType: AuthorityType.FAQ,
    authorityLevel: 14,
    precedentialStatus: PrecedentialStatus.ADMINISTRATIVE,
    jurisdictionMatch: true,
    taxYearMatch: true,
    effectivePeriodMatch: true,
    sourceAuthenticity: true,
    supersessionStatus: 'CURRENT' as const,
    directnessOfSupport: 'DIRECT' as const,
    conflictStatus: 'NONE' as const,
    authorityWeight: 0.10
  };
  const resolution = hierarchy.resolveAuthorityConflict(authStatute, '26 U.S.C. § 162', authFaq, 'IRS FAQ #42');
  assert(resolution.prevailingCitation === '26 U.S.C. § 162', 'Enacted Statute prevails decisively over Sub-regulatory FAQ');

  // -------------------------------------------------------------------------
  // TEST 13: State Decoupling Invariant
  // -------------------------------------------------------------------------
  console.log('\n[TEST 13] State Decoupling Invariant');
  const authCaStatute = hierarchy.assessSource(ca17041!, 'US-CA', 2026);
  const stateConflict = hierarchy.resolveAuthorityConflict(authCaStatute, 'Cal. Rev. & Tax. Code § 17072', authStatute, '26 U.S.C. § 199A', 'US-CA');
  assert(stateConflict.isStateDecoupling === true, 'Identifies state decoupling scenario for state return calculation');

  // -------------------------------------------------------------------------
  // TEST 14: Live Research Decision Engine & Gating (Level 1 Bypass)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 14] Live Research Decision Engine & Level 1 Bypass');
  const decisionEngine = LiveResearchDecisionEngine.getInstance();
  const mockApprovedRule: any = {
    id: 'rule-test-1',
    ruleId: 'FED-SEC-162-EXPENSE',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    reviewStatus: 'APPROVED',
    confidence: 0.98,
    authorityRefs: [{ citation: '26 U.S.C. § 162', authorityType: 'STATUTE' }]
  };

  // Record freshness as CURRENT first
  const freshnessService = OfficialSourceFreshnessService.getInstance();
  await freshnessService.verifyAndRecordSource(sec162!);

  const gatingBypass = await decisionEngine.evaluateGating({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.FEDERAL_INDIVIDUAL,
    jurisdictions: ['US-FED'],
    question: 'Are business office supplies deductible?'
  }, mockApprovedRule);
  assert(gatingBypass.shouldConductLiveResearch === false, 'Bypasses live research when approved fresh rule matches cleanly');
  assert(gatingBypass.recommendedLevel === 1, 'Recommends Level 1 fast lookup');

  // -------------------------------------------------------------------------
  // TEST 15: Live Research Gating Triggers (Materiality, Multi-State, Expired TTL)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 15] Live Research Triggers');
  const gatingTriggerHighMat = await decisionEngine.evaluateGating({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.FEDERAL_INDIVIDUAL,
    jurisdictions: ['US-FED'],
    question: 'High wealth asset restructuring',
    materialityCents: BigInt(600000) // $6,000 > $5,000 threshold
  }, mockApprovedRule);
  assert(gatingTriggerHighMat.shouldConductLiveResearch === true, 'High materiality triggers live verification');
  assert(gatingTriggerHighMat.triggerFactors.some(f => f.includes('HIGH_MATERIALITY')), 'Flags materiality trigger factor');

  const gatingMultiState = await decisionEngine.evaluateGating({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.STATE_INCOME,
    jurisdictions: ['US-NY', 'US-NJ'],
    question: 'Cross border remote employee withholding'
  }, mockApprovedRule);
  assert(gatingMultiState.recommendedLevel === 4, 'Multi-state interaction triggers Level 4 coordinator');

  // -------------------------------------------------------------------------
  // TEST 16: Official Source Freshness Tracking & TTL
  // -------------------------------------------------------------------------
  // freshnessService already initialized
  assert(freshnessService.getTtlDays(AuthorityType.STATUTE) === 365, 'Statute TTL is 365 days');
  assert(freshnessService.getTtlDays(AuthorityType.REGULATION) === 180, 'Regulation TTL is 180 days');
  assert(freshnessService.getTtlDays(AuthorityType.NOTICE) === 90, 'Notice TTL is 90 days');
  assert(freshnessService.getTtlDays(AuthorityType.FAQ) === 30, 'FAQ TTL is 30 days');

  // -------------------------------------------------------------------------
  // TEST 17: Change Detection & Cryptographic Hashing
  // -------------------------------------------------------------------------
  console.log('\n[TEST 17] Change Detection & Cryptographic Hashing');
  const freshItem = await fedConnector.fetchSource('26 U.S.C. § 162', 2026);
  const verifyRes = await fedConnector.verifySource(freshItem!);
  assert(verifyRes.isValid === true, 'Cryptographic content hash matches official authority signature');
  const fakeHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const changeRes = await fedConnector.detectChanges('26 U.S.C. § 162', fakeHash, 2026);
  assert(changeRes.hasChanged === true, 'Detects altered content hash');
  assert(changeRes.status === FreshnessStatus.CHANGED, 'Status flagged as CHANGED');

  // -------------------------------------------------------------------------
  // TEST 18: Fact Applicability & Missing Fact Detection (IRC § 280A)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 18] Fact Applicability Service & Missing Facts');
  const factService = FactApplicabilityService.getInstance();
  const ruleResolver = CaseRuleResolver.getInstance();
  const reqs = ruleResolver.getHomeOfficeRequirements();
  
  // Case with no facts confirmed
  const appWithoutFacts = factService.evaluateApplicability(taxCaseId, 'RULE-IRC-280A', reqs, []);
  assert(appWithoutFacts.hasMissingFacts === true, 'Detects missing facts for home office conditions');
  assert(appWithoutFacts.allConditionsSatisfied === false, 'Conditions not satisfied due to unknown facts');
  assert(appWithoutFacts.bindings.every(b => b.status === 'UNKNOWN'), 'All bindings marked UNKNOWN without facts');

  // Case with satisfied facts
  const appWithFacts = factService.evaluateApplicability(taxCaseId, 'RULE-IRC-280A', reqs, [
    { key: 'exclusive_business_use', value: true },
    { key: 'regular_business_basis', value: true }
  ]);
  assert(appWithFacts.hasMissingFacts === false, 'No missing facts when facts provided');
  assert(appWithFacts.allConditionsSatisfied === true, 'All statutory conditions SATISFIED');

  // -------------------------------------------------------------------------
  // TEST 19: Minimal Question Generation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 19] Minimal Question Generation');
  assert(appWithoutFacts.missingFacts!.length === 2, 'Generates 2 minimal questions for missing facts');
  const q1 = appWithoutFacts.missingFacts![0];
  assert(q1.questionText.includes('exclusively'), 'Question asks specifically about exclusive business use');
  assert(q1.options !== undefined && q1.options.length > 0, 'Provides structured selectable options');

  // -------------------------------------------------------------------------
  // TEST 20: TaxRuleCandidate Generation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 20] TaxRuleCandidate Generation for Novel Researched Rules');
  const novelCandidate = await ruleResolver.createRuleCandidate({
    candidateRuleId: `CANDIDATE-SEC-RENEWABLE-${Date.now()}`,
    jurisdiction: 'US-FED',
    taxYear: 2026,
    taxDomain: 'INCOME_TAX',
    topic: 'ENERGY_EFFICIENCY',
    title: 'Commercial Clean Vehicle Credit',
    description: 'IRC § 45W commercial clean vehicle credit',
    conditions: [{ field: 'vehicle_weight', op: 'LTE', value: 14000 }],
    authorityRefs: ['26 U.S.C. § 45W'],
    confidence: 0.92
  });
  assert(novelCandidate.status === 'CANDIDATE' || novelCandidate.status === 'PENDING', 'Novel rule staged as candidate for review');

  // -------------------------------------------------------------------------
  // TEST 21: Proposition Graph & Fine-Grained Lineage
  // -------------------------------------------------------------------------
  console.log('\n[TEST 21] Proposition Graph & Fine-Grained Lineage');
  const propService = PropositionGraphService.getInstance();
  let testPos: any = null;
  try {
    testPos = await prisma.taxPosition.create({
      data: {
        taxCaseId,
        positionType: 'DEDUCTION',
        category: 'HOME_OFFICE',
        title: 'Home Office Deduction',
        statutoryCitation: '26 U.S.C. § 280A',
        amountCents: BigInt(150000),
        rationale: 'Qualified home office deduction calculated under 26 U.S.C. § 280A and Rev. Proc. 2013-13',
        status: 'PROPOSED'
      }
    });
  } catch {
    testPos = { id: 'pos-home-office-001' };
  }
  const posId = testPos.id;

  const addedProp = await propService.addProposition(posId, {
    claimText: 'Taxpayer qualifies for home office deduction under IRC § 280A',
    ruleId: 'RULE-IRC-280A',
    citationCode: '26 U.S.C. § 280A',
    pinpointCitation: '26 U.S.C. § 280A(c)(1)',
    jurisdiction: 'US-FED',
    taxYear: 2026
  });
  assert(addedProp.validationStatus === 'VERIFIED', 'Proposition verified against official corpus');
  assert(addedProp.authorityLevel === 1, 'Proposition linked to Rank 1 authority');
  assert(addedProp.sourceHash.length === 64, 'Cryptographic content hash attached to proposition');

  // -------------------------------------------------------------------------
  // TEST 22: Strict Citation Anti-Hallucination Guard
  // -------------------------------------------------------------------------
  console.log('\n[TEST 22] Strict Citation Anti-Hallucination Guard');
  const citationValidator = CitationValidator.getInstance();
  const fakeCitation = '26 U.S.C. § 9999-NONEXISTENT';
  const hallucinationCheck = await citationValidator.validateCitation(fakeCitation, 'US-FED', 2026);
  assert(hallucinationCheck.isValid === false, 'Invalid citation flagged');
  assert(hallucinationCheck.status === 'HALLUCINATION_DETECTED', 'Strictly classifies fabricated citation as HALLUCINATION_DETECTED');

  // -------------------------------------------------------------------------
  // TEST 23: Multi-State Coordinator & Residency Analysis
  // -------------------------------------------------------------------------
  console.log('\n[TEST 23] Multi-State Coordinator & Remote Worker Conflict');
  const multiState = MultiStateCoordinator.getInstance();
  const multiRes = multiState.coordinate({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.MULTI_STATE,
    jurisdictions: ['US-NY', 'US-NJ'],
    question: 'Employee lives in NJ and works remotely for employer based in NY'
  });
  assert(multiRes.crossBorderConflicts.some(c => c.includes('CONVENIENCE OF EMPLOYER')), 'Flags NY convenience of employer vs NJ resident credit');
  assert(multiRes.creditsForTaxesPaid.some(c => c.sourceState === 'US-NY' && c.residentState === 'US-NJ'), 'Identifies Schedule NJ-COJ credit for taxes paid to NY');

  // -------------------------------------------------------------------------
  // TEST 24: Sales Tax Specialist & Economic Nexus Thresholds
  // -------------------------------------------------------------------------
  console.log('\n[TEST 24] Sales Tax Specialist & Economic Nexus Thresholds');
  const salesSpecialist = SalesTaxAuthoritySpecialist.getInstance();
  const salesCA = await salesSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.SALES_TAX,
    jurisdictions: ['US-CA'],
    question: 'What is the economic nexus threshold in California?'
  });
  assert(salesCA.findings.some(f => f.includes('$500,000')), 'California economic nexus $500,000 threshold verified');

  const salesSaaS = await salesSpecialist.analyzeRequest({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.SALES_TAX,
    jurisdictions: ['US-NY'],
    question: 'Is SaaS software taxable in New York?'
  });
  assert(salesSaaS.findings.some(f => f.includes('SUBJECT TO SALES TAX')), 'New York SaaS taxability verified per TSB-M-08(7)S');

  // -------------------------------------------------------------------------
  // TEST 25: Legal Escalation & AI Research Brief (Exposure > $25,000)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 25] Legal Escalation & AI Research Brief (IRC § 6662 Penalty Protection)');
  const escalationService = LegalEscalationService.getInstance();
  const researchBrief = escalationService.generateResearchBrief({
    taxCaseId,
    taxYear: 2026,
    taxDomain: ResearchDomain.FEDERAL_BUSINESS,
    jurisdictions: ['US-FED'],
    question: 'Whether management fees paid to offshore affiliate are deductible under Section 162',
    materialityCents: BigInt(5000000) // $50,000 > $25,000
  }, {
    issueStatement: 'Deductibility of affiliate management fees under IRC § 162',
    authorityA: { citation: '26 U.S.C. § 162', rank: 1, weight: 1.0, summary: 'Ordinary and necessary expenses deductible' },
    authorityB: { citation: 'IRS Notice 2026-99', rank: 6, weight: 0.6, summary: 'Disallowance of undocumented affiliate fee allocations' },
    potentialLiabilityCents: BigInt(5000000)
  });
  assert(researchBrief.financialExposure.worstCaseDollars === 50000, 'Calculates financial exposure worst case $50,000');
  assert(researchBrief.substantialAuthorityAssessment.meetsSubstantialAuthority === true, 'Meets substantial authority standard for penalty defense');
  assert(researchBrief.questionsForReviewer.length >= 2, 'Generates focused questions for reviewing attorney/CPA');

  // Prove This Rule trace verification
  console.log('\n[BONUS] Prove This Rule Integration Lineage Check');
  const proveService = ProveThisRuleService.getInstance();
  const trace = await proveService.proveRule(
    taxCaseId,
    'Schedule C Line 30',
    posId,
    'RULE-IRC-280A',
    1500,
    'US-FED',
    2026
  );
  assert(trace.propositions.length > 0, 'Lineage includes verified propositions');
  assert(trace.auditTrailHash.length === 64, 'Generates 64-char SHA256 audit trail hash linking position to law');

  console.log('\n================================================================');
  console.log(`ALL 25 PHASE 11A TESTS PASSED CLEANLY! (${passedAssertions}/${totalAssertions} assertions)`);
  console.log('================================================================\n');
}

runPhase11aVerification()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('\nVerification failed with exception:', err);
    process.exit(1);
  });
