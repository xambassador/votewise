import type { AppContext } from "@/context";
import type { Prisma } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TCreate = Prisma.UserCreateInput;
type TUpdate = Prisma.UserUpdateInput;

export class UserRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    return this.execute(async () => {
      const user = await this.db.user.create({ data });
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

  public update(id: string, data: TUpdate) {
    return this.execute(async () => {
      const user = await this.db.user.update({ where: { id }, data });
      return user;
    });
  }

  public updateByEmail(email: string, data: TUpdate) {
    return this.execute(async () => {
      const user = await this.db.user.update({ where: { email }, data });
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

  delete() {}
}
