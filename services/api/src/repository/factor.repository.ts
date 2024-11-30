import type { AppContext } from "@/context";
import type { Prisma } from "@votewise/prisma";

import { BaseRepository } from "./base.repository";

type Dependencies = {
  db: AppContext["db"];
};

type TFactorCreate = Prisma.FactorCreateInput;
type TCreate = {
  userId: string;
  factorType: TFactorCreate["factor_type"];
  status: TFactorCreate["status"];
  secret: string;
  friendlyName: string;
};

export class FactorRepository extends BaseRepository {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    return this.execute(async () => {
      const factor = await this.db.factor.create({
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

  public verifyFactor(id: string) {
    return this.execute(async () => {
      const factor = await this.db.factor.update({ where: { id }, data: { status: "VERIFIED" } });
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
      const factor = await this.db.factor.findFirst({ where: { user_id: userId, factor_type: type } });
      return factor;
    });
  }
}
