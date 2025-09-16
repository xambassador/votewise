import type { Prisma } from "@votewise/prisma";
import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = Prisma.UserCreateInput;
type TUpdate = Prisma.UserUpdateInput;

export class UserRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const user = await db.user.create({ data });
      return user;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({ where: { id } });
      return user;
    });
  }

  public findByEmail(email: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({ where: { email } });
      return user;
    });
  }

  public findByUsername(username: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({ where: { user_name: username } });
      return user;
    });
  }

  public update(id: string, data: TUpdate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const user = await db.user.update({ where: { id }, data });
      return user;
    });
  }

  public updateByEmail(email: string, data: TUpdate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const user = await db.user.update({ where: { email }, data });
      return user;
    });
  }

  public findManyByIds(ids: string[]) {
    return this.execute(async () => {
      const users = await this.db.user.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          user_name: true,
          first_name: true,
          last_name: true,
          avatar_url: true,
          about: true
        }
      });
      return users;
    });
  }

  public delete() {}

  public getRemainingVotes(userId: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({
        where: { id: userId },
        select: { vote_bucket: true }
      });
      return user?.vote_bucket ?? 0;
    });
  }

  public getProfile(username: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({
        where: { user_name: username },
        select: {
          about: true,
          avatar_url: true,
          first_name: true,
          id: true,
          last_name: true,
          user_name: true,
          cover_image_url: true,
          location: true,
          gender: true,
          created_at: true,
          userAggregates: {
            select: {
              total_comments: true,
              total_votes: true,
              total_posts: true,
              total_followers: true,
              total_following: true,
              total_groups: true
            }
          }
        }
      });
      return user;
    });
  }

  public getMyProfile(id: string) {
    return this.execute(async () => {
      const user = await this.db.user.findUnique({
        where: { id },
        select: {
          about: true,
          avatar_url: true,
          first_name: true,
          id: true,
          last_name: true,
          user_name: true,
          cover_image_url: true,
          location: true,
          gender: true,
          created_at: true,
          userAggregates: {
            select: {
              total_comments: true,
              total_votes: true,
              total_posts: true,
              total_followers: true,
              total_following: true,
              total_groups: true
            }
          }
        }
      });
      return user;
    });
  }
}
