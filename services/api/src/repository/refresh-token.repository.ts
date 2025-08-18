import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = { userId: string; token: string; revoked?: boolean };

export class RefreshTokenRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    const { token, revoked = false, userId } = data;
    return this.execute(async () => {
      const res = await db.refreshToken.create({ data: { user_id: userId, revoked, token } });
      return res;
    });
  }

  public find(token: string) {
    return this.execute(async () => {
      const res = await this.db.refreshToken.findUnique({ where: { token } });
      return res;
    });
  }

  public revoke(id: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const res = await db.refreshToken.update({ where: { id }, data: { revoked: true } });
      return res;
    });
  }
}
