import type { NewUser, UserUpdate } from "@votewise/db/db";
import type { Tx } from "./transaction";

import { sql } from "@votewise/db";

import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: NewUser, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const user = await db
        .insertInto("User")
        .values({ ...data, id: this.dataLayer.createId(), created_at: new Date(), updated_at: new Date() })
        .returningAll()
        .executeTakeFirstOrThrow();
      return user;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const user = await this.dataLayer.selectFrom("User").where("id", "=", id).selectAll().executeTakeFirst();
      return user;
    });
  }

  public findByEmail(email: string) {
    return this.execute(async () => {
      const user = await this.dataLayer.selectFrom("User").where("email", "=", email).selectAll().executeTakeFirst();
      return user;
    });
  }

  public findByUsername(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .selectAll()
        .executeTakeFirst();
      return user;
    });
  }

  public update(id: string, data: UserUpdate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const user = await db
        .updateTable("User")
        .set({ ...data, updated_at: new Date() })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return user;
    });
  }

  public updateByEmail(email: string, data: UserUpdate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const user = await db
        .updateTable("User")
        .set({ ...data, updated_at: new Date() })
        .where("email", "=", email)
        .returningAll()
        .executeTakeFirstOrThrow();
      return user;
    });
  }

  public findManyByIds(ids: string[]) {
    return this.execute(async () => {
      const users = await this.dataLayer
        .selectFrom("User")
        .where("id", "in", ids)
        .select(["id", "user_name", "first_name", "last_name", "avatar_url", "about"])
        .execute();
      return users;
    });
  }

  public delete() {}

  public getRemainingVotes(userId: string) {
    return this.execute(async () => {
      const user = await this.dataLayer.selectFrom("User").where("id", "=", userId).selectAll().executeTakeFirst();
      return user?.vote_bucket ?? 0;
    });
  }

  public getProfile(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User as u")
        .leftJoin("UserAggregates as ua", "ua.user_id", "u.id")
        .where("user_name", "=", username)
        .select([
          "u.id",
          "u.first_name",
          "u.last_name",
          "u.user_name",
          "u.avatar_url",
          "u.cover_image_url",
          "u.location",
          "u.gender",
          "u.about",
          "u.created_at",
          "ua.total_comments",
          "ua.total_votes",
          "ua.total_followers",
          "ua.total_following",
          "ua.total_posts",
          "ua.total_groups"
        ])
        .executeTakeFirst();

      if (!user) {
        return null;
      }

      return {
        about: user.about,
        avatar_url: user.avatar_url,
        first_name: user.first_name,
        id: user.id,
        last_name: user.last_name,
        user_name: user.user_name,
        cover_image_url: user.cover_image_url,
        location: user.location,
        gender: user.gender,
        created_at: user.created_at,
        userAggregates: {
          total_comments: user.total_comments,
          total_votes: user.total_votes,
          total_posts: user.total_posts,
          total_followers: user.total_followers,
          total_following: user.total_following,
          total_groups: user.total_groups
        }
      };
    });
  }

  public getMyProfile(id: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User as u")
        .leftJoin("UserAggregates as ua", "ua.user_id", "u.id")
        .where("id", "=", id)
        .select([
          "u.id",
          "u.first_name",
          "u.last_name",
          "u.user_name",
          "u.avatar_url",
          "u.cover_image_url",
          "u.location",
          "u.gender",
          "u.about",
          "u.created_at",
          "ua.total_comments",
          "ua.total_votes",
          "ua.total_followers",
          "ua.total_following",
          "ua.total_posts",
          "ua.total_groups",
          "u.vote_bucket"
        ])
        .executeTakeFirst();

      if (!user) {
        return null;
      }

      return {
        about: user.about,
        avatar_url: user.avatar_url,
        first_name: user.first_name,
        id: user.id,
        last_name: user.last_name,
        user_name: user.user_name,
        cover_image_url: user.cover_image_url,
        location: user.location,
        gender: user.gender,
        created_at: user.created_at,
        vote_bucket: user.vote_bucket,
        userAggregates: {
          total_comments: user.total_comments,
          total_votes: user.total_votes,
          total_posts: user.total_posts,
          total_followers: user.total_followers,
          total_following: user.total_following,
          total_groups: user.total_groups
        }
      };
    });
  }

  public getMyAccount(id: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User as u")
        .where("id", "=", id)
        .select([
          "u.id",
          "u.first_name",
          "u.last_name",
          "u.user_name",
          "u.avatar_url",
          "u.cover_image_url",
          "u.location",
          "u.gender",
          "u.about",
          "u.email",
          "u.email_confirmed_at",
          "u.facebook_profile_url",
          "u.twitter_profile_url",
          "u.instagram_profile_url",
          "u.created_at"
        ])
        .executeTakeFirst();

      if (!user) {
        return null;
      }

      const factors = await this.dataLayer
        .selectFrom("Factor")
        .where("user_id", "=", id)
        .where("status", "=", "VERIFIED")
        .select(["id", "friendly_name", "factor_type"])
        .execute();

      return {
        ...user,
        factors
      };
    });
  }

  public getUserPosts(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

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
        .where("p.author_id", "=", user.id)
        .orderBy("p.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (posts.length === 0) return [];

      const postIds = posts.map((p) => p.id);
      const votes = await this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "u.post_id",
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (partition by u.post_id order by u.created_at asc)`.as("rn")
        ])
        .where("u.post_id", "in", postIds)
        .execute();

      const upvotes = votes.filter((r) => r.rn <= 5);
      const upvotesByPost = new Map<string, Array<{ user_id: string; avatar_url: string | null }>>();
      for (const uv of upvotes) {
        if (!upvotesByPost.has(uv.post_id)) {
          upvotesByPost.set(uv.post_id, []);
        }
        upvotesByPost.get(uv.post_id)!.push({ user_id: uv.user_id, avatar_url: uv.avatar_url });
      }

      return posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.author_id,
          user_name: post.user_name,
          first_name: post.first_name,
          last_name: post.last_name,
          avatar_url: post.avatar_url
        },
        voters: (upvotesByPost.get(post.id) || []).map((uv) => ({
          id: uv.user_id,
          avatar_url: uv.avatar_url
        })),
        votes: post.votes ?? 0,
        comments: post.comments ?? 0
      }));
    });
  }

  public countUserPosts(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_posts")
        .executeTakeFirst();

      return res?.total_posts ?? 0;
    });
  }

  public getUserVotedPosts(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

      const votedPostIds = await this.dataLayer
        .selectFrom("Upvote")
        .where("user_id", "=", user.id)
        .select("post_id")
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (votedPostIds.length === 0) return [];

      const postIds = votedPostIds.map((v) => v.post_id);

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
        .where("p.id", "in", postIds)
        .execute();

      const votes = await this.dataLayer
        .selectFrom("Upvote as u")
        .innerJoin("User as upvote_user", "upvote_user.id", "u.user_id")
        .select([
          "u.post_id",
          "upvote_user.id as user_id",
          "upvote_user.avatar_url",
          sql<number>`row_number() over (partition by u.post_id order by u.created_at asc)`.as("rn")
        ])
        .where("u.post_id", "in", postIds)
        .execute();

      const upvotes = votes.filter((r) => r.rn <= 5);
      const upvotesByPost = new Map<string, Array<{ user_id: string; avatar_url: string | null }>>();
      for (const uv of upvotes) {
        if (!upvotesByPost.has(uv.post_id)) {
          upvotesByPost.set(uv.post_id, []);
        }
        upvotesByPost.get(uv.post_id)!.push({ user_id: uv.user_id, avatar_url: uv.avatar_url });
      }

      const postMap = new Map(posts.map((p) => [p.id, p]));
      return postIds
        .map((id) => postMap.get(id))
        .filter(Boolean)
        .map((post) => ({
          id: post!.id,
          slug: post!.slug,
          title: post!.title,
          created_at: post!.created_at,
          updated_at: post!.updated_at,
          author: {
            id: post!.author_id,
            user_name: post!.user_name,
            first_name: post!.first_name,
            last_name: post!.last_name,
            avatar_url: post!.avatar_url
          },
          voters: (upvotesByPost.get(post!.id) || []).map((uv) => ({
            id: uv.user_id,
            avatar_url: uv.avatar_url
          })),
          votes: post!.votes ?? 0,
          comments: post!.comments ?? 0
        }));
    });
  }

  public countUserVotedPosts(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_votes")
        .executeTakeFirst();

      return res?.total_votes ?? 0;
    });
  }

  public getUserComments(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

      const comments = await this.dataLayer
        .selectFrom("Comment as c")
        .innerJoin("User as u", "u.id", "c.user_id")
        .innerJoin("Post as p", "p.id", "c.post_id")
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
          "p.id as post_id",
          "p.title as post_title",
          "p.slug as post_slug"
        ])
        .where("c.user_id", "=", user.id)
        .where("c.parent_id", "is", null)
        .orderBy("c.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return comments.map((comment) => ({
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
        post: {
          id: comment.post_id,
          title: comment.post_title,
          slug: comment.post_slug
        }
      }));
    });
  }

  public countUserComments(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_comments")
        .executeTakeFirst();

      return res?.total_comments ?? 0;
    });
  }

  public getUserFollowers(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

      const followers = await this.dataLayer
        .selectFrom("Follow as f")
        .innerJoin("User as u", "u.id", "f.follower_id")
        .leftJoin("UserAggregates as ua", "ua.user_id", "u.id")
        .select([
          "u.id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "u.about",
          "ua.total_followers",
          "ua.total_posts"
        ])
        .where("f.following_id", "=", user.id)
        .orderBy("f.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return followers.map((follower) => ({
        id: follower.id,
        user_name: follower.user_name,
        first_name: follower.first_name,
        last_name: follower.last_name,
        avatar_url: follower.avatar_url,
        about: follower.about,
        aggregates: {
          total_followers: follower.total_followers ?? 0,
          total_posts: follower.total_posts ?? 0
        }
      }));
    });
  }

  public countUserFollowers(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_followers")
        .executeTakeFirst();

      return res?.total_followers ?? 0;
    });
  }

  public getUserFollowing(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

      const following = await this.dataLayer
        .selectFrom("Follow as f")
        .innerJoin("User as u", "u.id", "f.following_id")
        .leftJoin("UserAggregates as ua", "ua.user_id", "u.id")
        .select([
          "u.id",
          "u.user_name",
          "u.first_name",
          "u.last_name",
          "u.avatar_url",
          "u.about",
          "ua.total_followers",
          "ua.total_posts"
        ])
        .where("f.follower_id", "=", user.id)
        .orderBy("f.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      return following.map((user) => ({
        id: user.id,
        user_name: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        about: user.about,
        aggregates: {
          total_followers: user.total_followers ?? 0,
          total_posts: user.total_posts ?? 0
        }
      }));
    });
  }

  public countUserFollowing(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_following")
        .executeTakeFirst();

      return res?.total_following ?? 0;
    });
  }

  public getUserGroups(username: string, opts: { page: number; limit: number }) {
    const { page, limit } = opts;
    const offset = (page - 1) * limit;
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return [];

      const memberGroups = await this.dataLayer
        .selectFrom("GroupMember")
        .where("user_id", "=", user.id)
        .where("is_removed", "=", false)
        .select(["group_id", "role"])
        .execute();

      if (memberGroups.length === 0) return [];

      const groupIds = memberGroups.map((m) => m.group_id);
      const roleByGroup = new Map(memberGroups.map((m) => [m.group_id, m.role]));

      const groups = await this.dataLayer
        .selectFrom("Group as g")
        .leftJoin("GroupAggregates as ga", "ga.group_id", "g.id")
        .select([
          "g.id",
          "g.name",
          "g.about",
          "g.logo_url",
          "g.type",
          "g.status",
          "g.created_at",
          "g.updated_at",
          "ga.total_members"
        ])
        .where("g.id", "in", groupIds)
        .orderBy("g.created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      if (groups.length === 0) return [];

      const admins = await this.dataLayer
        .selectFrom("GroupMember as gm")
        .innerJoin("User as u", "u.id", "gm.user_id")
        .select(["gm.group_id", "u.id as user_id", "u.user_name", "u.first_name", "u.last_name"])
        .where("gm.group_id", "in", groupIds)
        .where("gm.role", "=", "ADMIN")
        .execute();

      const adminByGroup = new Map<string, (typeof admins)[0]>();
      for (const admin of admins) {
        if (!adminByGroup.has(admin.group_id)) {
          adminByGroup.set(admin.group_id, admin);
        }
      }

      return groups.map((group) => {
        const admin = adminByGroup.get(group.id);
        return {
          id: group.id,
          name: group.name,
          about: group.about,
          logo_url: group.logo_url,
          type: group.type,
          status: group.status,
          created_at: group.created_at,
          updated_at: group.updated_at,
          total_members: group.total_members ?? 0,
          role: roleByGroup.get(group.id),
          admin: admin
            ? {
                id: admin.user_id,
                user_name: admin.user_name,
                first_name: admin.first_name,
                last_name: admin.last_name
              }
            : null
        };
      });
    });
  }

  public countUserGroups(username: string) {
    return this.execute(async () => {
      const user = await this.dataLayer
        .selectFrom("User")
        .where("user_name", "=", username)
        .select("id")
        .executeTakeFirst();

      if (!user) return 0;

      const res = await this.dataLayer
        .selectFrom("UserAggregates")
        .where("user_id", "=", user.id)
        .select("total_groups")
        .executeTakeFirst();

      return res?.total_groups ?? 0;
    });
  }
}
