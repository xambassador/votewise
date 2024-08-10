import type { AppContext } from "@/http/context";
import type { Prisma } from "@votewise/prisma";

type Dependencies = {
  db: AppContext["db"];
};

type TCreate = Prisma.UserCreateInput;

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

  async findById() {}

  async findByEmail(email: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    return user;
  }

  async update() {}

  async delete() {}
}
