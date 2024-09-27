import type { AppContext } from "@/context";
import type { EmailJob } from "./processors/email";

import { Queue, Worker } from "bullmq";

import { RedisAdapter } from "@/storage/redis";

import { EmailProcessor } from "./processors/email";

export type JobType = "email";
export type Tasks = { name: "email"; payload: EmailJob };

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
    this.queue = new Queue<Tasks>("tasks", {
      connection: this.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    });
  }

  public initWorker(ctx: AppContext) {
    if (!this.queue) throw new Error("Queue not initialized");
    if (!this.redis) throw new Error("Redis not initialized");
    const emailProcessor = new EmailProcessor({ mailer: ctx.mailer, logger: ctx.logger });
    this.strategy = { email: emailProcessor };
    this.worker = new Worker<Tasks>(
      "tasks",
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
    this.worker.on("active", (job) => {
      ctx.logger.info(`[Tasks Worker] Job ${job.id} active`);
    });
    this.worker.on("error", (reason) => {
      ctx.logger.error(`[Tasks Worker] Error: ${reason}`);
    });
    this.worker.on("ready", () => {
      ctx.logger.info("[Tasks Worker] ready");
    });
    this.worker.on("paused", () => {
      ctx.logger.info("[Tasks Worker] paused");
    });
  }

  public async add(task: Tasks) {
    if (!this.queue) throw new Error("Taks Queue not initialized");
    return this.queue.add(task.name, task);
  }
}

export abstract class ITaskWorker {
  constructor() {}

  abstract process<TData>(data: TData): Promise<void>;
}
