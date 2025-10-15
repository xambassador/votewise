import type { AppContext } from "@/context";
import type { Transaction } from "@votewise/prisma";
import type { DB } from "@votewise/prisma/db";

export type Tx = Transaction<DB>;

export class TransactionManager {
  private readonly dataLayer: AppContext["dataLayer"];

  constructor(cfg: RepositoryConfig) {
    this.dataLayer = cfg.dataLayer;
  }

  public async withDataLayerTransaction<T>(cb: (tx: Transaction<DB>) => Promise<T>) {
    return this.dataLayer.transaction().execute(cb);
  }
}
