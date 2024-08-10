import "@/types";

import type { ServerConfig, ServerSecrets } from "@/configs";
import type { HttpTerminator } from "http-terminator";

import http from "http";
import https from "https";
import chrona from "chrona";
import compression from "compression";
import cors from "cors";
import express, { json } from "express";
import helmet from "helmet";
import { createHttpTerminator } from "http-terminator";

import { banner } from "@/utils/banner";
import { getSSL } from "@/utils";

import { AppContext } from "./context";
import * as error from "./error";
import { ServerRouter } from "./router";

/* ----------------------------------------------------------------------------------------------- */

export class Server {
  public ctx: AppContext;
  public server?: http.Server;
  public app: express.Application;
  private terminator?: HttpTerminator;

  constructor(opts: { app: express.Application; ctx: AppContext }) {
    this.ctx = opts.ctx;
    this.app = opts.app;
  }

  static async create(opts: { cfg: ServerConfig; secrets: ServerSecrets; overrides?: Partial<AppContext> }) {
    const { cfg, secrets, overrides } = opts;
    const app = express();
    const ctx = await AppContext.fromConfig(cfg, secrets, overrides);
    const routers = new ServerRouter(ctx);
    app.disable("x-powered-by");
    app.set("trust proxy", true);
    app.use(chrona(":date :incoming :method :url :status :response-time :remote-address", (l) => ctx.logger.info(l)));
    app.use(compression());
    app.use(cors(cfg.cors));
    app.use(helmet());
    app.use(express.urlencoded({ extended: true }));
    app.use(json({ limit: cfg.blobUploadLimit }));
    app.use(routers.registerAuthRouter());
    app.use(error.withAppContext(ctx).handler);
    return new Server({ app, ctx });
  }

  public async start(): Promise<http.Server> {
    const { port, ssl } = this.ctx.config;
    const sslConfig = getSSL(ssl);
    const useHTTPs = !!sslConfig.key && !!sslConfig.cert;
    const server = useHTTPs ? https.createServer(sslConfig, this.app) : http.createServer(this.app);
    banner();
    this.app.listen(port, () => this.ctx.logger.info(`Votewise API is running on port ${port}`));
    this.server = server;
    this.server.keepAliveTimeout = 61 * 1000;
    this.terminator = createHttpTerminator({ server });
    return server;
  }

  public async destroy() {
    if (!this.terminator) {
      throw new Error("Server is not running");
    }

    await this.ctx.db.$disconnect();
    await this.ctx.cache.disconnect();
    await this.terminator.terminate();
    this.server = undefined;
  }

  public healthCheck() {
    this.ctx.db
      .$connect()
      .then(() => this.ctx.logger.info(`🐘 Postgres is reachable at ${this.ctx.environment.DATABASE_URL}`))
      .catch(() => {
        this.ctx.logger.error(`❌ 🐘 Postgres is unreachable at ${this.ctx.environment.DATABASE_URL}`);
        process.exit(1);
      });
    this.ctx.cache.onConnect(() => this.ctx.logger.info(`🚀 Redis is reachable at ${this.ctx.environment.REDIS_URL}`));
    this.ctx.cache.onError(() => {
      this.ctx.logger.error(`❌ 🚀 Redis is unreachable at ${this.ctx.environment.REDIS_URL}`);
      process.exit(1);
    });
  }
}
