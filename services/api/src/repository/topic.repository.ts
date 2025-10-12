import { BaseRepository } from "./base.repository";

export class TopicRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public findAll() {
    return this.execute(() => this.dataLayer.selectFrom("Topics").selectAll().execute());
  }

  public findById(id: string) {
    return this.execute(() =>
      this.dataLayer.selectFrom("Topics").selectAll().where("id", "=", id).executeTakeFirstOrThrow()
    );
  }
}
