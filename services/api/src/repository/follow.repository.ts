import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

export class FollowRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(followerId: string, followedId: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const follow = await db
        .insertInto("Follow")
        .values({
          follower_id: followerId,
          following_id: followedId,
          id: this.dataLayer.createId(),
          created_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return follow;
    });
  }

  public findByFollowerId(followerId: string) {
    return this.execute(async () => {
      const follows = await this.dataLayer
        .selectFrom("Follow")
        .where("follower_id", "=", followerId)
        .selectAll()
        .execute();
      return follows;
    });
  }

  public findByFollowingId(followingId: string) {
    return this.execute(async () => {
      const follows = await this.dataLayer
        .selectFrom("Follow")
        .where("following_id", "=", followingId)
        .selectAll()
        .execute();
      return follows;
    });
  }

  public isFollowing(followerId: string, followingId: string) {
    return this.execute(async () => {
      const follow = await this.dataLayer
        .selectFrom("Follow")
        .where("follower_id", "=", followerId)
        .where("following_id", "=", followingId)
        .selectAll()
        .executeTakeFirst();
      return follow;
    });
  }

  public getFollow(followerId: string, followingId: string) {
    return this.execute(async () => {
      const follow = await this.dataLayer
        .selectFrom("Follow")
        .where("follower_id", "=", followerId)
        .where("following_id", "=", followingId)
        .selectAll()
        .executeTakeFirst();
      return follow;
    });
  }

  public delete(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      db.deleteFrom("Follow").where("id", "=", id).execute();
    });
  }
}
