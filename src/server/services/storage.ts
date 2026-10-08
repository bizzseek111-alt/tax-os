import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoragePutResult {
  storageKey: string;
  sha256: string;
  sizeBytes: number;
}

export interface ObjectMetadata {
  key: string;
  sizeBytes: number;
  sha256: string;
  contentType: string;
  createdAt: Date;
}

export interface IObjectStorageProvider {
  putObject(buffer: Buffer, key: string, mimeType: string): Promise<StoragePutResult>;
  getObject(key: string): Promise<Buffer>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getSignedUploadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  headObject(key: string): Promise<ObjectMetadata>;
  verifyHash(key: string, expectedSha256: string): Promise<boolean>;
  verifyObjectSha256(key: string, expectedSha256: string): Promise<boolean>;
}

export class LocalDiskStorageProvider implements IObjectStorageProvider {
  private baseDir: string;
  private secretSignKey: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'storage', 'vault');
    this.secretSignKey = process.env.ENCRYPTION_KEY || 'taxos_storage_secret_key_2026_production';
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    // Prevent directory traversal
    const safeKey = key.replace(/\.\./g, '').replace(/^\/+/, '');
    return path.join(this.baseDir, safeKey);
  }

  async putObject(buffer: Buffer, key: string, _mimeType: string): Promise<StoragePutResult> {
    const fullPath = this.resolveSafePath(key);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Compute cryptographic SHA-256 hash
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // Write file to disk
    await fs.promises.writeFile(fullPath, buffer);

    return {
      storageKey: key,
      sha256,
      sizeBytes: buffer.length,
    };
  }

  async getObject(key: string): Promise<Buffer> {
    const fullPath = this.resolveSafePath(key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`OBJECT_NOT_FOUND: ${key}`);
    }
    return fs.promises.readFile(fullPath);
  }

  async headObject(key: string): Promise<ObjectMetadata> {
    const fullPath = this.resolveSafePath(key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`OBJECT_NOT_FOUND: ${key}`);
    }
    const stat = await fs.promises.stat(fullPath);
    const buffer = await fs.promises.readFile(fullPath);
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    return {
      key,
      sizeBytes: stat.size,
      sha256,
      contentType: 'application/octet-stream',
      createdAt: stat.birthtime,
    };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const signature = crypto
      .createHmac('sha256', this.secretSignKey)
      .update(`${key}|${expiresAt}|DOWNLOAD`)
      .digest('hex');

    return `/api/storage/download?key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${signature}`;
  }

  async getSignedUploadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    const signature = crypto
      .createHmac('sha256', this.secretSignKey)
      .update(`${key}|${expiresAt}|UPLOAD`)
      .digest('hex');

    return `/api/storage/upload?key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${signature}`;
  }

  async verifyHash(key: string, expectedSha256: string): Promise<boolean> {
    const buffer = await this.getObject(key);
    const actualSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    return actualSha256 === expectedSha256;
  }

  // Alias for backward compatibility
  async verifyObjectSha256(key: string, expectedSha256: string): Promise<boolean> {
    return this.verifyHash(key, expectedSha256);
  }

  async deleteObject(key: string): Promise<void> {
    const fullPath = this.resolveSafePath(key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

// Factory export
export const objectStorage: IObjectStorageProvider = new LocalDiskStorageProvider();
