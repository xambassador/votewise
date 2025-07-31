import type { AppContext } from "@/context";
import type { UploadCompletedEventTask, UploadToS3Task } from "@votewise/types";

import { Queue, Worker } from "bullmq";

import { uploadCompletedEventQueueName, uploadQueueDefaultJobOptions, uploadQueueName } from "@votewise/constant/queue";

import { RedisAdapter } from "@/storage/redis";
import { UploadCompletedEventWorker } from "@/workers/upload-complete";

type UploadQueueOptions = {
  env: AppContext["environment"];
};

export class UploadQueue {
  private readonly opts: UploadQueueOptions;
  private queue: Queue<UploadToS3Task> | null = null;
  private redis: RedisAdapter | null = null;

  constructor(opts: UploadQueueOptions) {
    this.opts = opts;
  }

  public init() {
    this.redis = new RedisAdapter(this.opts.env.REDIS_URL, { maxRetriesPerRequest: null });
    this.queue = new Queue<UploadToS3Task>(uploadQueueName, {
      connection: this.redis,
      defaultJobOptions: uploadQueueDefaultJobOptions
    });
  }

  public async add(task: UploadToS3Task) {
    if (!this.queue) throw new Error("Upload queue not initialized");
    return this.queue.add(task.name, task);
  }
}

type UploadCompletedEventQueueOptions = {
  env: AppContext["environment"];
};

export class UploadCompletedEventQueue {
  private readonly opts: UploadCompletedEventQueueOptions;
  private worker: Worker<UploadCompletedEventTask> | null = null;
  private redis: RedisAdapter | null = null;

  constructor(opts: UploadCompletedEventQueueOptions) {
    this.opts = opts;
  }

  public init() {
    this.redis = new RedisAdapter(this.opts.env.REDIS_URL, { maxRetriesPerRequest: null });
  }

  public initWorker(ctx: AppContext) {
    if (!this.redis) throw new Error("Redis not initialized");
    const uploadCompletedEventProcessor = new UploadCompletedEventWorker({
      userRepository: ctx.repositories.user,
      onboardService: ctx.onboardService,
      minio: ctx.minio,
      uploadsBucket: ctx.config.uploadBucket
    });
    this.worker = new Worker<UploadCompletedEventTask>(
      uploadCompletedEventQueueName,
      async (job) => {
        await uploadCompletedEventProcessor.process(job.data.payload);
      },
      { connection: this.redis }
    );

    this.worker.on("completed", () => {
      ctx.logger.info(`[Upload Completed Event Worker] Job completed`);
    });
  }
}
