import type { AppContext } from "@/context";
import type { UploadToS3Task } from "@votewise/types";

import { Queue } from "bullmq";

import { uploadQueueDefaultJobOptions, uploadQueueName } from "@votewise/constant/queue";

import { RedisAdapter } from "@/storage/redis";

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
