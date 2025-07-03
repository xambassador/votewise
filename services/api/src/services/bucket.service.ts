import type { AppContext } from "@/context";

type ServiceOptions = {
  minio: AppContext["minio"];
  avatarBucket: AppContext["config"]["avatarsBucket"];
  backgroundBucket: AppContext["config"]["backgroundsBucket"];
  uploadBucket: AppContext["config"]["uploadBucket"];
  minioEndpoint: AppContext["environment"]["MINIO_ENDPOINT"];
  minioPort: AppContext["environment"]["MINIO_PORT"];
};

export class BucketService {
  private readonly ctx: ServiceOptions;

  constructor(opts: ServiceOptions) {
    this.ctx = opts;
  }

  async getUrlForType(url: string, type: "avatar" | "background") {
    const avatarBucket = this.ctx.avatarBucket;
    const backgroundBucket = this.ctx.backgroundBucket;
    const uploadBucket = this.ctx.uploadBucket;
    let signedUrl = url;
    if (type === "avatar") {
      if (!url.startsWith("https://") && !url.startsWith("http://")) {
        if (url.startsWith(avatarBucket)) {
          // TODO: Protocol and port should be configurable for different environments
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${url}`;
        }

        if (!url.startsWith(avatarBucket)) {
          try {
            signedUrl = await this.ctx.minio.presignedGetObject(uploadBucket, url);
          } catch (err) {
            // --
          }
        }
      }
    }

    if (type === "background") {
      if (!url.startsWith("https://") && !url.startsWith("http://")) {
        if (url.startsWith(backgroundBucket)) {
          // TODO: Protocol and port should be configurable for different environments
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${url}`;
        }

        if (!url.startsWith(backgroundBucket)) {
          try {
            signedUrl = await this.ctx.minio.presignedGetObject(uploadBucket, url);
          } catch (err) {
            // --
          }
        }
      }
    }

    return signedUrl;
  }

  generatePublicUrl(url: string, type: "avatar" | "background") {
    let signedUrl = url;
    const avatarBucket = this.ctx.avatarBucket;
    const backgroundBucket = this.ctx.backgroundBucket;
    const uploadBucket = this.ctx.uploadBucket;
    if (type === "avatar") {
      if (!url.startsWith("https://") && !url.startsWith("http://")) {
        if (url.startsWith(avatarBucket)) {
          // TODO: Protocol and port should be configurable for different environments
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${url}`;
        } else {
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${uploadBucket}/${url}`;
        }
      }
    }

    if (type === "background") {
      if (!url.startsWith("https://") && !url.startsWith("http://")) {
        if (url.startsWith(backgroundBucket)) {
          // TODO: Protocol and port should be configurable for different environments
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${url}`;
        } else {
          signedUrl = `http://${this.ctx.minioEndpoint}:${this.ctx.minioPort}/${uploadBucket}/${url}`;
        }
      }
    }

    return signedUrl;
  }
}
