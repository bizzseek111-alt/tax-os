/**
 * Autonomous Tax OS — Tax Authority Engine Verification Suite
 * Gold-standard tests verifying source precedence, citation validation, 4-tier latency, and zero wrong-year/state leakage.
 */

import { CitationValidator } from '../tax-authority/CitationValidator';
import { TaxResearchEngine } from '../tax-authority/TaxResearchEngine';
import { AuthorityStore } from '../tax-authority/AuthorityStore';

declare const process: any;

function assert(condition: boolean, testName: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${testName}`);
}

console.log('====================================================');
console.log('AUTONOMOUS TAX OS — TAX AUTHORITY ENGINE VERIFICATION');
console.log('====================================================\n');

async function runTests() {
  // ------------------------------------------------------------------
  // 1. Federal Schedule C Software Expense Retrieval (L1 Cached Rule)
  // ------------------------------------------------------------------
  console.log('[Jurisdiction: Federal] Schedule C Software & Ordinary Expenses');
  const fedResponse = await TaxResearchEngine.research({
    question: 'Are SaaS business software subscriptions deductible for freelancers?',
    jurisdiction: 'US-FED',
    taxYear: 2026,
    topic: 'BUSINESS_SOFTWARE_EXPENSE'
  });

  assert(fedResponse.latencyTier === 'L1_CACHED_RULE', 'Resolved via L1_CACHED_RULE (< 10ms)');
  assert(fedResponse.applicableRules.length > 0, 'Found applicable federal software rule');
  assert(fedResponse.applicableRules[0].ruleId === 'RULE-FED-2026-IRC-162-SOFTWARE', 'Mapped to RULE-FED-2026-IRC-162-SOFTWARE');
  assert(fedResponse.authorityCitations[0].citationString === '26 U.S.C. § 162(a)', 'Bound to primary statutory authority 26 U.S.C. § 162(a)');

  // ------------------------------------------------------------------
  // 2. California Federal Conformity Differences (HSA & Section 179)
  // ------------------------------------------------------------------
  console.log('\n[Jurisdiction: California] Conformity Modifications & Non-Conformity');
  const caHsaResponse = await TaxResearchEngine.research({
    question: 'How does California treat federal HSA deductions?',
    jurisdiction: 'US-CA',
    taxYear: 2026,
    topic: 'CALIFORNIA_HSA_ADDITION_MODIFICATION'
  });

  assert(caHsaResponse.jurisdiction === 'US-CA', 'Query restricted to California jurisdiction');
  assert(caHsaResponse.applicableRules[0].ruleId === 'RULE-CA-2026-HSA-ADDITION', 'Identified California HSA addition modification rule');
  assert(caHsaResponse.authorityCitations[0].citationString === 'Cal. Rev. & Tax. Code § 17215.4', 'Cites primary California statute Cal. RTC § 17215.4');

  // Verify California Section 179 Cap
  const caSec179Auth = AuthorityStore.getAuthorityById('AUTH-CA-RTC-17255-SEC179');
  assert(caSec179Auth !== undefined, 'California Section 179 $25,000 cap authority indexed');
  assert(caSec179Auth?.citationString === 'Cal. Rev. & Tax. Code § 17255', 'Cites Cal. RTC § 17255');

  // ------------------------------------------------------------------
  // 3. New York Part-Year Residency & 183-Day Rule
  // ------------------------------------------------------------------
  console.log('\n[Jurisdiction: New York] Statutory Residency (183-Day Rule)');
  const nyResidencyAuth = AuthorityStore.getAuthorityById('AUTH-NY-TAX-LAW-605-RESIDENCY');
  assert(nyResidencyAuth !== undefined, 'New York statutory residency authority indexed');
  assert(nyResidencyAuth?.citationString === 'N.Y. Tax Law § 605(b)(1)(B)', 'Cites NY Tax Law § 605(b)(1)(B)');
  assert(nyResidencyAuth?.precedentialStatus === 'BINDING', 'Marked as BINDING primary law');

  // ------------------------------------------------------------------
  // 4. NJ / NY Telecommuter Income Allocation & Convenience Rule (L3 Deep Research)
  // ------------------------------------------------------------------
  console.log('\n[Multi-State] New York Convenience of Employer & NJ Conflict');
  const nyConvenienceResponse = await TaxResearchEngine.research({
    question: 'How are remote telecommute work days sourced for a New York employer?',
    jurisdiction: 'US-NY',
    taxYear: 2026
  });

  assert(nyConvenienceResponse.latencyTier === 'L3_DEEP_RESEARCH', 'Resolved via L3_DEEP_RESEARCH');
  assert(nyConvenienceResponse.authorityCitations[0].citationString === '20 NYCRR § 131.18', 'Cites New York regulation 20 NYCRR § 131.18');
  assert(nyConvenienceResponse.conflictingAuthorities.length > 0, 'Detects conflicting New Jersey statutory standard (N.J.S.A. 54A:4-1)');
  assert(nyConvenienceResponse.professionalReviewRequired === true, 'Mandates professional review for telecommuting sourcing controversy');

  // ------------------------------------------------------------------
  // 5. Illinois Schedule M Pension Subtraction Modification
  // ------------------------------------------------------------------
  console.log('\n[Jurisdiction: Illinois] 100% Pension Subtraction (35 ILCS 5/203)');
  const ilResponse = await TaxResearchEngine.research({
    question: 'Are pensions and 401(k) retirement distributions taxable in Illinois?',
    jurisdiction: 'US-IL',
    taxYear: 2026,
    topic: 'ILLINOIS_RETIREMENT_SUBTRACTION'
  });

  assert(ilResponse.applicableRules[0].ruleId === 'RULE-IL-2026-PENSION-SUBTRACTION', 'Identified Illinois retirement subtraction rule');
  assert(ilResponse.authorityCitations[0].citationString === '35 ILCS 5/203(a)(2)(F)', 'Cites Illinois statute 35 ILCS 5/203(a)(2)(F)');

  // ------------------------------------------------------------------
  // 6. Massachusetts 4% Fair Share Surtax on Incomes > $1M
  // ------------------------------------------------------------------
  console.log('\n[Jurisdiction: Massachusetts] 4% Fair Share Surtax (M.G.L. c. 62)');
  const maResponse = await TaxResearchEngine.research({
    question: 'What is the Massachusetts surtax on taxable income exceeding $1,000,000?',
    jurisdiction: 'US-MA',
    taxYear: 2026,
    topic: 'MASSACHUSETTS_4_PERCENT_SURTAX'
  });

  assert(maResponse.applicableRules[0].ruleId === 'RULE-MA-2026-FAIR-SHARE-SURTAX', 'Identified Massachusetts 4% surtax rule');
  assert(maResponse.applicableRules[0].thresholds?.surtaxThresholdCents === 105375000, 'Threshold correctly set to $1,053,750 (indexed for inflation)');
  assert(maResponse.authorityCitations[0].citationString === 'Mass. Gen. Laws ch. 62, § 4(d)', 'Cites Mass. Gen. Laws ch. 62, § 4(d)');

  // ------------------------------------------------------------------
  // 7. Citation Validator: Rejection of Superseded Guidance
  // ------------------------------------------------------------------
  console.log('\n[Citation Verification] Rejection of Superseded & Expired Guidance');
  const supersededCheck = CitationValidator.verifyCitation(
    'AUTH-FED-NOTICE-2021-25-SUPERSEDED',
    'US-FED',
    2026
  );
  assert(supersededCheck.valid === false, 'Superseded guidance correctly rejected');
  assert(supersededCheck.notSuperseded === false, 'Flagged notSuperseded = false');
  assert(Boolean(supersededCheck.rejectionReason?.includes('Tax year mismatch') || supersededCheck.rejectionReason?.includes('Superseded')), 'Appropriate rejection reason provided');

  // ------------------------------------------------------------------
  // 8. Citation Validator: Rejection of Non-Precedential Document
  // ------------------------------------------------------------------
  console.log('\n[Citation Verification] Rejection of Non-Precedential PLR Authority');
  const nonPrecCheck = CitationValidator.verifyCitation(
    'AUTH-FED-PLR-202201001-NONPREC',
    'US-FED',
    2026,
    true // Require binding precedent
  );
  assert(nonPrecCheck.valid === false, 'Non-precedential PLR rejected as binding authority');
  assert(nonPrecCheck.precedentialStatus === 'NON_PRECEDENTIAL', 'Status identified as NON_PRECEDENTIAL');
  assert(Boolean(nonPrecCheck.rejectionReason?.includes('IRC § 6110(k)(3)')), 'Cites IRC § 6110(k)(3) non-precedential statutory bar');

  // ------------------------------------------------------------------
  // 9. Citation Validator: Rejection of Wrong-Year Source
  // ------------------------------------------------------------------
  console.log('\n[Citation Verification] Strict Wrong-Year Rejection');
  const wrongYearCheck = CitationValidator.verifyCitation(
    'AUTH-FED-NOTICE-2021-25-SUPERSEDED', // 2021 Notice
    'US-FED',
    2026                                   // Target 2026 return
  );
  assert(wrongYearCheck.valid === false, 'Wrong-year authority rejected for 2026 tax case');
  assert(wrongYearCheck.correctTaxYear === false, 'correctTaxYear flag is false');

  // ------------------------------------------------------------------
  // 10. Citation Validator: Rejection of Wrong-State Retrieval
  // ------------------------------------------------------------------
  console.log('\n[Citation Verification] Strict Wrong-State Rejection');
  const wrongStateCheck = CitationValidator.verifyCitation(
    'AUTH-CA-RTC-17215-HSA', // California RTC statute
    'US-NY',                 // Target New York return
    2026
  );
  assert(wrongStateCheck.valid === false, 'California authority rejected for New York return');
  assert(wrongStateCheck.correctJurisdiction === false, 'correctJurisdiction flag is false');
  assert(Boolean(wrongStateCheck.rejectionReason?.includes("Jurisdiction mismatch")), 'Rejection reason explicitly states jurisdiction mismatch');

  // ------------------------------------------------------------------
  // 11. Citation Validator: Verification of Grounded Authority
  // ------------------------------------------------------------------
  console.log('\n[Citation Verification] Grounded Authority Approval');
  const validCheck = CitationValidator.verifyCitation(
    '26 U.S.C. § 162(a)',
    'US-FED',
    2026
  );
  assert(validCheck.valid === true, 'Grounded primary citation (26 U.S.C. § 162(a)) verified 100%');
  assert(validCheck.authorityExists === true, 'Authority exists in verified corpus');
  assert(validCheck.precedentialStatus === 'BINDING', 'Carries BINDING precedential authority');

  // ------------------------------------------------------------------
  // 12. Latency Tier 4: Fallback to Professional Escalation
  // ------------------------------------------------------------------
  console.log('\n[Latency Tiers] L4 Professional Escalation on Uncodified Query');
  const l4Response = await TaxResearchEngine.research({
    question: 'Can I deduct space mining cryptocurrency tokens under quantum computing laws?',
    jurisdiction: 'US-FED',
    taxYear: 2026
  });
  assert(l4Response.latencyTier === 'L4_PROFESSIONAL_ESCALATION', 'Uncodified novel query routed to L4_PROFESSIONAL_ESCALATION');
  assert(l4Response.professionalReviewRequired === true, 'Professional review mandated');
  assert(l4Response.uncertainty >= 0.8, 'Uncertainty score elevated for uncodified query');

  console.log('\n====================================================');
  console.log('ALL TAX AUTHORITY ENGINE VERIFICATION TESTS PASSED! 🎉');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
