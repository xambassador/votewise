import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

export class CommentRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public findByFeedId(id: string) {
    return this.execute(async () =>
      this.db.comment.findMany({
        where: {
          post_id: id,
          parent_id: null
        },
        select: {
          id: true,
          text: true,
          created_at: true,
          updated_at: true,
          user: {
            select: {
              id: true,
              user_name: true,
              first_name: true,
              last_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: {
          created_at: "desc"
        },
        take: 20
      })
    );
  }
}
