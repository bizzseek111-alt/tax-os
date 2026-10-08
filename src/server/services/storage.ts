import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoragePutResult {
  storageKey: string;
  sha256: string;
  sizeBytes: number;
}

export interface IObjectStorageProvider {
  putObject(buffer: Buffer, key: string, mimeType: string): Promise<StoragePutResult>;
  getObject(key: string): Promise<Buffer>;
  verifyObjectSha256(key: string, expectedSha256: string): Promise<boolean>;
  deleteObject(key: string): Promise<void>;
}

export class LocalDiskStorageProvider implements IObjectStorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'storage', 'vault');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async putObject(buffer: Buffer, key: string, _mimeType: string): Promise<StoragePutResult> {
    const fullPath = path.join(this.baseDir, key);
    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Compute SHA-256 hash
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
    const fullPath = path.join(this.baseDir, key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`OBJECT_NOT_FOUND: ${key}`);
    }
    return fs.promises.readFile(fullPath);
  }

  async verifyObjectSha256(key: string, expectedSha256: string): Promise<boolean> {
    const buffer = await this.getObject(key);
    const actualSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    return actualSha256 === expectedSha256;
  }

  async deleteObject(key: string): Promise<void> {
    const fullPath = path.join(this.baseDir, key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

// Factory instantiation
export const objectStorage: IObjectStorageProvider = new LocalDiskStorageProvider();
