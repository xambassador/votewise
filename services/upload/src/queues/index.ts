import type { AppContext } from "@/context";
import type { Redis } from "@/storage/redis";
import type { UploadCompletedEventTask, UploadToS3Task } from "@votewise/types";

import { Queue, Worker } from "bullmq";

import {
  uploadCompletedEventQueueDefaultJobOptions,
  uploadCompletedEventQueueName,
  uploadQueueName
} from "@votewise/constant/queue";

import { RedisAdapter } from "@/storage/redis";

import { UploadToS3Processor } from "./processor/upload-to-s3";

export class UploadQueue {
  private worker: Worker<UploadToS3Task> | null = null;
  private redis: Redis | null = null;

  public init() {
    this.redis = RedisAdapter.defaultClient;
  }

  public initWorker(ctx: AppContext) {
    if (!this.redis) throw new Error("Redis not initialized");
    const uploadToS3Processor = new UploadToS3Processor({
      logger: ctx.logger,
      uploadBucket: ctx.config.uploadBucket,
      minio: ctx.minio,
      getBlobPath: ctx.getBlobPath
    });
    this.worker = new Worker<UploadToS3Task>(
      uploadQueueName,
      async (job) => {
        await uploadToS3Processor.process(job.data.payload);
      },
      { connection: this.redis }
    );
    this.worker.on("completed", (job) => {
      ctx.logger.info(`[${uploadQueueName} worker] Job ${job.id} completed`);
      ctx.queues.uploadCompletedEventQueue.add({
        name: "uploadCompletedEvent",
        payload: {
          path: job.data.payload.path,
          userId: job.data.payload.userId,
          assetType: job.data.payload.assetType
        }
      });
      job.remove();
    });
    this.worker.on("failed", (job, err) => {
      if (!job) {
        ctx.logger.error(`[${uploadQueueName} worker] Job failed with error: ${err.message}`);
        return;
      }
      ctx.logger.error(`[${uploadQueueName} worker] Job ${job.id} failed with error: ${err.message}`);
    });
    this.worker.on("error", (reason) => {
      ctx.logger.error(`[${uploadQueueName} worker] Error: ${reason}`);
    });
    this.worker.on("ready", () => {
      ctx.logger.info(`[${uploadQueueName} worker] ready`);
    });
  }
}

export class UploadCompletedEventQueue {
  private queue: Queue<UploadCompletedEventTask> | null = null;
  private redis: Redis | null = null;

  public init() {
    this.redis = RedisAdapter.defaultClient;
    this.queue = new Queue<UploadCompletedEventTask>(uploadCompletedEventQueueName, {
      connection: this.redis,
      defaultJobOptions: uploadCompletedEventQueueDefaultJobOptions
    });
  }

  public async add(task: UploadCompletedEventTask) {
    if (!this.queue) throw new Error("Taks Queue not initialized");
    return this.queue.add(task.name, task);
  }
}
