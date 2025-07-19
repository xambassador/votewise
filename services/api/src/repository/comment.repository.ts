import type { AppContext } from "@/context";

import { PAGINATION } from "@votewise/constant";

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

type TCommentUpdate = {
  text: string;
  userId: string;
  commentId: string;
};

export class CommentRepository extends BaseRepository {
  private readonly db: Dependencies["db"];
  public reply: ReplyRepository;

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
    this.reply = new ReplyRepository(cfg);
  }

  public count(id: string) {
    return this.execute(async () => this.db.comment.count({ where: { post_id: id, parent_id: null } }));
  }

  public findByFeedId(id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.execute(async () =>
      this.db.comment.findMany({
        where: { post_id: id, parent_id: null },
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
            take: PAGINATION.comments.reply.limit
          },
          _count: { select: { replies: true } }
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

  public update(data: TCommentUpdate) {
    return this.execute(async () =>
      this.db.comment.update({
        where: { id: data.commentId, user_id: data.userId },
        data: { text: data.text }
      })
    );
  }

  public findById(id: string) {
    return this.execute(async () =>
      this.db.comment.findUnique({
        where: { id },
        select: { id: true, user_id: true, post_id: true }
      })
    );
  }
}

class ReplyRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public count(feedId: string, commentId: string) {
    return this.execute(async () => this.db.comment.count({ where: { parent_id: commentId, post_id: feedId } }));
  }

  public findByParentId(feedId: string, parentId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.execute(async () =>
      this.db.comment.findMany({
        where: { parent_id: parentId, post_id: feedId },
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
        take: limit,
        skip: offset
      })
    );
  }
}
