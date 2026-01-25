import type { NewFactor } from "@votewise/db/db";
import type { Tx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TFactorCreate = NewFactor;
type TCreate = {
  userId: string;
  factorType: TFactorCreate["factor_type"];
  status: TFactorCreate["status"];
  secret: string;
  friendlyName: string;
};

export class FactorRepository extends BaseRepository {
  private readonly dataLayer: RepositoryConfig["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.dataLayer = cfg.dataLayer;
  }

  public create(data: TCreate, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const factor = await db
        .insertInto("Factor")
        .values({
          id: this.dataLayer.createId(),
          user_id: data.userId,
          factor_type: data.factorType,
          status: data.status,
          secret: data.secret,
          friendly_name: data.friendlyName,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      return factor;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const factor = await this.dataLayer.selectFrom("Factor").where("id", "=", id).selectAll().executeTakeFirst();
      return factor;
    });
  }

  public verifyFactor(id: string, tx?: Tx) {
    const db = tx ?? this.dataLayer;
    return this.execute(async () => {
      const factor = await db
        .updateTable("Factor")
        .set({ status: "VERIFIED" })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirstOrThrow();
      return factor;
    });
  }

  public findByUserId(userId: string) {
    return this.execute(async () => {
      const factors = await this.dataLayer.selectFrom("Factor").where("user_id", "=", userId).selectAll().execute();
      return factors;
    });
  }

  public findByUserIdAndType(userId: string, type: TFactorCreate["factor_type"]) {
    return this.execute(async () => {
      const factor = await this.dataLayer
        .selectFrom("Factor")
        .where("user_id", "=", userId)
        .where("factor_type", "=", type)
        .where("status", "=", "VERIFIED")
        .selectAll()
        .executeTakeFirst();
      return factor;
    });
  }

  public findFirstUnverifiedByUserIdAndType(userId: string, type: TFactorCreate["factor_type"]) {
    return this.execute(async () => {
      const factor = await this.dataLayer
        .selectFrom("Factor")
        .where("user_id", "=", userId)
        .where("factor_type", "=", type)
        .where("status", "=", "UNVERIFIED")
        .selectAll()
        .executeTakeFirst();
      return factor;
    });
  }

  public deleteById(id: string, tx?: Tx) {
    const db = (tx ?? this.dataLayer) as Tx;
    return this.execute(async () => {
      await db.deleteFrom("Factor").where("id", "=", id).execute();
    });
  }
}
