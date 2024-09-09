import "@/types";

import type { ServerConfig, ServerSecrets } from "@/configs";
import type { HttpTerminator } from "http-terminator";

import http from "http";
import https from "https";
import express from "express";
import { createHttpTerminator } from "http-terminator";

import { getSSL } from "@/utils";
import { banner } from "@/utils/banner";

import { AppContext } from "../context";
import * as error from "./error";
import { AppMiddleware } from "./middlewares";
import { AppRouter } from "./router";

/* ----------------------------------------------------------------------------------------------- */

export class Server {
  public ctx: AppContext;
  public server?: http.Server;
  public app: express.Application;
  private terminator!: HttpTerminator;

  constructor(opts: { app: express.Application; ctx: AppContext }) {
    this.ctx = opts.ctx;
    this.app = opts.app;
    this.setupGracefulShutdown();
  }

  static async create(opts: { cfg: ServerConfig; secrets: ServerSecrets; overrides?: Partial<AppContext> }) {
    const { cfg, secrets, overrides } = opts;
    const app = express();
    const ctx = await AppContext.fromConfig(cfg, secrets, overrides);
    const middleware = new AppMiddleware();
    const routers = new AppRouter({});
    app.disable("x-powered-by");
    app.set("trust proxy", true);
    app.use(middleware.register());
    app.use(routers.register());
    app.use(error.withAppContext(ctx).handler);
    return new Server({ app, ctx });
  }

  public async start(): Promise<http.Server> {
    banner();
    const { port, ssl } = this.ctx.config;
    const sslConfig = getSSL(ssl);
    const useHTTPs = !!sslConfig.key && !!sslConfig.cert;
    useHTTPs ? https.createServer(sslConfig, this.app) : http.createServer(this.app);
    const server = this.app.listen(port, () => {
      this.ctx.logger.logSync(`Votewise API is running on port ${port}`);
      this.terminator = createHttpTerminator({ server });
    });
    this.server = server;
    this.server.keepAliveTimeout = 61 * 1000;
    this.healthCheck();
    server.on("error", (err) => {
      const error = err as NodeJS.ErrnoException;
      if (error.syscall !== "listen") {
        throw err;
      }

      const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
      switch (error.code) {
        case "EACCES":
          this.ctx.logger.errorSync(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          this.ctx.logger.errorSync(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw err;
      }
    });
    return server;
  }

  private async healthCheck() {
    try {
      await Promise.all([this.connectDB(), this.connectCache()]);
      this.ctx.logger.logSync("✅ All services are up and running");
    } catch (err) {
      this.ctx.logger.errorSync("❌ Some services are down");
      process.exit(1);
    }
  }

  private async connectDB() {
    return new Promise((resolve, reject) => {
      this.ctx.db
        .$connect()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(`❌ 🐘 Postgres is unreachable at ${this.ctx.environment.DATABASE_URL}`, err);
          reject(err);
        });
    });
  }

  private async connectCache() {
    return new Promise((resolve, reject) => {
      this.ctx.cache.connect();
      this.ctx.cache.onError((err) => {
        this.ctx.logger.errorSync(`❌ 🚀 Redis is unreachable at ${this.ctx.environment.REDIS_URL}`, err);
        reject(err);
      });
      this.ctx.cache.onConnect(() => resolve(true));
      this.ctx.cache.onEnd(() => reject(false));
    });
  }

  private setupGracefulShutdown() {
    process.on("SIGTERM", async () => {
      await this.shutdown();
    });
    process.on("SIGINT", async () => {
      await this.shutdown();
    });
  }

  public async shutdown() {
    this.ctx.logger.logSync("Shutting down Votewise API");
    try {
      await this.shutdownServer();
      await this.disconnectDB();
      await this.disconnectCache();
      this.server = undefined;
      this.ctx.logger.logSync("✅ Votewise API has been shutdown");
      process.exit(0);
    } catch (err) {
      this.ctx.logger.errorSync("Failed to shutdown Votewise API", err);
      process.exit(1);
    }
  }

  private async disconnectDB() {
    return new Promise((resolve, reject) => {
      this.ctx.db
        .$connect()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(`❌ 🐘 Postgres is unreachable at ${this.ctx.environment.DATABASE_URL}`, err);
          reject(err);
        });
    });
  }

  private async disconnectCache() {
    return new Promise((resolve, reject) => {
      this.ctx.cache
        .disconnect()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(`❌ 🚀 Redis is unreachable at ${this.ctx.environment.REDIS_URL}`, err);
          reject(err);
        });
    });
  }

  private async shutdownServer() {
    return new Promise((resolve, reject) => {
      this.terminator
        ?.terminate()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync("Failed to terminate HTTP server", err);
          reject(err);
        });
    });
  }
}
