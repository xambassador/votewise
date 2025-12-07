import "@/types";

import type http from "http";
import type { HttpTerminator } from "http-terminator";

import events from "events";
import chalk from "chalk";
import express from "express";
import { createHttpTerminator } from "http-terminator";

import { banner } from "@/utils/banner";

import { AppContext } from "../context";
import { DevelopmentRouter } from "./dev-router";
import * as error from "./error";
import { HealthChecker } from "./health";
import { AppMiddleware } from "./middlewares";
import { AppRouter } from "./router";

/* ----------------------------------------------------------------------------------------------- */

type ServerConfig = ApplicationConfigs["server"];
type ServerSecrets = ApplicationConfigs["secrets"];

export class Server {
  public ctx: AppContext;
  public server?: http.Server;
  public app: express.Application;
  private terminator!: HttpTerminator;
  private readonly serverConfig: ServerConfig;
  private readonly healthChecker: HealthChecker;
  private isAlreadyShuttingDown = false;

  constructor(opts: { app: express.Application; ctx: AppContext; cfg: ServerConfig }) {
    this.ctx = opts.ctx;
    this.app = opts.app;
    this.serverConfig = opts.cfg;
    this.isAlreadyShuttingDown = false;
    this.healthChecker = new HealthChecker({ ctx: opts.ctx });
    this.setupGracefulShutdown();
  }

  static async create(opts: { cfg: ServerConfig; secrets: ServerSecrets; overrides?: Partial<AppContext> }) {
    const { cfg, secrets, overrides } = opts;
    const app = express();
    const ctx = await AppContext.fromConfig(cfg, secrets, overrides);
    const middleware = new AppMiddleware();
    const devRouter = new DevelopmentRouter({ devMode: ctx.config.devMode });
    const routers = new AppRouter({ devRouter });
    app.disable("x-powered-by");
    app.set("trust proxy", true);
    app.use(middleware.register());
    app.use(routers.register());
    app.use(error.withAppContext(ctx).handler);
    return new Server({ app, ctx, cfg });
  }

  public async start(): Promise<http.Server> {
    banner();
    const { port } = this.ctx.config;
    const server = this.app.listen(port);
    this.ctx.services.realtime.init(server);
    this.terminator = createHttpTerminator({ server });
    this.server = server;
    this.server.keepAliveTimeout = this.serverConfig.keepAliveTimeout ?? 61 * 1000;
    this.server.headersTimeout = this.serverConfig.headersTimeout ?? 65 * 1000;
    this.server.requestTimeout = this.serverConfig.requestTimeout ?? 60 * 1000;
    this.server.timeout = this.serverConfig.serverTimeout ?? 60 * 1000;
    this.healthCheck();
    this.registerShutdownHandlers();
    await events.once(server, "listening");
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
      await Promise.all([this.healthChecker.connectDB(), this.healthChecker.connectCache()]);
      this.ctx.logger.logSync(chalk.green("All good!\n"));
    } catch (err) {
      this.ctx.logger.errorSync(chalk.red("❌ Health check failed!\n"));
      process.exit(1);
    }
  }

  private setupGracefulShutdown() {
    process.on("SIGTERM", async () => {
      this.ctx.logger.logSync(chalk.bgRed("  SIGTERM signal received...  "));
      await this.shutdown();
    });
    process.on("SIGINT", async () => {
      this.ctx.logger.logSync(chalk.bgRed("  SIGINT signal received...  "));
      await this.shutdown();
    });
  }

  public async shutdown() {
    if (this.isAlreadyShuttingDown) return;
    try {
      this.isAlreadyShuttingDown = true;
      await Promise.all([
        this.shutdownServer(),
        this.healthChecker.disconnectDB(),
        this.healthChecker.disconnectCache()
      ]);
      this.server = undefined;
      this.ctx.logger.logSync(chalk.green("Votewise API has been shutdown"));
      process.exit(0);
    } catch (err) {
      this.ctx.logger.errorSync(chalk.red("Failed to shutdown Votewise API"), err);
      process.exit(1);
    }
  }

  private async shutdownServer() {
    return new Promise((resolve, reject) => {
      this.terminator
        ?.terminate()
        .then(resolve)
        .catch((err) => {
          this.ctx.logger.errorSync(chalk.red("Failed to terminate HTTP server"), err);
          reject(err);
        });
    });
  }

  private registerShutdownHandlers() {
    process.on("unhandledRejection", async (reason) => {
      this.ctx.logger.errorSync("Unhandled Rejection Receive....", reason);
      this.ctx.logger.errorSync("Shutting down Votewise API due to unhandled rejection");
      await this.shutdown();
    });
    process.on("uncaughtException", async (err) => {
      this.ctx.logger.errorSync("Uncaught Exception Receive....", err);
      this.ctx.logger.errorSync("Shutting down Votewise API due to uncaught exception");
      await this.shutdown();
    });
  }
}
