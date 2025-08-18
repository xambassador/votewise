import type { AppContext } from "@/context";

type Dependencies = {
  db: AppContext["db"];
};

export type TransactionCtx = Parameters<Parameters<AppContext["db"]["$transaction"]>[0]>[0];

export class TransactionManager {
  private readonly db: Dependencies["db"];

  constructor(cfg: Dependencies) {
    this.db = cfg.db;
  }

  public async withTransaction<T>(cb: (tx: TransactionCtx) => Promise<T>) {
    return this.db.$transaction((tx) => cb(tx));
  }
}
