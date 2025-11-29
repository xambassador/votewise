import type { AppContext } from "@/context";

import chalk from "chalk";

import { sql } from "@votewise/prisma";

type Options = { ctx: AppContext };

export class HealthChecker {
  private readonly ctx: AppContext;

  constructor(opts: Options) {
    this.ctx = opts.ctx;
  }

  public async connectDB() {
    return new Promise((resolve, reject) => {
      sql`SELECT 1`
        .execute(this.ctx.dataLayer)
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(
            chalk.bgRed.bold(` Postgres is unreachable at ${this.ctx.environment.DATABASE_URL}  `)
          );
          this.ctx.logger.errorSync(err);
          reject(err);
        });
    });
  }

  public async connectCache() {
    return new Promise((resolve, reject) => {
      this.ctx.cache.connect();
      this.ctx.cache.onError((err) => {
        this.ctx.logger.errorSync(chalk.bgRed.bold(`  Redis is unreachable at ${this.ctx.environment.REDIS_URL}  `));
        this.ctx.logger.errorSync(err);
        reject(err);
      });
      this.ctx.cache.onConnect(() => resolve(true));
      this.ctx.cache.onEnd(() => reject(false));
    });
  }

  public async disconnectDB() {
    return new Promise((resolve, reject) => {
      this.ctx.dataLayer
        .destroy()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(chalk.red(`❌ Failed to disconnect from Postgres`));
          this.ctx.logger.errorSync(err);
          reject(err);
        });
    });
  }

  public async disconnectCache() {
    return new Promise((resolve, reject) => {
      this.ctx.cache
        .disconnect()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(chalk.red(`❌ Failed to disconnect from Redis`));
          this.ctx.logger.errorSync(err);
          reject(err);
        });
    });
  }
}
