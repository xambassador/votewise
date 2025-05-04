import type { AppContext } from "@/context";
import type { ITaskWorker, JobType, Tasks, UploadCompletedEventTask } from "@votewise/types";

import { Queue, Worker } from "bullmq";

import { tasksQueueDefaultJobOptions, tasksQueueName, uploadCompletedEventQueueName } from "@votewise/constant/queue";

import { RedisAdapter } from "@/storage/redis";

import { EmailProcessor } from "./processors/email";
import { UploadCompletedEventProcessor } from "./processors/upload-complete";

type TasksQueueOptions = {
  env: AppContext["environment"];
};

export class TasksQueue {
  private readonly opts: TasksQueueOptions;
  private strategy: Record<JobType, ITaskWorker> | null = null;
  private queue: Queue<Tasks> | null = null;
  private worker: Worker<Tasks> | null = null;
  private redis: RedisAdapter | null = null;

  constructor(opts: TasksQueueOptions) {
    this.opts = opts;
  }

  public init() {
    this.redis = new RedisAdapter(this.opts.env.REDIS_URL, { maxRetriesPerRequest: null });
    this.queue = new Queue<Tasks>(tasksQueueName, {
      connection: this.redis,
      defaultJobOptions: tasksQueueDefaultJobOptions
    });
  }

  public initWorker(ctx: AppContext) {
    if (!this.queue) throw new Error("Queue not initialized");
    if (!this.redis) throw new Error("Redis not initialized");
    const emailProcessor = new EmailProcessor({
      mailer: ctx.mailer,
      logger: ctx.logger,
      userRepository: ctx.repositories.user
    });
    this.strategy = { email: emailProcessor };
    this.worker = new Worker<Tasks>(
      tasksQueueName,
      async (job) => {
        const message = `Processor for job ${job.data.name} not found. You probably forgot to add it to the strategy or you forgot to call initWorker`;
        const processor = this.strategy ? this.strategy[job.data.name] : null;
        if (!processor) throw new Error(message);
        await processor.process(job.data.payload);
      },
      { connection: this.redis }
    );
    this.worker.on("completed", (job) => {
      ctx.logger.info(`[Tasks Worker] Job ${job.id} completed`);
      job.remove();
    });
    this.worker.on("failed", (job, err) => {
      if (!job) {
        ctx.logger.error(`[Tasks Worker] Job failed with error: ${err.message}`);
        return;
      }
      ctx.logger.error(`[Tasks Worker] Job ${job.id} failed with error: ${err.message}`);
    });
    this.worker.on("error", (reason) => {
      ctx.logger.error(`[Tasks Worker] Error: ${reason}`);
    });
    this.worker.on("ready", () => {
      ctx.logger.info("[Tasks Worker] ready");
    });
  }

  public async add(task: Tasks) {
    if (!this.queue) throw new Error("Taks Queue not initialized");
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
    const uploadCompletedEventProcessor = new UploadCompletedEventProcessor({
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
