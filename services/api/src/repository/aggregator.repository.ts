import type {
  GroupAggregates,
  NewGroupAggregates,
  NewPostAggregates,
  NewUserAggregates,
  PostAggregates,
  UserAggregates
} from "@votewise/db/db";
import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

type PostAggregatorData = NewPostAggregates;
type UserAggregatorData = NewUserAggregates;
type GroupAggregatorData = NewGroupAggregates;
type PostAggregation = Omit<PostAggregatorData, "post_id">;
type UserAggregation = Omit<UserAggregatorData, "user_id">;
type GroupAggregation = Omit<GroupAggregatorData, "group_id">;

class PostAggregator extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public aggregate(postId: string, fn: (data: PostAggregates | undefined) => PostAggregation, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const existing = await db
        .selectFrom("PostAggregates")
        .selectAll()
        .where("post_id", "=", postId)
        .executeTakeFirst();
      const toUpdate = fn(existing);
      if (existing) {
        await db.updateTable("PostAggregates").set(toUpdate).where("post_id", "=", postId).execute();
      } else {
        await db
          .insertInto("PostAggregates")
          .values({ post_id: postId, ...toUpdate })
          .execute();
      }
      return toUpdate;
    });
  }
}

class UserAggregator extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public aggregate(userId: string, fn: (data: UserAggregates | undefined) => UserAggregation, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const existing = await db
        .selectFrom("UserAggregates")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();
      const toUpdate = fn(existing);
      if (existing) {
        await db.updateTable("UserAggregates").set(toUpdate).where("user_id", "=", userId).execute();
      } else {
        await db
          .insertInto("UserAggregates")
          .values({ user_id: userId, ...toUpdate })
          .execute();
      }
      return toUpdate;
    });
  }
}

class GroupAggregator extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public aggregate(groupId: string, fn: (data: GroupAggregates | undefined) => GroupAggregation, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const existing = await db
        .selectFrom("GroupAggregates")
        .selectAll()
        .where("group_id", "=", groupId)
        .executeTakeFirst();
      const toUpdate = fn(existing);
      if (existing) {
        await db.updateTable("GroupAggregates").set(toUpdate).where("group_id", "=", groupId).execute();
      } else {
        await db
          .insertInto("GroupAggregates")
          .values({ group_id: groupId, ...toUpdate })
          .execute();
      }
      return toUpdate;
    });
  }
}

export class Aggregator extends BaseRepository {
  public postAggregator: PostAggregator;
  public userAggregator: UserAggregator;
  public groupAggregator: GroupAggregator;

  constructor(cfg: RepositoryConfig) {
    super();
    this.postAggregator = new PostAggregator(cfg);
    this.userAggregator = new UserAggregator(cfg);
    this.groupAggregator = new GroupAggregator(cfg);
  }
}
