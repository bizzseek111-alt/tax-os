/**
 * Autonomous Tax OS — E-Signature Provider Abstraction & Sandbox Implementation
 * 
 * Provides vendor-agnostic envelope orchestration:
 * - DocuSign / Adobe Sign / HelloSign / Form 8879 native PIN provider
 * - Cryptographic envelope binding (SHA-256)
 * - HMAC-SHA256 webhook signature verification (anti-replay protection)
 */

import crypto from 'crypto';

export interface ESignSigner {
  id: string;
  role: 'PRIMARY_TAXPAYER' | 'SPOUSE' | 'ERO_PREPARER';
  name: string;
  email: string;
  pin?: string;
  routingOrder?: number;
}

export interface ESignEnvelope {
  envelopeId: string;
  documentTitle: string;
  returnVersionHash: string;
  signers: ESignSigner[];
  status: 'CREATED' | 'SENT' | 'DELIVERED' | 'COMPLETED' | 'DECLINED' | 'VOIDED';
  createdAt: Date;
  completedAt?: Date;
  signedDocumentHash?: string;
}

export interface ESignProvider {
  createEnvelope(params: {
    documentTitle: string;
    returnVersionHash: string;
    signers: ESignSigner[];
  }): Promise<ESignEnvelope>;

  addSigner(envelopeId: string, signer: ESignSigner): Promise<ESignEnvelope>;

  send(envelopeId: string): Promise<ESignEnvelope>;

  getStatus(envelopeId: string): Promise<{
    envelopeId: string;
    status: ESignEnvelope['status'];
    signersCompleted: number;
    totalSigners: number;
  }>;

  getSignedDocument(envelopeId: string): Promise<{
    envelopeId: string;
    documentContentBase64: string;
    documentHash: string;
  }>;

  cancel(envelopeId: string, reason: string): Promise<ESignEnvelope>;

  verifyWebhook(payload: string, signatureHeader: string, secret: string): boolean;
}

/**
 * Concrete Sandbox E-Sign Provider for simulation, testing, and Form 8879 workflows.
 */
export class SandboxESignProvider implements ESignProvider {
  private envelopes = new Map<string, ESignEnvelope>();

  public async createEnvelope(params: {
    documentTitle: string;
    returnVersionHash: string;
    signers: ESignSigner[];
  }): Promise<ESignEnvelope> {
    const envelopeId = `env_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const envelope: ESignEnvelope = {
      envelopeId,
      documentTitle: params.documentTitle,
      returnVersionHash: params.returnVersionHash,
      signers: [...params.signers],
      status: 'CREATED',
      createdAt: new Date()
    };
    this.envelopes.set(envelopeId, envelope);
    return envelope;
  }

  public async addSigner(envelopeId: string, signer: ESignSigner): Promise<ESignEnvelope> {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    envelope.signers.push(signer);
    return envelope;
  }

  public async send(envelopeId: string): Promise<ESignEnvelope> {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    envelope.status = 'SENT';
    return envelope;
  }

  public async getStatus(envelopeId: string): Promise<{
    envelopeId: string;
    status: ESignEnvelope['status'];
    signersCompleted: number;
    totalSigners: number;
  }> {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    const completedCount = envelope.status === 'COMPLETED' ? envelope.signers.length : 0;
    return {
      envelopeId,
      status: envelope.status,
      signersCompleted: completedCount,
      totalSigners: envelope.signers.length
    };
  }

  public async getSignedDocument(envelopeId: string): Promise<{
    envelopeId: string;
    documentContentBase64: string;
    documentHash: string;
  }> {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    const mockContent = `FORM_8879_SIGNED_DOCUMENT_PAYLOAD_${envelope.returnVersionHash}`;
    const documentHash = crypto.createHash('sha256').update(mockContent).digest('hex');
    return {
      envelopeId,
      documentContentBase64: Buffer.from(mockContent).toString('base64'),
      documentHash
    };
  }

  public async cancel(envelopeId: string, reason: string): Promise<ESignEnvelope> {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    envelope.status = 'VOIDED';
    return envelope;
  }

  /**
   * Simulates envelope completion (e.g. after all signers enter their 5-digit PINs).
   */
  public completeEnvelope(envelopeId: string): ESignEnvelope {
    const envelope = this.envelopes.get(envelopeId);
    if (!envelope) {
      throw new Error(`ENVELOPE_NOT_FOUND: Envelope '${envelopeId}' does not exist.`);
    }
    envelope.status = 'COMPLETED';
    envelope.completedAt = new Date();
    envelope.signedDocumentHash = crypto
      .createHash('sha256')
      .update(`${envelopeId}_${envelope.returnVersionHash}_COMPLETED`)
      .digest('hex');
    return envelope;
  }

  /**
   * Cryptographically verifies inbound webhook signature against shared secret (HMAC-SHA256).
   */
  public verifyWebhook(payload: string, signatureHeader: string, secret: string): boolean {
    if (!payload || !signatureHeader || !secret) {
      return false;
    }
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const headerClean = signatureHeader.replace(/^sha256=/, '');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(headerClean));
  }
}
