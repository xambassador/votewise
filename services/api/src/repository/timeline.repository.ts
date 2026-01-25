import type { Cursor } from "@/lib/cursor";
import type { NewTimeline } from "@votewise/db/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/db";

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
      const results = await this.dataLayer
        .selectFrom("Timeline as t")
        .innerJoin("Post as p", "p.id", "t.post_id")
        .innerJoin("User as author", "author.id", "p.author_id")
        .leftJoin("PostAggregates as pa", "pa.post_id", "p.id")
        .select([
          "t.post_id",
          "t.created_at as timeline_created_at",
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
        .where("t.user_id", "=", userId)
        .$if(shouldUseCursor, (qb) =>
          qb.where((eb) =>
            eb.or([
              eb("t.created_at", "<", new Date(cursor?.primary as string)),
              eb.and([
                eb("t.created_at", "=", new Date(cursor?.primary as string)),
                eb("t.post_id", "<", cursor?.secondary as string)
              ])
            ])
          )
        )
        .orderBy("t.created_at", "desc")
        .orderBy("t.post_id", "desc")
        .limit(limit)
        .$if(!shouldUseCursor, (qb) => qb.offset(offset))
        .execute();

      if (results.length === 0) {
        return [];
      }

      const postIds = results.map((r) => r.post_id);
      const upvotes = await this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select(["u.post_id", "upvote_user.id as user_id", "upvote_user.avatar_url"])
        .where("u.post_id", "in", postIds)
        .orderBy("u.created_at", "asc")
        .execute();

      const upvotesByPost = new Map<string, { user_id: string; avatar_url: string | null }[]>();
      for (const uv of upvotes) {
        const existing = upvotesByPost.get(uv.post_id) || [];
        if (existing.length < 5) {
          existing.push({ user_id: uv.user_id, avatar_url: uv.avatar_url });
          upvotesByPost.set(uv.post_id, existing);
        }
      }

      return results.map((r) => ({
        post: {
          id: r.id,
          slug: r.slug,
          title: r.title,
          created_at: r.created_at,
          updated_at: r.updated_at,
          hashTags: [],
          author: {
            id: r.author_id,
            user_name: r.user_name,
            first_name: r.first_name,
            last_name: r.last_name,
            avatar_url: r.avatar_url
          },
          upvotes: (upvotesByPost.get(r.post_id) || []).map((uv) => ({
            user: { id: uv.user_id, avatar_url: uv.avatar_url }
          })),
          postAggregates: {
            comments: r.comments ?? 0,
            votes: r.votes ?? 0
          }
        },
        created_at: r.timeline_created_at
      }));
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
