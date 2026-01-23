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
  constructor(_opts: ServiceOptions) {}

  /**
   * @deprecated
   */
  public async getUrlForType(url: string, _type: "avatar" | "background") {
    return url;
  }

  /**
   * @deprecated
   */
  public generatePublicUrl(url: string, _type: "avatar" | "background") {
    return url;
  }
}
