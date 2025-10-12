import type { AppContext } from "@/context";
import type { Transaction } from "@votewise/prisma";
import type { DB } from "@votewise/prisma/db";

type Dependencies = {
  db: AppContext["db"];
};

/**
 * @deprecated
 */
export type TransactionCtx = Parameters<Parameters<AppContext["db"]["$transaction"]>[0]>[0];
export type Tx = Transaction<DB>;

export class TransactionManager {
  private readonly db: Dependencies["db"];
  private readonly dataLayer: AppContext["dataLayer"];

  constructor(cfg: Dependencies & { dataLayer: AppContext["dataLayer"] }) {
    this.db = cfg.db;
    this.dataLayer = cfg.dataLayer;
  }

  /**
   * @deprecated
   */
  public async withTransaction<T>(cb: (tx: TransactionCtx) => Promise<T>) {
    return this.db.$transaction((tx) => cb(tx));
  }

  public async withDataLayerTransaction<T>(cb: (tx: Transaction<DB>) => Promise<T>) {
    return this.dataLayer.transaction().execute(cb);
  }
}
