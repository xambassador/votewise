import type { Cursor } from "@/lib/cursor";
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

  public findByGroupId(groupId: string, opts: { cursor?: Cursor | null; limit: number }) {
    const { cursor, limit } = opts;
    const shouldUseCursor = !!cursor;
    return this.execute(async () => {
      const posts = await this.dataLayer
        .selectFrom("Post as p")
        .innerJoin("User as author", "author.id", "p.author_id")
        .leftJoin("PostAggregates as pa", "pa.post_id", "p.id")
        .select([
          "p.id",
          "p.slug",
          "p.title",
          "p.created_at",
          "p.updated_at",
          "author.id as author_id",
          "author.user_name",
          "author.first_name",
          "author.last_name",
          "author.avatar_url",
          "pa.comments",
          "pa.votes"
        ])
        .where("p.group_id", "=", groupId)
        .$if(shouldUseCursor, (qb) =>
          qb.where((eb) =>
            eb.and([
              eb("p.created_at", "<", cursor?.primary as Date).or(
                eb.and([eb("p.created_at", "=", cursor?.primary as Date), eb("p.id", "<", cursor?.secondary as string)])
              )
            ])
          )
        )
        .orderBy("p.created_at", "desc")
        .limit(limit)
        .execute();

      if (posts.length === 0) {
        return [];
      }

      const votes = await this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "u.post_id",
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (partition by u.post_id order by u.created_at asc)`.as("rn")
        ])
        .where(
          "u.post_id",
          "in",
          posts.map((p) => p.id)
        )
        .execute();

      const upvotes = votes.filter((r) => r.rn <= 5);

      const postMap = new Map(posts.map((p) => [p.id, p]));
      const upvotesByPost = new Map<string, Array<{ user_id: string; avatar_url: string | null }>>();
      for (const uv of upvotes) {
        if (!upvotesByPost.has(uv.post_id)) {
          upvotesByPost.set(uv.post_id, []);
        }
        upvotesByPost.get(uv.post_id)!.push({ user_id: uv.user_id, avatar_url: uv.avatar_url });
      }

      return posts.map((p) => {
        const post = postMap.get(p.id)!;
        const postUpvotes = upvotesByPost.get(p.id) || [];
        return {
          post: {
            id: post.id,
            slug: post.slug,
            title: post.title,
            created_at: post.created_at,
            updated_at: post.updated_at,
            hashTags: [],
            author: {
              id: post.author_id,
              user_name: post.user_name,
              first_name: post.first_name,
              last_name: post.last_name,
              avatar_url: post.avatar_url
            },
            upvotes: postUpvotes.map((uv) => ({
              user: {
                id: uv.user_id,
                avatar_url: uv.avatar_url
              }
            })),
            postAggregates: {
              comments: post.comments ?? 0,
              votes: post.votes ?? 0
            }
          },
          created_at: p.created_at
        };
      });
    });
  }
}
