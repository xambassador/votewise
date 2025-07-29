import { BaseRepository } from "./base.repository";

export class PostTopicRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
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

  public getInterestedFeedIds(topics: string[], count = 50) {
    return this.execute(async () => {
      const feeds = await this.db.postTopic.findMany({
        where: {
          topic_id: {
            in: topics
          }
        },
        take: count
      });
      return feeds;
    });
  }
}
