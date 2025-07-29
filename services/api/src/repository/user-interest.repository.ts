import { BaseRepository } from "./base.repository";

export class UserInterestRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public async create(userId: string, topics: string[]) {
    return this.execute(() =>
      this.db.userInterests.createMany({
        data: topics.map((topic) => ({ topic_id: topic, user_id: userId }))
      })
    );
  }

  public async delete(userId: string, topics: string[]) {
    return this.execute(() =>
      this.db.userInterests.deleteMany({
        where: {
          user_id: userId,
          topic_id: { in: topics }
        }
      })
    );
  }

  public async findByUserId(userId: string) {
    return this.execute(() =>
      this.db.userInterests.findMany({
        where: { user_id: userId },
        select: { topic_id: true }
      })
    );
  }
}
