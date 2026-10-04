/**
 * Autonomous Tax OS — Tax Citation Validator
 * Verifies that legal citations exist, match target tax year and jurisdiction, are un-superseded, and carry binding precedential status.
 */

import { AuthorityStore } from './AuthorityStore';
import { CitationVerificationResult, JurisdictionCode, PrecedentialStatus } from './types';

export class CitationValidator {
  /**
   * Validates a legal authority citation against the authoritative knowledge store.
   */
  public static verifyCitation(
    citationOrAuthorityId: string,
    targetJurisdiction: JurisdictionCode,
    targetTaxYear: number,
    requireBindingPrecedent: boolean = true
  ): CitationVerificationResult {
    // 1. Locate authority by ID or citation string
    const authority = AuthorityStore.AUTHORITIES.find(
      a => a.authorityId === citationOrAuthorityId || a.citationString === citationOrAuthorityId
    );

    if (!authority) {
      return {
        valid: false,
        citationString: citationOrAuthorityId,
        authorityExists: false,
        correctTaxYear: false,
        correctJurisdiction: false,
        notSuperseded: false,
        precedentialStatus: 'NON_PRECEDENTIAL',
        rejectionReason: `Authority does not exist in verified legal corpus: '${citationOrAuthorityId}' (Suspected hallucination).`
      };
    }

    // 2. Verify Jurisdiction Match
    const jurisdictionMatches = authority.jurisdiction === targetJurisdiction;
    if (!jurisdictionMatches) {
      return {
        valid: false,
        citationString: authority.citationString,
        authorityExists: true,
        correctTaxYear: authority.taxYear === targetTaxYear,
        correctJurisdiction: false,
        notSuperseded: !authority.supersededBy,
        precedentialStatus: authority.precedentialStatus,
        rejectionReason: `Jurisdiction mismatch: Authority is from '${authority.jurisdiction}', but query targets '${targetJurisdiction}'.`
      };
    }

    // 3. Verify Tax Year Match & Temporal Validity
    const yearMatches = authority.taxYear === targetTaxYear;
    if (!yearMatches) {
      return {
        valid: false,
        citationString: authority.citationString,
        authorityExists: true,
        correctTaxYear: false,
        correctJurisdiction: true,
        notSuperseded: !authority.supersededBy,
        precedentialStatus: authority.precedentialStatus,
        rejectionReason: `Tax year mismatch: Authority applies to tax year ${authority.taxYear}, but return is for ${targetTaxYear}.`
      };
    }

    // 4. Verify Not Superseded
    const isNotSuperseded = !authority.supersededBy && authority.reviewStatus !== 'DEPRECATED';
    if (!isNotSuperseded) {
      return {
        valid: false,
        citationString: authority.citationString,
        authorityExists: true,
        correctTaxYear: true,
        correctJurisdiction: true,
        notSuperseded: false,
        precedentialStatus: authority.precedentialStatus,
        rejectionReason: `Superseded authority: This guidance has been superseded by '${authority.supersededBy || 'subsequent legislation'}'.`
      };
    }

    // 5. Verify Precedential Status
    if (requireBindingPrecedent && authority.precedentialStatus === 'NON_PRECEDENTIAL') {
      return {
        valid: false,
        citationString: authority.citationString,
        authorityExists: true,
        correctTaxYear: true,
        correctJurisdiction: true,
        notSuperseded: true,
        precedentialStatus: authority.precedentialStatus,
        rejectionReason: `Non-precedential authority: '${authority.title}' cannot be cited as binding authority pursuant to IRC § 6110(k)(3).`
      };
    }

    // 6. All Checks Passed
    return {
      valid: true,
      citationString: authority.citationString,
      authorityExists: true,
      correctTaxYear: true,
      correctJurisdiction: true,
      notSuperseded: true,
      precedentialStatus: authority.precedentialStatus
    };
  }
}
