import type { AppContext } from "@/context";
import type { ITaskWorker, UploadToS3Job } from "@votewise/types";

import fs from "fs";

type UploadToS3ProcessorOptions = {
  logger: AppContext["logger"];
  minio: AppContext["minio"];
  uploadBucket: string;
};

export class UploadToS3Processor implements ITaskWorker {
  private readonly opts: UploadToS3ProcessorOptions;

  constructor(opts: UploadToS3ProcessorOptions) {
    this.opts = opts;
  }

  async process<TData>(data: TData): Promise<void> {
    const uploadData = data as UploadToS3Job;
    const { path, filePath } = uploadData;
    this.opts.logger.info(`Uploading file to S3: ${path}`);
    const fileStream = fs.createReadStream(filePath);
    fs.stat(filePath, (err) => {
      if (err) {
        this.opts.logger.error(`File not found: ${filePath}`);
        // We should not retry the job since the file is not found and it will never succeed
        return;
      }

      this.opts.minio.putObject(this.opts.uploadBucket, path, fileStream).catch((err) => {
        this.opts.logger.error(`Error uploading file to S3: ${err.message}`);
        throw err;
      });
    });
  }
}
