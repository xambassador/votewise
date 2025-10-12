import type { Tx } from "./transaction";

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
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const session = await db
        .insertInto("Session")
        .values({
          user_id: data.userId,
          factor_id: data.factorId,
          aal: data.aal,
          user_agent: data.userAgent,
          ip: data.ip,
          id: data.id,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return session;
    });
  }

  public find(id: string) {
    return this.execute(async () => {
      const session = await this.dataLayer.selectFrom("Session").where("id", "=", id).selectAll().executeTakeFirst();
      return session;
    });
  }

  public delete(id: string, tx?: Tx) {
    const db = (tx ?? this.dataLayer) as Tx;
    return this.execute(() => db.deleteFrom("Session").where("id", "=", id).execute());
  }

  public update(id: string, data: Partial<TCreate>, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(() =>
      db
        .updateTable("Session")
        .set({
          aal: data.aal,
          factor_id: data.factorId,
          user_agent: data.userAgent,
          user_id: data.userId,
          ip: data.ip,
          updated_at: new Date()
        })
        .where("id", "=", id)
        .execute()
    );
  }

  public findByUserId(userId: string) {
    return this.execute(async () => {
      const sessions = await this.dataLayer.selectFrom("Session").where("user_id", "=", userId).selectAll().execute();
      return sessions;
    });
  }

  public clearByUserId(userId: string, tx?: Tx) {
    const db = (tx ?? this.dataLayer) as Tx;
    return this.execute(() => db.deleteFrom("Session").where("user_id", "=", userId).execute());
  }
}
