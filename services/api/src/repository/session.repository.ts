import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = {
  userId: string;
  factorId?: string;
  aal: "aal1" | "aal2";
  userAgent: string;
  ip: string;
  id: string;
};

export class SessionRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const session = await db.session.create({
        data: {
          user_id: data.userId,
          factor_id: data.factorId,
          aal: data.aal,
          user_agent: data.userAgent,
          ip: data.ip,
          id: data.id
        }
      });
      return session;
    });
  }

  public find(id: string) {
    return this.execute(async () => {
      const session = await this.db.session.findUnique({ where: { id } });
      return session;
    });
  }

  public delete(id: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      await db.session.delete({ where: { id } });
    });
  }

  public update(id: string, data: Partial<TCreate>, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      await db.session.update({
        where: { id },
        data: { aal: data.aal, factor_id: data.factorId, user_agent: data.userAgent, user_id: data.userId, ip: data.ip }
      });
    });
  }

  public findByUserId(userId: string) {
    return this.execute(async () => {
      const sessions = await this.db.session.findMany({ where: { user_id: userId } });
      return sessions;
    });
  }

  public clearByUserId(userId: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      await db.session.deleteMany({ where: { user_id: userId } });
    });
  }
}
