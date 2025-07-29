import { BaseRepository } from "./base.repository";

export class TopicRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public findAll() {
    return this.execute(() => this.db.topics.findMany());
  }

  public findById(id: string) {
    return this.execute(() => this.db.topics.findUnique({ where: { id }, select: { id: true, name: true } }));
  }
}
