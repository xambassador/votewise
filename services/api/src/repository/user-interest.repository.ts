import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

export class UserInterestRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public async create(userId: string, topics: string[], tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(() =>
      db
        .insertInto("UserInterests")
        .values(topics.map((topic) => ({ topic_id: topic, user_id: userId })))
        .execute()
    );
  }

  public async delete(userId: string, topics: string[], tx?: Tx) {
    const db = (tx ?? this.dataLayer) as Tx;
    return this.execute(() =>
      db.deleteFrom("UserInterests").where("user_id", "=", userId).where("topic_id", "in", topics).execute()
    );
  }

  public async findByUserId(userId: string) {
    return this.execute(() =>
      this.dataLayer.selectFrom("UserInterests").where("user_id", "=", userId).select("topic_id").execute()
    );
  }
}
