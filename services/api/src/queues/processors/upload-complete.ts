import type { AppContext } from "@/context";
import type { ITaskWorker, UploadCompletedEventJob } from "@votewise/types";

type UploadCompletedEventProcessorOptions = {
  userRepository: AppContext["repositories"]["user"];
};

export class UploadCompletedEventProcessor implements ITaskWorker {
  private readonly opts: UploadCompletedEventProcessorOptions;

  constructor(opts: UploadCompletedEventProcessorOptions) {
    this.opts = opts;
  }

  async process<TData>(data: TData): Promise<void> {
    const queueData = data as UploadCompletedEventJob;
    if (queueData.assetType === "avatar") {
      await this.opts.userRepository.update(queueData.userId, {
        avatar_url: queueData.path
      });
    } else if (queueData.assetType === "cover_image") {
      await this.opts.userRepository.update(queueData.userId, {
        cover_image_url: queueData.path
      });
    }
  }
}
