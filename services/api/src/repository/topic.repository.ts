import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

export class TopicRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
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
