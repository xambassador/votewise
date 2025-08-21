import type { PostStatus, PostType } from "@votewise/prisma/client";
import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = {
  content: string;
  slug: string;
  status: PostStatus;
  title: string;
  type: PostType;
  authorId: string;
};

export class FeedRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const feed = await db.post.create({
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

  public findById(id: string) {
    return this.execute(() =>
      this.db.post.findUnique({
        where: { id },
        select: {
          id: true,
          content: true,
          slug: true,
          status: true,
          title: true,
          type: true,
          created_at: true,
          updated_at: true,
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              user_name: true,
              avatar_url: true
            }
          },
          assets: {
            select: {
              id: true,
              url: true,
              type: true
            }
          },
          upvotes: {
            select: { user: { select: { id: true, avatar_url: true } } },
            take: 10
          },
          _count: {
            select: {
              upvotes: true,
              comments: true
            }
          }
        }
      })
    );
  }

  public isVoted(userId: string, feedId: string) {
    return this.execute(() =>
      this.db.upvote.findUnique({
        where: { post_user_unique: { post_id: feedId, user_id: userId } }
      })
    );
  }

  public vote(userId: string, feedId: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const upvote = await db.upvote.create({
        data: {
          post_id: feedId,
          user_id: userId
        }
      });
      return upvote;
    });
  }
}
