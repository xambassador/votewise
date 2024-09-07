import type { AppContext } from "@/context";
import type { Prisma } from "@votewise/prisma";

type Dependencies = {
  db: AppContext["db"];
};

type TCreate = Prisma.UserCreateInput;
type TUpdate = Prisma.UserUpdateInput;

export class UserRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    this.db = cfg.db;
  }

  async create(data: TCreate) {
    const user = await this.db.user.create({ data });
    return user;
  }

  async find() {}

  async findOne() {}

  async findById(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    return user;
  }

  async findByUsername(username: string) {
    const user = await this.db.user.findUnique({ where: { user_name: username } });
    return user;
  }

  async update(id: string, data: TUpdate) {
    const user = await this.db.user.update({ where: { id }, data });
    return user;
  }

  async delete() {}
}
