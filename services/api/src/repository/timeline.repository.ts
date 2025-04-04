import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TTimelineCreate = {
  user_id: string;
  post_id: string;
  created_at: Date;
};

export class TimelineRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public createMany(timeline: TTimelineCreate[]) {
    return this.execute(async () => {
      await this.db.timeline.createMany({ data: timeline });
    });
  }
}
