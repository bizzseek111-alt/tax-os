/**
 * Autonomous TaxOS — Async Job Queue & Worker Pipeline (Phase 2)
 * 
 * Implements BullMQ + Redis queue with PostgreSQL persistence,
 * exponential retry backoff, and dead-letter handling (DLQ).
 */

import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../db';
import crypto from 'crypto';

export type IngestionJobType =
  | 'DOCUMENT_UPLOAD_RECEIVED'
  | 'DOCUMENT_SECURITY_SCAN'
  | 'DOCUMENT_HASH'
  | 'DOCUMENT_DEDUPLICATION'
  | 'DOCUMENT_CLASSIFICATION'
  | 'DOCUMENT_OCR'
  | 'DOCUMENT_EXTRACTION'
  | 'DOCUMENT_NORMALIZATION'
  | 'DOCUMENT_FACT_VALIDATION'
  | 'DOCUMENT_ENTITY_MATCHING'
  | 'DOCUMENT_TAX_YEAR_MATCHING'
  | 'DOCUMENT_EVIDENCE_LINKING'
  | 'DOCUMENT_PROCESSING_COMPLETE'
  | 'DOCUMENT_PROCESSING_FAILED'
  | 'FINANCIAL_CONNECTION_CREATED'
  | 'FINANCIAL_ACCOUNT_SYNC'
  | 'TRANSACTION_IMPORT'
  | 'TRANSACTION_NORMALIZATION'
  | 'TRANSACTION_DUPLICATE_CHECK'
  | 'TRANSACTION_ENTITY_RESOLUTION'
  | 'TRANSACTION_EVIDENCE_LINKING'
  | 'FINANCIAL_SYNC_COMPLETE';

export interface JobPayload {
  jobId?: string;
  jobType: IngestionJobType;
  organizationId: string;
  taxCaseId?: string;
  documentId?: string;
  connectionId?: string;
  data: Record<string, any>;
  attemptCount?: number;
  maxAttempts?: number;
  auditReference?: string;
}

export type JobHandler = (job: JobPayload) => Promise<any>;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:54322';

export class IngestionQueueService {
  private static redisClient: IORedis | null = null;
  private static bullQueue: Queue | null = null;
  private static worker: Worker | null = null;
  private static handlers: Map<IngestionJobType, JobHandler> = new Map();
  private static isInitialized = false;

  /**
   * Initializes Redis connection and BullMQ queue.
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      this.redisClient = new IORedis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
          return Math.min(times * 100, 2000);
        },
      });

      this.bullQueue = new Queue('taxos-ingestion-queue', {
        connection: this.redisClient as any,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      });

      // Initialize BullMQ worker
      this.worker = new Worker(
        'taxos-ingestion-queue',
        async (job: Job) => {
          const payload = job.data as JobPayload;
          return this.processJob(payload, job.attemptsMade + 1);
        },
        {
          connection: this.redisClient as any,
          concurrency: 5,
        }
      );

      this.worker.on('failed', async (job: Job | undefined, err: Error) => {
        if (!job) return;
        const payload = job.data as JobPayload;
        console.error(`[Queue Worker Failed] Job ${job.id} (${payload.jobType}): ${err.message}`);

        if (job.attemptsMade >= (payload.maxAttempts || 3)) {
          // Send to Dead-Letter
          await this.markJobDeadLetter(payload, err.message);
        }
      });

      this.isInitialized = true;
      console.log('⚡ [Queue] IngestionQueueService successfully initialized with Redis on port 54322');
    } catch (err: any) {
      console.warn(`⚠️ [Queue] Redis connection failed, falling back to synchronous execution: ${err.message}`);
    }
  }

  /**
   * Registers a domain handler for a specific job type.
   */
  static registerHandler(jobType: IngestionJobType, handler: JobHandler) {
    this.handlers.set(jobType, handler);
  }

  /**
   * Enqueues an ingestion job and persists its state in PostgreSQL.
   */
  static async enqueueJob(payload: JobPayload): Promise<{ jobId: string; status: string }> {
    const jobId = payload.jobId || `job_${payload.jobType.toLowerCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const maxAttempts = payload.maxAttempts || 3;
    const auditReference = payload.auditReference || `audit_${jobId}`;

    const completePayload: JobPayload = {
      ...payload,
      jobId,
      maxAttempts,
      attemptCount: 0,
      auditReference,
    };

    // 1. Persist initial PENDING record in PostgreSQL
    await prisma.ingestionJob.create({
      data: {
        id: jobId,
        jobType: payload.jobType,
        organizationId: payload.organizationId,
        taxCaseId: payload.taxCaseId,
        documentId: payload.documentId,
        status: 'PENDING',
        attemptCount: 0,
        maxAttempts,
        payload: completePayload as any,
        auditReference,
      },
    });

    // 2. Add to BullMQ or execute immediately if worker offline
    if (this.bullQueue) {
      await this.bullQueue.add(payload.jobType, completePayload, {
        jobId,
        attempts: maxAttempts,
      });
    } else {
      // Async background tick
      setImmediate(() => {
        this.processJob(completePayload, 1).catch((e) =>
          console.error(`[Queue In-Memory Error] ${e.message}`)
        );
      });
    }

    return { jobId, status: 'QUEUED' };
  }

  /**
   * Executes a job payload through registered domain handlers.
   */
  private static async processJob(payload: JobPayload, currentAttempt: number) {
    const handler = this.handlers.get(payload.jobType);

    // Update job status to PROCESSING in database
    await prisma.ingestionJob.update({
      where: { id: payload.jobId! },
      data: {
        status: 'PROCESSING',
        attemptCount: currentAttempt,
        startedAt: new Date(),
      },
    });

    if (!handler) {
      const errorMsg = `No handler registered for job type ${payload.jobType}`;
      await this.markJobFailed(payload, errorMsg, currentAttempt);
      throw new Error(errorMsg);
    }

    try {
      const result = await handler(payload);

      // Update to COMPLETED
      await prisma.ingestionJob.update({
        where: { id: payload.jobId! },
        data: {
          status: 'COMPLETED',
          result: result ?? {},
          completedAt: new Date(),
        },
      });

      return result;
    } catch (err: any) {
      await this.markJobFailed(payload, err.message, currentAttempt);
      throw err;
    }
  }

  private static async markJobFailed(payload: JobPayload, errorMessage: string, attempt: number) {
    await prisma.ingestionJob.update({
      where: { id: payload.jobId! },
      data: {
        status: attempt >= (payload.maxAttempts || 3) ? 'DEAD_LETTER' : 'FAILED',
        errorDetails: {
          error: errorMessage,
          attempt,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  private static async markJobDeadLetter(payload: JobPayload, errorMessage: string) {
    await prisma.ingestionJob.update({
      where: { id: payload.jobId! },
      data: {
        status: 'DEAD_LETTER',
        errorDetails: {
          error: errorMessage,
          isDeadLetter: true,
          failedAt: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Retrieves current status and execution output of an ingestion job.
   */
  static async getJobStatus(jobId: string) {
    return prisma.ingestionJob.findUnique({
      where: { id: jobId },
    });
  }

  /**
   * Closes connections on process shutdown.
   */
  static async shutdown() {
    if (this.worker) await this.worker.close();
    if (this.bullQueue) await this.bullQueue.close();
    if (this.redisClient) await this.redisClient.quit();
    this.isInitialized = false;
  }
}
