import type { Cursor } from "@/lib/cursor";
import type { NewTimeline } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

export class TimelineRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public createMany(timeline: NewTimeline[], tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(() => db.insertInto("Timeline").values(timeline).execute());
  }

  public findByUserId(userId: string, opts: { page: number; limit: number; cursor?: Cursor | null }) {
    const { page, limit, cursor } = opts;
    const offset = (page - 1) * limit;
    const shouldUseCursor = !!cursor;
    return this.execute(async () => {
      const skeleton = await this.dataLayer
        .selectFrom("Timeline as t")
        .select(["t.post_id", "t.created_at as timeline_created_at"])
        .where("t.user_id", "=", userId)
        .$if(shouldUseCursor, (qb) => {
          let primary: Date;
          if (cursor?.primary instanceof Date) {
            primary = cursor.primary;
          } else {
            primary = new Date(cursor?.primary as string);
          }
          return qb.where((eb) =>
            eb.or([
              eb("t.created_at", "<", primary),
              eb.and([eb("t.created_at", "=", primary), eb("t.post_id", "<", cursor?.secondary as string)])
            ])
          );
        })
        .orderBy("t.created_at", "desc")
        .orderBy("t.post_id", "desc")
        .limit(limit)
        .offset(shouldUseCursor ? 0 : offset)
        .execute();

      if (skeleton.length === 0) {
        return [];
      }

      const postIds = skeleton.map((item) => item.post_id);
      const postQuery = this.dataLayer
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
        .where("p.id", "in", postIds);

      const votesQuery = this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "u.post_id",
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (partition by u.post_id order by u.created_at asc)`.as("rn")
        ])
        .where("u.post_id", "in", postIds);

      const [posts, upvotes] = await Promise.all([
        postQuery.execute(),
        votesQuery.execute().then((res) => res.filter((r) => r.rn <= 5))
      ]);

      const postMap = new Map(posts.map((p) => [p.id, p]));
      const upvotesByPost = new Map<string, Array<{ user_id: string; avatar_url: string | null }>>();
      for (const uv of upvotes) {
        if (!upvotesByPost.has(uv.post_id)) {
          upvotesByPost.set(uv.post_id, []);
        }
        upvotesByPost.get(uv.post_id)!.push({ user_id: uv.user_id, avatar_url: uv.avatar_url });
      }

      return skeleton.map((s) => {
        const post = postMap.get(s.post_id)!;
        const postUpvotes = upvotesByPost.get(s.post_id) || [];
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
          created_at: s.timeline_created_at
        };
      });
    });
  }

  public async countByUserId(userId: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("Timeline")
        .where("user_id", "=", userId)
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirst();
      return Number(res?.count ?? 0);
    });
  }
}
