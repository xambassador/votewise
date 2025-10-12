import type { PostStatus, PostType } from "@votewise/prisma/client";
import type { Tx } from "./transaction";

import { sql } from "@votewise/prisma";

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
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const feed = await db
        .insertInto("Post")
        .values({
          id: this.dataLayer.createId(),
          content: data.content,
          slug: data.slug,
          status: data.status,
          title: data.title,
          type: data.type,
          author_id: data.authorId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return feed;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const post = await this.dataLayer
        .selectFrom("Post as p")
        .innerJoin("User as author", "author.id", "p.author_id")
        .leftJoin("PostAggregates as pa", "pa.post_id", "p.id")
        .select([
          "p.id",
          "p.content",
          "p.slug",
          "p.status",
          "p.title",
          "p.type",
          "p.created_at",
          "p.updated_at",
          "author.id as author_id",
          "author.first_name",
          "author.last_name",
          "author.user_name",
          "author.avatar_url",
          "pa.comments",
          "pa.votes",
          "pa.shares",
          "pa.views"
        ])
        .where("p.id", "=", id)
        .executeTakeFirst();

      if (!post) return null;

      const assetsQuery = this.dataLayer
        .selectFrom("PostAsset")
        .where("post_id", "=", id)
        .select(["id", "url", "type"])
        .where("post_id", "=", id)
        .execute();
      const upvotesQuery = this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (order by u.created_at asc)`.as("rn")
        ])
        .where("u.post_id", "=", id)
        .execute();

      const [assets, upvotes] = await Promise.all([
        assetsQuery,
        upvotesQuery.then((results) => results.filter((r) => r.rn <= 10))
      ]);

      return {
        id: post.id,
        content: post.content,
        slug: post.slug,
        status: post.status,
        title: post.title,
        type: post.type,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.author_id,
          first_name: post.first_name,
          last_name: post.last_name,
          user_name: post.user_name,
          avatar_url: post.avatar_url
        },
        assets,
        upvotes: upvotes.map((u) => ({ user: { id: u.user_id, avatar_url: u.avatar_url } })),
        postAggregates: {
          comments: post.comments,
          votes: post.votes,
          shares: post.shares,
          views: post.views
        }
      };
    });
  }

  public isVoted(userId: string, feedId: string) {
    return this.execute(() =>
      this.dataLayer
        .selectFrom("Upvote")
        .where("post_id", "=", feedId)
        .where("user_id", "=", userId)
        .selectAll()
        .executeTakeFirst()
    );
  }

  public vote(userId: string, feedId: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const upvote = await db
        .insertInto("Upvote")
        .values({
          post_id: feedId,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return upvote;
    });
  }
}
