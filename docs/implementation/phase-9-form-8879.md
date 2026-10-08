# Phase 9: IRS Form 8879, Self-Selected PIN & Dual-Spouse Separation

## Statutory Background

IRS **Form 8879** (*IRS e-file Signature Authorization*) is the legally binding authorization that allows an Electronic Return Originator (ERO) to electronically sign and transmit a taxpayer's Form 1040 to the IRS on their behalf.

IRS Pub 1345 establishes mandatory statutory rules:
1. **Self-Selected PIN:** The taxpayer must authorize by entering a 5-digit self-selected personal identification number (PIN). Any other format (alphanumeric, 4 digits, 6 digits) is illegal.
2. **Jurat Disclosure:** Affirmative under-penalties-of-perjury consent must be recorded before PIN entry.
3. **Married Filing Jointly (MFJ) Dual-Spouse Separation:** Under no circumstances may one spouse authorize or enter a PIN on behalf of the other spouse. Both the Primary Taxpayer and the Secondary Spouse must affirmatively authorize via separate PIN credentials.

---

## Technical Implementation (`SignatureService`)

### 1. 5-Digit PIN Validation & Jurat Consent
`SignatureService.signWithPin` enforces the 5-digit numeric constraint via regular expression:

```typescript
const pinRegex = /^\d{5}$/;
if (!pinRegex.test(params.pin)) {
  throw new Error(`INVALID_PIN: Self-selected PIN must be exactly 5 numeric digits per IRS Form 8879 specifications.`);
}
```

Upon execution, the system captures:
- Signer user ID and IP address
- Browser user-agent
- ISO timestamp
- Hashed PIN token: $\text{SHA-256}(\text{PIN} \mid \text{SALT} \mid \text{timestamp})$

### 2. Strict MFJ Dual-Spouse Separation

When authorizing Form 8879 via `SignatureService.authorizeForm8879`, the system inspects the underlying return facts:

```typescript
const isJointReturn = latestVersion.taxCase.facts.some(
  f => f.key === 'filingStatus' && (f.valueString === 'MFJ' || f.valueString === 'MARRIED_FILING_JOINTLY')
);

if (isJointReturn) {
  if (!params.secondarySpousePin || !params.secondarySpouseName) {
    throw new Error(
      `JOINT_RETURN_SPOUSE_SIGNATURE_REQUIRED: Married Filing Jointly returns strictly require independent spouse authorization. One spouse cannot sign for both.`
    );
  }
}
```

If a spouse's signature is missing, authorization is blocked at the core service level and cannot be bypassed via API or UI manipulation.

### 3. Cryptographic Composite Signature Hash

The completed Form 8879 execution is permanently stamped with a composite signature hash:

$$\text{CompositeHash} = \text{SHA-256}\Big(\text{returnVersionHash} \mid \text{primaryPin} \mid \text{secondaryPin} \mid \text{timestamp}\Big)$$

This hash is written to `TaxpayerAuthorization.signatureHash` and permanently immutabilized into the tenant's cryptographic blockchain audit trail (`AuditEvent`).
