import type { Prisma } from "@votewise/prisma";
import type { GroupAggregates, PostAggregates, UserAggregates } from "@votewise/prisma/client";
import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type PostAggregatorData = Prisma.PostAggregatesUncheckedCreateInput;
type UserAggregatorData = Prisma.UserAggregatesUncheckedCreateInput;
type GroupAggregatorData = Prisma.GroupAggregatesUncheckedCreateInput;
type PostAggregation = Omit<PostAggregatorData, "post_id">;
type UserAggregation = Omit<UserAggregatorData, "user_id">;
type GroupAggregation = Omit<GroupAggregatorData, "group_id">;

class PostAggregator extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public aggregate(postId: string, fn: (data: PostAggregates | null) => PostAggregation, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const existing = await db.postAggregates.findUnique({ where: { post_id: postId } });
      const toUpdate = fn(existing);
      await db.postAggregates.upsert({
        where: { post_id: postId },
        create: { post_id: postId, ...toUpdate },
        update: toUpdate
      });
      return toUpdate;
    });
  }
}

class UserAggregator extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public aggregate(userId: string, fn: (data: UserAggregates | null) => UserAggregation, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const existing = await db.userAggregates.findUnique({ where: { user_id: userId } });
      const toUpdate = fn(existing);
      await db.userAggregates.upsert({
        where: { user_id: userId },
        create: { user_id: userId, ...toUpdate },
        update: toUpdate
      });
      return toUpdate;
    });
  }
}

class GroupAggregator extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public aggregate(groupId: string, fn: (data: GroupAggregates | null) => GroupAggregation, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const existing = await db.groupAggregates.findUnique({ where: { group_id: groupId } });
      const toUpdate = fn(existing);
      await db.groupAggregates.upsert({
        where: { group_id: groupId },
        create: { group_id: groupId, ...toUpdate },
        update: toUpdate
      });
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
