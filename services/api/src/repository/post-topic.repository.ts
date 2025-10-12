import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

export class PostTopicRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: { postId: string; topicId: string }, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () =>
      db
        .insertInto("PostTopic")
        .values({ post_id: data.postId, topic_id: data.topicId })
        .returningAll()
        .executeTakeFirstOrThrow()
    );
  }

  public createMany(data: { postId: string; topicId: string }[], tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () =>
      db.insertInto("PostTopic").values(
        data.map((item) => ({
          post_id: item.postId,
          topic_id: item.topicId
        }))
      )
    );
  }

  public getInterestedFeedIds(topics: string[], count = 50) {
    return this.execute(async () => {
      const feeds = await this.dataLayer
        .selectFrom("PostTopic")
        .where("PostTopic.topic_id", "in", topics)
        .selectAll()
        .limit(count)
        .execute();
      return feeds;
    });
  }
}
