import type { AppContext } from "@/context";
import type { ITaskWorker, UploadCompletedEventJob } from "@votewise/types";

type UploadCompletedEventProcessorOptions = {
  userRepository: AppContext["repositories"]["user"];
  onboardService: AppContext["services"]["onboard"];
  minio: AppContext["minio"];
  uploadsBucket: AppContext["config"]["uploadBucket"];
};

export class UploadCompletedEventWorker implements ITaskWorker {
  private readonly opts: UploadCompletedEventProcessorOptions;

  constructor(opts: UploadCompletedEventProcessorOptions) {
    this.opts = opts;
  }

  async process<TData>(data: TData): Promise<void> {
    const bucket = this.opts.uploadsBucket;
    const queueData = data as UploadCompletedEventJob;
    if (queueData.assetType === "avatar") {
      await this.opts.userRepository.update(queueData.userId, {
        avatar_url: queueData.path
      });
      try {
        const url = await this.opts.minio.presignedGetObject(bucket, queueData.path);
        await this.opts.onboardService.updateUserOnboardCache(queueData.userId, {
          avatar_url: url
        });
      } catch (err) {
        // --
      }
    } else if (queueData.assetType === "cover_image") {
      await this.opts.userRepository.update(queueData.userId, {
        cover_image_url: queueData.path
      });
      try {
        const url = await this.opts.minio.presignedGetObject(bucket, queueData.path);
        await this.opts.onboardService.updateUserOnboardCache(queueData.userId, {
          cover_image_url: url
        });
      } catch (err) {
        // --
      }
    }
  }
}
