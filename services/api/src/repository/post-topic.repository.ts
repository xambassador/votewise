import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

export class PostTopicRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: { postId: string; topicId: string }) {
    return this.execute(async () =>
      this.db.postTopic.create({
        data: { post_id: data.postId, topic_id: data.topicId }
      })
    );
  }

  public createMany(data: { postId: string; topicId: string }[]) {
    return this.execute(async () =>
      this.db.postTopic.createMany({
        data: data.map((item) => ({
          post_id: item.postId,
          topic_id: item.topicId
        }))
      })
    );
  }
}
