import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TCommentCreate = {
  text: string;
  postId: string;
  userId: string;
  parentId?: string | null;
};

export class CommentRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public totalCountByFeedId(id: string, parentId: string | null = null) {
    return this.execute(async () =>
      this.db.comment.count({
        where: { post_id: id, parent_id: parentId }
      })
    );
  }

  public findByFeedId(id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
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
          },
          replies: {
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
            orderBy: { created_at: "desc" },
            take: 5
          }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      })
    );
  }

  public create(data: TCommentCreate) {
    return this.execute(async () =>
      this.db.comment.create({
        data: {
          text: data.text,
          post_id: data.postId,
          user_id: data.userId,
          parent_id: data.parentId
        },
        select: { id: true }
      })
    );
  }
}
