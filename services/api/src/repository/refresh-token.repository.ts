import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TCreate = { userId: string; token: string; revoked?: boolean };

export class RefreshTokenRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    const { token, revoked = false, userId } = data;
    return this.execute(async () => {
      const res = await db
        .insertInto("RefreshToken")
        .values({
          id: this.dataLayer.createId(),
          user_id: userId,
          revoked,
          token,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return res;
    });
  }

  public find(token: string) {
    return this.execute(async () => {
      const res = await this.dataLayer
        .selectFrom("RefreshToken")
        .where("token", "=", token)
        .selectAll()
        .executeTakeFirst();
      return res;
    });
  }

  public revoke(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const res = await db
        .updateTable("RefreshToken")
        .set({ revoked: true, updated_at: new Date() })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return res;
    });
  }
}
