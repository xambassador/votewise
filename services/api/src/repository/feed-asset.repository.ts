import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TCreate = {
  type: string;
  url: string;
  post_id: string;
};

export class FeedAssetRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    return this.execute(async () => {
      await this.db.postAsset.create({
        data: {
          type: data.type,
          url: data.url,
          post_id: data.post_id
        }
      });
    });
  }

  public createMany(data: TCreate[]) {
    return this.execute(async () => {
      await this.db.postAsset.createMany({
        data: data.map((item) => ({
          type: item.type,
          url: item.url,
          post_id: item.post_id
        }))
      });
    });
  }
}
