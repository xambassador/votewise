import type { AppContext } from "@/context";
import type { PostStatus, PostType } from "@votewise/prisma/client";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TCreate = {
  content: string;
  slug: string;
  status: PostStatus;
  title: string;
  type: PostType;
  authorId: string;
};

export class FeedRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    return this.execute(async () => {
      const feed = await this.db.post.create({
        data: {
          content: data.content,
          slug: data.slug,
          status: data.status,
          title: data.title,
          type: data.type,
          author_id: data.authorId
        }
      });
      return feed;
    });
  }
}
