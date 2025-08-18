import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

export class FollowRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(followerId: string, followedId: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const follow = await db.follow.create({
        data: {
          follower_id: followerId,
          following_id: followedId
        }
      });
      return follow;
    });
  }

  public findByFollowerId(followerId: string) {
    return this.execute(async () => {
      const follows = await this.db.follow.findMany({
        where: {
          follower_id: followerId
        }
      });
      return follows;
    });
  }

  public findByFollowingId(followingId: string) {
    return this.execute(async () => {
      const follows = await this.db.follow.findMany({
        where: {
          following_id: followingId
        }
      });
      return follows;
    });
  }

  public isFollowing(followerId: string, followingId: string) {
    return this.execute(async () => {
      const follow = await this.db.follow.findFirst({
        where: { follower_id: followerId, following_id: followingId }
      });
      return follow !== null;
    });
  }

  public getFollow(followerId: string, followingId: string) {
    return this.execute(async () => {
      const follow = await this.db.follow.findFirst({
        where: { follower_id: followerId, following_id: followingId }
      });
      return follow;
    });
  }

  public delete(id: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => db.follow.delete({ where: { id } }));
  }
}
