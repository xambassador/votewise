import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = {
  type: string;
  url: string;
  post_id: string;
};

export class FeedAssetRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      await db
        .insertInto("PostAsset")
        .values({
          id: this.dataLayer.createId(),
          type: data.type,
          url: data.url,
          post_id: data.post_id
        })
        .execute();
    });
  }

  public createMany(data: TCreate[], tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      db.insertInto("PostAsset")
        .values(
          data.map((item) => ({
            id: this.dataLayer.createId(),
            type: item.type,
            url: item.url,
            post_id: item.post_id
          }))
        )
        .execute();
    });
  }
}
