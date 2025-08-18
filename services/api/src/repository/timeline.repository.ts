import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TTimelineCreate = {
  user_id: string;
  post_id: string;
};

export class TimelineRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public createMany(timeline: TTimelineCreate[], tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      await db.timeline.createMany({ data: timeline });
    });
  }

  public findByUserId(userId: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const timeline = await this.db.timeline.findMany({
        where: { user_id: userId },
        select: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
              created_at: true,
              updated_at: true,
              hashTags: {
                select: { hash_tag: { select: { name: true } } }
              },
              author: {
                select: {
                  id: true,
                  user_name: true,
                  first_name: true,
                  last_name: true,
                  avatar_url: true
                }
              },
              upvotes: {
                select: { user: { select: { id: true, avatar_url: true } } },
                take: 5
              },
              _count: {
                select: {
                  upvotes: true,
                  comments: { where: { parent_id: null } }
                }
              }
            }
          }
        },
        take: limit,
        skip: offset,
        orderBy: { created_at: "desc" }
      });
      return timeline;
    });
  }

  public async countByUserId(userId: string) {
    return this.execute(async () => {
      const count = await this.db.timeline.count({
        where: { user_id: userId }
      });
      return count;
    });
  }
}
