---
name: calculation-filing
description: Deterministic calculation and electronic filing supervisor, compiling official tax forms, validating Schematron rules, capturing Form 8879 signatures, and transmitting MeF packages.
---

# Calculation & Filing Skill

## 1. Trigger
Invoked during `CALCULATION`, `READY_TO_FILE`, `SIGNED`, `SUBMITTED`, and `REJECTED` states.

## 2. Purpose
Serves as the deterministic compilation and transmission gateway of Autonomous Tax OS. Executes mathematical tax engines, maps results onto official IRS Form 1040 and state forms, validates IRS Schematron XML schemas, captures cryptographic Form 8879 e-signatures, and manages A2A transmission to government servers.

## 3. Responsibilities
* Orchestrates worker agents: `TaxEngineAdapter`, `FederalCalculationCoordinator`, `StateCalculationCoordinator`, `FormMappingAgent`, `FilingPayloadAgent`, `SignatureAuthorizationAgent`, `SubmissionAgent`, `FilingStatusAgent`, `RejectionResolutionAgent`.
* Executes deterministic calculations: Tax brackets, self-employment tax, alternative minimum tax, QBI deduction, credits, and state additions/subtractions.
* Compiles IRS MeF XML schemas and state e-file packages.
* Validates XML against official IRS Schematron business rules.
* Captures taxpayer and ERO electronic signatures compliant with IRS Publication 1345.
* Transmits encrypted SOAP envelopes via mutual TLS 1.3 to IRS and state gateways.
* Polls submission status and resolves rejection error codes.

## 4. Non-Responsibilities
* Does NOT use LLMs to perform arithmetic or tax bracket math.
* Does NOT formulate new tax deductions (operates strictly on verified facts).

## 5. Required Context
* Verified, adversarially cleared `TaxPosition` objects and facts.
* Registered ERO (Electronic Return Originator) credentials (EFIN/ETIN).
* Active tax year IRS MeF schema version.

## 6. Allowed Inputs
* `verifiedCaseData`: Complete case snapshot.
* `signaturePayload`: Taxpayer Form 8879 e-signature data.

## 7. Allowed Tools
* `deterministic_engine_calculate`: Calls deterministic math module.
* `mef_xml_compile`: Generates IRS/State XML trees.
* `schematron_validate`: Validates XML against IRS business rules.
* `mef_soap_transmit`: Sends encrypted transmission to IRS MeF server.
* `mef_poll_ack`: Retrieves official 901 XML acknowledgement files.

## 8. Allowed Reads
* Entire verified `TaxCase` facts, positions, and calculations.
* Tokenization vault (for detokenizing SSNs during final XML packaging).

## 9. Allowed Writes
* `TaxCase.deterministicCalculations`
* `TaxCase.filingSubmission`
* `TaxCase.lifecycleState` (advancing to `SUBMITTED`, `ACCEPTED`, or `REJECTED`)

## 10. Output Schema
Conforms to standard `AgentResult<FilingSubmissionResult>`:
```typescript
{
  status: 'SUCCESS',
  result: {
    submissionId: 'sub_irs_2026_99481928',
    federalStatus: 'ACCEPTED',
    stateStatuses: { 'CA': 'ACCEPTED', 'NY': 'ACCEPTED' },
    irsAcknowledgmentCode: 'A',
    transmissionTimestamp: '2027-04-12T16:30:00Z',
    efinUsed: '123456'
  },
  confidence: 1.0,
  auditMetadata: { ... }
}
```

## 11. Confidence Handling
Filing requires 100% mathematical and schema certainty. If Schematron validation emits a single warning or error, transmission is blocked.

## 12. Audit Requirements
The exact XML submission byte stream, IRS submission ID, transmission timestamp, and raw 901 Acknowledgement XML are permanently archived in immutable WORM storage.

## 13. Security Restrictions
* Only authorized MeF transmission workers possess access to the SSN detokenization vault.
* PII clearance: `UNMASKED_PII_CLEARANCE` (strictly restricted to the isolated gateway worker).

## 14. Tax Safeguards
* **Zero Math in Prompts**: All tax math is performed by verified TypeScript/Python deterministic engines.
* **Schema Validation**: Returns cannot be transmitted without 100% schema validation.
* **Signature Mandate**: Electronic transmission without a valid Form 8879 signature manifest is cryptographically blocked.

## 15. Failure States
* IRS Schematron Reject Code: Routes directly to `RejectionResolutionAgent` for automated diagnosis and remediation.
* MeF server timeout: Retries polling with exponential backoff.

## 16. Escalation Target
Platform Tax Operations Manager (for submission rejections) or Engineering On-Call (for gateway connection issues).

## 17. Evaluation Cases
* Compiles Form 1040 with Schedules 1, 2, 3, C, and SE with zero schema validation errors.
* Successfully captures Form 8879 e-signature manifest with IP address and timestamp.
* Accurately parses IRS reject code `IND-031-04` (prior year AGI mismatch) and requests prior return.

## 18. Definition of Done
The tax return is mathematically computed with bit-exact precision, validated against official IRS schemas, signed with legal e-signatures, transmitted to IRS and state taxing authorities, and acknowledged as `ACCEPTED`.
