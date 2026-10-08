# Phase 9: E-Signature Provider Abstraction & Webhook Security

## Overview

TaxOS integrates e-signature capabilities via an extensible `ESignProvider` abstraction, supporting DocuSign, HelloSign/Dropbox Sign, Adobe Sign, or internal signing engines. The platform maintains a zero-trust posture: signature events received via webhooks must be cryptographically authenticated using HMAC-SHA256 digests and protected against replay attacks.

---

## `ESignProvider` Interface

The abstraction defines standard contracts for signature lifecycle orchestration:

```typescript
export interface ESignProvider {
  providerName: string;
  createSignatureEnvelope(params: {
    taxCaseId: string;
    returnVersionId: string;
    signers: Array<{
      name: string;
      email: string;
      role: 'PRIMARY_TAXPAYER' | 'SECONDARY_TAXPAYER' | 'PREPARER' | 'ERO';
    }>;
    documentTitle: string;
    documentPdfBuffer?: Buffer;
  }): Promise<{ envelopeId: string; status: string; signingUrls: Record<string, string> }>;

  getEnvelopeStatus(envelopeId: string): Promise<{
    envelopeId: string;
    status: 'SENT' | 'DELIVERED' | 'COMPLETED' | 'DECLINED' | 'VOIDED';
    completedAt?: Date;
    signedDocumentHash?: string;
  }>;

  verifyWebhookPayload(rawPayload: string, signatureHeader: string, secretKey: string): boolean;
}
```

---

## Sandbox Implementation (`SandboxESignProvider`)

For local testing and staging without external cloud provider accounts:
- Emulates envelope creation with deterministically generated `envelopeId`s.
- Allows simulation of signer viewing, signing, and completion transitions.
- Generates simulated signed document SHA-256 hashes.
- Provides compliant HMAC-SHA256 signature verification matching production webhook standards.

---

## Webhook Security Architecture

All inbound e-signature webhooks to `/api/v1/filing/signature/webhook` are processed through `FilingSecurityService.verifyWebhookSignature`:

1. **Replay Protection (In-Memory / Distributed Cache):**
   - Each webhook payload must contain a unique `eventId`.
   - Processed IDs are cached; duplicate transmissions are rejected immediately (`DUPLICATE_WEBHOOK_EVENT`).

2. **Timestamp Freshness Verification:**
   - Webhooks must include a `X-TaxOS-Timestamp` or `timestampHeader` unix millisecond header.
   - Any payload with $|t_{\text{now}} - t_{\text{header}}| > 300\text{ seconds}$ is rejected (`EXPIRED_TIMESTAMP`).

3. **Constant-Time HMAC-SHA256 Digest Verification:**
   - Expected signature: $\text{HMAC-SHA256}(K, \text{timestampHeader} \cdot \text{rawPayload})$.
   - Input buffers are verified for matching length before calling `crypto.timingSafeEqual` to avoid timing side-channels and buffer length exceptions:
   ```typescript
   const expectedBuf = Buffer.from(expectedSignature);
   const cleanedBuf = Buffer.from(cleanedHeader);
   if (expectedBuf.length !== cleanedBuf.length) {
     return { isValid: false, failureReason: 'SIGNATURE_MISMATCH' };
   }
   const isValid = crypto.timingSafeEqual(expectedBuf, cleanedBuf);
   ```
