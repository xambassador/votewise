import type { NewUser, UserUpdate } from "@votewise/prisma/db";
import type { Tx } from "./transaction";

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
}
