import type { NewComment } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

import { PAGINATION } from "@votewise/constant";
import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

type TCommentUpdate = {
  text: string;
  userId: string;
  commentId: string;
};

export class CommentRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];
  public reply: ReplyRepository;

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
    this.reply = new ReplyRepository(cfg);
  }

  public count(id: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("Comment")
        .where((eb) => eb.and([eb("post_id", "=", id), eb("parent_id", "is", null)]))
        .select(sql<string>`count(*)`.as("count"))
        .executeTakeFirstOrThrow();
      return Number(res.count);
    });
  }

  public findByFeedId(id: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const parentComments = await this.dataLayer
        .selectFrom("Comment as c")
        .innerJoin("User as u", "u.id", "c.user_id")
        .leftJoin("Comment as reply", "reply.parent_id", "c.id")
        .select([
          "c.id",
          "c.text",
          "c.created_at",
          "c.updated_at",
          "u.id as user_id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          sql<number>`count(distinct reply.id)`.as("reply_count")
        ])
        .where("c.post_id", "=", id)
        .where("c.parent_id", "is", null)
        .groupBy(["c.id", "u.id"])
        .orderBy("c.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (parentComments.length === 0) {
        return [];
      }

      const ids = parentComments.map((c) => c.id);

      const replies = await this.dataLayer
        .selectFrom(
          this.dataLayer
            .selectFrom("Comment as r")
            .innerJoin("User as ru", "ru.id", "r.user_id")
            .select([
              "r.id",
              "r.text",
              "r.parent_id",
              "r.created_at",
              "r.updated_at",
              "ru.id as user_id",
              "ru.user_name",
              "ru.first_name",
              "ru.last_name",
              "ru.avatar_url",
              sql<number>`row_number() over (partition by r.parent_id order by r.created_at desc)`.as("rn")
            ])
            .where("r.parent_id", "in", ids)
            .as("ranked_replies")
        )
        .selectAll()
        .where("rn", "<=", PAGINATION.comments.reply.limit)
        .orderBy("created_at", "desc")
        .execute();

      const repliesByParent = new Map<string, typeof replies>();
      for (const reply of replies) {
        if (!reply.parent_id) continue;
        if (!repliesByParent.has(reply.parent_id)) {
          repliesByParent.set(reply.parent_id, []);
        }
        repliesByParent.get(reply.parent_id)!.push(reply);
      }

      return parentComments.map((comment) => ({
        id: comment.id,
        text: comment.text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: {
          id: comment.user_id,
          user_name: comment.user_name,
          first_name: comment.first_name,
          last_name: comment.last_name,
          avatar_url: comment.avatar_url
        },
        replies: (repliesByParent.get(comment.id) || []).map((reply) => ({
          id: reply.id,
          text: reply.text,
          created_at: reply.created_at,
          updated_at: reply.updated_at,
          user: {
            id: reply.user_id,
            user_name: reply.user_name,
            first_name: reply.first_name,
            last_name: reply.last_name,
            avatar_url: reply.avatar_url
          }
        })),
        _count: { replies: comment.reply_count }
      }));
    });
  }

  public create(data: NewComment, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () =>
      db
        .insertInto("Comment")
        .values({ ...data, id: this.dataLayer.createId(), updated_at: new Date(), created_at: new Date() })
        .returning("id")
        .executeTakeFirstOrThrow()
    );
  }

  public update(data: TCommentUpdate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () =>
      db
        .updateTable("Comment")
        .set({ updated_at: new Date(), text: data.text })
        .where("id", "=", data.commentId)
        .where("user_id", "=", data.userId)
        .executeTakeFirstOrThrow()
    );
  }

  public findById(id: string) {
    return this.execute(async () =>
      this.dataLayer
        .selectFrom("Comment")
        .where("id", "=", id)
        .select(["id", "user_id", "post_id", "parent_id"])
        .executeTakeFirst()
    );
  }

  public delete(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error - I don't know why, but it has some issue with Tx
      db.deleteFrom("Comment").where("id", "=", id).executeTakeFirstOrThrow();
    });
  }
}

class ReplyRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public count(feedId: string, commentId: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("Comment")
        .where("parent_id", "=", commentId)
        .where("post_id", "=", feedId)
        .select([sql<number>`count(*)`.as("count")])
        .executeTakeFirstOrThrow();
      return res.count;
    });
  }

  public findByParentId(feedId: string, parentId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const replies = await this.dataLayer
        .selectFrom("Comment as c")
        .innerJoin("User as u", "u.id", "c.user_id")
        .select([
          "c.id",
          "text",
          "c.created_at",
          "c.updated_at",
          "u.id as user_id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url"
        ])
        .orderBy("c.created_at", "desc")
        .where("c.parent_id", "=", parentId)
        .where("c.post_id", "=", feedId)
        .limit(limit)
        .offset(offset)
        .execute();
      return replies.map((reply) => ({
        id: reply.id,
        text: reply.text,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        user: {
          id: reply.user_id,
          user_name: reply.user_name,
          first_name: reply.first_name,
          last_name: reply.last_name,
          avatar_url: reply.avatar_url
        }
      }));
    });
  }
}
