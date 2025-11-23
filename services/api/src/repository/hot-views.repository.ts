import type { Cursor } from "@/lib/cursor";

import { sql } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

export class HotViewsRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public getHotFeeds(opts: { cursor?: Cursor | null; limit: number }) {
    const { cursor, limit } = opts;
    const shouldUseCursor = !!cursor;
    return this.execute(async () => {
      const hotFeeds = await this.dataLayer
        .selectFrom("algohotfeedview")
        .selectAll()
        .$if(shouldUseCursor, (qb) => {
          const [score, postId] = (cursor?.secondary as string).split("_");
          return qb.where((eb) =>
            eb.or([
              eb("score", "<", Number(score)),
              eb.and([eb("score", "=", Number(score)), eb("post_id", "<", postId as string)])
            ])
          );
        })
        .orderBy("score", "desc")
        .orderBy("post_id", "desc")
        .limit(limit)
        .execute();

      const feedIds = hotFeeds.map((feed) => feed.post_id);
      const feedsQuery = this.dataLayer
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
        .where("p.id", "in", feedIds);

      const votesQuery = this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "u.post_id",
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (partition by u.post_id order by u.created_at asc)`.as("rn")
        ])
        .where("u.post_id", "in", feedIds);

      const [posts, upvotes] = await Promise.all([
        feedsQuery.execute(),
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

      return hotFeeds.map((hotFeed) => {
        const post = postMap.get(hotFeed.post_id)!;
        const postUpvotes = upvotesByPost.get(hotFeed.post_id) || [];
        return {
          id: post.id,
          slug: post.slug,
          title: post.title,
          created_at: post.created_at,
          updated_at: post.updated_at,
          score: hotFeed.score,
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
        };
      });
    });
  }

  public getHotUsers(opts: { cursor?: Cursor | null; limit: number }) {
    const { cursor, limit } = opts;
    const shouldUseCursor = !!cursor;
    return this.execute(async () => {
      const hotUsers = await this.dataLayer
        .selectFrom("algohotuserview")
        .selectAll()
        .$if(shouldUseCursor, (qb) => {
          const [score, username] = (cursor?.secondary as string).split("_");
          return qb.where((eb) =>
            eb.or([
              eb("score", "<", Number(score)),
              eb.and([eb("score", "=", Number(score)), eb("user_name", "<", username as string)])
            ])
          );
        })
        .orderBy("score", "desc")
        .orderBy("user_id", "desc")
        .limit(limit)
        .execute();

      const userIds = hotUsers.map((user) => user.user_id);
      const usersQuery = this.dataLayer.selectFrom("User").selectAll().where("id", "in", userIds);
      const aggregatesQuery = this.dataLayer.selectFrom("UserAggregates").selectAll().where("user_id", "in", userIds);
      const userInterestsQuery = this.dataLayer
        .selectFrom("UserInterests as ui")
        .innerJoin("Topics as t", "t.id", "ui.topic_id")
        .select(["name", "ui.user_id"]);

      const [users, aggregates, userInterests] = await Promise.all([
        usersQuery.execute(),
        aggregatesQuery.execute(),
        userInterestsQuery.execute()
      ]);

      const usersMap = new Map(users.map((user) => [user.id, user]));
      const aggregateMap = new Map(aggregates.map((agg) => [agg.user_id, agg]));
      const interestsMap = new Map<string, string[]>();
      for (const interest of userInterests) {
        if (!interestsMap.has(interest.user_id)) {
          interestsMap.set(interest.user_id, []);
        }
        interestsMap.get(interest.user_id)!.push(interest.name);
      }

      return hotUsers
        .map((hotUser) => {
          const user = usersMap.get(hotUser.user_id);
          if (!user) return null;
          const aggregate = aggregateMap.get(hotUser.user_id);
          const interests = interestsMap.get(hotUser.user_id) || [];
          return {
            id: user.id,
            user_name: user.user_name,
            first_name: user.first_name,
            last_name: user.last_name,
            avatar_url: user.avatar_url,
            about: user.about,
            created_at: user.created_at,
            updated_at: user.updated_at,
            interests,
            score: hotUser.score,
            aggregates: {
              total_followers: aggregate?.total_followers ?? 0,
              total_posts: aggregate?.total_posts ?? 0
            }
          };
        })
        .filter((u) => u !== null);
    });
  }
}
