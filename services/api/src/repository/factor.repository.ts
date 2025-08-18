import type { Prisma } from "@votewise/prisma";
import type { TransactionCtx } from "./transaction";

import { BaseRepository } from "./base.repository";

type TFactorCreate = Prisma.FactorCreateInput;
type TCreate = {
  userId: string;
  factorType: TFactorCreate["factor_type"];
  status: TFactorCreate["status"];
  secret: string;
  friendlyName: string;
};

export class FactorRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const factor = await db.factor.create({
        data: {
          user_id: data.userId,
          factor_type: data.factorType,
          status: data.status,
          secret: data.secret,
          friendly_name: data.friendlyName,
          created_at: new Date()
        }
      });
      return factor;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const factor = await this.db.factor.findUnique({ where: { id } });
      return factor;
    });
  }

  public verifyFactor(id: string, tx?: TransactionCtx) {
    const db = tx ?? this.db;
    return this.execute(async () => {
      const factor = await db.factor.update({ where: { id }, data: { status: "VERIFIED" } });
      return factor;
    });
  }

  public findByUserId(userId: string) {
    return this.execute(async () => {
      const factors = await this.db.factor.findMany({ where: { user_id: userId } });
      return factors;
    });
  }

  public findByUserIdAndType(userId: string, type: TFactorCreate["factor_type"]) {
    return this.execute(async () => {
      const factor = await this.db.factor.findFirst({
        where: { user_id: userId, factor_type: type, status: "VERIFIED" }
      });
      return factor;
    });
  }
}
