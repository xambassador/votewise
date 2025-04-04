import type { AppContext } from "@/context";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};
type TCreate = { userId: string; token: string; revoked?: boolean };

export class RefreshTokenRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    const { token, revoked = false, userId } = data;
    return this.execute(async () => {
      const res = await this.db.refreshToken.create({ data: { user_id: userId, revoked, token } });
      return res;
    });
  }

  public find(token: string) {
    return this.execute(async () => {
      const res = await this.db.refreshToken.findUnique({ where: { token } });
      return res;
    });
  }

  public revoke(id: string) {
    return this.execute(async () => {
      const res = await this.db.refreshToken.update({ where: { id }, data: { revoked: true } });
      return res;
    });
  }
}
